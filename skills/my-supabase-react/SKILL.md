---
name: my-supabase-react
description: Supabase client usage in React (client-side & server-side), auth, real-time subscriptions, and mutations.
---

# Supabase + React — @packages/supabase

Use `@packages/supabase` for all Supabase client initialization. It handles auth, cookies, and type safety.

```typescript
// Server-side
import { createServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";

// Browser
import { createBrowserClient, getSupabaseClient } from "@packages/supabase/client.browser";
```

## Server-Side Setup

### Server Component Query

```typescript
import type { Database } from "@packages/supabase/types";
import { createServerClient } from "@packages/supabase/client.server";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export default async function PostsPage() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return <div>{data?.length} posts</div>;
}
```

### Server Action with Auth

```typescript
"use server";

import { createServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";

export async function actionGetMyPosts() {
  const user = await getSupabaseServerUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;
  return data;
}
```

## Client-Side Setup

### Browser Client

```typescript
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@packages/supabase/client.browser";
import type { Database } from "@packages/supabase/types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase
      .from("posts")
      .select("*")
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## Real-Time Subscriptions

```typescript
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@packages/supabase/client.browser";
import type { Database } from "@packages/supabase/types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function LivePostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const supabase = createBrowserClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from("posts")
      .select("*")
      .then(({ data }) => setPosts(data || []));

    // Subscribe to changes
    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPosts((prev) => [...prev, payload.new as Post]);
          } else if (payload.eventType === "UPDATE") {
            setPosts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Post) : p))
            );
          } else if (payload.eventType === "DELETE") {
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <div>{posts.length} live posts</div>;
}
```

## Auth State

```typescript
"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserClient } from "@packages/supabase/client.browser";

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    return () => subscription?.unsubscribe();
  }, []);

  if (!user) return <div>Not logged in</div>;
  return <div>Welcome, {user.email}</div>;
}
```

## Mutations with Optimistic Updates

```typescript
"use client";

import { useState } from "react";
import { createBrowserClient } from "@packages/supabase/client.browser";
import type { Database } from "@packages/supabase/types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function UpdatePostTitle({ post }: { post: Post }) {
  const [title, setTitle] = useState(post.title);
  const [optimisticTitle, setOptimisticTitle] = useState(post.title);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const handleSave = async () => {
    // Optimistic update
    setOptimisticTitle(title);

    const { error: updateError } = await supabase
      .from("posts")
      .update({ title })
      .eq("id", post.id);

    if (updateError) {
      setError(updateError.message);
      setOptimisticTitle(post.title); // Revert on error
    }
  };

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
      />
      <button onClick={handleSave}>Save</button>
      {error && <div className="error">{error}</div>}
      <p>Display: {optimisticTitle}</p>
    </div>
  );
}
```

## Error Handling

```typescript
const { data, error } = await supabase
  .from("posts")
  .select("*");

if (error) {
  if (error.code === "PGRST116") {
    // Relation not found
    console.error("Table doesn't exist");
  } else if (error.code === "PGRST201") {
    // No rows found
    return [];
  } else {
    console.error("Query error:", error.message);
  }
}
```

## Type Safety

Always use `Database` type from `@packages/supabase/types`:

```typescript
import type { Database } from "@packages/supabase/types";

type Users = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

const user: Users = { ... };
const insert: UserInsert = { ... };
```

## JWT Claims / App Metadata

Extract metadata after authentication:

```typescript
import { getSupabaseServerUserMetadata } from "@packages/supabase/metadata";

const metadata = await getSupabaseServerUserMetadata();
console.log(metadata.tenants);        // Array<{id, slug}>
console.log(metadata.organizations);  // number[]
console.log(metadata.is_concierge);   // boolean
```

## Batch Operations

```typescript
// Insert multiple rows
const { data } = await supabase
  .from("posts")
  .insert([
    { title: "Post 1", user_id: 1 },
    { title: "Post 2", user_id: 1 },
  ])
  .select();

// Batch update
const updates = await Promise.all([
  supabase.from("posts").update({ published: true }).eq("id", 1),
  supabase.from("posts").update({ published: true }).eq("id", 2),
]);
```

## See Also

- `@packages/supabase/src/types.ts` — generated Database type
- `@packages/supabase/src/client.server.ts` — server client API
- `@packages/supabase/src/client.browser.ts` — browser client API
- `@packages/supabase/src/metadata.ts` — JWT metadata helpers
