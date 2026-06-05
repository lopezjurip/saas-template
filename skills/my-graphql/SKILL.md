---
name: my-graphql
description: GraphQL patterns for React/Next.js + Supabase. Use when writing queries, mutations, fragments, or when GraphQL/data-fetching are mentioned.
---

# GraphQL Patterns

## Stack

| Layer | Tool |
|---|---|
| GraphQL endpoint | Supabase PostgreSQL GraphQL (`{NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`) |
| Type generation | `@graphql-codegen/client-preset` |
| Client | Custom Supabase GraphQL client |
| React hooks | SWR-based hooks (e.g., `useGraphQLQuery`, `useGraphQLMutation`) |

## Quick Start (Server Component)

Fetch data server-side with a GraphQL client initialized from session:

```tsx
import { gql } from "~/generated/graphql";
import type { ResultOf } from "@graphql-typed-document-node/core";
import { createGraphQLClient } from "~/lib/graphql/client.server";

const UsersQuery = gql(`
  query UsersQuery($limit: Int!) {
    usersCollection(first: $limit) {
      edges { node { id name email } }
    }
  }
`);

type UsersQueryType = ResultOf<typeof UsersQuery>;

export default async function UsersPage() {
  const { data: { session } } = await supabase.auth.getSession();
  const client = createGraphQLClient(session?.access_token);
  const { data } = await client.query({ query: UsersQuery, variables: { limit: 10 } });
  return <div>{data?.usersCollection?.edges.map(e => <div key={e.node.id}>{e.node.name}</div>)}</div>;
}
```

## Quick Start (Client Component with SWR)

Fetch data client-side with automatic caching and revalidation:

```tsx
import { gql } from "~/generated/graphql";
import { useGraphQLQuery } from "~/hooks/use-graphql-query";

const CurrentUserQuery = gql(`
  query CurrentUserQuery {
    viewer {
      id
      name
      email
    }
  }
`);

function UserProfile() {
  const { data, isLoading, error } = useGraphQLQuery({ query: CurrentUserQuery });
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>Welcome, {data?.viewer?.name}</div>;
}
```

## Setup with GraphQL Codegen

1. **Install deps**:
   ```bash
   npm install -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/introspection graphql
   ```

2. **Create `graphql.config.ts`** at app root:
   ```ts
   import type { CodegenConfig } from "@graphql-codegen/cli";
   const config: CodegenConfig = {
     schema: process.env.GRAPHQL_ENDPOINT || "http://localhost:3000/graphql",
     documents: ["src/**/*.tsx", "src/**/*.ts"],
     generates: {
       "./src/generated/graphql.ts": {
         plugins: ["typescript", "typescript-operations", "typed-document-node"],
       },
     },
   };
   export default config;
   ```

3. **Add to `package.json`**:
   ```json
   "scripts": {
     "generate:graphql": "graphql-codegen"
   }
   ```

## Query Colocation

**CRITICAL**: Queries must never be in standalone files. Define `gql(...)` in the **same file** that uses it.

```tsx
// ✅ src/pages/items/page.tsx — query lives here
const ItemsPageQuery = gql(`
  query ItemsPageQuery($limit: Int!) {
    itemsCollection(first: $limit) {
      edges { node { id name description } }
    }
  }
`);

// ❌ Never extract to lib/graphql/items.ts and import it
import { ItemsPageQuery } from "~/lib/graphql/items";
```

## Operation Naming

**CRITICAL**: Every GraphQL operation must have a **unique name** across the entire application.

```tsx
// ✅ Good — unique, descriptive
const ItemsListPageQuery = /*#__PURE__*/ gql(`
  query ItemsListPageQuery {
    itemsCollection {
      edges { node { id name } }
    }
  }
`);

// ❌ Bad — generic, may conflict
const ItemsQuery = /*#__PURE__*/ gql(`
  query ItemsQuery {
    itemsCollection { edges { node { id } } }
  }
`);
```

**Pattern**: `{Component}{Feature}Query` or `{Component}{Feature}Mutation` — e.g., `UserProfileQuery`, `CreatePostMutation`

## Queries with useGraphQLQuery

```tsx
// Basic query
const { data, isLoading, error } = useGraphQLQuery({
  query: ItemsListQuery,
});

// Query with variables — variables reference is allowed
const { data } = useGraphQLQuery({
  query: ItemByIdQuery,
  variables: { id: itemId },
});

// Unauthenticated query
const { data } = useGraphQLQuery({
  query: PublicItemsQuery,
  variables: { limit: 10 },
  requiresAuth: false,
});

// Conditional query — pause until ready
const { data } = useGraphQLQuery(
  userId ? { query: UserProfileQuery, variables: { id: userId } } : null,
);
```

## Mutations with useGraphQLMutation

```tsx
import { useGraphQLMutation } from "~/hooks/use-graphql-mutation";

const UpdateItemMutation = /*#__PURE__*/ gql`
  mutation UpdateItemMutation($id: ID!, $name: String!) {
    updateItem(id: $id, name: $name) {
      id
      name
      updatedAt
    }
  }
