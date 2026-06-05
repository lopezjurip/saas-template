---
name: my-graphql-codegen
description: GraphQL code generation setup, SQL conventions, and type-safe patterns for GraphQL APIs built on Postgres.
---

# GraphQL Code Generation & Conventions

## SQL Conventions

**Table naming:** `snake_case`, plural preferred but singular if semantically correct
```sql
CREATE TABLE users (id BIGSERIAL PRIMARY KEY);
CREATE TABLE user_sessions (user_id BIGINT REFERENCES users);
CREATE TABLE email_verification_tokens (token TEXT PRIMARY KEY);
```

**Column naming:** `snake_case`, foreign keys end with `_id`
```sql
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**No hyphens in identifiers** — GraphQL schema introspection rejects them. Use `_` only.

## TypeScript Code Generation

**Install codegen deps:**
```bash
npm install -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/introspection graphql
```

**Create `graphql.config.ts`:**
```typescript
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_ENDPOINT || "http://localhost:3000/graphql",
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  generates: {
    "./src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        enumsAsTypes: true,
        scalars: {
          DateTime: "string",
          JSON: "any",
          BigInt: "string",
        },
      },
    },
  },
};
export default config;
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "generate:graphql": "graphql-codegen",
    "generate:graphql:watch": "graphql-codegen --watch"
  }
}
```

## Generated Files

Run `npm run generate:graphql` to produce `src/generated/graphql.ts` containing:
- `TypedDocumentNode<TData, TVariables>` for type-safe operations
- `ResultOf<typeof OperationName>` for result type inference
- Enum types matching schema

## Operation Naming Convention

Every operation must have a **globally unique name** — codegen uses it as the operation's ID.

**Pattern:** `{Component|Page}{Action}{Query|Mutation}`

```typescript
// ✓ Good — unique, descriptive
const UserProfileQuery = gql(`
  query UserProfileQuery($id: ID!) {
    user(id: $id) { id name email }
  }
`);

const CreatePostMutation = gql(`
  mutation CreatePostMutation($input: CreatePostInput!) {
    createPost(input: $input) { id title createdAt }
  }
`);

// ✗ Bad — generic, risks collision
const UserQuery = gql(`query UserQuery { user { id } }`);
const CreateMutation = gql(`mutation CreateMutation { create { id } }`);
```

## Scalar Type Mapping

| GraphQL | SQL | TS | Notes |
|---------|-----|----|----|
| `String` | `TEXT` | `string` | |
| `Int` | `INT` | `number` | 32-bit |
| `BigInt` | `BIGINT` | `string` | 64-bit, must stringify |
| `Float` | `NUMERIC` | `string` | Use string for money |
| `Boolean` | `BOOLEAN` | `boolean` | |
| `DateTime` | `TIMESTAMP` | `string` | ISO 8601 |
| `JSON` | `JSONB` | `any` | Validate at runtime |

## Query Colocation

**CRITICAL:** Never extract queries to separate files.

```typescript
// ✓ Query lives in the component that uses it
export default function UserPage({ userId }: { userId: string }) {
  const UserQuery = gql(`
    query UserPageQuery($id: ID!) {
      user(id: $id) { id name }
    }
  `);
  
  const { data } = useGraphQLQuery({ query: UserQuery, variables: { id: userId } });
  return <div>{data?.user?.name}</div>;
}

// ✗ Never do this
import { UserQuery } from "~/graphql/queries/user";
```

Query stays with its consumer — easier to delete, refactor, or move the component.

## Fragment Reuse

Extract fragments only when used in **2+ queries**:

```typescript
const UserFragment = gql(`
  fragment UserFragment on User {
    id
    name
    email
    createdAt
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

// Type inference
type UserFragmentType = ResultOf<typeof UserFragment>;
```

Single-use queries don't need fragments — keep them inline.
