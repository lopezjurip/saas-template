# Directory Structure

```
.claude/
  commands/
    i18n.md (130 lines)
.codex/
  config.toml (6 lines)
.conductor/
  settings.toml (7 lines)
apps/
  platform/
    app/
      .well-known/
        oauth-protected-resource/
          route.ts (1 lines)
      (app)/
        a/
          [agency_slug]/
            access/
              page.tsx (15 lines)
            inbox/
              [conversation_id]/
                page.tsx (16 lines)
              page.tsx (8 lines)
            settings/
              page.tsx (12 lines)
            team/
              page.tsx (11 lines)
              team-list.tsx (30 lines)
            tickets/
              [ticket_id]/
                page.tsx (10 lines)
                ticket-detail.tsx (63 lines)
              actions.ts (6 lines)
              page.tsx (9 lines)
              ticket-pool.tsx (48 lines)
            actions.ts (10 lines)
            agency-nav.tsx (43 lines)
            layout.tsx (6 lines)
            page.tsx (9 lines)
          layout.tsx (1 lines)
        agencies/
          create/
            agency-create.tsx (28 lines)
            page.tsx (7 lines)
          layout.tsx (3 lines)
        home/
          _components/
            user-menu.tsx (8 lines)
          account/
            _components/
              sections.ts (36 lines)
              sidebar.tsx (10 lines)
            connections/
              page.tsx (9 lines)
            danger/
              delete-account-dialog.tsx (27 lines)
              page.tsx (6 lines)
            language/
              page.tsx (10 lines)
            notifications/
              contacts-manage.tsx (29 lines)
              notifications-channels.tsx (18 lines)
              page.tsx (4 lines)
              push-permission.tsx (3 lines)
            profile/
              page.tsx (7 lines)
              profile-form.tsx (14 lines)
            security/
              email/
                page.tsx (4 lines)
              passkeys/
                page.tsx (9 lines)
              password/
                page.tsx (4 lines)
              phone/
                page.tsx (4 lines)
              email-form.tsx (15 lines)
              page.tsx (19 lines)
              passkeys-list.tsx (17 lines)
              password-form.tsx (15 lines)
              phone-form.tsx (19 lines)
            sessions/
              page.tsx (6 lines)
              sessions-section.tsx (31 lines)
            theme/
              page.tsx (9 lines)
            actions.ts (10 lines)
            layout.tsx (10 lines)
            page.tsx (3 lines)
          inbox/
            [conversation_id]/
              page.tsx (12 lines)
            page.tsx (8 lines)
          invites/
            [invite_id]/
              page.tsx (15 lines)
          layout.tsx (1 lines)
          page.tsx (19 lines)
        t/
          [tenant_slug]/
            [organization_id]/
              inbox/
                [conversation_id]/
                  page.tsx (19 lines)
                page.tsx (8 lines)
              onboarding/
                onboarding-banner.tsx (10 lines)
                onboarding-checklist.tsx (23 lines)
                page.tsx (9 lines)
                state.server.ts (5 lines)
                state.ts (12 lines)
              organizations/
                create/
                  create-form.tsx (18 lines)
                  page.tsx (9 lines)
                  schemas.ts (4 lines)
              settings/
                external-access/
                  actions.ts (9 lines)
                  external-access.tsx (32 lines)
                  page.tsx (11 lines)
                general/
                  general-settings.tsx (17 lines)
                  page.tsx (14 lines)
                members/
                  [organization_membership_id]/
                    edit/
                      edit-form.tsx (58 lines)
                      page.tsx (31 lines)
                  new/
                    invite-form.tsx (36 lines)
                    page.tsx (15 lines)
                  actions.ts (13 lines)
                  page.tsx (27 lines)
                  pending-invitations.tsx (40 lines)
                  schemas.ts (3 lines)
                tenant/
                  domains/
                    page.tsx (13 lines)
                  general/
                    page.tsx (11 lines)
                    tenant-general-settings.tsx (11 lines)
                  layout.tsx (7 lines)
                layout.tsx (1 lines)
                page.tsx (5 lines)
              dashboard-overview.tsx (48 lines)
              layout.tsx (14 lines)
              page.tsx (11 lines)
            layout.tsx (4 lines)
            page.tsx (18 lines)
        tenants/
          create/
            create-form.tsx (24 lines)
            page.tsx (9 lines)
            schemas.ts (4 lines)
          layout.tsx (3 lines)
        layout.tsx (3 lines)
      (marketing)/
        faq/
          page.tsx (10 lines)
        legal/
          _components/
            sidebar.tsx (13 lines)
          [section]/
            page.tsx (25 lines)
          layout.tsx (3 lines)
          page.tsx (3 lines)
        mcp/
          mcp-prompt-cta.tsx (14 lines)
          page.tsx (14 lines)
        pricing/
          page.tsx (11 lines)
          pricing-client.tsx (55 lines)
        contact-booking.tsx (15 lines)
        layout.tsx (12 lines)
        page.tsx (24 lines)
      api/
        [transport]/
          route.ts (3 lines)
        inbound/
          email/
            route.ts (22 lines)
          sms/
            route.ts (10 lines)
          whatsapp/
            route.ts (13 lines)
        internal/
          conversations/
            drain/
              route.ts (52 lines)
        v1/
          agencies/
            [agency_id]/
              avatar/
                route.ts (4 lines)
          organizations/
            [organization_id]/
              avatar/
                route.ts (4 lines)
          profiles/
            [profile_id]/
              avatar/
                route.ts (4 lines)
          tenants/
            [tenant_id]/
              avatar/
                route.ts (4 lines)
      auth/
        _components/
          auth-back-link.tsx (8 lines)
          auth-card.tsx (5 lines)
          auth-divider.tsx (5 lines)
          auth-entry-form.tsx (23 lines)
          auth-header.tsx (9 lines)
          auth-icons.tsx (7 lines)
          document-labels.ts (13 lines)
          document-triplet-fields.tsx (30 lines)
          oauth-section.tsx (11 lines)
          otp-field.tsx (7 lines)
          passkey-sign-in-button.tsx (9 lines)
        callback/
          route.ts (7 lines)
        confirm/
          route.ts (9 lines)
        document/
          accept/
            accept-signup-form.tsx (23 lines)
            actions.ts (7 lines)
            page.tsx (7 lines)
            schemas.ts (5 lines)
          actions.ts (29 lines)
          document-step-form.tsx (45 lines)
          page.tsx (6 lines)
          schemas.ts (6 lines)
        email/
          actions.ts (5 lines)
          email-step-form.tsx (33 lines)
          page.tsx (9 lines)
          schemas.ts (7 lines)
        error/
          page.tsx (9 lines)
        logout/
          actions.ts (8 lines)
          page.tsx (11 lines)
        onboarding/
          _actions/
            email-action.ts (0 lines)
            password-action.ts (0 lines)
            phone-action.ts (0 lines)
          _components/
            method-catalog.tsx (9 lines)
            ob-progress.tsx (12 lines)
            step-shell.tsx (9 lines)
          document/
            document-form.tsx (21 lines)
            page.tsx (7 lines)
          email/
            email-form.tsx (17 lines)
            page.tsx (6 lines)
          passkey/
            page.tsx (6 lines)
            passkey-form.tsx (11 lines)
          password/
            page.tsx (7 lines)
            password-form.tsx (15 lines)
          phone/
            page.tsx (6 lines)
            phone-form.tsx (15 lines)
          profile/
            page.tsx (7 lines)
            profile-form.tsx (16 lines)
          actions.ts (4 lines)
          layout.tsx (1 lines)
          page.tsx (25 lines)
          state.server.ts (9 lines)
          state.ts (23 lines)
        phone/
          actions.ts (5 lines)
          page.tsx (11 lines)
          phone-step-form.tsx (21 lines)
          schemas.ts (5 lines)
        recover/
          page.tsx (9 lines)
        router/
          page.tsx (10 lines)
        success/
          page.tsx (9 lines)
        actions.ts (19 lines)
        layout.tsx (5 lines)
        page.tsx (7 lines)
        providers.ts (15 lines)
      health/
        route.ts (5 lines)
      llms.txt/
        route.ts (8 lines)
      maintenance/
        layout.tsx (3 lines)
        page.tsx (4 lines)
      manifest.webmanifest/
        route.ts (4 lines)
      oauth/
        consent/
          consent-client.tsx (35 lines)
          page.tsx (6 lines)
      apple-icon.tsx (1 lines)
      error.tsx (3 lines)
      icon.tsx (1 lines)
      layout.tsx (17 lines)
      not-found.tsx (3 lines)
      opengraph-image.tsx (3 lines)
      robots.ts (5 lines)
      sitemap.ts (10 lines)
    components/
      identity/
        chips.tsx (17 lines)
      inbox/
        actions.ts (8 lines)
        conversation-thread.tsx (45 lines)
        inbox-list.tsx (15 lines)
        scope-selector.tsx (39 lines)
        scope.ts (13 lines)
      shell/
        app-sidebar.tsx (45 lines)
        atoms.tsx (32 lines)
        command-palette.tsx (29 lines)
        conversations-bell.tsx (38 lines)
        mobile-nav-drawer.tsx (11 lines)
        mobile-sheet.tsx (8 lines)
        mobile-sheets.tsx (45 lines)
        mobile-top-bar.tsx (11 lines)
        nav-tree.ts (43 lines)
        org-switcher.tsx (20 lines)
        profile-menu.tsx (16 lines)
        settings-menu.tsx (17 lines)
        shell.tsx (48 lines)
      dev-env-console.tsx (3 lines)
      entity-avatar.tsx (23 lines)
      entity-logo-controls.tsx (19 lines)
      floating-chrome.tsx (8 lines)
      graphy-provider.tsx (7 lines)
      json-ld.tsx (3 lines)
      locale-toggle.tsx (12 lines)
      markdown.tsx (16 lines)
      posthog-identify.tsx (7 lines)
      posthog-provider.tsx (9 lines)
      profile-avatar-controls.tsx (13 lines)
      pwa-install-banner.tsx (19 lines)
      pwa-register.tsx (5 lines)
      status-badge.tsx (6 lines)
      system-message.tsx (23 lines)
      theme-provider.tsx (4 lines)
      theme-toggle.tsx (6 lines)
    content/
      legal/
        en/
          cookies.md (5 lines)
          privacy.md (5 lines)
          terms.md (5 lines)
        es/
          cookies.md (5 lines)
          privacy.md (5 lines)
          terms.md (5 lines)
        pt/
          cookies.md (5 lines)
          privacy.md (5 lines)
          terms.md (5 lines)
    hooks/
      get-countries.ts (9 lines)
      get-viewer-agencies.ts (13 lines)
      get-viewer-organizations.ts (13 lines)
      get-viewer-profile.ts (9 lines)
      get-viewer-tenants.ts (13 lines)
      use-countries.ts (12 lines)
      use-intl.ts (18 lines)
      use-locale-cookie.ts (9 lines)
      use-onboarding.ts (18 lines)
      use-push-permission.ts (13 lines)
      use-viewer-agencies.ts (18 lines)
      use-viewer-organizations.ts (27 lines)
      use-viewer-profile.ts (11 lines)
      use-viewer-tenants.ts (18 lines)
    lib/
      conversations/
        agent/
          agent-loop.ts (30 lines)
          tool-registry.ts (25 lines)
        channel-sender-email.ts (7 lines)
        channel-sender-twilio.ts (2 lines)
        channel-sender-web-push.ts (6 lines)
        channel-sender-whatsapp.ts (3 lines)
        channel-sender.ts (19 lines)
        inbound-parser-twilio.ts (19 lines)
        inbound-resolver.ts (48 lines)
      graphy/
        graphy.browser.ts (7 lines)
        graphy.mcp.ts (4 lines)
        graphy.server.ts (4 lines)
        graphy.service.ts (4 lines)
      mcp/
        tools/
          agency-admin.ts (35 lines)
          members.ts (10 lines)
          permissions.ts (31 lines)
          presets.ts (24 lines)
          profile.ts (11 lines)
          settings.ts (23 lines)
          tenants.ts (10 lines)
          whoami.ts (8 lines)
        clients.ts (15 lines)
        register.ts (25 lines)
        token.ts (10 lines)
        tool.ts (26 lines)
      posthog/
        events.server.ts (30 lines)
        posthog.server.ts (3 lines)
      agencies.ts (11 lines)
      apex.ts (4 lines)
      auth-next.ts (3 lines)
      auth-tweaks.ts (5 lines)
      avatar.ts (3 lines)
      constants.ts (9 lines)
      debug.ts (2 lines)
      dev-host.ts (1 lines)
      dev-mailbox-toast.client.ts (6 lines)
      i18n.client.ts (0 lines)
      i18n.server.ts (25 lines)
      i18n.ts (12 lines)
      route.ts (42 lines)
      safe-action.client.ts (26 lines)
      safe-action.server.ts (8 lines)
      tenancy.ts (1 lines)
    public/
      sw.js (0 lines)
    styles/
      globals.css (3 lines)
    test/
      server-only.ts (0 lines)
    .env.example (89 lines)
    graphql.config.ts (2 lines)
    instrumentation.ts (1 lines)
    next-env.d.ts (0 lines)
    next.config.ts (7 lines)
    package.json (90 lines)
    playwright.config.ts (9 lines)
    postcss.config.mjs (0 lines)
    proxy.ts (19 lines)
    tsconfig.json (11 lines)
    vitest.config.ts (3 lines)
docs/
  notifications-system-plan.md (437 lines)
packages/
  api-ip/
    src/
      geo.ts (9 lines)
    package.json (21 lines)
    tsconfig.json (9 lines)
  debug/
    src/
      index.ts (9 lines)
      react-logger.tsx (9 lines)
    biome.jsonc (8 lines)
    package.json (29 lines)
    tsconfig.json (13 lines)
    turbo.json (9 lines)
  graphy/
    src/
      graphy-iter.ts (22 lines)
      graphy.ts (104 lines)
      react-pagination.tsx (85 lines)
      react.tsx (37 lines)
    biome.jsonc (8 lines)
    package.json (34 lines)
    tsconfig.json (13 lines)
    turbo.json (9 lines)
  intl/
    src/
      intl.ts (163 lines)
    package.json (23 lines)
    tsconfig.json (11 lines)
  kapso/
    src/
      client.ts (12 lines)
      types.ts (23 lines)
    package.json (18 lines)
    tsconfig.json (6 lines)
  react-email/
    src/
      templates/
        conversation_notification.tsx (21 lines)
        welcome_email.tsx (23 lines)
    package.json (30 lines)
    tsconfig.json (6 lines)
  react-hooks/
    src/
      use-click-outside.ts (11 lines)
      use-clipboard.ts (13 lines)
      use-cookie-store.ts (4 lines)
      use-device-info.ts (40 lines)
      use-keyboard-shortcut.ts (9 lines)
      use-mounted.ts (3 lines)
      use-state-cookie.ts (15 lines)
    package.json (29 lines)
    tsconfig.json (6 lines)
    vitest.config.ts (1 lines)
  react-pdf/
    public/
      index.html (23 lines)
    src/
      components/
        markdown.tsx (10 lines)
        router.tsx (7 lines)
      lib/
        tw.ts (4 lines)
      templates/
        helloworld.tsx (17 lines)
        markdown-demo.tsx (5 lines)
      App.tsx (5 lines)
      index.tsx (2 lines)
      render.ts (4 lines)
    .babelrc (3 lines)
    package.json (49 lines)
    tsconfig.dev.json (6 lines)
    tsconfig.json (6 lines)
    webpack.config.js (0 lines)
  rosetta/
    src/
      locale-config.ts (22 lines)
      rosetta.ts (67 lines)
      use-rosetta.tsx (20 lines)
    package.json (32 lines)
    tsconfig.json (9 lines)
  supabase/
    src/
      client.browser.ts (14 lines)
      client.mcp.ts (4 lines)
      client.middleware.ts (8 lines)
      client.server.ts (14 lines)
      client.service.ts (5 lines)
      jwt.ts (32 lines)
      metadata.ts (3 lines)
      react.ts (7 lines)
    supabase/
      migrations/
        00000000000000_schema.sql (4099 lines)
      templates/
        confirmation.html (4 lines)
        email_change.html (4 lines)
        magic_link.html (4 lines)
      tests/
        README.md (21 lines)
      .gitignore (4 lines)
      config.toml (338 lines)
      seed.sql (855 lines)
    graphql.config.ts (3 lines)
    package.json (52 lines)
    tsconfig.json (6 lines)
  typescript-config/
    base.json (41 lines)
    nextjs.json (13 lines)
    package.json (7 lines)
    react-library.json (8 lines)
  ui-common/
    src/
      shadcn/
        components/
          ui/
            accordion.tsx (11 lines)
            alert.tsx (6 lines)
            avatar.tsx (4 lines)
            badge.tsx (10 lines)
            button.tsx (8 lines)
            card.tsx (5 lines)
            checkbox.tsx (5 lines)
            collapsible.tsx (5 lines)
            dialog.tsx (6 lines)
            dropdown-menu.tsx (39 lines)
            input-otp.tsx (6 lines)
            input.tsx (5 lines)
            kbd.tsx (3 lines)
            label.tsx (4 lines)
            select.tsx (21 lines)
            separator.tsx (9 lines)
            sheet.tsx (6 lines)
            sidebar.tsx (33 lines)
            skeleton.tsx (3 lines)
            sonner.tsx (3 lines)
            spinner.tsx (4 lines)
            switch.tsx (12 lines)
            table.tsx (11 lines)
            tabs.tsx (7 lines)
            textarea.tsx (3 lines)
            tooltip.tsx (11 lines)
        hooks/
          use-mobile.ts (3 lines)
        lib/
          utils.ts (4 lines)
        globals.css (18 lines)
      button-spinner.tsx (26 lines)
      logo.tsx (8 lines)
      polymorphic.tsx (3 lines)
    components.json (20 lines)
    package.json (47 lines)
    tsconfig.json (6 lines)
    vitest.config.ts (1 lines)
  utils/
    src/
      array.ts (19 lines)
      assert.ts (11 lines)
      boolean.ts (3 lines)
      bytes.ts (3 lines)
      color-hash.ts (1 lines)
      colors.ts (12 lines)
      cookie-store.polyfill.ts (16 lines)
      cookie.ts (9 lines)
      csv.ts (5 lines)
      date.ts (57 lines)
      declarations.d.ts (13 lines)
      env.ts (3 lines)
      errors.ts (18 lines)
      events.ts (49 lines)
      favicon.ts (3 lines)
      file.ts (9 lines)
      functions.ts (3 lines)
      hash.ts (3 lines)
      headers.ts (3 lines)
      http.ts (0 lines)
      image.ts (0 lines)
      iterators.ts (54 lines)
      json.ts (7 lines)
      jwt.ts (1 lines)
      links.ts (1 lines)
      locale.ts (1 lines)
      math.ts (1 lines)
      maybe.ts (7 lines)
      nil.ts (3 lines)
      number.ts (47 lines)
      object.ts (21 lines)
      pagination.ts (1 lines)
      promise.ts (9 lines)
      random.ts (3 lines)
      regex.ts (0 lines)
      rut.ts (48 lines)
      semver.ts (11 lines)
      sleep.ts (1 lines)
      slug.ts (1 lines)
      ssr.ts (5 lines)
      string.ts (66 lines)
      stringify.ts (10 lines)
      temporal.ts (70 lines)
      time.ts (6 lines)
      url.ts (69 lines)
      user-agent.ts (9 lines)
      uuid.ts (8 lines)
      whatsapp.ts (3 lines)
    package.json (27 lines)
    tsconfig.json (9 lines)
scripts/
  development/
    env-setup.ts (15 lines)
    exe-dev-setup.sh (71 lines)
    https-setup.sh (21 lines)
    local-setup.sh (30 lines)
    worktree-archive.sh (29 lines)
    worktree-setup.sh (79 lines)
  repomix-skill-rename.mjs (19 lines)
  skills-setup.mjs (26 lines)
skills/
  my-auth/
    SKILL.md (138 lines)
  my-conventions/
    SKILL.md (212 lines)
  my-graphql/
    SKILL.md (331 lines)
  my-graphql-codegen/
    SKILL.md (144 lines)
  my-graphy/
    SKILL.md (141 lines)
  my-i18n/
    SKILL.md (152 lines)
  my-permissions/
    SKILL.md (132 lines)
  my-pr-quick/
    SKILL.md (32 lines)
  my-proxy/
    SKILL.md (87 lines)
  my-react-email/
    SKILL.md (105 lines)
  my-react-pdf/
    SKILL.md (102 lines)
  my-supabase/
    SKILL.md (238 lines)
  my-supabase-codegen/
    SKILL.md (126 lines)
  my-supabase-react/
    SKILL.md (137 lines)
  psql-query/
    SKILL.md (138 lines)
.env.example (130 lines)
.gitignore (73 lines)
.mcp.json (8 lines)
AGENTS.md (249 lines)
biome.jsonc (125 lines)
CLAUDE.md (1 lines)
graphql.config.ts (1 lines)
package.json (56 lines)
pnpm-workspace.yaml (13 lines)
README.md (66 lines)
repomix.config.ts (1 lines)
skills-lock.json (184 lines)
tsconfig.json (6 lines)
turbo.json (68 lines)
workspace.code-workspace (27 lines)
```