`;

function EditItemForm({ itemId }: { itemId: string }) {
  const [{ data, error }, mutate] = useGraphQLMutation(UpdateItemMutation);

  const handleSubmit = async (newName: string) => {
    const result = await mutate(
      { id: itemId, name: newName },
      { onSuccess: (data) => console.log("Updated:", data) },
    );
    if (result.error) setError(result.error.message);
  };

  return <button onClick={() => handleSubmit("New Name")}>Save</button>;
}
```

## Direct Client Usage (Server Actions / Scripts)

```ts
import { createGraphQLClient } from "~/lib/graphql/server";

export async function fetchItemsServerAction(token?: string | null) {
  const client = createGraphQLClient(token);

  try {
    const { data } = await client.query({
      query: ItemsQuery,
      variables: { limit: 100 },
    });
    return data;
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error("Network unreachable");
    } else if (error instanceof GraphQLError) {
      console.error("GraphQL error:", error.message);
    }
  }
}
```

## Fragments (Reusable Query Parts)

```tsx
import type { ResultOf } from "@graphql-typed-document-node/core";

export const UserFragment = /*#__PURE__*/ gql`
  fragment UserFragment on User {
    id
    name
    email
    createdAt
  }
`;

export type UserFragmentType = ResultOf<typeof UserFragment>;

// Use in multiple queries
const UserListQuery = /*#__PURE__*/ gql`
  query UserListQuery {
    users {
      ...UserFragment
    }
  }
`;

const CurrentUserQuery = /*#__PURE__*/ gql`
  query CurrentUserQuery {
    viewer {
      ...UserFragment
    }
  }
`;
```

## Error Handling

```tsx
const { error } = useGraphQLQuery({ query: MyQuery });

if (error) {
  if (error.type === "network") {
    // Network connection failed (offline, DNS, timeout)
    setUserMessage("No internet connection");
  } else if (error.type === "response") {
    // HTTP error (4xx/5xx)
    setUserMessage(`Server error: ${error.status}`);
  } else if (error.type === "graphql") {
    // GraphQL validation/resolver error
    const messages = error.errors.map((e) => e.message);
    setUserMessage(`Error: ${messages.join(", ")}`);
  }
}
```

## Common Scalar Types

| GraphQL | JavaScript | Notes |
|---------|-----------|-------|
| `String` | `string` | Text |
| `Int` | `number` | 32-bit integer |
| `Float` | `number` | Floating point |
| `Boolean` | `boolean` | true/false |
| `ID` | `string` | Unique identifier |
| `DateTime` | `string` | ISO 8601 timestamp |
| `BigInt` | `string` | Large integers (64-bit+) |
| `JSON` | `any` | Arbitrary JSON |

## Column/Field Aliasing

Use aliases to rename fields in the response:

```tsx
const UserWithAliasQuery = /*#__PURE__*/ gql`
  query UserWithAliasQuery {
    user {
      userId: id             # Response: userId (not id)
      displayName: name
      contactEmail: email
    }
  }
`;
```

## Cursor-Based Pagination

```ts
const ListItemsQuery = gql(`
  query ListItems($first: Int, $after: String) {
    itemsConnection(first: $first, after: $after) {
      edges { cursor node { id name } }
      pageInfo { hasNextPage endCursor }
    }
  }
`);

let cursor: string | null = null;
let hasMore = true;

while (hasMore) {
  const { data } = await client.query({
    query: ListItemsQuery,
    variables: { first: 100, after: cursor },
  });
  
  hasMore = data.itemsConnection.pageInfo.hasNextPage;
  cursor = data.itemsConnection.pageInfo.endCursor;
  
  for (const edge of data.itemsConnection.edges) {
    processItem(edge.node);
  }
}
```

## Table Permissions

GraphQL mutations require appropriate database permissions. Ensure your GraphQL schema reflects:

```graphql
type Mutation {
  createItem(input: CreateItemInput!): Item
  updateItem(id: ID!, input: UpdateItemInput!): Item
  deleteItem(id: ID!): Boolean
}
```

Database must grant `INSERT`, `UPDATE`, `DELETE` as needed for mutations to appear in the schema.

## Quick Reference

| Use Case | Pattern |
|----------|---------|
| **Define query** | `const Q = gql(\`query Name($var: Type) { field }\`)` |
| **Define mutation** | `const M = gql(\`mutation Name($var: Type) { field }\`)` |
| **Define fragment** | `const F = gql(\`fragment F on Type { field }\`)` |
| **Use in component** | `useGraphQLQuery({ query: Q, variables: { var } })` |
| **Use mutation** | `const [state, mutate] = useGraphQLMutation(M)` |
| **Skip query** | `useGraphQLQuery(ready ? { query: Q } : null)` |
| **Server-side query** | `createGraphQLClient(token).query({ query: Q })` |
| **Pagination** | Use `first`, `after`, `pageInfo.hasNextPage`, `pageInfo.endCursor` |
| **Field alias** | `newName: originalName` in query |
| **Generate types** | `npm run generate:graphql` |
