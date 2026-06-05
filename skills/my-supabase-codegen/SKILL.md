---
name: my-supabase-codegen
description: Type-safe Supabase client generation setup, scripts, and patterns for end-to-end type safety.
---

# Supabase Type Generation & Client Setup

## One-Time Setup

### 1. Install Supabase CLI

```bash
npm install -D @supabase/cli
```

### 2. Initialize Local Supabase

```bash
pnpm supabase start  # Starts Docker containers
```

### 3. Link to Remote (Optional)

```bash
pnpm supabase link --project-ref <YOUR_PROJECT_REF>
```

## Type Generation Workflow

### Generate Types from Local DB

```bash
pnpm supabase gen types typescript --local > src/supabase.types.ts
```

### Or from Remote

```bash
pnpm supabase gen types typescript > src/supabase.types.ts
```

### Watch Mode (Auto-Regenerate on Schema Changes)

Add to `package.json`:
```json
{
  "scripts": {
    "db:types:watch": "nodemon -w supabase/migrations -e sql --exec 'pnpm generate:types'"
  }
}
```

## Client Factories

**Create `src/lib/supabase.ts` (server-side):**
```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/supabase.types";

// Server-side: uses service role key (has all permissions)
export function createSupabaseServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Middleware/API routes: uses session token
export function createSupabaseClient(token?: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    }
  );
}
```

**Create `src/lib/supabase-browser.ts` (client-side):**
```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "~/supabase.types";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## Type-Safe Queries

### Server Component

```typescript
import type { Database } from "~/supabase.types";
import { createSupabaseClient } from "~/lib/supabase";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

export async function getPosts(): Promise<Post[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data; // Type: Post[]
}
```

### Client Component (React Query / SWR)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import type { Database } from "~/supabase.types";
import { createSupabaseBrowserClient } from "~/lib/supabase-browser";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function PostList() {
  const supabase = createSupabaseBrowserClient();

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Server Action with Type Safety

```typescript
"use server";

import type { Database } from "~/supabase.types";
import { createSupabaseClient } from "~/lib/supabase";

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

export async function actionCreatePost(input: PostInsert) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("posts")
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

## RLS + Auth

Supabase automatically injects `auth.uid()` in RLS policies. Pass the user's JWT token:

```typescript
const { data: { session } } = await supabase.auth.getSession();

const supabase = createSupabaseClient(session?.access_token);
// Now RLS policies can use auth.uid() safely
```

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJsdfxxx...  # Secret, never expose
```

## Migration Workflow

1. **Make schema changes locally** (via Studio or direct SQL):
   ```bash
   pnpm supabase migration new add_post_status
   ```
   Edit `supabase/migrations/<timestamp>_add_post_status.sql`

2. **Apply locally:**
   ```bash
   pnpm supabase db reset  # Replay all migrations
   ```

3. **Regenerate types:**
   ```bash
   pnpm supabase gen types typescript --local > src/supabase.types.ts
   ```

4. **Push to remote:**
   ```bash
   pnpm supabase db push
   ```

## Add to package.json

```json
{
  "scripts": {
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:push": "supabase db push",
    "generate:types": "supabase gen types typescript --local > src/supabase.types.ts"
  }
}
```
