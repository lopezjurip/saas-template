# Conversations & Agentic Messaging — Implementation Plan

> **Core reframe:** everything is a **conversation**. A notification is just a `system → user` message in a
> thread. The user's reply (email / WhatsApp / SMS / in-app) is another message in the **same** thread. The
> AI agent is a participant that reads messages and calls tools. This unifies the inbox, outbound delivery,
> inbound handling, and the agent loop into one model — no separate "notification" vs "inbound" subsystems.

> Shared spec for the implementation agents. Read fully before coding. Follow `AGENTS.md` exactly (single
> schema file, atomic SQL RPCs, no barrels, `viewer_*` RLS helpers, per-file i18n dictionaries, `action*`
> server actions, bracket notation for external data, typed route helpers, logging namespaces).

## 0. Context — what exists today

- **`public.conversation_topics`** — **catalog of system-message *topics*** (renamed from `notifications`).
  Cols: `conversation_topic_slug` citext PK, `conversation_topic_name`, `conversation_topic_description`,
  `conversation_topic_priority` (`notification_priority` enum), `conversation_topic_kind` (`notification_kind`
  enum), `conversation_topic_disabled_at`. The topic catalog for `system` messages — needed for per-topic
  prefs + priority defaults. (Enum *types* `notification_priority` / `notification_kind` keep their names.)
- `public.profile_notifications` — legacy single-bool prefs. **DELETE entirely** —
  superseded by `profile_topic_channels` (per-channel). Also drop `viewer_profile_notifications()`, the
  `profile_notifications_default_priority` trigger/function, the seed block, and the legacy matrix UI state.
- UI `app/[locale]/(app)/home/account/notifications/` — preferences matrix with placeholder email/push/sms
  columns in local React state only (not persisted). Becomes the per-channel prefs editor.
- `usePushPermission()` — browser `Notification.permission` only; no subscription stored.
- `@packages/kapso` — WhatsApp BSP client (`sendMessage(conversationId, response)`) + inbound
  `KapsoWebhookPayload` (`conversation_id`, `contact.phone`, `message.text`).
- `@packages/react-email` — templates package, delivery not wired.

**Gaps:** no conversation/message model, no scoping, no outbound delivery, no inbound, no AI layer. Contact
(email/phone) lives in `auth.users`, not `profiles`. `pgmq`/`pg_cron`/`pg_net` NOT enabled. No AI SDK, no
email provider dep, no `vercel.json`.

## Decisions (locked with product owner)

- **Model:** **conversations** — notification = `system` message; reply = `user` message; agent = participant.
- **Scope:** all phases this round (model → channels → dispatch → inbound/agentic).
- **Email provider:** **Resend** (send + inbound webhook parsing).
- **Async dispatch:** **Supabase `pgmq` + `pg_cron`**, drained by a Next.js internal route.
- **SMS provider:** **Twilio for now, high probability of swapping later** → strictly behind interfaces.
- **Action policy:** notification-agnostic — a general **inbound message → MCP/tool execution** capability.
  The notification is only *context*. **Clear intent → execute immediately** (no double-confirm), but always:
  AI authority ≤ resolved user's authority, idempotency, full audit.
- **Tickets:** a conversation can be **escalated into a ticket** that **agencies can take and resolve**
  (cross-tenant partner surface). Planned as P5 on top of the conversation model.
- **Legacy cleanup:** `profile_notifications` (+ its trigger/reader/seed/UI state) is deleted; `notifications`
  catalog reshaped freely.

## Identifier types (get FKs right)

- `tenants.tenant_id` = `int`, `organizations.organization_id` = `int` (serial),
  `agencies.agency_id` = `uuid` (v7), `profiles.profile_id` = `uuid`.
- New uuid PKs: `default internal.uuid_generate_v7()`. New extensions: `pgmq`, `pg_cron`, `pg_net`.

---

## The conversation model (data spine — all phases build on this)

