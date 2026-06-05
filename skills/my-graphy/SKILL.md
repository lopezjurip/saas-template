---
name: my-graphy
description: Graphy GraphQL client patterns for Supabase, server-side and React hooks usage.
---

# Graphy: GraphQL Client for Supabase

Use `@packages/graphy` for GraphQL queries/mutations. It's a type-safe wrapper on Supabase's GraphQL endpoint.

```typescript
import {
  GraphyProvider,
  useGraphy,
  useGraphyQuery,
  useGraphyMutation,
} from "@packages/graphy";
```

## Overview

| Layer | Use |
|-------|-----|
| **Supabase GraphQL endpoint** | `https://<project>.supabase.co/graphql/v1` |
| **@packages/graphy** | Type-safe client + hooks |
| **@graphql-codegen** | Generate TS types + `TypedDocumentNode` |

## Server-Side Usage

### Server Query

```typescript
import { gql } from "~/generated/graphql";
import type { ResultOf } from "@graphql-typed-document-node/core";
import { GraphyClientSupabase } from "@packages/graphy";

const UsersListQuery = gql(`
  query UsersListQuery($limit: Int!) {
    usersCollection(first: $limit) {
      edges { node { id email name createdAt } }
    }
  }
`);

type UsersListType = ResultOf<typeof UsersListQuery>;

export default async function UsersPage() {
  const client = new GraphyClientSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data } = await client.query(UsersListQuery, { limit: 10 });
    
    return (
      <ul>
        {data?.usersCollection?.edges?.map((e) => (
          <li key={e.node.id}>{e.node.email}</li>
        ))}
      </ul>
    );
  } catch (error) {
    return <div>Error: {String(error)}</div>;
  }
}
```

### Server Action with Auth Token

```typescript
"use server";

import { gql } from "~/generated/graphql";
import { GraphyClientSupabase } from "@packages/graphy";

const ViewerProfileQuery = gql(`
  query ViewerProfileQuery {
    viewer {
      id
      email
      name
    }
  }
`);

export async function actionGetProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Pass token so RLS can check auth.uid()
  const client = new GraphyClientSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { headers: { Authorization: `Bearer ${session?.access_token}` } }
  );

  try {
    const { data } = await client.query(ViewerProfileQuery, {});
    return data.viewer;
  } catch (error) {
    throw new Error(`Failed to fetch profile: ${String(error)}`);
  }
}
```

## Client-Side Usage (React Hooks)

### Provider Setup

Wrap your app with `GraphyProvider`:

```typescript
"use client";

import { GraphyProvider } from "@packages/graphy";
import { createBrowserClient } from "@packages/supabase";

export function App() {
  const supabase = createBrowserClient();

  return (
    <GraphyProvider value={supabase}>
      <YourApp />
    </GraphyProvider>
  );
}
```

### Query Hook

```typescript
"use client";

import { gql } from "~/generated/graphql";
import { useGraphyQuery } from "@packages/graphy";

const PostsListQuery = gql(`
  query PostsListQuery {
    postsCollection(first: 10) {
      edges { node { id title createdAt } }
    }
  }
`);

export function PostsList() {
  const { data, isLoading, error } = useGraphyQuery({
    query: PostsListQuery,
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.postsCollection?.edges?.map((e) => (
        <li key={e.node.id}>{e.node.title}</li>
      ))}
    </ul>
  );
}
```

### Query with Variables

```typescript
"use client";

import { gql } from "~/generated/graphql";
import { useGraphyQuery } from "@packages/graphy";

const PostQuery = gql(`
  query PostQuery($id: BigInt!) {
    postsCollection(filter: { id: { eq: $id } }) {
      edges { node { id title content } }
    }
  }
`);

export function PostDetail({ postId }: { postId: number }) {
  const { data } = useGraphyQuery({
    query: PostQuery,
    variables: { id: postId },
  });

  if (!data?.postsCollection?.edges?.[0]) return <div>Post not found</div>;

  const post = data.postsCollection.edges[0].node;
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### Conditional Query (Skip When Not Ready)

```typescript
const { data } = useGraphyQuery(
  userId
    ? { query: UserProfileQuery, variables: { id: userId } }
    : null,  // Skip query until userId is ready
);
```

### Mutation Hook

```typescript
"use client";

import { gql } from "~/generated/graphql";
import { useGraphyMutation } from "@packages/graphy";

const CreatePostMutation = gql(`
  mutation CreatePostMutation($title: String!, $content: String) {
    insertIntopostsCollection(objects: { title: $title, content: $content }) {
      records { id title }
    }
  }
`);

export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [{ data, error }, mutate] = useGraphyMutation(CreatePostMutation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await mutate({ title, content: "" });
      if (result.error) throw result.error;
      setTitle("");
    } catch (err) {
      console.error("Failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
      />
      <button type="submit">{data ? "Creating..." : "Create"}</button>
      {error && <div>{error.message}</div>}
    </form>
  );
}
```

## Operation Naming

Every query/mutation must have a unique name:

```typescript
// ✓ Good
const AdminPostsPageQuery = gql(`
  query AdminPostsPageQuery { ... }
`);

const CreatePostMutation = gql(`
  mutation CreatePostMutation { ... }
`);

// ✗ Bad (generic, risks collision)
const PostsQuery = gql(`query PostsQuery { ... }`);
```

## Pagination

Use cursor-based pagination via `first`, `after`, and `pageInfo`:

```typescript
let cursor: string | null = null;
let hasMore = true;

while (hasMore) {
  const { data } = await client.query(PostsQuery, {
    first: 100,
    after: cursor,
  });

  hasMore = data.postsCollection.pageInfo.hasNextPage;
  cursor = data.postsCollection.pageInfo.endCursor;

  for (const edge of data.postsCollection.edges) {
    processPost(edge.node);
  }
}
```

## Fragments (Reusable Query Parts)

Extract only when used in 2+ queries:

```typescript
const UserFragment = gql(`
  fragment UserFragment on User {
    id
    name
    email
  }
`);

const UserListQuery = gql(`
  query UserListQuery {
    users { ...UserFragment }
  }
`);

const UserDetailQuery = gql(`
  query UserDetailQuery($id: ID!) {
    user(id: $id) { ...UserFragment }
  }
`);
```

## Error Handling

```typescript
const { error } = useGraphyQuery({ query: MyQuery });

if (error) {
  if (error.message.includes("network")) {
    // Network down
  } else if (error.message.includes("validation")) {
    // Schema error
  } else {
    // Other error
  }
}
```

## See Also

- `@packages/graphy/src/graphy.ts` — core client API
- `@packages/graphy/src/react.tsx` — hooks API
- `@packages/graphy/src/react-pagination.tsx` — pagination helpers