```sql
create type public.message_channel as enum ('in_app','email','web_push','whatsapp','sms');

-- a thread between the system/agent and one human (profile). Optionally scoped to an org/agency.
create table public.conversations (
  conversation_id   uuid primary key default internal.uuid_generate_v7(),
  profile_id        uuid not null references public.profiles (profile_id) on delete cascade,  -- the human
  -- same thread feels different in org A vs org B vs an agency surface
  tenant_id         int  references public.tenants (tenant_id) on delete cascade,
  organization_id   int  references public.organizations (organization_id) on delete cascade,
  agency_id         uuid references public.agencies (agency_id) on delete cascade,
  conversation_subject text check (char_length(conversation_subject) <= 200),
  conversation_kind   text not null default 'notification'
                        check (conversation_kind in ('notification','agent','support','system')),
  conversation_status text not null default 'open'
                        check (conversation_status in ('open','resolved','archived')),
  -- cross-channel resolution (replay guard, Layer 2): set once ANY channel/UI resolves the subject
  conversation_resolved_at      timestamptz,
  conversation_resolved_channel public.message_channel,
  conversation_resolution       jsonb,         -- outcome summary for the "already handled" reply
  conversation_last_message_at  timestamptz not null default current_timestamp,  -- sort key for inbox
  conversation_created_at timestamptz not null default current_timestamp,
  conversation_updated_at timestamptz not null default current_timestamp
);

-- a single message in a thread. system/agent messages are outbound; user messages are inbound.
create table public.conversation_messages (
  conversation_message_id uuid primary key default internal.uuid_generate_v7(),
  conversation_id   uuid not null references public.conversations (conversation_id) on delete cascade,
  message_author    text not null check (message_author in ('system','agent','user')),  -- agent = the AI
  message_direction text not null check (message_direction in ('outbound','inbound')),
  -- set when a system message originates from a notification type (template + default priority/prefs)
  conversation_topic_slug extensions.citext references public.conversation_topics (conversation_topic_slug) on delete restrict,
  message_channel   public.message_channel,  -- channel of origin for inbound; null for system (fan-out lives in deliveries)
  message_body      text,
  message_payload   jsonb not null default '{}',  -- structured context (e.g. {"payment_order_id":...}) + inbound provider raw
  message_priority  public.notification_priority, -- snapshot for system messages
  message_read_at   timestamptz,                  -- per-message read state (in-app)
  -- inbound security/dedupe (user messages only)
  message_signature_verified boolean not null default false,
  message_idempotency_key     text unique,        -- provider message id; dedupe webhook replays
  message_created_at timestamptz not null default current_timestamp
);

create index conversations_inbox_idx
  on public.conversations (profile_id, conversation_last_message_at desc)
  where conversation_status <> 'archived';
create index conversation_messages_thread_idx
  on public.conversation_messages (conversation_id, message_created_at);
create index conversation_messages_unread_idx
  on public.conversation_messages (conversation_id)
  where message_read_at is null and message_direction = 'outbound';
```

- A pure notification (no reply) = a conversation with one `system` message. Heavier than a flat row, but it
  unifies every later flow (replies, agent clarification, "already handled") with zero special-casing.
- `conversation_last_message_at` maintained by trigger on message insert (also bumps unread, status).
- RLS: a profile sees only its own conversations + their messages. Inserts via security-definer RPC /
  service_role only. `update` limited to `message_read_at` / archive transitions for the owner.

### Triggers / helpers
- Trigger `conversation_messages → conversations`: on insert, set `conversation_last_message_at`; if first
  inbound after a system message, keep `open`.
- `public.viewer_conversations(include_archived bool default false)` → setof conversations, newest first.
- `public.viewer_conversation_messages(conversation_id uuid)` → thread messages, owner-checked.
- `public.viewer_unread_count()` → int (unread outbound messages across non-archived conversations).
- Mutations as RPCs (owner-checked, atomic): `conversation_mark_read(message_ids uuid[])`,
  `conversation_archive(conversation_id uuid)`, `conversation_post_user_message(...)` (in-app reply → same
  agent pipeline as external inbound).

---

## P1 — Conversation model + in-app inbox

### Emit RPC (atomic, security definer) — system message into a thread

```sql
public.conversation_emit(
  recipient_profile_id uuid, slug citext,
  body text default null, payload jsonb default '{}',
  subject text default null,
  organization_id int default null, agency_id uuid default null,
  conversation_id uuid default null   -- append to existing thread; null = open a new one
) returns table (conversation_id uuid, conversation_message_id uuid)
```

- Find-or-create conversation (new unless `conversation_id` passed), snapshot `message_priority` from catalog
  (respecting any `profile_notifications` override), derive `tenant_id` from `organization_id`.
- Insert the `system` / `outbound` message. **P2 extends this same function** to fan out deliveries.
- Stable error keys: `raise exception 'conversation_topic_not_found' using errcode='P0001';`

### UI (Agent B) — in-app conversations

- **Bell + popover** in the app shell (`apps/platform/components/shell/`): unread badge, recent threads,
  mark-all-read, link to full inbox. Live badge via **Supabase Realtime** (insert on `conversation_messages`
  for the viewer's conversations).
- **Inbox + thread view** under `app/[locale]/(app)/home/...`: conversation list (subject, last message,
  unread, scope chip for org/agency), thread view showing the system/user/agent back-and-forth, **in-app
  reply box** (posts a `user` message via `conversation_post_user_message` → triggers the P4 agent pipeline,
  identical to an external reply). Archive / resolved states.
- GraphQL via `@packages/graphy` for lists/threads; RPCs via typed Supabase client for mutations. Per-file
  i18n, locale-sentinel links, shadcn primitives from `@packages/ui-common` only.

### pgTAP (Agent A)
RLS isolation (owner-only threads/messages), `conversation_emit` happy path + `conversation_topic_not_found`,
mark-read/archive owner checks, priority snapshot, `last_message_at` trigger.

---

## P2 — Outbound channels: prefs, contacts, multi-channel dispatch

### Per-channel prefs
```sql
create table public.profile_topic_channels (
  profile_id uuid not null references public.profiles on delete cascade,
  conversation_topic_slug extensions.citext not null references public.conversation_topics on delete restrict,
  message_channel public.message_channel not null,
  enabled boolean not null default true,
  ... timestamps ..., primary key (profile_id, conversation_topic_slug, message_channel)
);
```
- **"silent" = only `in_app` enabled**, all push-out channels off (not a new kind — just channel prefs).
- `in_app` is always effectively on (the thread always records the message); prefs gate *outbound* channels.

### Contacts + verification
`auth.users` email/phone is not enough (WhatsApp ≠ SMS number; web push needs subscription objects; P4 needs
`verified_at` per channel for the inbound-sender security check).
```sql
create table public.profile_contacts (
  profile_contact_id uuid primary key default internal.uuid_generate_v7(),
  profile_id uuid not null references public.profiles on delete cascade,
  message_channel public.message_channel not null,  -- email | whatsapp | sms
  contact_value extensions.citext not null,                   -- email or E.164 phone
  contact_verified_at timestamptz, ... timestamps ...,
  unique (message_channel, contact_value)
);
create table public.profile_push_subscriptions (
  profile_push_subscription_id uuid primary key default internal.uuid_generate_v7(),
  profile_id uuid not null references public.profiles on delete cascade,
  endpoint text not null unique, p256dh text not null, auth text not null, ... timestamps ...
);
```
Only **verified** contacts are used for sends and accepted as inbound senders (P4).

### Multi-channel delivery + queue
```sql
create extension if not exists pgmq;
create extension if not exists pg_cron;
create extension if not exists pg_net schema extensions;

-- one row per (outbound message, channel). One message can fan out to MANY channels at once.
create table public.conversation_message_deliveries (
  conversation_message_delivery_id uuid primary key default internal.uuid_generate_v7(),
  conversation_message_id uuid not null references public.conversation_messages on delete cascade,
  message_channel public.message_channel not null,
  delivery_status text not null default 'queued'
    check (delivery_status in ('queued','sent','delivered','failed','skipped')),
  provider_message_id text,
  reply_token text unique,           -- random, unguessable; per delivery; embedded in reply-to / message
  delivery_error text,
  delivery_created_at timestamptz not null default current_timestamp,
  delivery_sent_at timestamptz,
  unique (conversation_message_id, message_channel)
);
```
- **Multi-channel by design:** `conversation_emit` (extended), after inserting the `system` message, inserts
  **one delivery per enabled channel** that has a verified contact / push subscription, each with its own
  random `reply_token`, and `pgmq.send('conversation_outbound', {delivery_id, message_id, channel})`. All
  atomic. One message → N deliveries (WhatsApp + email + web_push together); every `reply_token` maps back to
  the **same message/conversation**. The token says *which message* was replied to; the **conversation** is
  the unit of resolution → this is what the P4 replay guard hangs on.
- `pg_cron` (~every minute) → `pg_net` POST `→ /api/internal/conversations/drain` with shared-secret header.

### Dispatch worker (Agent D) — Next.js internal route
`app/api/internal/conversations/drain/route.ts`:
1. Auth via shared secret (constant-time compare).
2. `pgmq.read('conversation_outbound', vt, batch)` via RPC.
3. Route each to a **`ChannelSender`** by channel; on success `delivery_status='sent'` + `provider_message_id`
   + `pgmq.delete`; on failure record error, leave for visibility-timeout retry (cap → `failed`).

`ChannelSender` interface (swappable, one file per sender, no barrels):
- **email** → Resend; render with `@packages/react-email`; reply-to = `reply+<reply_token>@<inbound-domain>`.
- **whatsapp** → `@packages/kapso`; embed `reply_token` in message/conversation ref.
- **web_push** → `web-push` + VAPID keys (env); service worker in `apps/platform/public/`.
- **sms** → **Twilio behind the interface** (`channel-sender-twilio.ts`); env-gated (`skipped` if no creds).
  **No Twilio import anywhere except that file** — swapping providers = one new sender file + env + registry map.

### Prefs/contacts UI (Agent C)
- Extend `notifications-matrix.tsx` to a per-channel grid persisted to `profile_topic_channels` via RPC
  (replace local-only state); "silent" quick-toggle = in_app only.
- Contacts management (add/verify email + phone) → `profile_contacts`. Web push opt-in → subscribe → POST to
  `profile_push_subscriptions`.

### pgTAP (Agent A)
Channel-pref RLS; `conversation_emit` fan-out produces correct deliveries per prefs/verified-contacts;
delivery status transitions; reply_token uniqueness.

---

## P4 — Inbound messages + agentic MCP/tool execution

> An inbound reply (email/WhatsApp/SMS) or an in-app reply is just a **`user` message appended to the thread**.
> The agent reads the thread, optionally uses the correlated notification as context, and executes
> tenant/org-scoped tools through the same permission path the UI uses. Clear intent → execute immediately.

### Inbound webhooks (Route Handlers, public — auth by provider signature)
- `POST /api/inbound/email` — **Resend inbound**. **Verify provider signature + DKIM/SPF** (from-header alone
  is spoofable — reject on fail). `reply_token` from plus-address `reply+<token>@` or `In-Reply-To`.
- `POST /api/inbound/whatsapp` — Kapso webhook (`KapsoWebhookPayload`); verify webhook signature.
- `POST /api/inbound/sms` — **Twilio behind an `InboundParser` interface** (`inbound-parser-twilio.ts`); verify
  Twilio signature. Same swap rule as the sender.
- Add `/api/inbound/*` + `/api/internal/conversations/*` to proxy `PUBLIC_PATH_REGEX`.

### Identity + scope resolution (security-critical — all must hold to act)
1. **Provider signature verified** (DKIM/SPF for email; webhook HMAC for WhatsApp/SMS).
2. **Sender maps to a verified `profile_contacts` row** for that channel. No match → record message, reject.
3. **Correlation:** `reply_token → conversation_message_deliveries → conversation_messages → conversations`
   gives the thread + org/agency/tenant scope + notification payload context. In-app reply already knows its
   conversation. Cold inbound (no token, no thread) → resolve scope from the sender's memberships; ambiguous
   → agent asks (a clarifying `agent` message), does not guess.
4. **Idempotency:** dedupe on provider message id (`conversation_messages.message_idempotency_key` unique).

The inbound handler appends a `user` / `inbound` message (with `message_signature_verified`,
`message_idempotency_key`, raw in `message_payload`) to the resolved conversation, then invokes the agent.

### Agent loop (Agent E) — Vercel AI SDK + Claude (`claude-opus-4-8`; `claude-sonnet-4-6` for cheap paths)
- Add `ai` + `@ai-sdk/anthropic` to `apps/platform` (fetch live AI SDK docs via Context7 before coding).
- Reads the **conversation thread** as message history; system prompt carries resolved identity, scope, and
  the permitted tool set.
- **Tool registry = MCP-style action catalog.** Each tool: Zod-typed input; handler runs through the **same
  RLS/permission path as the UI** (service-role RPC passing resolved `caller_id`, so `viewer_has_permission`
  is honored). Tools the user lacks permission for in this scope are **not offered** to the model. AGENTS.md
  notes the MCP HTTP route is intentionally absent — build the registry as plain AI-SDK `tool()` defs now; an
  MCP server wrapper can expose the same registry later.
- **Execute on clear intent.** Ambiguous / insufficient permission → post an `agent` clarifying message.
- **Reply** as an `agent` / `outbound` message → fanned out over the same channel(s) via P2 `ChannelSender`s.

### Cross-channel replay / double-action guard (critical)
A message fans out to WhatsApp **and** email; the user replies on both ("pay it"). Two **different** inbound
messages, two **different** `reply_token`s, **same** conversation / logical action. Provider-message-id
idempotency does NOT catch this. Two layers stop the double execution:

**Layer 1 — action-level idempotency key (the real mutex).** Dedup key = the **logical action target**, not
the message: e.g. `org:42:payment_order:123:approve` (NOT conversation id, NOT reply_token — those differ per
channel). `agent_action_log.action_idempotency_key` is `unique`. **Claim-before-side-effect** RPC:
```sql
public.agent_action_claim(idempotency_key text, profile_id uuid, organization_id int,
                          tool_name text, tool_input jsonb)
  returns table (claimed boolean, prior_status text, prior_output jsonb)
-- insert ... on conflict (action_idempotency_key) do nothing returning ...;
--   row returned -> claimed=true,  status 'claiming' (caller runs side effect, then marks executed/error)
--   no row       -> claimed=false, return existing status+output (caller SKIPS the side effect)
```
The `unique` constraint is the lock — concurrent WhatsApp+email replies serialize at the DB; exactly one wins
the insert, runs the external side effect; the other reads `claimed=false`. Crash between claim and side-effect
leaves status `claiming` → reconciler / next inbound detects stale `claiming` (timeout) → retry vs fail.

**Layer 2 — conversation resolution (UX + fast path).** On success the same RPC stamps
`conversations.conversation_resolved_at/_channel/_resolution` and status `resolved`. A later inbound on an
already-resolved conversation short-circuits before the agent loop → posts an `agent` message *"Already handled
via {channel} at {time}: {resolution}"*. Also covers the action being taken in the **web UI** (the UI mutation
marks the conversation resolved) — a later email/WhatsApp reply is told it's done.

Layer 1 is authoritative and works for **agnostic** cold inbound (no conversation) too. Read-only / naturally
idempotent tools may skip Layer 1; any create/charge/irreversible tool MUST use it.

### Audit (Agent E)
```sql
create table public.agent_action_log (
  agent_action_log_id uuid primary key default internal.uuid_generate_v7(),
  conversation_message_id uuid not null references public.conversation_messages on delete cascade,  -- the inbound msg that triggered it
  profile_id uuid not null references public.profiles,
  organization_id int references public.organizations,
  agency_id uuid references public.agencies,
  tool_name text not null,
  tool_input jsonb not null default '{}',
  tool_output jsonb,
  action_status text not null check (action_status in ('claiming','executed','rejected','clarify','error')),
  action_idempotency_key text unique,  -- logical action target e.g. 'org:42:payment_order:123:approve' — NOT message/reply_token
  agent_action_created_at timestamptz not null default current_timestamp
);
```

### Security checklist (P4)
- [ ] Provider signature verified before any processing.
- [ ] Sender resolved to a **verified** contact; unmatched senders never trigger actions.
- [ ] AI authority ≤ resolved user authority — every tool runs through permission/RLS checks.
- [ ] Idempotency on inbound message id (Layer 1 webhook dedupe) AND on logical action (Layer 1 mutex).
- [ ] Conversation resolution prevents cross-channel + cross-surface (web UI) double-action (Layer 2).
- [ ] Full audit (`conversation_messages` thread + `agent_action_log`).

---

## P5 — Tickets: agency handoff (conversation → resolvable ticket)

> A conversation can be **escalated into a ticket** that agencies take and resolve. Agencies already have a
> cross-tenant grant surface (`agencies`, `agency_memberships`, `agencies_organizations_grants`). A ticket
> exposes a conversation to the agencies that hold a grant over its org/tenant; an agency member **claims** it
> (mutex), works it (the conversation thread is the workspace), and **resolves** it — which also resolves the
> underlying conversation (ties into the P4 replay guard Layer 2).

```sql
create type public.ticket_status as enum ('open','claimed','in_progress','resolved','closed');

create table public.tickets (
  ticket_id uuid primary key default internal.uuid_generate_v7(),
  conversation_id uuid not null unique references public.conversations (conversation_id) on delete cascade,
  -- denormalized from the conversation for grant-based RLS (agency grants are per organization)
  tenant_id       int not null references public.tenants (tenant_id) on delete cascade,
  organization_id int references public.organizations (organization_id) on delete cascade,
  ticket_subject  text not null check (char_length(ticket_subject) between 1 and 200),
  ticket_status   public.ticket_status not null default 'open',
  ticket_priority public.notification_priority not null default 'medium',
  assigned_agency_id  uuid references public.agencies (agency_id) on delete set null,   -- which agency took it
  assigned_profile_id uuid references public.profiles (profile_id) on delete set null,  -- which agency member
  ticket_claimed_at  timestamptz,
  ticket_resolved_at timestamptz,
  ticket_created_at timestamptz not null default current_timestamp,
  ticket_updated_at timestamptz not null default current_timestamp
);

create index tickets_pool_idx on public.tickets (organization_id, ticket_status)
  where ticket_status in ('open','claimed','in_progress');
```

- New permission slug in the catalog: **`tickets_manage`** (granted to agencies via
  `agencies_organizations_grants`).
- **RLS (select):** the ticket's recipient profile sees their own ticket; an agency member sees a ticket when
  `organization_id in (select public.viewer_agency_permission_org_ids('tickets_manage'))` — i.e. their agency
  holds a grant over that org. The pool = unassigned (`open`) tickets the agency is eligible for.
- **Claim is a mutex** (two agency members racing for the same ticket): RPC
  `ticket_claim(ticket_id)` does a **conditional** update —
  `update tickets set assigned_agency_id=…, assigned_profile_id=viewer_profile_id(), ticket_status='claimed',
  ticket_claimed_at=now() where ticket_id=$1 and ticket_status='open' returning *;` — zero rows returned ⇒
  someone else won ⇒ raise `ticket_already_claimed`. Agency + permission checked via
  `viewer_has_agency_permission(organization_id,'tickets_manage')`.
- `ticket_resolve(ticket_id, resolution jsonb)` → status `resolved` + `ticket_resolved_at`, and stamps the
  conversation `conversation_resolved_at/_status='resolved'` in the **same RPC** (atomic) so the P4 guard sees it.
- `ticket_escalate(conversation_id, subject, priority)` → creates the ticket from a conversation (recipient or
  org admin can escalate; or auto-escalate from an agent tool when it can't resolve).
- **UI (Agent F):** an **agency console** surface (under the agency routes, `app/[locale]/(app)/a/...` or
  `agencies/...`) — ticket pool list (eligible + unclaimed), claim button, ticket detail = the conversation
  thread with an internal reply box, resolve action. Recipient side: a "this became a ticket" indicator in
  their inbox thread.
- **pgTAP (Agent A):** ticket RLS via agency grants, claim mutex (only one of two concurrent claims wins),
  resolve cascades to conversation, non-granted agency cannot see/claim.

---

## Environment / config additions
- `.env.example` + `apps/platform/.env.local`: `RESEND_API_KEY`, `RESEND_INBOUND_DOMAIN`,
  `CONVERSATIONS_DRAIN_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `ANTHROPIC_API_KEY`,
  `KAPSO_API_KEY`, (optional) `TWILIO_*`.
- `supabase/config.toml` — enable `pgmq` / `pg_cron` / `pg_net` locally as needed.
- `apps/platform/proxy.ts` — add `/api/inbound/*` and `/api/internal/conversations/*` to `PUBLIC_PATH_REGEX`.
- Document the conversation model + dispatch path in `AGENTS.md`.

## Dependency graph & agent assignment (Sonnet)
```
A (DB foundation: DELETE profile_notifications + reshape notifications catalog;
   conversations + messages + deliveries + prefs/contacts + agent_action_log + tickets,
   all RPCs/RLS/triggers/pgTAP + types + seed)   ← blocking, SINGLE owner of 00000000000000_schema.sql
        │
        ├──> B (P1 in-app inbox: bell, thread view, in-app reply, realtime, GraphQL)
        ├──> C (P2 prefs + contacts + web-push UI)
        ├──> F (P5 agency ticket console: pool, claim, thread workspace, resolve)
        └──> D (P2 dispatch worker: pgmq drain route, ChannelSenders, react-email, pg_cron)
                    │
                    └──> E (P4 inbound webhooks + identity resolution + agent loop + tools + replay guard + audit)
```
- **A first, alone** (owns the single schema file). After A: `pnpm db:reset && pnpm generate:types`.
- **B, C, D, F in parallel** after A. **E after D** (reuses `ChannelSender`s for agent replies).
- Each agent: read `AGENTS.md` + relevant `skills/my-*`; fetch live docs via Context7 (AI SDK, Resend,
  web-push, pgmq, Twilio); run `pnpm format:apply-unsafe` + `pnpm build:dry`; add tests for its layer.

## Open sub-decisions (sane defaults, flag if blocked)
- **Thread grouping** → `conversation_emit` opens a new thread unless a `conversation_id` is passed. Related
  notifications can be grouped later via a dedup/correlation key — out of scope for v1.
- **Cold inbound (no token, no thread)** → agent asks to disambiguate org rather than guessing.
- **Model** → `claude-opus-4-8` for the action agent; `claude-sonnet-4-6` for cheap classification.
