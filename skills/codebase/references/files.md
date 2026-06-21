# Files

## File: apps/platform/app/apple-icon.tsx
````typescript
import { ImageResponse } from "next/og";
````

## File: apps/platform/app/icon.tsx
````typescript
import { ImageResponse } from "next/og";
````

## File: apps/platform/components/theme-provider.tsx
````typescript
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";
⋮----
export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>)
````

## File: apps/platform/lib/graphy/graphy.server.ts
````typescript
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { getSupabaseServerSession } from "@packages/supabase/client.server";
import { URL_NEW } from "@packages/utils/url";
import { cache } from "react";
````

## File: apps/platform/postcss.config.mjs
````javascript

````

## File: apps/platform/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "~/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
````

## File: packages/debug/src/react-logger.tsx
````typescript
import React from "react";
import { type DebugInstance, LOGGER_CONSOLE } from "./index";
⋮----
export type LoggerProviderProps = {
  logger: DebugInstance;
  children: React.ReactNode;
};
⋮----
export function LoggerProvider(
````

## File: packages/debug/biome.jsonc
````json
{
  "root": false,
  "$schema": "../../node_modules/@biomejs/biome/configuration_schema.json",
  "extends": "//",
  "files": {
    "includes": ["**/src/**", "**/package.json"]
  }
}
````

## File: packages/debug/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "~/*": ["*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
````

## File: packages/debug/turbo.json
````json
{
  "$schema": "../../node_modules/turbo/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
````

## File: packages/graphy/src/graphy-iter.ts
````typescript
import { ASSERT } from "@packages/utils/assert";
import type { Maybe } from "@packages/utils/maybe";
import { SLEEP } from "@packages/utils/sleep";
import type { GraphyClientSupabase } from "./graphy";
⋮----
export type GraphyIterCursorParams = {
  collectionKey: string;
  size?: number;
  limit?: number;
  sleep?: number;
  sleepMode?: "page" | "iteration";
};
⋮----
type CollectionLike<TNode> = {
  pageInfo: {
    endCursor?: Maybe<string>;
    hasNextPage: boolean;
  };
  edges: Array<{
    node: TNode;
  }>;
};
````

## File: packages/graphy/src/react-pagination.tsx
````typescript
import { useLogger } from "@packages/debug/react-logger";
import type { Maybe } from "@packages/utils/maybe";
import { FLOOR, IS_FINITE } from "@packages/utils/number";
import type React from "react";
import { useState } from "react";
import type { PageInfo } from "./graphy";
⋮----
export type PaginationHookCursor =
  | {
      first: number;
      last?: Maybe<number>;
      after?: Maybe<string>;
      before?: Maybe<string>;
    }
  | {
      first?: Maybe<number>;
      last: number;
      after?: Maybe<string>;
      before?: Maybe<string>;
    };
⋮----
export type PaginationHookOffset =
  | {
      first: number;
      last?: Maybe<number>;
      offset?: Maybe<number>;
    }
  | {
      first?: Maybe<number>;
      last: number;
      offset?: Maybe<number>;
    };
⋮----
export function usePaginationCursorState(initial: PaginationHookCursor)
⋮----
export function usePaginationOffsetState(initial: PaginationHookOffset)
⋮----
export type PaginationCursorOptions = {
  limitReset?: boolean;
};
⋮----
export function usePaginationCursor(
  pageInfo: Maybe<PageInfo>,
  pagination: PaginationHookCursor,
  dispatcher: React.Dispatch<React.SetStateAction<PaginationHookCursor>>,
  { limitReset = true }: PaginationCursorOptions = {},
)
⋮----
function handleChangeLimit(limit: number)
⋮----
function handleNextPage()
⋮----
function handlePreviousPage()
⋮----
function handleFirstPage()
⋮----
function handleLastPage()
⋮----
function reset()
⋮----
export function usePaginationOffset(
  pageInfo: Maybe<PageInfo>,
  pagination: PaginationHookOffset,
  dispatcher: React.Dispatch<React.SetStateAction<PaginationHookOffset>>,
)
⋮----
function handleGoToPage(page: number)
⋮----
function handleChangeLimit(newLimit: number)
⋮----
export type PaginationCursorActions = ReturnType<typeof usePaginationCursor>;
⋮----
export type VariableSimple = {
  filter?: Maybe<Record<string, any>>;
  after?: Maybe<any>;
  first?: Maybe<any>;
  before?: Maybe<any>;
  last?: Maybe<any>;
};
⋮----
export function useGraphQLTableCursor<Node>(
  data: Maybe<{ pageInfo: PageInfo; edges: { node: Node }[] }>,
  variables: VariableSimple,
  variablesSet: React.Dispatch<React.SetStateAction<VariableSimple>>,
)
````

## File: packages/graphy/biome.jsonc
````json
{
  "root": false,
  "$schema": "../../node_modules/@biomejs/biome/configuration_schema.json",
  "extends": "//",
  "files": {
    "includes": ["**/src/**", "**/package.json"]
  }
}
````

## File: packages/graphy/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "~/*": ["*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
````

## File: packages/graphy/turbo.json
````json
{
  "$schema": "../../node_modules/turbo/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
````

## File: packages/kapso/src/types.ts
````typescript
export type KapsoWebhookPayload = {
  event: string;
  conversation_id: string;
  contact: {
    id: string;
    phone: string;
    name?: string;
  };
  message?: {
    id: string;
    text: string;
    type: "text" | "interactive" | "template";
  };
};
⋮----
export type KapsoToolResponse =
  | { type: "text"; text: string }
  | { type: "buttons"; text: string; buttons: Array<{ id: string; title: string }> }
  | {
      type: "list";
      text: string;
      sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>;
    };
````

## File: packages/kapso/package.json
````json
{
  "name": "@packages/kapso",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "scripts": {
    "build:dry": "tsc --noEmit",
    "format": "biome check --diagnostic-level=error ."
  },
  "exports": {
    "./*": "./src/*.ts"
  },
  "devDependencies": {
    "@packages/typescript-config": "workspace:*",
    "@types/node": "^24.12.4",
    "typescript": "^6.0.3"
  }
}
````

## File: packages/kapso/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/base.json",
  "compilerOptions": {},
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

## File: packages/react-email/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/react-library.json",
  "compilerOptions": {},
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
````

## File: packages/react-hooks/src/use-clipboard.ts
````typescript
import { useCallback, useState } from "react";
⋮----
interface UseClipboardOptions {
  resetDelay?: number;
}
⋮----
interface UseClipboardReturn {
  copy: (text: string) => Promise<void>;
  copied: boolean;
  error: Error | null;
}
⋮----
export function useClipboard(options: UseClipboardOptions =
````

## File: packages/react-hooks/src/use-keyboard-shortcut.ts
````typescript
import { useEffect, useRef } from "react";
⋮----
export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  { mod = false, enabled = true }: { mod?: boolean; enabled?: boolean } = {},
)
⋮----
const onKey = (event: KeyboardEvent) =>
````

## File: packages/react-hooks/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/react-library.json",
  "compilerOptions": {},
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

## File: packages/react-hooks/vitest.config.ts
````typescript
import { defineConfig } from "vitest/config";
````

## File: packages/react-pdf/src/components/markdown.tsx
````typescript
import { Link, Text as TextBase, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { BlockContent, DefinitionContent, ListItem, PhrasingContent, RootContent } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { tw } from "../lib/tw";
⋮----
<TextBase style=
⋮----
<View style=
````

## File: packages/react-pdf/src/components/router.tsx
````typescript
import { Text } from "@react-pdf/renderer";
import { HelloWorldTemplate, helloWorldDefaultProps } from "../templates/helloworld";
import { MarkdownDemoTemplate, markdownDemoDefaultProps } from "../templates/markdown-demo";
⋮----
export type PDFTemplateID = "helloworld" | "markdown-demo";
⋮----
export function PDFRouter(
````

## File: packages/react-pdf/src/lib/tw.ts
````typescript
import { type ClassValue, clsx } from "clsx";
import { createTw } from "react-pdf-tailwind";
⋮----
export function tw(...inputs: ClassValue[])
````

## File: packages/react-pdf/src/App.tsx
````typescript
import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import { PDF_PAGES, PDFRouter, type PDFTemplateID } from "./components/router";
⋮----
function useStateQuery(key: string, defaultValue: string)
````

## File: packages/react-pdf/src/index.tsx
````typescript
import { createRoot } from "react-dom/client";
import App from "./App";
````

## File: packages/react-pdf/src/render.ts
````typescript
import { type DocumentProps, pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";
⋮----
export function renderPdf(element: ReactElement<DocumentProps>)
````

## File: packages/react-pdf/.babelrc
````
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
````

## File: packages/react-pdf/tsconfig.dev.json
````json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "../.."
  }
}
````

## File: packages/react-pdf/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/react-library.json",
  "compilerOptions": {},
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
````

## File: packages/react-pdf/webpack.config.js
````javascript

````

## File: packages/rosetta/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
````

## File: packages/supabase/supabase/tests/README.md
````markdown
# Database tests (pgTAP)

These tests run inside Postgres via [pgTAP](https://pgtap.org/) and verify SQL-layer behavior: RLS policies, security-definer functions (`viewer_*`), triggers, and the JWT-issuing hook (`user_auth_hook`). The runner is `supabase test db`, which spawns `pg_prove` in Docker and points it at the local DB.

## Running

Bring Supabase up first (`pnpm db:start`), then from the repo root:

```
pnpm test:db
```

The tests run against the same local DB as `pnpm dev` and the seed (`packages/supabase/supabase/seed.sql`). Each test file wraps itself in `begin; … rollback;` so it leaves no trace — running tests is safe even with the dev app open.

## Conventions

- One concern per file; name with `<topic>.test.sql`.
- Wrap the whole file in `begin; … rollback;`. Never commit.
- Mock the caller's JWT with `set local request.jwt.claims to '…'::jsonb::text;` AND `set local role authenticated;`. **Without `set local role`, you remain `postgres` and RLS is bypassed silently — your test will pass for the wrong reason.**
- Reuse the seeded users (`alice@humane.test` = `00000000-0000-0000-0000-00000000a11c`, `bob@humane.test` = `00000000-0000-0000-0000-00000000b00b`). If you need a third user, insert with a UUID outside the seed range so re-runs are idempotent.
- Use `select plan(N);` up top and `select * from finish();` at the bottom.
````

## File: packages/supabase/supabase/.gitignore
````
# Supabase
.branches
.temp
.env
````

## File: packages/supabase/graphql.config.ts
````typescript
import path from "node:path";
import type { CodegenConfig } from "@graphql-codegen/cli";
import { loadEnvConfig } from "@next/env";
````

## File: packages/supabase/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/base.json",
  "compilerOptions": {},
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

## File: packages/typescript-config/base.json
````json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "alwaysStrict": true,
    "allowSyntheticDefaultImports": true,
    "declaration": false,
    "declarationMap": false,
    "esModuleInterop": true,
    "incremental": false,
    "isolatedModules": true,
    "lib": ["esnext", "DOM", "DOM.Iterable"],
    "libReplacement": false,
    "module": "NodeNext",
    "moduleDetection": "force",
    "moduleResolution": "NodeNext",
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUncheckedIndexedAccess": true,
    "noUncheckedSideEffectImports": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveConstEnums": true,
    "removeComments": false,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "strictBindCallApply": true,
    "strictFunctionTypes": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "strictBuiltinIteratorReturn": true,
    "target": "esnext",
    "types": ["node"],
    "ignoreDeprecations": "6.0"
  }
}
````

## File: packages/typescript-config/nextjs.json
````json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
````

## File: packages/typescript-config/package.json
````json
{
  "name": "@packages/typescript-config",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "license": "MIT"
}
````

## File: packages/typescript-config/react-library.json
````json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "React Library",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
````

## File: packages/ui-common/src/shadcn/components/ui/label.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Label as LabelPrimitive } from "radix-ui";
⋮----
function Label(
````

## File: packages/ui-common/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/react-library.json",
  "compilerOptions": {},
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
````

## File: packages/utils/src/array.ts
````typescript
import type { Maybe } from "@packages/utils/maybe";
⋮----
export function ARRAY_CREATE<T = undefined>(length: number, content?: T): T[]
⋮----
export function ARRAY_AT_LEAST<T>(array: Maybe<ArrayLike<T>>, count: number): array is ArrayLike<T>
⋮----
export function ARRAY_NOT_EMPTY<T>(array: Maybe<ArrayLike<T>>): array is ArrayLike<T>
⋮----
export function ARRAY_IS_EMPTY<T>(array: Maybe<ArrayLike<T>>): boolean
⋮----
export function ARRAY_UNIQUE<T>(array: T[]): T[]
⋮----
export function ARRAY_SHUFFLE<T>(array: T[])
⋮----
export function SINGLE<T>(input: Maybe<T | T[] | Set<T>>): T | undefined
⋮----
export function ARRAY_IS_EQUAL<T, K>(a: T[], b: K[]): boolean
⋮----
export function TRANSPOSE<T>(matrix: T[][]): T[][]
````

## File: packages/utils/src/assert.ts
````typescript
import { IS_NOT_NILL } from "./nil";
import { FORMAT } from "./string";
import { IS_EMAIL } from "./url";
⋮----
export function ASSERT(value: unknown, message?: string, ...params: any[]): asserts value
⋮----
export function ASSERT_NOT_NIL<T>(value: T, message?: string, ...params: any[]): Exclude<T, null | undefined>
⋮----
export function ASSERT_SPA_CURRENCY(value: unknown): asserts value is "CLP" | "USD" | "EUR"
⋮----
export function ASSERT_EMAIL(value: unknown): asserts value is string
````

## File: packages/utils/src/boolean.ts
````typescript
import type { Maybe } from "@packages/utils/maybe";
⋮----
export function BOOLEAN<S>(item: Maybe<S> | false | 0 | ""): item is S
````

## File: packages/utils/src/bytes.ts
````typescript
export type ByteUnit = "B" | "KB" | "MB" | "GB";
⋮----
export function BYTES_CONVERT(value: number, from: ByteUnit, to: ByteUnit): number
````

## File: packages/utils/src/color-hash.ts
````typescript
import ColorHash from "color-hash";
````

## File: packages/utils/src/csv.ts
````typescript
export function CSV_FROM_JSON<T extends object>(data: T[], separator: "," | ";"): string
⋮----
// Escape quotes by doubling them
⋮----
// Add quotes if the value contains a separator, a quote, or a newline
````

## File: packages/utils/src/date.ts
````typescript
import type { Maybe } from "./maybe";
import { FLOOR } from "./number";
⋮----
export function DATETIME_IS_VALID(date: Date): date is Date
⋮----
export function DATETIME(...params: unknown[]): Maybe<Date>
⋮----
export function DATETIME_UTC(date: Date): Date
⋮----
export function DATE(...params: unknown[]): Maybe<Date>
⋮----
export function DATETIME_LOCAL(date: unknown): Maybe<string>
⋮----
const padWithZero = (number: number)
⋮----
export function DATE_PARTS(date: Date)
⋮----
export function DATE_PARTS_PADDED(date: Date)
⋮----
export function NOW()
⋮----
export function DATE_DIFF_DAYS(greater: Date, smaller: Date): number
⋮----
export function DATE_IS_PAST(date: Date, point = new Date()): boolean
⋮----
export function DATE_IS_FUTURE(date: Date, point = new Date()): boolean
⋮----
export function DATE_IS_EQUAL(date: Date, ...dates: Date[]): boolean
⋮----
export function DATETIME_PLUS(date: Date, ms: number): Date
⋮----
export function DATETIME_DIFF_MS(greater: Date, smaller: Date)
⋮----
export function DATETIME_IS_PAST(date: Date, point = new Date()): boolean
⋮----
export function DATETIME_IS_FUTURE(date: Date, point = new Date()): boolean
export function DATETIME_IS_EQUAL(date: Date, point = new Date()): boolean
⋮----
export function DATETIME_IS_BETWEEN(start: Maybe<Date>, end: Maybe<Date>, point = new Date()): boolean
⋮----
export function DATETIME_RELATIVE_FROM_DATE(date: Date, now = new Date())
⋮----
export function DATE_STRING(date: Date): string
⋮----
export function TIME_RELATIVE_DIFF_ES(current: Date, previous: Date, yearThreshold = 12 * 5): string
⋮----
export function RELATIVE_DATE_FORMAT(fromDate: Date, toDate: Date = new Date()): [number, Intl.RelativeTimeFormatUnit]
⋮----
export function DATE_EPOCH(date: Date): number
⋮----
export type DateTimeTruncateModes = "month" | "day" | "year" | "hour" | "minute" | "second" | "ms";
⋮----
export function DATETIME_TRUNCATE(
  date: Date,
  mode: DateTimeTruncateModes,
  truncateTz: boolean = mode === "year" || mode === "month" || mode === "day",
): Date
````

## File: packages/utils/src/declarations.d.ts
````typescript
interface ColorHashOptions {
    lightness?: number | number[];
    saturation?: number | number[];
    hue?: number | { min: number; max: number };
    hash?: (str: string) => number;
  }
⋮----
class ColorHash
⋮----
constructor(options?: ColorHashOptions);
hsl(str: string): [number, number, number];
rgb(str: string): [number, number, number];
hex(str: string): string;
````

## File: packages/utils/src/events.ts
````typescript
export type TypedEventListener<M, T extends keyof M> = (evt: M[T]) => void | Promise<void>;
⋮----
export class TypedCustomEvent<T>
⋮----
constructor(
    public readonly type: string,
    opts: { detail: T },
)
⋮----
export class TypedEventEmitter<M extends Record<string, TypedCustomEvent<any>>>
⋮----
public addEventListener<T extends keyof M>(type: T, listener: TypedEventListener<M, T>): void
⋮----
public removeEventListener<T extends keyof M>(type: T, listener: TypedEventListener<M, T>): void
⋮----
public async dispatch<T extends keyof M>(type: T, detail: M[T]["detail"]): Promise<boolean>
⋮----
public async dispatchEvent<T extends keyof M>(event: M[T]): Promise<boolean>
⋮----
export interface TypedEventListenerObject<M, T extends keyof M> {
  handleEvent: (evt: M[T]) => void | Promise<void>;
}
⋮----
export type TypedEventListenerOrEventListenerObject<M, T extends keyof M> =
  | TypedEventListener<M, T>
  | TypedEventListenerObject<M, T>;
⋮----
type ValueIsEvent<T> = {
  [key in keyof T]: Event;
};
⋮----
export interface TypedEventTarget<M extends ValueIsEvent<M>> {
  addEventListener: <T extends keyof M & string>(
    type: T,
    listener: TypedEventListenerOrEventListenerObject<M, T> | null,
    options?: boolean | AddEventListenerOptions,
  ) => void;
  removeEventListener: <T extends keyof M & string>(
    type: T,
    callback: TypedEventListenerOrEventListenerObject<M, T> | null,
    options?: EventListenerOptions | boolean,
  ) => void;
  dispatchEvent: (event: Event) => boolean;
}
⋮----
export class TypedEventTarget<M extends ValueIsEvent<M>> extends EventTarget
public dispatchTypedEvent<T extends keyof M>(_type: T, event: M[T]): boolean
⋮----
public dispatchTypedEvent<T extends keyof M>(_type: T, event: M[T]): boolean
````

## File: packages/utils/src/favicon.ts
````typescript
export function FAVICON_SVG(content: string): string
⋮----
export function FAVICON_SVG_DATAURL(svg: string): string
````

## File: packages/utils/src/file.ts
````typescript
export function MIME_CLEAN(mime: string): string
⋮----
export function EXTENSION_FOR_MIME(mime: string): string | null
⋮----
export async function URL_TO_FILE_STREAMING_NODE(
  url: string | URL | Request,
  destination: string,
  { mkdirp = true }: { mkdirp?: boolean } = {},
): Promise<boolean>
````

## File: packages/utils/src/hash.ts
````typescript
export function HASH_BKDR(str: string): number
⋮----
export function HASH(str: string): string
````

## File: packages/utils/src/http.ts
````typescript

````

## File: packages/utils/src/image.ts
````typescript

````

## File: packages/utils/src/json.ts
````typescript
import { IS_STRING } from "./string";
⋮----
export function IS_JSON(value: unknown): value is JSON
⋮----
export function JSON_PARSE<T>(str: string): T | null
⋮----
export function JSON_PARSE_SAFE<T>(str: unknown): T | null
````

## File: packages/utils/src/links.ts
````typescript
export function EXTERNAL(
````

## File: packages/utils/src/locale.ts
````typescript
export function LOCALE_TO_ISO(locale: string): string
````

## File: packages/utils/src/math.ts
````typescript
export function SUM(...numbers: number[]): number
````

## File: packages/utils/src/maybe.ts
````typescript
export type Maybe<T> = T | null | undefined;
⋮----
export type Nullable<T> = T | null;
⋮----
export type MaybeRecord<T> = {
  [P in keyof T]?: Maybe<T[P]>;
};
````

## File: packages/utils/src/nil.ts
````typescript
export function IS_NILL(value: unknown): value is null | undefined
⋮----
export function IS_NOT_NILL<T>(value: T): value is Exclude<T, null | undefined>
````

## File: packages/utils/src/number.ts
````typescript
import { IS_BROWSER } from "./ssr";
⋮----
export function NUMBER(value: number | string | null | undefined | string[] | unknown): number
⋮----
export function NUMBER_STRICT(value: Parameters<typeof NUMBER>[0]): number
⋮----
export function IS_FINITE(number: unknown): number is number
⋮----
export function PCT(number: number, digits = 2)
⋮----
export function CLAMP(number: number, min: number, max: number)
⋮----
export function CLAMP_PCT(number: number)
⋮----
export function TRUNC(number: number, digits: number = 0)
⋮----
export function ROUND(number: number, digits: number = 0)
⋮----
export function FLOOR(number: number, digits: number = 0)
⋮----
export function CEIL(number: number, digits: number = 0)
⋮----
export function NUMBER_ROMAN(n: number): string
⋮----
/**
 * Splits a positive `total` into greedy chunks of exactly `max`, with the last chunk holding the
 * remainder (which is `<= max`). The sum of all chunks is exactly `total` (no rounding loss).
 *
 * `decimals` controls the smallest unit. Default `0` means integer chunks (e.g. CLP). Use `2` for
 * cents-precision (e.g. USD), `4` for UF, etc.
 *
 * Use `NUMBER_CHUNK_EVEN` if you need chunks distributed as evenly as possible instead.
 *
 * @example
 * NUMBER_CHUNK(10_000_000, 7_000_000)        // [7_000_000, 3_000_000]
 * NUMBER_CHUNK(14_000_000, 7_000_000)        // [7_000_000, 7_000_000]
 * NUMBER_CHUNK(27_230_000, 7_000_000)        // [7_000_000, 7_000_000, 7_000_000, 6_230_000]
 * NUMBER_CHUNK(10.5, 3, 1)                   // [3, 3, 3, 1.5]
 * NUMBER_CHUNK(100.05, 30, 2)                // [30, 30, 30, 10.05]
 */
export function NUMBER_CHUNK(total: number, max: number, decimals: number = 0): number[]
⋮----
export function NUMBER_CHUNK_EVEN(total: number, max: number, decimals: number = 0): number[]
⋮----
function NUMBER_CHUNK_VALIDATE(name: string, total: number, max: number, decimals: number)
⋮----
export function FIBONACCI(n: number): number
````

## File: packages/utils/src/object.ts
````typescript
export function OBJECT_PICK<T extends Record<string, any>, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K>
⋮----
export function OBJECT_NO_UNDEFINED<T extends Record<string, any>>(obj: T): T
⋮----
export function OBJECT_MERGE_DEEP<T1, T2>(obj1: T1, obj2: T2): T1 & T2;
export function OBJECT_MERGE_DEEP<T1, T2, T3>(obj1: T1, obj2: T2, obj3: T3): T1 & T2 & T3;
export function OBJECT_MERGE_DEEP<T1, T2, T3, T4>(obj1: T1, obj2: T2, obj3: T3, obj4: T4): T1 & T2 & T3 & T4;
export function OBJECT_MERGE_DEEP(target: any, ...sources: any)
⋮----
function OBJECT_MERGE_DEEP_INNER(target: any, ...sources: any[])
⋮----
function IS_OBJECT(item: unknown): item is Record<string, any>
⋮----
export function OBJECT_IS_PLAIN(value: unknown): value is Record<string, unknown>
⋮----
export function OBJECT_EXPAND_DOTTED_KEYS(obj: Record<string, unknown>): Record<string, unknown>
⋮----
export function OBJECT_MERGE_DEEP_INTO(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown>
````

## File: packages/utils/src/pagination.ts
````typescript
export function PAGINATION(page: number, size: number)
````

## File: packages/utils/src/random.ts
````typescript
export function RANDOM_INT(min = 0, max = 100): number
⋮----
export function RANDOM_FLOAT(min = 0, max = 1): number
````

## File: packages/utils/src/regex.ts
````typescript

````

## File: packages/utils/src/rut.ts
````typescript
import type { Maybe } from "@packages/utils/maybe";
import { NUMBER_STRICT } from "./number";
⋮----
export function RUT_NORMALIZE(rut: string): string
⋮----
export function RUT_NORMALIZE_SAFE(rut: Maybe<string>): string
⋮----
/**
 * Make sure to `RUT_NORMALIZE` first.
 */
export function RUT_VALIDATE(rut: Maybe<string>): rut is string
⋮----
// if it starts with 0 we return false
// so a rut like 00000000-0 will not pass
⋮----
export type RUTFormatOptions = {
  dots?: boolean;
  dash?: boolean;
  uppercase?: boolean;
};
⋮----
export function RUT_FORMAT(rut: string,
⋮----
export type RUTValidatorDigit = "K" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
⋮----
export class RUT
⋮----
public constructor(rut: string)
⋮----
public static fromParts(numbers: string | number, dv: string)
⋮----
public static Fraccional()
⋮----
public isValid()
⋮----
public throwIfInvalid()
⋮----
public isSiiJuridical()
⋮----
isFraccional()
⋮----
public formatted(formatOptions?: RUTFormatOptions)
⋮----
public get normalized()
⋮----
public toString()
⋮----
public static sorted(ruts: RUT[])
````

## File: packages/utils/src/semver.ts
````typescript
export function SEMVER_SATISFY(base: string, challenge: string): boolean
⋮----
// @ts-expect-error
⋮----
// @ts-expect-error
⋮----
function PARSE(v: string)
⋮----
// Normalize to 3 components, padding with "0" if needed
⋮----
function COMPARE(a: string[], b: string[])
````

## File: packages/utils/src/sleep.ts
````typescript
export function SLEEP(ms: number)
````

## File: packages/utils/src/slug.ts
````typescript
export function SLUGIFY(str: string): string
````

## File: packages/utils/src/ssr.ts
````typescript
export function isServer()
⋮----
export function IS_BROWSER()
⋮----
export function IS_REACT_NATIVE()
````

## File: packages/utils/src/stringify.ts
````typescript
function stringify(
  val: any,
  allowUndefined?: boolean,
): string | number | null | undefined
⋮----
// Primitives other than string/boolean/null handled above
⋮----
// @ts-expect-error
⋮----
export function STRINGIFY_STABLE(obj: unknown): string
````

## File: packages/utils/src/time.ts
````typescript
import { default as ms, type StringValue } from "ms";
import { IS_FINITE } from "./number";
⋮----
export function MILLISECONDS(human: StringValue): number
⋮----
export function SECONDS(human: StringValue): number
````

## File: packages/utils/src/user-agent.ts
````typescript
export function USER_AGENT(): string | null
⋮----
export function IS_MOBILE(userAgent: string): boolean
⋮----
export function USER_AGENT_TO_APP(userAgent: string)
⋮----
export type OperatingSystem = "mac" | "windows" | "linux" | "other";
⋮----
export function OPERATING_SYSTEM(userAgent: string): OperatingSystem
````

## File: packages/utils/src/uuid.ts
````typescript
export function UUID_FORMAT(
  uuid: string,
  {
    n = 6,
    strategy = "last",
    dots = false,
  }: { n?: number; strategy?: "first" | "last" | "middle"; dots?: boolean } = {},
): string
````

## File: packages/utils/src/whatsapp.ts
````typescript
import { URL_NEW } from "./url";
⋮----
export function WHATSAPP_URL(phone: string, text?: string): URL
````

## File: packages/utils/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/base.json",
  "compilerOptions": {
    "module": "preserve",
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

## File: graphql.config.ts
````typescript
import type { IGraphQLConfig } from "graphql-config";
````

## File: tsconfig.json
````json
{
  "extends": "@packages/typescript-config/base.json",
  "compilerOptions": {
    "types": []
  }
}
````

## File: workspace.code-workspace
````
{
  "folders": [
    { "name": "@apps/platform", "path": "apps/platform" },
    { "name": "@packages/debug", "path": "packages/debug" },
    { "name": "@packages/graphy", "path": "packages/graphy" },
    { "name": "@packages/kapso", "path": "packages/kapso" },
    { "name": "@packages/react-email", "path": "packages/react-email" },
    { "name": "@packages/react-hooks", "path": "packages/react-hooks" },
    { "name": "@packages/react-pdf", "path": "packages/react-pdf" },
    { "name": "@packages/rosetta", "path": "packages/rosetta" },
    { "name": "@packages/supabase", "path": "packages/supabase" },
    { "name": "@packages/typescript-config", "path": "packages/typescript-config" },
    { "name": "@packages/ui-common", "path": "packages/ui-common" },
    { "name": "@packages/utils", "path": "packages/utils" }
  ],
  "extensions": {
    "recommendations": [
      "biomejs.biome",
      "bradlc.vscode-tailwindcss",
      "graphql.vscode-graphql",
      "graphql.vscode-graphql-syntax",
      "streetsidesoftware.code-spell-checker",
      "streetsidesoftware.code-spell-checker-spanish"
    ],
    "unwantedRecommendations": []
  }
}
````

## File: .claude/commands/i18n.md
````markdown
---
name: saas-template-i18n
description: Internationalization patterns for the SaaS Template React/Next.js codebase. Use when adding translations, multi-language support, or when i18n is mentioned.
---

# Internationalization (i18n) — SaaS Template

## Quick Start

```tsx
import { useRosetta } from "@packages/use-rosetta/use-rosetta";

const LOCALES = {
  es: { hello: "Hola {{name}}" },
  en: { hello: "Hello {{name}}" },
};

function MyComponent() {
  const r = useRosetta(LOCALES);
  return <h1>{r.t("hello", { name: "Juan" })}</h1>;
}
```

## Package Locations

| Context | Import |
|---------|--------|
| `packages/react-email` | `import { useRosetta, LocaleProvider, useLocale } from "@packages/use-rosetta/use-rosetta"` |
| `packages/react-pdf` | `import { useRosetta, LocaleProvider, useLocale } from "@packages/use-rosetta/use-rosetta"` |
| `apps/tenant`, `apps/platform` | `import { useRosetta } from "~/hooks/use-rosetta"` (wraps `@packages/use-rosetta` with `useNextJSLocale`) |

## Locale Injection Workaround (react-email / react-pdf)

These packages have no Next.js routing. Locale comes in as a prop. Use `LocaleProvider` to inject it:

```tsx
export function MyTemplate({ locale = "es-CL", ...props }: Props) {
  return (
    <LocaleProvider locale={locale}>
      <MyTemplateContent {...props} />
    </LocaleProvider>
  );
}

function MyTemplateContent(props: Omit<Props, "locale">) {
  const locale = useLocale(); // reads from LocaleProvider
  const r = useRosetta(LOCALES);
  return <Html lang={locale}>...</Html>;
}
```

**Always split into two components** when the template both sets and reads locale — the provider and consumer must be in separate components.

## LOCALES Structure

### Template string interpolation (preferred)

```tsx
const LOCALES = {
  es: { greeting: "Hola {{name}}" },
  en: { greeting: "Hello {{name}}" },
};
r.t("greeting", { name: "Juan" }); // "Hola Juan"
```

### Type-safe locale definition

```tsx
const LOCALE_ES = {
  title: "Título",
  description: "Descripción",
};

const LOCALES = {
  es: LOCALE_ES,
  en: { title: "Title", description: "Description" } satisfies typeof LOCALE_ES,
};
```

**Always use dot notation** — avoid nested objects:

```tsx
// ✅ Good
const LOCALES = { es: { "header.title": "Mi App" } };

// ❌ Avoid
const LOCALES = { es: { header: { title: "Mi App" } } };
```

### Function-based translations (pluralization)

```tsx
const LOCALES = {
  es: {
    messages: (p: { count: number }) =>
      p.count === 1 ? "Tienes {{count}} mensaje" : "Tienes {{count}} mensajes",
  },
};
```

**Note**: Function-based translations do NOT support React components as parameters.

## RosettaProvider (for .map() lists)

```tsx
function LocalizedRow({ item }: { item: Item }) {
  const r = useRosetta<(typeof LOCALES)["es"]>();
  return <Text>{r.t("title")}</Text>;
}

<RosettaProvider dict={LOCALES}>
  {items.map((item) => <LocalizedRow key={item.id} item={item} />)}
</RosettaProvider>
```

## Default Locale

- **Default**: `es-CL` (Chilean Spanish)
- `LocaleContext` defaults to `"es-CL"` when no `LocaleProvider` is present

## Locale Switching

```tsx
r.t("hello", undefined, "en"); // override locale for one call
const rEn = r.withLocale("en"); // create new instance
```

## DO NOT use `withRosettaLocales` inside react-pdf

`withRosettaLocales` wraps in a `<div>` which does not exist in `@react-pdf/renderer`. Use `RosettaProvider` directly.
````

## File: .codex/config.toml
````toml
[mcp_servers.next-devtools]
command = "npx"
args = [
    "-y",
    "next-devtools-mcp@latest",
]
````

## File: .conductor/settings.toml
````toml
"$schema" = "https://conductor.build/schemas/settings.repo.schema.json"

[scripts]
archive = "WORKTREE_NAME=$CONDUCTOR_WORKSPACE_NAME WORKTREE_PROJECT=saas-template bash scripts/development/worktree-archive.sh"
run = "pnpm run -w dev --filter={apps/platform} -- --port $CONDUCTOR_PORT"
run_mode = "concurrent"
setup = "WORKTREE_NAME=$CONDUCTOR_WORKSPACE_NAME WORKTREE_PORT=$CONDUCTOR_PORT WORKTREE_ROOT_PATH=$CONDUCTOR_ROOT_PATH WORKTREE_PROJECT=saas-template bash scripts/development/worktree-setup.sh"
````

## File: apps/platform/app/.well-known/oauth-protected-resource/route.ts
````typescript
import { metadataCorsOptionsRequestHandler, protectedResourceHandler } from "mcp-handler";
````

## File: apps/platform/app/(app)/a/[agency_slug]/team/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { AFFILIATION_STATE } from "~/lib/agencies";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { type TeamAffiliate, TeamList } from "./team-list";
⋮----
export async function generateMetadata(): Promise<Metadata>
⋮----
export default async function AgencyTeamPage(props: PageProps<"/a/[agency_slug]/team">)
````

## File: apps/platform/app/(app)/a/[agency_slug]/layout.tsx
````typescript
import { notFound } from "next/navigation";
import { OrderByDirection } from "~/generated/graphql/graphql";
import { getViewerAgencies, getViewerAgencyBySlug } from "~/hooks/get-viewer-agencies";
import { AgencyNav, type NavAgency } from "./agency-nav";
⋮----
export default async function AgencyShellLayout(props: LayoutProps<"/a/[agency_slug]">)
````

## File: apps/platform/app/(app)/agencies/create/page.tsx
````typescript
import type { Metadata } from "next";
import { getRosetta } from "~/lib/i18n.server";
import { AgencyCreate } from "./agency-create";
⋮----
export async function generateMetadata(props: PageProps<"/agencies/create">): Promise<Metadata>
⋮----
export default async function AgencyCreatePage(props: PageProps<"/agencies/create">)
````

## File: apps/platform/app/(app)/agencies/layout.tsx
````typescript
import { FloatingChrome } from "~/components/floating-chrome";
⋮----
export default function AgenciesLayout(props: LayoutProps<"/agencies">)
````

## File: apps/platform/app/(app)/home/account/security/email-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionUpdateEmail } from "../actions";
⋮----
type Values = z.infer<typeof schema>;
⋮----
// void action → no data on success → ErrorSafeActionEmpty is the success shape.
````

## File: apps/platform/app/(app)/home/account/security/password-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionSetPassword } from "../actions";
⋮----
type Values = z.infer<typeof schema>;
⋮----
// void action → no data on success → ErrorSafeActionEmpty is the success shape.
````

## File: apps/platform/app/(app)/home/account/security/phone-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionSendPhoneOtp, actionVerifyPhoneOtp } from "../actions";
⋮----
type PhoneValues = z.infer<typeof phoneSchema>;
⋮----
type CodeValues = z.infer<typeof codeSchema>;
⋮----
// void action → no data on success → ErrorSafeActionEmpty is the success shape.
⋮----
<Button type="button" variant="ghost" className="h-9" onClick=
````

## File: apps/platform/app/(app)/home/account/page.tsx
````typescript
import { redirect } from "next/navigation";
⋮----
export default async function AccountIndexPage(props: PageProps<"/home/account">)
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/inbox/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { InboxList } from "~/components/inbox/inbox-list";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
⋮----
export async function generateMetadata(props: PageProps<"/t/[tenant_slug]/[organization_id]/inbox">)
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/onboarding/onboarding-banner.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { TENANT_COUNT_DONE, TENANT_ONBOARDING_INCOMPLETE, TENANT_STEP_ORDER } from "./state";
import { getTenantOnboardingState } from "./state.server";
⋮----
href=
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/onboarding/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";
import { OnboardingChecklist } from "./onboarding-checklist";
import { getTenantOnboardingState } from "./state.server";
⋮----
export async function generateMetadata(): Promise<Metadata>
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/organizations/create/create-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { SLUGIFY } from "@packages/utils/slug";
import { usePostHog } from "@posthog/next";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { type CreateOrganizationValues, createOrganizationSchema } from "./schemas";
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/organizations/create/schemas.ts
````typescript
import { SLUG_REGEX } from "@packages/utils/slug";
import { z } from "zod";
⋮----
export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/members/schemas.ts
````typescript
import { z } from "zod";
⋮----
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/tenant/general/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";
import { TenantGeneralSettings } from "./tenant-general-settings";
⋮----
export async function generateMetadata(): Promise<Metadata>
⋮----
export default async function TenantGeneralSettingsPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/tenant/general">,
)
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/tenant/layout.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { notFound } from "next/navigation";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
⋮----
export default async function TenantSettingsLayout(
  props: LayoutProps<"/t/[tenant_slug]/[organization_id]/settings/tenant">,
)
````

## File: apps/platform/app/(app)/t/[tenant_slug]/layout.tsx
````typescript
import { PwaInstallBanner } from "~/components/pwa-install-banner";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
⋮----
export default async function TenantSlugLayout(props: LayoutProps<"/t/[tenant_slug]">)
````

## File: apps/platform/app/(app)/tenants/create/schemas.ts
````typescript
import { SLUG_REGEX } from "@packages/utils/slug";
import { z } from "zod";
⋮----
export type CreateTenantValues = z.infer<typeof createTenantSchema>;
````

## File: apps/platform/app/(app)/tenants/layout.tsx
````typescript
import { FloatingChrome } from "~/components/floating-chrome";
⋮----
export default function TenantsLayout(props: LayoutProps<"/tenants">)
````

## File: apps/platform/app/(app)/layout.tsx
````typescript
import { getSupabaseServerUserRedirect } from "@packages/supabase/client.server";
⋮----
export default async function AppLayout(props: LayoutProps<"/">)
````

## File: apps/platform/app/(marketing)/faq/page.tsx
````typescript
import { URL_NEW } from "@packages/utils/url";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";
⋮----
export async function generateMetadata(props: PageProps<"/faq">): Promise<Metadata>
⋮----
<h1 className="text-2xl font-semibold">
````

## File: apps/platform/app/(marketing)/legal/layout.tsx
````typescript
import { LegalSidebar } from "./_components/sidebar";
⋮----
export default async function LegalLayout(props: LayoutProps<"/legal">)
````

## File: apps/platform/app/(marketing)/legal/page.tsx
````typescript
import { redirect } from "next/navigation";
⋮----
export default async function LegalIndexPage(props: PageProps<"/legal">)
````

## File: apps/platform/app/(marketing)/mcp/mcp-prompt-cta.tsx
````typescript
import { useClipboard } from "@packages/react-hooks/use-clipboard";
import { useRosetta } from "@packages/rosetta/use-rosetta";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Card, CardContent } from "@packages/ui-common/shadcn/components/ui/card";
import { ArrowRight, Check, Copy, Terminal } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
⋮----
interface McpPromptCtaProps {
  endpoint: string;
  platformHref: Route;
}
⋮----
async function onCopyPrompt()
````

## File: apps/platform/app/(marketing)/pricing/page.tsx
````typescript
import { URL_NEW } from "@packages/utils/url";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";
import { PricingClient } from "./pricing-client";
⋮----
export async function generateMetadata(props: PageProps<"/pricing">): Promise<Metadata>
⋮----
export default async function PricingPage(props: PageProps<"/pricing">)
````

## File: apps/platform/app/(marketing)/pricing/pricing-client.tsx
````typescript
import { useRosetta } from "@packages/rosetta/use-rosetta";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@packages/ui-common/shadcn/components/ui/accordion";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui-common/shadcn/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@packages/ui-common/shadcn/components/ui/tabs";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, Minus, Star } from "lucide-react";
import { useState } from "react";
⋮----
type BillingPeriod = "monthly" | "yearly";
⋮----
type PricingTier = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  unit: string;
  unitFootnote: string;
  cta: string;
  highlighted: boolean;
  featuresLabel: string;
  features: string[];
};
⋮----
type CompareCell = string | boolean;
⋮----
type CompareGroup = {
  title: string;
  rows: { feature: string; starter: CompareCell; pro: CompareCell; empresa: CompareCell }[];
};
⋮----
type FaqEntry = { question: string; answer: string };
⋮----
function FORMAT_PRICE(value: number): string
````

## File: apps/platform/app/api/v1/organizations/[organization_id]/avatar/route.ts
````typescript
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { createZodRoute } from "next-zod-route";
import { z } from "zod";
import { streamPublicAvatar } from "~/lib/avatar";
````

## File: apps/platform/app/api/v1/profiles/[profile_id]/avatar/route.ts
````typescript
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { createZodRoute } from "next-zod-route";
import { z } from "zod";
import { streamPublicAvatar } from "~/lib/avatar";
````

## File: apps/platform/app/api/v1/tenants/[tenant_id]/avatar/route.ts
````typescript
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { createZodRoute } from "next-zod-route";
import { z } from "zod";
import { streamPublicAvatar } from "~/lib/avatar";
````

## File: apps/platform/app/auth/_components/auth-back-link.tsx
````typescript
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
⋮----
export function AuthBackLink(
⋮----
href=
````

## File: apps/platform/app/auth/_components/auth-card.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
⋮----
export function AuthCard(
⋮----
className=
````

## File: apps/platform/app/auth/_components/auth-icons.tsx
````typescript
type MarkProps = { size?: number; className?: string };
⋮----
export function GoogleMark(
⋮----
export function MicrosoftMark(
⋮----
export function LinkedInMark(
````

## File: apps/platform/app/auth/document/accept/accept-signup-form.tsx
````typescript
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction } from "~/lib/safe-action.client";
import { OtpField } from "../../_components/otp-field";
import { actionStartDocumentSignup, actionVerifyDocumentSignup } from "./actions";
⋮----
type Channel = "sms" | "email";
⋮----
function onStart(e: React.FormEvent)
⋮----
function onVerify(e: React.FormEvent)
⋮----
/**
       * Verifies and redirects server-side to the org / home on success.
       */
⋮----
className=
````

## File: apps/platform/app/auth/document/accept/page.tsx
````typescript
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { AuthBackLink } from "../../_components/auth-back-link";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { AcceptSignupForm } from "./accept-signup-form";
````

## File: apps/platform/app/auth/document/accept/schemas.ts
````typescript
import { z } from "zod";
⋮----
export type SendOtpValues = z.infer<typeof sendOtpSchema>;
⋮----
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
````

## File: apps/platform/app/auth/email/schemas.ts
````typescript
import { z } from "zod";
⋮----
export type LoginValues = z.infer<typeof loginSchema>;
⋮----
export type MagicLinkValues = z.infer<typeof magicLinkSchema>;
⋮----
export type VerifyMagicOtpValues = z.infer<typeof verifyMagicOtpSchema>;
````

## File: apps/platform/app/auth/onboarding/_actions/email-action.ts
````typescript

````

## File: apps/platform/app/auth/onboarding/_actions/password-action.ts
````typescript

````

## File: apps/platform/app/auth/onboarding/_actions/phone-action.ts
````typescript

````

## File: apps/platform/app/auth/onboarding/_components/method-catalog.tsx
````typescript
import { Fingerprint, IdCard, Lock, Mail, Phone, User } from "lucide-react";
import type { OnboardingMethodId } from "../state";
⋮----
type IconComponent = React.ComponentType<{ size?: number; className?: string }>;
⋮----
export type MethodCatalogEntry = {
  id: OnboardingMethodId;
  Icon: IconComponent;
};
````

## File: apps/platform/app/auth/onboarding/_components/ob-progress.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Check, Star, X } from "lucide-react";
import Link from "next/link";
import { AUTH_TWEAKS } from "~/lib/auth-tweaks";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import { METHOD_ORDER, ONBOARDING_METHOD_PATH, type OnboardingMethodId, type OnboardingState } from "../state";
import { METHOD_CATALOG } from "./method-catalog";
⋮----
className=
⋮----
<div className=
````

## File: apps/platform/app/auth/onboarding/_components/step-shell.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, UNSAFE_ROUTE } from "~/lib/route";
import type { OnboardingMethodId, OnboardingState } from "../state";
import { ObProgress } from "./ob-progress";
⋮----
<Link href=
````

## File: apps/platform/app/auth/onboarding/email/email-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOnboardingEmailOtp } from "~/hooks/use-onboarding";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type EmailValues = z.infer<typeof emailSchema>;
⋮----
type CodeValues = z.infer<typeof codeSchema>;
⋮----
placeholder=
````

## File: apps/platform/app/auth/onboarding/password/password-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOnboardingPassword } from "~/hooks/use-onboarding";
import { useRosetta } from "~/lib/i18n.client";
⋮----
function STRENGTH_SCORE(pw: string): number
⋮----
type Values = z.infer<typeof schema>;
````

## File: apps/platform/app/auth/onboarding/phone/phone-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOnboardingPhoneOtp } from "~/hooks/use-onboarding";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type PhoneValues = z.infer<typeof phoneSchema>;
⋮----
type CodeValues = z.infer<typeof codeSchema>;
````

## File: apps/platform/app/auth/onboarding/actions.ts
````typescript
import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { captureOnboardingCompleted, captureUserSignedUp } from "~/lib/posthog/events.server";
import { authedAction, formAction } from "~/lib/safe-action.server";
````

## File: apps/platform/app/auth/onboarding/layout.tsx
````typescript
export default function OnboardingLayout(props: LayoutProps<"/auth/onboarding">)
````

## File: apps/platform/app/auth/onboarding/state.ts
````typescript
import { ROUTE_PATH } from "~/lib/route";
⋮----
export type OnboardingMethodId = "passkey" | "password" | "phone" | "email" | "document" | "profile";
export type OnboardingMethodStatus = "pending" | "done" | "skipped";
⋮----
export type OnboardingMethod = {
  id: OnboardingMethodId;
  status: OnboardingMethodStatus;
};
⋮----
export type OnboardingState = {
  profile_id: string;
  email: string | null;
  phone: string | null;
  profile_name_full: string;
  profile_avatar_src: string | null;
  profile_onboarded_at: string | null;
  methods: Record<OnboardingMethodId, OnboardingMethodStatus>;
};
⋮----
export function ONBOARDING_METHOD_PATH(id: OnboardingMethodId): (typeof METHOD_PATHS)[OnboardingMethodId]
⋮----
export function COUNT_DONE(methods: OnboardingState["methods"]): number
````

## File: apps/platform/app/auth/phone/schemas.ts
````typescript
import { z } from "zod";
⋮----
export type SendOtpValues = z.infer<typeof sendOtpSchema>;
⋮----
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
````

## File: apps/platform/app/auth/layout.tsx
````typescript
import { FloatingChrome } from "~/components/floating-chrome";
import { LocaleProvider } from "~/lib/i18n.client";
import { getServerLocale } from "~/lib/i18n.server";
⋮----
export default async function AuthLayout(props: LayoutProps<"/auth">)
````

## File: apps/platform/app/auth/providers.ts
````typescript
import type { Provider } from "@supabase/supabase-js";
import { AppleMark, FacebookMark, GitHubMark, GoogleMark, LinkedInMark, MicrosoftMark } from "./_components/auth-icons";
⋮----
type MarkComponent = (props: { size?: number; className?: string }) => React.JSX.Element;
⋮----
export type OAuthProviderId = (typeof OAUTH_PROVIDER_IDS)[number];
⋮----
export type OAuthProvider = {
  id: OAuthProviderId;
  label: string;
  Mark: MarkComponent;
  tier: "main" | "more";
};
⋮----
export function isOAuthProvider(value: string): value is OAuthProviderId
````

## File: apps/platform/app/maintenance/layout.tsx
````typescript
import { FloatingChrome } from "~/components/floating-chrome";
⋮----
export default function MaintenanceLayout(props: LayoutProps<"/maintenance">)
````

## File: apps/platform/app/maintenance/page.tsx
````typescript
import type { Metadata } from "next";
import { SystemMessage } from "~/components/system-message";
⋮----
export default async function MaintenancePage(props: PageProps<"/maintenance">)
````

## File: apps/platform/app/manifest.webmanifest/route.ts
````typescript
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
⋮----
export async function GET()
````

## File: apps/platform/app/oauth/consent/consent-client.tsx
````typescript
import { useSupabase } from "@packages/supabase/react";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { useEffect, useState, useTransition } from "react";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type OAuthAuthorizationDetails = {
  authorization_id: string;
  client: {
    id: string;
    name: string;
    uri: string;
    logo_uri: string;
  };
  user: { id: string; email: string };
  scope: string;
};
⋮----
type Props = {
  authorization_id: string | null;
};
⋮----
async function loadDetails()
⋮----
function onApprove()
⋮----
function onDeny()
````

## File: apps/platform/app/oauth/consent/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { ConsentClient } from "./consent-client";
⋮----
export default async function OAuthConsentPage(props: PageProps<"/oauth/consent">)
````

## File: apps/platform/app/error.tsx
````typescript
import { SystemMessage } from "~/components/system-message";
⋮----
export default function ErrorBoundary(
````

## File: apps/platform/app/not-found.tsx
````typescript
import { SystemMessage } from "~/components/system-message";
⋮----
export default function NotFound()
````

## File: apps/platform/app/opengraph-image.tsx
````typescript
import { ImageResponse } from "next/og";
import type { SupportedLocale } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
````

## File: apps/platform/components/dev-env-console.tsx
````typescript
import { useEffect } from "react";
⋮----
export function DevEnvConsole(
````

## File: apps/platform/components/entity-avatar.tsx
````typescript
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui-common/shadcn/components/ui/avatar";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import type { ComponentProps } from "react";
⋮----
export type AvatarEntity = "organizations" | "tenants" | "profiles" | "agencies";
⋮----
export function EntityAvatar({
  entity,
  entityId,
  name,
  shape = "square",
  className,
  ...props
}: {
  entity: AvatarEntity;
  entityId: string | number;
  name: string;
  shape?: "circle" | "square";
} & ComponentProps<typeof Avatar>)
⋮----
className=
````

## File: apps/platform/components/entity-logo-controls.tsx
````typescript
import { getSupabaseClient } from "@packages/supabase/client.browser";
import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui-common/shadcn/components/ui/avatar";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type ComponentProps, useRef, useState } from "react";
⋮----
function LOGO_SAFE_FILE_NAME(fileName: string)
⋮----
function LOGO_PATH(folder: string, fileName: string)
⋮----
function triggerUpload()
⋮----
async function handleUpload(event: ChangeEvent<HTMLInputElement>)
⋮----
async function handleRemove()
⋮----
<AvatarFallback className=
````

## File: apps/platform/components/graphy-provider.tsx
````typescript
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { GraphyProvider } from "@packages/graphy/react";
import { useSupabase } from "@packages/supabase/react";
import { URL_NEW } from "@packages/utils/url";
import { useEffect, useMemo, useState } from "react";
⋮----
export function GraphyClientProvider(
````

## File: apps/platform/components/json-ld.tsx
````typescript
import type { Thing, WithContext } from "schema-dts";
⋮----
export function JsonLd(
````

## File: apps/platform/components/markdown.tsx
````typescript
import { IS_EXTERNAL } from "@packages/utils/url";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { UNSAFE_ROUTE } from "~/lib/route";
⋮----
function MarkdownA(
⋮----
return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
⋮----
return <Link href=
⋮----
export function Markdown(
````

## File: apps/platform/components/status-badge.tsx
````typescript
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import useSWR from "swr";
import { useRosetta } from "~/lib/i18n.client";
⋮----
async function FETCH_HEALTH(url: string): Promise<boolean>
````

## File: apps/platform/content/legal/en/cookies.md
````markdown
# Cookie policy

_Last updated: May 26, 2026_

SaaS Template uses session cookies for authentication and to remember your locale preference. We do not use third-party tracking cookies. The final text will be published before the production launch.
````

## File: apps/platform/content/legal/en/privacy.md
````markdown
# Privacy policy

_Last updated: May 26, 2026_

SaaS Template processes personal data under the framework of Law 21.719 (Chile). This policy will describe what data we collect, for what purpose, the rights of the data subject, and the procedures to exercise them. The final text will be published before the production launch.
````

## File: apps/platform/content/legal/en/terms.md
````markdown
# Terms of service

_Last updated: May 26, 2026_

This document describes the rules for using the SaaS Template platform, the mutual obligations between SaaS Template and its customers (companies and workers), and liability limits. The final text will be published before the production launch.
````

## File: apps/platform/content/legal/es/cookies.md
````markdown
# Política de cookies

_Última actualización: 26 de mayo de 2026_

SaaS Template usa cookies de sesión para autenticación y para guardar tu preferencia de idioma. No usamos cookies de tracking de terceros. El texto definitivo se publicará antes del lanzamiento a producción.
````

## File: apps/platform/content/legal/es/privacy.md
````markdown
# Política de privacidad

_Última actualización: 26 de mayo de 2026_

SaaS Template procesa datos personales bajo el marco de la Ley 21.719 (Chile). Esta política describirá qué datos recolectamos, con qué finalidad, los derechos del titular y los procedimientos para ejercerlos. El texto definitivo se publicará antes del lanzamiento a producción.
````

## File: apps/platform/content/legal/es/terms.md
````markdown
# Términos de servicio

_Última actualización: 26 de mayo de 2026_

Este documento describe las reglas de uso de la plataforma SaaS Template, las obligaciones recíprocas entre SaaS Template y sus clientes (empresas y trabajadores), y los límites de responsabilidad. El texto definitivo se publicará antes del lanzamiento a producción.
````

## File: apps/platform/content/legal/pt/cookies.md
````markdown
# Política de cookies

_Última atualização: 26 de maio de 2026_

A SaaS Template usa cookies de sessão para autenticação e para lembrar a sua preferência de idioma. Não usamos cookies de rastreamento de terceiros. O texto definitivo será publicado antes do lançamento em produção.
````

## File: apps/platform/content/legal/pt/privacy.md
````markdown
# Política de privacidade

_Última atualização: 26 de maio de 2026_

A SaaS Template processa dados pessoais sob o marco da Lei 21.719 (Chile). Esta política descreverá quais dados coletamos, com qual finalidade, os direitos do titular e os procedimentos para exercê-los. O texto definitivo será publicado antes do lançamento em produção.
````

## File: apps/platform/content/legal/pt/terms.md
````markdown
# Termos de serviço

_Última atualização: 26 de maio de 2026_

Este documento descreve as regras de uso da plataforma SaaS Template, as obrigações recíprocas entre a SaaS Template e seus clientes (empresas e trabalhadores), e os limites de responsabilidade. O texto definitivo será publicado antes do lançamento em produção.
````

## File: apps/platform/lib/conversations/channel-sender-email.ts
````typescript
import { ConversationNotificationEmail } from "@packages/react-email/templates/conversation_notification";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { debug } from "~/lib/debug";
import type { ChannelSender, ChannelSenderInput, ChannelSenderResult } from "./channel-sender";
⋮----
// Build the thread URL so the recipient can view the in-app thread.
````

## File: apps/platform/lib/conversations/channel-sender-twilio.ts
````typescript
import { debug } from "~/lib/debug";
import type { ChannelSender, ChannelSenderInput, ChannelSenderResult } from "./channel-sender";
````

## File: apps/platform/lib/conversations/channel-sender-whatsapp.ts
````typescript
import { KapsoClient } from "@packages/kapso/client";
import { debug } from "~/lib/debug";
import type { ChannelSender, ChannelSenderInput, ChannelSenderResult } from "./channel-sender";
````

## File: apps/platform/lib/conversations/channel-sender.ts
````typescript
export interface ChannelSenderInput {
  deliveryId: string;
  messageId: string;
  conversationId: string;
  profileId: string;
  replyToken: string;
  subject: string | null;
  body: string | null;
  payload: Record<string, unknown>;
  locale: string;
}
⋮----
export interface ChannelSenderResult {
  status: "sent" | "failed" | "skipped";
  providerMessageId?: string;
  error?: string;
}
⋮----
export type ChannelSender = (input: ChannelSenderInput) => Promise<ChannelSenderResult>;
````

## File: apps/platform/lib/conversations/inbound-parser-twilio.ts
````typescript
import { createHmac } from "node:crypto";
⋮----
export interface TwilioInboundResult {
  valid: boolean;
  from: string;
  body: string;
  messageSid: string;
  rawParams: Record<string, string>;
}
⋮----
export async function parseTwilioInbound(request: Request): Promise<TwilioInboundResult>
⋮----
// SMS channel not configured — treat all requests as invalid.
⋮----
// Parse form body (Twilio sends application/x-www-form-urlencoded).
⋮----
// Build the string to sign: URL + sorted key-value pairs.
⋮----
// HMAC-SHA1, base64-encoded.
````

## File: apps/platform/lib/graphy/graphy.browser.ts
````typescript
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { getSupabaseClientSession } from "@packages/supabase/client.browser";
import { URL_NEW } from "@packages/utils/url";
⋮----
export function createGraphy(accessToken?: string)
⋮----
export async function getGraphy()
````

## File: apps/platform/lib/graphy/graphy.mcp.ts
````typescript
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { URL_NEW } from "@packages/utils/url";
⋮----
export function createGraphyMcp(accessToken?: string): GraphyClientSupabase
````

## File: apps/platform/lib/mcp/tools/members.ts
````typescript
import { z } from "zod";
import { debug } from "~/lib/debug";
import { getSupabaseFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";
⋮----
type ListOrganizationMembersArgs = InferArgs<typeof ListOrganizationMembersSchema>;
⋮----
export class ListOrganizationMembersTool extends McpTool<typeof ListOrganizationMembersSchema>
⋮----
async *handle(args: ListOrganizationMembersArgs, ctx: McpContext): McpToolStream
````

## File: apps/platform/lib/mcp/tools/tenants.ts
````typescript
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";
⋮----
export class ListTenantsTool extends McpTool
⋮----
async *handle(_args: Record<string, unknown>, ctx: McpContext): McpToolStream
⋮----
export class ListOrganizationsTool extends McpTool
````

## File: apps/platform/lib/mcp/tools/whoami.ts
````typescript
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";
⋮----
export class WhoamiTool extends McpTool
⋮----
async *handle(_args: Record<string, unknown>, ctx: McpContext): McpToolStream
````

## File: apps/platform/lib/mcp/clients.ts
````typescript
import { createSupabaseMcpClient } from "@packages/supabase/client.mcp";
import { createGraphyMcp } from "~/lib/graphy/graphy.mcp";
import type { McpContext } from "~/lib/mcp/tool";
⋮----
export class McpUnauthorizedError extends Error
⋮----
constructor(message = "Unauthorized: this MCP tool requires an authenticated caller")
⋮----
export function getGraphyFromMcp(ctx: McpContext): ReturnType<typeof createGraphyMcp>
⋮----
export function getGraphyFromMcpAssert(ctx: McpContext): ReturnType<typeof createGraphyMcp>
⋮----
export function getSupabaseFromMcp(ctx: McpContext): ReturnType<typeof createSupabaseMcpClient>
⋮----
export function getSupabaseFromMcpAssert(ctx: McpContext): ReturnType<typeof createSupabaseMcpClient>
````

## File: apps/platform/lib/mcp/tool.ts
````typescript
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ServerNotification } from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape, z } from "zod";
⋮----
export type InferArgs<Shape extends ZodRawShape> = z.infer<z.ZodObject<Shape>>;
⋮----
export type McpToolStream = AsyncGenerator<ServerNotification, CallToolResult, void>;
⋮----
export type McpContext = {
  token: string | undefined;
  userId: string | undefined;
  host: string | undefined;
};
⋮----
export abstract class McpTool<Shape extends ZodRawShape = ZodRawShape>
⋮----
abstract handle(args: InferArgs<Shape>, ctx: McpContext): McpToolStream;
⋮----
async run(
    args: InferArgs<Shape>,
    ctx: McpContext,
    emit?: (notification: ServerNotification) => Promise<void> | void,
): Promise<CallToolResult>
⋮----
register(server: McpServer): void
````

## File: apps/platform/lib/posthog/events.server.ts
````typescript
import { getPostHogClient } from "./posthog.server";
⋮----
async function captureEvent(
  event: string,
  distinctId: string,
  properties?: Record<string, unknown>,
  groups?: Record<string, string>,
): Promise<void>
⋮----
export async function captureUserSignedIn(profile_id: string, properties:
⋮----
export async function captureUserSignedUp(profile_id: string, properties:
⋮----
export async function captureUserSignedOut(profile_id: string): Promise<void>
⋮----
export async function capturePasskeyCreated(profile_id: string): Promise<void>
⋮----
export async function capturePasskeyDeleted(profile_id: string): Promise<void>
⋮----
export async function captureTenantCreated(
  profile_id: string,
  properties: { tenant_id: number; tenant_slug: string; organization_id: number },
): Promise<void>
⋮----
export async function captureMemberInvited(
  profile_id: string,
  properties: { organization_id: number; tenant_id: number; channel: "email" | "phone" | "document" },
): Promise<void>
⋮----
export async function captureOnboardingCompleted(profile_id: string): Promise<void>
````

## File: apps/platform/lib/posthog/posthog.server.ts
````typescript
import { PostHog } from "posthog-node";
⋮----
export function getPostHogClient()
````

## File: apps/platform/lib/apex.ts
````typescript
import { headers } from "next/headers";
import { APP_HOST } from "~/lib/constants";
⋮----
export async function isApexHost(): Promise<boolean>
````

## File: apps/platform/lib/avatar.ts
````typescript
import { NextResponse } from "next/server";
⋮----
export async function streamPublicAvatar(src: string | null | undefined): Promise<NextResponse>
````

## File: apps/platform/lib/debug.ts
````typescript
import { CREATE_DEBUGGER } from "@packages/debug/index";
import { DEBUG } from "~/lib/constants";
````

## File: apps/platform/lib/dev-host.ts
````typescript
export function isDevHost(host: string | null | undefined): boolean
````

## File: apps/platform/lib/i18n.client.ts
````typescript

````

## File: apps/platform/lib/tenancy.ts
````typescript
export function tenantSlugFromHost(host: string | null | undefined, apex?: string | null): string | null
````

## File: apps/platform/public/sw.js
````javascript

````

## File: apps/platform/graphql.config.ts
````typescript
import type { CodegenConfig } from "@graphql-codegen/cli";
import type { ClientPresetConfig } from "@graphql-codegen/client-preset";
````

## File: apps/platform/instrumentation.ts
````typescript
export async function register()
````

## File: docs/notifications-system-plan.md
````markdown
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
````

## File: packages/api-ip/tsconfig.json
````json
{
  "extends": "@packages/typescript-config/base.json",
  "compilerOptions": {
    "module": "preserve",
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

## File: packages/debug/src/index.ts
````typescript
import { type Diary, diary, enable } from "diary";
⋮----
export type DebugInstance = Diary;
⋮----
export function CREATE_DEBUGGER(base: string, filterQuery?: string | null, separator = ":")
⋮----
const isExclude = (name: string)
⋮----
export function censure(secret: string | undefined | null)
````

## File: packages/graphy/src/graphy.ts
````typescript
import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
import { ErrorExtendable } from "@packages/utils/errors";
import { HASH } from "@packages/utils/hash";
import { HEADERS_JSON, MIME_JSON } from "@packages/utils/http";
import { JSON_PARSE_SAFE } from "@packages/utils/json";
import type { Maybe } from "@packages/utils/maybe";
import type { GraphQLError as GraphQLErrorType, OperationDefinitionNode } from "graphql";
⋮----
export interface DocumentTypeDecorationMeta<TData, TVariables> extends DocumentTypeDecoration<TData, TVariables> {
  definitions?: OperationDefinitionNode[];
  __meta__?: {
    hash?: string;
    [key: string]: unknown;
  };
}
⋮----
export interface GraphyFetchGraphQLQuery<TData, TVariables> {
  query: DocumentTypeDecorationMeta<TData, TVariables>;
  variables?: TVariables | null | undefined;
}
⋮----
type GraphQLQueryBody = {
  query?: string;
  variables?: Maybe<Record<any, any>>;
  extensions?: {
    persistedQuery?: {
      version: number;
      sha256Hash: string;
    };
  };
};
⋮----
export type PageInfo<T extends string = string> = {
  endCursor?: T | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: T | null;
};
⋮----
export type PGGraphQLErrorCodes =
  | "PGRST300"
  | "PGRST301"
  | "PGRST302"
  | "PGRST003";
⋮----
export type PGGraphQLError = {
  code: PGGraphQLErrorCodes;
  details?: unknown;
  hint?: unknown;
  message: string;
};
⋮----
function QUERY_OBJECT_TO_STRING(query: unknown): string
⋮----
export async function graphyRequest<TData, TVariables>(
  { query, variables }: GraphyFetchGraphQLQuery<TData, TVariables>,
  input: string | URL,
  init: RequestInit = {},
): Promise<TData>
⋮----
export function GRAPHQL_EXTRACT(document: DocumentTypeDecorationMeta<any, any>)
⋮----
export class GraphyClient
⋮----
constructor(
⋮----
public async fetch<TData, TVariables>(
    { query, variables }: GraphyFetchGraphQLQuery<TData, TVariables>,
    init?: RequestInit,
): Promise<TData>
⋮----
public async query<TData, TVariables>(
    params: GraphyFetchGraphQLQuery<TData, TVariables>,
    init?: RequestInit,
): Promise<
⋮----
public async mutate<TData, TVariables>(
    params: GraphyFetchGraphQLQuery<TData, TVariables>,
    init?: RequestInit,
): Promise<
⋮----
export class GraphyClientSupabase extends GraphyClient
⋮----
constructor(url: string | URL, key: string, access_token?: string | null | undefined, init: RequestInit =
⋮----
export abstract class GraphyError extends ErrorExtendable
⋮----
export class GraphyNetworkError extends GraphyError
⋮----
export class GraphyResponseError extends GraphyError
⋮----
constructor(message: string, status: number, code?: PGGraphQLErrorCodes)
⋮----
export class GraphyGraphQLError extends GraphyError
⋮----
constructor(errors: GraphQLErrorType[], query?: GraphQLQueryBody)
⋮----
export function isGraphyError(error: unknown): error is GraphyError
⋮----
export function isGraphyNetworkError(error: unknown): error is GraphyNetworkError
⋮----
export function isGraphyResponseError(error: unknown, code?: PGGraphQLErrorCodes): error is GraphyResponseError
⋮----
export function isGraphyGraphQLError(error: unknown): error is GraphyGraphQLError
````

## File: packages/graphy/src/react.tsx
````typescript
import { useLogger } from "@packages/debug/react-logger";
import type { Maybe } from "@packages/utils/maybe";
import React, { type ReactNode, useCallback, useEffect } from "react";
import useSWR, { type SWRConfiguration } from "swr";
import { GRAPHQL_EXTRACT, type GraphyClientSupabase, type GraphyError, type GraphyFetchGraphQLQuery } from "./graphy";
⋮----
type GraphyContextValue = {
  client: GraphyClientSupabase;
  namespace: string;
};
⋮----
export type GraphyProviderProps = {
  children: ReactNode;
  value: GraphyClientSupabase;
  namespace?: string;
};
⋮----
export function GraphyProvider(
⋮----
export interface GraphyFetchGraphQLQueryHookParams<TData, TVariables>
  extends GraphyFetchGraphQLQuery<TData, TVariables> {
  indifferent?: boolean;
}
⋮----
export function useGraphyQuery<TData, TVariables>(
  params: Maybe<GraphyFetchGraphQLQueryHookParams<TData, TVariables>>,
  options?: SWRConfiguration<TData, Error>,
)
⋮----
export type GraphyHookMutationState<TData, TVariables> = {
  data: TData | null;
  variables: TVariables | null;
  error: GraphyError | null;
  isValidating: boolean;
};
⋮----
export function useGraphyMutation<TData, TVariables>(mutation: GraphyFetchGraphQLQuery<TData, TVariables>["query"])
````

## File: packages/kapso/src/client.ts
````typescript
import type { KapsoToolResponse } from "./types.ts";
⋮----
export type KapsoClientConfig = {
  apiKey: string;
  baseUrl?: string;
};
⋮----
export class KapsoClient
⋮----
constructor(config: KapsoClientConfig)
⋮----
async sendMessage(conversationId: string, response: KapsoToolResponse): Promise<void>
````

## File: packages/react-email/src/templates/conversation_notification.tsx
````typescript
import { LocaleProvider, useLocale, useRosetta } from "@packages/rosetta/use-rosetta";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
⋮----
export interface ConversationNotificationEmailProps {
  subject: string;
  body: string;
  threadUrl?: string;
  locale?: string;
}
````

## File: packages/react-hooks/src/use-click-outside.ts
````typescript
import type { RefObject } from "react";
import { useEffect } from "react";
⋮----
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled: boolean,
)
⋮----
function onDown(event: MouseEvent)
function onKey(event: KeyboardEvent)
````

## File: packages/react-hooks/src/use-cookie-store.ts
````typescript
import { type CookieStoreLike, cookieStorePolyfill } from "@packages/utils/cookie-store.polyfill";
import { useMemo } from "react";
⋮----
export function useCookieStore(): CookieStoreLike
````

## File: packages/react-hooks/src/use-mounted.ts
````typescript
import { useEffect, useState } from "react";
⋮----
export function useMounted(): boolean
````

## File: packages/react-pdf/public/index.html
````html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Preview — SaaS Template</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    #app {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  </style>
</head>
<body>
  <div id="app"></div>
</body>
</html>
````

## File: packages/react-pdf/src/templates/helloworld.tsx
````typescript
import { LocaleProvider, useRosetta } from "@packages/rosetta/use-rosetta";
import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import { tw } from "../lib/tw";
⋮----
export interface HelloWorldTemplateProps {
  locale?: string;
}
⋮----
export function HelloWorldTemplate(
⋮----
<Text style=
⋮----
<View style=
⋮----
<View key=
⋮----
style=
````

## File: packages/react-pdf/src/templates/markdown-demo.tsx
````typescript
import { Document, Page } from "@react-pdf/renderer";
import { Markdown } from "../components/markdown";
import { tw } from "../lib/tw";
⋮----
export function MarkdownDemoTemplate()
````

## File: packages/rosetta/src/use-rosetta.tsx
````typescript
import { type RosettaDict, RosettaImpl, type RosettaOptions } from "@packages/rosetta/rosetta";
import React, { useContext, useMemo } from "react";
⋮----
export function LocaleProvider(
⋮----
export function RosettaProvider<T>({
  dict,
  options,
  locale,
  ...props
}: {
  children: React.ReactNode;
  dict: RosettaDict<T>;
  options?: RosettaOptions;
  locale?: string;
})
⋮----
export function useRosetta<T>(dict?: RosettaDict<T>, options?: RosettaOptions): RosettaImpl<T>
⋮----
export function withRosettaLocales<T>(dict: RosettaDict<T>, options?: RosettaOptions)
````

## File: packages/supabase/src/client.mcp.ts
````typescript
import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";
import type { Database } from "./types.ts";
⋮----
export function createSupabaseMcpClient(accessToken?: string)
````

## File: packages/supabase/src/jwt.ts
````typescript
import { JWT_DECODE_PAYLOAD } from "@packages/utils/jwt";
import type { AppMetadata } from "./metadata";
import { AppMetadataSchema } from "./metadata";
⋮----
export interface SupabaseJwtPayload {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  nbf?: number;
  jti?: string;
  role: string;
  aal: "aal1" | "aal2";
  session_id: string;
  email?: string;
  email_verified?: boolean;
  phone?: string;
  phone_verified?: boolean;
  auth_time?: number;
  app_metadata?: AppMetadata;
  user_metadata?: Record<string, unknown>;
  is_anonymous?: boolean;
  amr?: Array<{ method: string; timestamp: number }>;
  factor_id?: string;
  client_id?: string;
  scope?: string;
}
⋮----
export function SUPABASE_JWT_DECODE_PAYLOAD(token: string): SupabaseJwtPayload | null
⋮----
export function SUPABASE_JWT_METADATA(payload: SupabaseJwtPayload): AppMetadata | null
````

## File: packages/supabase/src/metadata.ts
````typescript
import { z } from "zod";
⋮----
export type AppMetadata = z.infer<typeof AppMetadataSchema>;
````

## File: packages/supabase/src/react.ts
````typescript
import { useMemo } from "react";
import useSWR from "swr";
import { getSupabaseClient, getSupabaseClientUser } from "./client.browser";
⋮----
export function useSupabase()
⋮----
export function useSupabaseUser()
````

## File: packages/supabase/supabase/templates/confirmation.html
````html
<h2>Confirma tu correo</h2>
<p>Sigue este enlace para confirmar tu cuenta en SaaS Template:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next={{ .RedirectTo }}">Confirmar correo</a></p>
<p>O ingresa el código: <strong>{{ .Token }}</strong></p>
````

## File: packages/supabase/supabase/templates/email_change.html
````html
<h2>Confirma tu nuevo correo</h2>
<p>Sigue este enlace para confirmar el cambio de correo en SaaS Template:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next={{ .RedirectTo }}">Confirmar cambio</a></p>
<p>O ingresa el código: <strong>{{ .Token }}</strong></p>
````

## File: packages/supabase/supabase/templates/magic_link.html
````html
<h2>Tu enlace para iniciar sesión</h2>
<p>Sigue este enlace para entrar a SaaS Template:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next={{ .RedirectTo }}">Iniciar sesión</a></p>
<p>O ingresa el código: <strong>{{ .Token }}</strong></p>
````

## File: packages/ui-common/src/shadcn/components/ui/badge.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
⋮----
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> &
````

## File: packages/ui-common/src/shadcn/components/ui/button.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
⋮----
className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
````

## File: packages/ui-common/src/shadcn/components/ui/card.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
⋮----
className=
⋮----
function CardDescription(
````

## File: packages/ui-common/src/shadcn/components/ui/collapsible.tsx
````typescript
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
⋮----
function CollapsibleTrigger(
⋮----
function CollapsibleContent(
````

## File: packages/ui-common/src/shadcn/components/ui/dialog.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
⋮----
className=
````

## File: packages/ui-common/src/shadcn/components/ui/dropdown-menu.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
⋮----
function DropdownMenu(
⋮----
function DropdownMenuPortal(
⋮----
function DropdownMenuTrigger(
⋮----
function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>)
⋮----
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
})
⋮----
className=
⋮----
function DropdownMenuRadioGroup(
⋮----
function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  inset?: boolean;
})
````

## File: packages/ui-common/src/shadcn/components/ui/input.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
⋮----
function Input(
⋮----
className=
````

## File: packages/ui-common/src/shadcn/components/ui/kbd.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
⋮----
className=
````

## File: packages/ui-common/src/shadcn/components/ui/separator.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Separator as SeparatorPrimitive } from "radix-ui";
⋮----
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>)
````

## File: packages/ui-common/src/shadcn/components/ui/sheet.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
⋮----
className=
````

## File: packages/ui-common/src/shadcn/components/ui/sidebar.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Separator } from "@packages/ui-common/shadcn/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@packages/ui-common/shadcn/components/ui/sheet";
import { Skeleton } from "@packages/ui-common/shadcn/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui-common/shadcn/components/ui/tooltip";
import { useIsMobile } from "@packages/ui-common/shadcn/hooks/use-mobile";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";
import { Slot } from "radix-ui";
⋮----
type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};
⋮----
function useSidebar()
⋮----
const handleKeyDown = (event: KeyboardEvent) =>
⋮----
className=
````

## File: packages/ui-common/src/shadcn/components/ui/skeleton.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
⋮----
return <div data-slot="skeleton" className=
````

## File: packages/ui-common/src/shadcn/components/ui/tooltip.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Tooltip as TooltipPrimitive } from "radix-ui";
⋮----
function TooltipTrigger(
⋮----
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>)
````

## File: packages/ui-common/src/shadcn/hooks/use-mobile.ts
````typescript
export function useIsMobile()
⋮----
const onChange = () =>
````

## File: packages/ui-common/src/shadcn/lib/utils.ts
````typescript
import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
⋮----
export function cn(...inputs: ClassValue[])
````

## File: packages/ui-common/src/polymorphic.tsx
````typescript
export type PolymorphicProps<T extends React.ElementType, Props = object> = Props & {
  as?: T;
} & Omit<React.ComponentPropsWithRef<T>, keyof Props | "as">;
````

## File: packages/ui-common/components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-rhea",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/shadcn/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@packages/ui-common/shadcn/components",
    "utils": "@packages/ui-common/shadcn/lib/utils",
    "ui": "@packages/ui-common/shadcn/components/ui",
    "lib": "@packages/ui-common/shadcn/lib",
    "hooks": "@packages/ui-common/shadcn/hooks"
  }
}
````

## File: packages/ui-common/vitest.config.ts
````typescript
import { defineConfig } from "vitest/config";
````

## File: packages/utils/src/colors.ts
````typescript
export function RGB_FROM_HEX(hex: string)
export function RGBA_FROM_HEX(hex: string)
⋮----
export function HEX_TO_RGBA(hex: string, alpha?: number): [number, number, number, number]
⋮----
export function PERCENTAGE_TO_HEX(percentage: number): string
⋮----
function RGB_TRIPLET(e1: number, e2: number, e3: number)
⋮----
export function DATAURL_FROM_RGB(r: number, g: number, b: number)
⋮----
export function COLOR_HSL_FROM_STRING(name: string): Record<string, string>
````

## File: packages/utils/src/cookie-store.polyfill.ts
````typescript
import { SERIALIZE_COOKIE } from "./cookie";
⋮----
export type CookieStoreLike = {
  get(name: string): Promise<CookieListItem | null>;
  get(options?: CookieStoreGetOptions): Promise<CookieListItem | null>;
  set(name: string, value: string): Promise<void>;
  set(options: CookieInit): Promise<void>;
};
⋮----
get(name: string): Promise<CookieListItem | null>;
get(options?: CookieStoreGetOptions): Promise<CookieListItem | null>;
set(name: string, value: string): Promise<void>;
set(options: CookieInit): Promise<void>;
⋮----
get(nameOrOptions?: string | CookieStoreGetOptions): Promise<CookieListItem | null>
set(nameOrInit: string | CookieInit, value?: string): Promise<void>
````

## File: packages/utils/src/cookie.ts
````typescript
export type CookieAttributes = {
  path?: string;
  maxAgeSeconds?: number | null;
  sameSite?: "Strict" | "Lax" | "None";
  secure?: boolean;
  domain?: string;
};
⋮----
export function SERIALIZE_COOKIE(name: string, value: string, attributes: CookieAttributes =
````

## File: packages/utils/src/env.ts
````typescript
import { IS_NILL } from "@packages/utils/nil";
⋮----
export function ENV(key: string): string
````

## File: packages/utils/src/errors.ts
````typescript
import { MIME_JSON } from "./http";
⋮----
export class ErrorExtendable extends Error
⋮----
public constructor(message?: string, options?: ErrorOptions)
⋮----
public static is<T extends ErrorExtendable>(error: unknown, errorClass: new (...args: any[]) => T): error is T
⋮----
export function ERROR_IS<T extends Error>(error: unknown, errorClass: new (...args: any[]) => T): error is T
⋮----
export class ErrorFetch<T = unknown> extends ErrorExtendable
⋮----
public constructor(
    init: { status: number; statusText: string; url: string; body?: string; json?: T },
    options?: ErrorOptions,
)
⋮----
public static async from<T = unknown>(response: Response, options?: ErrorOptions): Promise<ErrorFetch<T>>
````

## File: packages/utils/src/functions.ts
````typescript
export function NOOP()
⋮----
export function IS_FUNCTION(fn: unknown): fn is (...args: never[]) => unknown
````

## File: packages/utils/src/headers.ts
````typescript
import { URL_NEW } from "./url";
⋮----
export function HOST_FROM_HEADERS(hdrs:
````

## File: packages/utils/src/iterators.ts
````typescript
import { BOOLEAN } from "./boolean";
import type { Maybe } from "./maybe";
import { IS_NILL } from "./nil";
⋮----
export function IDENTITY<T>(val: T): T
export function SHALLOW_COMPARE<T>(a: T, b: T): boolean
⋮----
export function EVERY<T>(iterable: Iterable<T>, fn: (value: T, index: number, obj: Iterable<T>) => any): boolean
export function SOME<T>(iterable: Iterable<T>, fn: (value: T, index: number, obj: Iterable<T>) => any): boolean
⋮----
export function IS_INTERSECTION<T>(
  iterableA: Iterable<T>,
  iterableB: Iterable<T>,
  fn: (a: T, b: T) => any = SHALLOW_COMPARE,
): boolean
⋮----
export function FIND<T>(
  iterable: Iterable<T>,
  fn: (value: T, index: number, iterable: Iterable<T>) => unknown,
): T | undefined
⋮----
export function REDUCE<T, U>(
  iterable: Iterable<T>,
  fn: (previousValue: U, currentValue: T, currentIndex: number, iterable: Iterable<T>) => U,
  initialValue: U,
): U
⋮----
export function AT<V>(iterable: Iterable<V>, position = 0): V | undefined
⋮----
export function FIRST<V>(iterable: Iterable<V>): V | undefined
export function LAST<V>(iterable: Iterable<V>): V | undefined
⋮----
export function COUNT<V>(yieldable: Iterable<V>): number
⋮----
export function IS_GT<V extends number | bigint>(a: V, b: V): boolean
export function IS_LT<V extends number | bigint>(a: V, b: V): boolean
export function IS_GTE<V extends number | bigint>(a: V, b: V): boolean
export function IS_LTE<V extends number | bigint>(a: V, b: V): boolean
⋮----
export function INITIAL_SET<T>(): Set<T>
⋮----
export function COMPARE_SETS<T>(a: Set<T>, b: Set<T>)
⋮----
type ObjectEntry<T> = {
  [K in keyof T]: readonly [K, T[K]];
}[keyof T];
⋮----
type ObjectEntryKV<T> = {
  [K in keyof T]: { key: K; value: T[K] };
}[keyof T];
⋮----
export function OBJECT_PREFIX<T extends
⋮----
export function ARRAY_FORCED<T>(singleOrArray: T | T[] | null | undefined): T[]
````

## File: packages/utils/src/jwt.ts
````typescript
export function JWT_DECODE_PAYLOAD(token: string): unknown
````

## File: packages/utils/src/promise.ts
````typescript
export class PromisePool<T>
⋮----
public constructor(
⋮----
public async add(promise: () => Promise<T>): Promise<void>
⋮----
public async flush(): Promise<T[]>
⋮----
public async mapArray<In>(array: In[], fn: (element: In, index: number, array: In[]) => Promise<T>): Promise<T[]>
````

## File: packages/utils/src/string.ts
````typescript
import type { Maybe } from "./maybe";
⋮----
export function FORMAT(fmt: string, ...args: any[]): string
⋮----
export function HUMANIZE(string: string): string
⋮----
export function PAD(n: string | number, places = 2)
⋮----
export function IS_STRING(something: unknown): something is string
⋮----
export function STRING_DIFF(prev: string, next: string): string
⋮----
// If the line only exists in the first string, return it with a minus sign
⋮----
// If the line only exists in the second string, return it with a plus sign
⋮----
// If the line exists in both strings but is different, return both versions
⋮----
// Join the results back into a single string and return it
⋮----
.filter((line) => line.trim().length > 0) // remove empty lines
⋮----
export function STRINGIFY_SAFE(obj: any, space?: string | number | undefined)
⋮----
function STRINGIFY_SAFE_FN(_key: string, value: any)
⋮----
export function TITLE_CASE(string: string): string
⋮----
/**
 * Truncate a string to a certain length (no ellipsis).
 */
export function TRUNCATE(str: string, len: number)
⋮----
/**
 * Truncate a string to a certain length and add an ellipsis. With ellipsis the result will never surpass len chars.
 */
export function TRUNCATE_ELLIPSIS(str: string, len: number, ellipsis: Maybe<string> = "...")
⋮----
/**
 * Remove break lines and extra spaces.
 */
export function STRING_INLINE(text: string): string
⋮----
/**
 * Remove accents, ñ and special chars.
 * https://ricardometring.com/javascript-replace-special-characters
 * https://tonsky.me/blog/unicode/#:~:text=are%20four%20forms%3A-,NFD,-tries%20to%20explode
 */
export function STRING_NORMALIZE(string: string,
⋮----
export function BASE64_ENCODE(str: string): string
export function BASE64_DECODE(str: string): string
⋮----
export function LEVENSHTEIN(a: string, b: string): number
⋮----
export function SUGGESTIONS_FIND(path: string, candidates: string[],
⋮----
export function INITIALS_OF(name: string): string
⋮----
export function STRING_MIN(...args: [string, ...string[]]): string;
export function STRING_MIN(...args: string[]): string | null;
export function STRING_MIN(...args: string[]): string | null
⋮----
export function STRING_MAX(...args: [string, ...string[]]): string;
export function STRING_MAX(...args: string[]): string | null;
export function STRING_MAX(...args: string[]): string | null
````

## File: packages/utils/src/temporal.ts
````typescript
import { Temporal } from "temporal-polyfill";
import { FIBONACCI, NUMBER } from "./number";
⋮----
export type TemporalValue = Temporal.ZonedDateTime | Temporal.PlainDateTime | Temporal.PlainDate;
⋮----
function ISO(date: string | Date): string
⋮----
export function TEMPORAL(date: string | Date | TemporalValue | null, timezone = TZ): Temporal.ZonedDateTime
⋮----
export function TEMPORAL_NOW(timezone = TZ): Temporal.ZonedDateTime
⋮----
export function TEMPORAL_PLAINDATE(date: string | Date | null, timezone = TZ): Temporal.PlainDate
⋮----
export function TEMPORAL_PLAINDATETIME(date: string | Date | null, timezone = TZ): Temporal.PlainDateTime
⋮----
export function INSTANT_NOW(): Temporal.Instant
⋮----
export type InstantInput =
  | Temporal.Instant
  | Temporal.ZonedDateTime
  | Temporal.PlainDateTime
  | Date
  | number
  | bigint
  | string;
⋮----
export function INSTANT_FROM(input: InstantInput): Temporal.Instant
⋮----
export function TEMPORAL_PLAINDATE_REPRESENTATIVE(options: {
  year?: number;
  month?: number;
  day?: number;
}): Temporal.PlainDate
⋮----
export function TEMPORAL_DISPLAY_MONTH(
  locale: Intl.LocalesArgument,
  date: Temporal.PlainDate | Temporal.ZonedDateTime,
): string
⋮----
export function TEMPORAL_TO_SQL(date: TemporalValue)
⋮----
export function TEMPORAL_PARTS(date: TemporalValue)
⋮----
export function TEMPORAL_PARTS_PADDED(date: TemporalValue)
⋮----
export type TemporalZonedDateTime = Temporal.ZonedDateTime;
⋮----
export function DURATION_FROM_SQL(interval: string): Temporal.Duration
⋮----
export function MIN_TEMPORAL_PD(...args: [Temporal.PlainDate, ...Temporal.PlainDate[]]): Temporal.PlainDate;
export function MIN_TEMPORAL_PD(...args: Temporal.PlainDate[]): Temporal.PlainDate | null;
export function MIN_TEMPORAL_PD(...args: Temporal.PlainDate[]): Temporal.PlainDate | null
⋮----
export function MAX_TEMPORAL_PD(...args: [Temporal.PlainDate, ...Temporal.PlainDate[]]): Temporal.PlainDate;
export function MAX_TEMPORAL_PD(...args: Temporal.PlainDate[]): Temporal.PlainDate | null;
export function MAX_TEMPORAL_PD(...args: Temporal.PlainDate[]): Temporal.PlainDate | null
⋮----
export type TemporalTruncateUnit = Temporal.DateUnit | Temporal.TimeUnit;
⋮----
export function TEMPORAL_TRUNCATE<T extends TemporalValue>(date: T, truncate: TemporalTruncateUnit): T
⋮----
export type BaseBackoff = Temporal.Duration | Temporal.DurationLike | string;
⋮----
export function TEMPORAL_DURATION_SCALE(duration: Temporal.Duration, factor: number): Temporal.Duration
⋮----
export function FIBONACCI_BACKOFF(
  attempts: number,
  timestamp: Temporal.Instant,
  base: Temporal.Duration | Temporal.DurationLike | string = { minutes: 1 },
): Temporal.Instant
````

## File: scripts/development/exe-dev-setup.sh
````bash
set -e
cd "$(git rev-parse --show-toplevel)"
if [ -z "${EXE_HOST:-}" ]; then
  HN="$(hostname | tr '[:upper:]' '[:lower:]')"
  case "$HN" in
    *.exe.xyz) EXE_HOST="$HN" ;;
    *)         EXE_HOST="${HN}.exe.xyz" ;;
  esac
fi
echo "→ exe.dev host: ${EXE_HOST}"
BASE=3000
APP_PORT=$((BASE + 0))
STUDIO_PORT=$((BASE + 4))
INSTANCE_KEY="exe-$(printf '%s' "$EXE_HOST" | tr -cd 'a-z0-9-' | cut -c1-40)"
# Site URL embedded in auth emails / used as redirect allow-list base.
export SUPABASE_AUTH_SITE_URL="https://${EXE_HOST}:${APP_PORT}"
# --- Patch supabase/config.toml: ports into the 3000-range, project_id, redirect allow-list ---
BASE=$BASE INSTANCE_KEY=$INSTANCE_KEY EXE_HOST=$EXE_HOST python3 - <<'PYEOF'
import re, os
base = int(os.environ['BASE'])
instance_key = os.environ['INSTANCE_KEY']
exe_host = os.environ['EXE_HOST']
path = 'packages/supabase/supabase/config.toml'
with open(path) as f:
    lines = f.readlines()
section = None
out = []
for line in lines:
    m = re.match(r'^\[([a-z_.]+)\]\s*$', line)
    if m:
        section = m.group(1)
    if re.match(r'^project_id\s*=', line):
        line = f'project_id = "{instance_key}"\n'
    elif section == 'api'       and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+1}\n'
    elif section == 'db'        and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+2}\n'
    elif section == 'db'        and re.match(r'^shadow_port\s*=', line): line = f'shadow_port = {base+3}\n'
    elif section == 'studio'    and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+4}\n'
    elif section == 'inbucket'  and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+5}\n'
    elif section == 'analytics' and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+6}\n'
    out.append(line)
    # Add this VM's host to the auth redirect allow-list (idempotent vs the whole
    # file, since config.toml is skip-worktree'd and this script re-runs). Sits right
    # after the existing lvh.me entry so the local default keeps working too.
    redirect = f'  "https://{exe_host}:*/**",\n'
    already = any(f'"https://{exe_host}:*/**"' in l for l in lines)
    if '"https://lvh.me:*/**"' in line and not already:
        out.append(redirect)
with open(path, 'w') as f:
    f.writelines(out)
print(f"config.toml patched: project={instance_key} API:{base+1} DB:{base+2} Studio:{base+4}")
print(f"  redirect allow-list += https://{exe_host}:*/**")
PYEOF
# Per-VM port/project edits are intentional; keep them out of `git status`.
git update-index --skip-worktree packages/supabase/supabase/config.toml || true
# --- Start Supabase (fresh project_id => migrations + seed applied on init) ---
RUNNING=$(docker ps -q --filter "label=com.supabase.cli.project=${INSTANCE_KEY}" 2>/dev/null | wc -l | tr -d ' ')
if [ "$RUNNING" -gt 0 ]; then
  echo "Supabase ${INSTANCE_KEY} already running, skipping db:start"
else
  PORT=$BASE pnpm db:start
fi
EXE_HOST=$EXE_HOST PORT=$BASE pnpm run -w db:env:development
cat <<EOF
✅ exe.dev dev environment ready.
  App     →  https://${EXE_HOST}:${APP_PORT}      (run: pnpm --filter @apps/platform dev:exe)
  Studio  →  https://${EXE_HOST}:${STUDIO_PORT}
  Mailbox →  https://${EXE_HOST}:$((BASE + 5))
Ports are PRIVATE by default (only users with VM access, logged into exe.dev).
To expose the app publicly:  ssh exe.dev share set-public ${EXE_HOST%%.*} && ssh exe.dev share port ${EXE_HOST%%.*} ${APP_PORT}
Raw psql (proxy is HTTP-only): ssh -L 5432:localhost:$((BASE + 2)) ${EXE_HOST} -l exedev
EOF
````

## File: scripts/repomix-skill-rename.mjs
````javascript
// Rewrites the project name in the generated `codebase` reference skill.
//
// repomix's local `--skill-generate` has no way to set the project name: it
// always uses `toTitleCase(basename(cwd))` (see repomix `skillUtils.ts`
// `generateProjectName`). In a Conductor worktree the cwd is the ephemeral
// instance name (e.g. "karachi-v2"), so the skill leaks "Karachi V2" into its
// frontmatter description and H1 instead of the real project name.
//
// There is no `--skill-project-name` CLI flag (the `skillProjectName` field is
// wired only for the remote-URL path), so we fix it after generation: read the
// name repomix actually emitted, then replace every occurrence with the
// canonical display name across the skill files.
⋮----
// Canonical display name — must match the AGENTS.md title, not the folder/worktree.
⋮----
// Extract the name repomix generated from the description template
// (`generateSkillDescription` in repomix `skillUtils.ts`).
⋮----
continue; // references/* set may vary by repomix version
````

## File: scripts/skills-setup.mjs
````javascript
/**
 * Materializes skills into the agent stores on install — no network, no cloning.
 *
 * Sources are committed: first-party `my-*` + `codebase` in `skills/`, vendored
 * third-party in `skills-third-party/`. Each is symlinked into both agent stores
 * (`.agents/skills/` for Codex/Cursor/Copilot/OpenCode/Zed, `.claude/skills/` for
 * Claude Code), which stay gitignored. Also seeds `.env.local` from `.env.example`.
 *
 * We vendor third-party skills (committed) instead of `skills experimental_install`
 * because that clones every repo serially — slow. Refresh them with the `skills`
 * CLI and copy the result back into `skills-third-party/` (see AGENTS.md).
 *
 * TODO: once `skills install` is stable (no `experimental_` prefix) and clones in
 * parallel / fast enough, reconsider dropping the vendored `skills-third-party/`
 * and restoring third-party from `skills-lock.json` at install instead.
 *
 * Usage: pnpm skills:install (runs automatically via postinstall)
 */
⋮----
// Seed .env.local once — never clobber an existing one.
⋮----
continue; // source dir may not exist (e.g. no third-party yet)
⋮----
await fs.rm(link, { recursive: true, force: true }); // replace stale symlink or copy
⋮----
// ponytail: cheap self-check — a broken target means the symlink web is wrong.
````

## File: skills/my-conventions/SKILL.md
````markdown
---
name: my-conventions
description: Repository-specific cross-cutting TypeScript/TSX conventions — barrels, ~/ imports, typed route helpers, next-zod-route, bracket notation for external data, code style/naming, hooks, components, lint/build, file naming, commits, generated files. Read BEFORE writing any TS/TSX in apps/platform or packages/*.
---

# TS/TSX Conventions

Cross-cutting rules for all TypeScript/TSX in the repo. Subsystem rules live elsewhere:
SQL → `my-supabase`, GraphQL → `my-graphql`/`my-graphy`, i18n → `my-i18n`, auth/proxy → `my-auth`/`my-proxy`.

## No barrel index files

Never create `index.ts` (or `index.tsx`) whose sole purpose is re-exporting. Import directly from the source file.

## Imports

- Use `~/` alias for imports within `apps/platform/` (e.g. `~/lib/...`, `~/hooks/...`).
- Workspace packages: `@packages/ui-common`, `@packages/supabase`, `@packages/react-email`, `@packages/react-pdf`, etc.
- App code in `apps/platform/`; reusable logic in `@packages/*`.
- Never use `as any`.

## Typed route helpers (Next.js 16) — REQUIRED

**Always use `PageProps<"route">` for `page.tsx`, `LayoutProps<"route">` for `layout.tsx`, `RouteContext<"route">` for `route.ts`.** With `typedRoutes: true` in `next.config.ts`, Next.js generates these as global types under `.next/dev/types/`. Use instead of hand-rolling `{ params: Promise<...> }` — stays in sync with the actual file path, so renaming a folder fails type-check on next `pnpm build:dry`.

There is **no `locale` route param** — locale comes from a cookie/header, so `params` only ever holds real dynamic segments.

```ts
// page.tsx — dynamic segments come from props.params
export default async function Page(props: PageProps<"/t/[tenant_slug]/[organization_id]">) {
  const { tenant_slug, organization_id } = await props.params;
  const sp = await props.searchParams;
  const tab = SINGLE(sp["tab"]) ?? "";
}

// layout.tsx — static route, no params to read
export default async function Layout(props: LayoutProps<"/home">) {
  return <main>{props.children}</main>;
}

// route.ts
export async function GET(request: NextRequest, ctx: RouteContext<"/auth/callback">) {
  // const { ... } = await ctx.params; // only when the route has dynamic segments
}
```

`searchParams` is `Record<string, string | string[] | undefined>` (URL params can repeat). Narrow with `SINGLE(sp["foo"])` from `@packages/utils/array` to get the first value as `string | undefined`.

**Exception:** `page.tsx` / `layout.tsx` not `async` and not accessing `params`/`searchParams` — no typed props needed. But make it `async` if it needs any server-side capability.

## API route handlers — validate input with `next-zod-route`

For `route.ts` handlers consuming dynamic path params, query, or a JSON body, validate with **`next-zod-route`** instead of hand-parsing — it returns 400 on bad input and hands the handler fully-typed `context.params` / `context.query` / `context.body`. Param schema keys must match the `[segment]` folder names. Use `z.guid()` (loose, version-agnostic — matches the DB's `internal.is_uuid`) for uuid path params, **not** `z.uuid()` (which rejects non-RFC-version uuids like the seed's). The handler may return any `Response` (e.g. a streamed image).

```ts
// app/api/v1/organizations/[organization_id]/avatar/route.ts
export const GET = createZodRoute()
  .params(z.object({ organization_id: z.coerce.number().int().positive() }))
  .handler(async (_request, context) => {
    return streamPublicAvatar(/* … context.params.organization_id … */);
  });
```

Routes whose "invalid input" is a user-facing **redirect** (e.g. the auth `callback`/`confirm` flows redirecting to `/auth/error`) deliberately keep hand-parsing — next-zod-route's 400 doesn't fit that UX.

## Bracket notation for external data

Reading properties off objects from outside the program (GraphQL/REST responses, parsed JSON, file contents, webhook payloads, MCP tool results) → use bracket notation, not dot access.

```ts
// External data → brackets
const organization = edge["node"];
const tenantSlug = organization["tenants"]?.["tenant_slug"];
const slug = params["tenant_slug"]; // route params come from the request
const body = await request.json();
const email = body["email"];

// Class instances / library methods → dot
const { data, error } = await supabase.auth.getUser();
const session = await graphy.query({ query: DashboardPageQuery });
```

Brackets mark "this shape is contractual with another system" — distinguishes from class properties/methods owned by the program. TS narrowing works through brackets; no type-safety cost. Don't introduce intermediate `.map()`/`.filter()` arrays to extract a key — iterate the original collection and bracket from there.

**Mock/fixture data counts as external.** Objects from `~/lib/*-mock.ts` (and any fixture standing in for DB rows / API responses) are contractual with the future backend — read with brackets too (`agency["name"]`, `aff["email"]`). Destructuring top-level is fine — `const { org } = item` — then bracket leaf reads: `org["name"]`.

**pg_graphql connections (`edges`/`node`) — external too.** Bracket `["edges"]` / `["node"]` (never `.edges`/`.node`), iterate `["edges"]` once at the point of use, and **never** cast leaf reads (`as number`/`as string`) — the generated types already type them; use the value directly or `?? fallback` for nullables. No throwaway `.map(e => e.node).map().filter()` chains.

```tsx
// ✅ iterate edges in place, brackets, no casts, no intermediate arrays
{data?.["presets"]?.["edges"].map((edge) => {
  const p = edge["node"];
  return <li key={p["permissionPresetId"]}>{p["permissionPresetName"]}</li>;
})}

// ❌ throwaway arrays + dot access + casts
const presets = (data?.["presets"]?.edges ?? []).map((e) => e.node).map((p) => ({ id: p["permissionPresetId"] as number }));
```

## Links — bare paths, never pass `locale`

Locale is **not** a URL segment — the proxy resolves it from a cookie/header. So links are plain paths and **never** carry a locale. Do **not** pass `locale` into `ROUTE`/`ROUTE_HREF` (the helper strips it anyway — `delete query["locale"]` in `apps/platform/lib/route.ts`), and do **not** thread `locale` / `localePrefix` / a pre-built `base` string from a server `page.tsx` into a client component just to build hrefs. (Locale dictionary patterns: see `my-i18n`.)

```tsx
// ✅ build hrefs with ROUTE and the real params only — no locale
const inviteHref = ROUTE("/t/[tenant_slug]/[organization_id]/settings/members/new", {
  tenant_slug: agency["slug"],
  organization_id,
});
<Link href={inviteHref}>…</Link>
<Link href={ROUTE("/agencies/create")}>…</Link>

// ❌ never — locale is dead here and gets stripped
<Link href={ROUTE("/agencies/create", { locale })}>…</Link>
```

## Code Style

- Biome.js handles formatting/linting — don't fight it.
- Follow existing patterns in the codebase.
- English for code/comments; user-facing strings in locale files (see `my-i18n`).
- **Pure functions → `UPPER_CASE`.** Pure = deterministic on inputs, no observable side effects (no I/O, no DB/network/filesystem, no `redirect()`, no argument mutations, no `Date.now()`/`Math.random()`). Side-effectful or async-with-I/O functions stay `camelCase`. Constants stay `UPPER_CASE`. React components stay PascalCase regardless.
- **Server Actions → `action*` prefix.** Every exported function from a `"use server"` file gets the `action` prefix (`actionSetPassword`, `actionUpdateEmail`, `actionDeletePasskey`). The prefix replaces verbs like `set`/`update`/`save`/`do` — write `actionSetPassword`, not `actionDoSetPassword`. Applies to both `next-safe-action` actions and `formAction()` adapters (`actionSignOutForm`).
- **Named functions, never arrow functions.** Use `function myFn() {}` or `export function myFn() {}`, never `const myFn = () => {}`. Named functions are hoisted and show up in stack traces. Exception: short inline callbacks in `.map()` / `.filter()`.
- **Tailwind: prefer native scale sizes over arbitrary px.** Width/height/size/gap/padding → use the scale (`size-5`, `h-9`, `gap-2`) including v4 fractional steps like `size-4.5` (18px) — not arbitrary `h-[18px]`. Typography too: font-size scale (`text-xs`, `text-sm`, `text-2xl`) over `text-[13px]`. A recurring off-scale size → add a named `@theme` token in `apps/platform/styles/globals.css` (follow the `--text-tiny: 0.6875rem` precedent) and use it as `text-tiny`. Arbitrary bracket values are reserved for things scale and tokens genuinely can't express.
- **Map a discriminant to values with a keyed lookup, not `let` + `if/else`.** Several values varying together by one key → return from a `Record`-typed helper indexed by key — `const head = CONSOLE_HEAD(t)[tab]` — not mutable `let`s reassigned in an `if/else if` chain.
- **JSDoc + `@example` for new exports.** Small JSDoc with at least one `@example` on new functions, components, classes, constants. Skip `page.tsx` and `layout.tsx` — framework entry points, not reusable exports.
  ```ts
  /**
   * Builds the full apex URL for the given path.
   * @example APEX_URL("/home") // "https://example.com/home"
   */
  export function APEX_URL(path: string): string { … }
  ```
- **Logging pattern.** At the top of each file declare a namespaced logger mirroring the file's route path:
  ```ts
  const log = debug("app:t:[tenant_slug]:[organization_id]:settings:members:actions")
  ```
  Always call a method — `log.error(…)`, `log.warn(…)`, `log.info(…)` — never bare `log(…)`. Always prefix the message with `[functionName]` or `[handlerName]`:
  ```ts
  log.error("[actionInviteMember] permission check failed: %o", { organization_id, error })
  ```

## Hooks & Abstractions

**Avoid thin wrappers.** A hook wrapping a single SDK call adds noise without clarity. Prefer direct code:

```ts
// ❌ Thin wrapper — unnecessary indirection
function useSetEmail() {
  const [error, setError] = useState(null);
  async function setEmail(email: string) {
    try { await supabase.auth.updateUser({ email }); }
    catch (e) { setError(e.message); }
  }
  return { setEmail, error };
}

// ✅ Call the SDK directly in the component, handle error in place
async function onSubmit(email: string) {
  try { await supabase.auth.updateUser({ email }); }
  catch (e) { setError(e.message); }
}
```

**Encapsulate only when genuinely reusable.** Create a hook when:
- The same logic + state pattern repeats across 2+ components.
- It reduces boilerplate significantly (e.g. an OTP send/verify pair with error/pending state).
- It's "headless" — owns behavior but returns primitives for the caller to render.

If a package already does it (react-use, usehooks-ts, etc.), prefer the package. Don't invent.

## Components used only once stay in the same file

Don't extract a component to its own file unless reused in 2+ places. Single-use components belong inline in the page/layout that owns them.

**Exception:** a component long enough to hurt readability of the parent (>80 lines) → move to a separate file as an implementation detail. Comment why: `// Local component — used only in /auth/page.tsx`.

## Lint + Build (run in parallel)

After changes, run these concurrently — independent, safe to parallelize:

```bash
pnpm format:apply-unsafe  # Biome auto-fix including unsafe transforms
pnpm build:dry            # Turbo type-check / build without emitting output
```

**`build:dry` false positives — `PageProps` / `LayoutProps` / `RouteContext` not found:** these globals are generated by `next dev` into `.next/dev/types/`. Without a running dev server, `build:dry` emits ~40 `Cannot find name 'PageProps'` errors. Expected — not real failures. For clean output, run `pnpm dev` first (writes the type files), then `build:dry`.

**New route → run route typegen, don't rely on `pnpm dev`:** after **adding a new route folder** (e.g. `app/oauth/consent/page.tsx`), `tsc`/`build:dry` fails with `Type '"/oauth/consent"' does not satisfy the constraint 'AppRoutes'`. `tsc` reads the **build** route union in `.next/types/routes.d.ts`, which is separate from the dev one in `.next/dev/types/` — a running dev server alone does **not** refresh it. Regenerate it explicitly (same command as the `postinstall` script):

```bash
cd apps/platform && NODE_ENV=development pnpm exec next typegen
```

Then `PageProps<"/new-route">` and the `AppRoutes` union pick up the new path and `build:dry` passes.

## File & Script Naming

Use `noun-verb` order, not `verb-noun`: `skill-rename`, `alert-create`, `user-import`. Domain first, action second.

## Commit Messages

Conventional Commits with scope: `type(scope): description`
- `feat(auth): add passkey registration`
- `fix(proxy): handle subdomain redirect on auth routes`
- `chore(supabase): regenerate types after schema migration`

## Generated Files

Stage normally in git. Ignore when writing commit messages:
- `packages/supabase/src/types.ts` — Supabase DB types.
````

## File: skills/my-pr-quick/SKILL.md
````markdown
---
name: my-pr-quick
description: Use when the user wants a fast PR (e.g. /pr-quick, "haz un PR rápido") and you must NOT burn tokens reading full diffs.
---

# PR Quick

**Rule: never read full diffs or files.** Use only `git status --short` + `git diff --stat` — that's enough to write the commit and PR.

```bash
git status --short && git diff --stat && git branch --show-current
# if on main: git checkout -b <type>/<kebab-desc>
git add -A
git commit -m "$(cat <<'EOF'
feat(scope): imperative summary

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
git push -u origin HEAD
gh pr create --title "<commit subject>" --body "$(cat <<'EOF'
## Summary
- one bullet per change (from --stat)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Paste the PR URL. Done.

Red flag: about to run full `git diff` or `Read` a file → stop, use `--stat`.
````

## File: skills/my-react-email/SKILL.md
````markdown
---
name: my-react-email
description: Repository-specific React Email template patterns in @packages/react-email, including exports, local preview, Rosetta locale injection, props, and rendering boundaries.
---

# React Email

Package currently provides templates + preview. Delivery provider is not wired in app.
Do not claim Resend sending exists until code/dependency is added.

## Source map

- Package: `packages/react-email`
- Template: `src/templates/welcome_email.tsx`
- Preview: `pnpm --filter @packages/react-email dev` at port `7101`
- Export pattern: `@packages/react-email/templates/<file>`

## Template shape

```tsx
export interface WelcomeEmailProps {
  empleadoNombre: string;
  empresaNombre: string;
  loginUrl: string;
  locale?: string;
}

export function WelcomeEmail({
  locale = "es-CL",
  ...props
}: WelcomeEmailProps) {
  return (
    <LocaleProvider locale={locale}>
      <WelcomeEmailContent {...props} />
    </LocaleProvider>
  );
}

export default WelcomeEmail;
```

Provider + consumer split required so `useLocale`/`useRosetta` sees injected locale.

## Dictionaries

Base locale defines shape:

```ts
const LOCALE_ES = {
  preview: "Bienvenido/a a {{empresaNombre}}",
  heading: "Bienvenido/a, {{empleadoNombre}}",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    preview: "Welcome to {{empresaNombre}}",
    heading: "Welcome, {{empleadoNombre}}",
  } satisfies typeof LOCALE_ES,
};
```

Inside content:

```tsx
const locale = useLocale();
const { t } = useRosetta(LOCALES);
return <Html lang={locale}>...</Html>;
```

## Preview props

```ts
WelcomeEmail.PreviewProps = {
  empleadoNombre: "María González",
  empresaNombre: "Constructora Ejemplo SpA",
  loginUrl: "https://lvh.me:7003",
  locale: "es-CL",
} satisfies WelcomeEmailProps;
```

Keep preview realistic and local-safe.

## Styling/components

Use `@react-email/components`: `Html`, `Head`, `Preview`, `Tailwind`, `Body`, `Container`,
`Section`, `Heading`, `Text`, `Button`, `Hr`. Email CSS support is limited; prefer simple
Tailwind classes and table-compatible React Email primitives.

## Adding template

1. Add `packages/react-email/src/templates/<snake_name>.tsx`.
2. Define typed props + locale.
3. Add base dictionary and typed translations.
4. Add `PreviewProps`.
5. Export named + default component.
6. Preview, then run format/build.

Package wildcard export exposes file automatically. No barrel.

## Sending boundary

When delivery is added, server-only route/action imports template and renderer/provider.
Never expose provider API key client-side. Keep sending orchestration in app or dedicated
package, not inside visual template.
````

## File: skills/my-react-pdf/SKILL.md
````markdown
---
name: my-react-pdf
description: Repository-specific @react-pdf/renderer templates, react-pdf-tailwind styling, Rosetta locale injection, markdown rendering, preview app, and server rendering.
---

# React PDF

Package renders templates and provides webpack preview. App download route is not currently
wired.

## Source map

- Templates: `packages/react-pdf/src/templates/*.tsx`
- Tailwind adapter: `src/lib/tw.ts`
- Renderer: `src/render.ts`
- Markdown: `src/components/markdown.tsx`
- Preview router/app: `src/components/router.tsx`, `src/App.tsx`
- Dev: `pnpm --filter @packages/react-pdf dev` at `7102`

## Template

```tsx
export interface HelloWorldTemplateProps {
  locale?: string;
}

export function HelloWorldTemplate({
  locale = "en",
}: HelloWorldTemplateProps) {
  return (
    <LocaleProvider locale={locale}>
      <HelloWorldContent />
    </LocaleProvider>
  );
}

function HelloWorldContent() {
  const { t } = useRosetta(LOCALES);
  return (
    <Document title="..." author="SaaS Template">
      <Page size="A4" style={tw("bg-white text-xs")}>
        <View><Text>{t("hero.title")}</Text></View>
      </Page>
    </Document>
  );
}
```

Use React PDF primitives only: `Document`, `Page`, `View`, `Text`, `Link`, `Image`, etc.
No DOM elements. `@react-pdf/renderer` has no `Table` primitive; build tables with Views.

## Styling

```ts
import { tw } from "../lib/tw";

<View style={tw("flex-row gap-3 border border-gray-200 p-4")} />
<View style={{ ...tw("h-2 rounded"), width: "75%", backgroundColor: "#1e40af" }} />
```

`tw()` uses `react-pdf-tailwind` + `clsx`. React PDF CSS differs from browser CSS; verify in
preview. Use inline style for dynamic values.

## Fixed footer/page count

```tsx
<View fixed style={tw("absolute bottom-5 left-10 right-10")}>
  <Text render={({ pageNumber, totalPages }) =>
    `${pageNumber} / ${totalPages}`
  } />
</View>
```

## Render server-side

```ts
import { renderPdf } from "@packages/react-pdf/render";
import { HelloWorldTemplate } from
  "@packages/react-pdf/templates/helloworld";

const instance = renderPdf(<HelloWorldTemplate locale="es-CL" />);
const buffer = await instance.toBuffer();
```

Route must authenticate, authorize tenant/org data, then return `application/pdf`. Never trust
record ID without RLS/permission check.

## Markdown

Use bundled `Markdown` component for supported mdast nodes. See
`templates/markdown-demo.tsx`. Unsupported markdown must be added deliberately to renderer.

## Adding template

1. Add template file.
2. Use provider/consumer split for locale.
3. Export props + template + optional default props.
4. Register preview route in `src/components/router.tsx`.
5. Test multiple pages, wrapping, long content, locale.
6. Run format/build.

No barrel exports; package wildcard handles direct paths.
````

## File: skills/psql-query/SKILL.md
````markdown
---
name: psql-query
description: Run SQL against the local Supabase Postgres for debugging, inspection, and authorized patches. Use when the user asks to query the DB, inspect data, check RLS, run plpgsql diagnostics, or apply manual SQL changes. Reads execute freely; writes require explicit approval.
---

# psql-query — local Postgres queries

## Connection

The local Postgres URL lives in the `DATABASE_URL` env var, injected by Codex from `.Codex/settings.local.json` (set by `pnpm db:env:development`). Use it directly:

```bash
psql "$DATABASE_URL" -c "select current_database(), current_user;"
```

The DB user `postgres` is the local superuser — RLS is bypassed by default on this connection. To test policies, use `set local role authenticated` + `set local request.jwt.claims to '…'` inside a transaction (see Patterns).

### If `$DATABASE_URL` is empty

The variable is loaded at Codex session start, so a freshly-provisioned workspace may not have it yet. Recover with **either**:

- **One-off (current session):** resolve inline.
  ```bash
  export DATABASE_URL=$(pnpm --filter @packages/supabase exec supabase status -o env 2>/dev/null | awk -F= '/^DB_URL=/{gsub(/"/,"",$2); print $2}')
  ```
- **Persistent (future sessions):** run `pnpm db:env:development` to (re)write `.Codex/settings.local.json` and `.env.development.local`, then restart Codex.

If the inline resolver also returns empty, Supabase isn't running — `pnpm db:start` first.

## Always read the schema first

The single source of truth for tables, policies, triggers, helper functions, and grants is:

```
packages/supabase/supabase/migrations/00000000000000_schema.sql
```

Read the relevant sections before composing any non-trivial query. Tip: `Grep` for the table name there instead of `\d` in psql — the file shows comments, constraints, and intent that `\d` strips. Use psql introspection (`\dt`, `\d+ table_name`, `\df viewer_*`, `\dp`) only as a secondary check or when investigating drift between schema file and live DB.

For RLS work also check `packages/supabase/supabase/tests/**/*.test.sql` for pgTAP examples of how callers are mocked.

## Read queries — execute freely

Run without asking when:

- Statement is `SELECT` (including CTEs, `EXPLAIN`, `EXPLAIN ANALYZE` on SELECT), `SHOW`, `\d`/`\df`/`\dp` meta-commands.
- Calling only `IMMUTABLE` or `STABLE` functions (most `viewer_*` helpers, `now()`, `jsonb_*`, `auth.uid()`, formatting/cast helpers).
- Wrapped in `begin; … rollback;` — even mutating statements are safe when the transaction is guaranteed to roll back. Use this pattern to dry-run a write and inspect what it would have touched.

```bash
psql "$DATABASE_URL" -c "select tenant_id, count(*) from public.organizations group by 1;"

# Multi-line: heredoc
psql "$DATABASE_URL" <<'SQL'
explain analyze
select * from public.memberships m
join public.profiles p on p.profile_id = m.profile_id
where m.organization_id = 1;
SQL

# Dry-run a write to see what it would change
psql "$DATABASE_URL" <<'SQL'
begin;
update public.profiles set onboarded = true where profile_id = '...';
select profile_id, onboarded from public.profiles where profile_id = '...';
rollback;
SQL
```

## Write operations — require approval

A write is anything that persists state past commit:

- DML: `INSERT`, `UPDATE`, `DELETE`, `MERGE`, `TRUNCATE`, `COPY ... FROM`.
- DDL: `CREATE`, `ALTER`, `DROP`, `GRANT`, `REVOKE`, `COMMENT`, `REFRESH MATERIALIZED VIEW`.
- Calling a `VOLATILE` function with observable side effects (most `auth.admin_*`, anything that mutates a table, `setval`, advisory locks held past txn).
- Sequence mutation (`setval`, `nextval` when persisted).
- Any `SECURITY DEFINER` function unless you have read its body and confirmed it's pure read.

**Before running a write you must:**

1. Show the exact SQL to the user.
2. State the affected scope in one line: rows targeted (with a `select count(*)` from the same `WHERE`), tables, irreversibility.
3. Wait for explicit approval — accepted phrases: "ok", "go", "approve", "yes", "dale". A thumbs-up emoji counts. Silence does not.
4. Prefer `begin; … commit;` with a guard query inside the transaction (`select` the rows you just changed) so you can show the diff before commit.

**Per-session approval:** if the user says "approved for this session" (or "session approval", "carta blanca", or similar), record that and skip per-action approval for writes for the rest of the conversation. Still show the SQL before each run. The approval does not carry across sessions.

**Always require fresh approval, even mid-session:**

- `DROP`, `TRUNCATE`, `DELETE` without a `WHERE`, `ALTER TABLE ... DROP COLUMN`, anything touching `auth.*` or `storage.*` schemas, anything inside a function marked `SECURITY DEFINER` that mutates, and any statement affecting >1000 rows.

**Schema changes belong in the migration file, not ad-hoc psql.** If the change should persist across `pnpm db:reset`, edit `00000000000000_schema.sql` and reset instead of patching the live DB. Only use direct DDL for one-off diagnostic objects (a temp view, an `EXPLAIN`-only index) that you also drop in the same session.

## Patterns

### Impersonate an authenticated user (test RLS)

```bash
psql "$DATABASE_URL" <<'SQL'
begin;
set local role authenticated;
set local request.jwt.claims to '{"sub":"<profile_uuid>","app_metadata":{"tenants":[{"id":1,"slug":"acme"}],"organizations":[{"id":1}]}}';
select * from public.organizations;  -- now filtered by RLS
rollback;
SQL
```

### Inspect a viewer_* helper

```bash
psql "$DATABASE_URL" -c "\df+ public.viewer_has_permission"
```

### Tail recent rows from a table

```bash
psql "$DATABASE_URL" -c "select * from public.memberships order by created_at desc limit 20;"
```

### Run a `.sql` file

```bash
psql "$DATABASE_URL" -f path/to/file.sql
```

## When psql is the wrong tool

- **Repeatable schema changes** → edit the migration file, `pnpm db:reset`, `pnpm generate:types`.
- **Type-safe app queries** → use the Supabase client / GraphQL via `@packages/graphy`. psql is for debugging and one-off patches, not application code.
- **RLS test you want to keep** → write it as pgTAP under `packages/supabase/supabase/tests/` and run with `pnpm test:db`.
- **Bulk data load** → use `\copy` from a vetted CSV, not 10k individual `INSERT`s.

## Output etiquette

- For wide tables, prefer `\x on` (expanded display) or `select` only the columns you need.
- Limit ad-hoc selects to `limit 50` unless the user asked for the full set — long psql output bloats context.
- When showing query results to the user, paste only the rows that matter; don't dump the whole table.
````

## File: .mcp.json
````json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
````

## File: pnpm-workspace.yaml
````yaml
packages:
  - apps/*
  - packages/*
onlyBuiltDependencies:
  - '@parcel/watcher'
  - '@vercel/speed-insights'
  - core-js
  - esbuild
  - protobufjs
  - sharp
  - supabase
overrides:
  zod: ^4.4.3
````

## File: apps/platform/app/(app)/a/[agency_slug]/access/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { Building2, Eye, Globe } from "lucide-react";
import type { Metadata } from "next";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { getRosetta } from "~/lib/i18n.server";
⋮----
type AccessOrg = { organization_id: number; organization_name: string; organization_slug: string | null };
⋮----
export async function generateMetadata(): Promise<Metadata>
⋮----
<AccessPill global label=
⋮----
className=
````

## File: apps/platform/app/(app)/a/[agency_slug]/team/team-list.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { BadgeCheck, Ban, Hourglass, type LucideIcon, RefreshCw, ShieldCheck, UserPlus, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { AffiliationState } from "~/lib/agencies";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionUpdateAffiliateMembership } from "../actions";
⋮----
export type TeamAffiliate = {
  agency_membership_id: number;
  profile_id: string;
  state: AffiliationState;
  name: string;
  email: string | null;
  is_self: boolean;
};
⋮----
type Translate = ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"];
⋮----
function run(operation: "revoke" | "reactivate")
⋮----
className=
⋮----
/** Inline status pill scoped to the team list. */
⋮----
<span className=
````

## File: apps/platform/app/(app)/a/[agency_slug]/tickets/actions.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { debug } from "~/lib/debug";
import { getRosetta } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";
````

## File: apps/platform/app/(app)/a/layout.tsx
````typescript
export default function AgencyLayout(props: LayoutProps<"/a">)
````

## File: apps/platform/app/(app)/home/account/_components/sections.ts
````typescript
import { Bell, Globe, Languages, Monitor, Palette, ShieldCheck, Trash2, User } from "lucide-react";
import type { ComponentType } from "react";
import { ROUTE_PATH } from "~/lib/route";
⋮----
export type AccountSectionId =
  | "profile"
  | "security"
  | "connections"
  | "sessions"
  | "notifications"
  | "theme"
  | "language"
  | "danger";
⋮----
export type AccountGroupKey = "account" | "security_group" | "danger_zone" | "preferences";
⋮----
export type AccountLabelKey =
  | "nav_profile"
  | "nav_security"
  | "nav_connections"
  | "nav_sessions"
  | "nav_notifications"
  | "nav_theme"
  | "nav_language"
  | "nav_danger";
⋮----
export type AccountSection = {
  id: AccountSectionId;
  labelKey: AccountLabelKey;
  groupKey: AccountGroupKey;
  Icon: ComponentType<{ size?: number; className?: string }>;
  danger?: boolean;
  todo?: boolean;
};
⋮----
export function ACCOUNT_SECTION_PATH(id: AccountSectionId): (typeof ACCOUNT_SECTION_PATHS)[AccountSectionId]
````

## File: apps/platform/app/(app)/home/account/danger/delete-account-dialog.tsx
````typescript
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui-common/shadcn/components/ui/dialog";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Lock, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionDeleteAccount } from "../actions";
⋮----
function onOpenChange(next: boolean)
⋮----
function onDelete()
⋮----
// Success redirects server-side (navigation in flight); only surface real errors.
⋮----
placeholder=
````

## File: apps/platform/app/(app)/home/account/notifications/push-permission.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { usePushPermission } from "~/hooks/use-push-permission";
import { useRosetta } from "~/lib/i18n.client";
````

## File: apps/platform/app/(app)/home/account/security/email/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { EmailForm } from "../email-form";
````

## File: apps/platform/app/(app)/home/account/security/passkeys/page.tsx
````typescript
import { createSupabaseServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { PasskeysList } from "../passkeys-list";
⋮----
href=
````

## File: apps/platform/app/(app)/home/account/security/password/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { PasswordForm } from "../password-form";
````

## File: apps/platform/app/(app)/home/account/security/phone/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { PhoneForm } from "../phone-form";
````

## File: apps/platform/app/(app)/home/account/actions.ts
````typescript
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isOAuthProvider, OAUTH_PROVIDER_IDS } from "~/app/auth/providers";
import { debug } from "~/lib/debug";
import { getServerLocale } from "~/lib/i18n.server";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { authedAction, formAction } from "~/lib/safe-action.server";
````

## File: apps/platform/app/(app)/home/inbox/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { InboxList } from "~/components/inbox/inbox-list";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
⋮----
export async function generateMetadata(props: PageProps<"/home/inbox">)
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/onboarding/state.server.ts
````typescript
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import type { TenantOnboardingState } from "./state";
⋮----
export async function getTenantOnboardingState(tenant_id: number): Promise<TenantOnboardingState>
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/onboarding/state.ts
````typescript
export type TenantOnboardingStepId = "tenant_logo" | "first_member";
export type TenantOnboardingStepStatus = "pending" | "done";
⋮----
export type TenantOnboardingState = {
  tenant_id: number;
  tenant_onboarded_at: string | null;
  steps: Record<TenantOnboardingStepId, TenantOnboardingStepStatus>;
};
⋮----
export function TENANT_COUNT_DONE(steps: TenantOnboardingState["steps"]): number
⋮----
export function TENANT_ONBOARDING_INCOMPLETE(state: TenantOnboardingState): boolean
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/organizations/create/page.tsx
````typescript
import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerTenantBySlug } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { CreateOrganizationForm } from "./create-form";
⋮----
export async function generateMetadata(): Promise<Metadata>
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/tenant/general/tenant-general-settings.tsx
````typescript
import { useGraphyMutation } from "@packages/graphy/react";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EntityLogoControls } from "~/components/entity-logo-controls";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
⋮----
async function onSave()
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/layout.tsx
````typescript
export default function SettingsLayout(
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/page.tsx
````typescript
import { redirect } from "next/navigation";
import { getServerLocale } from "~/lib/i18n.server";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
⋮----
export default async function SettingsIndexPage(props: PageProps<"/t/[tenant_slug]/[organization_id]/settings">)
````

## File: apps/platform/app/(marketing)/legal/[section]/page.tsx
````typescript
import { promises as fs } from "node:fs";
import path from "node:path";
import { URL_NEW } from "@packages/utils/url";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { APP_URL } from "~/lib/constants";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
⋮----
type LegalLocale = "es" | "en" | "pt";
type LegalSection = "terms" | "privacy" | "cookies" | "dpa" | "security";
⋮----
function toLegalLocale(locale: string): LegalLocale
⋮----
async function loadMarkdown(locale: LegalLocale, section: LegalSection): Promise<string | null>
⋮----
export function generateStaticParams()
⋮----
export async function generateMetadata(props: PageProps<"/legal/[section]">): Promise<Metadata>
⋮----
<Link href=
````

## File: apps/platform/app/api/[transport]/route.ts
````typescript
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { registerTools } from "~/lib/mcp/register";
import { mcpTokenVerify } from "~/lib/mcp/token";
````

## File: apps/platform/app/api/inbound/email/route.ts
````typescript
import { createHmac, timingSafeEqual } from "node:crypto";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { after, type NextRequest } from "next/server";
import { runAgentLoop } from "~/lib/conversations/agent/agent-loop";
import { resolveInbound } from "~/lib/conversations/inbound-resolver";
import { debug } from "~/lib/debug";
⋮----
function verifySvixSignature(
  rawBody: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): boolean
⋮----
function extractReplyToken(payload: Record<string, unknown>): string | null
⋮----
export async function POST(request: NextRequest): Promise<Response>
⋮----
// ── Read raw body ────────────────────────────────────────────────────────
⋮----
// Strip display name: "John Doe <john@example.com>" → "john@example.com"
````

## File: apps/platform/app/api/inbound/sms/route.ts
````typescript
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { after, type NextRequest } from "next/server";
import { runAgentLoop } from "~/lib/conversations/agent/agent-loop";
import { parseTwilioInbound } from "~/lib/conversations/inbound-parser-twilio";
import { resolveInbound } from "~/lib/conversations/inbound-resolver";
import { debug } from "~/lib/debug";
⋮----
function extractReplyToken(body: string): string | null
⋮----
export async function POST(request: NextRequest): Promise<Response>
````

## File: apps/platform/app/api/inbound/whatsapp/route.ts
````typescript
import { createHmac, timingSafeEqual } from "node:crypto";
import type { KapsoWebhookPayload } from "@packages/kapso/types";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { after, type NextRequest } from "next/server";
import { runAgentLoop } from "~/lib/conversations/agent/agent-loop";
import { resolveInbound } from "~/lib/conversations/inbound-resolver";
import { debug } from "~/lib/debug";
⋮----
function verifyKapsoSignature(rawBody: string, signatureHeader: string, secret: string): boolean
⋮----
function extractReplyToken(text: string): string | null
⋮----
export async function POST(request: NextRequest): Promise<Response>
````

## File: apps/platform/app/api/internal/conversations/drain/route.ts
````typescript
import { timingSafeEqual as cryptoTimingSafeEqual } from "node:crypto";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import type { ChannelSender } from "~/lib/conversations/channel-sender";
import { sendEmailNotification } from "~/lib/conversations/channel-sender-email";
import { sendSmsNotification } from "~/lib/conversations/channel-sender-twilio";
import { sendWebPushNotification } from "~/lib/conversations/channel-sender-web-push";
import { sendWhatsAppNotification } from "~/lib/conversations/channel-sender-whatsapp";
import { debug } from "~/lib/debug";
⋮----
interface PgmqMessage {
  msg_id: string;
  read_ct: number;
  enqueued_at: string;
  vt: string;
  message: {
    delivery_id: string;
    message_id: string;
    channel: string;
  };
}
⋮----
async function pgmqRead(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  vt: number,
  qty: number,
): Promise<
⋮----
async function pgmqDelete(admin: ReturnType<typeof createSupabaseServiceRoleClient>, msgId: number): Promise<void>
⋮----
function safeEqual(a: string, b: string): boolean
⋮----
export async function POST(request: NextRequest): Promise<Response>
⋮----
interface DrainResult {
    msgId: string;
    deliveryId: string;
    channel: string;
    outcome: "sent" | "failed" | "skipped" | "error";
    providerMessageId?: string;
    error?: string;
  }
⋮----
async function resolveChannelContact(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  profileId: string,
  channel: string,
  basePayload: Record<string, unknown>,
): Promise<Record<string, unknown>>
⋮----
type MessageChannel = "in_app" | "email" | "web_push" | "whatsapp" | "sms";
````

## File: apps/platform/app/api/v1/agencies/[agency_id]/avatar/route.ts
````typescript
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { createZodRoute } from "next-zod-route";
import { z } from "zod";
import { streamPublicAvatar } from "~/lib/avatar";
````

## File: apps/platform/app/auth/_components/auth-divider.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
⋮----
export function AuthDivider(
⋮----
className=
````

## File: apps/platform/app/auth/_components/auth-header.tsx
````typescript
import { Logo } from "@packages/ui-common/logo";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import Link from "next/link";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
⋮----
<Link href=
⋮----
<h1 className=
````

## File: apps/platform/app/auth/_components/document-labels.ts
````typescript
import { RUT_FORMAT, RUT_NORMALIZE } from "@packages/utils/rut";
⋮----
type DocumentKind = "nin" | "passport";
⋮----
function IS_KNOWN_FORMAT(country: string, kind: DocumentKind): boolean
⋮----
export function DOCUMENT_VALUE_LABEL(country: string, kind: DocumentKind): string
⋮----
export function DOCUMENT_VALUE_PLACEHOLDER(country: string, kind: DocumentKind): string
⋮----
export function NORMALIZE_DOCUMENT(country: string, kind: DocumentKind, raw: string): string
⋮----
export function FORMAT_DOCUMENT(country: string, kind: DocumentKind, value: string): string
````

## File: apps/platform/app/auth/_components/document-triplet-fields.tsx
````typescript
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { RUT_FORMAT, RUT_NORMALIZE } from "@packages/utils/rut";
import { Controller, type FieldValues, type UseFormReturn } from "react-hook-form";
import { useRosetta } from "~/lib/i18n.client";
import { DOCUMENT_VALUE_LABEL, DOCUMENT_VALUE_PLACEHOLDER } from "./document-labels";
⋮----
export type DocumentTripletCountry = {
  addressLevel0Id: string;
  addressLevel0Name: string;
  addressLevel0Emoji?: string | null;
};
⋮----
type Props<TFormValues extends FieldValues> = {
  form: UseFormReturn<TFormValues>;
  countries: DocumentTripletCountry[];
  legend?: string;
  required?: boolean;
};
⋮----
<Label htmlFor="address_level0_id">
⋮----
function onChangeHandler(e: React.ChangeEvent<HTMLInputElement>)
function onBlurHandler()
````

## File: apps/platform/app/auth/_components/otp-field.tsx
````typescript
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRosetta } from "~/lib/i18n.client";
⋮----
function handleChange(next: string)
⋮----
function handlePaste(event: React.ClipboardEvent<HTMLInputElement>)
````

## File: apps/platform/app/auth/document/accept/actions.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { action } from "~/lib/safe-action.server";
import { sendOtpSchema, verifyOtpSchema } from "./schemas";
````

## File: apps/platform/app/auth/document/page.tsx
````typescript
import { SINGLE } from "@packages/utils/array";
import { getRosetta } from "~/lib/i18n.server";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";
import { AuthHeader } from "../_components/auth-header";
import { DocumentStepForm } from "./document-step-form";
````

## File: apps/platform/app/auth/document/schemas.ts
````typescript
import { RUT_NORMALIZE, RUT_VALIDATE } from "@packages/utils/rut";
import { z } from "zod";
⋮----
export type CheckDocumentValues = z.infer<typeof checkDocumentSchema>;
⋮----
export type VerifyLoginOtpValues = z.infer<typeof verifyLoginOtpSchema>;
````

## File: apps/platform/app/auth/email/page.tsx
````typescript
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";
import { AuthHeader } from "../_components/auth-header";
import { EmailStepForm } from "./email-step-form";
⋮----
export default async function AuthEmailPage(props: PageProps<"/auth/email">)
````

## File: apps/platform/app/auth/onboarding/document/document-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useSupabase } from "@packages/supabase/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type DocumentTripletCountry, DocumentTripletFields } from "~/app/auth/_components/document-triplet-fields";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { type CheckDocumentValues, checkDocumentSchema } from "../../document/schemas";
⋮----
type Props = {
  countries: DocumentTripletCountry[];
};
⋮----
async function onSubmit(values: CheckDocumentValues)
⋮----
<form onSubmit=
````

## File: apps/platform/app/auth/onboarding/email/page.tsx
````typescript
import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { EmailForm } from "./email-form";
````

## File: apps/platform/app/auth/onboarding/passkey/page.tsx
````typescript
import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { PasskeyForm } from "./passkey-form";
````

## File: apps/platform/app/auth/onboarding/password/page.tsx
````typescript
import { IdentityChip } from "~/components/identity/chips";
import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { PasswordForm } from "./password-form";
````

## File: apps/platform/app/auth/onboarding/phone/page.tsx
````typescript
import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { PhoneForm } from "./phone-form";
````

## File: apps/platform/app/auth/onboarding/profile/page.tsx
````typescript
import { ProfileAvatarControls } from "~/components/profile-avatar-controls";
import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { ProfileForm } from "./profile-form";
````

## File: apps/platform/app/auth/phone/page.tsx
````typescript
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";
import { AuthHeader } from "../_components/auth-header";
import { PhoneStepForm } from "./phone-step-form";
⋮----
type Channel = "sms" | "whatsapp";
⋮----
export default async function AuthPhonePage(props: PageProps<"/auth/phone">)
````

## File: apps/platform/app/health/route.ts
````typescript
import { NextResponse } from "next/server";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
⋮----
export async function GET(req: Request, ctx: RouteContext<"/health">)
````

## File: apps/platform/components/inbox/actions.ts
````typescript
import { createSupabaseServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { debug } from "~/lib/debug";
⋮----
export async function actionMarkRead(message_ids: string[]): Promise<void>
⋮----
export async function actionArchive(conversation_id: string): Promise<void>
⋮----
export async function actionPostMessage(conversation_id: string, body: string): Promise<string>
````

## File: apps/platform/components/shell/mobile-sheet.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
⋮----
export function Scrim(
⋮----
function onKey(event: KeyboardEvent)
````

## File: apps/platform/components/floating-chrome.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { ComponentProps } from "react";
import { LocaleToggle } from "~/components/locale-toggle";
import { ThemeToggle } from "~/components/theme-toggle";
⋮----
export function FloatingChrome(
⋮----
<div className=
````

## File: apps/platform/components/posthog-provider.tsx
````typescript
import { PostHogProvider as PHProvider, PostHogPageView } from "@posthog/next";
import { cookies } from "next/headers";
⋮----
interface BootstrapData {
  distinctId?: string;
  featureFlags?: Record<string, string | boolean>;
}
⋮----
export async function PostHogProvider(
````

## File: apps/platform/components/pwa-register.tsx
````typescript
import { useEffect } from "react";
⋮----
export function usePwaRegister()
⋮----
export function PwaRegister()
````

## File: apps/platform/hooks/get-countries.ts
````typescript
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { FilterIs, OrderByDirection } from "~/generated/graphql/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
⋮----
export type CountryGetFragmentType = ResultOf<typeof CountryGetFragment>;
⋮----
type CountriesGetVars = VariablesOf<typeof CountriesGet>;
````

## File: apps/platform/hooks/use-countries.ts
````typescript
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";
import { FilterIs, OrderByDirection } from "~/generated/graphql/graphql";
⋮----
export type CountryHookUseFragmentType = ResultOf<typeof CountryHookUseFragment>;
⋮----
type CountriesUseData = ResultOf<typeof CountriesUse>;
type CountriesUseVars = VariablesOf<typeof CountriesUse>;
⋮----
export function useCountries(options?: CountriesUseVars, config?: SWRConfiguration<CountriesUseData>)
````

## File: apps/platform/hooks/use-intl.ts
````typescript
import { useMemo } from "react";
import { useLocale } from "~/lib/i18n.client";
⋮----
export function useIntlDateTimeFormat(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat
⋮----
export function useIntlNumberFormat(options?: Intl.NumberFormatOptions): Intl.NumberFormat
⋮----
export function useIntlRelativeTimeFormat(options?: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat
⋮----
export function useIntlListFormat(options?: Intl.ListFormatOptions): Intl.ListFormat
⋮----
export function useIntlPluralRules(options?: Intl.PluralRulesOptions): Intl.PluralRules
⋮----
export function useIntlCollator(options?: Intl.CollatorOptions): Intl.Collator
⋮----
export function useIntlSegmenter(options?: Intl.SegmenterOptions): Intl.Segmenter
⋮----
export function useIntlDisplayNames(options: Intl.DisplayNamesOptions): Intl.DisplayNames
````

## File: apps/platform/hooks/use-onboarding.ts
````typescript
import { createSupabaseBrowserClient } from "@packages/supabase/client.browser";
import { useState } from "react";
⋮----
export function useOnboardingEmailOtp()
⋮----
async function sendEmailOtp(email: string)
⋮----
async function verifyEmailOtp(email: string, token: string)
⋮----
export function useOnboardingPassword()
⋮----
async function setPassword(password: string)
⋮----
export function useOnboardingPhoneOtp()
⋮----
async function sendPhoneOtp(phone: string)
⋮----
async function verifyPhoneOtp(phone: string, token: string)
````

## File: apps/platform/lib/conversations/agent/tool-registry.ts
````typescript
import type { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { tool } from "ai";
import { z } from "zod";
import { debug } from "~/lib/debug";
import type { InboundContext } from "../inbound-resolver";
⋮----
export interface AgentTool<_Name extends string = string, TInput = any> {
  name: string;
  description: string;
  permission: string | null;
  sideEffecting: boolean;
  inputSchema: z.ZodType<TInput>;
  idempotencyKey?: (input: TInput, ctx: InboundContext) => string;
  execute: (args: {
    input: TInput;
    ctx: InboundContext;
    admin: ReturnType<typeof createSupabaseServiceRoleClient>;
    idempotencyKey: string;
  }) => Promise<Record<string, unknown>>;
}
⋮----
export async function buildPermittedTools(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  ctx: InboundContext,
): Promise<Record<string, ReturnType<typeof tool<any, any>>>>
````

## File: apps/platform/lib/conversations/channel-sender-web-push.ts
````typescript
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import webpush from "web-push";
import { debug } from "~/lib/debug";
import type { ChannelSender, ChannelSenderInput, ChannelSenderResult } from "./channel-sender";
⋮----
function ensureVapidConfigured(): boolean
````

## File: apps/platform/lib/graphy/graphy.service.ts
````typescript
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { ENV } from "@packages/utils/env";
import { URL_NEW } from "@packages/utils/url";
import { cache } from "react";
````

## File: apps/platform/lib/mcp/tools/agency-admin.ts
````typescript
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";
⋮----
function IS_DUPLICATE(message: string): boolean
⋮----
type OrgAccessArgs = InferArgs<typeof OrgAccessSchema>;
⋮----
export class GrantAgencyOrgAccessTool extends McpTool<typeof OrgAccessSchema>
⋮----
async *handle(args: OrgAccessArgs, ctx: McpContext): McpToolStream
⋮----
export class RevokeAgencyOrgAccessTool extends McpTool<typeof OrgAccessSchema>
⋮----
type InviteArgs = InferArgs<typeof InviteSchema>;
⋮----
export class InviteAffiliateTool extends McpTool<typeof InviteSchema>
⋮----
async *handle(args: InviteArgs, ctx: McpContext): McpToolStream
⋮----
type UpdateAffiliateArgs = InferArgs<typeof UpdateAffiliateSchema>;
⋮----
export class UpdateAffiliateTool extends McpTool<typeof UpdateAffiliateSchema>
⋮----
async *handle(args: UpdateAffiliateArgs, ctx: McpContext): McpToolStream
⋮----
type AgencyMemberPermArgs = InferArgs<typeof AgencyMemberPermSchema>;
⋮----
export class GrantAgencyMemberPermissionTool extends McpTool<typeof AgencyMemberPermSchema>
⋮----
async *handle(args: AgencyMemberPermArgs, ctx: McpContext): McpToolStream
⋮----
export class RevokeAgencyMemberPermissionTool extends McpTool<typeof AgencyMemberPermSchema>
````

## File: apps/platform/lib/mcp/tools/permissions.ts
````typescript
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";
⋮----
function IS_DUPLICATE(message: string): boolean
⋮----
type GrantArgs = InferArgs<typeof GrantSchema>;
⋮----
export class GrantMemberPermissionTool extends McpTool<typeof GrantSchema>
⋮----
async *handle(args: GrantArgs, ctx: McpContext): McpToolStream
⋮----
type RevokeArgs = InferArgs<typeof RevokeSchema>;
⋮----
export class RevokeMemberPermissionTool extends McpTool<typeof RevokeSchema>
⋮----
async *handle(args: RevokeArgs, ctx: McpContext): McpToolStream
⋮----
type SetArgs = InferArgs<typeof SetSchema>;
⋮----
export class SetMemberPermissionsTool extends McpTool<typeof SetSchema>
⋮----
async *handle(args: SetArgs, ctx: McpContext): McpToolStream
⋮----
type StatusArgs = InferArgs<typeof StatusSchema>;
⋮----
export class UpdateMemberStatusTool extends McpTool<typeof StatusSchema>
⋮----
async *handle(args: StatusArgs, ctx: McpContext): McpToolStream
````

## File: apps/platform/lib/mcp/tools/presets.ts
````typescript
import type { VariablesOf } from "@graphql-typed-document-node/core";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";
⋮----
type CreateArgs = InferArgs<typeof CreateSchema>;
⋮----
export class CreatePresetTool extends McpTool<typeof CreateSchema>
⋮----
async *handle(args: CreateArgs, ctx: McpContext): McpToolStream
⋮----
type UpdateArgs = InferArgs<typeof UpdateSchema>;
⋮----
export class UpdatePresetTool extends McpTool<typeof UpdateSchema>
⋮----
async *handle(args: UpdateArgs, ctx: McpContext): McpToolStream
⋮----
type DeleteArgs = InferArgs<typeof DeleteSchema>;
⋮----
export class DeletePresetTool extends McpTool<typeof DeleteSchema>
⋮----
async *handle(args: DeleteArgs, ctx: McpContext): McpToolStream
````

## File: apps/platform/lib/mcp/tools/settings.ts
````typescript
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";
⋮----
type RenameTenantArgs = InferArgs<typeof RenameTenantSchema>;
⋮----
export class RenameTenantTool extends McpTool<typeof RenameTenantSchema>
⋮----
async *handle(args: RenameTenantArgs, ctx: McpContext): McpToolStream
⋮----
type RenameOrgArgs = InferArgs<typeof RenameOrgSchema>;
⋮----
export class RenameOrganizationTool extends McpTool<typeof RenameOrgSchema>
⋮----
async *handle(args: RenameOrgArgs, ctx: McpContext): McpToolStream
⋮----
type FinishOnboardingArgs = InferArgs<typeof FinishOnboardingSchema>;
⋮----
export class FinishTenantOnboardingTool extends McpTool<typeof FinishOnboardingSchema>
⋮----
async *handle(args: FinishOnboardingArgs, ctx: McpContext): McpToolStream
````

## File: apps/platform/lib/mcp/register.ts
````typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { debug } from "~/lib/debug";
import type { McpTool } from "~/lib/mcp/tool";
import {
  GrantAgencyMemberPermissionTool,
  GrantAgencyOrgAccessTool,
  InviteAffiliateTool,
  RevokeAgencyMemberPermissionTool,
  RevokeAgencyOrgAccessTool,
  UpdateAffiliateTool,
} from "~/lib/mcp/tools/agency-admin";
import { ListOrganizationMembersTool } from "~/lib/mcp/tools/members";
import {
  GrantMemberPermissionTool,
  RevokeMemberPermissionTool,
  SetMemberPermissionsTool,
  UpdateMemberStatusTool,
} from "~/lib/mcp/tools/permissions";
import { CreatePresetTool, DeletePresetTool, UpdatePresetTool } from "~/lib/mcp/tools/presets";
import { UpdateProfileTool } from "~/lib/mcp/tools/profile";
import { FinishTenantOnboardingTool, RenameOrganizationTool, RenameTenantTool } from "~/lib/mcp/tools/settings";
import { ListOrganizationsTool, ListTenantsTool } from "~/lib/mcp/tools/tenants";
import { WhoamiTool } from "~/lib/mcp/tools/whoami";
⋮----
export function registerTools(server: McpServer): void
````

## File: apps/platform/lib/mcp/token.ts
````typescript
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { HOST_FROM_HEADERS } from "@packages/utils/headers";
import { ARRAY_FORCED } from "@packages/utils/iterators";
import { createClient } from "@supabase/supabase-js";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { debug } from "~/lib/debug";
⋮----
function createAnonClientForValidation()
⋮----
export async function mcpTokenVerify(req: Request, bearerToken?: string): Promise<AuthInfo | undefined>
````

## File: apps/platform/lib/agencies.ts
````typescript
export type AffiliationState = "accepted" | "pending" | "revoked" | "rejected";
⋮----
export type MembershipTimestamps = {
  agency_membership_accepted_at: string | null;
  agency_membership_revoked_at: string | null;
  agency_membership_rejected_at: string | null;
};
⋮----
export function AFFILIATION_STATE(m: MembershipTimestamps): AffiliationState
⋮----
export function IS_ACTIVE_MEMBERSHIP(m: MembershipTimestamps): boolean
````

## File: apps/platform/lib/auth-tweaks.ts
````typescript
export type SectionOrder = "oauth-first" | "local-first";
export type ObProgressKind = "chips" | "bar";
export type Density = "compact" | "regular" | "comfy";
export type Step1Variant = "selector" | "smart";
export type RecommendedMethod = "passkey" | "password" | "phone" | "email" | "document" | "profile" | "none";
````

## File: apps/platform/lib/dev-mailbox-toast.client.ts
````typescript
import { HREF_FORMAT } from "@packages/utils/url";
import { toast } from "sonner";
import { APEX_HOSTNAME } from "~/lib/constants";
import { isDevHost } from "~/lib/dev-host";
⋮----
export function notifyDevMailbox(email?: string): void
````

## File: apps/platform/lib/safe-action.client.ts
````typescript
import { ErrorExtendable } from "@packages/utils/errors";
import type { FlattenedValidationErrors, SafeActionResult } from "next-safe-action";
⋮----
export class ErrorSafeAction extends ErrorExtendable
⋮----
public static async unwrap<ShapedErrors extends FlattenedValidationErrors<any>, Data>(
    result: Promise<SafeActionResult<string, any, ShapedErrors, Data>>,
  ): Promise<
    | [data: Data, error: undefined]
    | [data: undefined, error: ErrorSafeActionServer | ErrorSafeActionValidation<ShapedErrors> | ErrorSafeActionEmpty]
  > {
    const outcome = await result;
if (outcome.validationErrors !== undefined)
⋮----
export class ErrorSafeActionServer extends ErrorSafeAction
⋮----
public constructor(serverError: string, options?: ErrorOptions)
⋮----
export class ErrorSafeActionValidation<
T extends FlattenedValidationErrors<any> = FlattenedValidationErrors<any>,
⋮----
public constructor(validationErrors: T, options?: ErrorOptions)
⋮----
export class ErrorSafeActionEmpty extends ErrorSafeAction
⋮----
public constructor()
````

## File: apps/platform/playwright.config.ts
````typescript
import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
⋮----
/**
 * Base URL for E2E tests, resolved from environment variables.
 * Conductor assigns `PORT` per parallel instance; E2E suite must read the same value.
 * Matches dev script port resolution in `apps/platform/package.json` (`--port ${PORT:-7003}`).
 */
````

## File: apps/platform/vitest.config.ts
````typescript
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
````

## File: packages/api-ip/src/geo.ts
````typescript
import DataLoader from "dataloader";
⋮----
export type IpApiResult = { status: string; city?: string; country?: string; query: string };
⋮----
export class GeoLoader extends DataLoader<string, IpApiResult | null>
⋮----
constructor(opts: DataLoader.Options<string, IpApiResult | null> =
⋮----
private static async batch(ips: readonly string[]): Promise<(IpApiResult | null)[]>
````

## File: packages/api-ip/package.json
````json
{
  "name": "@packages/api-ip",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "scripts": {
    "build:dry": "tsc --noEmit",
    "format": "biome check --diagnostic-level=error ."
  },
  "exports": {
    "./*": "./src/*.ts"
  },
  "devDependencies": {
    "@packages/typescript-config": "workspace:*",
    "@types/node": "^24.12.4",
    "typescript": "^6.0.3"
  },
  "dependencies": {
    "dataloader": "^2.2.3"
  }
}
````

## File: packages/intl/src/intl.ts
````typescript
import { RosettaImpl } from "@packages/rosetta/rosetta";
import type { Maybe } from "@packages/utils/maybe";
import { FORMAT_CURRENCY_CLF, FORMAT_CURRENCY_CLP, IS_FINITE, NUMBER } from "@packages/utils/number";
import { SPACE_NON_BREAKING } from "@packages/utils/string";
import { DURATION_FROM_SQL, TEMPORAL, type Temporal, TZ } from "@packages/utils/temporal";
⋮----
function TO_ZONED(value: Date | string | Temporal.ZonedDateTime | Temporal.PlainDateTime): Temporal.ZonedDateTime
⋮----
export class IntlNumberParser
⋮----
constructor(locale: string, options?: Intl.NumberFormatOptions)
⋮----
public parse(string: string): number
⋮----
str = str.replace(this.group, ""); // TODO: not sure about this "if"
⋮----
export class IntlUniversalFormatter
⋮----
constructor(public readonly locale: string)
⋮----
public formatPCT(
    input: string | number | bigint | Intl.StringNumericLiteral,
    digits?: number,
    options?: Intl.NumberFormatOptions,
): string
⋮----
public formatPCTRange(
    inputs: (string | number | bigint | Intl.StringNumericLiteral)[],
    digits?: number,
    options?: Intl.NumberFormatOptions,
): string
⋮----
public formatNumber(
    input: string | number | bigint | Intl.StringNumericLiteral,
    options?: Intl.NumberFormatOptions,
): string
⋮----
public formatDate(
    input: Temporal.PlainDate,
    options: Intl.DateTimeFormatOptions = {
      dateStyle: "long",
    },
): string
⋮----
public formatDateTime(
    input: Date | Temporal.ZonedDateTime | string,
    options: Intl.DateTimeFormatOptions = {
      dateStyle: "long",
      timeStyle: "short",
      hour12: false,
    },
): string
⋮----
public formatTokens(input: string | number | bigint | Intl.StringNumericLiteral, options?: Intl.NumberFormatOptions)
⋮----
public formatMoney(
    input: string | number | bigint | Intl.StringNumericLiteral,
    currency: "USD" | "EUR" | "CLP" | "CLF" | `U${string}` | string | undefined | null,
    options?: Intl.NumberFormatOptions | null,
): string
⋮----
public formatMoneyToParts(
    input: string | number | bigint | Intl.StringNumericLiteral,
    currency: "USD" | "EUR" | "CLP" | "CLF" | `U${string}` | string | undefined | null,
    options?: Intl.NumberFormatOptions | null,
): Intl.NumberFormatPart[]
⋮----
protected formatMoneyFormatter(
    input: string | number | bigint | Intl.StringNumericLiteral,
    currency: "USD" | "EUR" | "CLP" | "CLF" | `U${string}` | string | undefined | null,
    options?: Intl.NumberFormatOptions | null,
):
⋮----
public formatRelativeTime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
): string
⋮----
public formatDisplayName(code: string, options: Intl.DisplayNamesOptions): string
⋮----
public formatList(list: Iterable<string>, options?: Intl.ListFormatOptions): string
⋮----
public formatInterval(interval: string, options?: IntlDurationFormatOptions): string
⋮----
public formatIntervalRange(
    start: Date | string | Temporal.ZonedDateTime | Temporal.PlainDateTime,
    end: Date | string | Temporal.ZonedDateTime | Temporal.PlainDateTime,
    options?: IntlDurationFormatOptions,
): string
⋮----
public formatDuration(duration: Temporal.Duration, options?: IntlDurationFormatOptions): string
⋮----
export type IntlNumberFormatPatchedOptions = Intl.NumberFormatOptions;
⋮----
export class IntlNumberFormatPatched implements Intl.NumberFormat
⋮----
public constructor(
    locale: string,
    private readonly options?: IntlNumberFormatPatchedOptions,
)
⋮----
return this.wrapped.format(value).replace(SPACE, "").replace(" ", ""); // remove space
⋮----
/**
   * Format a value if it is a number or bigint, on nil value returns undefined.
   */
public formatLoose(value: number | bigint | Intl.StringNumericLiteral): string;
public formatLoose(value: Maybe<never>): undefined;
public formatLoose(value: Maybe<number | bigint | Intl.StringNumericLiteral>): string | undefined;
public formatLoose(value: Maybe<number | bigint | Intl.StringNumericLiteral>): string | undefined
⋮----
export type IntlDurationFormatOptions = {
  localeMatcher?: "best fit" | "lookup";
  numberingSystem?: string;
  style?: "long" | "short" | "narrow" | "digital";
  years?: "long" | "short" | "narrow";
  yearsDisplay?: "always" | "auto";
  months?: "long" | "short" | "narrow";
  monthsDisplay?: "always" | "auto";
  weeks?: "long" | "short" | "narrow";
  weeksDisplay?: "always" | "auto";
  days?: "long" | "short" | "narrow";
  daysDisplay?: "always" | "auto";
  hours?: "long" | "short" | "narrow" | "numeric" | "2-digit";
  hoursDisplay?: "always" | "auto";
  minutes?: "long" | "short" | "narrow" | "numeric" | "2-digit";
  minutesDisplay?: "always" | "auto";
  seconds?: "long" | "short" | "narrow" | "numeric" | "2-digit";
  secondsDisplay?: "always" | "auto";
  milliseconds?: "long" | "short" | "narrow" | "numeric";
  millisecondsDisplay?: "always" | "auto";
  microseconds?: "long" | "short" | "narrow" | "numeric";
  microsecondsDisplay?: "always" | "auto";
  nanoseconds?: "long" | "short" | "narrow" | "numeric";
  nanosecondsDisplay?: "always" | "auto";
  fractionalDigits?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};
⋮----
export class IntlDurationFormatPatched
⋮----
constructor(
⋮----
public format(duration: Temporal.Duration): string
⋮----
function getUnitStyle(unit: keyof IntlDurationFormatOptions): "long" | "short" | "narrow" | "numeric" | "2-digit"
⋮----
function shouldDisplay(value: number, display?: "always" | "auto"): boolean
⋮----
function formatUnit(
      value: number,
      unit: Intl.RelativeTimeFormatUnit,
      unitStyle: "long" | "short" | "narrow",
): string
⋮----
function getUnitName(
      value: number,
      unit: Intl.RelativeTimeFormatUnit,
      baseStyle: "long" | "short" | "narrow" | "2-digit",
): string
⋮----
// Helper to format numeric values (for digital style)
function formatNumeric(value: number, pad: number = 2): string
````

## File: packages/intl/package.json
````json
{
  "name": "@packages/intl",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "exports": {
    "./*": "./src/*.ts"
  },
  "scripts": {
    "build:dry": "tsc --noEmit",
    "format": "biome check --diagnostic-level=error ."
  },
  "dependencies": {
    "@packages/rosetta": "workspace:*",
    "@packages/utils": "workspace:*",
    "temporal-polyfill": "^1.0.1"
  },
  "devDependencies": {
    "@packages/typescript-config": "workspace:*",
    "@types/node": "^24.12.4",
    "typescript": "^6.0.3"
  }
}
````

## File: packages/intl/tsconfig.json
````json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@packages/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "preserve",
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}
````

## File: packages/react-email/src/templates/welcome_email.tsx
````typescript
import { LocaleProvider, useLocale, useRosetta } from "@packages/rosetta/use-rosetta";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
⋮----
export interface WelcomeEmailProps {
  empleadoNombre: string;
  empresaNombre: string;
  loginUrl: string;
  locale?: string;
}
⋮----
export function WelcomeEmail(
````

## File: packages/react-hooks/src/use-device-info.ts
````typescript
import { useMemo } from "react";
import { useMounted } from "./use-mounted";
⋮----
export enum DeviceOS {
  MacOS = "macos",
  Windows = "windows",
  Linux = "linux",
  iOS = "ios",
  Android = "android",
  Unknown = "unknown",
}
⋮----
export enum DeviceBrowser {
  Chrome = "chrome",
  Firefox = "firefox",
  Safari = "safari",
  Edge = "edge",
  Opera = "opera",
  Unknown = "unknown",
}
⋮----
export interface DeviceInfo {
  os: DeviceOS;
  browser: DeviceBrowser;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isMobile: boolean;
  isTouch: boolean;
  modKey: "⌘" | "Ctrl" | undefined;
  modKeyLabel: "Cmd" | "Ctrl" | undefined;
}
⋮----
function DETECT_OS(ua: string): DeviceOS
⋮----
function DETECT_BROWSER(ua: string): DeviceBrowser
⋮----
export function COMPUTE_DEVICE_INFO(): DeviceInfo
⋮----
export function useDeviceInfo(): DeviceInfo | null
````

## File: packages/react-hooks/src/use-state-cookie.ts
````typescript
import { useCallback, useRef, useState } from "react";
import { useCookieStore } from "./use-cookie-store";
⋮----
export type UseStateCookieOptions<T> = {
  maxAgeMs?: number;
  path?: string;
  sameSite?: "strict" | "lax" | "none";
  serialize?: (value: T) => string;
};
⋮----
export function useStateCookie<T>(
  name: string,
  initialValue: T,
  { maxAgeMs, path = "/", sameSite, serialize }: UseStateCookieOptions<T> = {},
): [T, (next: T | ((prev: T) => T)) => void]
````

## File: packages/rosetta/src/locale-config.ts
````typescript
import { BOOLEAN } from "@packages/utils/boolean";
⋮----
type LanguageEntry<T extends string> = {
  readonly tag: T;
  readonly label: string;
};
⋮----
export class LocaleConfig<L extends string>
⋮----
constructor({
    languages,
    defaultLocale,
    cookie = "NEXT_LOCALE",
  }: {
    readonly languages: readonly LanguageEntry<L>[];
    defaultLocale: L;
    cookie?: string;
})
⋮----
isSupported(value: unknown): value is L
⋮----
extractFromPath(pathname: string):
````

## File: packages/ui-common/src/shadcn/components/ui/accordion.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
⋮----
function Accordion(
⋮----
function AccordionItem(
⋮----
function AccordionTrigger(
⋮----
function AccordionContent(
````

## File: packages/ui-common/src/shadcn/components/ui/alert.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
⋮----
function Alert(
⋮----
className=
````

## File: packages/ui-common/src/shadcn/components/ui/avatar.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Avatar as AvatarPrimitive } from "radix-ui";
⋮----
className=
````

## File: packages/ui-common/src/shadcn/components/ui/checkbox.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
⋮----
function Checkbox(
````

## File: packages/ui-common/src/shadcn/components/ui/select.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
⋮----
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
})
className=
⋮----
function SelectLabel(
⋮----
function SelectItem(
⋮----
function SelectSeparator(
⋮----
function SelectScrollUpButton(
````

## File: packages/ui-common/src/shadcn/components/ui/sonner.tsx
````typescript
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
````

## File: packages/ui-common/src/shadcn/components/ui/spinner.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Loader2Icon } from "lucide-react";
⋮----
return <Loader2Icon role="status" aria-label="Loading" className=
````

## File: packages/ui-common/src/shadcn/components/ui/switch.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Switch as SwitchPrimitive } from "radix-ui";
⋮----
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
})
⋮----
className=
````

## File: packages/ui-common/src/shadcn/components/ui/table.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
⋮----
function Table(
⋮----
function TableHeader(
⋮----
function TableBody(
⋮----
className=
⋮----
<caption data-slot="table-caption" className=
````

## File: packages/ui-common/src/shadcn/components/ui/tabs.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
⋮----
function Tabs(
⋮----
className=
````

## File: packages/ui-common/src/shadcn/components/ui/textarea.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
⋮----
className=
````

## File: packages/ui-common/src/button-spinner.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { useFormStatus } from "react-dom";
import type { PolymorphicProps } from "./polymorphic";
import { buttonVariants } from "./shadcn/components/ui/button";
import { Spinner } from "./shadcn/components/ui/spinner";
⋮----
type OwnProps = VariantProps<typeof buttonVariants> & {
  pending?: boolean;
  pendingChildren?: React.ReactNode;
};
⋮----
export type ButtonSpinnerProps<T extends React.ElementType = "button"> = PolymorphicProps<T, OwnProps>;
⋮----
export function ButtonSpinner<T extends React.ElementType = "button">({
  as,
  ref,
  pending: pendingProp,
  pendingChildren,
  variant,
  size,
  className,
  children,
  disabled,
  ...props
}: ButtonSpinnerProps<T>)
````

## File: packages/ui-common/src/logo.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { PolymorphicProps } from "./polymorphic";
⋮----
type LogoProps<T extends React.ElementType = "span"> = PolymorphicProps<T>;
⋮----
export function Logo<T extends React.ElementType = "span">(
⋮----
className=
````

## File: scripts/development/https-setup.sh
````bash
set -euo pipefail
if ! command -v mkcert >/dev/null 2>&1; then
  echo "error: mkcert is not installed."
  echo "Install it first:"
  echo "  macOS:  brew install mkcert nss"
  echo "  Linux:  see https://github.com/FiloSottile/mkcert#installation"
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DIR="$SCRIPT_DIR/../../apps/platform/certificates"
mkdir -p "$CERT_DIR"
echo "==> Installing mkcert root CA (idempotent)…"
mkcert -install
echo "==> Issuing cert for lvh.me + localhost + 127.0.0.1…"
mkcert \
  -key-file "$CERT_DIR/lvh.me-key.pem" \
  -cert-file "$CERT_DIR/lvh.me-cert.pem" \
  lvh.me localhost 127.0.0.1
echo
echo "✅ Certs written to apps/platform/certificates/"
echo "   Run 'pnpm dev' and open https://lvh.me:7003"
````

## File: scripts/development/local-setup.sh
````bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
if [ -n "${CONDUCTOR_PORT:-}" ]; then
  echo "CONDUCTOR_PORT set → use the Conductor flow (worktree-setup.sh), not local-setup.sh." >&2
  exit 1
fi
if [ -n "${EXE_HOST:-}" ]; then
  echo "EXE_HOST set → use exe-dev-setup.sh, not local-setup.sh." >&2
  exit 1
fi
if [ -f apps/platform/certificates/lvh.me-key.pem ] && [ -f apps/platform/certificates/lvh.me-cert.pem ]; then
  echo "✓ TLS certs present"
else
  echo "→ generating local TLS certs (mkcert)…"
  bash scripts/development/https-setup.sh
fi
PROJECT="$(sed -n 's/^project_id[[:space:]]*=[[:space:]]*"\(.*\)".*/\1/p' packages/supabase/supabase/config.toml | head -1)"
RUNNING=$(docker ps -q --filter "label=com.supabase.cli.project=${PROJECT}" 2>/dev/null | wc -l | tr -d ' ')
if [ "$RUNNING" -gt 0 ]; then
  echo "✓ Supabase '${PROJECT}' already running"
else
  echo "→ starting Supabase '${PROJECT}'…"
  pnpm db:start
fi
echo "→ writing .env.development.local…"
pnpm run -w db:env:development
cat <<'EOF'
✅ Local dev environment ready. Start the app with:
   pnpm dev
EOF
````

## File: repomix.config.ts
````typescript
import { defineConfig } from "repomix";
````

## File: turbo.json
````json
{
  "$schema": "./node_modules/turbo/schema.json",
  "globalDependencies": ["package.json", "pnpm-workspace.yaml", ".env.local"],
  "globalEnv": [
    "__NEXT_EXPERIMENTAL_HTTPS",
    "CONVERSATIONS_DRAIN_SECRET",
    "DEBUG",
    "EXE_HOST",
    "KAPSO_API_KEY",
    "KAPSO_WEBHOOK_SECRET",
    "NEXT_RUNTIME",
    "PORT",
    "RESEND_API_KEY",
    "RESEND_FROM",
    "RESEND_INBOUND_DOMAIN",
    "RESEND_WEBHOOK_SECRET",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_FROM",
    "VAPID_PRIVATE_KEY",
    "VAPID_PUBLIC_KEY",
    "VAPID_SUBJECT"
  ],
  "ui": "stream",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"],
      "inputs": ["$TURBO_DEFAULT$", ".env.*local"]
    },
    "test": {
      "outputs": ["coverage/**", "test-results/**"],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "format": {
      "outputs": []
    },
    "generate": {
      "outputs": []
    },
    "build:dry": {
      "dependsOn": ["^build:dry"],
      "outputs": [],
      "inputs": ["$TURBO_DEFAULT$"]
    },
    "generate:graphql": {
      "dependsOn": ["@packages/supabase#generate:graphql:schema"],
      "cache": false,
      "outputs": ["generated/graphql/**"]
    },
    "generate:graphql:schema": {
      "cache": false,
      "outputs": ["generated/graphql/graphql.schema.json", "generated/graphql/graphql.schema.graphql"]
    },
    "generate:types": {
      "cache": false,
      "outputs": ["src/types.ts"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "dev:debug": {
      "cache": false,
      "persistent": true
    }
  }
}
````

## File: apps/platform/app/(app)/a/[agency_slug]/inbox/page.tsx
````typescript
import { SINGLE } from "@packages/utils/array";
import type { Metadata } from "next";
import { InboxList } from "~/components/inbox/inbox-list";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
⋮----
export async function generateMetadata(props: PageProps<"/a/[agency_slug]/inbox">): Promise<Metadata>
````

## File: apps/platform/app/(app)/a/[agency_slug]/settings/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityLogoControls } from "~/components/entity-logo-controls";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
⋮----
export async function generateMetadata(): Promise<Metadata>
⋮----
href=
````

## File: apps/platform/app/(app)/a/[agency_slug]/tickets/[ticket_id]/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { getRosetta } from "~/lib/i18n.server";
import { type ConversationMessage, TicketDetail, type TicketDetailData } from "./ticket-detail";
⋮----
export async function generateMetadata(props: PageProps<"/a/[agency_slug]/tickets/[ticket_id]">): Promise<Metadata>
⋮----
export default async function AgencyTicketDetailPage(props: PageProps<"/a/[agency_slug]/tickets/[ticket_id]">)
````

## File: apps/platform/app/(app)/a/[agency_slug]/tickets/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { getRosetta } from "~/lib/i18n.server";
import { type PoolTicket, TicketPool } from "./ticket-pool";
⋮----
export async function generateMetadata(): Promise<Metadata>
⋮----
export default async function AgencyTicketsPage(props: PageProps<"/a/[agency_slug]/tickets">)
````

## File: apps/platform/app/(app)/a/[agency_slug]/agency-nav.tsx
````typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui-common/shadcn/components/ui/dropdown-menu";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  Check,
  ChevronsUpDown,
  House,
  Inbox,
  type LucideIcon,
  Network,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EntityAvatar } from "~/components/entity-avatar";
import { LocaleToggle } from "~/components/locale-toggle";
import { ConversationsBell } from "~/components/shell/conversations-bell";
import { ThemeToggle } from "~/components/theme-toggle";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
⋮----
export type NavAgency = {
  agency_id: number;
  agency_slug: string;
  agency_name: string;
};
⋮----
type AgencyTab = { key: string; href: Route; label: string; icon: LucideIcon; exact: boolean };
⋮----
⋮----
<Link href=
⋮----
<span>
````

## File: apps/platform/app/(app)/home/account/_components/sidebar.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import { ACCOUNT_SECTION_PATH, ACCOUNT_SECTIONS, type AccountGroupKey, type AccountSectionId } from "./sections";
⋮----
function ACTIVE_SECTION(pathname: string): AccountSectionId
⋮----
className=
````

## File: apps/platform/app/(app)/home/account/danger/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { DeleteAccountDialog } from "./delete-account-dialog";
````

## File: apps/platform/app/(app)/home/account/language/page.tsx
````typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { useLocaleCookie } from "~/hooks/use-locale-cookie";
import { LOCALE_LABEL, SUPPORTED_LOCALES, type SupportedLocale } from "~/lib/i18n";
import { useRosetta } from "~/lib/i18n.client";
````

## File: apps/platform/app/(app)/home/account/notifications/notifications-channels.tsx
````typescript
import { useSupabase } from "@packages/supabase/react";
import { Switch } from "@packages/ui-common/shadcn/components/ui/switch";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useViewerProfile } from "~/hooks/use-viewer-profile";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type PrefChannel = "email" | "web_push" | "whatsapp" | "sms";
⋮----
function CHANNEL_ON(disabled: Set<PrefChannel>, channel: PrefChannel): boolean
⋮----
async function fetch()
⋮----
function scheduleFlush()
⋮----
function onChannelToggle(channel: PrefChannel, next: boolean)
⋮----
onCheckedChange=
````

## File: apps/platform/app/(app)/home/account/notifications/page.tsx
````typescript
import { getRosetta } from "~/lib/i18n.server";
import { ContactsManage } from "./contacts-manage";
import { NotificationsChannels } from "./notifications-channels";
import { PushPermission } from "./push-permission";
````

## File: apps/platform/app/(app)/home/account/security/passkeys-list.tsx
````typescript
import { useSupabase } from "@packages/supabase/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useIntlDateTimeFormat } from "~/hooks/use-intl";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type Passkey = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};
⋮----
function FORMAT_DATE(value: string | null | undefined): string
⋮----
function onDelete(id: string)
````

## File: apps/platform/app/(app)/home/account/sessions/page.tsx
````typescript
import { getSupabaseServerSession } from "@packages/supabase/client.server";
import { SUPABASE_JWT_DECODE_PAYLOAD } from "@packages/supabase/jwt";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { SessionsSection, type SessionsSectionSessionFragmentType } from "./sessions-section";
````

## File: apps/platform/app/(app)/home/account/sessions/sessions-section.tsx
````typescript
import type { ResultOf } from "@graphql-typed-document-node/core";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { DATETIME, RELATIVE_DATE_FORMAT } from "@packages/utils/date";
import { Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { UAParser } from "ua-parser-js";
import { gql } from "~/generated/graphql";
import { useIntlRelativeTimeFormat } from "~/hooks/use-intl";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionRevokeSession, actionSignOutOtherDevices } from "../actions";
⋮----
export type SessionsSectionSessionFragmentType = ResultOf<typeof SessionsSectionSessionFragment>;
⋮----
type SessionsSectionProps = React.ComponentProps<"div"> & {
  currentSessionId: string | null | undefined;
  sessions: SessionsSectionSessionFragmentType[];
};
⋮----
className=
⋮----
function onRevoke(id: string)
⋮----
function onSignOutOthers()
⋮----
<div className=
````

## File: apps/platform/app/(app)/home/account/theme/page.tsx
````typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { useTheme } from "next-themes";
import { useRosetta } from "~/lib/i18n.client";
````

## File: apps/platform/app/(app)/home/account/layout.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AccountMobileNav, AccountSidebar } from "./_components/sidebar";
⋮----
href=
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/onboarding/onboarding-checklist.tsx
````typescript
import { useGraphyMutation } from "@packages/graphy/react";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, ImageIcon, type LucideIcon, UserPlus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import {
  TENANT_COUNT_DONE,
  TENANT_STEP_ORDER,
  type TenantOnboardingStepId,
  type TenantOnboardingStepStatus,
} from "./state";
⋮----
async function onDismiss()
⋮----
className=
⋮----
<Link href=
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/external-access/external-access.tsx
````typescript
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { Ban, Building2, Eye, Globe, Lock, Plus, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionGrantAgencyAccess, actionRevokeAgencyAccess } from "./actions";
⋮----
export type ExternalAccessAgency = {
  agency_id: number;
  agency_name: string;
  agency_slug: string;
  active_affiliates: number;
  is_global: boolean;
};
⋮----
function grant()
⋮----
function revoke()
⋮----
<Users size=
⋮----
className=
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/general/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { getRosetta } from "~/lib/i18n.server";
import { GeneralSettings } from "./general-settings";
⋮----
export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/general">,
): Promise<Metadata>
⋮----
export default async function OrganizationGeneralSettingsPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/general">,
)
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/members/actions.ts
````typescript
import { randomBytes } from "node:crypto";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { HOST_FROM_HEADERS } from "@packages/utils/headers";
import { URL_NEW } from "@packages/utils/url";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { debug } from "~/lib/debug";
import { getRosetta } from "~/lib/i18n.server";
import { captureMemberInvited } from "~/lib/posthog/events.server";
import { authedAction } from "~/lib/safe-action.server";
import { inviteMemberSchema } from "./schemas";
⋮----
function GENERATE_INVITATION_TOKEN(): string
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/tenant/domains/page.tsx
````typescript
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Check, Globe, Plus } from "lucide-react";
import type { Metadata } from "next";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta } from "~/lib/i18n.server";
⋮----
type DomainRow = { domain: string; verified: boolean; meta: "domain_members" | "domain_dns" };
⋮----
export async function generateMetadata(): Promise<Metadata>
⋮----
className=
````

## File: apps/platform/app/(app)/t/[tenant_slug]/page.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import { SINGLE } from "@packages/utils/array";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewerOrganizations } from "~/hooks/get-viewer-organizations";
import { getViewerTenantBySlugAssert } from "~/hooks/get-viewer-tenants";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
⋮----
<Link href=
````

## File: apps/platform/app/(app)/tenants/create/page.tsx
````typescript
import { Logo } from "@packages/ui-common/logo";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { CreateTenantForm } from "./create-form";
⋮----
export async function generateMetadata(props: PageProps<"/tenants/create">): Promise<Metadata>
````

## File: apps/platform/app/(marketing)/legal/_components/sidebar.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTE } from "~/lib/route";
⋮----
type LegalLocale = "es" | "en" | "pt";
type LegalSection = "terms" | "privacy" | "cookies" | "dpa" | "security";
⋮----
function toLegalLocale(locale: string): LegalLocale
⋮----
export function LegalSidebar()
⋮----
className=
````

## File: apps/platform/app/(marketing)/mcp/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Card, CardContent } from "@packages/ui-common/shadcn/components/ui/card";
import { URL_NEW } from "@packages/utils/url";
import { KeyRound, Plug, ShieldCheck, Terminal } from "lucide-react";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { McpPromptCta } from "./mcp-prompt-cta";
⋮----
export async function generateMetadata(props: PageProps<"/mcp">): Promise<Metadata>
````

## File: apps/platform/app/auth/callback/route.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { type NextRequest, NextResponse } from "next/server";
import { RESOLVE_AUTH_NEXT } from "~/lib/auth-next";
import { debug } from "~/lib/debug";
import { captureUserSignedIn } from "~/lib/posthog/events.server";
⋮----
export async function GET(request: NextRequest, ctx: RouteContext<"/auth/callback">)
````

## File: apps/platform/app/auth/confirm/route.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { RESOLVE_AUTH_NEXT } from "~/lib/auth-next";
import { debug } from "~/lib/debug";
⋮----
function IS_ALLOWED_TYPE(value: string | null): value is EmailOtpType
⋮----
export async function GET(request: NextRequest, ctx: RouteContext<"/auth/confirm">)
````

## File: apps/platform/app/auth/document/actions.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { redirect } from "next/navigation";
import { debug } from "~/lib/debug";
import { action } from "~/lib/safe-action.server";
import { checkDocumentSchema, verifyLoginOtpSchema } from "./schemas";
⋮----
type CheckDocumentResult =
  | { kind: "error"; reason: "send_otp_failed"; message?: string }
  | { kind: "redirect_signup"; country: string; doc_kind: "nin" | "passport"; value: string }
  | { kind: "login"; channel: "sms" | "email"; contact: string; masked: string }
  | { kind: "redirect_accept"; invitation_token: string }
  | {
      kind: "pick_invite";
      invites: Array<{
        organization_membership_id: number;
        invitation_token: string;
        organization_id: number;
        organization_name: string;
        tenant_id: number;
        tenant_slug: string;
        tenant_name: string;
        invitation_expires_at: string | null;
      }>;
    };
⋮----
function maskPhone(phone: string): string
⋮----
function maskEmail(email: string): string
````

## File: apps/platform/app/auth/email/actions.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AUTH_EXPOSE_ACCOUNT_EXISTENCE } from "~/lib/constants";
import { action, formAction } from "~/lib/safe-action.server";
````

## File: apps/platform/app/auth/error/page.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { SINGLE } from "@packages/utils/array";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AuthCard } from "../_components/auth-card";
⋮----
<Link href=
````

## File: apps/platform/app/auth/logout/actions.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { getViewerProfile } from "~/hooks/get-viewer-profile";
import { debug } from "~/lib/debug";
import { captureUserSignedOut } from "~/lib/posthog/events.server";
import { action } from "~/lib/safe-action.server";
⋮----
export async function signOutForm(_: FormData)
````

## File: apps/platform/app/auth/onboarding/document/page.tsx
````typescript
import { getCountries } from "~/hooks/get-countries";
import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { StepShell } from "../_components/step-shell";
import { getViewerOnboardingState } from "../state.server";
import { DocumentForm } from "./document-form";
````

## File: apps/platform/app/auth/onboarding/passkey/passkey-form.tsx
````typescript
import { useSupabase } from "@packages/supabase/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
⋮----
function onEnroll()
````

## File: apps/platform/app/auth/phone/actions.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AUTH_EXPOSE_ACCOUNT_EXISTENCE } from "~/lib/constants";
import { action, formAction } from "~/lib/safe-action.server";
````

## File: apps/platform/app/auth/recover/page.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AuthBackLink } from "../_components/auth-back-link";
import { AuthCard } from "../_components/auth-card";
⋮----
<Link href=
````

## File: apps/platform/app/auth/router/page.tsx
````typescript
import { getSupabaseServerUserRedirect } from "@packages/supabase/client.server";
import { SINGLE } from "@packages/utils/array";
import { HOST_FROM_HEADERS } from "@packages/utils/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RESOLVE_AUTH_NEXT } from "~/lib/auth-next";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { getViewerOnboardingState } from "../onboarding/state.server";
⋮----
export default async function AuthRouterPage(props: PageProps<"/auth/router">)
````

## File: apps/platform/app/auth/success/page.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { SINGLE } from "@packages/utils/array";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AuthCard } from "../_components/auth-card";
⋮----
<Link href=
````

## File: apps/platform/app/auth/actions.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isOAuthProvider, OAUTH_PROVIDER_IDS } from "~/app/auth/providers";
import { AUTH_EXPOSE_ACCOUNT_EXISTENCE } from "~/lib/constants";
import { debug } from "~/lib/debug";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { action } from "~/lib/safe-action.server";
⋮----
export async function signInWithOAuth(formData: FormData)
⋮----
async function continueWithEmail(value: string, next: string): Promise<never>
⋮----
async function continueWithPhone(value: string, next: string): Promise<never>
⋮----
async function continueWithDocument(value: string, next: string): Promise<never>
⋮----
export async function actionContinueAuth(formData: FormData): Promise<never>
````

## File: apps/platform/app/auth/page.tsx
````typescript
import { SINGLE } from "@packages/utils/array";
import { getRosetta } from "~/lib/i18n.server";
import { AuthCard } from "./_components/auth-card";
import { AuthDivider } from "./_components/auth-divider";
import { AuthEntryForm } from "./_components/auth-entry-form";
import { AuthHeader } from "./_components/auth-header";
import { OAuthSection } from "./_components/oauth-section";
````

## File: apps/platform/components/inbox/scope.ts
````typescript
import type { Route } from "next";
import { ROUTE } from "~/lib/route";
⋮----
export type InboxScope =
  | { kind: "personal" }
  | { kind: "organization"; tenant_slug: string; organization_id: number }
  | { kind: "agency"; agency_slug: string; agency_id: number };
⋮----
export function SCOPE_RPC_ARGS(scope: InboxScope):
⋮----
export function SCOPE_INBOX_HREF(scope: InboxScope): Route
⋮----
export function SCOPE_DETAIL_HREF(scope: InboxScope, conversation_id: string): Route
````

## File: apps/platform/components/shell/shell.tsx
````typescript
import { useKeyboardShortcut } from "@packages/react-hooks/use-keyboard-shortcut";
import { SidebarInset, SidebarProvider } from "@packages/ui-common/shadcn/components/ui/sidebar";
import { TooltipProvider } from "@packages/ui-common/shadcn/components/ui/tooltip";
import { useIsMobile } from "@packages/ui-common/shadcn/hooks/use-mobile";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { AppSidebar } from "~/components/shell/app-sidebar";
import { CommandPalette } from "~/components/shell/command-palette";
import { MobileNavDrawer } from "~/components/shell/mobile-nav-drawer";
import {
  MobileOrgSheet,
  MobileProfileSheet,
  MobileSearchSheet,
  MobileSettingsSheet,
} from "~/components/shell/mobile-sheets";
import { MobileTopBar } from "~/components/shell/mobile-top-bar";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import type { ShellViewer } from "~/components/shell/profile-menu";
⋮----
type MobileSheet = null | "search" | "org" | "profile" | "settings";
⋮----
export function Shell({
  tenant,
  organizations,
  current,
  viewer,
  defaultOpen,
  children,
}: {
  tenant: ShellTenant;
  organizations: ShellOrganization[];
  current: ShellOrganization;
  viewer: ShellViewer;
  defaultOpen?: boolean;
  children: ReactNode;
})
⋮----
onOpenPalette=
⋮----
onSearch=
onOrg=
onProfile=
⋮----
setDrawerOpen(false);
setMobileSheet("org");
⋮----
setMobileSheet("settings");
````

## File: apps/platform/components/posthog-identify.tsx
````typescript
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import { usePostHog } from "@posthog/next";
import { useEffect } from "react";
import { gql } from "~/generated/graphql";
⋮----
export function PostHogIdentify()
````

## File: apps/platform/components/pwa-install-banner.tsx
````typescript
import { useRosetta } from "@packages/rosetta/use-rosetta";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
⋮----
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
⋮----
prompt(): Promise<void>;
⋮----
export function usePwaInstall()
⋮----
const handler = (e: Event) =>
⋮----
async function install()
⋮----
function dismiss()
````

## File: apps/platform/hooks/get-viewer-tenants.ts
````typescript
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { notFound } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
⋮----
export type ViewerTenantGetFragmentType = ResultOf<typeof ViewerTenantGetFragment>;
⋮----
type ViewerTenantsGetVars = VariablesOf<typeof ViewerTenantsGet>;
⋮----
export async function getViewerTenantByIdAssert(tenant_id: number)
⋮----
export async function getViewerTenantBySlugAssert(tenant_slug: string)
````

## File: apps/platform/hooks/use-viewer-organizations.ts
````typescript
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";
⋮----
export type ViewerOrganizationUseFragmentType = ResultOf<typeof ViewerOrganizationUseFragment>;
⋮----
type ViewerOrganizationsUseData = ResultOf<typeof ViewerOrganizationsUse>;
type ViewerOrganizationsUseVars = VariablesOf<typeof ViewerOrganizationsUse>;
type ViewerOrganizationByIdUseData = ResultOf<typeof ViewerOrganizationByIdUse>;
type ViewerOrganizationBySlugUseData = ResultOf<typeof ViewerOrganizationBySlugUse>;
⋮----
export function useViewerOrganizations(
  options?: ViewerOrganizationsUseVars,
  config?: SWRConfiguration<ViewerOrganizationsUseData>,
)
⋮----
export function useViewerOrganization(
  organization_id: number,
  config?: SWRConfiguration<ViewerOrganizationByIdUseData>,
)
⋮----
export function useViewerOrganizationBySlug(
  organization_slug: string,
  config?: SWRConfiguration<ViewerOrganizationBySlugUseData>,
)
````

## File: apps/platform/hooks/use-viewer-profile.ts
````typescript
import type { ResultOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";
⋮----
export type ViewerProfileUseFragmentType = ResultOf<typeof ViewerProfileUseFragment>;
⋮----
type ViewerProfileUseData = ResultOf<typeof ViewerProfileUse>;
⋮----
export function useViewerProfile(config?: SWRConfiguration<ViewerProfileUseData>)
````

## File: apps/platform/hooks/use-viewer-tenants.ts
````typescript
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";
⋮----
export type ViewerTenantUseFragmentType = ResultOf<typeof ViewerTenantUseFragment>;
⋮----
type ViewerTenantsUseData = ResultOf<typeof ViewerTenantsUse>;
type ViewerTenantsUseVars = VariablesOf<typeof ViewerTenantsUse>;
type ViewerTenantByIdUseData = ResultOf<typeof ViewerTenantByIdUse>;
type ViewerTenantBySlugUseData = ResultOf<typeof ViewerTenantBySlugUse>;
⋮----
export function useViewerTenants(options?: ViewerTenantsUseVars, config?: SWRConfiguration<ViewerTenantsUseData>)
⋮----
export function useViewerTenantById(tenant_id: number, config?: SWRConfiguration<ViewerTenantByIdUseData>)
⋮----
export function useViewerTenantBySlug(tenant_slug: string, config?: SWRConfiguration<ViewerTenantBySlugUseData>)
````

## File: apps/platform/lib/conversations/agent/agent-loop.ts
````typescript
import { anthropic } from "@ai-sdk/anthropic";
import type { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateText, stepCountIs } from "ai";
import { dedent } from "ts-dedent";
import { debug } from "~/lib/debug";
import type { ChannelSender } from "../channel-sender";
import { sendEmailNotification } from "../channel-sender-email";
import { sendSmsNotification } from "../channel-sender-twilio";
import { sendWebPushNotification } from "../channel-sender-web-push";
import { sendWhatsAppNotification } from "../channel-sender-whatsapp";
import type { InboundContext } from "../inbound-resolver";
import { buildPermittedTools } from "./tool-registry";
⋮----
export async function runAgentLoop(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  ctx: InboundContext,
): Promise<void>
⋮----
async function postAgentReply(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  ctx: InboundContext,
  replyText: string,
): Promise<void>
⋮----
type MessageChannel = "in_app" | "email" | "web_push" | "whatsapp" | "sms";
⋮----
// Insert delivery row for the originating channel.
⋮----
function buildSystemPrompt(ctx: InboundContext, availableToolNames: string[]): string
````

## File: apps/platform/lib/conversations/inbound-resolver.ts
````typescript
import type { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { debug } from "~/lib/debug";
⋮----
export type InboundChannel = "email" | "whatsapp" | "sms";
⋮----
export interface InboundParams {
  channel: InboundChannel;
  senderAddress: string;
  replyToken: string | null;
  providerMessageId: string;
  body: string;
  rawPayload: Record<string, unknown>;
  signatureVerified: boolean;
}
⋮----
export interface InboundContext {
  conversationMessageId: string;
  conversationId: string;
  profileId: string;
  organizationId: number | null;
  agencyId: number | null;
  tenantId: number | null;
  alreadyResolved: boolean;
  idempotencyKey: string;
  threadMessages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  channel: InboundChannel;
  body: string;
}
⋮----
export interface InboundRejection {
  reason: "sender_not_verified" | "conversation_not_found" | "no_membership" | "error";
  detail: string;
}
⋮----
export type ResolveInboundResult = { ok: true; ctx: InboundContext } | { ok: false; rejection: InboundRejection };
⋮----
export async function resolveInbound(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  params: InboundParams,
): Promise<ResolveInboundResult>
⋮----
type MessageChannel = "in_app" | "email" | "web_push" | "whatsapp" | "sms";
⋮----
// system/agent outbound = assistant; user inbound = user
````

## File: apps/platform/lib/mcp/tools/profile.ts
````typescript
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { debug } from "~/lib/debug";
import { getGraphyFromMcpAssert } from "~/lib/mcp/clients";
import { type InferArgs, type McpContext, McpTool, type McpToolStream } from "~/lib/mcp/tool";
⋮----
type UpdateProfileArgs = InferArgs<typeof UpdateProfileSchema>;
⋮----
export class UpdateProfileTool extends McpTool<typeof UpdateProfileSchema>
⋮----
async *handle(args: UpdateProfileArgs, ctx: McpContext): McpToolStream
````

## File: apps/platform/lib/i18n.ts
````typescript
import { LocaleConfig } from "@packages/rosetta/locale-config";
import { type RosettaDict, RosettaImpl } from "@packages/rosetta/rosetta";
⋮----
export function ROSETTA<T>(dict: RosettaDict<T>, locale: string)
⋮----
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
⋮----
export function IS_SUPPORTED_LOCALE(value: unknown): value is SupportedLocale
⋮----
export function LOCALE_SUPPORTED_RESOLVE(value: unknown): SupportedLocale | null
⋮----
function LOCALE_TAG_NORMALIZE(locale: string): string
````

## File: apps/platform/lib/route.ts
````typescript
import { IS_STRING } from "@packages/utils/string";
import type { Route } from "next";
⋮----
type RouteQueryValue = bigint | boolean | number | string;
type RouteQuery = Record<string, RouteQueryValue | readonly RouteQueryValue[] | null | undefined>;
⋮----
type RouteParamNames<Pathname extends string> = Pathname extends `${string}[[...${infer Param}]]${infer Rest}`
  ? Param | RouteParamNames<Rest>
  : Pathname extends `${string}[...${infer Param}]${infer Rest}`
    ? Param | RouteParamNames<Rest>
    : Pathname extends `${string}[${infer Param}]${infer Rest}`
      ? Param | RouteParamNames<Rest>
      : never;
⋮----
type RequiredRouteParamNames<Pathname extends string> = Exclude<RouteParamNames<Pathname>, "locale">;
⋮----
type RouteQueryFor<Pathname extends string> = RouteQuery & {
  [Param in RequiredRouteParamNames<Pathname>]: RouteQueryValue;
} & {
  locale?: RouteQueryValue;
};
⋮----
type RouteArguments<Pathname extends string> = [RequiredRouteParamNames<Pathname>] extends [never]
  ? [query?: RouteQueryFor<Pathname>, hash?: string]
  : [query: RouteQueryFor<Pathname>, hash?: string];
⋮----
export type AppRoute<Pathname extends string = string> = {
  pathname: Pathname;
  query?: RouteQueryFor<Pathname>;
  hash?: string;
};
⋮----
export function ROUTE_PATH<const Pathname extends string>(pathname: Pathname & Route<Pathname>): Pathname
⋮----
export function ROUTE<const Pathname extends string>(
  pathname: Pathname & Route<Pathname>,
  ...[query, hash]: RouteArguments<Pathname>
): Route
⋮----
export function UNSAFE_ROUTE(pathname: string, query?: RouteQuery, hash?: string): AppRoute
⋮----
export function ROUTE_HREF(route: AppRoute | Route): Route
````

## File: apps/platform/test/server-only.ts
````typescript

````

## File: packages/debug/package.json
````json
{
  "name": "@packages/debug",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "exports": {
    "./react-logger": "./src/react-logger.tsx",
    "./*": "./src/*.ts"
  },
  "scripts": {
    "build:dry": "tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "format": "biome check --diagnostic-level=error ."
  },
  "dependencies": {
    "diary": "^0.4.5"
  },
  "devDependencies": {
    "@packages/typescript-config": "workspace:*",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.17",
    "react": "^19.2.7",
    "typescript": "^6.0.3",
    "vitest": "^4.1.9"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
````

## File: packages/rosetta/src/rosetta.ts
````typescript
import { ErrorExtendable } from "@packages/utils/errors";
import dlv from "dlv";
import tmpl from "templite";
⋮----
type Key = string | number | bigint | symbol;
⋮----
type PropType<T, Path extends Key> = string extends Path
  ? unknown
  : Path extends keyof T
    ? T[Path]
    : Path extends `${infer K}.${infer R}`
      ? K extends keyof T
        ? PropType<T[K], R>
        : unknown
      : unknown;
⋮----
type ResolvePropType<T, Path extends Key> =
  PropType<T, Path> extends (...args: any[]) => infer R ? R : PropType<T, Path>;
⋮----
type Join<T extends unknown[], D extends string> = T extends []
  ? ""
  : T extends [string | number | boolean | bigint]
    ? `${T[0]}`
    : T extends [string | number | boolean | bigint, ...infer U]
      ? `${T[0]}${D}${Join<U, D>}`
      : string;
⋮----
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly any[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};
⋮----
export interface RosettaOptions {
  strict?: boolean;
}
⋮----
export type RosettaDict<T> = Record<string, DeepPartial<T>>;
⋮----
export class RosettaImpl<T>
⋮----
protected constructor(
    public readonly tree: Map<string, T>,
    public readonly locale: string,
    public readonly options: RosettaOptions = {},
)
⋮----
public static fromDictionary<T>(dict: RosettaDict<T>, locale: string, options?: RosettaOptions): RosettaImpl<T>
⋮----
public get TError()
⋮----
type TParams = Parameters<typeof t>;
⋮----
constructor(key: TParams[0], params?: TParams[1], cause?: unknown)
⋮----
function OBJECT_IS_PLAIN(value: unknown): value is Record<string, unknown>
⋮----
function OBJECT_EXPAND_DOTTED_KEYS(obj: Record<string, unknown>): Record<string, unknown>
⋮----
function OBJECT_MERGE_DEEP_INTO(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown>
⋮----
function MERGE_LOCALES(dict: Record<string, unknown>): Record<string, unknown>
⋮----
function RESOLVE_DICTIONARY_LOCALE(locale: string, keys: string[]): string
⋮----
function LOCALE_TAG_NORMALIZE(locale: string): string
````

## File: packages/supabase/src/client.browser.ts
````typescript
import { createBrowserClient as createBrowserClientSsr } from "@supabase/ssr";
import { SUPABASE_JWT_DECODE_PAYLOAD, SUPABASE_JWT_METADATA } from "./jwt";
import type { AppMetadata } from "./metadata";
import type { Database } from "./types.ts";
⋮----
export function createSupabaseBrowserClient()
⋮----
export function getSupabaseClient()
⋮----
export async function getSupabaseClientUser()
⋮----
export async function getSupabaseClientSession()
⋮----
export async function getSupabaseClientUserMetadata(): Promise<AppMetadata | null>
````

## File: packages/supabase/src/client.middleware.ts
````typescript
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "./types.ts";
⋮----
export async function updateSession(request: NextRequest)
⋮----
getAll()
setAll(cookiesToSet:
````

## File: packages/supabase/src/client.service.ts
````typescript
import { ENV } from "@packages/utils/env";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types.ts";
⋮----
export function createSupabaseServiceRoleClient()
````

## File: packages/ui-common/src/shadcn/components/ui/input-otp.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";
⋮----
containerClassName=
className=
````

## File: packages/utils/src/url.ts
````typescript
import type { Maybe } from "./maybe";
⋮----
export function IS_EMAIL(input: unknown): input is string
⋮----
export type URLParts = Pick<URL, (typeof URL_FIELDS)[number]>;
⋮----
export type ExtractURLSegments<S extends string> = S extends `${string}[${infer K}]${infer Rest}`
  ? K | ExtractURLSegments<Rest>
  : never;
⋮----
type ReplaceRecord<TUrl extends string | URL> = TUrl extends string
  ? [ExtractURLSegments<TUrl>] extends [never]
    ? Record<string, string | number>
    : Partial<Record<ExtractURLSegments<TUrl>, string | number>>
  : Record<string, string | number>;
⋮----
export function URL_NEW<const TUrl extends string | URL>(
  url: TUrl,
  base?: string | URL,
  overwrite?: Partial<URLParts> & { params?: Record<string | number, any>; replace?: ReplaceRecord<TUrl> },
)
⋮----
export interface URLFormatOptions {
  protocol?: boolean;
  hostname?: boolean;
  port?: boolean;
  pathname?: boolean;
  search?: boolean;
  hash?: boolean;
}
⋮----
export function URL_FORMAT(url: URL, opts?: URLFormatOptions): string
⋮----
// TODO: add more
⋮----
// TODO: replace will only replace first occurrence.
function HREF_FORMAT_REDUCER(acc: string, [key, value]: any[])
⋮----
/**
 * We use this to format href with dynamic params and query strings based on Next.js Link component.
 * When using query, any previous query string in the href will be removed and undefined/null values will be skipped.
 * @example
 * const path = FORMAT_HREF("/dashboard/[tenant]", { tenant: "foo" });
 * const pathWithQuery = FORMAT_HREF("/dashboard/[tenant]", { tenant: "foo" }, { ref: "bar" });
 */
export function HREF_FORMAT(href: string, params?: Maybe<Record<string, any>>, query?: Maybe<Record<string, any>>)
⋮----
export function URL_UTM(
  url: URL,
  options: { source?: string; medium?: string; campaign?: string; content?: string },
): URL
⋮----
export function EMAIL_NORMALIZE(
  email: string,
  { tags = "remove-all" }: { tags?: "keep" | "remove-gmail" | "remove-all" } = {},
): string
⋮----
export function EMAIL_REMOVE_TAGS(email: string): string
⋮----
/**
 * Parses hash parameters from a URL object and returns them as a record.
 * @example
 * const url = new URL("https:
 * const params = URL_PARSE_HASH(url);
 * const object = Object.fromEntries(params.entries());
 */
export function IS_EXTERNAL(href: string): boolean
⋮----
export function URL_PARSE_HASH(url: URL): URLSearchParams
````

## File: scripts/development/worktree-setup.sh
````bash
set -e
if [ -z "$WORKTREE_NAME" ] || [ -z "$WORKTREE_PORT" ] || [ -z "$WORKTREE_ROOT_PATH" ] || [ -z "$WORKTREE_PROJECT" ]; then
  echo "Required: WORKTREE_NAME, WORKTREE_PORT, WORKTREE_ROOT_PATH, WORKTREE_PROJECT"
  echo "Example (Conductor): WORKTREE_NAME=\$CONDUCTOR_WORKSPACE_NAME WORKTREE_PORT=\$CONDUCTOR_PORT WORKTREE_ROOT_PATH=\$CONDUCTOR_ROOT_PATH WORKTREE_PROJECT=myproject bash scripts/development/worktree-setup.sh"
  exit 1
fi
copy_if_exists() {
  local src="$1"
  local dst="$2"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
  else
    echo "Warning: $src not found, skipping."
  fi
}
export BASE=${WORKTREE_PORT}
export WS=$(echo "${WORKTREE_NAME}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
export PROJECT=$(echo "${WORKTREE_PROJECT}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
export PROJECT_PREFIX=$(printf '%s' "${PROJECT}" | cut -c1-20 | sed 's/-$//')
export WS_HASH=$(printf '%s' "${PROJECT}:${WS}" | shasum -a 256 | cut -c1-12)
if [ -z "$PROJECT_PREFIX" ]; then
  export PROJECT_PREFIX="workspace"
fi
export INSTANCE_KEY="${PROJECT_PREFIX}-${WS_HASH}"
python3 - <<PYEOF
import re, os, sys
base = int(os.environ['BASE'])
instance_key = os.environ['INSTANCE_KEY']
path = 'packages/supabase/supabase/config.toml'
with open(path) as f:
    lines = f.readlines()
section = None
result = []
for line in lines:
    m = re.match(r'^\[([a-z_.]+)\]\s*$', line)
    if m:
        section = m.group(1)
    if re.match(r'^project_id\s*=', line):
        line = f'project_id = "{instance_key}"\n'
    elif section == 'api'       and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+1}\n'
    elif section == 'db'        and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+2}\n'
    elif section == 'db'        and re.match(r'^shadow_port\s*=', line): line = f'shadow_port = {base+3}\n'
    elif section == 'studio'    and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+4}\n'
    elif section == 'inbucket'  and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+5}\n'
    elif section == 'analytics' and re.match(r'^port\s*=\s*\d+', line): line = f'port = {base+6}\n'
    result.append(line)
with open(path, 'w') as f:
    f.writelines(result)
print(f"Supabase config patched: project={instance_key}")
print(f"  API:{base+1}  DB:{base+2}  shadow:{base+3}  Studio:{base+4}  Inbucket:{base+5}  Analytics:{base+6}")
PYEOF
# Hide the patched config.toml from git status in this worktree (changes are intentional per-workspace)
git update-index --skip-worktree packages/supabase/supabase/config.toml
# --- Copy gitignored files from root workspace ---
copy_if_exists "$WORKTREE_ROOT_PATH/.env.local" ./.env.local
copy_if_exists "$WORKTREE_ROOT_PATH/apps/platform/.env.local" ./apps/platform/.env.local
mkdir -p apps/platform/certificates
ROOT_CERT="$WORKTREE_ROOT_PATH/apps/platform/certificates/lvh.me-cert.pem"
ROOT_KEY="$WORKTREE_ROOT_PATH/apps/platform/certificates/lvh.me-key.pem"
if [ -f "$ROOT_CERT" ] && [ -f "$ROOT_KEY" ]; then
  cp "$ROOT_CERT" ./apps/platform/certificates/lvh.me-cert.pem
  cp "$ROOT_KEY" ./apps/platform/certificates/lvh.me-key.pem
else
  bash scripts/development/https-setup.sh
fi
mkdir -p .claude
copy_if_exists "$WORKTREE_ROOT_PATH/.claude/settings.local.json" ./.claude/settings.local.json
pnpm install
REF_DIR="$HOME/.worktree-refs/${INSTANCE_KEY}"
REF_FILE="$REF_DIR/$(pwd | tr '/' '_')"
mkdir -p "$REF_DIR"
touch "$REF_FILE"
RUNNING=$(docker ps -q --filter "label=com.supabase.cli.project=${INSTANCE_KEY}" 2>/dev/null | wc -l | tr -d ' ')
if [ "$RUNNING" -gt 0 ]; then
  echo "Supabase ${INSTANCE_KEY} already running, skipping db:start"
else
  PORT=$WORKTREE_PORT pnpm db:start
fi
PORT=$WORKTREE_PORT pnpm run -w db:env:development
````

## File: apps/platform/app/(app)/home/_components/user-menu.tsx
````typescript
import { INITIALS_OF } from "@packages/utils/string";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
⋮----
href=
````

## File: apps/platform/app/(app)/home/account/notifications/contacts-manage.tsx
````typescript
import { isGraphyGraphQLError } from "@packages/graphy/graphy";
import { useGraphyMutation, useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { Database } from "@packages/supabase/types";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { useState } from "react";
import { gql } from "~/generated/graphql";
import type { MessageChannel as MessageChannelEnum } from "~/generated/graphql/graphql";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type MessageChannel = Database["public"]["Enums"]["message_channel"];
⋮----
function ADD_FORM_ID(channel: MessageChannel): string
⋮----
function startAdding(channel: MessageChannel)
⋮----
function cancelAdding()
⋮----
async function submitContact()
⋮----
async function deleteContact(contactId: string)
⋮----
onClick=
⋮----
aria-label=
⋮----
id=
````

## File: apps/platform/app/(app)/home/account/profile/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { ProfileAvatarControls } from "~/components/profile-avatar-controls";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { ProfileForm } from "./profile-form";
````

## File: apps/platform/app/(app)/home/account/profile/profile-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type Values = z.infer<typeof schema>;
````

## File: apps/platform/app/(app)/home/account/security/page.tsx
````typescript
import { createSupabaseServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, Fingerprint, IdCard, Lock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { type AppRoute, ROUTE, UNSAFE_ROUTE } from "~/lib/route";
⋮----
desc=
⋮----
actionHref=
⋮----
actionLabel=
⋮----
className=
⋮----
<span className=
⋮----
href=
````

## File: apps/platform/app/(app)/home/invites/[invite_id]/page.tsx
````typescript
import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { SINGLE } from "@packages/utils/array";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowRight, Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
⋮----
type AcceptState = "valid" | "loggedout" | "expired" | "claimed" | "rejected";
⋮----
export async function generateMetadata(props: PageProps<"/home/invites/[invite_id]">): Promise<Metadata>
⋮----
<Link href=
````

## File: apps/platform/app/(app)/home/layout.tsx
````typescript
export default function HomeLayout(props: LayoutProps<"/home">)
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/inbox/[conversation_id]/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { actionMarkRead } from "~/components/inbox/actions";
import { ConversationThread } from "~/components/inbox/conversation-thread";
import { SCOPE_INBOX_HREF } from "~/components/inbox/scope";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
⋮----
export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/inbox/[conversation_id]">,
): Promise<Metadata>
⋮----
export default async function OrgConversationPage(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/inbox/[conversation_id]">,
)
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/external-access/actions.ts
````typescript
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { debug } from "~/lib/debug";
import { getRosetta } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";
⋮----
type GrantAgencyAccessValues = z.infer<typeof grantAgencyAccessSchema>;
⋮----
type RevokeAgencyAccessValues = z.infer<typeof revokeAgencyAccessSchema>;
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/dashboard-overview.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Card } from "@packages/ui-common/shadcn/components/ui/card";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  ArrowUpRight,
  Box,
  Circle,
  CircleCheck,
  FileText,
  LayoutPanelLeft,
  type LucideIcon,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type Period = "today" | "week" | "month";
⋮----
type StatKey = "members" | "projects" | "documents" | "storage";
type Stat = {
  key: StatKey;
  value: string;
  delta?: string;
  up?: boolean;
  subKey?: "storage_sub";
  progress?: number;
  Icon: LucideIcon;
};
⋮----
type VerbKey = "invited" | "published" | "commented" | "joined" | "integration";
type ActivityItem = { who: string; verb: VerbKey; target: string; time: string; initials: string; tone: string };
⋮----
type RoleKey = "owner" | "admin" | "editor" | "viewer";
type TeamMember = { name: string; role: RoleKey; initials: string; you: boolean; tone: string };
⋮----
type ChecklistKey = "org" | "team" | "project" | "integration";
type ChecklistStep = { key: ChecklistKey; done: boolean };
⋮----
sub=
⋮----
<CardHeading title=
⋮----
className=
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/page.tsx
````typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { DashboardOverview } from "./dashboard-overview";
import { TenantOnboardingBanner } from "./onboarding/onboarding-banner";
⋮----
export async function generateMetadata(props: PageProps<"/t/[tenant_slug]/[organization_id]">): Promise<Metadata>
⋮----
export default async function OrganizationHomePage(props: PageProps<"/t/[tenant_slug]/[organization_id]">)
````

## File: apps/platform/app/(marketing)/contact-booking.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ROUTE } from "~/lib/route";
⋮----
type ContactBookingProps = {
  labels: { week: string; timezone: string; book: string; write: string };
  days: string[];
};
⋮----
className=
⋮----
<Link href=
````

## File: apps/platform/app/(marketing)/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@packages/ui-common/shadcn/components/ui/accordion";
import { Avatar, AvatarFallback } from "@packages/ui-common/shadcn/components/ui/avatar";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Card, CardContent } from "@packages/ui-common/shadcn/components/ui/card";
import { INITIALS_OF } from "@packages/utils/string";
import { URL_NEW } from "@packages/utils/url";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Organization, WebSite, WithContext } from "schema-dts";
import { JsonLd } from "~/components/json-ld";
import { APP_URL } from "~/lib/constants";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { ContactBooking } from "./contact-booking";
⋮----
export async function generateMetadata(props: PageProps<"/">): Promise<Metadata>
````

## File: apps/platform/app/auth/_components/oauth-section.tsx
````typescript
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { signInWithOAuth } from "../actions";
import { MAIN_OAUTH, MORE_OAUTH } from "../providers";
⋮----
aria-label=
⋮----
onClick=
````

## File: apps/platform/app/auth/_components/passkey-sign-in-button.tsx
````typescript
import { useSupabase } from "@packages/supabase/react";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
export function PasskeySignInButton(
⋮----
function onClick()
````

## File: apps/platform/app/auth/onboarding/profile/profile-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
⋮----
type Values = z.infer<typeof schema>;
````

## File: apps/platform/app/auth/onboarding/state.server.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { METHOD_ORDER, type OnboardingState } from "./state";
⋮----
export async function getViewerOnboardingState(): Promise<OnboardingState>
⋮----
export function ASSERT_KNOWN_METHOD(id: string): id is (typeof METHOD_ORDER)[number]
````

## File: apps/platform/app/auth/phone/phone-step-form.tsx
````typescript
import { useSupabase } from "@packages/supabase/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ArrowRight, MessageCircle, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE_HREF, UNSAFE_ROUTE } from "~/lib/route";
import { OtpField } from "../_components/otp-field";
⋮----
type Channel = "sms" | "whatsapp";
⋮----
type Props = {
  phone: string;
  next: string;
  channels: Channel[];
};
⋮----
function onSend(channel: Channel)
⋮----
function onVerify(e: React.FormEvent)
````

## File: apps/platform/app/robots.ts
````typescript
import type { MetadataRoute } from "next";
import { isApexHost } from "~/lib/apex";
import { APP_HOST } from "~/lib/constants";
⋮----
export default async function robots(): Promise<MetadataRoute.Robots>
````

## File: apps/platform/app/sitemap.ts
````typescript
import type { MetadataRoute } from "next";
import { isApexHost } from "~/lib/apex";
import { APP_URL } from "~/lib/constants";
⋮----
export default async function sitemap(): Promise<MetadataRoute.Sitemap>
⋮----
function PAGE(
    path: string,
    data: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap[number]
````

## File: apps/platform/components/inbox/scope-selector.tsx
````typescript
import type { ResultOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Building2, ChevronDown, Globe, Landmark } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { InboxScope } from "~/components/inbox/scope";
import { SCOPE_INBOX_HREF } from "~/components/inbox/scope";
import { Tip, useClickOutside } from "~/components/shell/atoms";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type ScopeOrg = {
  organization_id: number;
  organization_name: string;
  tenant_slug: string;
};
⋮----
type ScopeAgency = {
  agency_id: number;
  agency_slug: string;
  agency_name: string;
};
⋮----
function IS_SCOPE_ACTIVE(current: InboxScope, candidate: InboxScope): boolean
⋮----
function SCOPE_LABEL(scope: InboxScope, t: Translate): string
⋮----
type Translate = (key: keyof typeof LOCALE_EN) => string;
⋮----
<Tip label=
⋮----
⋮----
isActive=
⋮----
className=
⋮----
<div className=
````

## File: apps/platform/components/shell/nav-tree.ts
````typescript
import { Building2, ExternalLink, Globe, Home, type LucideIcon, Settings, Users } from "lucide-react";
import type { Route } from "next";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
⋮----
export type NavLeaf = {
  id: string;
  label: string;
  href: Route;
  path: string;
  Icon: LucideIcon;
  badge?: number;
  exact?: boolean;
};
⋮----
export type NavGroup = {
  id: string;
  label: string;
  Icon: LucideIcon;
  defaultOpen?: boolean;
  children: NavLeaf[];
};
⋮----
export type NavItem = NavLeaf | NavGroup;
⋮----
export type NavLabels = {
  navHome: string;
  navOrganization: string;
  navCompany: string;
  navGeneral: string;
  navMembers: string;
  navExternalAccess: string;
  navDomains: string;
};
⋮----
export function IS_NAV_GROUP(item: NavItem): item is NavGroup
⋮----
export function BUILD_NAV_TREE(tenant_slug: string, organization_id: number, labels: NavLabels): NavItem[]
⋮----
export function LEAF_IS_ACTIVE(pathname: string, leaf: NavLeaf): boolean
⋮----
export function GROUP_CONTAINS_ACTIVE(pathname: string, group: NavGroup): boolean
⋮----
export function PICK_ACTIVE_LEAF_ID(items: NavItem[], pathname: string): string | null
````

## File: apps/platform/components/profile-avatar-controls.tsx
````typescript
import type { ComponentProps } from "react";
import { EntityLogoControls } from "~/components/entity-logo-controls";
⋮----
export function ProfileAvatarControls({
  profileId,
  name,
  avatarSrc,
  ...props
}: {
  profileId: string;
  name: string;
  avatarSrc: string | null;
} & Omit<ComponentProps<typeof EntityLogoControls>, "bucket" | "ownerKey" | "name" | "src" | "shape">)
````

## File: apps/platform/components/theme-toggle.tsx
````typescript
import { useMounted } from "@packages/react-hooks/use-mounted";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { useRosetta } from "~/lib/i18n.client";
````

## File: apps/platform/hooks/get-viewer-organizations.ts
````typescript
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { notFound } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
⋮----
export type ViewerOrganizationGetFragmentType = ResultOf<typeof ViewerOrganizationGetFragment>;
⋮----
type ViewerOrganizationsGetVars = VariablesOf<typeof ViewerOrganizationsGet>;
⋮----
export async function getViewerOrganizationByIdAssert(organization_id: number)
⋮----
export async function getViewerOrganizationBySlugAssert(organization_slug: string)
````

## File: apps/platform/hooks/use-locale-cookie.ts
````typescript
import { useStateCookie } from "@packages/react-hooks/use-state-cookie";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { LOCALE_COOKIE, type SupportedLocale } from "~/lib/i18n";
import { useLocale } from "~/lib/i18n.client";
⋮----
export function useLocaleCookie()
⋮----
function selectLocale(next: SupportedLocale)
````

## File: apps/platform/hooks/use-push-permission.ts
````typescript
import { useSupabase } from "@packages/supabase/react";
import { useEffect, useState } from "react";
import { useViewerProfile } from "./use-viewer-profile";
⋮----
export type PushPermissionState = "default" | "granted" | "denied" | "unsupported" | "no_vapid";
⋮----
export function usePushPermission()
⋮----
async function requestPermission()
⋮----
async function unsubscribe()
⋮----
function URL_BASE64_TO_UINT8ARRAY(base64String: string): Uint8Array
````

## File: apps/platform/hooks/use-viewer-agencies.ts
````typescript
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { useGraphyQuery } from "@packages/graphy/react";
import { useSupabaseUser } from "@packages/supabase/react";
import type { SWRConfiguration } from "swr";
import { gql } from "~/generated/graphql";
⋮----
export type ViewerAgencyUseFragmentType = ResultOf<typeof ViewerAgencyUseFragment>;
⋮----
type ViewerAgenciesUseData = ResultOf<typeof ViewerAgenciesUse>;
type ViewerAgenciesUseVars = VariablesOf<typeof ViewerAgenciesUse>;
type ViewerAgencyByIdUseData = ResultOf<typeof ViewerAgencyByIdUse>;
type ViewerAgencyBySlugUseData = ResultOf<typeof ViewerAgencyBySlugUse>;
⋮----
export function useViewerAgencies(options?: ViewerAgenciesUseVars, config?: SWRConfiguration<ViewerAgenciesUseData>)
⋮----
export function useViewerAgencyById(agency_id: number, config?: SWRConfiguration<ViewerAgencyByIdUseData>)
⋮----
export function useViewerAgencyBySlug(agency_slug: string, config?: SWRConfiguration<ViewerAgencyBySlugUseData>)
````

## File: apps/platform/lib/auth-next.ts
````typescript
import { URL_NEW } from "@packages/utils/url";
⋮----
export function RESOLVE_AUTH_NEXT(raw: string | null, origin: string): string
````

## File: apps/platform/lib/i18n.server.ts
````typescript
import { match } from "@formatjs/intl-localematcher";
import type { RosettaDict } from "@packages/rosetta/rosetta";
import Negotiator from "negotiator";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  IS_SUPPORTED_LOCALE,
  LOCALE_COOKIE,
  LOCALE_SUPPORTED_RESOLVE,
  ROSETTA,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "./i18n";
⋮----
export async function getServerLocale(): Promise<SupportedLocale>
⋮----
export function assertLocale(value: unknown): asserts value is SupportedLocale
⋮----
export function LOCALE_FROM_REQUEST(request: NextRequest): SupportedLocale
⋮----
export function HEADER_ACCEPT_LANGUAGE_PARSE(header: string | null): SupportedLocale | null
⋮----
export async function getRosetta<T>(dict: RosettaDict<T>, locale?: string)
````

## File: packages/react-hooks/package.json
````json
{
  "name": "@packages/react-hooks",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "scripts": {
    "build:dry": "tsc --noEmit",
    "format": "biome check --diagnostic-level=error .",
    "test": "vitest run"
  },
  "exports": {
    "./*": "./src/*.ts"
  },
  "dependencies": {
    "@packages/utils": "workspace:*"
  },
  "devDependencies": {
    "@packages/typescript-config": "workspace:*",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.17",
    "jsdom": "^29.1.1",
    "typescript": "^6.0.3",
    "vitest": "^4.1.9"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
````

## File: scripts/development/worktree-archive.sh
````bash
set -e
WS=$(echo "${WORKTREE_NAME:-local}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
PROJECT=$(printf '%s' "${WORKTREE_PROJECT:-}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
PROJECT_PREFIX=$(printf '%s' "${PROJECT}" | cut -c1-20 | sed 's/-$//')
WS_HASH=$(printf '%s' "${PROJECT}:${WS}" | shasum -a 256 | cut -c1-12)
if [ -z "$PROJECT_PREFIX" ]; then
  PROJECT_PREFIX="workspace"
fi
INSTANCE_KEY="${PROJECT_PREFIX}-${WS_HASH}"
REF_DIR="$HOME/.worktree-refs/${INSTANCE_KEY}"
REF_FILE="$REF_DIR/$(pwd | tr '/' '_')"
rm -f "$REF_FILE"
for _stale_ref in "$REF_DIR"/*; do
  [ -f "$_stale_ref" ] || continue
  _stale_dir=$(basename "$_stale_ref" | tr '_' '/')
  [ -d "$_stale_dir" ] || rm -f "$_stale_ref"
done
REF_COUNT=$(ls "$REF_DIR" 2>/dev/null | wc -l | tr -d ' ')
if [ "$REF_COUNT" -gt 0 ]; then
  echo "Supabase ${INSTANCE_KEY} still used by ${REF_COUNT} other worktree(s), skipping shutdown"
else
  rmdir "$REF_DIR" 2>/dev/null || true
  CIDS=$(docker ps -aq --filter "label=com.supabase.cli.project=${INSTANCE_KEY}" 2>/dev/null)
  [ -n "$CIDS" ] && docker rm -f $CIDS >/dev/null 2>&1 || true
  VOLS=$(docker volume ls -q --filter "label=com.supabase.cli.project=${INSTANCE_KEY}" 2>/dev/null)
  [ -n "$VOLS" ] && docker volume rm $VOLS >/dev/null 2>&1 || true
  docker network rm "supabase_network_${INSTANCE_KEY}" >/dev/null 2>&1 || true
fi
rm -rf node_modules
````

## File: skills/my-proxy/SKILL.md
````markdown
---
name: my-proxy
description: Repository-specific Next.js proxy routing for locale, apex, tenant path gate, Supabase session refresh, public paths, auth gates, tenant membership, and cookies.
---

# Platform Proxy

File: `apps/platform/proxy.ts`. This skill means Next.js request proxy, not network/SOCKS proxy.

## Order

Preserve order:

1. Classify host: apex / Vercel preview (treat as apex) / unknown (redirect to apex). All tenant routing is path-based (`/t/{slug}/...`) — no subdomain extraction.
2. Resolve locale from the `NEXT_LOCALE` cookie (else `Accept-Language`/default); mirror it onto the request and persist on the response only when absent. Locale never appears in the URL — there is no sentinel.
3. Global metadata asset paths (`/icon`, `/opengraph-image`, …) → `updateSession`, return.
4. Canonical `/health` → `updateSession`, return (no auth).
5. `updateSession` — refresh the Supabase session.
6. Bots on public paths → public content, no session overhead.
7. Public paths → allow; redirect logged-in users off auth-entry pages to `/home`; bootstrap PostHog on marketing paths.
8. Everything else is a protected path → pass the refreshed session through.

Reordering can break cookie/session visibility. **The auth and tenant-membership gates are NOT in the proxy — they live in the route layouts** (see Auth + Tenant gate below).

## Host constants

From `apps/platform/lib/constants.ts`:

```ts
APEX_HOSTNAME
APP_PORT
APP_HOST
```

`NEXT_PUBLIC_APEX_HOSTNAME` is hostname only. Port comes from `PORT`. Do not hardcode `7003`
inside proxy URLs.

## Public routes

Current regex:

```ts
const PUBLIC_PATH_REGEX =
  /^(\/|(\/(?:auth|legal|faq|pricing|opengraph-image|twitter-image|icon)(?:\/|$)))/;
```

New public marketing route must be added here. Matcher already excludes API/static/image and
metadata files.

## Session

```ts
const { response: sessionResponse, supabase } =
  await updateSession(request);
```

`updateSession` mutates request cookies and response cookies, then calls `auth.getUser()` to
rotate token. Rewrites/redirects must preserve session cookies with `copyCookies` where needed.

Locale cookie must mutate incoming request before this call:

```ts
request.cookies.set(LOCALE_COOKIE, locale);
```

Otherwise server components see stale locale during same request.

## Auth + tenant gates live in layouts, not the proxy

The proxy passes protected paths through; the access-control gates are server-component layouts:

- **Auth gate** — `app/(app)/layout.tsx` calls `getSupabaseServerUserRedirect()`, redirecting unauthenticated users to `/auth`.
- **Tenant membership** — `app/(app)/t/[tenant_slug]/layout.tsx` calls `getViewerTenantBySlugAssert(tenant_slug)`; it runs through the user's session client so RLS returns the tenant only for a member / agency-grant holder, otherwise `notFound()`. The JWT carries only `profile_id` (`sub`); membership is resolved from the DB (`viewer_tenant_ids` / `viewer_tenant_validate`), never the token.
- **Org-in-tenant** — `app/(app)/t/[tenant_slug]/[organization_id]/layout.tsx` validates the org belongs to the tenant, else `notFound()`.

The only app-path redirect the proxy itself performs is bouncing already-logged-in users off auth-entry pages (`/auth`, `/auth/email`, …) to `/home`.

## Custom domains

`tenant_domains` schema exists, but the proxy does not resolve custom domains. Unknown hosts
redirect to the configured apex. Custom domain support (phase 2) would add a DB lookup here:
hostname → tenant slug → path `/t/{slug}/...`.

## Tests

Routing/auth changes need Playwright journeys. Cover apex, tenant path access, unauthenticated
redirect, forbidden tenant, public path, and cookie preservation.
````

## File: .env.example
````
# Supabase Local Development
# Default values from `pnpm db:start`. Not secrets — only work locally.
# Copy to apps/platform/.env.local and apps/tenant/.env.local

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54421
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Cookie domain so the apex (lvh.me:7003) and any tenant subdomain ({slug}.lvh.me:7003) share the session.
# `lvh.me` is a public DNS wildcard that resolves every name (including subdomains) to 127.0.0.1 —
# no /etc/hosts edits required. Browsers accept cookies on it because it has a real TLD.
# Local dev: "lvh.me". Production: "example.com". Leave blank to fall back to host-only cookies.
NEXT_PUBLIC_COOKIE_DOMAIN=lvh.me

# The apex hostname for this deployment (no port — port comes from `PORT`, which the
# dev script binds to via `--port ${PORT:-7003}` and Conductor assigns per parallel instance).
# Local dev: "lvh.me". Production: "example.com".
NEXT_PUBLIC_APEX_HOSTNAME=lvh.me

# Dev-only mailbox (Inbucket from `pnpm db:start`). Surfaced as a "Development only"
# link on the signup success state so you can grab the magic-link confirmation email
# without leaving the browser. Leave blank in production.
NEXT_PUBLIC_DEV_MAILBOX_URL=http://localhost:54424

# Server-side log namespaces (diary via @packages/debug, wired in apps/platform/lib/debug.ts).
# Default in dev shows everything under "platform:*". Narrow to a slice while debugging, e.g.
#   DEBUG="platform:passkeys:*"
#   DEBUG="platform:auth:*,-platform:auth:login"   # exclude noise with a leading "-"
# Empty or unset = silent.
DEBUG=platform:*

# ------------------------------------------------------------
# OAuth providers (read by supabase/config.toml on `pnpm db:start`)
# Create credentials at the provider console; configure each callback as:
#   http://127.0.0.1:54421/auth/v1/callback   (local)
#   https://<project>.supabase.co/auth/v1/callback   (prod)
# Leave any unused provider blank — `pnpm db:start` will skip it.
# ------------------------------------------------------------

# Google — https://console.cloud.google.com/apis/credentials
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=

# Microsoft (Azure / Entra) — https://portal.azure.com (App registrations)
SUPABASE_AUTH_EXTERNAL_AZURE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_AZURE_SECRET=

# LinkedIn — https://www.linkedin.com/developers/apps (use the OIDC product)
SUPABASE_AUTH_EXTERNAL_LINKEDIN_OIDC_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_LINKEDIN_OIDC_SECRET=

# GitHub — https://github.com/settings/developers (OAuth Apps)
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=

# Facebook — https://developers.facebook.com/apps
SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET=

# ------------------------------------------------------------
# Twilio (phone OTP for onboarding step + future MFA via SMS)
# Flip [auth.sms.twilio].enabled = true in config.toml after filling these in.
# https://console.twilio.com
# ------------------------------------------------------------
SUPABASE_AUTH_SMS_TWILIO_ACCOUNT_SID=
SUPABASE_AUTH_SMS_TWILIO_MESSAGE_SERVICE_SID=
SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN=

# ------------------------------------------------------------
# OpenTelemetry (optional — traces exported only when set)
# ------------------------------------------------------------
# OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
# OTEL_SERVICE_NAME=saas-template
# OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=YOUR_API_KEY

# ------------------------------------------------------------
# PostHog (optional — analytics and feature flags)
# Create a project at https://app.posthog.com and copy the key from Project Settings.
# ------------------------------------------------------------
# NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ------------------------------------------------------------
# Conversations / outbound delivery (Agent D — drain worker)
# ------------------------------------------------------------

# Resend — email delivery
# https://resend.com/api-keys
RESEND_API_KEY=
# The "from" address for outbound notification emails. Must be a verified domain in Resend.
RESEND_FROM=notifications@example.com
# Domain Resend uses for inbound email parsing (e.g. reply+<token>@<RESEND_INBOUND_DOMAIN>).
# Set up in Resend dashboard → Domains → Inbound. Used for reply-to correlation.
RESEND_INBOUND_DOMAIN=
# Svix webhook signing secret for Resend inbound events (Resend dashboard → Webhooks → Signing Secret).
# Required: inbound emails are rejected without this.
RESEND_WEBHOOK_SECRET=

# Conversations drain worker — shared secret for the internal POST route.
# Must be a long random string (e.g. `openssl rand -hex 32`).
# Set the same value in pg_cron / pg_net via app.drain_secret in supabase config.
# Manual trigger: curl -X POST https://<host>/api/internal/conversations/drain -H "x-drain-secret: <value>"
CONVERSATIONS_DRAIN_SECRET=

# Web Push — VAPID keys for browser push notifications
# Generate once: npx web-push generate-vapid-keys
# NEXT_PUBLIC_VAPID_PUBLIC_KEY is exposed to the browser (service worker subscription).
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=

# Anthropic API key — required for the inbound agent loop (P4).
# https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=

# WhatsApp via Kapso BSP
# https://kapso.io
KAPSO_API_KEY=
# Webhook signing secret for Kapso inbound webhooks (Kapso dashboard → Webhooks).
# Used to verify X-Kapso-Signature header. Required for WhatsApp inbound.
# NOTE: If Kapso does not expose a formal signing secret, contact Kapso support.
KAPSO_WEBHOOK_SECRET=

# SMS via Twilio (optional — skipped if not set; provider is isolated in channel-sender-twilio.ts)
# To enable: pnpm --filter @apps/platform add twilio  — then fill in values below.
# https://console.twilio.com
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_FROM=+1555XXXXXXX
````

## File: README.md
````markdown
# SaaS Template

A production-grade starter for building a multi-tenant SaaS: Next.js 16 + React 19 +
Supabase + Turborepo, with authentication (email/password, OAuth, phone OTP, WebAuthn
passkeys), two-level multi-tenancy with Postgres RLS, capability-based permissions, i18n,
React Email/PDF template packages, and a shadcn design system already wired together.

The repo ships with example product surfaces as reference implementations — replace them with
your own product; the infrastructure under `packages/*` is the part meant to be reused.

## Getting started

```bash
pnpm install
pnpm db:start                                       # starts local Supabase (Docker required)
cp .env.example apps/platform/.env.local            # copy local-dev defaults
bash scripts/development/https-setup.sh             # generate mkcert TLS certs (one-time)
pnpm dev                                            # runs all apps and packages in parallel
```

Open `https://lvh.me:7003`. (See HTTPS section below — passkeys / WebAuthn require it.)

## Local dev ports

| Service | Default port | URL |
|---|---|---|
| `apps/platform` | 7003 | https://lvh.me:7003 |
| Supabase Studio | 7100 | http://localhost:7100 |
| Supabase Inbucket (mailbox) | 54424 | http://localhost:54424 |
| `packages/react-email` | 7101 | http://localhost:7101 |
| `packages/react-pdf` | 7102 | http://localhost:7102 |

## Local HTTPS (required for passkeys)

`apps/platform` runs over HTTPS in dev because WebAuthn (`navigator.credentials.create` / `.get`) only works in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) — and the browser's secure-context allowlist matches the literal strings `localhost` / `127.0.0.1` / `[::1]`, not DNS aliases that resolve there. `lvh.me` resolves to `127.0.0.1` but is *not* on the allowlist, so plain HTTP fails with `window.PublicKeyCredential === undefined`.

The fix: [mkcert](https://github.com/FiloSottile/mkcert) + Next's `--experimental-https` flag. Install mkcert (`brew install mkcert` on macOS), then:

```bash
bash scripts/development/https-setup.sh
```

That script runs `mkcert -install` (adds the local CA to your system + Firefox trust stores) and generates `apps/platform/certs/lvh.me-{cert,key}.pem` covering `lvh.me`, `*.lvh.me`, `localhost`, and `127.0.0.1`. The `apps/platform` dev script picks those up automatically. Certs expire in ~2.5 years; re-run the script to refresh.

Files under `apps/platform/certs/` are gitignored (private keys, machine-specific). Each contributor runs `https-setup.sh` once on their own machine.

If you skip HTTPS setup: OAuth and email/password still work over plain `http://lvh.me:7003` (you'd also need to flip `WEBAUTHN_RELYING_PARTY_ORIGIN`, `site_url`, and `additional_redirect_urls` back to `http://`), but passkey registration and sign-in will fail silently in the browser.

## Useful commands

```bash
pnpm dev                  # start all services
pnpm build                # build all packages and apps
pnpm db:start             # start local Supabase
pnpm db:stop              # stop local Supabase
pnpm db:reset             # drop + replay schema + seed
pnpm generate:types       # regenerate Supabase TS types
```

## Docs

- `AGENTS.md` — full architecture, stack, and coding rules
- `skills/my-*` — source-backed per-subsystem agent guides

`pnpm install` symlinks bundled skills into `.agents/skills/` and `.claude/skills/`.
`my-proxy` documents `apps/platform/proxy.ts`; it is not a residential/SOCKS proxy skill.
````

## File: apps/platform/app/(app)/a/[agency_slug]/inbox/[conversation_id]/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { actionMarkRead } from "~/components/inbox/actions";
import { ConversationThread } from "~/components/inbox/conversation-thread";
import { SCOPE_INBOX_HREF } from "~/components/inbox/scope";
import { gql } from "~/generated/graphql";
import { getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
⋮----
export async function generateMetadata(
  props: PageProps<"/a/[agency_slug]/inbox/[conversation_id]">,
): Promise<Metadata>
````

## File: apps/platform/app/(app)/a/[agency_slug]/tickets/[ticket_id]/ticket-detail.tsx
````typescript
import type { Database } from "@packages/supabase/types";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Textarea } from "@packages/ui-common/shadcn/components/ui/textarea";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { AlertTriangle, ArrowLeft, Building2, CheckCircle2, Info, MessageCircle, Send, User } from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";
import { useRef, useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionClaimTicket, actionPostMessage, actionResolveTicket } from "../actions";
⋮----
export type ConversationMessage = {
  conversation_message_id: string;
  conversation_id: string;
  message_author: string;
  message_body: string | null;
  message_direction: string;
  message_created_at: string;
  message_priority: Database["public"]["Enums"]["notification_priority"] | null;
  message_channel: Database["public"]["Enums"]["message_channel"] | null;
};
⋮----
export type TicketDetailData = {
  ticket_id: string;
  ticket_subject: string;
  ticket_status: Database["public"]["Enums"]["ticket_status"];
  ticket_priority: Database["public"]["Enums"]["notification_priority"];
  ticket_claimed_at: string | null;
  ticket_resolved_at: string | null;
  ticket_created_at: string;
  assigned_profile_id: string | null;
  assigned_agency_id: number | null;
  organization_id: number | null;
  tenant_id: number;
  conversation_id: string;
  organization_name: string | null;
  organization_slug: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
  agency_id: number;
  agency_slug: string;
  agency_name: string;
  messages: ConversationMessage[];
};
⋮----
function handleClaim()
⋮----
function handleReply()
⋮----
function handleResolve()
⋮----
aria-label=
⋮----
onClick=
⋮----
setShowResolveForm(false);
setResolveNote("");
⋮----
<div className=
⋮----
className=
````

## File: apps/platform/app/(app)/a/[agency_slug]/tickets/ticket-pool.tsx
````typescript
import type { Database } from "@packages/supabase/types";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui-common/shadcn/components/ui/tabs";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  Hourglass,
  Inbox,
  Info,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
import { ErrorSafeAction, ErrorSafeActionServer } from "~/lib/safe-action.client";
import { actionClaimTicket } from "./actions";
⋮----
export type PoolTicket = {
  ticket_id: string;
  ticket_subject: string;
  ticket_status: Database["public"]["Enums"]["ticket_status"];
  ticket_priority: Database["public"]["Enums"]["notification_priority"];
  ticket_claimed_at: string | null;
  ticket_resolved_at: string | null;
  ticket_created_at: string;
  assigned_profile_id: string | null;
  assigned_agency_id: number | null;
  organization_id: number | null;
  tenant_id: number;
  conversation_id: string;
  organization_name: string | null;
  organization_slug: string | null;
  tenant_name: string | null;
  tenant_slug: string | null;
};
⋮----
type StatusFilter = "open" | "claimed" | "in_progress" | "resolved" | "closed" | "all";
⋮----
function handleClaim()
⋮----
className=
````

## File: apps/platform/app/(app)/a/[agency_slug]/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Eye } from "lucide-react";
import type { Metadata } from "next";
import { getViewerAgencyBySlug, getViewerAgencyBySlugAssert } from "~/hooks/get-viewer-agencies";
import { AFFILIATION_STATE } from "~/lib/agencies";
import { getRosetta } from "~/lib/i18n.server";
⋮----
export async function generateMetadata(props: PageProps<"/a/[agency_slug]">): Promise<Metadata>
````

## File: apps/platform/app/(app)/home/account/connections/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { OAUTH_PROVIDERS } from "~/app/auth/providers";
import { getRosetta } from "~/lib/i18n.server";
import { actionLinkProvider } from "../actions";
⋮----
pendingChildren=
````

## File: apps/platform/app/(app)/home/inbox/[conversation_id]/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { actionMarkRead } from "~/components/inbox/actions";
import { ConversationThread } from "~/components/inbox/conversation-thread";
import { SCOPE_INBOX_HREF } from "~/components/inbox/scope";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
⋮----
export async function generateMetadata(props: PageProps<"/home/inbox/[conversation_id]">)
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/members/new/invite-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, Copy, FileText, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { type DocumentTripletCountry, DocumentTripletFields } from "~/app/auth/_components/document-triplet-fields";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionInviteMember } from "../actions";
import { type InviteMemberValues, inviteMemberSchema } from "../schemas";
⋮----
type InviteChannel = "email" | "phone" | "document";
⋮----
interface Props {
  organization_id: number;
  countries: DocumentTripletCountry[];
  membersHref: Route;
  tenantSlug: string;
}
⋮----
function editHrefFor(organization_membership_id: number)
⋮----
<Copy size=
⋮----
<Button type="button" variant="ghost" onClick=
⋮----
onClick=
⋮----
className=
````

## File: apps/platform/app/(marketing)/layout.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { LocaleToggle } from "~/components/locale-toggle";
import { StatusBadge } from "~/components/status-badge";
import { ThemeToggle } from "~/components/theme-toggle";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
⋮----
href=
````

## File: apps/platform/app/auth/_components/auth-entry-form.tsx
````typescript
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { RUT_FORMAT, RUT_NORMALIZE } from "@packages/utils/rut";
import { ArrowRight, IdCard, Mail, Phone, Search } from "lucide-react";
import { useState } from "react";
import { useRosetta } from "~/lib/i18n.client";
import { actionContinueAuth } from "../actions";
⋮----
type LocalKind = "email" | "phone" | "document";
⋮----
function DETECT_LOCAL_TYPE(raw: string): LocalKind | null
⋮----
// field name drives `actionContinueAuth`'s dispatch (email | phone | document)
⋮----
function onChange(e: React.ChangeEvent<HTMLInputElement>)
⋮----
function onBlur()
⋮----
className=
⋮----
<ButtonSpinner type="submit" pendingChildren=
````

## File: apps/platform/app/llms.txt/route.ts
````typescript
import { type NextRequest, NextResponse } from "next/server";
import { APP_HOST } from "~/lib/constants";
⋮----
export async function GET(request: NextRequest, ctx: RouteContext<"/llms.txt">)
⋮----
/**
   * Tenant subdomains are private app instances — no public surface for LLMs.
   */
````

## File: apps/platform/components/identity/chips.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { IdCard, Mail, Phone } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
⋮----
type IdentityKind = "email" | "phone" | "document";
⋮----
export function IdentityChip({
  kind,
  value,
  className,
  ...props
}: {
  kind: IdentityKind;
  value: string;
} & ComponentProps<"div">)
````

## File: apps/platform/components/inbox/conversation-thread.tsx
````typescript
import type { ResultOf } from "@graphql-typed-document-node/core";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Textarea } from "@packages/ui-common/shadcn/components/ui/textarea";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Archive, ArrowLeft, MessageSquare, Send } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRef, useState } from "react";
import { gql } from "~/generated/graphql";
import { useLocale, useRosetta } from "~/lib/i18n.client";
import { actionArchive, actionPostMessage } from "./actions";
⋮----
export type ConversationThreadFragmentType = ResultOf<typeof ConversationThreadFragment>;
⋮----
type Message = {
  conversationMessageId: string;
  messageBody: string | null;
  messageDirection: string;
  messageAuthor: string;
  messageChannel: string | null;
  messagePriority: string | null;
  messageCreatedAt: string;
  messageReadAt: string | null;
};
⋮----
function CHANNEL_LABEL(channel: string | null, t: ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"]): string
⋮----
function PRIORITY_LABEL(priority: string | null, t: ReturnType<typeof useRosetta<typeof LOCALE_ES>>["t"]): string
⋮----
function PRIORITY_VARIANT(priority: string | null): "default" | "secondary" | "destructive" | "outline"
⋮----
async function handleSend()
⋮----
async function handleArchive()
⋮----
function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>)
⋮----
<Link href=
⋮----
<div className=
⋮----
className=
⋮----
<Badge variant=
````

## File: apps/platform/components/inbox/inbox-list.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import type { Database } from "@packages/supabase/types";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Archive, Inbox, MessageSquare } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ScopeSelector } from "~/components/inbox/scope-selector";
import { ROSETTA } from "~/lib/i18n";
import { getServerLocale } from "~/lib/i18n.server";
import { type InboxScope, SCOPE_DETAIL_HREF, SCOPE_INBOX_HREF, SCOPE_RPC_ARGS } from "./scope";
⋮----
type ConversationRow = Database["public"]["Functions"]["viewer_conversations"]["Returns"][number];
⋮----
className=
````

## File: apps/platform/hooks/get-viewer-agencies.ts
````typescript
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { notFound } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
⋮----
export type ViewerAgencyGetFragmentType = ResultOf<typeof ViewerAgencyGetFragment>;
⋮----
type ViewerAgenciesGetVars = VariablesOf<typeof ViewerAgenciesGet>;
⋮----
export async function getViewerAgencyByIdAssert(agency_id: number)
⋮----
export async function getViewerAgencyBySlugAssert(agency_slug: string)
````

## File: apps/platform/hooks/get-viewer-profile.ts
````typescript
import type { ResultOf } from "@graphql-typed-document-node/core";
import { redirect } from "next/navigation";
import { cache } from "react";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
⋮----
export type ViewerProfileGetFragmentType = ResultOf<typeof ViewerProfileGetFragment>;
⋮----
export async function getViewerProfileRedirect()
````

## File: apps/platform/lib/safe-action.server.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";
⋮----
handleServerError(e)
⋮----
export function formAction<TInput>(run: (input: TInput) => Promise<unknown>, parse: (formData: FormData) => TInput)
````

## File: apps/platform/styles/globals.css
````css
@source "../../../packages/ui-common/src";
⋮----
@theme {
````

## File: packages/react-email/package.json
````json
{
  "name": "@packages/react-email",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "scripts": {
    "dev": "PORT=${PORT:-7101} email dev --port ${PORT:-7101} --dir src/templates",
    "build:dry": "tsc --noEmit",
    "format": "biome check --diagnostic-level=error ."
  },
  "exports": {
    "./templates/*": "./src/templates/*.tsx"
  },
  "dependencies": {
    "@packages/rosetta": "workspace:*",
    "@react-email/components": "^1.0.12",
    "@react-email/render": "2.0.9"
  },
  "devDependencies": {
    "@packages/typescript-config": "workspace:*",
    "@react-email/ui": "6.6.3",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.17",
    "react-email": "^6.6.3",
    "typescript": "^6.0.3"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
````

## File: packages/react-pdf/package.json
````json
{
  "name": "@packages/react-pdf",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "scripts": {
    "dev": "PORT=${PORT:-7102} webpack serve --mode development",
    "dev:open": "PORT=${PORT:-7102} webpack serve --mode development --open",
    "build:dry": "tsc --noEmit",
    "format": "biome check --diagnostic-level=error ."
  },
  "exports": {
    "./*": "./src/*.ts",
    "./templates/*": "./src/templates/*.tsx"
  },
  "dependencies": {
    "@packages/rosetta": "workspace:*",
    "@react-pdf/renderer": "^4.3.0",
    "@types/mdast": "^4.0.4",
    "clsx": "^2.1.1",
    "react-pdf-tailwind": "^3.0.0",
    "remark-parse": "^11.0.0",
    "unified": "^11.0.5"
  },
  "devDependencies": {
    "@babel/core": "^8.0.1",
    "@babel/preset-env": "^8.0.2",
    "@babel/preset-react": "^8.0.1",
    "@packages/typescript-config": "workspace:*",
    "@react-pdf/types": "^2.11.1",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "babel-loader": "^10.1.1",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.3",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "style-loader": "^4.0.0",
    "ts-loader": "^9.6.1",
    "typescript": "^6.0.3",
    "webpack": "^5.107.2",
    "webpack-cli": "^7.0.3",
    "webpack-dev-server": "^5.2.5"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
````

## File: packages/rosetta/package.json
````json
{
  "name": "@packages/rosetta",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "exports": {
    "./locale-config": "./src/locale-config.ts",
    "./rosetta": "./src/rosetta.ts",
    "./use-rosetta": "./src/use-rosetta.tsx"
  },
  "scripts": {
    "build:dry": "tsc --noEmit",
    "format": "biome check --diagnostic-level=error .",
    "test": "vitest run"
  },
  "dependencies": {
    "@packages/utils": "workspace:*",
    "dlv": "^1.1.3",
    "templite": "^1.2.0"
  },
  "devDependencies": {
    "@packages/typescript-config": "workspace:*",
    "@types/dlv": "^1.1.5",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.17",
    "typescript": "^6.0.3",
    "vitest": "^4.1.9"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
````

## File: packages/supabase/supabase/config.toml
````toml
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "saas-template-62fa76d3861e"

[api]
enabled = true
# Port to use for the API URL.
port = 55221
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` is always included.
schemas = ["public", "graphql_public", "protected"]
# Extra schemas to add to the search_path of every request. `public` is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
enabled = false

[db]
# Port to use for the local database URL.
port = 55222
# Port used by db diff command to initialize the shadow database.
shadow_port = 55223
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 15

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54429
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory. For example:
# sql_paths = ['./seeds/*.sql', '../project-src/seeds/*-load-testing.sql']
sql_paths = ['./seed.sql']

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = false
# Port to use for Supabase Studio.
port = 55224
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 55225
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[storage.image_transformation]
enabled = true

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails. Dev runs HTTPS (mkcert + Next --experimental-https) so WebAuthn has a secure context.
# site_url is embedded in confirmation/recovery emails as a concrete URL, so it must be a
# fully-resolved host:port. Conductor reassigns PORT per parallel instance; the npm scripts
# (db:start / db:reset) inject SUPABASE_AUTH_SITE_URL from $PORT, defaulting to 7003.
site_url = "env(SUPABASE_AUTH_SITE_URL)"
# The allow-list uses wildcards. `*` matches any sequence of non-separator chars (separators
# are `.` and `/` only — see https://supabase.com/docs/guides/auth/redirect-urls), so `:55000`
# is covered. Apex on any dev port (tenant routing is path-based, no subdomains needed).
additional_redirect_urls = [
  "https://lvh.me:*/**",
]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = true
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

# OAuth 2.1 authorization server (GoTrue). Required for MCP clients to authenticate as the user.
# When disabled, /.well-known/oauth-authorization-server returns "OAuth server is disabled" and
# clients that rely on Dynamic Client Registration (e.g. Claude Code) fail to connect.
# `authorization_url_path` is the in-app consent screen GoTrue redirects to (see app/oauth/consent).
# `allow_dynamic_registration`: true = MCP clients self-register via RFC 7591 (dev); false = prod
# (pre-register clients to prevent anonymous OAuth app creation). Set via env — see .env.example.
[auth.oauth_server]
enabled = true
authorization_url_path = "/oauth/consent"
allow_dynamic_registration = "env(SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION)"

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = true
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Custom templates use {{ .TokenHash }} and route through our app at /auth/confirm so the link
# in the email lands on lvh.me (the app origin) instead of the GoTrue verify endpoint at 127.0.0.1.
# The confirm route calls supabase.auth.verifyOtp({ token_hash, type }) and redirects to `next`.
[auth.email.template.confirmation]
subject = "Confirma tu correo en SaaS Template"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.magic_link]
subject = "Tu enlace para iniciar sesión en SaaS Template"
content_path = "./supabase/templates/magic_link.html"

[auth.email.template.email_change]
subject = "Confirma tu nuevo correo en SaaS Template"
content_path = "./supabase/templates/email_change.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = true
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = true
# Template for sending OTP to users
template = "Tu código de SaaS Template es {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Pre-defined phone → OTP map for local development. Without a real SMS provider, gotrue logs
# the OTP to docker logs but won't actually deliver. The test_otp map shortcuts that: any OTP
# request to one of these numbers is "delivered" as the configured code. Uncomment and add the
# numbers your team tests with.
# [auth.sms.test_otp]
# 56990511003 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/user_auth_hook"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
# Flip enabled = true once the SUPABASE_AUTH_SMS_TWILIO_* vars are in .env.local. Without them
# `pnpm db:start` will refuse to start, so we keep it disabled by default for local dev.
[auth.sms.twilio]
enabled = false
account_sid = "env(SUPABASE_AUTH_SMS_TWILIO_ACCOUNT_SID)"
message_service_sid = "env(SUPABASE_AUTH_SMS_TWILIO_MESSAGE_SERVICE_SID)"
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control use of MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = true
verify_enabled = true

# Configure Multi-factor-authentication via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Passkeys are not implemented via Supabase MFA — they're a custom SimpleWebAuthn-backed
# flow with its own public.profile_webauthn_credentials / profile_webauthn_challenges tables. See
# apps/platform/lib/passkeys.* (server actions, no dedicated routes).

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false

# Flip enabled = true once you've added the credentials in .env.local.
[auth.external.google]
enabled   = false
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret    = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
# Required for local sign in with Google (Google enforces nonce in prod, can't replay locally).
skip_nonce_check = true

[auth.external.azure]
enabled   = false
client_id = "env(SUPABASE_AUTH_EXTERNAL_AZURE_CLIENT_ID)"
secret    = "env(SUPABASE_AUTH_EXTERNAL_AZURE_SECRET)"
# For multi-tenant apps use "https://login.microsoftonline.com/common/v2.0".
# For single-tenant, replace `common` with the Entra tenant id.
url = "https://login.microsoftonline.com/common/v2.0"

[auth.external.linkedin_oidc]
enabled   = false
client_id = "env(SUPABASE_AUTH_EXTERNAL_LINKEDIN_OIDC_CLIENT_ID)"
secret    = "env(SUPABASE_AUTH_EXTERNAL_LINKEDIN_OIDC_SECRET)"

[auth.external.github]
enabled   = false
client_id = "env(SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID)"
secret    = "env(SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET)"

[auth.external.facebook]
enabled   = false
client_id = "env(SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID)"
secret    = "env(SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET)"

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

[edge_runtime]
enabled = false
# Configure one of the supported request policies: `oneshot`, `per_worker`.
# Use `oneshot` for hot reload, or `per_worker` for load testing.
policy = "oneshot"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8183

# Use these configurations to customize your Edge Function.
# [functions.MY_FUNCTION_NAME]
# enabled = true
# verify_jwt = true
# import_map = "./functions/MY_FUNCTION_NAME/deno.json"
# Uncomment to specify a custom file path to the entrypoint.
# Supported file extensions are: .ts, .js, .mjs, .jsx, .tsx
# entrypoint = "./functions/MY_FUNCTION_NAME/index.ts"

[analytics]
enabled = false
port = 55226
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"
````

## File: packages/ui-common/src/shadcn/globals.css
````css
@plugin "@tailwindcss/typography";
⋮----
@theme inline {
⋮----
@utility h-safe-top {
⋮----
@utility h-safe-bottom {
⋮----
:root {
⋮----
.dark {
⋮----
@layer base {
⋮----
* {
body {
⋮----
button:not(:disabled),
````

## File: packages/utils/package.json
````json
{
  "name": "@packages/utils",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "scripts": {
    "build:dry": "tsc --noEmit",
    "format": "biome check --diagnostic-level=error .",
    "test": "vitest run"
  },
  "exports": {
    "./*": "./src/*.ts"
  },
  "devDependencies": {
    "@packages/typescript-config": "workspace:*",
    "@types/ms": "^2.1.0",
    "@types/node": "^24.12.4",
    "typescript": "^6.0.3",
    "vitest": "^4.1.9"
  },
  "dependencies": {
    "@supabase/postgrest-js": "^2.108.2",
    "color-hash": "^2.0.2",
    "ms": "^2.1.3",
    "temporal-polyfill": "^1.0.1"
  }
}
````

## File: skills/my-graphy/SKILL.md
````markdown
---
name: my-graphy
description: Repository-specific @packages/graphy runtime client, server factories, React SWR hooks, mutations, errors, and pagination. Use when executing generated GraphQL documents.
---

# Graphy Runtime

Imports are direct:

```ts
import { GraphyClientSupabase } from "@packages/graphy/graphy";
import { useGraphyMutation, useGraphyQuery } from "@packages/graphy/react";
```

No package barrel.

## Existing factories

- Session server: `apps/platform/lib/graphy/graphy.server.ts`
- Browser: `apps/platform/lib/graphy/graphy.browser.ts`
- Service role: `apps/platform/lib/graphy/graphy.service.ts`
- Provider: `apps/platform/components/graphy-provider.tsx`

Server:

```ts
const graphy = await getGraphySession();
const { data, error } = await graphy.query({
  query: ViewerOrganizationsGetQuery,
  variables: { tenant_id },
});
```

`getGraphySession()` is React `cache()`-wrapped and forwards current access token.

Service role:

```ts
const graphy = getGraphyServiceRole();
```

Use only trusted server code after caller validation. It sends service key as `apikey` and
Bearer token, bypassing RLS.

## Client provider

`GraphyClientProvider` listens to `supabase.auth.onAuthStateChange`, rebuilds client on token
change, and `GraphyProvider` namespaces SWR keys. Root app already wraps provider.

## Query hook

```ts
const result = useGraphyQuery(
  user
    ? { query: ViewerTenantBySlugHookQuery, variables: { tenant_slug } }
    : null,
  config,
);
```

`null` pauses. Cache key includes namespace, URL, token hash, persisted-document hash,
variables. Set `indifferent: true` only for data identical across users; token hash omitted.

## Mutation hook

```ts
const [state, mutate] = useGraphyMutation(UpdateNameMutation);
const { data, error } = await mutate(
  { profile_id, profile_name_full },
  { thrownOnError: true },
);
```

State: `data`, `variables`, `error`, `isValidating`. Graphy does not auto-invalidate related
SWR queries. Call router refresh or SWR mutation deliberately.

Viewer-scoped create RPCs should return the created row from SQL:

```ts
const CreateTenantMutation = gql(`
  mutation CreateTenantMutation($tenant_name: String!, $tenant_slug: String!) {
    tenant: viewer_tenant_create(
      tenant_name: $tenant_name
      tenant_slug: $tenant_slug
    ) {
      tenant_id
    }
  }
`);

const [, createTenant] = useGraphyMutation(CreateTenantMutation);
const { data, error } = await createTenant({ tenant_name, tenant_slug });
const tenant_id = data?.["tenant"]?.["tenant_id"];
```

Use this direct client path when the RPC derives identity from the authenticated JWT and all
work is transactional SQL. Do not add a Server Action merely to proxy the same GraphQL
mutation. A Server Action remains appropriate for auth admin calls, secrets, service-role
workflows, email delivery, or other server-only/external effects.

## Client methods

- `fetch(...)`: returns data, throws Graphy errors.
- `query(...)`: returns `{data,error}` for known Graphy errors.
- `mutate(...)`: alias of `query(...)`.

Errors:

```ts
isGraphyNetworkError(error)
isGraphyResponseError(error, "PGRST301")
isGraphyGraphQLError(error)
```

GraphQL errors arrive with HTTP 200 and become `GraphyGraphQLError`.

## Pagination

Use `@packages/graphy/react-pagination` for headless cursor/offset state. Prefer cursor:

```ts
const [pagination, setPagination] = usePaginationCursorState({ first: 100 });
const { data } = useGraphyQuery({
  query: RowsQuery,
  variables: { ...pagination },
});
const actions = usePaginationCursor(
  data?.["rows"]?.["pageInfo"],
  pagination,
  setPagination,
);
```

For server iteration, use `GRAPHY_ITER_CURSOR` from `@packages/graphy/graphy-iter`.

## Rules

- Generated documents only; do not send raw query strings.
- Read response payload with bracket notation.
- RLS path uses session client. Service role use must be explicit and rare.
- Do not wrap one Graphy call in a new thin hook unless reused.
````

## File: skills/my-permissions/SKILL.md
````markdown
---
name: my-permissions
description: Repository-specific capability permissions, membership lifecycle, wildcard grants, RLS helpers, agency grants, admin checks, and pgTAP tests.
---

# Permissions

Capability-based. No role column.

## Schema

- `permissions(permission_id citext, ...)`: catalog; `*` wildcard. Trimmed to English admin
  capabilities only: `*`, `organization_manage`, `members_manage`, `presets_manage`. There is no
  generic non-admin capability anymore (`presets_manage` is the closest stand-in).
- `organization_memberships(organization_membership_id, organization_id, profile_id, invite fields, lifecycle timestamps)`.
- `organization_membership_permissions(organization_membership_id, permission_id)`: grant. Org/profile derive through membership.
- `permission_presets(organization_id?, permission_preset_name, permission_preset_slugs[])`: UX bundle only. Seeded presets are Owner / Administrator / Member manager.

Do not use stale `(organization_id, profile_id, permission_id)` grant shape.

Active membership requires:

```sql
m.profile_id = viewer
and m.organization_membership_accepted_at is not null
and m.organization_membership_revoked_at is null
and m.organization_membership_rejected_at is null
```

## Helpers

Single check:

```ts
const { data, error } = await supabase.rpc("viewer_has_permission", {
  target_organization_id: organization_id,
  target_permission_id: "members_manage",
});
if (error || !data) throw new Error("Access denied");
```

RLS set helper:

```sql
organization_id in (
  select public.viewer_permission_org_ids('organization_manage')
)
```

Use set helper in policies; evaluated as InitPlan. `viewer_has_permission` suits one app-side
check. Both honor `*`.

UI listing: `viewer_organization_membership_permissions()`.

## RLS

Permission table write policy:

```sql
using (
  organization_membership_id in (
    select m.organization_membership_id
    from public.organization_memberships m
    where m.organization_id in (
      select public.viewer_permission_org_ids('members_manage')
    )
  )
)
```

Still enforce RLS even when UI/action checks permission first. App check improves error UX;
DB remains trust boundary.

## Grant/revoke

```ts
await admin.from("organization_membership_permissions").insert({
  organization_membership_id,
  permission_id: "*",
});
```

GraphQL client mutations use `organization_membership_id` + `permission_id` filters. Presets only
supply slug arrays; applying one means explicit grant mutations.

The JWT carries only `profile_id` (the `sub`/`auth.uid`); it no longer injects tenant/org/agency
claims. Membership and permission changes are resolved from the DB on each check, so they take
effect without a JWT refresh.

## Safety invariants

Schema triggers prevent:

- Revoking own membership.
- Revoking last active admin membership.
- Removing final `members_manage`/`*` admin grant.
- Invalid preset slugs.
- Inconsistent claimed membership state.

Do not bypass these with service role unless operation intentionally implements admin recovery.

## Agency access

Separate helpers:

- `viewer_agency_ids()`
- `viewer_agency_permission_org_ids(permission)` — covers explicit per-org grants and global
  (`organization_id is null`) grants only. There are no implicit organization grants.
- `viewer_has_agency_permission(org, permission)`
- `viewer_agency_tenant_ids()`

Agency grants expand read/cross-tenant access where policy says so. They do not automatically
grant tenant member write permissions.

## Tests

Add pgTAP under `packages/supabase/supabase/tests/`:

```sql
begin;
select plan(1);
set local role authenticated;
set local request.jwt.claims to '{"sub":"..."}';
select ok(public.viewer_has_permission(1, 'members_manage'), '...');
select * from finish();
rollback;
```

Without `set local role authenticated`, postgres bypasses RLS and test is invalid.

Relevant tests: `viewer_permissions`, `rls_memberships`, `membership_invariants`,
`permission_presets_validate`, `journey_escalation_attempts`.
````

## File: apps/platform/app/(app)/a/[agency_slug]/actions.ts
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { HOST_FROM_HEADERS } from "@packages/utils/headers";
import { URL_NEW } from "@packages/utils/url";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { debug } from "~/lib/debug";
import { getRosetta } from "~/lib/i18n.server";
import { authedAction } from "~/lib/safe-action.server";
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/external-access/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { getRosetta } from "~/lib/i18n.server";
import { ExternalAccess, type ExternalAccessAgency } from "./external-access";
⋮----
export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/external-access">,
): Promise<Metadata>
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/general/general-settings.tsx
````typescript
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { Switch } from "@packages/ui-common/shadcn/components/ui/switch";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { EntityLogoControls } from "~/components/entity-logo-controls";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type Access = "none" | "viewer" | "editor";
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit/edit-form.tsx
````typescript
import type { GraphyError } from "@packages/graphy/graphy";
import { useGraphyMutation } from "@packages/graphy/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Checkbox } from "@packages/ui-common/shadcn/components/ui/checkbox";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE_HREF } from "~/lib/route";
import { PERMISSION_SLUG_WILDCARD } from "../../schemas";
⋮----
function MAP_PG_ERROR_KEY(err: GraphyError): "last_admin_protected" | "self_remove_blocked" | "save_failed"
⋮----
interface PermissionRow {
  permission_id: string;
  permission_description: string | null;
}
⋮----
interface PresetRow {
  permission_preset_id: number;
  permission_preset_name: string;
  permission_preset_slugs: (string | null)[] | null;
  organization_id: number | null;
}
⋮----
interface Props {
  organization_membership_id: number;
  permissions: PermissionRow[];
  presets: PresetRow[];
  grantedSlugs: string[];
  membersHref: Route;
}
⋮----
type OptimisticAction =
  | { kind: "set_wildcard"; value: boolean }
  | { kind: "set_permission"; permission_id: string; granted: boolean }
  | { kind: "apply_preset"; slugs: string[] };
⋮----
function APPLY_OPTIMISTIC(state:
⋮----
async function writePermission(permission_id: string, granted: boolean): Promise<boolean>
⋮----
function togglePermission(permission_id: string, granted: boolean)
⋮----
function toggleWildcard(next: boolean)
⋮----
function applyPreset(preset: PresetRow)
⋮----
function removeMember()
⋮----
className=
⋮----
onCheckedChange=
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/members/pending-invitations.tsx
````typescript
import { useGraphyMutation } from "@packages/graphy/react";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { FileText, Mail, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { gql } from "~/generated/graphql";
import { FilterIs } from "~/generated/graphql/graphql";
import { useIntlDateTimeFormat } from "~/hooks/use-intl";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
⋮----
interface InvitationRow {
  organization_membership_id: number;
  invitation_email: string | null;
  invitation_phone: string | null;
  invitation_address_level0_id: string | null;
  invitation_document_kind: string | null;
  invitation_document_value: string | null;
  invitation_permission_slugs: (string | null)[];
  invitation_created_at: string;
  invitation_expires_at: string | null;
}
⋮----
interface Props {
  invitations: InvitationRow[];
  tenantSlug: string;
  organizationId: number;
}
⋮----
function INVITATION_LABEL(inv: InvitationRow): string
⋮----
function CHANNEL_OF(inv: InvitationRow): "email" | "phone" | "document"
⋮----
function cancel(inv: InvitationRow)
⋮----
href=
⋮----
<span className="shrink-0">
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/layout.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Shell } from "~/components/shell/shell";
import { getViewerOrganizationById, getViewerOrganizations } from "~/hooks/get-viewer-organizations";
import { getViewerProfile } from "~/hooks/get-viewer-profile";
import { getViewerTenantBySlug } from "~/hooks/get-viewer-tenants";
⋮----
export default async function OrganizationLayout({
  children,
  params,
}: LayoutProps<"/t/[tenant_slug]/[organization_id]">)
⋮----
// shadcn SidebarProvider persists expanded/collapsed in the `sidebar_state` cookie; default open.
````

## File: apps/platform/app/auth/document/document-step-form.tsx
````typescript
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, IdCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCountries } from "~/hooks/use-countries";
import { useLocale, useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { ErrorSafeAction } from "~/lib/safe-action.client";
import {
  DOCUMENT_VALUE_LABEL,
  DOCUMENT_VALUE_PLACEHOLDER,
  FORMAT_DOCUMENT,
  NORMALIZE_DOCUMENT,
} from "../_components/document-labels";
import { OtpField } from "../_components/otp-field";
import { actionCheckDocument, actionVerifyDocumentLoginOtp } from "./actions";
⋮----
type DocKind = "nin" | "passport";
⋮----
type LoginState = { channel: "sms" | "email"; contact: string; masked: string };
⋮----
function onCheck(e: React.FormEvent)
⋮----
function onVerify(e: React.FormEvent)
⋮----
onValueChange=
⋮----
className=
⋮----
setDoc(NORMALIZE_DOCUMENT(country, kind, e.target.value));
⋮----
setDoc((current)
⋮----
placeholder=
````

## File: apps/platform/app/auth/email/email-step-form.tsx
````typescript
import { useSupabase } from "@packages/supabase/react";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Eye, EyeOff, Fingerprint, KeyRound, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { debug } from "~/lib/debug";
import { notifyDevMailbox } from "~/lib/dev-mailbox-toast.client";
import { useRosetta } from "~/lib/i18n.client";
import { OtpField } from "../_components/otp-field";
⋮----
type Props = {
  email: string;
  next: string;
  exists: boolean | null;
  hasPasskey: boolean;
  hasPassword: boolean;
};
⋮----
function onMagicLink()
⋮----
function onVerify(e: React.FormEvent)
⋮----
function verifyOtp(nextToken: string)
⋮----
function onOtpPasteComplete(nextToken: string)
⋮----
function onPassword(e: React.FormEvent)
⋮----
function onPasskey()
⋮----
````

## File: apps/platform/app/auth/onboarding/page.tsx
````typescript
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";
import { AUTH_TWEAKS } from "~/lib/auth-tweaks";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AuthCard } from "../_components/auth-card";
import { METHOD_CATALOG } from "./_components/method-catalog";
import { actionFinishOnboarding } from "./actions";
import {
  COUNT_DONE,
  METHOD_ORDER,
  ONBOARDING_METHOD_PATH,
  type OnboardingMethodId,
  type OnboardingMethodStatus,
} from "./state";
import { getViewerOnboardingState } from "./state.server";
⋮----
// TODO: overkill, AUTH_TWEAKS.OB_RECOMMENDED is always passkey. could be constant.
⋮----
className=
⋮----
<span className=
⋮----
````

## File: apps/platform/components/shell/app-sidebar.tsx
````typescript
import { useDeviceInfo } from "@packages/react-hooks/use-device-info";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@packages/ui-common/shadcn/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@packages/ui-common/shadcn/components/ui/sidebar";
import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Kbd } from "~/components/shell/atoms";
import { ConversationsBell } from "~/components/shell/conversations-bell";
import {
  BUILD_NAV_TREE,
  GROUP_CONTAINS_ACTIVE,
  IS_NAV_GROUP,
  LEAF_IS_ACTIVE,
  type NavGroup,
  type NavLeaf,
} from "~/components/shell/nav-tree";
import { OrgSwitcher, type ShellOrganization, type ShellTenant } from "~/components/shell/org-switcher";
import { ProfileMenu, type ShellViewer } from "~/components/shell/profile-menu";
import { SettingsMenu } from "~/components/shell/settings-menu";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
⋮----
<SidebarMenuButton asChild isActive=
⋮----
<Collapsible asChild defaultOpen=
⋮----
<SidebarMenuSubButton asChild isActive=
````

## File: apps/platform/components/shell/mobile-top-bar.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import { ChevronDown, Menu, Search } from "lucide-react";
import type { ComponentProps } from "react";
⋮----
import { InitialsAvatar } from "~/components/shell/atoms";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import type { ShellViewer } from "~/components/shell/profile-menu";
⋮----
initials=
````

## File: apps/platform/.env.example
````
# Supabase Local Development
# Default values from `pnpm db:start`. Not secrets — only work locally.
# Copy to apps/platform/.env.local and apps/tenant/.env.local

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54421
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Cookie domain so the apex (lvh.me:7003) and any tenant subdomain ({slug}.lvh.me:7003) share the session.
# `lvh.me` is a public DNS wildcard that resolves every name to 127.0.0.1 —
# no /etc/hosts edits required. Browsers accept cookies on it because it has a real TLD.
# Local dev: "lvh.me". Production: "example.com". Leave blank to fall back to host-only cookies.
NEXT_PUBLIC_COOKIE_DOMAIN=lvh.me

# The apex hostname for this deployment (no port — port comes from `PORT`, which the
# dev script binds to via `--port ${PORT:-7003}` and Conductor assigns per parallel instance).
# Local dev: "lvh.me". Production: "example.com".
NEXT_PUBLIC_APEX_HOSTNAME=lvh.me

# Dev-only mailbox (Inbucket from `pnpm db:start`). Surfaced as a "Development only"
# link on the signup success state so you can grab the magic-link confirmation email
# without leaving the browser. Leave blank in production.
NEXT_PUBLIC_DEV_MAILBOX_URL=http://localhost:54424

# Server-side log namespaces (diary via @packages/debug, wired in apps/platform/lib/debug.ts).
# Default in dev shows everything under "platform:*". Narrow to a slice while debugging, e.g.
#   DEBUG="platform:passkeys:*"
#   DEBUG="platform:auth:*,-platform:auth:login"   # exclude noise with a leading "-"
# Empty or unset = silent.
DEBUG=platform:*

# ------------------------------------------------------------
# OAuth providers (read by supabase/config.toml on `pnpm db:start`)
# Create credentials at the provider console; configure each callback as:
#   http://127.0.0.1:54421/auth/v1/callback   (local)
#   https://<project>.supabase.co/auth/v1/callback   (prod)
# Leave any unused provider blank — `pnpm db:start` will skip it.
# ------------------------------------------------------------

# Google — https://console.cloud.google.com/apis/credentials
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=

# Microsoft (Azure / Entra) — https://portal.azure.com (App registrations)
SUPABASE_AUTH_EXTERNAL_AZURE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_AZURE_SECRET=

# LinkedIn — https://www.linkedin.com/developers/apps (use the OIDC product)
SUPABASE_AUTH_EXTERNAL_LINKEDIN_OIDC_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_LINKEDIN_OIDC_SECRET=

# GitHub — https://github.com/settings/developers (OAuth Apps)
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=

# Facebook — https://developers.facebook.com/apps
SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET=

# ------------------------------------------------------------
# Twilio (phone OTP for onboarding step + future MFA via SMS)
# Flip [auth.sms.twilio].enabled = true in config.toml after filling these in.
# https://console.twilio.com
# ------------------------------------------------------------
SUPABASE_AUTH_SMS_TWILIO_ACCOUNT_SID=
SUPABASE_AUTH_SMS_TWILIO_MESSAGE_SERVICE_SID=
SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN=

# ------------------------------------------------------------
# OpenTelemetry (optional — traces exported only when set)
# ------------------------------------------------------------
# OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
# OTEL_SERVICE_NAME=saas-template
# OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=YOUR_API_KEY

# ------------------------------------------------------------
# PostHog (optional — analytics and feature flags)
# Create a project at https://app.posthog.com and copy the key from Project Settings.
# ------------------------------------------------------------
# NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ------------------------------------------------------------
# MCP OAuth — Dynamic Client Registration (RFC 7591)
# Read by config.toml [auth.oauth_server].allow_dynamic_registration on `pnpm db:start`.
# true  → MCP clients (Claude Code, etc.) can self-register in dev — required locally.
# false → production default; pre-register clients via Supabase dashboard instead.
# ------------------------------------------------------------
SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=true
````

## File: apps/platform/next.config.ts
````typescript
import os from "node:os";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import pkg from "~/package.json" with { type: "json" };
⋮----
function LOCAL_HOSTNAME(): string | null
````

## File: packages/graphy/package.json
````json
{
  "name": "@packages/graphy",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "exports": {
    "./react": "./src/react.tsx",
    "./react-pagination": "./src/react-pagination.tsx",
    "./*": "./src/*.ts"
  },
  "scripts": {
    "build:dry": "tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "format": "biome check --diagnostic-level=error ."
  },
  "dependencies": {
    "@packages/debug": "workspace:*",
    "@packages/utils": "workspace:*",
    "swr": "^2.4.1"
  },
  "devDependencies": {
    "@graphql-typed-document-node/core": "^3.2.0",
    "@packages/typescript-config": "workspace:*",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.17",
    "graphql": "^16.9.0",
    "react": "^19.2.7",
    "typescript": "^6.0.3",
    "vitest": "^4.1.9"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
````

## File: packages/supabase/src/client.server.ts
````typescript
import { type CookieOptions, createServerClient as createServerClientSsr } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { SUPABASE_JWT_DECODE_PAYLOAD, SUPABASE_JWT_METADATA } from "./jwt";
import type { AppMetadata } from "./metadata";
import type { Database } from "./types.ts";
⋮----
getAll()
setAll(cookiesToSet:
⋮----
export async function getSupabaseServerUserRedirect()
⋮----
export async function getSupabaseServerUserAssert()
````

## File: skills/my-auth/SKILL.md
````markdown
---
name: my-auth
description: Repository-specific Supabase Auth, JWT claim, OAuth, OTP, onboarding, and native Supabase passkey patterns. Use for auth code in apps/platform or auth schema/config in packages/supabase.
---

# Auth

Use current code. Do not invent generic Supabase wrappers.

## Source map

- Clients: `packages/supabase/src/client.{browser,server,middleware}.ts`, `metadata.ts`
- Routes/actions: `apps/platform/app/auth/**`
- Passkeys: `apps/platform/lib/passkeys.client.ts`
- Hook/schema: `packages/supabase/supabase/migrations/00000000000000_schema.sql`
- Config/templates: `packages/supabase/supabase/config.toml`, `supabase/templates/*`
- Gate: `apps/platform/proxy.ts`

## Identity

Validated identity:

```ts
const user = await getSupabaseServerUser();
```

Cookie session/raw token:

```ts
const session = await getSupabaseServerSession();
```

The JWT carries only `profile_id` (the `sub`/`auth.uid`). It no longer injects
`app_metadata.{tenants,organizations,agencies,onboarded}`. Resolve tenant/org/agency membership
from the DB, not from claims.

## Token hook

`public.user_auth_hook(event jsonb)` is now a pass-through: it returns the `event` unchanged and
injects no custom claims. Tenant/org/agency membership and onboarding state are resolved from the
DB on demand, and permissions stay DB-backed, not JWT-backed.

Hook config:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/user_auth_hook"
```

Because membership lives in the DB rather than the token, membership/onboarding changes take
effect without a JWT refresh. The viewer helpers
(`viewer_tenant_ids` / `viewer_tenant_validate` / `viewer_organization_ids` /
`viewer_organization_validate` / `viewer_agency_ids`) resolve membership directly from the DB and
are `security definer` to avoid RLS recursion — they are not JWT/claims-based.

## OAuth

Provider catalog lives in `auth/providers.ts`. Form posts provider + `next` to OAuth action.
Callback must use typed route context and same-origin resolver:

```ts
export async function GET(
  request: NextRequest,
  _ctx: RouteContext<"/auth/callback">,
) {
  const { searchParams, origin } = new URL(request.url);
  const next = RESOLVE_AUTH_NEXT(searchParams.get("next"), origin);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(
    searchParams.get("code")!,
  );
  if (error) return NextResponse.redirect(`${origin}/auth/error`);
  return NextResponse.redirect(next);
}
```

Never trust raw `next`; use `RESOLVE_AUTH_NEXT`.

## OTP

Email/phone forms call browser Supabase directly. Existing pattern:

```ts
await supabase.auth.signInWithOtp({
  email,
  options: { shouldCreateUser: true },
});
await supabase.auth.verifyOtp({ email, token, type: "email" });
await supabase.auth.refreshSession();
```

Email links route through `/auth/confirm`; route validates allowed `EmailOtpType`,
calls `verifyOtp({ token_hash, type })`, then uses safe `next`.

## Passkeys

Native Supabase WebAuthn API (supabase-js ≥ 2.105). No custom tables — Supabase manages storage internally.

Config in `packages/supabase/supabase/config.toml`:

```toml
[auth.passkey]
enabled = true

[auth.webauthn]
rp_display_name = "SaaS Template"
rp_id = "lvh.me"
rp_origins = ["https://lvh.me:7003"]
```

Flow:

- **Register** (authenticated): `supabase.auth.registerPasskey()` — browser only.
- **Sign in** (discoverable, no email needed): `supabase.auth.signInWithPasskey()` — browser only.
- **List**: `supabase.auth.passkey.list()` — works server-side and client-side.
- **Delete**: `supabase.auth.passkey.delete({ passkeyId })` — browser, authenticated.
- **Rename**: `supabase.auth.passkey.update({ passkeyId, friendlyName })`.

Sign-in button appears at: auth root (`/auth`), email step, and phone step — always visible (discoverable credentials; no `has_passkey` check needed).

Dev must use mkcert HTTPS (same requirement as before — WebAuthn requires secure context).

## Identity validators

- `public.cl_rut_normalize` / `public.cl_rut_validate`: normalize and validate Chilean RUT.
- `internal.email_validate` / `internal.phone_validate`: back the `invite_email` / `invite_phone`
  CHECK constraints on `public.organization_memberships`.
- `internal.slug_reserved_validate`: rejects reserved slugs.

## Rules

- Exported functions in `"use server"` files: `action*`.
- External payload fields: bracket access.
- Enumeration RPCs remain server-side when `AUTH_EXPOSE_ACCOUNT_EXISTENCE=true`.
- Service role only after caller validation; never expose key/client to browser.
- Onboarding is page UX, not proxy hard gate.
- Auth changes: run `pnpm test:db`; UI journeys: `pnpm test:e2e` with dev server.
````

## File: skills/my-graphql-codegen/SKILL.md
````markdown
---
name: my-graphql-codegen
description: Repository-specific two-stage GraphQL schema and operation code generation. Use after SQL/pg_graphql changes, GraphQL operation edits, generated type errors, or schema introspection failures.
---

# GraphQL Codegen

Two stages. Always use pnpm.

## Files

- Schema config: `packages/supabase/graphql.config.ts`
- Schema outputs: `packages/supabase/generated/graphql/graphql.schema.{json,graphql}`
- Operation config: `apps/platform/graphql.config.ts`
- Operation outputs: `apps/platform/generated/graphql/**`

## Normal workflow

After SQL changes:

```bash
pnpm db:reset
pnpm generate:types
pnpm generate:graphql:schema
pnpm --filter @apps/platform run generate:graphql
```

Schema-only **reformat** from the checked-in JSON (no DB introspection):

```bash
pnpm generate:graphql:schema:local
```

> ⚠️ **`:local` will NOT pick up new DB objects.** It only re-emits the SDL from the
> already-committed `graphql.schema.json`. If you just added/changed an RPC, table, or column and
> run `:local`, the new GraphQL fields are silently missing and the matching `gql()` doc fails to
> generate. After any schema change you must run the **live** `pnpm generate:graphql:schema` (it
> introspects the running DB via the `/graphql/v1` HTTP endpoint), then `pnpm generate:types`.
> Canonical order: `db:reset` → `generate:graphql:schema` → `generate:types` → operations.

Operation-only changes (no SQL touched):

```bash
pnpm --filter @apps/platform run generate:graphql
```

Do not use npm, ad hoc output paths, or redirect generated output manually.

> **Note:** `pnpm generate:graphql:platform` is NOT a valid root command — always use the
> `--filter @apps/platform` form above.

## Stage 1: schema

`packages/supabase/graphql.config.ts` loads app env. Default introspects:

```ts
const href_graphql = `${NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`;
```

with anon `apiKey`. It writes introspection JSON + sorted SDL. `--local` reads existing JSON;
it does not introspect DB.

**Prerequisite:** `apps/platform/.env.local` must exist with `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. The config loads env from that path via `@next/env`. If
missing, URL resolves as `undefined` and introspection silently fails with "Unable to find any
GraphQL type definitions for `undefined/graphql/v1`".

If introspection suddenly returns empty/broken schema, inspect SQL names first. pg_graphql
requires names matching `[_a-zA-Z0-9]`; hyphenated enum value can break entire schema.

## Exposing an RPC as a query / mutation

pg_graphql surfaces a `public` function on `Query` or `Mutation` automatically — no comment
directive needed. The rules that actually decide whether (and where) it shows up:

- **Volatility picks the field's home.** `stable`/`immutable` → `Query`; `volatile` → `Mutation`.
  Mark it **explicitly** `volatile` for a mutation (don't rely on the plpgsql default).
- **Return shape.** To get a single typed row back (so callers can select its columns), return
  `setof public.<table> rows 1` (the `viewer_*_create`/`_update` pattern). It appears as
  `Mutation { viewerThing(arg1: …, arg2: …): <Table> }`; snake args become camelCase.
- **Execute privilege = visibility.** pg_graphql includes a function only if the introspecting
  role can `EXECUTE` it. The default grant is `EXECUTE` to `PUBLIC` (which already includes `anon`
  and `authenticated`), so **do not add** `revoke … from public; grant … to anon, authenticated`
  boilerplate — it's noise. These functions self-guard via an internal `viewer_*` permission
  check, so PUBLIC execute is safe.
- **Call it from the client**, not a pass-through Server Action — `useGraphyMutation(Doc)` (see
  `my-graphy` / AGENTS.md "Client choice").

**Verify exposure before building on it.** After `db:reset` + live `generate:graphql:schema`,
grep the SDL:

```bash
rg 'viewerYourFn' packages/supabase/generated/graphql/graphql.schema.graphql
```

If it's missing there but you expect it, check pg_graphql directly in the DB (this reflects the
truth regardless of the HTTP cache):

```sql
select graphql.resolve('{ __schema { mutationType { fields { name } } } }');
```

If the DB shows it but the regenerated SDL doesn't, you ran `:local` (cached JSON) or the
PostgREST schema cache is stale — run the live `generate:graphql:schema` (or
`notify pgrst, 'reload schema';` then regenerate). Only delete the old Server Action / wire the
client once the field is present in the SDL.

## Stage 2: operations

Platform config reads schema JSON and scans:

```ts
documents: ["./{app,components,hooks,lib}/**/*.{graphql,ts,tsx}"]
```

Client preset settings matter:

```ts
{
  fragmentMasking: false,
  gqlTagName: "gql",
  documentMode: "string",
  strictScalars: true,
  skipTypename: true,
  dedupeFragments: true
}
```

Scalars:

- `Int`, `Float` -> `number`
- `BigInt`, `BigFloat` -> `string`
- `Cursor`, `Opaque`, `Time`, `Date`, `Datetime`, `UUID` -> `string`
- `JSON` -> `string` in current config

## Rules

- Every operation name globally unique.
- Import generated `gql` from `~/generated/graphql`.
- Generated files are committed, never manually edited.
- SQL schema change requires both Supabase types and GraphQL schema regeneration.
- Operation change requires platform generation before typecheck.
- If `gql("...")` returns `unknown`, operation text differs from generated registry. Regenerate.
- Validate with `pnpm build:dry`.
````

## File: skills/my-supabase-codegen/SKILL.md
````markdown
---
name: my-supabase-codegen
description: Repository-specific Supabase TypeScript type generation workflow, generated Database usage, schema reset sequence, and generated-file rules.
---

# Supabase Type Generation

Generated file:

```text
packages/supabase/src/types.ts
```

Command:

```bash
pnpm generate:types
```

Root command runs:

```bash
pnpm --filter @packages/supabase generate:types
```

Package command:

```bash
supabase gen types --lang=typescript --local --schema public > src/types.ts
```

## Schema workflow

Prototype has one schema file:

```text
packages/supabase/supabase/migrations/00000000000000_schema.sql
```

After change:

```bash
pnpm db:reset
pnpm generate:types
```

If change affects pg_graphql:

```bash
pnpm generate:graphql:schema
pnpm --filter @apps/platform run generate:graphql
```

`db:reset` destroys local data, replays schema, then seed. Do not create incremental migration
unless project leaves prototype phase.

## Type use

```ts
import type { Database } from "@packages/supabase/types";

type Membership =
  Database["public"]["Tables"]["organization_memberships"]["Row"];
type MembershipInsert =
  Database["public"]["Tables"]["organization_memberships"]["Insert"];
type ViewerHasPermissionArgs =
  Database["public"]["Functions"]["viewer_has_permission"]["Args"];
```

Client factories already bind `Database`; normal query result inference needs no manual row
type.

## pg_graphql visibility

A table, view, or function only appears in the GraphQL schema if the `anon` role has at
least `SELECT` grant. `authenticated`-only grants are NOT enough — pg_graphql introspects as
`anon`.

```sql
-- Minimum to appear in GraphQL (queries):
grant select on table public.my_table to anon, authenticated;

-- To expose mutations, add the relevant verbs:
grant select, insert, update, delete on table public.my_table to anon, authenticated;
```

RLS policies still gate which rows are actually returned — grants only control schema
visibility. A table with RLS enabled but no anon `SELECT` grant will be invisible to
GraphQL entirely.

For an RPC declared as:

```sql
returns setof public.tenants rows 1
volatile
```

expected generated shapes are:

- Supabase TypeScript: full tenant `Returns` plus `isSetofReturn: true` and `isOneToOne: true`.
- pg_graphql Mutation: `viewer_tenant_create(...): tenants`, a singular object rather than a
  connection.

If codegen emits a scalar ID, inspect the SQL return type. Do not work around stale or incorrect
schema generation by changing the client operation.

## Rules

- Never hand-edit generated file.
- Commit generated file.
- Never use `as any` to hide stale generation.
- Read external DB rows with bracket notation.
- If generated type lacks new object, verify reset succeeded against local DB.
- Type generation covers `public` schema only.
- SQL enum/value naming must remain pg_graphql-compatible.
- If a table vanishes from the GraphQL schema after `db:reset`, check its `grant to anon`.

## Verification

```bash
pnpm format:apply-unsafe
pnpm build:dry
```

Run `pnpm test:db` for RLS/functions/triggers. Generated diff can be large; inspect unexpected
object removal before accepting.
````

## File: skills/my-supabase-react/SKILL.md
````markdown
---
name: my-supabase-react
description: Repository-specific typed Supabase client usage in Next.js server components, server actions, proxy, browser components, auth state, SWR hooks, and tenant-scoped queries.
---

# Supabase in React/Next

Use factories from `@packages/supabase`. Never instantiate app clients elsewhere.

## Server

```ts
import {
  createSupabaseServerClient,
  getSupabaseServerUser,
  getSupabaseServerUserMetadata,
} from "@packages/supabase/client.server";

const [supabase, user, metadata] = await Promise.all([
  createSupabaseServerClient(),
  getSupabaseServerUser(),
  getSupabaseServerUserMetadata(),
]);
```

Exports are React `cache()`-wrapped per request. `createSupabaseServerClient()` uses cookies and anon
key, so RLS applies.

## Browser

```ts
import { createSupabaseBrowserClient } from
  "@packages/supabase/client.browser";

const supabase = createSupabaseBrowserClient();
```

For component reuse:

```ts
import { useSupabase, useSupabaseUser } from
  "@packages/supabase/react";

const supabase = useSupabase();
const { data: user } = useSupabaseUser();
```

`useSupabaseUser` uses SWR key `supabase-user`. Do not add thin wrapper for one SDK call.

## User vs metadata

- `getSupabaseServerUser()`: verified persisted auth user.
- `getSupabaseServerSession()`: raw access token.
- `getSupabaseServerUserMetadata()`: decoded + Zod-validated hook claims.

Browser equivalents exist. Never trust `session.user` as validated identity; never expect
hook claims from `auth.getUser()`.

## Tenant-scoped query

RLS is mandatory but app queries still scope tenant:

```ts
const tenant = metadata?.["tenants"]?.find(
  (item) => item["slug"] === tenant_slug,
);
if (!tenant) notFound();

const { data, error } = await supabase
  .from("some_table")
  .select("*")
  .eq("tenant_id", tenant["id"]);
```

For org-scoped data, validate org belongs to active tenant and filter `organization_id`.

## Server action

Use `authedAction` when possible; context already supplies validated `user` + server client:

```ts
export const actionSave = authedAction
  .inputSchema(schema)
  .action(async ({ parsedInput, ctx: { supabase, user } }) => {
    const { error } = await supabase
      .from("profiles")
      .update({ profile_name_full: parsedInput.name })
      .eq("profile_id", user.id);
    if (error) throw error;
  });
```

Exported server action name starts `action`.

Do not use a Server Action as a pass-through for a viewer-scoped GraphQL mutation. In a client
component, call `useGraphyMutation` directly when:

- the SQL RPC calls `viewer_profile_id()` and therefore uses the browser session;
- the complete mutation is transactional inside PostgreSQL;
- no server-only secret, Auth Admin API, service-role client, or external side effect is needed.

Keep Server Actions for operations requiring trusted server execution, external effects, or
non-browser entry points.

## Service role

```ts
import { createSupabaseServiceRoleClient } from
  "@packages/supabase/client.service";
```

Bypasses RLS. Server-only. Validate caller and permission with RLS client first. Use for auth
admin, bootstrap, cross-row orchestration, or intentionally privileged lookups.

## Auth changes

After mutations affecting JWT claims:

```ts
await supabase.auth.refreshSession();
```

`GraphyClientProvider` listens for auth changes and rebuilds token-scoped Graphy client.

## Realtime

Supabase Realtime is available but no shared repository abstraction exists. If adding:
create channel inside effect, include tenant/org filter when API supports it, validate payload
shape, remove channel on cleanup. Do not cast payload with `as any`.

## Rules

- External rows/payloads: bracket notation.
- `NEXT_PUBLIC_COOKIE_DOMAIN` makes browser/server cookies cross `*.lvh.me`.
- Proxy owns token refresh; server component cookie write failures are intentionally ignored.
- Prefer Graphy for existing typed GraphQL read/mutation patterns; use SDK where GraphQL lacks
  feature, auth API is needed, or current code already uses SDK.
````

## File: skills-lock.json
````json
{
  "version": 1,
  "skills": {
    "caveman": {
      "source": "juliusbrussee/caveman",
      "sourceType": "github",
      "skillPath": "skills/caveman/SKILL.md",
      "computedHash": "1902fa0b569912d0c05736d8d98a72097d9b82719aac88c0c1d03bb546f9176d"
    },
    "caveman-compress": {
      "source": "juliusbrussee/caveman",
      "sourceType": "github",
      "skillPath": "skills/caveman-compress/SKILL.md",
      "computedHash": "1e9b3e2bf68b75dc0252c4328c8514bea79d4d8f7d7259da616ba7d12cad6865"
    },
    "codebase": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "307eb561d25575f5543a8f86fbf4ede14d793bab69ec42952cc8e9fb5973440e"
    },
    "find-skills": {
      "source": "vercel-labs/skills",
      "sourceType": "github",
      "skillPath": "skills/find-skills/SKILL.md",
      "computedHash": "9e1c8b3103f92fa8092568a44fe64858de7c5c9dc65ce4bea8f168080e889cfd"
    },
    "frontend-design": {
      "source": "anthropics/skills",
      "sourceType": "github",
      "skillPath": "skills/frontend-design/SKILL.md",
      "computedHash": "4eabc66183767153e404b39d1b839b1c37f2d82d86f0a0d7e880a579d8d62336"
    },
    "integrate-whatsapp": {
      "source": "gokapso/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/integrate-whatsapp/SKILL.md",
      "computedHash": "acd8594565afb7b28c5490ce1d52fbb2fd99d998c2d500c70a8bbade56f710aa"
    },
    "karpathy-guidelines": {
      "source": "multica-ai/andrej-karpathy-skills",
      "sourceType": "github",
      "skillPath": "skills/karpathy-guidelines/SKILL.md",
      "computedHash": "41e8ca055bbde13d240776a14a076a59614057200340c243130a76ba4e64cac8"
    },
    "my-auth": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "73579054f3516c54d06c4c780dd1578cb0ada0c5f2da01a18505e7f9e11426ab"
    },
    "my-conventions": {
      "source": "./skills",
      "sourceType": "local"
    },
    "my-graphql": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "05734408341dcf11e66c80088a667d29ef76406d490de276de19c549af6f1c2b"
    },
    "my-graphql-codegen": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "046943e6da5b6fbf251ea4041fa419306e942617cbb4e90ccf208a5e3662d5fe"
    },
    "my-graphy": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "681d8b924a96306dc1b52dc551e1ead5673e8b117971586c86b8860464738d74"
    },
    "my-i18n": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "aff4ee43fcd01ac799433a4ea1d21847a8e2e042b8f27cbbe1c540e61fc0c420"
    },
    "my-permissions": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "52bb4895847b36032372be2ee00e12714ae176444acbdb149ffb17fb9fd70b67"
    },
    "my-pr-quick": {
      "source": "./skills",
      "sourceType": "local"
    },
    "my-proxy": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "06e8fa802550ce4c8d90720a9df1da1e0690660cf6428e41fe1a76fe939ec675"
    },
    "my-react-email": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "918aab053edeb5c8112f722b2c699bbe394589f06bae777eac208bc0f2db9529"
    },
    "my-react-pdf": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "7d35ff51a21e115ac4a678d9927bf571c7caec4fd2b08d296ec71db541c1e853"
    },
    "my-supabase": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "1bcf79df6b74a1628110aa61e187b00471d912637eeaf852c0ed3598e9bd3937"
    },
    "my-supabase-codegen": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "c2e587ac302c16c23aec3c3dd4437e60c8bcd7a15e618e64d50bf4edf8a89c4f"
    },
    "my-supabase-react": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "3764287c3c7997f2bef6e2b69c8c13a5274cadb65b8e7f3d4627b2d4bfe1b130"
    },
    "ponytail": {
      "source": "dietrichgebert/ponytail",
      "sourceType": "github",
      "skillPath": "skills/ponytail/SKILL.md",
      "computedHash": "55e888f9d81f873068de13d44f4f963595aa2c2c6bb0f9024160bea79f756618"
    },
    "ponytail-audit": {
      "source": "dietrichgebert/ponytail",
      "sourceType": "github",
      "skillPath": "skills/ponytail-audit/SKILL.md",
      "computedHash": "8b8d72e6ff70b65b6c9518d470fcf29dc696eea93d28f3efa10fdcc60cbd696d"
    },
    "ponytail-review": {
      "source": "dietrichgebert/ponytail",
      "sourceType": "github",
      "skillPath": "skills/ponytail-review/SKILL.md",
      "computedHash": "4646594fcd75455533f7ff1425f4f1c5ba0fa65f88241bf262b1c4fc275f049a"
    },
    "psql": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "0b9883674249303a60a52964b9a9b170ee40d65f80b2120a108338de467fee37"
    },
    "psql-query": {
      "source": "./skills",
      "sourceType": "local",
      "computedHash": "737dfbf7866e81d489cb489bfeecb64284ab1bfc3b88b2a557f9d26b59c9a9f7"
    },
    "shadcn": {
      "source": "shadcn/ui",
      "sourceType": "github",
      "skillPath": "skills/shadcn/SKILL.md",
      "computedHash": "ac9d0d69caac7de1d1e5647f3db3bcd2f13af355d6b3a78780fbf7fc80e8dca0"
    },
    "supabase": {
      "source": "supabase/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/supabase/SKILL.md",
      "computedHash": "d414d598b9428b3e851c4ce61898649906b19e55aa7415bb42a286bd9ca2ab32"
    },
    "supabase-postgres-best-practices": {
      "source": "supabase/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/supabase-postgres-best-practices/SKILL.md",
      "computedHash": "0d2c4857a7d6fdcd3fbc46e458fa4c497f029cab89a01548b3defce203003932"
    },
    "turborepo": {
      "source": "vercel/turborepo",
      "sourceType": "github",
      "skillPath": "skills/turborepo/SKILL.md",
      "computedHash": "b7c3165ae67a2892d6195a5b2cba15c8d96341f5c64ddd0d3ce4225c94a2ae83"
    },
    "vercel-cli": {
      "source": "vercel/vercel",
      "sourceType": "github",
      "skillPath": "skills/vercel-cli/SKILL.md",
      "computedHash": "1e5e86ed5327851f2ab1ed08652c61cc9b194b904d7d44c2c74aa99ad3f5b919"
    },
    "vercel-react-best-practices": {
      "source": "vercel-labs/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/react-best-practices/SKILL.md",
      "computedHash": "ca7b0c0c6e5f2750043f7f0cd72d16ac4e2abc48f9b5500d047a4b77a2506212"
    },
    "web-design-guidelines": {
      "source": "vercel-labs/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/web-design-guidelines/SKILL.md",
      "computedHash": "f3bc47f890f42a44db1007ab390709ec368e4b8c089baee6b0007182236ac474"
    }
  }
}
````

## File: apps/platform/app/(app)/home/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EntityAvatar } from "~/components/entity-avatar";
import { LocaleToggle } from "~/components/locale-toggle";
import { ThemeToggle } from "~/components/theme-toggle";
import { gql } from "~/generated/graphql";
import { OrderByDirection } from "~/generated/graphql/graphql";
import { getViewerAgencies } from "~/hooks/get-viewer-agencies";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { COUNT_DONE, METHOD_ORDER } from "../../auth/onboarding/state";
import { getViewerOnboardingState } from "../../auth/onboarding/state.server";
import { UserMenu } from "./_components/user-menu";
⋮----
href=
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/members/new/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountries } from "~/hooks/get-countries";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { InviteMemberForm } from "./invite-form";
⋮----
export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/members/new">,
): Promise<Metadata>
````

## File: apps/platform/app/(app)/tenants/create/create-form.tsx
````typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useGraphyMutation } from "@packages/graphy/react";
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { SLUGIFY } from "@packages/utils/slug";
import { usePostHog } from "@posthog/next";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { type CreateTenantValues, createTenantSchema } from "./schemas";
⋮----
type PlanId = "free" | "pro";
⋮----
pendingChildren=
⋮----
<Link href=
````

## File: apps/platform/components/shell/atoms.tsx
````typescript
import { Avatar, AvatarFallback } from "@packages/ui-common/shadcn/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui-common/shadcn/components/ui/tooltip";
import type { ComponentProps } from "react";
⋮----
export function InitialsAvatar({
  initials,
  color,
  style,
  size = "default",
  className,
}: {
  initials: string;
  color?: string;
  style?: Record<string, string>;
  size?: "sm" | "default" | "lg" | "md";
  className?: string;
})
⋮----
export function Tip({
  label,
  children,
  disabled,
  side,
  className,
  ...props
}: {
  label: string;
  disabled?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  children: React.ReactNode;
} & ComponentProps<"span">)
````

## File: apps/platform/components/shell/conversations-bell.tsx
````typescript
import { createSupabaseBrowserClient } from "@packages/supabase/client.browser";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Bell, Inbox } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { InboxScope } from "~/components/inbox/scope";
import { SCOPE_DETAIL_HREF, SCOPE_INBOX_HREF, SCOPE_RPC_ARGS } from "~/components/inbox/scope";
import { Tip, useClickOutside } from "~/components/shell/atoms";
import { useRosetta } from "~/lib/i18n.client";
⋮----
type RecentConversation = {
  conversation_id: string;
  conversation_subject: string | null;
  conversation_status: string;
  conversation_last_message_at: string;
  organization_id: number | null;
  agency_id: number | null;
  tenant_id: number | null;
  snippet: string | null;
  unread: boolean;
};
⋮----
async function fetchBellData(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  scope: InboxScope,
): Promise<
⋮----
async function refresh(supabase: ReturnType<typeof createSupabaseBrowserClient>)
⋮----
async function markAllRead()
⋮----
<Tip label=
⋮----
className=
⋮----
onClick=
⋮----
<div className=
````

## File: apps/platform/lib/constants.ts
````typescript
import { URL_NEW } from "@packages/utils/url";
⋮----
/**
 * Convenience: hostname (+ ":port" when applicable). Use for building absolute redirect
 * URLs server-side. On the client, prefer window.location.host — process.env.PORT is not
 * inlined into client bundles, so APP_HOST in browser-only paths will be missing the port.
 */
⋮----
export function DEV_ENV_SNAPSHOT(): Record<string, string>
````

## File: skills/my-i18n/SKILL.md
````markdown
---
name: my-i18n
description: Repository-specific @packages/rosetta, cookie-based locale (no URL segment), dictionaries, server/client translation, email, and PDF localization patterns.
---

# i18n

Supported app locales: `es`, `en`, `pt`. Default: `es`. Config:
`apps/platform/lib/i18n.ts`.

## API surface

All i18n lives in `~/lib/i18n*` — three files, one place:

| Module | Context | Key exports |
|---|---|---|
| `~/lib/i18n` | shared | `ROSETTA`, `LOCALE_CONFIG`, `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `IS_SUPPORTED_LOCALE`, `LOCALE_FROM_PATH`, `SupportedLocale` |
| `~/lib/i18n.server` | server-only | `getServerLocale`, `assertLocale`, `getRosetta`, `LOCALE_FROM_REQUEST`, `HEADER_ACCEPT_LANGUAGE_PARSE` |
| `~/lib/i18n.client` | client-only | `useRosetta`, `useLocale`, `LocaleProvider`, `RosettaProvider` |

`hooks/` only has real React hooks with state/router:
- `~/hooks/use-locale-param` — reads locale from URL params (`useParams`)
- `~/hooks/use-locale-cookie` — reads/sets locale cookie (`useStateCookie`, `useRouter`)

## Routing

Locale is **not** a URL segment. `apps/platform/proxy.ts` resolves it from the `NEXT_LOCALE` cookie (falling back to `Accept-Language`, then the default) and persists it in that cookie before the session update. There is no `/[locale]/` prefix and no sentinel to rewrite.

Client links are plain paths — never embed a locale, and never pass `locale` to `ROUTE` (the helper strips it: `delete query["locale"]` in `apps/platform/lib/route.ts`):

```tsx
<Link href={ROUTE("/tenants/create")}>Crear</Link>
```

Do not thread locale props only to construct hrefs.

## Server component

Colocate dictionary:

```ts
const LOCALE_ES = {
  title: "Miembros",
  count: "{{count}} miembros",
};
const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Members",
    count: "{{count}} members",
  } satisfies typeof LOCALE_ES,
};

export default async function Page(props: PageProps<"/home">) {
  // locale comes from the cookie via getRosetta — never from props.params
  const { t } = await getRosetta(LOCALES);
  return <h1>{t("title")}</h1>;
}
```

Use `ROSETTA` from `~/lib/i18n`. Route params are external: bracket access when not
destructuring.

## Server actions

Cookie locale:

```ts
import { getServerLocale, getRosetta } from "~/lib/i18n.server";

// With explicit locale (e.g. from params):
const { t } = getRosetta(LOCALES, locale);

// Without locale (reads cookie):
const locale = await getServerLocale();
const { t } = ROSETTA(LOCALES, locale);
```

## Client component

App layout supplies `LocaleProvider`. Use:

```ts
import { useRosetta } from "~/lib/i18n.client";

const { t } = useRosetta(LOCALES);
```

For many children sharing same dictionary, use `RosettaProvider`. Do not use
`withRosettaLocales` inside React PDF; it adds a DOM `<div>`.

## Dictionary behavior

- Base locale defines shape; other locales `satisfies typeof BASE`.
- Dotted keys supported.
- `{{name}}` interpolation supported.
- Function values supported for plural/custom logic.
- Regional locale inherits base: `es-CL` merges `es` + overrides.
- Missing key returns `""` by default; `{ strict: true }` throws.

Current package imports are direct:

```ts
import { RosettaImpl } from "@packages/rosetta/rosetta";
import {
  LocaleProvider,
  RosettaProvider,
  useLocale,
  useRosetta,
} from "@packages/rosetta/use-rosetta";
```

No `@packages/rosetta` barrel.

## Email/PDF

Non-Next renderers must inject BCP47 locale:

```tsx
export function Template({ locale = "es-CL", ...props }: Props) {
  return (
    <LocaleProvider locale={locale}>
      <TemplateContent {...props} />
    </LocaleProvider>
  );
}
```

Provider and consumer must be separate components; provider value is unavailable in same
component render.

## File ownership — never pass dictionaries or `t`

Each file is the sole owner of its strings. Never import/export `LOCALES` between files; two files
needing the same key each duplicate it (colocation beats DRY).

- **Never pass the dictionary object as a prop.** A server page builds no `dict` to hand a client child.
- **Never pass the translator (`t`) or a `ReturnType<typeof useRosetta>` across a function/component
  boundary** as an argument or prop. Each component/sub-component calls `useRosetta(LOCALES)` itself
  (`LOCALES` is module-scoped, so it's free). A helper that builds labelled data (tab descriptors,
  menu items) does **not** take `t` — inline the build where `t` is in scope, or return string *keys*
  and translate at the call site. A `t` parameter is the same anti-pattern as a `dict` prop.
- **`LOCALE_ES` and `LOCALES` go at the bottom of the file**, after all component/function
  definitions. They are data constants — keep imports and logic at the top.

## Rules

- User-facing strings belong in dictionaries except deliberate prototypes.
- Keep dictionaries near sole consumer.
- Avoid `IS_SUPPORTED_LOCALE`, trust Rosetta.
- HTML `lang` uses BCP47 mapping from `LOCALE_TO_BCP47` when full tag needed.
- `generateStaticParams` for locale-parameterized pages must include `locale`: `SUPPORTED_LOCALES.flatMap(locale => items.map(item => ({ locale, ...item })))`.
````

## File: skills/my-supabase/SKILL.md
````markdown
---
name: my-supabase
description: Repository-specific Supabase Postgres schema, multi-tenancy, RLS, SQL naming, functions, triggers, storage, seed, and pgTAP workflow.
---

# Supabase SQL

Source of truth:

```text
packages/supabase/supabase/migrations/00000000000000_schema.sql
```

Prototype workflow: edit this file directly, then `pnpm db:reset`. Never `DROP ... CASCADE`.

## Core model

```sql
tenants(
  tenant_id serial,
  tenant_slug citext,
  tenant_name text
)

organizations(
  organization_id serial,
  tenant_id int,
  organization_slug citext,
  organization_name text
)

organization_memberships(
  organization_membership_id serial,
  organization_id int,
  profile_id uuid,
  organization_membership_accepted_at timestamptz,
  organization_membership_rejected_at timestamptz,
  organization_membership_revoked_at timestamptz,
  ...
)
```

Tenant-scoped product tables carry `tenant_id int`; org-scoped tables also carry
`organization_id int`. Use indexed filters plus RLS.

## Naming

- `snake_case` only.
- No hyphens in identifiers or enum values. pg_graphql can lose whole schema.
- External spec hyphen literal: `text` + `check`, not enum.
- PK/columns use semantic prefixes already present (`tenant_id`, `profile_created_at`).
- `timestamptz`, not timestamp without timezone.
- plpgsql locals start `_`.
- Pure SQL/TS helpers follow repository uppercase convention where applicable.

## RLS

Every exposed table:

```sql
alter table public.example enable row level security;
revoke all on table public.example from anon, authenticated;
grant select, insert, update, delete
  on table public.example to anon, authenticated;
```

`anon` grants may be needed for GraphQL schema visibility. RLS still gates rows.

Prefer viewer helpers:

```sql
tenant_id in (select public.viewer_tenant_ids())
organization_id in (select public.viewer_organization_ids())
organization_id in (
  select public.viewer_permission_org_ids('members_manage')
)
```

Do not parse JWT ad hoc in each policy. Do not rely on app filtering.

## Security-definer functions

Use `set search_path to ''` and schema-qualify objects:

```sql
create or replace function public.example(...)
returns ...
security definer
language sql
set search_path to ''
as $$
  select ... from public.table_name;
$$;
```

Grant execute narrowly. Review privilege escalation and recursive RLS.

For a mutation that creates one table row, return the complete composite row:

```sql
create or replace function protected.tenant_create(
  profile_id uuid,
  tenant_slug text,
  tenant_name text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    -- Perform the complete transactional workflow.
  $$;

create or replace function public.viewer_tenant_create(
  tenant_slug text,
  tenant_name text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    select tenant.*
    from protected.tenant_create(
      public.viewer_profile_id(true),
      $1,
      $2
    ) tenant;
  $$;
```

- `protected.*_create(profile_id, ...)` owns the transaction and is the single source of truth.
- `public.viewer_*_create(...)` only resolves the current profile and delegates.
- Declare mutation functions explicitly `volatile`.
- Use `returns setof public.<table> rows 1`, not a scalar ID. Supabase types preserve the
  complete row and mark the result one-to-one.
- Revoke protected execution from `public`; grant it only to trusted server roles.
- Grant the viewer wrapper to `anon, authenticated` when pg_graphql needs anon visibility.

## plpgsql style

Prefer `if / elsif` over consecutive `if … end if; if … end if;` blocks. Consecutive guards
waste lines and force the reader to scan more `end if`s. Chain with `elsif`, or combine with `or`
when the body is identical:

```sql
-- ❌ Two separate blocks
if public.viewer_profile_id() is null then
  return old;
end if;
if old.permission_id not in ('members_manage', '*') then
  return old;
end if;

-- ✅ Single block, elsif
if public.viewer_profile_id() is null then
  return old;
elsif old.permission_id not in ('members_manage', '*') then
  return old;
end if;

-- ✅ Same action → combine with `or`
if old.organization_membership_revoked_at is not null or new.organization_membership_revoked_at is null then
  return new;
end if;
```

## Multi-step DB writes must be a single RPC

Never sequence multiple `.from().insert()` / `.update()` for one logical operation — each call is
its own round-trip and transaction; a crash or race between them leaves the DB partial. Write one
`security definer` plpgsql function doing read-check + write atomically, call via `.rpc()`.

- DB mutations (insert, update, upsert, permission checks) → SQL RPC, `security definer`.
- External side effects (`auth.admin.*`, GoTrue user creation, email send) → stay in the action; can't be transactional.
- RPCs raise with a stable locale key as the message; the action matches `rpcError.message` against
  LOCALES keys — never parse prose:
  ```sql
  raise exception 'already_member' using errcode = 'P0001';
  ```

**Client choice** (which client calls the RPC):
- **Service-role client** — RPCs requiring `caller_id` passed explicitly (service role has no JWT `sub`).
- **Authenticated server client** — RPCs calling `viewer_profile_id()` internally (e.g. `actionRespondInvitation`).
- **`useGraphyMutation` from the client component — DEFAULT for viewer-scoped mutations.** If the whole
  workflow is transactional SQL, calls `viewer_*` internally, and needs no server-only API/secret,
  expose it through pg_graphql and call it as a GraphQL mutation. Do NOT wrap it in a pass-through
  Server Action. (GraphQL exposure + return shape: see `my-graphql`.)

## Lifecycle/invariants

Use constraints/triggers for facts that must survive every caller. Current schema protects
membership claim consistency, last admin, self-revocation, permission preset slugs, normalized
identity/invite values, reserved tenant slugs.

## Storage

Bucket name matches owner table (`profiles`, `organizations`). First object path segment is row
PK. Public buckets allow URL reads; `storage.objects` RLS gates writes. Add storage pgTAP when
changing policies.

## Seed

`packages/supabase/supabase/seed.sql` owns reserved slugs, permission catalog/presets, local
fixtures. Make reset idempotent.

## Tests

```bash
pnpm db:start
pnpm test:db
```

Test file:

```sql
begin;
select plan(N);
set local role authenticated;
set local request.jwt.claims to '...'::jsonb::text;
-- assertions
select * from finish();
rollback;
```

Without authenticated role, postgres bypasses RLS.

## After schema change

```bash
pnpm db:reset
pnpm generate:types
pnpm generate:graphql:schema
pnpm --filter @apps/platform run generate:graphql
pnpm test:db
```
````

## File: .gitignore
````
# Dependencies
node_modules/

# Next.js
.next/
out/

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Per-worktree dev URL/port map (generated by pnpm db:env:development)
.dev-env.md

# Local TLS certs (mkcert-generated, machine-specific, never commit private keys)
**/certificates/

# Turbo
.turbo/

# Vercel
.vercel/

# Supabase
**/supabase/.branches
**/supabase/.temp

# Playwright
**/test-results/
**/playwright-report/
**/playwright/.cache/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Editor
.idea/
*.swp
*.swo

# Playwright
.playwright-mcp
.claude/worktrees/

# Skills — third-party vendored (committed), but runtime artifacts are not
skills-third-party/**/__pycache__/
skills-third-party/**/*.pyc
skills-third-party/**/*.pyo
skills-third-party/**/.pytest_cache/
skills-third-party/**/.mypy_cache/
skills-third-party/**/*.egg-info/
skills-third-party/**/dist/
skills-third-party/**/.ruff_cache/

# Agent skill stores — generated symlinks, not committed.
# Rebuilt on `pnpm install` via postinstall (scripts/skills-setup.mjs): every dir
# in skills/ (first-party) and skills-third-party/ (vendored) is symlinked here.
# Source of truth: skills/ + skills-third-party/ (both committed).
# .agents/skills/ is the universal store read by Codex, Cursor, Copilot, OpenCode, Zed.
.agents/skills/
agent/skills/
.claude/skills/
````

## File: biome.jsonc
````json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "root": true,
  "files": {
    "includes": [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
      "**/*.mjs",
      "**/*.cjs",
      "**/*.json",
      "**/*.jsonc",
      "**/*.css",
      "!**/node_modules",
      "!**/.github",
      "!**/.turbo",
      "!**/.next",
      "!**/.vercel",
      "!**/.temp",
      "!**/.agents",
      "!**/.claude",
      "!**/agent",
      "!skills-third-party",
      "!skills/codebase"
    ]
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "lineWidth": 120,
    "indentWidth": 2,
    "indentStyle": "space"
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  },
  "css": {
    "parser": {
      "tailwindDirectives": true
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "security": {
        "noDangerouslySetInnerHtml": "warn"
      },
      "nursery": {
        "noFloatingPromises": "error"
      },
      "a11y": {
        "noStaticElementInteractions": "off",
        "noNoninteractiveElementToInteractiveRole": "off",
        "noRedundantAlt": "off",
        "useAriaPropsSupportedByRole": "off",
        "noRedundantRoles": "off",
        "noSvgWithoutTitle": "off",
        "useFocusableInteractive": "off",
        "useKeyWithClickEvents": "off",
        "useMediaCaption": "off",
        "useSemanticElements": "off",
        "useValidAnchor": "off",
        "useValidAriaProps": "off",
        "useAriaPropsForRole": "off"
      },
      "correctness": {
        "noUnusedVariables": "off",
        "noUnusedFunctionParameters": "off",
        "noUnreachable": "off",
        "useExhaustiveDependencies": "off",
        // MCP tool `handle` methods are async generators by base-class contract
        // (McpTool.handle: McpToolStream) so they can optionally stream progress via
        // `yield`. Most just `return` a single result and never yield — intentional, not a bug.
        "useYield": "off"
      },
      "performance": {
        "noAccumulatingSpread": "off",
        "noImgElement": "off"
      },
      "complexity": {
        "noBannedTypes": "warn",
        "noForEach": "warn",
        "noStaticOnlyClass": "off",
        "noThisInStatic": "on",
        "noUselessConstructor": "off",
        "noUselessSwitchCase": "off",
        "useLiteralKeys": "off",
        "useOptionalChain": "off"
      },
      "style": {
        "noNegationElse": "off",
        "noNonNullAssertion": "off",
        "noParameterAssign": "off",
        "useExponentiationOperator": "off",
        "noUselessElse": "off",
        "noInferrableTypes": "off",
        "useAsConstAssertion": "error",
        "useEnumInitializers": "error",
        "useSelfClosingElements": "error",
        "useSingleVarDeclarator": "error",
        "noUnusedTemplateLiteral": "error",
        "useNumberNamespace": "error"
      },
      "suspicious": {
        "noFallthroughSwitchClause": "warn",
        "noRedeclare": "off",
        "noAsyncPromiseExecutor": "off",
        "noExplicitAny": "off",
        "noArrayIndexKey": "off",
        "noNonNullAssertedOptionalChain": "off",
        "useIterableCallbackReturn": "off"
      }
    }
  }
}
````

## File: apps/platform/app/(app)/agencies/create/agency-create.tsx
````typescript
import { useGraphyMutation } from "@packages/graphy/react";
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { SLUGIFY } from "@packages/utils/slug";
import { ArrowRight, Briefcase, Building2, Check, Eye, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { gql } from "~/generated/graphql";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
⋮----
type Stage = "form" | "created";
⋮----
/**
   * Read the live host (hostname + port) so the previewed URL stays accurate in Conductor
   * dev where parallel instances bind to different ports. Empty on SSR → matches the initial
   * client render to avoid hydration mismatches; populated after mount. `APP_HOST` from
   * constants is server-only (PORT isn't inlined into client bundles), so we read it here.
   */
⋮----
// Shared slug rule from @packages/utils, capped at 40 like the tenant-create flow.
⋮----
async function onSubmit(e: React.FormEvent<HTMLFormElement>)
⋮----
pendingChildren=
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowLeft, FileText, Mail, Phone, ShieldCheck } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { gql } from "~/generated/graphql";
import { FilterIs } from "~/generated/graphql/graphql";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { EditPermissionsForm } from "./edit-form";
⋮----
function MEMBER_LABEL(row: {
  profile_id: string | null;
  profile_name_full: string | null;
  email: string | null;
  organization_membership_invite_email: string | null;
  organization_membership_invite_phone: string | null;
  organization_membership_invite_document_value: string | null;
  organization_membership_invite_address_level0_id: string | null;
}): string
⋮----
export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit">,
): Promise<Metadata>
````

## File: apps/platform/app/(app)/t/[tenant_slug]/[organization_id]/settings/members/page.tsx
````typescript
import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { createSupabaseServiceRoleClient } from "@packages/supabase/client.service";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { INITIALS_OF } from "@packages/utils/string";
import { ChevronRight, ShieldCheck, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { gql } from "~/generated/graphql";
import { FilterIs } from "~/generated/graphql/graphql";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { PendingInvitations } from "./pending-invitations";
⋮----
function GRANTS_OF(node: {
  organizationMembershipPermissionsCollection?: { edges: { node: { permissionId: string } }[] } | null;
}): string[]
⋮----
export async function generateMetadata(
  props: PageProps<"/t/[tenant_slug]/[organization_id]/settings/members">,
): Promise<Metadata>
⋮----
href=
````

## File: apps/platform/app/auth/logout/page.tsx
````typescript
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { INITIALS_OF } from "@packages/utils/string";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { getViewerProfileRedirect } from "~/hooks/get-viewer-profile";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AuthCard } from "../_components/auth-card";
import { signOutForm } from "./actions";
````

## File: apps/platform/app/layout.tsx
````typescript
import { Toaster } from "@packages/ui-common/shadcn/components/ui/sonner";
import { TooltipProvider } from "@packages/ui-common/shadcn/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { DevEnvConsole } from "~/components/dev-env-console";
import { GraphyClientProvider } from "~/components/graphy-provider";
import { PostHogIdentify } from "~/components/posthog-identify";
import { PostHogProvider } from "~/components/posthog-provider";
import { PwaRegister } from "~/components/pwa-register";
import { ThemeProvider } from "~/components/theme-provider";
import { APP_URL, DEV_ENV_SNAPSHOT, NODE_ENV } from "~/lib/constants";
import { LocaleProvider } from "~/lib/i18n.client";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
⋮----
export async function generateMetadata(): Promise<Metadata>
⋮----
````

## File: apps/platform/components/shell/settings-menu.tsx
````typescript
import { useMounted } from "@packages/react-hooks/use-mounted";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowUpRight, ChevronDown, Globe, HelpCircle, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useRef, useState, useTransition } from "react";
import { Tip, useClickOutside } from "~/components/shell/atoms";
import { useLocaleCookie } from "~/hooks/use-locale-cookie";
import { LOCALE_LABEL, SUPPORTED_LOCALES } from "~/lib/i18n";
import { useRosetta } from "~/lib/i18n.client";
⋮----
<Tip label=
⋮----
className=
⋮----
value=
````

## File: apps/platform/components/locale-toggle.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { ComponentProps } from "react";
import { useTransition } from "react";
import { useLocaleCookie } from "~/hooks/use-locale-cookie";
import { LOCALE_LABEL, SUPPORTED_LOCALES, type SupportedLocale } from "~/lib/i18n";
import { useRosetta } from "~/lib/i18n.client";
⋮----
function selectLocale(next: SupportedLocale)
⋮----
onClick=
⋮----
className=
````

## File: apps/platform/components/system-message.tsx
````typescript
import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { type LucideIcon, RotateCcw, Search, TriangleAlert, Wrench } from "lucide-react";
import type { ComponentProps } from "react";
import { useLocale } from "~/lib/i18n.client";
⋮----
type SystemKind = "notFound" | "error" | "maintenance";
⋮----
type SystemDef = { code: string; Icon: LucideIcon };
⋮----
export function SystemMessage({
  kind = "notFound",
  reset,
  className,
  ...props
}:
⋮----
className=
⋮----
<Button variant="outline" className="h-9" onClick=
⋮----
function RESOLVE_COPY(locale: string): Record<SystemKind, Copy>
````

## File: CLAUDE.md
````markdown
@AGENTS.md
````

## File: packages/supabase/supabase/seed.sql
````sql
insert into public.reserved_slugs (reserved_slug) values
  ('a'),
  ('admin'),
  ('affiliate'),
  ('agencies'),
  ('api'),
  ('app'),
  ('assets'),
  ('auth'),
  ('cdn'),
  ('en'),
  ('es'),
  ('pt'),
  ('health'),
  ('home'),
  ('legal'),
  ('maintenance'),
  ('me'),
  ('notifications'),
  ('public'),
  ('static'),
  ('support'),
  ('tenants'),
  ('www'),
  ('_next')
on conflict (reserved_slug) do nothing;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000a11c',
    'authenticated', 'authenticated',
    'alice@humane.test',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Alice Owner"}'::jsonb,
    current_timestamp, current_timestamp,
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000b00b',
    'authenticated', 'authenticated',
    'bob@humane.test',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Bob Employee"}'::jsonb,
    current_timestamp, current_timestamp,
    '', '', '', ''
  )
on conflict (id) do nothing;
insert into auth.identities (
  provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-00000000a11c',
    '00000000-0000-0000-0000-00000000a11c',
    '{"sub":"00000000-0000-0000-0000-00000000a11c","email":"alice@humane.test"}'::jsonb,
    'email',
    current_timestamp, current_timestamp, current_timestamp
  ),
  (
    '00000000-0000-0000-0000-00000000b00b',
    '00000000-0000-0000-0000-00000000b00b',
    '{"sub":"00000000-0000-0000-0000-00000000b00b","email":"bob@humane.test"}'::jsonb,
    'email',
    current_timestamp, current_timestamp, current_timestamp
  )
on conflict (provider_id, provider) do nothing;
insert into public.tenants (tenant_id, tenant_slug, tenant_name)
values
  (1, 'acme', 'Acme SpA'),
  (2, 'globex', 'Globex SA')
on conflict (tenant_id) do nothing;
select setval(pg_get_serial_sequence('public.tenants', 'tenant_id'), (select max(tenant_id) from public.tenants));
insert into public.organizations (organization_id, tenant_id, organization_slug, organization_name)
values
  (1, 1, 'acme', 'Acme SpA'),
  (2, 2, 'globex', 'Globex SA')
on conflict (organization_id) do nothing;
select setval(pg_get_serial_sequence('public.organizations', 'organization_id'), (select max(organization_id) from public.organizations));
with seeded_organization_memberships as (
  insert into public.organization_memberships (organization_id, profile_id, organization_membership_accepted_at)
  values
    (1, '00000000-0000-0000-0000-00000000a11c', current_timestamp),
    (2, '00000000-0000-0000-0000-00000000a11c', current_timestamp),
    (1, '00000000-0000-0000-0000-00000000b00b', current_timestamp)
  returning organization_membership_id, organization_id, profile_id
)
insert into public.organization_membership_permissions (organization_membership_id, permission_id)
select sm.organization_membership_id, perm.permission_id
from seeded_organization_memberships sm
join (values
  (1, '00000000-0000-0000-0000-00000000a11c'::uuid, '*'::extensions.citext),
  (2, '00000000-0000-0000-0000-00000000a11c'::uuid, 'presets_manage'::extensions.citext),
  (1, '00000000-0000-0000-0000-00000000b00b'::uuid, 'presets_manage'::extensions.citext)
) as perm (organization_id, profile_id, permission_id)
  on perm.organization_id = sm.organization_id and perm.profile_id = sm.profile_id;
update public.profiles
  set profile_onboarded_at = current_timestamp
  where profile_id in (
    '00000000-0000-0000-0000-00000000a11c',
    '00000000-0000-0000-0000-00000000b00b'
  );
insert into public.conversation_topics (conversation_topic_slug, conversation_topic_name, conversation_topic_description, conversation_topic_priority, conversation_topic_kind)
values
  ('security-alert', 'Security alerts', 'Sign-ins from new devices, password changes, and new recovery methods.', 'critical', 'fatal'),
  ('weekly-activity', 'Weekly activity', 'A summary of your active sessions and recent account activity.', 'medium', 'info'),
  ('billing-change', 'Billing changes', 'Charges, payment failures, and plan changes in your organizations.', 'high', 'warn'),
  ('organization-invitation', 'Organization invitations', 'When someone invites you to join their organization.', 'high', 'info'),
  ('product-update', 'Product updates', 'New features, open betas, and important improvements.', 'medium', 'debug'),
  ('tips-and-guides', 'Tips and guides', 'Short tricks to get more out of the tool.', 'low', 'log'),
  ('surveys-and-interviews', 'Surveys and interviews', 'Help us improve. Sometimes there is an incentive.', 'low', 'log')
on conflict (conversation_topic_slug) do nothing;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-0000000ca401',
    'authenticated', 'authenticated',
    'iris@humane.test',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Iris Affiliate"}'::jsonb,
    current_timestamp, current_timestamp,
    '', '', '', ''
  )
on conflict (id) do nothing;
insert into auth.identities (
  provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
values
  (
    '00000000-0000-0000-0000-0000000ca401',
    '00000000-0000-0000-0000-0000000ca401',
    '{"sub":"00000000-0000-0000-0000-0000000ca401","email":"iris@humane.test"}'::jsonb,
    'email',
    current_timestamp, current_timestamp, current_timestamp
  )
on conflict (provider_id, provider) do nothing;
update public.profiles
  set profile_onboarded_at = current_timestamp
  where profile_id = '00000000-0000-0000-0000-0000000ca401';
insert into public.agencies (agency_name, agency_slug)
values ('Demo Auditores', 'demo-auditores')
on conflict (agency_slug) do nothing;
insert into public.agency_memberships (agency_id, profile_id, agency_membership_accepted_at)
values
  ((select agency_id from public.agencies where agency_slug = 'demo-auditores'), '00000000-0000-0000-0000-0000000ca401', current_timestamp),
  ((select agency_id from public.agencies where agency_slug = 'demo-auditores'), '00000000-0000-0000-0000-00000000a11c', null)
on conflict (agency_id, profile_id) do nothing;
insert into public.agency_membership_permissions (agency_membership_id, permission_id)
values (
  (select am.agency_membership_id
   from public.agency_memberships am
   join public.agencies a using (agency_id)
   where a.agency_slug = 'demo-auditores'
     and am.profile_id = '00000000-0000-0000-0000-0000000ca401'),
  '*'
)
on conflict (agency_membership_id, permission_id) do nothing;
insert into public.agencies_organizations_grants (agency_id, organization_id, permission_id)
values ((select agency_id from public.agencies where agency_slug = 'demo-auditores'), 1, '*')
on conflict do nothing;
insert into public.addresses_level0 (address_level0_id, address_level0_name, address_level0_emoji) values
  ('AF', 'Afghanistan', '🇦🇫'),
  ('AX', 'Åland Islands', '🇦🇽'),
  ('AL', 'Albania', '🇦🇱'),
  ('DZ', 'Algeria', '🇩🇿'),
  ('AS', 'American Samoa', '🇦🇸'),
  ('AD', 'Andorra', '🇦🇩'),
  ('AO', 'Angola', '🇦🇴'),
  ('AI', 'Anguilla', '🇦🇮'),
  ('AQ', 'Antarctica', '🇦🇶'),
  ('AG', 'Antigua and Barbuda', '🇦🇬'),
  ('AR', 'Argentina', '🇦🇷'),
  ('AM', 'Armenia', '🇦🇲'),
  ('AW', 'Aruba', '🇦🇼'),
  ('AU', 'Australia', '🇦🇺'),
  ('AT', 'Austria', '🇦🇹'),
  ('AZ', 'Azerbaijan', '🇦🇿'),
  ('BS', 'Bahamas', '🇧🇸'),
  ('BH', 'Bahrain', '🇧🇭'),
  ('BD', 'Bangladesh', '🇧🇩'),
  ('BB', 'Barbados', '🇧🇧'),
  ('BY', 'Belarus', '🇧🇾'),
  ('BE', 'Belgium', '🇧🇪'),
  ('BZ', 'Belize', '🇧🇿'),
  ('BJ', 'Benin', '🇧🇯'),
  ('BM', 'Bermuda', '🇧🇲'),
  ('BT', 'Bhutan', '🇧🇹'),
  ('BO', 'Bolivia', '🇧🇴'),
  ('BQ', 'Bonaire, Sint Eustatius and Saba', '🇧🇶'),
  ('BA', 'Bosnia and Herzegovina', '🇧🇦'),
  ('BW', 'Botswana', '🇧🇼'),
  ('BV', 'Bouvet Island', '🇧🇻'),
  ('BR', 'Brazil', '🇧🇷'),
  ('IO', 'British Indian Ocean Territory', '🇮🇴'),
  ('BN', 'Brunei Darussalam', '🇧🇳'),
  ('BG', 'Bulgaria', '🇧🇬'),
  ('BF', 'Burkina Faso', '🇧🇫'),
  ('BI', 'Burundi', '🇧🇮'),
  ('CV', 'Cabo Verde', '🇨🇻'),
  ('KH', 'Cambodia', '🇰🇭'),
  ('CM', 'Cameroon', '🇨🇲'),
  ('CA', 'Canada', '🇨🇦'),
  ('KY', 'Cayman Islands', '🇰🇾'),
  ('CF', 'Central African Republic', '🇨🇫'),
  ('TD', 'Chad', '🇹🇩'),
  ('CL', 'Chile', '🇨🇱'),
  ('CN', 'China', '🇨🇳'),
  ('CX', 'Christmas Island', '🇨🇽'),
  ('CC', 'Cocos (Keeling) Islands', '🇨🇨'),
  ('CO', 'Colombia', '🇨🇴'),
  ('KM', 'Comoros', '🇰🇲'),
  ('CG', 'Congo', '🇨🇬'),
  ('CD', 'Congo, Democratic Republic of the', '🇨🇩'),
  ('CK', 'Cook Islands', '🇨🇰'),
  ('CR', 'Costa Rica', '🇨🇷'),
  ('CI', 'Côte d''Ivoire', '🇨🇮'),
  ('HR', 'Croatia', '🇭🇷'),
  ('CU', 'Cuba', '🇨🇺'),
  ('CW', 'Curaçao', '🇨🇼'),
  ('CY', 'Cyprus', '🇨🇾'),
  ('CZ', 'Czechia', '🇨🇿'),
  ('DK', 'Denmark', '🇩🇰'),
  ('DJ', 'Djibouti', '🇩🇯'),
  ('DM', 'Dominica', '🇩🇲'),
  ('DO', 'Dominican Republic', '🇩🇴'),
  ('EC', 'Ecuador', '🇪🇨'),
  ('EG', 'Egypt', '🇪🇬'),
  ('SV', 'El Salvador', '🇸🇻'),
  ('GQ', 'Equatorial Guinea', '🇬🇶'),
  ('ER', 'Eritrea', '🇪🇷'),
  ('EE', 'Estonia', '🇪🇪'),
  ('SZ', 'Eswatini', '🇸🇿'),
  ('ET', 'Ethiopia', '🇪🇹'),
  ('FK', 'Falkland Islands (Malvinas)', '🇫🇰'),
  ('FO', 'Faroe Islands', '🇫🇴'),
  ('FJ', 'Fiji', '🇫🇯'),
  ('FI', 'Finland', '🇫🇮'),
  ('FR', 'France', '🇫🇷'),
  ('GF', 'French Guiana', '🇬🇫'),
  ('PF', 'French Polynesia', '🇵🇫'),
  ('TF', 'French Southern Territories', '🇹🇫'),
  ('GA', 'Gabon', '🇬🇦'),
  ('GM', 'Gambia', '🇬🇲'),
  ('GE', 'Georgia', '🇬🇪'),
  ('DE', 'Germany', '🇩🇪'),
  ('GH', 'Ghana', '🇬🇭'),
  ('GI', 'Gibraltar', '🇬🇮'),
  ('GR', 'Greece', '🇬🇷'),
  ('GL', 'Greenland', '🇬🇱'),
  ('GD', 'Grenada', '🇬🇩'),
  ('GP', 'Guadeloupe', '🇬🇵'),
  ('GU', 'Guam', '🇬🇺'),
  ('GT', 'Guatemala', '🇬🇹'),
  ('GG', 'Guernsey', '🇬🇬'),
  ('GN', 'Guinea', '🇬🇳'),
  ('GW', 'Guinea-Bissau', '🇬🇼'),
  ('GY', 'Guyana', '🇬🇾'),
  ('HT', 'Haiti', '🇭🇹'),
  ('HM', 'Heard Island and McDonald Islands', '🇭🇲'),
  ('VA', 'Holy See', '🇻🇦'),
  ('HN', 'Honduras', '🇭🇳'),
  ('HK', 'Hong Kong', '🇭🇰'),
  ('HU', 'Hungary', '🇭🇺'),
  ('IS', 'Iceland', '🇮🇸'),
  ('IN', 'India', '🇮🇳'),
  ('ID', 'Indonesia', '🇮🇩'),
  ('IR', 'Iran (Islamic Republic of)', '🇮🇷'),
  ('IQ', 'Iraq', '🇮🇶'),
  ('IE', 'Ireland', '🇮🇪'),
  ('IM', 'Isle of Man', '🇮🇲'),
  ('IL', 'Israel', '🇮🇱'),
  ('IT', 'Italy', '🇮🇹'),
  ('JM', 'Jamaica', '🇯🇲'),
  ('JP', 'Japan', '🇯🇵'),
  ('JE', 'Jersey', '🇯🇪'),
  ('JO', 'Jordan', '🇯🇴'),
  ('KZ', 'Kazakhstan', '🇰🇿'),
  ('KE', 'Kenya', '🇰🇪'),
  ('KI', 'Kiribati', '🇰🇮'),
  ('KP', 'Korea (Democratic People''s Republic of)', '🇰🇵'),
  ('KR', 'Korea, Republic of', '🇰🇷'),
  ('KW', 'Kuwait', '🇰🇼'),
  ('KG', 'Kyrgyzstan', '🇰🇬'),
  ('LA', 'Lao', '🇱🇦'),
  ('LV', 'Latvia', '🇱🇻'),
  ('LB', 'Lebanon', '🇱🇧'),
  ('LS', 'Lesotho', '🇱🇸'),
  ('LR', 'Liberia', '🇱🇷'),
  ('LY', 'Libya', '🇱🇾'),
  ('LI', 'Liechtenstein', '🇱🇮'),
  ('LT', 'Lithuania', '🇱🇹'),
  ('LU', 'Luxembourg', '🇱🇺'),
  ('MO', 'Macao', '🇲🇴'),
  ('MG', 'Madagascar', '🇲🇬'),
  ('MW', 'Malawi', '🇲🇼'),
  ('MY', 'Malaysia', '🇲🇾'),
  ('MV', 'Maldives', '🇲🇻'),
  ('ML', 'Mali', '🇲🇱'),
  ('MT', 'Malta', '🇲🇹'),
  ('MH', 'Marshall Islands', '🇲🇭'),
  ('MQ', 'Martinique', '🇲🇶'),
  ('MR', 'Mauritania', '🇲🇷'),
  ('MU', 'Mauritius', '🇲🇺'),
  ('YT', 'Mayotte', '🇾🇹'),
  ('MX', 'Mexico', '🇲🇽'),
  ('FM', 'Micronesia (Federated States of)', '🇫🇲'),
  ('MD', 'Moldova, Republic of', '🇲🇩'),
  ('MC', 'Monaco', '🇲🇨'),
  ('MN', 'Mongolia', '🇲🇳'),
  ('ME', 'Montenegro', '🇲🇪'),
  ('MS', 'Montserrat', '🇲🇸'),
  ('MA', 'Morocco', '🇲🇦'),
  ('MZ', 'Mozambique', '🇲🇿'),
  ('MM', 'Myanmar', '🇲🇲'),
  ('NA', 'Namibia', '🇳🇦'),
  ('NR', 'Nauru', '🇳🇷'),
  ('NP', 'Nepal', '🇳🇵'),
  ('NL', 'Netherlands', '🇳🇱'),
  ('NC', 'New Caledonia', '🇳🇨'),
  ('NZ', 'New Zealand', '🇳🇿'),
  ('NI', 'Nicaragua', '🇳🇮'),
  ('NE', 'Niger', '🇳🇪'),
  ('NG', 'Nigeria', '🇳🇬'),
  ('NU', 'Niue', '🇳🇺'),
  ('NF', 'Norfolk Island', '🇳🇫'),
  ('MK', 'North Macedonia', '🇲🇰'),
  ('MP', 'Northern Mariana Islands', '🇲🇵'),
  ('NO', 'Norway', '🇳🇴'),
  ('OM', 'Oman', '🇴🇲'),
  ('PK', 'Pakistan', '🇵🇰'),
  ('PW', 'Palau', '🇵🇼'),
  ('PS', 'Palestine, State of', '🇵🇸'),
  ('PA', 'Panama', '🇵🇦'),
  ('PG', 'Papua New Guinea', '🇵🇬'),
  ('PY', 'Paraguay', '🇵🇾'),
  ('PE', 'Peru', '🇵🇪'),
  ('PH', 'Philippines', '🇵🇭'),
  ('PN', 'Pitcairn', '🇵🇳'),
  ('PL', 'Poland', '🇵🇱'),
  ('PT', 'Portugal', '🇵🇹'),
  ('PR', 'Puerto Rico', '🇵🇷'),
  ('QA', 'Qatar', '🇶🇦'),
  ('RE', 'Réunion', '🇷🇪'),
  ('RO', 'Romania', '🇷🇴'),
  ('RU', 'Russian Federation', '🇷🇺'),
  ('RW', 'Rwanda', '🇷🇼'),
  ('BL', 'Saint Barthélemy', '🇧🇱'),
  ('SH', 'Saint Helena, Ascension and Tristan da Cunha', '🇸🇭'),
  ('KN', 'Saint Kitts and Nevis', '🇰🇳'),
  ('LC', 'Saint Lucia', '🇱🇨'),
  ('MF', 'Saint Martin (French part)', '🇲🇫'),
  ('PM', 'Saint Pierre and Miquelon', '🇵🇲'),
  ('VC', 'Saint Vincent and the Grenadines', '🇻🇨'),
  ('WS', 'Samoa', '🇼🇸'),
  ('SM', 'San Marino', '🇸🇲'),
  ('ST', 'Sao Tome and Principe', '🇸🇹'),
  ('SA', 'Saudi Arabia', '🇸🇦'),
  ('SN', 'Senegal', '🇸🇳'),
  ('RS', 'Serbia', '🇷🇸'),
  ('SC', 'Seychelles', '🇸🇨'),
  ('SL', 'Sierra Leone', '🇸🇱'),
  ('SG', 'Singapore', '🇸🇬'),
  ('SX', 'Sint Maarten (Dutch part)', '🇸🇽'),
  ('SK', 'Slovakia', '🇸🇰'),
  ('SI', 'Slovenia', '🇸🇮'),
  ('SB', 'Solomon Islands', '🇸🇧'),
  ('SO', 'Somalia', '🇸🇴'),
  ('ZA', 'South Africa', '🇿🇦'),
  ('GS', 'South Georgia and the South Sandwich Islands', '🇬🇸'),
  ('SS', 'South Sudan', '🇸🇸'),
  ('ES', 'Spain', '🇪🇸'),
  ('LK', 'Sri Lanka', '🇱🇰'),
  ('SD', 'Sudan', '🇸🇩'),
  ('SR', 'Suriname', '🇸🇷'),
  ('SJ', 'Svalbard and Jan Mayen', '🇸🇯'),
  ('SE', 'Sweden', '🇸🇪'),
  ('CH', 'Switzerland', '🇨🇭'),
  ('SY', 'Syrian Arab Republic', '🇸🇾'),
  ('TW', 'Taiwan, Province of China', '🇹🇼'),
  ('TJ', 'Tajikistan', '🇹🇯'),
  ('TZ', 'Tanzania, United Republic of', '🇹🇿'),
  ('TH', 'Thailand', '🇹🇭'),
  ('TL', 'Timor-Leste', '🇹🇱'),
  ('TG', 'Togo', '🇹🇬'),
  ('TK', 'Tokelau', '🇹🇰'),
  ('TO', 'Tonga', '🇹🇴'),
  ('TT', 'Trinidad and Tobago', '🇹🇹'),
  ('TN', 'Tunisia', '🇹🇳'),
  ('TR', 'Turkey', '🇹🇷'),
  ('TM', 'Turkmenistan', '🇹🇲'),
  ('TC', 'Turks and Caicos Islands', '🇹🇨'),
  ('TV', 'Tuvalu', '🇹🇻'),
  ('UG', 'Uganda', '🇺🇬'),
  ('UA', 'Ukraine', '🇺🇦'),
  ('AE', 'United Arab Emirates', '🇦🇪'),
  ('GB', 'United Kingdom of Great Britain and Northern Ireland', '🇬🇧'),
  ('US', 'United States of America', '🇺🇸'),
  ('UM', 'United States Minor Outlying Islands', '🇺🇲'),
  ('UY', 'Uruguay', '🇺🇾'),
  ('UZ', 'Uzbekistan', '🇺🇿'),
  ('VU', 'Vanuatu', '🇻🇺'),
  ('VE', 'Venezuela', '🇻🇪'),
  ('VN', 'Viet Nam', '🇻🇳'),
  ('VG', 'Virgin Islands (British)', '🇻🇬'),
  ('VI', 'Virgin Islands (U.S.)', '🇻🇮'),
  ('WF', 'Wallis and Futuna', '🇼🇫'),
  ('EH', 'Western Sahara', '🇪🇭'),
  ('YE', 'Yemen', '🇾🇪'),
  ('ZM', 'Zambia', '🇿🇲'),
  ('ZW', 'Zimbabwe', '🇿🇼')
on conflict (address_level0_id) do nothing;
insert into public.addresses_level1 (address_level0_id, address_level1_id, address_level1_name) values
  ('CL', 'CL-AI', 'Aysén del General Carlos Ibañez del Campo'),
  ('CL', 'CL-AN', 'Antofagasta'),
  ('CL', 'CL-AP', 'Arica y Parinacota'),
  ('CL', 'CL-AR', 'La Araucanía'),
  ('CL', 'CL-AT', 'Atacama'),
  ('CL', 'CL-BI', 'Biobío'),
  ('CL', 'CL-CO', 'Coquimbo'),
  ('CL', 'CL-LI', 'Libertador General Bernardo O''Higgins'),
  ('CL', 'CL-LL', 'Los Lagos'),
  ('CL', 'CL-LR', 'Los Ríos'),
  ('CL', 'CL-MA', 'Magallanes'),
  ('CL', 'CL-ML', 'Maule'),
  ('CL', 'CL-NB', 'Ñuble'),
  ('CL', 'CL-RM', 'Región Metropolitana de Santiago'),
  ('CL', 'CL-TA', 'Tarapacá'),
  ('CL', 'CL-VS', 'Valparaíso')
on conflict (address_level0_id, address_level1_id) do nothing;
insert into public.addresses_level2 (address_level0_id, address_level1_id, address_level2_id, address_level2_name) values
  ('CL', 'CL-AP', 'arica', 'Arica'),
  ('CL', 'CL-AP', 'parinacota', 'Parinacota'),
  ('CL', 'CL-TA', 'el-tamarugal', 'El Tamarugal'),
  ('CL', 'CL-TA', 'iquique', 'Iquique'),
  ('CL', 'CL-AN', 'tocopilla', 'Tocopilla'),
  ('CL', 'CL-AN', 'el-loa', 'El Loa'),
  ('CL', 'CL-AN', 'antofagasta', 'Antofagasta'),
  ('CL', 'CL-AT', 'chanaral', 'Chañaral'),
  ('CL', 'CL-AT', 'copiapo', 'Copiapó'),
  ('CL', 'CL-AT', 'huasco', 'Huasco'),
  ('CL', 'CL-CO', 'elqui', 'Elqui'),
  ('CL', 'CL-CO', 'limari', 'Limarí'),
  ('CL', 'CL-CO', 'choapa', 'Choapa'),
  ('CL', 'CL-VS', 'petorca', 'Petorca'),
  ('CL', 'CL-VS', 'los-andes', 'Los Andes'),
  ('CL', 'CL-VS', 'san-felipe', 'San Felipe de Aconcagua'),
  ('CL', 'CL-VS', 'quillota', 'Quillota'),
  ('CL', 'CL-VS', 'valparaiso', 'Valparaíso'),
  ('CL', 'CL-VS', 'marga-marga', 'Marga Marga'),
  ('CL', 'CL-VS', 'san-antonio', 'San Antonio'),
  ('CL', 'CL-VS', 'isla-de-pascua', 'Isla de Pascua'),
  ('CL', 'CL-LI', 'cachapoal', 'Cachapoal'),
  ('CL', 'CL-LI', 'colchagua', 'Colchagua'),
  ('CL', 'CL-LI', 'cardenal-caro', 'Cardenal Caro'),
  ('CL', 'CL-ML', 'curico', 'Curicó'),
  ('CL', 'CL-ML', 'talca', 'Talca'),
  ('CL', 'CL-ML', 'linares', 'Linares'),
  ('CL', 'CL-ML', 'cauquenes', 'Cauquenes'),
  ('CL', 'CL-NB', 'itata', 'Itata'),
  ('CL', 'CL-NB', 'diguillin', 'Diguillín'),
  ('CL', 'CL-NB', 'punilla', 'Punilla'),
  ('CL', 'CL-BI', 'biobio', 'Biobío'),
  ('CL', 'CL-BI', 'concepcion', 'Concepción'),
  ('CL', 'CL-BI', 'arauco', 'Arauco'),
  ('CL', 'CL-AR', 'malleco', 'Malleco'),
  ('CL', 'CL-AR', 'cautin', 'Cautín'),
  ('CL', 'CL-LR', 'valdivia', 'Valdivia'),
  ('CL', 'CL-LR', 'ranco', 'Ranco'),
  ('CL', 'CL-LL', 'osorno', 'Osorno'),
  ('CL', 'CL-LL', 'llanquihue', 'Llanquihue'),
  ('CL', 'CL-LL', 'chiloe', 'Chiloé'),
  ('CL', 'CL-LL', 'palena', 'Palena'),
  ('CL', 'CL-AI', 'coihaique', 'Coihaique'),
  ('CL', 'CL-AI', 'aysen', 'Aysén'),
  ('CL', 'CL-AI', 'general-carrera', 'General Carrera'),
  ('CL', 'CL-AI', 'capitan-prat', 'Capitán Prat'),
  ('CL', 'CL-MA', 'ultima-esperanza', 'Última Esperanza'),
  ('CL', 'CL-MA', 'magallanes', 'Magallanes'),
  ('CL', 'CL-MA', 'tierra-del-fuego', 'Tierra del Fuego'),
  ('CL', 'CL-MA', 'antartica-chilena', 'Antártica Chilena'),
  ('CL', 'CL-RM', 'chacabuco', 'Chacabuco'),
  ('CL', 'CL-RM', 'cordillera', 'Cordillera'),
  ('CL', 'CL-RM', 'maipo', 'Maipo'),
  ('CL', 'CL-RM', 'talagante', 'Talagante'),
  ('CL', 'CL-RM', 'melipilla', 'Melipilla'),
  ('CL', 'CL-RM', 'santiago', 'Santiago')
on conflict (address_level0_id, address_level1_id, address_level2_id) do nothing;
insert into public.addresses_level3 (address_level0_id, address_level1_id, address_level2_id, address_level3_id, address_level3_name) values
  ('CL', 'CL-AP', 'arica', 'arica', 'Arica'),
  ('CL', 'CL-AP', 'arica', 'camarones', 'Camarones'),
  ('CL', 'CL-AP', 'parinacota', 'general-lagos', 'General Lagos'),
  ('CL', 'CL-AP', 'parinacota', 'putre', 'Putre'),
  ('CL', 'CL-TA', 'el-tamarugal', 'camina', 'Camiña'),
  ('CL', 'CL-TA', 'el-tamarugal', 'colchane', 'Colchane'),
  ('CL', 'CL-TA', 'el-tamarugal', 'huara', 'Huara'),
  ('CL', 'CL-TA', 'el-tamarugal', 'pica', 'Pica'),
  ('CL', 'CL-TA', 'el-tamarugal', 'pozo-almonte', 'Pozo Almonte'),
  ('CL', 'CL-TA', 'iquique', 'iquique', 'Iquique'),
  ('CL', 'CL-TA', 'iquique', 'alto-hospicio', 'Alto Hospicio'),
  ('CL', 'CL-AN', 'tocopilla', 'maria-elena', 'María Elena'),
  ('CL', 'CL-AN', 'tocopilla', 'tocopilla', 'Tocopilla'),
  ('CL', 'CL-AN', 'el-loa', 'calama', 'Calama'),
  ('CL', 'CL-AN', 'el-loa', 'ollague', 'Ollagüe'),
  ('CL', 'CL-AN', 'el-loa', 'san-pedro-de-atacama', 'San Pedro de Atacama'),
  ('CL', 'CL-AN', 'antofagasta', 'antofagasta', 'Antofagasta'),
  ('CL', 'CL-AN', 'antofagasta', 'mejillones', 'Mejillones'),
  ('CL', 'CL-AN', 'antofagasta', 'sierra-gorda', 'Sierra Gorda'),
  ('CL', 'CL-AN', 'antofagasta', 'taltal', 'Taltal'),
  ('CL', 'CL-AT', 'chanaral', 'chanaral', 'Chañaral'),
  ('CL', 'CL-AT', 'chanaral', 'diego-de-almagro', 'Diego de Almagro'),
  ('CL', 'CL-AT', 'copiapo', 'copiapo', 'Copiapó'),
  ('CL', 'CL-AT', 'copiapo', 'caldera', 'Caldera'),
  ('CL', 'CL-AT', 'copiapo', 'tierra-amarilla', 'Tierra Amarilla'),
  ('CL', 'CL-AT', 'huasco', 'vallenar', 'Vallenar'),
  ('CL', 'CL-AT', 'huasco', 'freirina', 'Freirina'),
  ('CL', 'CL-AT', 'huasco', 'huasco', 'Huasco'),
  ('CL', 'CL-AT', 'huasco', 'alto-del-carmen', 'Alto del Carmen'),
  ('CL', 'CL-CO', 'elqui', 'andacollo', 'Andacollo'),
  ('CL', 'CL-CO', 'elqui', 'coquimbo', 'Coquimbo'),
  ('CL', 'CL-CO', 'elqui', 'la-higuera', 'La Higuera'),
  ('CL', 'CL-CO', 'elqui', 'la-serena', 'La Serena'),
  ('CL', 'CL-CO', 'elqui', 'paiguano', 'Paiguano'),
  ('CL', 'CL-CO', 'elqui', 'vicuna', 'Vicuña'),
  ('CL', 'CL-CO', 'limari', 'ovalle', 'Ovalle'),
  ('CL', 'CL-CO', 'limari', 'rio-hurtado', 'Río Hurtado'),
  ('CL', 'CL-CO', 'limari', 'monte-patria', 'Monte Patria'),
  ('CL', 'CL-CO', 'limari', 'combarbala', 'Combarbalá'),
  ('CL', 'CL-CO', 'limari', 'punitaqui', 'Punitaqui'),
  ('CL', 'CL-CO', 'choapa', 'illapel', 'Illapel'),
  ('CL', 'CL-CO', 'choapa', 'salamanca', 'Salamanca'),
  ('CL', 'CL-CO', 'choapa', 'los-vilos', 'Los Vilos'),
  ('CL', 'CL-CO', 'choapa', 'canela', 'Canela'),
  ('CL', 'CL-VS', 'petorca', 'la-ligua', 'La Ligua'),
  ('CL', 'CL-VS', 'petorca', 'cabildo', 'Cabildo'),
  ('CL', 'CL-VS', 'petorca', 'zapallar', 'Zapallar'),
  ('CL', 'CL-VS', 'petorca', 'papudo', 'Papudo'),
  ('CL', 'CL-VS', 'petorca', 'petorca', 'Petorca'),
  ('CL', 'CL-VS', 'los-andes', 'los-andes', 'Los Andes'),
  ('CL', 'CL-VS', 'los-andes', 'san-esteban', 'San Esteban'),
  ('CL', 'CL-VS', 'los-andes', 'calle-larga', 'Calle Larga'),
  ('CL', 'CL-VS', 'los-andes', 'rinconada', 'Rinconada'),
  ('CL', 'CL-VS', 'san-felipe', 'san-felipe', 'San Felipe'),
  ('CL', 'CL-VS', 'san-felipe', 'llaillay', 'Llaillay'),
  ('CL', 'CL-VS', 'san-felipe', 'putaendo', 'Putaendo'),
  ('CL', 'CL-VS', 'san-felipe', 'santa-maria', 'Santa María'),
  ('CL', 'CL-VS', 'san-felipe', 'catemu', 'Catemu'),
  ('CL', 'CL-VS', 'san-felipe', 'panquehue', 'Panquehue'),
  ('CL', 'CL-VS', 'quillota', 'quillota', 'Quillota'),
  ('CL', 'CL-VS', 'quillota', 'la-calera', 'La Calera'),
  ('CL', 'CL-VS', 'quillota', 'nogales', 'Nogales'),
  ('CL', 'CL-VS', 'quillota', 'hijuelas', 'Hijuelas'),
  ('CL', 'CL-VS', 'quillota', 'la-cruz', 'La Cruz'),
  ('CL', 'CL-VS', 'valparaiso', 'valparaiso', 'Valparaíso'),
  ('CL', 'CL-VS', 'valparaiso', 'vina-del-mar', 'Viña del Mar'),
  ('CL', 'CL-VS', 'valparaiso', 'concon', 'Concón'),
  ('CL', 'CL-VS', 'valparaiso', 'quintero', 'Quintero'),
  ('CL', 'CL-VS', 'valparaiso', 'puchuncavi', 'Puchuncaví'),
  ('CL', 'CL-VS', 'valparaiso', 'casablanca', 'Casablanca'),
  ('CL', 'CL-VS', 'valparaiso', 'juan-fernandez', 'Juan Fernández'),
  ('CL', 'CL-VS', 'marga-marga', 'quilpue', 'Quilpué'),
  ('CL', 'CL-VS', 'marga-marga', 'limache', 'Limache'),
  ('CL', 'CL-VS', 'marga-marga', 'olmue', 'Olmué'),
  ('CL', 'CL-VS', 'marga-marga', 'villa-alemana', 'Villa Alemana'),
  ('CL', 'CL-VS', 'san-antonio', 'algarrobo', 'Algarrobo'),
  ('CL', 'CL-VS', 'san-antonio', 'el-quisco', 'El Quisco'),
  ('CL', 'CL-VS', 'san-antonio', 'el-tabo', 'El Tabo'),
  ('CL', 'CL-VS', 'san-antonio', 'cartagena', 'Cartagena'),
  ('CL', 'CL-VS', 'san-antonio', 'san-antonio', 'San Antonio'),
  ('CL', 'CL-VS', 'san-antonio', 'santo-domingo', 'Santo Domingo'),
  ('CL', 'CL-VS', 'isla-de-pascua', 'isla-de-pascua', 'Isla de Pascua'),
  ('CL', 'CL-LI', 'cachapoal', 'codegua', 'Codegua'),
  ('CL', 'CL-LI', 'cachapoal', 'coinco', 'Coínco'),
  ('CL', 'CL-LI', 'cachapoal', 'coltauco', 'Coltauco'),
  ('CL', 'CL-LI', 'cachapoal', 'donihue', 'Doñihue'),
  ('CL', 'CL-LI', 'cachapoal', 'graneros', 'Graneros'),
  ('CL', 'CL-LI', 'cachapoal', 'las-cabras', 'Las Cabras'),
  ('CL', 'CL-LI', 'cachapoal', 'machali', 'Machalí'),
  ('CL', 'CL-LI', 'cachapoal', 'malloa', 'Malloa'),
  ('CL', 'CL-LI', 'cachapoal', 'olivar', 'Olivar'),
  ('CL', 'CL-LI', 'cachapoal', 'peumo', 'Peumo'),
  ('CL', 'CL-LI', 'cachapoal', 'pichidegua', 'Pichidegua'),
  ('CL', 'CL-LI', 'cachapoal', 'quinta-de-tilcoco', 'Quinta de Tilcoco'),
  ('CL', 'CL-LI', 'cachapoal', 'rancagua', 'Rancagua'),
  ('CL', 'CL-LI', 'cachapoal', 'requinoa', 'Requínoa'),
  ('CL', 'CL-LI', 'cachapoal', 'rengo', 'Rengo'),
  ('CL', 'CL-LI', 'cachapoal', 'mostazal', 'Mostazal'),
  ('CL', 'CL-LI', 'cachapoal', 'san-vicente', 'San Vicente de Tagua Tagua'),
  ('CL', 'CL-LI', 'colchagua', 'chepica', 'Chépica'),
  ('CL', 'CL-LI', 'colchagua', 'chimbarongo', 'Chimbarongo'),
  ('CL', 'CL-LI', 'colchagua', 'lolol', 'Lolol'),
  ('CL', 'CL-LI', 'colchagua', 'nancagua', 'Nancagua'),
  ('CL', 'CL-LI', 'colchagua', 'palmilla', 'Palmilla'),
  ('CL', 'CL-LI', 'colchagua', 'peralillo', 'Peralillo'),
  ('CL', 'CL-LI', 'colchagua', 'placilla', 'Placilla'),
  ('CL', 'CL-LI', 'colchagua', 'pumanque', 'Pumanque'),
  ('CL', 'CL-LI', 'colchagua', 'san-fernando', 'San Fernando'),
  ('CL', 'CL-LI', 'colchagua', 'santa-cruz', 'Santa Cruz'),
  ('CL', 'CL-LI', 'cardenal-caro', 'la-estrella', 'La Estrella'),
  ('CL', 'CL-LI', 'cardenal-caro', 'litueche', 'Litueche'),
  ('CL', 'CL-LI', 'cardenal-caro', 'marchigue', 'Marchigüe'),
  ('CL', 'CL-LI', 'cardenal-caro', 'navidad', 'Navidad'),
  ('CL', 'CL-LI', 'cardenal-caro', 'paredones', 'Paredones'),
  ('CL', 'CL-LI', 'cardenal-caro', 'pichilemu', 'Pichilemu'),
  ('CL', 'CL-ML', 'curico', 'curico', 'Curicó'),
  ('CL', 'CL-ML', 'curico', 'hualane', 'Hualañé'),
  ('CL', 'CL-ML', 'curico', 'licanten', 'Licantén'),
  ('CL', 'CL-ML', 'curico', 'molina', 'Molina'),
  ('CL', 'CL-ML', 'curico', 'rauco', 'Rauco'),
  ('CL', 'CL-ML', 'curico', 'romeral', 'Romeral'),
  ('CL', 'CL-ML', 'curico', 'sagrada-familia', 'Sagrada Familia'),
  ('CL', 'CL-ML', 'curico', 'teno', 'Teno'),
  ('CL', 'CL-ML', 'curico', 'vichuquen', 'Vichuquén'),
  ('CL', 'CL-ML', 'talca', 'talca', 'Talca'),
  ('CL', 'CL-ML', 'talca', 'san-clemente', 'San Clemente'),
  ('CL', 'CL-ML', 'talca', 'pelarco', 'Pelarco'),
  ('CL', 'CL-ML', 'talca', 'pencahue', 'Pencahue'),
  ('CL', 'CL-ML', 'talca', 'maule', 'Maule'),
  ('CL', 'CL-ML', 'talca', 'san-rafael', 'San Rafael'),
  ('CL', 'CL-ML', 'talca', 'curepto', 'Curepto'),
  ('CL', 'CL-ML', 'talca', 'constitucion', 'Constitución'),
  ('CL', 'CL-ML', 'talca', 'empedrado', 'Empedrado'),
  ('CL', 'CL-ML', 'talca', 'rio-claro', 'Río Claro'),
  ('CL', 'CL-ML', 'linares', 'linares', 'Linares'),
  ('CL', 'CL-ML', 'linares', 'san-javier-de-loncomilla', 'San Javier de Loncomilla'),
  ('CL', 'CL-ML', 'linares', 'parral', 'Parral'),
  ('CL', 'CL-ML', 'linares', 'villa-alegre', 'Villa Alegre'),
  ('CL', 'CL-ML', 'linares', 'longavi', 'Longaví'),
  ('CL', 'CL-ML', 'linares', 'colbun', 'Colbún'),
  ('CL', 'CL-ML', 'linares', 'retiro', 'Retiro'),
  ('CL', 'CL-ML', 'linares', 'yerbas-buenas', 'Yerbas Buenas'),
  ('CL', 'CL-ML', 'cauquenes', 'cauquenes', 'Cauquenes'),
  ('CL', 'CL-ML', 'cauquenes', 'chanco', 'Chanco'),
  ('CL', 'CL-ML', 'cauquenes', 'pelluhue', 'Pelluhue'),
  ('CL', 'CL-NB', 'itata', 'cobquecura', 'Cobquecura'),
  ('CL', 'CL-NB', 'itata', 'coelemu', 'Coelemu'),
  ('CL', 'CL-NB', 'itata', 'ninhue', 'Ninhue'),
  ('CL', 'CL-NB', 'itata', 'portezuelo', 'Portezuelo'),
  ('CL', 'CL-NB', 'itata', 'quirihue', 'Quirihue'),
  ('CL', 'CL-NB', 'itata', 'ranquil', 'Ránquil'),
  ('CL', 'CL-NB', 'itata', 'treguaco', 'Treguaco'),
  ('CL', 'CL-NB', 'diguillin', 'bulnes', 'Bulnes'),
  ('CL', 'CL-NB', 'diguillin', 'chillan', 'Chillán'),
  ('CL', 'CL-NB', 'diguillin', 'chillan-viejo', 'Chillán Viejo'),
  ('CL', 'CL-NB', 'diguillin', 'el-carmen', 'El Carmen'),
  ('CL', 'CL-NB', 'diguillin', 'pemuco', 'Pemuco'),
  ('CL', 'CL-NB', 'diguillin', 'pinto', 'Pinto'),
  ('CL', 'CL-NB', 'diguillin', 'quillon', 'Quillón'),
  ('CL', 'CL-NB', 'diguillin', 'san-ignacio', 'San Ignacio'),
  ('CL', 'CL-NB', 'diguillin', 'yungay', 'Yungay'),
  ('CL', 'CL-NB', 'punilla', 'coihueco', 'Coihueco'),
  ('CL', 'CL-NB', 'punilla', 'niquen', 'Ñiquén'),
  ('CL', 'CL-NB', 'punilla', 'san-carlos', 'San Carlos'),
  ('CL', 'CL-NB', 'punilla', 'san-fabian', 'San Fabián'),
  ('CL', 'CL-NB', 'punilla', 'san-nicolas', 'San Nicolás'),
  ('CL', 'CL-BI', 'biobio', 'alto-biobio', 'Alto Biobío'),
  ('CL', 'CL-BI', 'biobio', 'antuco', 'Antuco'),
  ('CL', 'CL-BI', 'biobio', 'cabrero', 'Cabrero'),
  ('CL', 'CL-BI', 'biobio', 'laja', 'Laja'),
  ('CL', 'CL-BI', 'biobio', 'los-angeles', 'Los Ángeles'),
  ('CL', 'CL-BI', 'biobio', 'mulchen', 'Mulchén'),
  ('CL', 'CL-BI', 'biobio', 'nacimiento', 'Nacimiento'),
  ('CL', 'CL-BI', 'biobio', 'negrete', 'Negrete'),
  ('CL', 'CL-BI', 'biobio', 'quilaco', 'Quilaco'),
  ('CL', 'CL-BI', 'biobio', 'quilleco', 'Quilleco'),
  ('CL', 'CL-BI', 'biobio', 'san-rosendo', 'San Rosendo'),
  ('CL', 'CL-BI', 'biobio', 'santa-barbara', 'Santa Bárbara'),
  ('CL', 'CL-BI', 'biobio', 'tucapel', 'Tucapel'),
  ('CL', 'CL-BI', 'biobio', 'yumbel', 'Yumbel'),
  ('CL', 'CL-BI', 'concepcion', 'concepcion', 'Concepción'),
  ('CL', 'CL-BI', 'concepcion', 'coronel', 'Coronel'),
  ('CL', 'CL-BI', 'concepcion', 'chiguayante', 'Chiguayante'),
  ('CL', 'CL-BI', 'concepcion', 'florida', 'Florida'),
  ('CL', 'CL-BI', 'concepcion', 'hualpen', 'Hualpén'),
  ('CL', 'CL-BI', 'concepcion', 'hualqui', 'Hualqui'),
  ('CL', 'CL-BI', 'concepcion', 'lota', 'Lota'),
  ('CL', 'CL-BI', 'concepcion', 'penco', 'Penco'),
  ('CL', 'CL-BI', 'concepcion', 'san-pedro-de-la-paz', 'San Pedro de la Paz'),
  ('CL', 'CL-BI', 'concepcion', 'santa-juana', 'Santa Juana'),
  ('CL', 'CL-BI', 'concepcion', 'talcahuano', 'Talcahuano'),
  ('CL', 'CL-BI', 'concepcion', 'tome', 'Tomé'),
  ('CL', 'CL-BI', 'arauco', 'arauco', 'Arauco'),
  ('CL', 'CL-BI', 'arauco', 'canete', 'Cañete'),
  ('CL', 'CL-BI', 'arauco', 'contulmo', 'Contulmo'),
  ('CL', 'CL-BI', 'arauco', 'curanilahue', 'Curanilahue'),
  ('CL', 'CL-BI', 'arauco', 'lebu', 'Lebu'),
  ('CL', 'CL-BI', 'arauco', 'los-alamos', 'Los Álamos'),
  ('CL', 'CL-BI', 'arauco', 'tirua', 'Tirúa'),
  ('CL', 'CL-AR', 'malleco', 'angol', 'Angol'),
  ('CL', 'CL-AR', 'malleco', 'collipulli', 'Collipulli'),
  ('CL', 'CL-AR', 'malleco', 'curacautin', 'Curacautín'),
  ('CL', 'CL-AR', 'malleco', 'ercilla', 'Ercilla'),
  ('CL', 'CL-AR', 'malleco', 'lonquimay', 'Lonquimay'),
  ('CL', 'CL-AR', 'malleco', 'los-sauces', 'Los Sauces'),
  ('CL', 'CL-AR', 'malleco', 'lumaco', 'Lumaco'),
  ('CL', 'CL-AR', 'malleco', 'puren', 'Purén'),
  ('CL', 'CL-AR', 'malleco', 'renaico', 'Renaico'),
  ('CL', 'CL-AR', 'malleco', 'traiguen', 'Traiguén'),
  ('CL', 'CL-AR', 'malleco', 'victoria', 'Victoria'),
  ('CL', 'CL-AR', 'cautin', 'temuco', 'Temuco'),
  ('CL', 'CL-AR', 'cautin', 'carahue', 'Carahue'),
  ('CL', 'CL-AR', 'cautin', 'cholchol', 'Cholchol'),
  ('CL', 'CL-AR', 'cautin', 'cunco', 'Cunco'),
  ('CL', 'CL-AR', 'cautin', 'curarrehue', 'Curarrehue'),
  ('CL', 'CL-AR', 'cautin', 'freire', 'Freire'),
  ('CL', 'CL-AR', 'cautin', 'galvarino', 'Galvarino'),
  ('CL', 'CL-AR', 'cautin', 'gorbea', 'Gorbea'),
  ('CL', 'CL-AR', 'cautin', 'lautaro', 'Lautaro'),
  ('CL', 'CL-AR', 'cautin', 'loncoche', 'Loncoche'),
  ('CL', 'CL-AR', 'cautin', 'melipeuco', 'Melipeuco'),
  ('CL', 'CL-AR', 'cautin', 'nueva-imperial', 'Nueva Imperial'),
  ('CL', 'CL-AR', 'cautin', 'padre-las-casas', 'Padre Las Casas'),
  ('CL', 'CL-AR', 'cautin', 'perquenco', 'Perquenco'),
  ('CL', 'CL-AR', 'cautin', 'pitrufquen', 'Pitrufquén'),
  ('CL', 'CL-AR', 'cautin', 'pucon', 'Pucón'),
  ('CL', 'CL-AR', 'cautin', 'saavedra', 'Saavedra'),
  ('CL', 'CL-AR', 'cautin', 'teodoro-schmidt', 'Teodoro Schmidt'),
  ('CL', 'CL-AR', 'cautin', 'tolten', 'Toltén'),
  ('CL', 'CL-AR', 'cautin', 'vilcun', 'Vilcún'),
  ('CL', 'CL-AR', 'cautin', 'villarrica', 'Villarrica'),
  ('CL', 'CL-LR', 'valdivia', 'valdivia', 'Valdivia'),
  ('CL', 'CL-LR', 'valdivia', 'corral', 'Corral'),
  ('CL', 'CL-LR', 'valdivia', 'lanco', 'Lanco'),
  ('CL', 'CL-LR', 'valdivia', 'los-lagos', 'Los Lagos'),
  ('CL', 'CL-LR', 'valdivia', 'mariquina', 'Mariquina'),
  ('CL', 'CL-LR', 'valdivia', 'mafil', 'Máfil'),
  ('CL', 'CL-LR', 'valdivia', 'paillaco', 'Paillaco'),
  ('CL', 'CL-LR', 'valdivia', 'panguipulli', 'Panguipulli'),
  ('CL', 'CL-LR', 'ranco', 'la-union', 'La Unión'),
  ('CL', 'CL-LR', 'ranco', 'futrono', 'Futrono'),
  ('CL', 'CL-LR', 'ranco', 'lago-ranco', 'Lago Ranco'),
  ('CL', 'CL-LR', 'ranco', 'rio-bueno', 'Río Bueno'),
  ('CL', 'CL-LL', 'osorno', 'osorno', 'Osorno'),
  ('CL', 'CL-LL', 'osorno', 'puerto-octay', 'Puerto Octay'),
  ('CL', 'CL-LL', 'osorno', 'purranque', 'Purranque'),
  ('CL', 'CL-LL', 'osorno', 'puyehue', 'Puyehue'),
  ('CL', 'CL-LL', 'osorno', 'rio-negro', 'Río Negro'),
  ('CL', 'CL-LL', 'osorno', 'san-pablo', 'San Pablo'),
  ('CL', 'CL-LL', 'osorno', 'san-juan-de-la-costa', 'San Juan de la Costa'),
  ('CL', 'CL-LL', 'llanquihue', 'calbuco', 'Calbuco'),
  ('CL', 'CL-LL', 'llanquihue', 'cochamo', 'Cochamó'),
  ('CL', 'CL-LL', 'llanquihue', 'fresia', 'Fresia'),
  ('CL', 'CL-LL', 'llanquihue', 'frutillar', 'Frutillar'),
  ('CL', 'CL-LL', 'llanquihue', 'llanquihue', 'Llanquihue'),
  ('CL', 'CL-LL', 'llanquihue', 'los-muermos', 'Los Muermos'),
  ('CL', 'CL-LL', 'llanquihue', 'maullin', 'Maullín'),
  ('CL', 'CL-LL', 'llanquihue', 'puerto-montt', 'Puerto Montt'),
  ('CL', 'CL-LL', 'llanquihue', 'puerto-varas', 'Puerto Varas'),
  ('CL', 'CL-LL', 'chiloe', 'ancud', 'Ancud'),
  ('CL', 'CL-LL', 'chiloe', 'castro', 'Castro'),
  ('CL', 'CL-LL', 'chiloe', 'chonchi', 'Chonchi'),
  ('CL', 'CL-LL', 'chiloe', 'curaco-de-velez', 'Curaco de Vélez'),
  ('CL', 'CL-LL', 'chiloe', 'dalcahue', 'Dalcahue'),
  ('CL', 'CL-LL', 'chiloe', 'puqueldon', 'Puqueldón'),
  ('CL', 'CL-LL', 'chiloe', 'queilen', 'Queilén'),
  ('CL', 'CL-LL', 'chiloe', 'quellon', 'Quellón'),
  ('CL', 'CL-LL', 'chiloe', 'quemchi', 'Quemchi'),
  ('CL', 'CL-LL', 'chiloe', 'quinchao', 'Quinchao'),
  ('CL', 'CL-LL', 'palena', 'futaleufu', 'Futaleufú'),
  ('CL', 'CL-LL', 'palena', 'hualaihue', 'Hualaihué'),
  ('CL', 'CL-LL', 'palena', 'palena', 'Palena'),
  ('CL', 'CL-LL', 'palena', 'chaiten', 'Chaitén'),
  ('CL', 'CL-AI', 'coihaique', 'coihaique', 'Coihaique'),
  ('CL', 'CL-AI', 'coihaique', 'lago-verde', 'Lago Verde'),
  ('CL', 'CL-AI', 'aysen', 'aysen', 'Aysén'),
  ('CL', 'CL-AI', 'aysen', 'cisnes', 'Cisnes'),
  ('CL', 'CL-AI', 'aysen', 'guaitecas', 'Guaitecas'),
  ('CL', 'CL-AI', 'general-carrera', 'chile-chico', 'Chile Chico'),
  ('CL', 'CL-AI', 'general-carrera', 'rio-ibanez', 'Río Ibáñez'),
  ('CL', 'CL-AI', 'capitan-prat', 'cochrane', 'Cochrane'),
  ('CL', 'CL-AI', 'capitan-prat', 'o-higgins', 'O''Higgins'),
  ('CL', 'CL-AI', 'capitan-prat', 'tortel', 'Tortel'),
  ('CL', 'CL-MA', 'ultima-esperanza', 'puerto-natales', 'Puerto Natales'),
  ('CL', 'CL-MA', 'ultima-esperanza', 'torres-del-paine', 'Torres del Paine'),
  ('CL', 'CL-MA', 'magallanes', 'laguna-blanca', 'Laguna Blanca'),
  ('CL', 'CL-MA', 'magallanes', 'punta-arenas', 'Punta Arenas'),
  ('CL', 'CL-MA', 'magallanes', 'rio-verde', 'Río Verde'),
  ('CL', 'CL-MA', 'magallanes', 'san-gregorio', 'San Gregorio'),
  ('CL', 'CL-MA', 'tierra-del-fuego', 'porvenir', 'Porvenir'),
  ('CL', 'CL-MA', 'tierra-del-fuego', 'primavera', 'Primavera'),
  ('CL', 'CL-MA', 'tierra-del-fuego', 'timaukel', 'Timaukel'),
  ('CL', 'CL-MA', 'antartica-chilena', 'cabo-de-hornos', 'Cabo de Hornos'),
  ('CL', 'CL-MA', 'antartica-chilena', 'antartica', 'Antártica'),
  ('CL', 'CL-RM', 'chacabuco', 'colina', 'Colina'),
  ('CL', 'CL-RM', 'chacabuco', 'lampa', 'Lampa'),
  ('CL', 'CL-RM', 'chacabuco', 'tiltil', 'Tiltil'),
  ('CL', 'CL-RM', 'cordillera', 'puente-alto', 'Puente Alto'),
  ('CL', 'CL-RM', 'cordillera', 'san-jose-de-maipo', 'San José de Maipo'),
  ('CL', 'CL-RM', 'cordillera', 'pirque', 'Pirque'),
  ('CL', 'CL-RM', 'maipo', 'san-bernardo', 'San Bernardo'),
  ('CL', 'CL-RM', 'maipo', 'buin', 'Buin'),
  ('CL', 'CL-RM', 'maipo', 'paine', 'Paine'),
  ('CL', 'CL-RM', 'maipo', 'calera-de-tango', 'Calera de Tango'),
  ('CL', 'CL-RM', 'talagante', 'isla-de-maipo', 'Isla de Maipo'),
  ('CL', 'CL-RM', 'talagante', 'el-monte', 'El Monte'),
  ('CL', 'CL-RM', 'talagante', 'padre-hurtado', 'Padre Hurtado'),
  ('CL', 'CL-RM', 'talagante', 'penaflor', 'Peñaflor'),
  ('CL', 'CL-RM', 'talagante', 'talagante', 'Talagante'),
  ('CL', 'CL-RM', 'melipilla', 'curacavi', 'Curacaví'),
  ('CL', 'CL-RM', 'melipilla', 'maria-pinto', 'María Pinto'),
  ('CL', 'CL-RM', 'melipilla', 'melipilla', 'Melipilla'),
  ('CL', 'CL-RM', 'melipilla', 'san-pedro', 'San Pedro'),
  ('CL', 'CL-RM', 'melipilla', 'alhue', 'Alhué'),
  ('CL', 'CL-RM', 'santiago', 'cerrillos', 'Cerrillos'),
  ('CL', 'CL-RM', 'santiago', 'cerro-navia', 'Cerro Navia'),
  ('CL', 'CL-RM', 'santiago', 'conchali', 'Conchalí'),
  ('CL', 'CL-RM', 'santiago', 'el-bosque', 'El Bosque'),
  ('CL', 'CL-RM', 'santiago', 'estacion-central', 'Estación Central'),
  ('CL', 'CL-RM', 'santiago', 'huechuraba', 'Huechuraba'),
  ('CL', 'CL-RM', 'santiago', 'independencia', 'Independencia'),
  ('CL', 'CL-RM', 'santiago', 'la-cisterna', 'La Cisterna'),
  ('CL', 'CL-RM', 'santiago', 'la-granja', 'La Granja'),
  ('CL', 'CL-RM', 'santiago', 'la-florida', 'La Florida'),
  ('CL', 'CL-RM', 'santiago', 'la-pintana', 'La Pintana'),
  ('CL', 'CL-RM', 'santiago', 'la-reina', 'La Reina'),
  ('CL', 'CL-RM', 'santiago', 'las-condes', 'Las Condes'),
  ('CL', 'CL-RM', 'santiago', 'lo-barnechea', 'Lo Barnechea'),
  ('CL', 'CL-RM', 'santiago', 'lo-espejo', 'Lo Espejo'),
  ('CL', 'CL-RM', 'santiago', 'lo-prado', 'Lo Prado'),
  ('CL', 'CL-RM', 'santiago', 'macul', 'Macul'),
  ('CL', 'CL-RM', 'santiago', 'maipu', 'Maipú'),
  ('CL', 'CL-RM', 'santiago', 'nunoa', 'Ñuñoa'),
  ('CL', 'CL-RM', 'santiago', 'pedro-aguirre-cerda', 'Pedro Aguirre Cerda'),
  ('CL', 'CL-RM', 'santiago', 'penalolen', 'Peñalolén'),
  ('CL', 'CL-RM', 'santiago', 'providencia', 'Providencia'),
  ('CL', 'CL-RM', 'santiago', 'pudahuel', 'Pudahuel'),
  ('CL', 'CL-RM', 'santiago', 'quilicura', 'Quilicura'),
  ('CL', 'CL-RM', 'santiago', 'quinta-normal', 'Quinta Normal'),
  ('CL', 'CL-RM', 'santiago', 'recoleta', 'Recoleta'),
  ('CL', 'CL-RM', 'santiago', 'renca', 'Renca'),
  ('CL', 'CL-RM', 'santiago', 'san-miguel', 'San Miguel'),
  ('CL', 'CL-RM', 'santiago', 'san-joaquin', 'San Joaquín'),
  ('CL', 'CL-RM', 'santiago', 'san-ramon', 'San Ramón'),
  ('CL', 'CL-RM', 'santiago', 'santiago', 'Santiago'),
  ('CL', 'CL-RM', 'santiago', 'vitacura', 'Vitacura')
on conflict (address_level0_id, address_level1_id, address_level2_id, address_level3_id) do nothing;
````

## File: scripts/development/env-setup.ts
````typescript
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dedent } from "ts-dedent";
⋮----
// When running on an exe.dev VM, browser-facing URLs must use the VM's public host
// `<vm>.exe.xyz` (TLS terminated by exe.dev's proxy, ports forwarded in 3000-9999) instead
// of `127.0.0.1`/lvh.me. Set by exe-dev-setup.sh. Server-only URLs (DATABASE_URL) stay local
// because the app runs ON the VM. See scripts/development/exe-dev-setup.sh.
⋮----
function PUBLIC_URL(localUrl: string): string
⋮----
// Mirror into apps/platform so graphql-codegen (via @next/env loadEnvConfig) picks up dynamic ports.
// apps/platform/.env.local has default fallback values; this .env.development.local overrides them.
````

## File: skills/my-graphql/SKILL.md
````markdown
---
name: my-graphql
description: Repository-specific pg_graphql operation patterns, naming, colocation, generated document use, and Supabase GraphQL limitations. Use when writing or changing GraphQL queries, mutations, fragments, or SQL exposed through pg_graphql.
---

# GraphQL Operations

Endpoint: Supabase `pg_graphql` at `/graphql/v1`. Generated `gql`:

```ts
import { gql } from "~/generated/graphql";
```

Codegen workflow belongs to `my-graphql-codegen`. Runtime belongs to `my-graphy`.

## Schema-level configuration

The schema comment in `packages/supabase/supabase/migrations/00000000000000_schema.sql`:

```sql
comment on schema public is e'@graphql({"inflect_names": true, "max_rows": 250})';
```

**`inflect_names: true`** — pg_graphql converts all SQL identifiers to GraphQL conventions:

| SQL | GraphQL |
|---|---|
| `organization_name` (field) | `organizationName` |
| `organizations` (table → type) | `Organizations` |
| `viewer_organizations` (function) | `viewerOrganizations` |
| `organizationsFilter` (arg type) | `OrganizationsFilter` |
| `organizationsOrderBy!` (arg type) | `OrganizationsOrderBy!` |
| `insertIntoorganizationsCollection` | `insertIntoOrganizationsCollection` |

**FK relationship naming**: singular FK (one-to-one) becomes singular field; plural (one-to-many) becomes plural. Example: `organizations → tenants` is a singular FK, so it becomes `tenant` (singular), not `tenants`. Always verify FK cardinality when adding relationship fields.

**`max_rows: 250`** — schema-wide connection page cap. Per-table override is not yet supported (needs pg_graphql ≥ 1.5.12; Supabase local bundles 1.5.11). Do not add per-table `max_rows` comments yet.

## totalCount and aggregate

All 26 public tables have `totalCount` and `aggregate` enabled:

```sql
comment on table public.organizations is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
```

When adding a new table, always add this comment. In GraphQL:

```graphql
query {
  viewerOrganizations {
    totalCount
    aggregate {
      count
    }
    edges { node { organizationId organizationName } }
  }
}
```

## Colocation

Page-only operation stays in page:

```ts
const HomePickerPageQuery = gql(`
  query HomePickerPageQuery {
    viewerOrganizations(
      filter: { organizationDisabledAt: { is: NULL } }
      orderBy: [{ organizationName: AscNullsLast }]
    ) {
      edges {
        node {
          organizationId
          organizationName
          tenant { tenantSlug tenantName }
        }
      }
    }
  }
`);
```

Reusable server query lives in `hooks/get-*.ts`; reusable client query in `hooks/use-*.ts`.
Do not create generic query barrels.

### One gql per file — colocate, don't stack shared hooks

**Default: each page/route writes its OWN single `gql` query in its own file.** Duplicating a
near-identical query in another file is fine and expected — colocation beats DRY here. A shared
`get-viewer-*` / `use-viewer-*` hook is justified ONLY when a page needs *just that one resource*
on its own. The moment a page loads several resources, do NOT chain multiple hooks (that's N
sequential round-trips) — write ONE colocated query that pulls everything in a single call.
`get-viewer-*` / `use-viewer-*` files carry this exact ⚠️ banner at the top — copy it verbatim into
any new such file (canonical example `apps/platform/hooks/use-viewer-profile.ts`):

```ts
// ⚠️ Shared viewer hook — use ONLY when component needs just this one resource alone.
// Many resources? Do NOT stack get-viewer-*/use-viewer-* hooks (= N round-trips).
// Write ONE colocated gql in that file, spread fragments, single call.
```

Pass-through TS wrappers around a single query are the same anti-pattern as pass-through Server
Actions: don't add a `getX` helper that only forwards to `graphy.query`. The one legit in-file
helper is a `cache()`d fetch shared by `generateMetadata` + the page render — that dedupes the
double-call into one round-trip per request.

### Fragment lives on the component that renders the data

When a (often client) component renders a record, export a fragment from THAT component file and
have each page spread it into its own colocated query. The component derives its prop type from
the fragment — no shared "view model" type, no `dict`/`t`-style prop threading.

```tsx
// components/inbox/conversation-thread.tsx  ("use client")
export const ConversationThreadFragment = /*#__PURE__*/ gql(`
  fragment ConversationThreadFragment on Conversations {
    conversationId conversationStatus
    messages: conversationMessagesCollection(first: 250, orderBy: [{ messageCreatedAt: AscNullsLast }]) {
      edges { node { conversationMessageId messageBody messageCreatedAt } }
    }
  }
`);
export type ConversationThreadFragmentType = ResultOf<typeof ConversationThreadFragment>;
export function ConversationThread({ conversation }: { conversation: ConversationThreadFragmentType }) { … }

// app/(app)/home/inbox/[conversation_id]/page.tsx — its OWN query, spreads the fragment
const HomeInboxConversationPageQuery = gql(`
  query HomeInboxConversationPageQuery($conversationId: UUID!) {
    conversation: viewerConversationById(conversationId: $conversationId) { ...ConversationThreadFragment }
  }
`);
```

`fragmentMasking: false` (see `graphql.config.ts`) → spread fields appear directly on the parent;
`ResultOf<typeof Fragment>` is the unmasked shape. A page need not `import` the fragment const for
the spread to resolve — codegen registers every `gql()` fragment globally and inlines it. UUID
columns map to the `string` scalar, so a `uuid` param is `$x: UUID!` in the doc, `string` in TS.

## Reusable hook pattern (`get-*` / `use-*`)

All `viewer*` collection hooks expose full pagination variables. Server hooks use
`VariablesOf` for the options type; client hooks pass them straight through to `useGraphyQuery`.
Defaults (e.g. `first: 250`, default filter/orderBy) live inside the function, spread before
`...options` so callers can override any field:

```ts
// Server (hooks/get-viewer-organizations.ts)
export const ViewerOrganizationsGet = /*#__PURE__*/ gql(`
  query ViewerOrganizationsGet(
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
    $filter: OrganizationsFilter
    $orderBy: [OrganizationsOrderBy!]
  ) {
    organizations: viewerOrganizations(
      first: $first  last: $last  after: $after  before: $before
      filter: $filter  orderBy: $orderBy
    ) { edges { node { ...ViewerOrganizationGetFragment } } }
  }
`);

type Vars = VariablesOf<typeof ViewerOrganizationsGet>;

export const getViewerOrganizations = cache(async (options?: Vars) => {
  const graphy = await getGraphySession();
  return await graphy.query({ query: ViewerOrganizationsGet, variables: options ?? {} });
});

// Client (hooks/use-viewer-organizations.ts)
export function useViewerOrganizations(options?: Vars, config?: SWRConfiguration<Data>) {
  const { data: user } = useSupabaseUser();
  return useGraphyQuery(user ? { query: ViewerOrganizationsUse, variables: options ?? {} } : null, config);
}
```

For by-id / by-slug singular lookups expose `getViewerXByIdAssert` / `getViewerXBySlugAssert`
variants that call `notFound()` when the record is missing.

`agencyId` is UUID (`string`), not `int` — do not copy `int` signatures from tenant/org hooks.

## Operation variables — `filter`/`orderBy`/`first`/`atMost`

Declare these as operation variables, never inline literals — extensible without editing the doc.
Default them in the gql so call sites needn't pass them (enum literals are valid in defaults):

```graphql
query Foo($filter: TFilter, $orderBy: [TOrderBy!] = [{ field: AscNullsLast }], $first: Int = 250) {
  tCollection(first: $first, filter: $filter, orderBy: $orderBy) { edges { node { id } } }
}
mutation Bar($filter: TFilter!, $set: TUpdateInput!, $atMost: Int! = 1000) {
  updateTCollection(filter: $filter, set: $set, atMost: $atMost) { affectedCount }
}
```

Pass `filter` from TS when dynamic; for `is: NULL` import `{ FilterIs }` from
`~/generated/graphql/graphql` (deep — the index only re-exports `gql`). `atMost` is `Int!` in the
SDL but runtime-optional, so the `= 1000` default keeps existing behavior overridable.

## Naming

Operation names globally unique. Current suffixes:

- Page: `HomePickerPageQuery`
- Server helper: `ViewerOrganizationsGet`
- Client hook: `ViewerOrganizationsUse`
- Component mutation: `ProfileSectionUpdateNameMutation`

Fragments follow consumer namespace, reference pg_graphql type name (PascalCase):

```ts
export const ViewerOrganizationGetFragment = /*#__PURE__*/ gql(`
  fragment ViewerOrganizationGetFragment on Organizations {
    organizationId
    tenantId
    organizationSlug
    organizationName
  }
`);
```

Use fragments when reused or when exporting `ResultOf` shape.

## Server operation

```ts
const graphy = await getGraphySession();
const { data, error } = await graphy.query({
  query: ViewerOrganizationByIdGetQuery,
  variables: { organizationId: organization_id },
});
if (error) throw error;
const organization = data["viewerOrganizationById"];
```

External result fields use bracket notation. Variable names in `gql` operations ($camelCase) must
match the generated schema argument names — always check SDL after codegen.

## Client operation

```ts
const { data: user } = useSupabaseUser();
return useGraphyQuery(
  user
    ? { query: ViewerOrganizationsHookQuery, variables: { tenantId: tenant_id } }
    : null,
  config,
);
```

Mutations:

```ts
const [, updateName] = useGraphyMutation(ProfileSectionUpdateNameMutation);
const { error } = await updateName({ profile_id: profileId, profile_name_full: profileNameFull });
```

Variable names in the `variables` object are user-defined; match them to what the gql operation declares.
Field names inside gql strings must be camelCase (matching pg_graphql inflection).

For a viewer-scoped SQL mutation that creates one row, select fields from the returned object:

```graphql
mutation CreateTenant($tenant_name: String!, $tenant_slug: String!) {
  tenant: viewerTenantCreate(
    tenantName: $tenant_name
    tenantSlug: $tenant_slug
  ) {
    tenantId
    tenantSlug
  }
}
```

## pg_graphql shapes

- Tables: `<Table>Collection` → Relay `edges/node/pageInfo` + `totalCount` + `aggregate`.
- Insert: `insertInto<Table>Collection(objects: [...])`.
- Update: `update<Table>Collection(filter: ..., set: ...)`.
- Delete: `deleteFrom<Table>Collection(filter: ...)`.
- SQL functions become root fields, e.g. `viewerOrganizationById(...)`.
- An explicitly `volatile` function is exposed on `Mutation`.
- `volatile returns setof public.<table> rows 1` is exposed as a singular nullable
  `<Table>` object (not a connection). Preserve this SQL signature for create RPCs instead of
  returning only the primary-key scalar.
- `stable returns setof public.<table> rows 1` is the same singular-object shape but on **Query**
  — the canonical by-id read. Prefer it over `<Table>Collection(first: 1, filter: …)` when you
  want a clean nullable object + relationship spread (no `edges[0].node`). Pattern: a `security
  definer` SQL fn filtering `where … and profile_id = (select public.viewer_profile_id())`, e.g.
  `viewer_conversation_by_id(conversation_id uuid)` → `viewerConversationById(conversationId: UUID!)`.
- Relationships follow DB foreign keys; FK cardinality determines singular vs plural field name.

## SQL compatibility

- No hyphens in identifiers or enum values. One invalid enum can break whole introspection.
- External literals containing hyphens: `text` + `check`.
- Grant table privileges to `anon` when GraphQL requires schema visibility; RLS still gates rows.
- Prefer `viewer_*` functions/views for viewer-scoped reads.
- Prefer `useGraphyMutation` for authenticated browser mutations fully contained in one SQL
  transaction. Use a Server Action only for server-only APIs, secrets, trusted service-role
  orchestration, or external side effects.
- GraphQL lacks `ON CONFLICT`; use typed Supabase SDK for required upserts. Passkey challenge upsert is canonical example.
- Supabase Auth Admin APIs are not GraphQL; use service-role SDK.

## Type extraction

```ts
import type { ResultOf } from "@graphql-typed-document-node/core";

export type ViewerOrganization =
  ResultOf<typeof ViewerOrganizationGetFragment>;
```

Do not edit `apps/platform/generated/graphql/**` manually.

## Codegen workflow

After schema changes or adding operations:

```bash
pnpm db:reset          # replay schema + seed (rebuilds pg_graphql introspection)
pnpm generate:types    # regenerate packages/supabase/src/types.ts
pnpm generate:graphql:schema  # pull SDL from local Supabase
pnpm --filter @apps/platform run generate:graphql  # regenerate gql documents + types
pnpm build:dry         # catch TypeScript errors
```

All steps required in order when changing SQL schema. Skipping `generate:graphql:schema` leaves
the SDL stale and codegen may silently pass with wrong field names.
````

## File: apps/platform/components/shell/org-switcher.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowLeftRight, Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
⋮----
import { EntityAvatar } from "~/components/entity-avatar";
import { Tip, useClickOutside } from "~/components/shell/atoms";
import type { ViewerOrganizationUseFragmentType } from "~/hooks/use-viewer-organizations";
import type { ViewerTenantUseFragmentType } from "~/hooks/use-viewer-tenants";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
⋮----
export type ShellOrganization = ViewerOrganizationUseFragmentType;
export type ShellTenant = ViewerTenantUseFragmentType;
⋮----
className=
⋮----
onClick=
⋮----
href=
````

## File: packages/ui-common/package.json
````json
{
  "name": "@packages/ui-common",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "scripts": {
    "build:dry": "tsc --noEmit",
    "format": "biome check --diagnostic-level=error .",
    "test": "vitest run"
  },
  "exports": {
    "./shadcn/globals.css": "./src/shadcn/globals.css",
    "./shadcn/lib/*": "./src/shadcn/lib/*.ts",
    "./shadcn/components/*": "./src/shadcn/components/*.tsx",
    "./shadcn/hooks/*": "./src/shadcn/hooks/*.ts",
    "./*": "./src/*.tsx"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "input-otp": "^1.4.2",
    "lucide-react": "^1.21.0",
    "next-themes": "^0.4.6",
    "radix-ui": "^1.6.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0",
    "tailwindcss-safe-area": "^1.3.0"
  },
  "devDependencies": {
    "@packages/typescript-config": "workspace:*",
    "@tailwindcss/typography": "^0.5.20",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "jsdom": "^29.1.1",
    "shadcn": "^4.11.0",
    "tailwindcss": "^4.3.1",
    "tw-animate-css": "^1.4.0",
    "typescript": "^6.0.3",
    "vitest": "^4.1.9"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
````

## File: apps/platform/components/shell/command-palette.tsx
````typescript
import { useKeyboardShortcut } from "@packages/react-hooks/use-keyboard-shortcut";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import { Building2, Circle, Home, type LucideIcon, Search, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
⋮----
import { InitialsAvatar, Kbd } from "~/components/shell/atoms";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
⋮----
type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  Icon?: LucideIcon;
  orgInitials?: string;
  orgColor?: Record<string, string>;
  onSelect: () => void;
};
⋮----
type PaletteGroup = {
  heading: string;
  items: PaletteItem[];
};
⋮----
function onKey(event: KeyboardEvent)
````

## File: apps/platform/components/shell/mobile-nav-drawer.tsx
````typescript
import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowUpRight, ChevronsUpDown, HelpCircle, Settings as SettingsIcon, X } from "lucide-react";
import Link from "next/link";
⋮----
import { InitialsAvatar } from "~/components/shell/atoms";
import { Scrim } from "~/components/shell/mobile-sheet";
import { BUILD_NAV_TREE, IS_NAV_GROUP, type NavLeaf, PICK_ACTIVE_LEAF_ID } from "~/components/shell/nav-tree";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import type { ShellViewer } from "~/components/shell/profile-menu";
import { useRosetta } from "~/lib/i18n.client";
````

## File: apps/platform/components/shell/profile-menu.tsx
````typescript
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { INITIALS_OF } from "@packages/utils/string";
import { Bell, ChevronsUpDown, KeyRound, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
⋮----
import { InitialsAvatar, Tip, useClickOutside } from "~/components/shell/atoms";
import type { ViewerProfileUseFragmentType } from "~/hooks/use-viewer-profile";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE } from "~/lib/route";
⋮----
export type ShellViewer = ViewerProfileUseFragmentType & { email: string };
⋮----
className=
⋮----
href=
````

## File: packages/supabase/package.json
````json
{
  "name": "@packages/supabase",
  "version": "0.0.0",
  "private": true,
  "sideEffects": false,
  "scripts": {
    "build:dry": "tsc --noEmit",
    "db:start": "SUPABASE_AUTH_SITE_URL=\"https://lvh.me:${PORT:-7003}\" SUPABASE_AUTH_WEBAUTHN_RP_ORIGINS=\"https://lvh.me:${PORT:-7003}\" SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=\"${SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION:-true}\" supabase start",
    "db:stop": "SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=\"${SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION:-true}\" supabase stop",
    "db:reset": "SUPABASE_AUTH_SITE_URL=\"https://lvh.me:${PORT:-7003}\" SUPABASE_AUTH_WEBAUTHN_RP_ORIGINS=\"https://lvh.me:${PORT:-7003}\" SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=\"${SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION:-true}\" supabase db reset",
    "db:status": "SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=\"${SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION:-true}\" supabase status",
    "db:migrate:new": "supabase migration new",
    "db:migrate:up": "SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=\"${SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION:-true}\" supabase migration up",
    "generate:types": "SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=\"${SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION:-true}\" supabase gen types --lang=typescript --local --schema public > src/types.ts",
    "generate:graphql:schema": "graphql-codegen -c graphql.config.ts",
    "generate:graphql:schema:local": "graphql-codegen -c graphql.config.ts --local",
    "format": "biome check --diagnostic-level=error .",
    "test:db": "SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION=\"${SUPABASE_AUTH_ALLOW_DYNAMIC_REGISTRATION:-true}\" supabase test db --local"
  },
  "exports": {
    "./*": "./src/*.ts"
  },
  "peerDependencies": {
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.4.0",
    "next": "^16.0.0",
    "react": "^19.0.0",
    "swr": "^2.0.0",
    "zod": "^4.4.3"
  },
  "dependencies": {
    "@packages/utils": "workspace:*"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^7.1.3",
    "@graphql-codegen/introspection": "^6.0.1",
    "@graphql-codegen/schema-ast": "^6.0.1",
    "@next/env": "^16.2.9",
    "@packages/typescript-config": "workspace:*",
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.108.2",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.17",
    "graphql": "^16.9.0",
    "next": "^16.2.9",
    "react": "^19.2.7",
    "supabase": "^2.107.0",
    "swr": "^2.4.1",
    "typescript": "^6.0.3",
    "zod": "^4.4.3"
  }
}
````

## File: apps/platform/components/shell/mobile-sheets.tsx
````typescript
import { useMounted } from "@packages/react-hooks/use-mounted";
import { COLOR_HSL_FROM_STRING } from "@packages/utils/colors";
import { INITIALS_OF } from "@packages/utils/string";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Globe,
  HelpCircle,
  Home,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Search,
  Settings as SettingsIcon,
  Shield,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useTransition } from "react";
import { InitialsAvatar } from "~/components/shell/atoms";
import { Sheet } from "~/components/shell/mobile-sheet";
import type { ShellOrganization, ShellTenant } from "~/components/shell/org-switcher";
import type { ShellViewer } from "~/components/shell/profile-menu";
import { useLocaleCookie } from "~/hooks/use-locale-cookie";
import { LOCALE_LABEL, SUPPORTED_LOCALES } from "~/lib/i18n";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
⋮----
href=
⋮----
<span>
⋮----
function goTo(item: SearchItem)
⋮----
placeholder=
````

## File: apps/platform/next-env.d.ts
````typescript

````

## File: package.json
````json
{
  "name": "saas-template",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.20.0",
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "preinstall": "npx --yes only-allow pnpm",
    "postinstall": "pnpm skills:install",
    "build": "turbo run build",
    "dev": "turbo run dev",
    "dev:debug": "turbo run dev:debug",
    "setup:local": "bash scripts/development/local-setup.sh",
    "dev:local": "pnpm setup:local && pnpm dev",
    "build:dry": "turbo run build:dry",
    "generate": "turbo run generate",
    "test": "turbo run test",
    "test:db": "pnpm --filter @packages/supabase run test:db",
    "test:e2e": "pnpm --filter @apps/platform run test:e2e",
    "format": "turbo run format && biome check --diagnostic-level=error .",
    "format:apply": "turbo run format -- --write && biome check --diagnostic-level=error --write .",
    "format:apply-unsafe": "turbo run format -- --write --unsafe && biome check --diagnostic-level=error --write --unsafe .",
    "db:start": "pnpm --filter @packages/supabase db:start",
    "db:stop": "pnpm --filter @packages/supabase db:stop",
    "db:reset": "pnpm --filter @packages/supabase db:reset",
    "db:status": "pnpm --filter @packages/supabase db:status",
    "db:env:development": "node --experimental-strip-types scripts/development/env-setup.ts",
    "db:migrate:new": "pnpm --filter @packages/supabase db:migrate:new",
    "db:migrate:up": "pnpm --filter @packages/supabase db:migrate:up",
    "generate:types": "turbo run generate:types --filter=@packages/supabase",
    "generate:graphql:schema": "pnpm --filter @packages/supabase run generate:graphql:schema",
    "generate:graphql:schema:local": "pnpm --filter @packages/supabase run generate:graphql:schema:local",
    "generate:graphql:platform": "pnpm --filter @apps/platform run generate:graphql",
    "generate:repomix:skills": "repomix -c repomix.config.ts --skill-generate codebase --skill-output skills/codebase -f && node scripts/repomix-skill-rename.mjs",
    "skills:install": "node scripts/skills-setup.mjs",
    "typecheck:platform": "turbo run build:dry --filter=@apps/platform"
  },
  "devDependencies": {
    "@biomejs/biome": "2.5.0",
    "@packages/typescript-config": "workspace:*",
    "@types/qrcode-terminal": "^0.12.2",
    "graphql": "^16.9.0",
    "graphql-config": "^5.1.6",
    "qrcode-terminal": "^0.12.0",
    "repomix": "^1.15.0",
    "skills": "1.5.12",
    "ts-dedent": "^2.3.0",
    "turbo": "^2.9.18",
    "typescript": "^6.0.3"
  },
  "extensionDependencies": [
    "ms-vscode.vscode-claude-sdk"
  ]
}
````

## File: apps/platform/proxy.ts
````typescript
import { updateSession } from "@packages/supabase/client.middleware";
import { URL_NEW } from "@packages/utils/url";
import { type NextRequest, NextResponse, userAgent } from "next/server";
import { APEX_HOSTNAME, APP_HOST, PROXY_LOG_ENABLED } from "~/lib/constants";
import { debug } from "~/lib/debug";
import { LOCALE_COOKIE, LOCALE_SUPPORTED_RESOLVE, type SupportedLocale } from "~/lib/i18n";
import { LOCALE_FROM_REQUEST } from "~/lib/i18n.server";
⋮----
export async function proxy(request: NextRequest)
⋮----
function withLocale(response: NextResponse): NextResponse
⋮----
function isPublicPath(pathname: string): boolean
⋮----
function setLocaleCookieOnResponse(response: NextResponse, locale: SupportedLocale): NextResponse
⋮----
function isGlobalMetadataAssetPath(pathname: string): boolean
⋮----
async function setPostHogBootstrap(request: NextRequest, response: NextResponse): Promise<void>
````

## File: packages/supabase/supabase/migrations/00000000000000_schema.sql
````sql
create extension if not exists "moddatetime" schema extensions;
create extension if not exists "citext" schema extensions;
create extension if not exists "pgtap" schema extensions;
create extension if not exists "pgmq";
create extension if not exists "pg_cron";
create extension if not exists "pg_net" schema extensions;
do $$
begin
  perform pgmq.create('conversation_outbound');
exception when others then
  null;
end;
$$;
create schema if not exists private;
create schema if not exists internal;
create schema if not exists protected;
revoke usage on schema private from public;
revoke usage on schema internal from public;
revoke usage on schema protected from public;
grant usage on schema internal to postgres, service_role, authenticated, anon;
grant execute on all functions in schema internal to service_role, authenticated, anon;
grant usage on schema protected to service_role, authenticator;
comment on schema public is e'@graphql({"inflect_names": true, "max_rows": 250})';
-- ============================================================
-- internal utilities
-- ============================================================
-- pg_uuidv7 is not bundled yet; polyfill until CLI/image is upgraded.
-- Swap for `create extension "pg_uuidv7"` and drop this function once available.
create or replace function internal.uuid_generate_v7()
  returns uuid
  language plpgsql
  volatile
  as $$
  declare
    _unix_ts_ms bytea;
    _uuid_bytes bytea;
  begin
    _unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
    _uuid_bytes = uuid_send(gen_random_uuid());
    _uuid_bytes = overlay(_uuid_bytes placing _unix_ts_ms from 1 for 6);
    _uuid_bytes = set_byte(_uuid_bytes, 6, (b'0111' || get_byte(_uuid_bytes, 6)::bit(4))::bit(8)::int);
    return encode(_uuid_bytes, 'hex')::uuid;
  end;
  $$;
create or replace function internal.text_normalize(value text)
  returns text
  language sql
  immutable
  parallel safe
  set search_path to ''
  as $$
    select nullif(
      trim(regexp_replace(
        regexp_replace(
          regexp_replace(value, '[\x00-\x1F\x7F]', ' ', 'g'),
          '<[^>]*>', '', 'g'
        ),
        '\s+', ' ', 'g'
      )),
      ''
    );
  $$;
-- Trigger function: normalizes named text columns via internal.text_normalize.
-- Pass column names as trigger arguments, e.g.:
--   execute procedure internal.column_normalize_text(col_a, col_b)
create or replace function internal.column_normalize_text()
  returns trigger
  language plpgsql
  as $$
    declare
      _col text;
      _val text;
    begin
      foreach _col in array TG_ARGV loop
        _val := internal.text_normalize(row_to_json(NEW) ->> _col);
        NEW := jsonb_populate_record(NEW, jsonb_build_object(_col, _val));
      end loop;
      return NEW;
    end;
  $$;
-- Slug validation shared by any table with a slug column (tenants, future teams, etc.)
create or replace function internal.slug_validate(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  set search_path to ''
  as $$
    select value ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])?$';
  $$;
-- Email validation shared by invite/identity columns. citext-friendly; mirrors the
-- length bounds those columns previously enforced inline.
create or replace function internal.email_validate(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  strict
  set search_path to ''
  as $$
    select char_length(value) between 3 and 254
      and value ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$';
  $$;
-- Phone validation: E.164 with leading '+'. Mirrors public.phone_normalize's output shape.
create or replace function internal.phone_validate(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  strict
  set search_path to ''
  as $$
    select value ~ '^\+[1-9]\d{7,14}$';
  $$;
-- Predicate for canonical UUID text (8-4-4-4-12 hex). Cheaper and exception-free
-- compared to `value::uuid` in a try/catch — useful for index predicates and
-- view filters that must be IMMUTABLE.
create or replace function internal.is_uuid(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  strict
  set search_path to ''
  as $$
    select value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  $$;
-- Byte unit conversion. SI ('KB', 'MB', 'GB', 'TB') use powers of 1000; binary
create or replace function internal.convert_unit_byte(
  amount numeric,
  from_unit text,
  to_unit text default 'byte'
)
  returns numeric
  language sql
  immutable
  parallel safe
  strict
  set search_path to ''
  as $$
    with factor(unit, value) as (values
      ('byte', 1::numeric),
      ('KB',   1e3::numeric),  ('KiB',  1024::numeric),
      ('MB',   1e6::numeric),  ('MiB',  1048576::numeric),
      ('GB',   1e9::numeric),  ('GiB',  1073741824::numeric),
      ('TB',   1e12::numeric), ('TiB',  1099511627776::numeric)
    )
    select amount
      * (select value from factor where unit = from_unit)
      / (select value from factor where unit = to_unit);
  $$;
create or replace function public.email_exists(email_to_check text)
  returns boolean
  language sql
  stable
  security definer
  set search_path to ''
  as $$
    select exists (
      select 1 from auth.users
      where lower(email) = lower(email_to_check)
    );
  $$;
-- Normalize a phone string to E.164 with leading '+'. Strips whitespace/dashes/dots/parens.
-- If the cleaned input doesn't start with '+', prepends `default_code`. Returns NULL when the
create or replace function public.phone_normalize(value text, default_code text default '+56')
  returns text
  language plpgsql
  immutable
  parallel safe
  set search_path to ''
  as $$
    declare
      _stripped text;
      _candidate text;
    begin
      _stripped := regexp_replace(coalesce(value, ''), '[\s\-().]', '', 'g');
      if _stripped = '' then
        return null;
      end if;
      if _stripped like '+%' then
        _candidate := _stripped;
      else
        _candidate := default_code || _stripped;
      end if;
      if _candidate ~ '^\+[1-9]\d{7,14}$' then
        return _candidate;
      end if;
      return null;
    end;
  $$;
-- Anonymous lookup used by /auth root to branch between phone login/signup. Mirrors
-- email_exists. gotrue stores phones without the leading '+', so we strip it before comparing.
create or replace function public.phone_exists(phone_to_check text, default_code text default '+56')
  returns boolean
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _canonical text;
      _result boolean;
    begin
      _canonical := public.phone_normalize(phone_to_check, default_code);
      if _canonical is null then
        return false;
      end if;
      select exists (
        select 1 from auth.users
        where phone = ltrim(_canonical, '+')
      ) into _result;
      return _result;
    end;
  $$;
-- Lightweight liveness probe — returns DB time so callers can verify connectivity and clock.
create or replace function public.health_current_timestamp()
  returns timestamptz
  stable
  strict
  parallel safe
  security definer
  language sql
  set search_path to ''
  as $$
    select current_timestamp;
  $$;
-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  profile_id uuid not null primary key references auth.users on delete cascade,
  profile_name_full text,
  profile_onboarded_at timestamptz,
  profile_disabled_at timestamptz,
  profile_created_at timestamptz not null default current_timestamp,
  profile_updated_at timestamptz not null default current_timestamp
);
-- Indexes
create index if not exists profiles_disabled_at_idx
  on public.profiles (profile_disabled_at)
  where profile_disabled_at is not null;
-- Auto-update updated_at
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure extensions.moddatetime(profile_updated_at);
drop trigger if exists profiles_trigger_normalize_name on public.profiles;
create trigger profiles_trigger_normalize_name
  before insert or update of profile_name_full on public.profiles
  for each row execute procedure internal.column_normalize_text(profile_name_full);
-- Auto-create profile on new auth user
create or replace function public.users_handle_created()
  returns trigger
  language plpgsql
  security definer
  as $$
    begin
      insert into public.profiles (profile_id, profile_name_full)
        values (new.id, new.raw_user_meta_data->>'full_name')
        on conflict (profile_id) do nothing;
      return new;
    end;
  $$;
drop trigger if exists users_trigger_created on auth.users;
create trigger users_trigger_created
  after insert on auth.users
  for each row execute procedure public.users_handle_created();
create or replace function public.viewer_profile_id(strict boolean default false)
  returns uuid
  stable
  security definer
  parallel safe
  language plpgsql
  set search_path to ''
  as $$
    declare
      _user_id uuid := auth.uid();
    begin
      if _user_id is null and $1 is true then
        raise exception '[viewer_profile_id] not logged-in';
      end if;
      return _user_id;
    end;
  $$;
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select, update on table public.profiles to anon, authenticated;
drop policy if exists "Users can update own profiles." on public.profiles;
create policy "Users can update own profiles."
  on public.profiles for update
  to authenticated
  using (
    profile_disabled_at is null
    and profile_id = (select public.viewer_profile_id())
  );
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'profiles',
    'profiles',
    true,
    internal.convert_unit_byte(5, 'MiB'),
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
do $$ begin
  create type public.notification_priority as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.notification_kind as enum ('info', 'warn', 'fatal', 'error', 'debug', 'log');
exception when duplicate_object then null; end $$;
create table if not exists public.conversation_topics (
  conversation_topic_slug extensions.citext not null primary key
    check (internal.slug_validate(conversation_topic_slug::text)),
  conversation_topic_name text not null check (char_length(conversation_topic_name) between 1 and 120),
  conversation_topic_description text not null check (char_length(conversation_topic_description) between 1 and 500),
  conversation_topic_priority public.notification_priority not null default 'medium',
  conversation_topic_kind public.notification_kind not null default 'log',
  conversation_topic_disabled_at timestamptz,
  conversation_topic_created_at timestamptz not null default current_timestamp,
  conversation_topic_updated_at timestamptz not null default current_timestamp
);
create index if not exists conversation_topics_priority_idx
  on public.conversation_topics (conversation_topic_priority desc)
  where conversation_topic_disabled_at is null;
drop trigger if exists handle_conversation_topics_updated_at on public.conversation_topics;
create trigger handle_conversation_topics_updated_at
  before update on public.conversation_topics
  for each row execute procedure extensions.moddatetime(conversation_topic_updated_at);
drop trigger if exists conversation_topics_trigger_normalize_text on public.conversation_topics;
create trigger conversation_topics_trigger_normalize_text
  before insert or update of conversation_topic_name, conversation_topic_description on public.conversation_topics
  for each row execute procedure internal.column_normalize_text(conversation_topic_name, conversation_topic_description);
alter table public.conversation_topics enable row level security;
revoke all on table public.conversation_topics from anon, authenticated;
grant select on table public.conversation_topics to anon, authenticated;
grant select, insert, update, delete on table public.conversation_topics to service_role;
drop policy if exists "conversation_topics select active catalog" on public.conversation_topics;
create policy "conversation_topics select active catalog"
  on public.conversation_topics for select
  to anon, authenticated
  using (conversation_topic_disabled_at is null);
create table if not exists public.reserved_slugs (
  reserved_slug extensions.citext primary key check (char_length(reserved_slug) between 1 and 39)
);
alter table public.reserved_slugs enable row level security;
create policy "reserved_slugs_select"
  on public.reserved_slugs
  for select to anon, authenticated
  using (true);
create or replace function internal.slug_reserved_validate(value text)
  returns boolean
  language sql
  stable
  security definer
  parallel safe
  set search_path to ''
  as $$
    select internal.slug_validate(value)
      and not exists (
        select 1 from public.reserved_slugs
        where reserved_slug = value
      );
  $$;
create table if not exists public.tenants (
  tenant_id serial primary key,
  tenant_slug extensions.citext not null unique check (internal.slug_reserved_validate(tenant_slug::text)),
  tenant_name text not null check (char_length(tenant_name) between 1 and 256),
  -- Onboarding (extensible, resumable, soft nudge). Steps (logo set, first member invited) are
  -- derivable — computed at read time from storage/memberships, never stored. `tenant_onboarded_at`
  -- is set when the whole flow is dismissed/finished so the banner stops.
  tenant_onboarded_at timestamptz,
  tenant_disabled_at timestamptz,
  tenant_created_at timestamptz not null default current_timestamp,
  tenant_updated_at timestamptz not null default current_timestamp
);
create index if not exists tenants_disabled_at_idx
  on public.tenants (tenant_disabled_at) where tenant_disabled_at is not null;
drop trigger if exists handle_tenants_updated_at on public.tenants;
create trigger handle_tenants_updated_at
  before update on public.tenants
  for each row execute procedure extensions.moddatetime(tenant_updated_at);
drop trigger if exists tenants_trigger_normalize_name on public.tenants;
create trigger tenants_trigger_normalize_name
  before insert or update of tenant_name on public.tenants
  for each row execute procedure internal.column_normalize_text(tenant_name);
create table if not exists public.organizations (
  organization_id serial primary key,
  tenant_id int not null references public.tenants (tenant_id) on delete cascade,
  organization_slug extensions.citext not null check (internal.slug_validate(organization_slug::text)),
  organization_name text not null check (char_length(organization_name) between 1 and 256),
  organization_disabled_at timestamptz,
  organization_created_at timestamptz not null default current_timestamp,
  organization_updated_at timestamptz not null default current_timestamp,
  unique (tenant_id, organization_slug)
);
create index if not exists organizations_tenant_idx
  on public.organizations (tenant_id) where organization_disabled_at is null;
drop trigger if exists handle_organizations_updated_at on public.organizations;
create trigger handle_organizations_updated_at
  before update on public.organizations
  for each row execute procedure extensions.moddatetime(organization_updated_at);
drop trigger if exists organizations_trigger_normalize_name on public.organizations;
create trigger organizations_trigger_normalize_name
  before insert or update of organization_name on public.organizations
  for each row execute procedure internal.column_normalize_text(organization_name);
-- Storage (same convention as the `profiles` bucket above: bucket name === table name,
-- first path segment === organization_id, app-level subfolder beneath it: `<id>/avatar/<filename>`).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'organizations',
    'organizations',
    true,
    internal.convert_unit_byte(5, 'MiB'),
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'tenants',
    'tenants',
    true,
    internal.convert_unit_byte(5, 'MiB'),
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'agencies',
    'agencies',
    true,
    internal.convert_unit_byte(5, 'MiB'),
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
create table if not exists public.addresses_level0 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level0_name text not null check (length(address_level0_name) <= 100),
  address_level0_emoji text check (char_length(address_level0_emoji) between 1 and 8),
  address_level0_disabled_at timestamptz,
  address_level0_hidden_at timestamptz,
  address_level0_created_at timestamptz not null default current_timestamp,
  address_level0_updated_at timestamptz not null default current_timestamp,
  primary key (address_level0_id)
);
create or replace function public.cl_rut_normalize(value text)
  returns text
  language plpgsql
  immutable
  parallel safe
  set search_path to ''
  as $$
    declare
      _stripped text;
      _t bigint;
      _m int;
      _s int;
      _dv text;
    begin
      if value is null then
        return null;
      end if;
      _stripped := upper(regexp_replace(value, '[^0-9a-zA-Z]', '', 'g'));
      _stripped := regexp_replace(_stripped, '^0+', '', '');
      if _stripped !~ '^[0-9]{1,9}[0-9K]$' then
        return null;
      end if;
      _t := substring(_stripped from 1 for char_length(_stripped) - 1)::bigint;
      _m := 0;
      _s := 1;
      while _t > 0 loop
        _s := (_s + (_t % 10)::int * (9 - (_m % 6))) % 11;
        _m := _m + 1;
        _t := _t / 10;
      end loop;
      if _s > 0 then
        _dv := (_s - 1)::text;
      else
        _dv := 'K';
      end if;
      if _dv <> substring(_stripped from char_length(_stripped) for 1) then
        return null;
      end if;
      return _stripped;
    end;
  $$;
create or replace function public.cl_rut_validate(value text)
  returns boolean
  language sql
  immutable
  parallel safe
  set search_path to ''
  as $$
    select public.cl_rut_normalize(value) is not null;
  $$;
do $$ begin
  create type public.profile_identity_document_kind as enum ('nin', 'passport');
exception when duplicate_object then null; end $$;
create or replace function internal.profile_identity_value_normalize(
  country text,
  kind public.profile_identity_document_kind,
  value text
) returns text
  language plpgsql
  immutable
  parallel safe
  set search_path to ''
  as $$
    declare
      _stripped text;
    begin
      if value is null then
        return null;
      end if;
      _stripped := upper(regexp_replace(value, '[^0-9a-zA-Z]', '', 'g'));
      _stripped := regexp_replace(_stripped, '^0+', '', '');
      if _stripped = '' or char_length(_stripped) < 4 or char_length(_stripped) > 32 then
        return null;
      end if;
      if country = 'CL' and kind = 'nin' and not public.cl_rut_validate(_stripped) then
        return null;
      end if;
      return _stripped;
    end;
  $$;
create table if not exists public.organization_memberships (
  organization_membership_id serial primary key,
  organization_id int not null references public.organizations (organization_id) on delete cascade,
  profile_id uuid references public.profiles (profile_id) on delete set null,
  organization_membership_invite_email extensions.citext
    check (organization_membership_invite_email is null or internal.email_validate(organization_membership_invite_email::text)),
  organization_membership_invite_phone text
    check (organization_membership_invite_phone is null or internal.phone_validate(organization_membership_invite_phone)),
  organization_membership_invite_address_level0_id text
    references public.addresses_level0 (address_level0_id),
  organization_membership_invite_document_kind public.profile_identity_document_kind,
  organization_membership_invite_document_value text
    check (organization_membership_invite_document_value is null or char_length(organization_membership_invite_document_value) between 4 and 32),
  organization_membership_invite_token text unique
    check (organization_membership_invite_token is null or char_length(organization_membership_invite_token) between 8 and 256),
  organization_membership_invite_expires_at timestamptz,
  organization_membership_accepted_at timestamptz,
  organization_membership_rejected_at timestamptz,
  organization_membership_revoked_at timestamptz,
  organization_membership_created_at timestamptz not null default current_timestamp,
  organization_membership_updated_at timestamptz not null default current_timestamp,
  constraint organization_memberships_claim_consistency check (
    (profile_id is null and organization_membership_accepted_at is null)
    or (profile_id is not null and organization_membership_accepted_at is not null)
  ),
  constraint organization_memberships_pending_has_identifier check (
    profile_id is not null
    or organization_membership_invite_email is not null
    or organization_membership_invite_phone is not null
    or (
      organization_membership_invite_address_level0_id is not null
      and organization_membership_invite_document_kind is not null
      and organization_membership_invite_document_value is not null
    )
  ),
  constraint organization_memberships_doc_triplet_complete check (
    (organization_membership_invite_address_level0_id is null
     and organization_membership_invite_document_kind is null
     and organization_membership_invite_document_value is null)
    or (organization_membership_invite_address_level0_id is not null
        and organization_membership_invite_document_kind is not null
        and organization_membership_invite_document_value is not null)
  )
);
create unique index if not exists organization_memberships_org_profile_active_idx
  on public.organization_memberships (organization_id, profile_id)
  where profile_id is not null
    and organization_membership_revoked_at is null
    and organization_membership_rejected_at is null;
create unique index if not exists organization_memberships_org_email_pending_idx
  on public.organization_memberships (organization_id, organization_membership_invite_email)
  where profile_id is null
    and organization_membership_invite_email is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;
create unique index if not exists organization_memberships_org_phone_pending_idx
  on public.organization_memberships (organization_id, organization_membership_invite_phone)
  where profile_id is null
    and organization_membership_invite_phone is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;
create unique index if not exists organization_memberships_org_doc_pending_idx
  on public.organization_memberships (
    organization_id, organization_membership_invite_address_level0_id,
    organization_membership_invite_document_kind, organization_membership_invite_document_value
  )
  where profile_id is null
    and organization_membership_invite_document_value is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;
create index if not exists organization_memberships_profile_active_idx
  on public.organization_memberships (profile_id)
  where profile_id is not null
    and organization_membership_accepted_at is not null
    and organization_membership_revoked_at is null
    and organization_membership_rejected_at is null;
create index if not exists organization_memberships_invite_email_pending_idx
  on public.organization_memberships (organization_membership_invite_email)
  where profile_id is null
    and organization_membership_invite_email is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;
create index if not exists organization_memberships_invite_phone_pending_idx
  on public.organization_memberships (organization_membership_invite_phone)
  where profile_id is null
    and organization_membership_invite_phone is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;
create index if not exists organization_memberships_invite_doc_pending_idx
  on public.organization_memberships (
    organization_membership_invite_address_level0_id,
    organization_membership_invite_document_kind,
    organization_membership_invite_document_value
  )
  where profile_id is null
    and organization_membership_invite_document_value is not null
    and organization_membership_rejected_at is null
    and organization_membership_revoked_at is null;
drop trigger if exists handle_organization_memberships_updated_at on public.organization_memberships;
create trigger handle_organization_memberships_updated_at
  before update on public.organization_memberships
  for each row execute procedure extensions.moddatetime(organization_membership_updated_at);
create or replace function internal.organization_memberships_normalize_invite_phone()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    declare
      _normalized text;
    begin
      if NEW.organization_membership_invite_phone is null then
        return NEW;
      end if;
      _normalized := public.phone_normalize(NEW.organization_membership_invite_phone, '+56');
      if _normalized is null then
        raise exception 'Invalid invite phone: %', NEW.organization_membership_invite_phone;
      end if;
      NEW.organization_membership_invite_phone := _normalized;
      return NEW;
    end;
  $$;
drop trigger if exists organization_memberships_trigger_normalize_invite_phone on public.organization_memberships;
create trigger organization_memberships_trigger_normalize_invite_phone
  before insert or update of organization_membership_invite_phone on public.organization_memberships
  for each row execute procedure internal.organization_memberships_normalize_invite_phone();
create or replace function internal.organization_memberships_normalize_invite_document()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    declare
      _normalized text;
    begin
      if NEW.organization_membership_invite_document_value is null then
        return NEW;
      end if;
      _normalized := internal.profile_identity_value_normalize(
        NEW.organization_membership_invite_address_level0_id,
        NEW.organization_membership_invite_document_kind,
        NEW.organization_membership_invite_document_value
      );
      if _normalized is null then
        raise exception 'Invalid % document value for %: %',
          NEW.organization_membership_invite_document_kind,
          NEW.organization_membership_invite_address_level0_id,
          NEW.organization_membership_invite_document_value;
      end if;
      NEW.organization_membership_invite_document_value := _normalized;
      return NEW;
    end;
  $$;
drop trigger if exists organization_memberships_trigger_normalize_invite_document on public.organization_memberships;
create trigger organization_memberships_trigger_normalize_invite_document
  before insert or update of
    organization_membership_invite_address_level0_id,
    organization_membership_invite_document_kind,
    organization_membership_invite_document_value
  on public.organization_memberships
  for each row execute procedure internal.organization_memberships_normalize_invite_document();
-- Catalog of permissions. Seeded below. permission_id is a snake_case identifier (we use
-- it as a code-level constant, not a URL slug — so underscores, not hyphens). The reserved
-- slug `*` is the wildcard; the check allows it explicitly alongside snake_case slugs.
create table if not exists public.permissions (
  permission_id extensions.citext primary key
    check (
      permission_id::text = '*'
      or permission_id::text ~ '^[a-z0-9]([a-z0-9_]{1,38}[a-z0-9])?$'
    ),
  permission_description text,
  permission_created_at timestamptz not null default current_timestamp,
  permission_updated_at timestamptz not null default current_timestamp
);
drop trigger if exists handle_permissions_updated_at on public.permissions;
create trigger handle_permissions_updated_at
  before update on public.permissions
  for each row execute procedure extensions.moddatetime(permission_updated_at);
-- Grants: one row per (organization_membership, permission). Permissions can be attached to a organization_membership
-- BEFORE the invitee claims it — admins set the slugs at invite time, they apply once the
-- invitee accepts. Cascades from organization_memberships (delete) and permissions (slug retirement).
create table if not exists public.organization_membership_permissions (
  organization_membership_id int not null
    references public.organization_memberships (organization_membership_id) on delete cascade,
  permission_id extensions.citext not null
    references public.permissions (permission_id) on delete cascade,
  organization_membership_permission_created_at timestamptz not null default current_timestamp,
  primary key (organization_membership_id, permission_id)
);
-- Secondary index for "what permission rows match slug X?" cross-organization_membership scans.
create index if not exists organization_membership_permissions_permission_idx
  on public.organization_membership_permissions (permission_id);
-- UX-only catalog of named permission bundles. `organization_id IS NULL` = global preset
-- visible to everyone; non-null = preset specific to that organization. The trigger validates
-- every slug in `permission_preset_slugs` exists in `public.permissions`.
create table if not exists public.permission_presets (
  permission_preset_id serial primary key,
  organization_id int references public.organizations (organization_id) on delete cascade,
  permission_preset_name text not null check (char_length(permission_preset_name) between 1 and 100),
  permission_preset_slugs extensions.citext[] not null,
  permission_preset_created_at timestamptz not null default current_timestamp,
  permission_preset_updated_at timestamptz not null default current_timestamp,
  check (cardinality(permission_preset_slugs) > 0)
);
create index if not exists permission_presets_org_idx
  on public.permission_presets (organization_id) where organization_id is not null;
drop trigger if exists handle_permission_presets_updated_at on public.permission_presets;
create trigger handle_permission_presets_updated_at
  before update on public.permission_presets
  for each row execute procedure extensions.moddatetime(permission_preset_updated_at);
-- Validate every slug in permission_preset_slugs exists in the permissions catalog.
-- Fires on INSERT or UPDATE of the slugs column.
create or replace function internal.permission_preset_validate_slugs()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    declare
      _missing extensions.citext[];
    begin
      select array_agg(s)
        into _missing
        from unnest(NEW.permission_preset_slugs) s
        where s not in (select permission_id from public.permissions);
      if _missing is not null and cardinality(_missing) > 0 then
        raise exception 'Unknown permission slug(s) in preset: %', _missing;
      end if;
      return NEW;
    end;
  $$;
drop trigger if exists permission_presets_trigger_validate_slugs on public.permission_presets;
create trigger permission_presets_trigger_validate_slugs
  before insert or update of permission_preset_slugs on public.permission_presets
  for each row execute procedure internal.permission_preset_validate_slugs();
-- Seed catalog (idempotent: ON CONFLICT skips). Add new slugs here, then re-run db:reset.
insert into public.permissions (permission_id, permission_description) values
  ('*',                    'Wildcard: grants every permission within the organization (typical use: founder).'),
  ('organization_manage',  'Edit the organization: name, logo, members, and presets.'),
  ('tenant_manage',        'Edit the tenant (billing entity): name, logo, billing, and domains.'),
  ('members_manage',       'Invite, remove, and reassign permissions to members.'),
  ('presets_manage',       'Create and edit the organization''s permission presets.'),
  ('tickets_manage',       'View, claim, and resolve support tickets on behalf of the organization.'),
  ('agency_members_manage','Manage the agency team: invite, revoke, reactivate affiliates and reassign their agency permissions.')
on conflict (permission_id) do nothing;
insert into public.permission_presets (organization_id, permission_preset_name, permission_preset_slugs) values
  (null, 'Owner',         array['*']::extensions.citext[]),
  (null, 'Administrator', array['organization_manage','members_manage','presets_manage']::extensions.citext[]),
  (null, 'Member manager', array['members_manage']::extensions.citext[])
on conflict do nothing;
create table if not exists public.agencies (
  agency_id serial primary key,
  agency_name text not null check (char_length(agency_name) between 1 and 100),
  agency_slug extensions.citext not null unique,
  agency_disabled_at timestamptz,
  agency_created_at timestamptz not null default current_timestamp,
  agency_updated_at timestamptz not null default current_timestamp
);
drop trigger if exists handle_agencies_updated_at on public.agencies;
create trigger handle_agencies_updated_at
  before update on public.agencies
  for each row execute procedure extensions.moddatetime(agency_updated_at);
create table if not exists public.agency_memberships (
  agency_membership_id serial primary key,
  agency_id int not null references public.agencies (agency_id) on delete cascade,
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  agency_membership_accepted_at timestamptz,
  agency_membership_revoked_at timestamptz,
  agency_membership_rejected_at timestamptz,
  agency_membership_created_at timestamptz not null default current_timestamp,
  agency_membership_updated_at timestamptz not null default current_timestamp,
  unique (agency_id, profile_id)
);
create index if not exists agency_memberships_profile_idx on public.agency_memberships (profile_id);
drop trigger if exists handle_agency_memberships_updated_at on public.agency_memberships;
create trigger handle_agency_memberships_updated_at
  before update on public.agency_memberships
  for each row execute procedure extensions.moddatetime(agency_membership_updated_at);
create table if not exists public.agencies_organizations_grants (
  agencies_organizations_grant_id uuid not null primary key default internal.uuid_generate_v7(),
  agency_id int not null references public.agencies (agency_id) on delete cascade,
  organization_id int references public.organizations (organization_id) on delete cascade,
  permission_id extensions.citext not null references public.permissions (permission_id) on delete cascade,
  agencies_organizations_grant_created_at timestamptz not null default current_timestamp
);
create unique index if not exists agencies_organizations_grants_org_unique
  on public.agencies_organizations_grants (agency_id, organization_id, permission_id)
  where organization_id is not null;
create unique index if not exists agencies_organizations_grants_global_unique
  on public.agencies_organizations_grants (agency_id, permission_id)
  where organization_id is null;
create table if not exists public.agency_membership_permissions (
  agency_membership_id int not null references public.agency_memberships (agency_membership_id) on delete cascade,
  permission_id extensions.citext not null references public.permissions (permission_id) on delete cascade,
  agency_membership_permission_created_at timestamptz not null default current_timestamp,
  primary key (agency_membership_id, permission_id)
);
alter table public.agency_membership_permissions enable row level security;
revoke all on table public.agency_membership_permissions from anon, authenticated;
grant select, insert, update, delete on table public.agency_membership_permissions to anon, authenticated;
grant select, insert, update, delete on table public.agency_membership_permissions to service_role;
alter table public.agencies enable row level security;
alter table public.agency_memberships enable row level security;
alter table public.agencies_organizations_grants enable row level security;
revoke all on table public.agencies from anon, authenticated;
grant select on table public.agencies to anon, authenticated;
grant select, insert, update, delete on table public.agencies to service_role;
grant usage, select on sequence public.agencies_agency_id_seq to service_role;
revoke all on table public.agency_memberships from anon, authenticated;
grant select on table public.agency_memberships to anon, authenticated;
grant select, insert, update, delete on table public.agency_memberships to service_role;
grant usage, select on sequence public.agency_memberships_agency_membership_id_seq to service_role;
revoke all on table public.agencies_organizations_grants from anon, authenticated;
grant select on table public.agencies_organizations_grants to anon, authenticated;
grant select, insert, update, delete on table public.agencies_organizations_grants to service_role;
create or replace function public.email_has_password(email_to_check text)
  returns boolean
  language sql
  stable
  security definer
  set search_path to ''
  as $$
    select exists (
      select 1
      from auth.users u
      where lower(u.email) = lower(email_to_check)
        and u.encrypted_password is not null
        and u.encrypted_password <> ''
    );
  $$;
grant execute on function public.email_has_password(text) to anon, authenticated;
-- Anonymous lookup used by /auth/phone step-2 to surface the password field only when the
-- entered phone resolves to an account with a password set.
create or replace function public.phone_has_password(phone_to_check text, default_code text default '+56')
  returns boolean
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _canonical text;
      _result boolean;
    begin
      _canonical := public.phone_normalize(phone_to_check, default_code);
      if _canonical is null then
        return false;
      end if;
      select exists (
        select 1
        from auth.users u
        where u.phone = ltrim(_canonical, '+')
          and u.encrypted_password is not null
          and u.encrypted_password <> ''
      ) into _result;
      return _result;
    end;
  $$;
grant execute on function public.phone_has_password(text, text) to anon, authenticated;
-- ============================================================
-- viewer_* helpers
-- ============================================================
-- These are the app-layer API for "who is the caller". RLS policies should
-- prefer the `id in (select … from viewer_*_ids(…))` form over the `_validate`
-- helpers — the subquery is evaluated once per query (InitPlan) instead of per
-- row, which matters at scale.
--
-- Identity (from JWT — fast, no DB):
--   viewer_profile / viewer_profile_id  : current user's profile
create or replace function public.viewer_profile(strict boolean default false)
  returns setof public.profiles rows 1
  stable
  security definer
  parallel safe
  language plpgsql
  set search_path to ''
  as $$
    declare
      _user_id uuid;
    begin
      _user_id := public.viewer_profile_id();
      return query
        select * from public.profiles
        where profile_id = _user_id and profile_disabled_at is null
        limit 1;
      if not found and $1 is true then
        raise exception '[viewer_profile] not logged-in or profile not found for user_id: %', _user_id;
      end if;
    end;
  $$;
create or replace function public.viewer_tenant_ids()
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct t.tenant_id
    from public.organization_memberships m
    join public.organizations o using (organization_id)
    join public.tenants t using (tenant_id)
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and o.organization_disabled_at is null
      and t.tenant_disabled_at is null;
  $$;
create or replace function public.viewer_tenant_validate(tenant_id int)
  returns boolean
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1 from public.viewer_tenant_ids() vt
      where vt = viewer_tenant_validate.tenant_id
    );
  $$;
create or replace function public.viewer_organization_ids()
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select m.organization_id
    from public.organization_memberships m
    join public.organizations o using (organization_id)
    join public.tenants t using (tenant_id)
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and o.organization_disabled_at is null
      and t.tenant_disabled_at is null;
  $$;
create or replace function public.viewer_organization_validate(organization_id int)
  returns boolean
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1 from public.viewer_organization_ids() vo
      where vo = viewer_organization_validate.organization_id
    );
  $$;
-- Permission-based RLS helpers. SECURITY DEFINER so they bypass RLS on
-- organization_membership_permissions itself (otherwise SELECT-RLS on the very table we're checking
create or replace function public.viewer_permission_org_ids(permission_id extensions.citext)
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct m.organization_id
    from public.organization_membership_permissions mp
    join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and (mp.permission_id = viewer_permission_org_ids.permission_id or mp.permission_id = '*');
  $$;
create or replace function public.viewer_has_permission(
  organization_id int,
  permission_id extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1
      from public.organization_membership_permissions mp
      join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
      where m.organization_id = viewer_has_permission.organization_id
        and m.profile_id = (select public.viewer_profile_id())
        and m.organization_membership_accepted_at is not null
        and m.organization_membership_revoked_at is null
        and m.organization_membership_rejected_at is null
        and (mp.permission_id = viewer_has_permission.permission_id or mp.permission_id = '*')
    );
  $$;
-- Tenant-scoped permission helpers. There is no tenant-level membership table — tenant authority
-- rides on the organization grants of the orgs inside the tenant (the espejo org created by
-- protected.tenant_create is where `tenant_manage` is granted by default). Wildcard `*` is honored.
create or replace function public.viewer_permission_tenant_ids(permission_id extensions.citext)
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct o.tenant_id
    from public.organization_membership_permissions mp
    join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
    join public.organizations o on o.organization_id = m.organization_id
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and (mp.permission_id = viewer_permission_tenant_ids.permission_id or mp.permission_id = '*');
  $$;
create or replace function public.viewer_has_tenant_permission(
  tenant_id int,
  permission_id extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1
      from public.organization_membership_permissions mp
      join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
      join public.organizations o on o.organization_id = m.organization_id
      where o.tenant_id = viewer_has_tenant_permission.tenant_id
        and m.profile_id = (select public.viewer_profile_id())
        and m.organization_membership_accepted_at is not null
        and m.organization_membership_revoked_at is null
        and m.organization_membership_rejected_at is null
        and (mp.permission_id = viewer_has_tenant_permission.permission_id or mp.permission_id = '*')
    );
  $$;
create or replace function public.viewer_organization_membership_permissions()
  returns table (organization_id int, permission_id extensions.citext)
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select m.organization_id, mp.permission_id
    from public.organization_membership_permissions mp
    join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
    where m.profile_id = (select public.viewer_profile_id())
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null;
  $$;
-- Agency viewer helpers. JWT-only checks are fast (no DB lookup).
-- viewer_agency_permission_org_ids / viewer_has_agency_permission / viewer_agency_tenant_ids
-- use SECURITY DEFINER to bypass RLS on the grant tables they query.
create or replace function public.viewer_agency_ids()
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select af.agency_id
    from public.agency_memberships af
    join public.agencies a using (agency_id)
    where af.profile_id = (select public.viewer_profile_id())
      and af.agency_membership_accepted_at is not null
      and af.agency_membership_revoked_at is null
      and af.agency_membership_rejected_at is null
      and a.agency_disabled_at is null;
  $$;
create or replace function public.viewer_is_agency_member()
  returns boolean
  stable
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (select 1 from public.viewer_agency_ids());
  $$;
-- Returns org IDs where the viewer has the given permission via any of their agencies.
-- Covers: (1) explicit per-org grants, (2) global grants (org IS NULL) → all orgs.
-- Wildcard '*' honored throughout.
create or replace function public.viewer_agency_permission_org_ids(
  permission_id extensions.citext
)
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select aog.organization_id
    from public.agencies_organizations_grants aog
    where aog.agency_id in (select public.viewer_agency_ids())
      and aog.organization_id is not null
      and (aog.permission_id = viewer_agency_permission_org_ids.permission_id or aog.permission_id = '*')
    union
    select org.organization_id
    from public.organizations org
    where exists (
      select 1 from public.agencies_organizations_grants aog
      where aog.agency_id in (select public.viewer_agency_ids())
        and aog.organization_id is null
        and (aog.permission_id = viewer_agency_permission_org_ids.permission_id or aog.permission_id = '*')
    );
  $$;
create or replace function public.viewer_has_agency_permission(
  organization_id int,
  permission_id extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select viewer_has_agency_permission.organization_id in (
      select public.viewer_agency_permission_org_ids(viewer_has_agency_permission.permission_id)
    );
  $$;
-- Derives tenant IDs accessible via agency grants (tenants table has no organization_id).
create or replace function public.viewer_agency_tenant_ids()
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct org.tenant_id
    from public.organizations org
    where org.organization_id in (
      select public.viewer_agency_permission_org_ids('*')
    );
  $$;
create or replace function public.viewer_agencies()
  returns setof public.agencies
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select a.*
    from public.agencies a
    where a.agency_id in (select public.viewer_agency_ids());
  $$;
create or replace function public.viewer_agency_by_id(agency_id int)
  returns setof public.agencies rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select a.*
    from public.agencies a
    where a.agency_id = viewer_agency_by_id.agency_id
      and a.agency_id in (select public.viewer_agency_ids())
    limit 1;
  $$;
create or replace function public.viewer_agency_by_slug(agency_slug text)
  returns setof public.agencies rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select a.*
    from public.agencies a
    where a.agency_slug = viewer_agency_by_slug.agency_slug
      and a.agency_id in (select public.viewer_agency_ids())
    limit 1;
  $$;
-- Team roster for an agency: every membership (accepted, pending, revoked,
-- rejected) with the member's display name and login email. The plain
create or replace function public.viewer_agency_team(agency_id int)
  returns table (
    agency_membership_id int,
    profile_id uuid,
    agency_membership_accepted_at timestamptz,
    agency_membership_revoked_at timestamptz,
    agency_membership_rejected_at timestamptz,
    agency_membership_created_at timestamptz,
    profile_name_full text,
    email text
  )
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select
      m.agency_membership_id,
      m.profile_id,
      m.agency_membership_accepted_at,
      m.agency_membership_revoked_at,
      m.agency_membership_rejected_at,
      m.agency_membership_created_at,
      p.profile_name_full,
      u.email::text
    from public.agency_memberships m
    join public.profiles p using (profile_id)
    left join auth.users u on u.id = m.profile_id
    where m.agency_id = viewer_agency_team.agency_id
      and viewer_agency_team.agency_id in (select public.viewer_agency_ids())
    order by m.agency_membership_created_at asc;
  $$;
-- External-access picker for an organization's admins: every enabled agency with
create or replace function public.viewer_organization_external_agencies(organization_id int)
  returns table (
    agency_id int,
    agency_name text,
    agency_slug text,
    active_affiliates int,
    granted_here boolean,
    is_global boolean
  )
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select
      a.agency_id,
      a.agency_name,
      a.agency_slug,
      coalesce(m.active_count, 0)::int as active_affiliates,
      coalesce(gh.granted, false) as granted_here,
      coalesce(gg.granted, false) as is_global
    from public.agencies a
    left join lateral (
      select count(*) as active_count
      from public.agency_memberships am
      where am.agency_id = a.agency_id
        and am.agency_membership_accepted_at is not null
        and am.agency_membership_revoked_at is null
        and am.agency_membership_rejected_at is null
    ) m on true
    left join lateral (
      select true as granted
      from public.agencies_organizations_grants g
      where g.agency_id = a.agency_id
        and g.organization_id = viewer_organization_external_agencies.organization_id
      limit 1
    ) gh on true
    left join lateral (
      select true as granted
      from public.agencies_organizations_grants g
      where g.agency_id = a.agency_id
        and g.organization_id is null
        and g.permission_id = '*'
      limit 1
    ) gg on true
    where a.agency_disabled_at is null
      and public.viewer_has_permission(
        viewer_organization_external_agencies.organization_id, 'organization_manage')
    order by a.agency_name asc;
  $$;
drop policy if exists "agencies select by affiliates" on public.agencies;
create policy "agencies select by affiliates"
  on public.agencies for select to authenticated
  using (agency_id in (select public.viewer_agency_ids()));
drop policy if exists "agency_memberships select own" on public.agency_memberships;
create policy "agency_memberships select own"
  on public.agency_memberships for select to authenticated
  using (profile_id = (select public.viewer_profile_id()));
drop policy if exists "agencies_organizations_grants select" on public.agencies_organizations_grants;
create policy "agencies_organizations_grants select"
  on public.agencies_organizations_grants for select to authenticated
  using (
    agency_id in (select public.viewer_agency_ids())
    or organization_id in (select public.viewer_permission_org_ids('organization_manage'))
  );
create or replace function public.viewer_agency_team_permission_ids(permission_id extensions.citext)
  returns setof int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select distinct m.agency_id
    from public.agency_membership_permissions mp
    join public.agency_memberships m on m.agency_membership_id = mp.agency_membership_id
    join public.agencies a on a.agency_id = m.agency_id
    where m.profile_id = (select public.viewer_profile_id())
      and m.agency_membership_accepted_at is not null
      and m.agency_membership_revoked_at is null
      and m.agency_membership_rejected_at is null
      and a.agency_disabled_at is null
      and (mp.permission_id = viewer_agency_team_permission_ids.permission_id or mp.permission_id = '*');
  $$;
create or replace function public.viewer_has_agency_team_permission(
  agency_id int,
  permission_id extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select viewer_has_agency_team_permission.agency_id in (
      select public.viewer_agency_team_permission_ids(viewer_has_agency_team_permission.permission_id)
    );
  $$;
-- Resolve a membership's agency, bypassing the own-row-only RLS on agency_memberships.
create or replace function public.agency_id_of_membership(agency_membership_id int)
  returns int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select m.agency_id
    from public.agency_memberships m
    where m.agency_membership_id = agency_id_of_membership.agency_membership_id;
  $$;
-- True iff the agency has at least one OTHER active affiliate holding
-- `agency_members_manage` or `*`. Guards against removing the last team admin.
create or replace function public.agency_has_other_active_admin(
  _agency_id int,
  _excluded_agency_membership_id int
) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select exists (
    select 1
    from public.agency_memberships m
    join public.agency_membership_permissions mp on mp.agency_membership_id = m.agency_membership_id
    where m.agency_id = _agency_id
      and m.agency_membership_id <> _excluded_agency_membership_id
      and m.agency_membership_accepted_at is not null
      and m.agency_membership_revoked_at is null
      and m.agency_membership_rejected_at is null
      and mp.permission_id in ('agency_members_manage', '*')
  );
$$;
revoke execute on function public.agency_has_other_active_admin(int, int) from public;
grant execute on function public.agency_has_other_active_admin(int, int) to authenticated;
create or replace function public.agency_membership_permissions_protect_last_admin()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  _agency_id int;
begin
  if public.viewer_profile_id() is null then
    return old;
  elsif old.permission_id not in ('agency_members_manage', '*') then
    return old;
  end if;
  select agency_id into _agency_id
  from public.agency_memberships
  where agency_membership_id = old.agency_membership_id;
  if exists (
    select 1 from public.agency_membership_permissions
    where agency_membership_id = old.agency_membership_id
      and permission_id in ('agency_members_manage', '*')
      and permission_id <> old.permission_id
  ) then
    return old;
  end if;
  if not public.agency_has_other_active_admin(_agency_id, old.agency_membership_id) then
    raise exception 'last_admin_protected'
      using hint = 'cannot revoke the last admin permission in the agency';
  end if;
  return old;
end;
$$;
drop trigger if exists agency_membership_permissions_trigger_protect_last_admin on public.agency_membership_permissions;
create trigger agency_membership_permissions_trigger_protect_last_admin
  before delete on public.agency_membership_permissions
  for each row execute procedure public.agency_membership_permissions_protect_last_admin();
drop policy if exists "agency_membership_permissions select by co-members" on public.agency_membership_permissions;
create policy "agency_membership_permissions select by co-members"
  on public.agency_membership_permissions for select
  to authenticated
  using (
    public.agency_id_of_membership(agency_membership_id) in (select public.viewer_agency_ids())
  );
drop policy if exists "agency_membership_permissions write with agency_members_manage" on public.agency_membership_permissions;
create policy "agency_membership_permissions write with agency_members_manage"
  on public.agency_membership_permissions for all
  to authenticated
  using (
    public.agency_id_of_membership(agency_membership_id)
      in (select public.viewer_agency_team_permission_ids('agency_members_manage'))
  )
  with check (
    public.agency_id_of_membership(agency_membership_id)
      in (select public.viewer_agency_team_permission_ids('agency_members_manage'))
  );
grant insert, update, delete on table public.agencies_organizations_grants to anon, authenticated;
drop policy if exists "agencies_organizations_grants write with organization_manage" on public.agencies_organizations_grants;
create policy "agencies_organizations_grants write with organization_manage"
  on public.agencies_organizations_grants for all
  to authenticated
  using (organization_id in (select public.viewer_permission_org_ids('organization_manage')))
  with check (organization_id in (select public.viewer_permission_org_ids('organization_manage')));
drop view if exists public.tenants_organizations_profiles;
create view public.tenants_organizations_profiles as
  select
    t.tenant_id,
    t.tenant_slug,
    t.tenant_name,
    t.tenant_disabled_at,
    t.tenant_created_at,
    t.tenant_updated_at,
    o.organization_id,
    o.tenant_id as organization_tenant_id,
    o.organization_slug,
    o.organization_name,
    o.organization_disabled_at,
    o.organization_created_at,
    o.organization_updated_at,
    m.profile_id
  from public.organization_memberships m
  join public.organizations o using (organization_id)
  join public.tenants t using (tenant_id)
  where m.profile_id = public.viewer_profile_id()
    and m.organization_membership_accepted_at is not null
    and m.organization_membership_revoked_at is null
    and m.organization_membership_rejected_at is null
    and o.organization_disabled_at is null
    and t.tenant_disabled_at is null;
revoke all on public.tenants_organizations_profiles from anon, authenticated;
grant select on public.tenants_organizations_profiles to authenticated;
create view public.user_sessions with (security_invoker = true, security_barrier = true) as (
  select
    s.id,
    s.user_id,
    s.user_agent,
    s.ip::text as ip,
    s.created_at,
    s.refreshed_at,
    s.not_after
  from auth.sessions as s
);
revoke all on public.user_sessions from anon, authenticated;
grant select on public.user_sessions to anon, authenticated;
comment on view public.user_sessions is e'@graphql({"primary_key_columns": ["id"]})';
create or replace function public.viewer_sessions()
  returns setof public.user_sessions
  stable
  security definer
  language sql
  set search_path to ''
  as $$
    select s.*
    from public.user_sessions as s
    where s.user_id = (select auth.uid())
    order by s.refreshed_at desc nulls last;
  $$;
create or replace function public.revoke_session(session_id auth.sessions.id%type)
  returns void
  security definer
  language sql
  set search_path to ''
  as $$
    delete from auth.sessions s
    where s.id = revoke_session.session_id
      and s.user_id = auth.uid();
  $$;
create or replace function public.viewer_tenants()
  returns setof public.tenants
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select t.*
    from public.tenants t
    where t.tenant_id in (select tenant_id from public.tenants_organizations_profiles);
  $$;
create or replace function public.viewer_organizations()
  returns setof public.organizations
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select o.*
    from public.organizations o
    where o.organization_id in (select organization_id from public.tenants_organizations_profiles);
  $$;
create or replace function public.viewer_tenant_by_id(tenant_id int)
  returns setof public.tenants rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select t.*
    from public.tenants t
    where t.tenant_id = viewer_tenant_by_id.tenant_id
      and t.tenant_id in (select tenant_id from public.tenants_organizations_profiles)
    limit 1;
  $$;
create or replace function public.viewer_tenant_by_slug(tenant_slug text)
  returns setof public.tenants rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select t.*
    from public.tenants t
    where t.tenant_slug = viewer_tenant_by_slug.tenant_slug
      and t.tenant_id in (select tenant_id from public.tenants_organizations_profiles)
    limit 1;
  $$;
create or replace function public.viewer_organization_by_id(organization_id int)
  returns setof public.organizations rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select o.*
    from public.organizations o
    where o.organization_id = viewer_organization_by_id.organization_id
      and o.organization_id in (select organization_id from public.tenants_organizations_profiles)
    limit 1;
  $$;
-- ============================================================
-- profiles SELECT policy (now that organization_memberships exists)
-- ============================================================
-- Profiles are visible to: self, organization co-members, and agency affiliates with access.
drop policy if exists "Users can select their own profiles." on public.profiles;
drop policy if exists "Profiles visible to self or tenant co-members or concierge" on public.profiles;
drop policy if exists "Profiles visible to self or org co-members or concierge" on public.profiles;
create policy "Profiles visible to self or org co-members or agency affiliates"
  on public.profiles for select
  to authenticated
  using (
    profile_disabled_at is null
    and (
      profile_id = (select public.viewer_profile_id())
      or exists (
        select 1
        from public.organization_memberships me
        join public.organization_memberships them using (organization_id)
        where me.profile_id = (select public.viewer_profile_id())
          and them.profile_id = public.profiles.profile_id
          and me.organization_membership_accepted_at is not null
          and me.organization_membership_revoked_at is null
          and me.organization_membership_rejected_at is null
          and them.organization_membership_accepted_at is not null
          and them.organization_membership_revoked_at is null
          and them.organization_membership_rejected_at is null
      )
      or exists (
        select 1 from public.organization_memberships m
        where m.profile_id = public.profiles.profile_id
          and m.organization_id in (select public.viewer_agency_permission_org_ids('*'))
      )
    )
  );
-- ============================================================
-- RLS policies for tenants + organizations + organization_memberships + permissions
-- ============================================================
alter table public.tenants enable row level security;
revoke all on table public.tenants from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, update on table public.tenants to anon, authenticated;
grant select, insert, update, delete on table public.tenants to service_role;
grant usage, select on sequence public.tenants_tenant_id_seq to service_role;
drop policy if exists "tenants select by members or concierge" on public.tenants;
drop policy if exists "tenants select by members or agency affiliates" on public.tenants;
create policy "tenants select by members or agency affiliates"
  on public.tenants for select
  to authenticated
  using (
    tenant_id in (select public.viewer_tenant_ids())
    or tenant_id in (select public.viewer_agency_tenant_ids())
  );
drop policy if exists "tenants update by owner" on public.tenants;
drop policy if exists "tenants update with organization_manage" on public.tenants;
drop policy if exists "tenants update with tenant_manage" on public.tenants;
create policy "tenants update with tenant_manage"
  on public.tenants for update
  to authenticated
  using (tenant_id in (select public.viewer_permission_tenant_ids('tenant_manage')))
  with check (tenant_id in (select public.viewer_permission_tenant_ids('tenant_manage')));
alter table public.organizations enable row level security;
revoke all on table public.organizations from anon, authenticated;
grant select, update on table public.organizations to anon, authenticated;
grant select, insert, update, delete on table public.organizations to service_role;
grant usage, select on sequence public.organizations_organization_id_seq to service_role;
drop policy if exists "organizations select by members or concierge" on public.organizations;
drop policy if exists "organizations select by members or agency affiliates" on public.organizations;
create policy "organizations select by members or agency affiliates"
  on public.organizations for select
  to authenticated
  using (
    organization_id in (select public.viewer_organization_ids())
    or organization_id in (select public.viewer_agency_permission_org_ids('*'))
  );
drop policy if exists "organizations update by owner" on public.organizations;
drop policy if exists "organizations update with organization_manage" on public.organizations;
create policy "organizations update with organization_manage"
  on public.organizations for update
  to authenticated
  using (organization_id in (select public.viewer_permission_org_ids('organization_manage')));
alter table public.organization_memberships enable row level security;
revoke all on table public.organization_memberships from anon, authenticated;
grant select, insert, update, delete on table public.organization_memberships to anon, authenticated;
grant select, insert, update, delete on table public.organization_memberships to service_role;
grant usage, select on sequence public.organization_memberships_organization_membership_id_seq to service_role;
drop policy if exists "organization_memberships select by co-members" on public.organization_memberships;
drop policy if exists "organization_memberships select by co-members or agency affiliates" on public.organization_memberships;
create policy "organization_memberships select by co-members or agency affiliates"
  on public.organization_memberships for select
  to authenticated
  using (
    organization_id in (select public.viewer_organization_ids())
    or organization_id in (select public.viewer_agency_permission_org_ids('*'))
  );
drop policy if exists "organization_memberships write with members_manage" on public.organization_memberships;
create policy "organization_memberships write with members_manage"
  on public.organization_memberships for all
  to authenticated
  using (organization_id in (select public.viewer_permission_org_ids('members_manage')))
  with check (organization_id in (select public.viewer_permission_org_ids('members_manage')));
alter table public.permissions enable row level security;
revoke all on table public.permissions from anon, authenticated;
grant select on table public.permissions to anon, authenticated;
grant select, insert, update, delete on table public.permissions to service_role;
drop policy if exists "permissions select to all authenticated" on public.permissions;
create policy "permissions select to all authenticated"
  on public.permissions for select
  to authenticated
  using (true);
alter table public.organization_membership_permissions enable row level security;
revoke all on table public.organization_membership_permissions from anon, authenticated;
grant select, insert, update, delete on table public.organization_membership_permissions to anon, authenticated;
grant select, insert, update, delete on table public.organization_membership_permissions to service_role;
drop policy if exists "organization_membership_permissions select by co-members" on public.organization_membership_permissions;
drop policy if exists "organization_membership_permissions select by co-members or agency affiliates" on public.organization_membership_permissions;
create policy "organization_membership_permissions select by co-members or agency affiliates"
  on public.organization_membership_permissions for select
  to authenticated
  using (
    exists (
      select 1 from public.organization_memberships m
      where m.organization_membership_id = public.organization_membership_permissions.organization_membership_id
        and (
          m.organization_id in (select public.viewer_organization_ids())
          or m.organization_id in (select public.viewer_agency_permission_org_ids('*'))
        )
    )
  );
drop policy if exists "organization_membership_permissions write with members_manage" on public.organization_membership_permissions;
create policy "organization_membership_permissions write with members_manage"
  on public.organization_membership_permissions for all
  to authenticated
  using (
    exists (
      select 1 from public.organization_memberships m
      where m.organization_membership_id = public.organization_membership_permissions.organization_membership_id
        and m.organization_id in (select public.viewer_permission_org_ids('members_manage'))
    )
  )
  with check (
    exists (
      select 1 from public.organization_memberships m
      where m.organization_membership_id = public.organization_membership_permissions.organization_membership_id
        and m.organization_id in (select public.viewer_permission_org_ids('members_manage'))
    )
  );
create or replace function public.org_has_other_active_admin(
  _organization_id int,
  _excluded_organization_membership_id int
) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select exists (
    select 1
    from public.organization_memberships m
    join public.organization_membership_permissions mp on mp.organization_membership_id = m.organization_membership_id
    where m.organization_id = _organization_id
      and m.organization_membership_id <> _excluded_organization_membership_id
      and m.profile_id is not null
      and m.organization_membership_accepted_at is not null
      and m.organization_membership_revoked_at is null
      and m.organization_membership_rejected_at is null
      and mp.permission_id in ('members_manage', '*')
  );
$$;
revoke execute on function public.org_has_other_active_admin(int, int) from public;
grant execute on function public.org_has_other_active_admin(int, int) to authenticated;
create or replace function public.organization_membership_permissions_protect_last_admin()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  _organization_id int;
  _profile_id uuid;
begin
  -- service_role bypass: auth.uid() is NULL when called outside an authenticated session.
  if public.viewer_profile_id() is null then
    return old;
  elsif old.permission_id not in ('members_manage', '*') then
    return old;
  end if;
  select organization_id, profile_id into _organization_id, _profile_id
  from public.organization_memberships
  where organization_membership_id = old.organization_membership_id;
  if _profile_id is null then
    return old;
  elsif exists (
    select 1 from public.organization_membership_permissions
    where organization_membership_id = old.organization_membership_id
      and permission_id in ('members_manage', '*')
      and permission_id <> old.permission_id
  ) then
    return old;
  end if;
  if not public.org_has_other_active_admin(_organization_id, old.organization_membership_id) then
    raise exception 'last_admin_protected'
      using hint = 'cannot revoke the last admin permission in the organization';
  end if;
  return old;
end;
$$;
drop trigger if exists organization_membership_permissions_trigger_protect_last_admin on public.organization_membership_permissions;
create trigger organization_membership_permissions_trigger_protect_last_admin
  before delete on public.organization_membership_permissions
  for each row execute procedure public.organization_membership_permissions_protect_last_admin();
create or replace function public.organization_memberships_protect_revoke()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  _viewer uuid;
begin
  -- Only fire when revoked_at transitions from NULL → not NULL.
  if old.organization_membership_revoked_at is not null or new.organization_membership_revoked_at is null then
    return new;
  end if;
  _viewer := public.viewer_profile_id();
  -- service_role bypass.
  if _viewer is null then
    return new;
  end if;
  -- Self-remove: caller cannot revoke their own organization_membership row.
  if new.profile_id is not null and new.profile_id = _viewer then
    raise exception 'self_remove_blocked'
      using hint = 'cannot revoke your own organization_membership';
  elsif new.profile_id is not null
     and not public.org_has_other_active_admin(new.organization_id, new.organization_membership_id) then
    raise exception 'last_admin_protected'
      using hint = 'cannot revoke the last admin of the organization';
  end if;
  return new;
end;
$$;
drop trigger if exists organization_memberships_trigger_protect_revoke on public.organization_memberships;
create trigger organization_memberships_trigger_protect_revoke
  before update of organization_membership_revoked_at on public.organization_memberships
  for each row execute procedure public.organization_memberships_protect_revoke();
alter table public.permission_presets enable row level security;
revoke all on table public.permission_presets from anon, authenticated;
grant select, insert, update, delete on table public.permission_presets to anon, authenticated;
grant select, insert, update, delete on table public.permission_presets to service_role;
grant usage, select on sequence public.permission_presets_permission_preset_id_seq to service_role;
drop policy if exists "permission_presets select globals or own org" on public.permission_presets;
drop policy if exists "permission_presets select globals or own org or agency affiliates" on public.permission_presets;
create policy "permission_presets select globals or own org or agency affiliates"
  on public.permission_presets for select
  to authenticated
  using (
    organization_id is null
    or organization_id in (select public.viewer_organization_ids())
    or organization_id in (select public.viewer_agency_permission_org_ids('*'))
  );
drop policy if exists "permission_presets write with presets_manage" on public.permission_presets;
create policy "permission_presets write with presets_manage"
  on public.permission_presets for all
  to authenticated
  using (
    organization_id is not null
    and organization_id in (select public.viewer_permission_org_ids('presets_manage'))
  )
  with check (
    organization_id is not null
    and organization_id in (select public.viewer_permission_org_ids('presets_manage'))
  );
create or replace function public.user_auth_hook(event jsonb)
  returns jsonb
  language plpgsql
  stable
  parallel safe
  set search_path to ''
  as $$
    begin
      -- Only the subject (profile_id, carried as the `sub` claim) lives in the JWT.
      -- Tenant / organization / agency organization_membership and onboarding state are resolved at
      -- query time via the viewer_* helpers (which hit the DB directly), never embedded
      -- in the token. Pass the event through unchanged.
      return event;
    end;
  $$;
revoke execute on function public.user_auth_hook(jsonb) from authenticated, anon, public;
grant execute on function public.user_auth_hook(jsonb) to supabase_auth_admin;
-- supabase_auth_admin only needs USAGE on public to call the (now pass-through) hook.
grant usage on schema public to supabase_auth_admin;
-- ============================================================
-- addresses hierarchy
-- level0 = country  (ISO 3166-1 alpha-2)
-- level1 = region   (ISO 3166-2, 5–6 chars)
-- level2 = province (slug)
-- level3 = commune  (slug)
-- ============================================================
create table if not exists public.addresses_level0 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level0_name text not null check (length(address_level0_name) <= 100),
  address_level0_emoji text check (char_length(address_level0_emoji) between 1 and 8),
  address_level0_disabled_at timestamptz,
  address_level0_hidden_at timestamptz,
  address_level0_created_at timestamptz not null default current_timestamp,
  address_level0_updated_at timestamptz not null default current_timestamp,
  primary key (address_level0_id)
);
comment on column public.addresses_level0.address_level0_id is e'ISO 3166-1 alpha-2 country code';
create index if not exists addresses_level0_disabled_at_idx
  on public.addresses_level0 (address_level0_disabled_at)
  where address_level0_disabled_at is not null;
create index if not exists addresses_level0_hidden_at_idx
  on public.addresses_level0 (address_level0_hidden_at)
  where address_level0_hidden_at is not null;
create index if not exists addresses_level0_name_idx
  on public.addresses_level0 (address_level0_name asc nulls last);
drop trigger if exists handle_addresses_level0_updated_at on public.addresses_level0;
create trigger handle_addresses_level0_updated_at
  before update on public.addresses_level0
  for each row execute procedure extensions.moddatetime(address_level0_updated_at);
revoke all on table public.addresses_level0 from anon, authenticated;
grant select on table public.addresses_level0 to anon, authenticated;
alter table public.addresses_level0 enable row level security;
drop policy if exists "Anyone can select addresses_level0." on public.addresses_level0;
create policy "Anyone can select addresses_level0."
  on public.addresses_level0 for select
  using (address_level0_disabled_at is null);
create table if not exists public.addresses_level1 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level1_id text not null check (length(address_level1_id) = 5 or length(address_level1_id) = 6),
  address_level1_name text not null check (length(address_level1_name) <= 100),
  address_level1_disabled_at timestamptz,
  address_level1_hidden_at timestamptz,
  address_level1_created_at timestamptz not null default current_timestamp,
  address_level1_updated_at timestamptz not null default current_timestamp,
  primary key (address_level0_id, address_level1_id),
  constraint fk_addresses_level1_addresses_level0 foreign key (address_level0_id)
    references public.addresses_level0 (address_level0_id) on delete no action
);
comment on column public.addresses_level1.address_level1_id is e'ISO 3166-2 code';
create index if not exists addresses_level1_disabled_at_idx
  on public.addresses_level1 (address_level1_disabled_at)
  where address_level1_disabled_at is not null;
create index if not exists addresses_level1_hidden_at_idx
  on public.addresses_level1 (address_level1_hidden_at)
  where address_level1_hidden_at is not null;
create index if not exists addresses_level1_name_idx
  on public.addresses_level1 (address_level1_name asc nulls last);
create index if not exists addresses_level1_level0_idx
  on public.addresses_level1 (address_level0_id);
drop trigger if exists handle_addresses_level1_updated_at on public.addresses_level1;
create trigger handle_addresses_level1_updated_at
  before update on public.addresses_level1
  for each row execute procedure extensions.moddatetime(address_level1_updated_at);
revoke all on table public.addresses_level1 from anon, authenticated;
grant select on table public.addresses_level1 to anon, authenticated;
alter table public.addresses_level1 enable row level security;
drop policy if exists "Anyone can select addresses_level1." on public.addresses_level1;
create policy "Anyone can select addresses_level1."
  on public.addresses_level1 for select
  using (address_level1_disabled_at is null);
create table if not exists public.addresses_level2 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level1_id text not null check (length(address_level1_id) = 5 or length(address_level1_id) = 6),
  address_level2_id text not null check (length(address_level2_id) <= 100),
  address_level2_name text not null check (length(address_level2_name) <= 100),
  address_level2_disabled_at timestamptz,
  address_level2_hidden_at timestamptz,
  address_level2_created_at timestamptz not null default current_timestamp,
  address_level2_updated_at timestamptz not null default current_timestamp,
  primary key (address_level0_id, address_level1_id, address_level2_id),
  constraint fk_addresses_level2_addresses_level1 foreign key (address_level0_id, address_level1_id)
    references public.addresses_level1 (address_level0_id, address_level1_id) on delete no action
);
comment on column public.addresses_level2.address_level2_id is e'Slug';
create index if not exists addresses_level2_disabled_at_idx
  on public.addresses_level2 (address_level2_disabled_at)
  where address_level2_disabled_at is not null;
create index if not exists addresses_level2_hidden_at_idx
  on public.addresses_level2 (address_level2_hidden_at)
  where address_level2_hidden_at is not null;
create index if not exists addresses_level2_name_idx
  on public.addresses_level2 (address_level2_name asc nulls last);
create index if not exists addresses_level2_level1_idx
  on public.addresses_level2 (address_level0_id, address_level1_id);
drop trigger if exists handle_addresses_level2_updated_at on public.addresses_level2;
create trigger handle_addresses_level2_updated_at
  before update on public.addresses_level2
  for each row execute procedure extensions.moddatetime(address_level2_updated_at);
revoke all on table public.addresses_level2 from anon, authenticated;
grant select on table public.addresses_level2 to anon, authenticated;
alter table public.addresses_level2 enable row level security;
drop policy if exists "Anyone can select addresses_level2." on public.addresses_level2;
create policy "Anyone can select addresses_level2."
  on public.addresses_level2 for select
  using (address_level2_disabled_at is null);
create table if not exists public.addresses_level3 (
  address_level0_id text not null check (length(address_level0_id) = 2),
  address_level1_id text not null check (length(address_level1_id) = 5 or length(address_level1_id) = 6),
  address_level2_id text not null check (length(address_level2_id) <= 100),
  address_level3_id text not null check (length(address_level3_id) <= 100),
  address_level3_name text not null check (length(address_level3_name) <= 100),
  address_level3_disabled_at timestamptz,
  address_level3_hidden_at timestamptz,
  address_level3_created_at timestamptz not null default current_timestamp,
  address_level3_updated_at timestamptz not null default current_timestamp,
  primary key (address_level0_id, address_level1_id, address_level2_id, address_level3_id),
  constraint fk_addresses_level3_addresses_level2 foreign key (address_level0_id, address_level1_id, address_level2_id)
    references public.addresses_level2 (address_level0_id, address_level1_id, address_level2_id) on delete no action
);
create index if not exists addresses_level3_disabled_at_idx
  on public.addresses_level3 (address_level3_disabled_at)
  where address_level3_disabled_at is not null;
create index if not exists addresses_level3_hidden_at_idx
  on public.addresses_level3 (address_level3_hidden_at)
  where address_level3_hidden_at is not null;
create index if not exists addresses_level3_name_idx
  on public.addresses_level3 (address_level3_name asc nulls last);
create index if not exists addresses_level3_level2_idx
  on public.addresses_level3 (address_level0_id, address_level1_id, address_level2_id);
drop trigger if exists handle_addresses_level3_updated_at on public.addresses_level3;
create trigger handle_addresses_level3_updated_at
  before update on public.addresses_level3
  for each row execute procedure extensions.moddatetime(address_level3_updated_at);
revoke all on table public.addresses_level3 from anon, authenticated;
grant select on table public.addresses_level3 to anon, authenticated;
alter table public.addresses_level3 enable row level security;
drop policy if exists "Anyone can select addresses_level3." on public.addresses_level3;
create policy "Anyone can select addresses_level3."
  on public.addresses_level3 for select
  using (address_level3_disabled_at is null);
do $$ begin
  create type public.profile_identity_document_kind as enum ('nin', 'passport');
exception when duplicate_object then null; end $$;
create or replace function internal.profile_identity_value_normalize(
  country text,
  kind public.profile_identity_document_kind,
  value text
) returns text
  language plpgsql
  immutable
  parallel safe
  set search_path to ''
  as $$
    declare
      _stripped text;
    begin
      if value is null then
        return null;
      end if;
      _stripped := upper(regexp_replace(value, '[^0-9a-zA-Z]', '', 'g'));
      _stripped := regexp_replace(_stripped, '^0+', '', '');
      if _stripped = '' or char_length(_stripped) < 4 or char_length(_stripped) > 32 then
        return null;
      end if;
      if country = 'CL' and kind = 'nin' and not public.cl_rut_validate(_stripped) then
        return null;
      end if;
      return _stripped;
    end;
  $$;
create table if not exists public.profile_identities (
  profile_identity_id uuid not null primary key default internal.uuid_generate_v7(),
  profile_id uuid not null references public.profiles(profile_id) on delete cascade,
  address_level0_id text not null references public.addresses_level0(address_level0_id),
  profile_identity_document_kind public.profile_identity_document_kind not null,
  profile_identity_document_value text not null check (char_length(profile_identity_document_value) between 4 and 32),
  profile_identity_disabled_at timestamptz,
  profile_identity_created_at timestamptz not null default current_timestamp,
  profile_identity_updated_at timestamptz not null default current_timestamp,
  unique (profile_id, address_level0_id, profile_identity_document_kind)
);
create unique index if not exists profile_identities_global_unique_idx
  on public.profile_identities (
    address_level0_id, profile_identity_document_kind, profile_identity_document_value
  ) where profile_identity_disabled_at is null;
create index if not exists profile_identities_profile_idx
  on public.profile_identities (profile_id)
  where profile_identity_disabled_at is null;
drop trigger if exists handle_profile_identities_updated_at on public.profile_identities;
create trigger handle_profile_identities_updated_at
  before update on public.profile_identities
  for each row execute procedure extensions.moddatetime(profile_identity_updated_at);
create or replace function internal.profile_identities_normalize_value()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    declare
      _normalized text;
    begin
      _normalized := internal.profile_identity_value_normalize(
        NEW.address_level0_id,
        NEW.profile_identity_document_kind,
        NEW.profile_identity_document_value
      );
      if _normalized is null then
        raise exception 'Invalid % document value for %: %',
          NEW.profile_identity_document_kind,
          NEW.address_level0_id,
          NEW.profile_identity_document_value;
      end if;
      NEW.profile_identity_document_value := _normalized;
      return NEW;
    end;
  $$;
drop trigger if exists profile_identities_trigger_normalize_value on public.profile_identities;
create trigger profile_identities_trigger_normalize_value
  before insert or update of profile_identity_document_value, address_level0_id, profile_identity_document_kind
  on public.profile_identities
  for each row execute procedure internal.profile_identities_normalize_value();
alter table public.profile_identities enable row level security;
revoke all on table public.profile_identities from anon, authenticated;
-- anon is required for graphql; RLS still gates row access.
grant select, insert, update on table public.profile_identities to anon, authenticated;
-- SELECT: owner + admins with members_manage in orgs where the owner is a member, + agency affiliates.
-- HR sees the documents of the employees they administer (needed for payroll/contracts).
drop policy if exists "profile_identities select" on public.profile_identities;
create policy "profile_identities select"
  on public.profile_identities for select
  to authenticated
  using (
    profile_id = (select public.viewer_profile_id())
    or exists (
      select 1 from public.organization_memberships m
      where m.profile_id = public.profile_identities.profile_id
        and m.organization_id in (select public.viewer_permission_org_ids('members_manage'))
    )
    or exists (
      select 1 from public.organization_memberships m
      where m.profile_id = public.profile_identities.profile_id
        and m.organization_id in (select public.viewer_agency_permission_org_ids('*'))
    )
  );
drop policy if exists "profile_identities write own" on public.profile_identities;
create policy "profile_identities write own"
  on public.profile_identities for all
  to authenticated
  using (profile_id = (select public.viewer_profile_id()))
  with check (profile_id = (select public.viewer_profile_id()));
create or replace function public.profile_identity_resolve(
  country text,
  kind public.profile_identity_document_kind,
  value text
) returns uuid
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _normalized text;
      _result uuid;
    begin
      _normalized := internal.profile_identity_value_normalize(country, kind, value);
      if _normalized is null then
        return null;
      end if;
      select profile_id into _result
      from public.profile_identities
      where address_level0_id = country
        and profile_identity_document_kind = kind
        and profile_identity_document_value = _normalized
        and profile_identity_disabled_at is null
      limit 1;
      return _result;
    end;
  $$;
grant execute on function public.profile_identity_resolve(text, public.profile_identity_document_kind, text) to anon, authenticated;
-- ============================================================
-- tenant tier + custom domains
-- ============================================================
-- A tenant may have many domains (apex + subdomains, staging hosts, etc).
-- Each domain is globally unique.
do $$ begin
  create type public.tenant_tier as enum ('free', 'pro', 'enterprise');
exception when duplicate_object then null; end $$;
alter table public.tenants
  add column if not exists tenant_tier public.tenant_tier not null default 'free';
create table if not exists public.tenant_domains (
  tenant_id int not null references public.tenants (tenant_id) on delete cascade,
  domain_value extensions.citext not null check (char_length(domain_value) between 3 and 253),
  domain_verified_at timestamptz,
  domain_created_at timestamptz not null default current_timestamp,
  domain_updated_at timestamptz not null default current_timestamp,
  primary key (tenant_id, domain_value),
  unique (domain_value)
);
drop trigger if exists handle_tenant_domains_updated_at on public.tenant_domains;
create trigger handle_tenant_domains_updated_at
  before update on public.tenant_domains
  for each row execute procedure extensions.moddatetime(domain_updated_at);
alter table public.tenant_domains enable row level security;
revoke all on table public.tenant_domains from anon, authenticated;
grant select, insert, update, delete on table public.tenant_domains to anon, authenticated;
drop policy if exists "tenant_domains select by members" on public.tenant_domains;
create policy "tenant_domains select by members"
  on public.tenant_domains for select to authenticated
  using (tenant_id in (select public.viewer_tenant_ids()));
drop policy if exists "tenant_domains write by owner" on public.tenant_domains;
drop policy if exists "tenant_domains write with organization_manage" on public.tenant_domains;
create policy "tenant_domains write with organization_manage"
  on public.tenant_domains for all to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.tenant_id = public.tenant_domains.tenant_id
        and o.organization_id in (select public.viewer_permission_org_ids('organization_manage'))
    )
  );
grant select on table public.tenant_domains to supabase_auth_admin;
drop policy if exists "Allow auth admin to read tenant_domains." on public.tenant_domains;
create policy "Allow auth admin to read tenant_domains."
  on public.tenant_domains as permissive for select to supabase_auth_admin using (true);
create or replace function public.viewer_organization_membership_pending()
  returns setof public.organization_memberships
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _user_id uuid := public.viewer_profile_id();
      _email extensions.citext;
      _phone text;
    begin
      if _user_id is null then
        return;
      end if;
      select lower(u.email)::extensions.citext, nullif('+' || u.phone, '+')
        into _email, _phone
        from auth.users u
        where u.id = _user_id;
      return query
        select m.*
        from public.organization_memberships m
        where m.profile_id is null
          and m.organization_membership_accepted_at is null
          and m.organization_membership_rejected_at is null
          and m.organization_membership_revoked_at is null
          and (m.organization_membership_invite_expires_at is null or m.organization_membership_invite_expires_at > current_timestamp)
          and (
            (_email is not null and m.organization_membership_invite_email = _email)
            or (_phone is not null and m.organization_membership_invite_phone = _phone)
            or exists (
              select 1
                from public.profile_identities pi
                where pi.profile_id = _user_id
                  and pi.profile_identity_disabled_at is null
                  and pi.address_level0_id = m.organization_membership_invite_address_level0_id
                  and pi.profile_identity_document_kind = m.organization_membership_invite_document_kind
                  and pi.profile_identity_document_value = m.organization_membership_invite_document_value
            )
          );
    end;
  $$;
grant execute on function public.viewer_organization_membership_pending() to authenticated;
-- Accept an invite. Sets profile_id to the calling viewer and stamps accepted_at.
-- Validates that the organization_membership is genuinely pending AND that the caller matches the
-- invite identifier (via viewer_organization_membership_pending). SECURITY DEFINER so it can write
-- through the RLS policy (the policy gates writes on members_manage, which the
-- invitee does NOT have yet).
create or replace function public.viewer_organization_membership_accept(organization_membership_id int)
  returns public.organization_memberships
  language plpgsql
  security definer
  set search_path to ''
  as $$
    declare
      _user_id uuid := public.viewer_profile_id();
      _row public.organization_memberships;
    begin
      if _user_id is null then
        raise exception 'not authenticated';
      elsif not exists (
        select 1 from public.viewer_organization_membership_pending() vmp
        where vmp.organization_membership_id = viewer_organization_membership_accept.organization_membership_id
      ) then
        raise exception 'invitation not found or does not match your account';
      end if;
      update public.organization_memberships
        set profile_id = _user_id,
            organization_membership_accepted_at = current_timestamp,
            organization_membership_invite_token = null
        where public.organization_memberships.organization_membership_id = viewer_organization_membership_accept.organization_membership_id
        returning * into _row;
      return _row;
    end;
  $$;
grant execute on function public.viewer_organization_membership_accept(int) to authenticated;
create or replace function public.viewer_organization_membership_reject(organization_membership_id int)
  returns public.organization_memberships
  language plpgsql
  security definer
  set search_path to ''
  as $$
    declare
      _row public.organization_memberships;
    begin
      if public.viewer_profile_id() is null then
        raise exception 'not authenticated';
      elsif not exists (
        select 1 from public.viewer_organization_membership_pending() vmp
        where vmp.organization_membership_id = viewer_organization_membership_reject.organization_membership_id
      ) then
        raise exception 'invitation not found or does not match your account';
      end if;
      update public.organization_memberships
        set organization_membership_rejected_at = current_timestamp,
            organization_membership_invite_token = null
        where public.organization_memberships.organization_membership_id = viewer_organization_membership_reject.organization_membership_id
        returning * into _row;
      return _row;
    end;
  $$;
grant execute on function public.viewer_organization_membership_reject(int) to authenticated;
create or replace function public.viewer_organization_membership_set_permissions(
  organization_membership_id int,
  permission_ids extensions.citext[]
)
  returns setof public.organization_membership_permissions
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _organization_id int;
    begin
      select m.organization_id into _organization_id
        from public.organization_memberships m
        where m.organization_membership_id = viewer_organization_membership_set_permissions.organization_membership_id;
      if _organization_id is null then
        raise exception 'membership_not_found' using errcode = 'P0001';
      elsif not public.viewer_has_permission(_organization_id, 'members_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;
      if exists (
        select 1 from unnest(viewer_organization_membership_set_permissions.permission_ids) as s(permission_id)
        where not exists (select 1 from public.permissions p where p.permission_id = s.permission_id)
      ) then
        raise exception 'invalid_permission' using errcode = 'P0001';
      end if;
      insert into public.organization_membership_permissions (organization_membership_id, permission_id)
        select viewer_organization_membership_set_permissions.organization_membership_id, s.permission_id
        from unnest(viewer_organization_membership_set_permissions.permission_ids) as s(permission_id)
        where not exists (
          select 1 from public.organization_membership_permissions existing
          where existing.organization_membership_id = viewer_organization_membership_set_permissions.organization_membership_id
            and existing.permission_id = s.permission_id
        );
      delete from public.organization_membership_permissions mp
        where mp.organization_membership_id = viewer_organization_membership_set_permissions.organization_membership_id
          and mp.permission_id <> all (viewer_organization_membership_set_permissions.permission_ids);
      return query
        select mp.*
        from public.organization_membership_permissions mp
        where mp.organization_membership_id = viewer_organization_membership_set_permissions.organization_membership_id;
    end;
  $$;
grant execute on function public.viewer_organization_membership_set_permissions(int, extensions.citext[]) to authenticated;
create or replace function public.organization_memberships_pending_by_document(
  country text,
  kind public.profile_identity_document_kind,
  value text
)
  returns table (
    organization_membership_id int,
    organization_id int,
    organization_name text,
    tenant_id int,
    tenant_slug text,
    tenant_name text,
    organization_membership_invite_token text,
    organization_membership_invite_expires_at timestamptz
  )
  language plpgsql
  stable
  security definer
  set search_path to ''
  as $$
    declare
      _normalized text;
    begin
      _normalized := internal.profile_identity_value_normalize(country, kind, value);
      if _normalized is null then
        return;
      end if;
      return query
        select
          m.organization_membership_id,
          m.organization_id,
          o.organization_name,
          o.tenant_id,
          t.tenant_slug::text,
          t.tenant_name,
          m.organization_membership_invite_token,
          m.organization_membership_invite_expires_at
        from public.organization_memberships m
        join public.organizations o on o.organization_id = m.organization_id
        join public.tenants t on t.tenant_id = o.tenant_id
        where m.profile_id is null
          and m.organization_membership_accepted_at is null
          and m.organization_membership_rejected_at is null
          and m.organization_membership_revoked_at is null
          and (m.organization_membership_invite_expires_at is null or m.organization_membership_invite_expires_at > current_timestamp)
          and m.organization_membership_invite_address_level0_id = country
          and m.organization_membership_invite_document_kind = kind
          and m.organization_membership_invite_document_value = _normalized;
    end;
  $$;
grant execute on function public.organization_memberships_pending_by_document(text, public.profile_identity_document_kind, text) to anon, authenticated;
-- ============================================================
-- users_handle_created — re-definition with identity-aware behavior
-- ============================================================
-- Re-defined here (after public.profile_identities exists) so that signups carrying
-- an optional document triplet in raw_user_meta_data (`profile_identity: {country,
-- kind, value}`) prepopulate public.profile_identities together with the profile row.
-- The profile_identities normalize trigger runs after this and validates the triplet.
-- If invalid, the auth.users INSERT aborts — so signup actions MUST validate the
-- triplet client-side before calling signUp/signInWithOtp.
--
-- Adds `set search_path to ''` which the original definition (~line 229) was missing.
create or replace function public.users_handle_created()
  returns trigger
  language plpgsql
  security definer
  set search_path to ''
  as $$
    begin
      insert into public.profiles (profile_id, profile_name_full)
        values (new.id, new.raw_user_meta_data->>'full_name')
        on conflict (profile_id) do nothing;
      if new.raw_user_meta_data ? 'profile_identity'
         and new.raw_user_meta_data->'profile_identity' ? 'country'
         and new.raw_user_meta_data->'profile_identity' ? 'kind'
         and new.raw_user_meta_data->'profile_identity' ? 'value'
      then
        insert into public.profile_identities (
          profile_id,
          address_level0_id,
          profile_identity_document_kind,
          profile_identity_document_value
        ) values (
          new.id,
          new.raw_user_meta_data->'profile_identity'->>'country',
          (new.raw_user_meta_data->'profile_identity'->>'kind')::public.profile_identity_document_kind,
          new.raw_user_meta_data->'profile_identity'->>'value'
        )
        on conflict (profile_id, address_level0_id, profile_identity_document_kind) do nothing;
      end if;
      return new;
    end;
  $$;
drop policy if exists "public buckets: read avatars" on storage.objects;
create policy "public buckets: read avatars"
  on storage.objects for select
  to authenticated, anon
  using (
    bucket_id in ('profiles', 'organizations', 'tenants', 'agencies')
    and path_tokens[2] = 'avatar'
  );
drop policy if exists "profiles bucket: own avatar" on storage.objects;
create policy "profiles bucket: own avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'profiles'
    and path_tokens[1] = (select auth.uid())::text
    and path_tokens[2] = 'avatar'
  )
  with check (
    bucket_id = 'profiles'
    and path_tokens[1] = (select auth.uid())::text
    and path_tokens[2] = 'avatar'
  );
drop policy if exists "organizations bucket: organization_manage avatar" on storage.objects;
create policy "organizations bucket: organization_manage avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'organizations'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_permission_org_ids('organization_manage'))
  )
  with check (
    bucket_id = 'organizations'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_permission_org_ids('organization_manage'))
  );
drop policy if exists "tenants bucket: tenant_manage avatar" on storage.objects;
create policy "tenants bucket: tenant_manage avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'tenants'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_permission_tenant_ids('tenant_manage'))
  )
  with check (
    bucket_id = 'tenants'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_permission_tenant_ids('tenant_manage'))
  );
drop policy if exists "agencies bucket: member avatar" on storage.objects;
create policy "agencies bucket: member avatar"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'agencies'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_agency_ids())
  )
  with check (
    bucket_id = 'agencies'
    and path_tokens[2] = 'avatar'
    and path_tokens[1] ~ '^[0-9]+$'
    and path_tokens[1]::int in (select public.viewer_agency_ids())
  );
create or replace view public.storage_profiles
  with (security_invoker = on) as
  select
    obj.id                                       as storage_profile_id,
    obj.bucket_id,
    obj.name,
    obj.path_tokens[1]::uuid                     as profile_id,
    obj.path_tokens[2]                           as folder,
    obj.metadata->>'mimetype'                    as mimetype,
    (obj.metadata->>'contentLength')::bigint     as content_length,
    obj.metadata,
    obj.created_at,
    obj.updated_at,
    '/storage/v1/object/public/' || obj.bucket_id || '/' || obj.name as src
  from storage.objects as obj
  where obj.bucket_id = 'profiles'
    and internal.is_uuid(obj.path_tokens[1]);
grant select on public.storage_profiles to authenticated, anon, service_role;
comment on view public.storage_profiles is e'@graphql({"primary_key_columns": ["storage_profile_id"], "foreign_keys": [{"local_name": "storage_profiles", "local_columns": ["profile_id"], "foreign_name": "profile", "foreign_schema": "public", "foreign_table": "profiles", "foreign_columns": ["profile_id"]}]})';
create or replace view public.storage_organizations
  with (security_invoker = on) as
  select
    obj.id                                       as storage_organization_id,
    obj.bucket_id,
    obj.name,
    obj.path_tokens[1]::int                      as organization_id,
    obj.path_tokens[2]                           as folder,
    obj.metadata->>'mimetype'                    as mimetype,
    (obj.metadata->>'contentLength')::bigint     as content_length,
    obj.metadata,
    obj.created_at,
    obj.updated_at,
    '/storage/v1/object/public/' || obj.bucket_id || '/' || obj.name as src
  from storage.objects as obj
  where obj.bucket_id = 'organizations'
    and obj.path_tokens[1] ~ '^[0-9]+$';
grant select on public.storage_organizations to authenticated, anon, service_role;
comment on view public.storage_organizations is e'@graphql({"primary_key_columns": ["storage_organization_id"], "foreign_keys": [{"local_name": "storage_organizations", "local_columns": ["organization_id"], "foreign_name": "organization", "foreign_schema": "public", "foreign_table": "organizations", "foreign_columns": ["organization_id"]}]})';
create or replace view public.storage_tenants
  with (security_invoker = on) as
  select
    obj.id                                       as storage_tenant_id,
    obj.bucket_id,
    obj.name,
    obj.path_tokens[1]::int                      as tenant_id,
    obj.path_tokens[2]                           as folder,
    obj.metadata->>'mimetype'                    as mimetype,
    (obj.metadata->>'contentLength')::bigint     as content_length,
    obj.metadata,
    obj.created_at,
    obj.updated_at,
    '/storage/v1/object/public/' || obj.bucket_id || '/' || obj.name as src
  from storage.objects as obj
  where obj.bucket_id = 'tenants'
    and obj.path_tokens[1] ~ '^[0-9]+$';
grant select on public.storage_tenants to authenticated, anon, service_role;
comment on view public.storage_tenants is e'@graphql({"primary_key_columns": ["storage_tenant_id"], "foreign_keys": [{"local_name": "storage_tenants", "local_columns": ["tenant_id"], "foreign_name": "tenant", "foreign_schema": "public", "foreign_table": "tenants", "foreign_columns": ["tenant_id"]}]})';
create or replace view public.storage_agencies
  with (security_invoker = on) as
  select
    obj.id                                       as storage_agency_id,
    obj.bucket_id,
    obj.name,
    obj.path_tokens[1]::int                      as agency_id,
    obj.path_tokens[2]                           as folder,
    obj.metadata->>'mimetype'                    as mimetype,
    (obj.metadata->>'contentLength')::bigint     as content_length,
    obj.metadata,
    obj.created_at,
    obj.updated_at,
    '/storage/v1/object/public/' || obj.bucket_id || '/' || obj.name as src
  from storage.objects as obj
  where obj.bucket_id = 'agencies'
    and obj.path_tokens[1] ~ '^[0-9]+$';
grant select on public.storage_agencies to authenticated, anon, service_role;
comment on view public.storage_agencies is e'@graphql({"primary_key_columns": ["storage_agency_id"], "foreign_keys": [{"local_name": "storage_agencies", "local_columns": ["agency_id"], "foreign_name": "agency", "foreign_schema": "public", "foreign_table": "agencies", "foreign_columns": ["agency_id"]}]})';
-- Sessions: list and revoke the viewer's own auth sessions.
drop function if exists public.viewer_sessions();
create or replace function public.viewer_sessions()
  returns setof public.user_sessions
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select
      s.id,
      s.user_id,
      s.user_agent,
      s.ip,
      s.created_at,
      s.refreshed_at,
      s.not_after
    from public.user_sessions s
    where s.user_id = auth.uid()
    order by coalesce(s.refreshed_at, s.created_at) desc nulls last;
  $$;
create or replace function public.revoke_session(session_id uuid)
  returns void
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    delete from auth.sessions
    where id = revoke_session.session_id
      and user_id = auth.uid();
  $$;
-- ============================================================
-- Tenant / organization / agency creation
-- ============================================================
-- protected.* owns each transactional workflow. Public viewer wrappers only
-- derive the current profile from the JWT and delegate to that implementation.
create or replace function protected.tenant_create(
  profile_id   uuid,
  tenant_slug  text,
  tenant_name  text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _tenant                      public.tenants;
      _organization_id            int;
      _organization_membership_id int;
    begin
      insert into public.tenants (tenant_slug, tenant_name)
        values (
          $2::extensions.citext,
          $3
        )
        returning * into _tenant;
      insert into public.organizations (tenant_id, organization_slug, organization_name)
        values (
          _tenant.tenant_id,
          $2::extensions.citext,
          $3
        )
        returning organization_id into _organization_id;
      insert into public.organization_memberships (
        organization_id,
        profile_id,
        organization_membership_accepted_at
      )
        values (_organization_id, $1, current_timestamp)
        returning organization_membership_id into _organization_membership_id;
      -- Founder gets the org wildcard plus an explicit tenant_manage grant on the espejo org, so
      -- tenant-level authority (viewer_permission_tenant_ids) is real and grantable, not only a
      -- side effect of holding '*'.
      insert into public.organization_membership_permissions (organization_membership_id, permission_id)
        values
          (_organization_membership_id, '*'),
          (_organization_membership_id, 'tenant_manage');
      return next _tenant;
    end;
  $$;
revoke execute on function protected.tenant_create(uuid, text, text) from public;
grant execute on function protected.tenant_create(uuid, text, text) to service_role;
create or replace function public.viewer_tenant_create(
  tenant_slug  text,
  tenant_name  text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    select t.*
    from protected.tenant_create(
      public.viewer_profile_id(true),
      $1,
      $2
    ) t;
  $$;
revoke execute on function public.viewer_tenant_create(text, text) from public;
grant execute on function public.viewer_tenant_create(text, text) to anon, authenticated;
-- Rename a tenant. Exposed as a pg_graphql Mutation (setof rows 1, volatile) so client
-- components can call it via useGraphyMutation instead of a pass-through Server Action.
-- Gated by tenant_manage; the tenant_name length check on the column enforces 1..256.
create or replace function public.viewer_tenant_update(
  tenant_id    int,
  tenant_name  text
)
  returns setof public.tenants rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _tenant public.tenants;
    begin
      if not public.viewer_has_tenant_permission($1, 'tenant_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;
      update public.tenants
        set tenant_name = $2,
            tenant_updated_at = current_timestamp
        where public.tenants.tenant_id = $1
        returning * into _tenant;
      return next _tenant;
    end;
  $$;
create or replace function public.viewer_tenant_onboarding_finish(tenant_id int)
  returns setof public.tenants rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _tenant public.tenants;
    begin
      if not public.viewer_has_tenant_permission($1, 'tenant_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;
      update public.tenants
        set tenant_onboarded_at = current_timestamp,
            tenant_updated_at = current_timestamp
        where public.tenants.tenant_id = $1
        returning * into _tenant;
      return next _tenant;
    end;
  $$;
create or replace function protected.organization_create(
  profile_id         uuid,
  tenant_id          int,
  organization_slug  text,
  organization_name  text
)
  returns setof public.organizations rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _organization                public.organizations;
      _organization_membership_id  int;
    begin
      if not exists (
        select 1
        from public.organization_memberships m
        join public.organizations o using (organization_id)
        join public.organization_membership_permissions p using (organization_membership_id)
        where o.tenant_id = $2
          and m.profile_id = $1
          and m.organization_membership_accepted_at is not null
          and m.organization_membership_revoked_at is null
          and m.organization_membership_rejected_at is null
          and p.permission_id in ('organization_manage', '*')
      ) then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;
      insert into public.organizations (tenant_id, organization_slug, organization_name)
        values (
          $2,
          $3::extensions.citext,
          $4
        )
        returning * into _organization;
      insert into public.organization_memberships (
        organization_id,
        profile_id,
        organization_membership_accepted_at
      )
        values (_organization.organization_id, $1, current_timestamp)
        returning organization_membership_id into _organization_membership_id;
      insert into public.organization_membership_permissions (organization_membership_id, permission_id)
        values (_organization_membership_id, '*');
      return next _organization;
    end;
  $$;
revoke execute on function protected.organization_create(uuid, int, text, text) from public;
grant execute on function protected.organization_create(uuid, int, text, text) to service_role;
create or replace function public.viewer_organization_create(
  tenant_id          int,
  organization_slug  text,
  organization_name  text
)
  returns setof public.organizations rows 1
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    select o.*
    from protected.organization_create(
      public.viewer_profile_id(true),
      $1,
      $2,
      $3
    ) o;
  $$;
revoke execute on function public.viewer_organization_create(int, text, text) from public;
grant execute on function public.viewer_organization_create(int, text, text) to anon, authenticated;
create or replace function protected.agency_create(
  profile_id   uuid,
  agency_name  text,
  agency_slug  text
)
  returns setof public.agencies rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _agency                 public.agencies;
      _agency_membership_id   int;
    begin
      begin
        insert into public.agencies (agency_name, agency_slug)
          values (
            $2,
            $3::extensions.citext
          )
          returning * into _agency;
      exception
        when unique_violation then
          raise exception 'slug_taken' using errcode = 'P0001';
      end;
      insert into public.agency_memberships (
        agency_id,
        profile_id,
        agency_membership_accepted_at
      )
        values (_agency.agency_id, $1, current_timestamp)
        returning agency_membership_id into _agency_membership_id;
      insert into public.agency_membership_permissions (agency_membership_id, permission_id)
        values (_agency_membership_id, '*');
      return next _agency;
    end;
  $$;
revoke execute on function protected.agency_create(uuid, text, text) from public;
grant execute on function protected.agency_create(uuid, text, text) to service_role;
create or replace function public.viewer_agency_create(
  agency_name  text,
  agency_slug  text
)
  returns setof public.agencies rows 1
  volatile
  security definer
  language sql
  set search_path to ''
  as $$
    select a.*
    from protected.agency_create(
      public.viewer_profile_id(true),
      $1,
      $2
    ) a;
  $$;
revoke execute on function public.viewer_agency_create(text, text) from public;
grant execute on function public.viewer_agency_create(text, text) to anon, authenticated;
-- ============================================================
-- agency_memberships — mutation RPCs
-- ============================================================
-- Errors use SQLSTATE P0001 with a stable, locale-key message so callers
-- can match the key without parsing prose.
-- All three are viewer-scoped: the caller is resolved from the JWT via the agency
-- team-permission helpers, so they run under the caller's own RLS context (callable
drop function if exists public.agency_membership_invite(int, uuid, uuid);
drop function if exists public.agency_membership_update(int, int, text, uuid);
drop function if exists public.agency_membership_respond(int, text);
create or replace function public.viewer_agency_membership_invite_by_email(
  agency_id int,
  email     text
)
  returns setof public.agency_memberships rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _profile_id uuid;
      _row        public.agency_memberships;
    begin
      if not public.viewer_has_agency_team_permission(
           viewer_agency_membership_invite_by_email.agency_id, 'agency_members_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;
      if not exists (
        select 1 from public.agencies a
        where a.agency_id = viewer_agency_membership_invite_by_email.agency_id
      ) then
        raise exception 'agency_not_found' using errcode = 'P0001';
      end if;
      select u.id into _profile_id
        from auth.users u
        where lower(u.email) = lower(viewer_agency_membership_invite_by_email.email)
        limit 1;
      if _profile_id is null then
        raise exception 'user_not_found' using errcode = 'P0001';
      end if;
      if exists (
        select 1 from public.agency_memberships af
        where af.agency_id = viewer_agency_membership_invite_by_email.agency_id
          and af.profile_id = _profile_id
          and af.agency_membership_accepted_at is not null
          and af.agency_membership_revoked_at is null
          and af.agency_membership_rejected_at is null
      ) then
        raise exception 'already_member' using errcode = 'P0001';
      end if;
      update public.agency_memberships
        set agency_membership_accepted_at = null,
            agency_membership_revoked_at  = null,
            agency_membership_rejected_at = null
        where public.agency_memberships.agency_id = viewer_agency_membership_invite_by_email.agency_id
          and public.agency_memberships.profile_id = _profile_id
        returning * into _row;
      if not found then
        insert into public.agency_memberships (agency_id, profile_id)
          values (viewer_agency_membership_invite_by_email.agency_id, _profile_id)
          returning * into _row;
      end if;
      return next _row;
    end;
  $$;
grant execute on function public.viewer_agency_membership_invite_by_email(int, text) to authenticated;
create or replace function public.viewer_agency_membership_update(
  agency_membership_id int,
  operation            text
)
  returns setof public.agency_memberships rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _agency_id int;
      _row       public.agency_memberships;
    begin
      if viewer_agency_membership_update.operation not in ('revoke', 'reactivate') then
        raise exception 'invalid_operation' using errcode = 'P0001';
      end if;
      select m.agency_id into _agency_id
        from public.agency_memberships m
        where m.agency_membership_id = viewer_agency_membership_update.agency_membership_id;
      if _agency_id is null then
        raise exception 'membership_not_found' using errcode = 'P0001';
      end if;
      if not public.viewer_has_agency_team_permission(_agency_id, 'agency_members_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;
      if viewer_agency_membership_update.operation = 'revoke' then
        if not public.agency_has_other_active_admin(_agency_id, viewer_agency_membership_update.agency_membership_id) then
          raise exception 'last_admin_protected' using errcode = 'P0001';
        end if;
        update public.agency_memberships
          set agency_membership_revoked_at = current_timestamp
          where public.agency_memberships.agency_membership_id = viewer_agency_membership_update.agency_membership_id
          returning * into _row;
      else
        update public.agency_memberships
          set agency_membership_revoked_at  = null,
              agency_membership_rejected_at = null,
              agency_membership_accepted_at = current_timestamp
          where public.agency_memberships.agency_membership_id = viewer_agency_membership_update.agency_membership_id
          returning * into _row;
      end if;
      return next _row;
    end;
  $$;
grant execute on function public.viewer_agency_membership_update(int, text) to authenticated;
create or replace function public.viewer_agency_membership_respond(
  agency_membership_id int,
  response             text
)
  returns setof public.agency_memberships rows 1
  volatile
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
      _row       public.agency_memberships;
    begin
      if viewer_agency_membership_respond.response not in ('accept', 'reject') then
        raise exception 'invalid_response' using errcode = 'P0001';
      elsif _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;
      select m.* into _row
        from public.agency_memberships m
        where m.agency_membership_id = viewer_agency_membership_respond.agency_membership_id
          and m.profile_id = _caller_id;
      if not found then
        raise exception 'invitation_not_found' using errcode = 'P0001';
      elsif _row.agency_membership_revoked_at is not null
         or _row.agency_membership_accepted_at is not null
         or _row.agency_membership_rejected_at is not null
      then
        raise exception 'invitation_not_pending' using errcode = 'P0001';
      end if;
      if viewer_agency_membership_respond.response = 'accept' then
        update public.agency_memberships
          set agency_membership_accepted_at = current_timestamp
          where public.agency_memberships.agency_membership_id = viewer_agency_membership_respond.agency_membership_id
          returning * into _row;
      else
        update public.agency_memberships
          set agency_membership_rejected_at = current_timestamp
          where public.agency_memberships.agency_membership_id = viewer_agency_membership_respond.agency_membership_id
          returning * into _row;
      end if;
      return next _row;
    end;
  $$;
grant execute on function public.viewer_agency_membership_respond(int, text) to authenticated;
do $$ begin
  create type public.message_channel as enum ('in_app', 'email', 'web_push', 'whatsapp', 'sms');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.ticket_status as enum ('open', 'claimed', 'in_progress', 'resolved', 'closed');
exception when duplicate_object then null; end $$;
create table if not exists public.conversations (
  conversation_id   uuid primary key default internal.uuid_generate_v7(),
  profile_id        uuid not null references public.profiles (profile_id) on delete cascade,
  tenant_id         int  references public.tenants (tenant_id) on delete cascade,
  organization_id   int  references public.organizations (organization_id) on delete cascade,
  agency_id         int  references public.agencies (agency_id) on delete cascade,
  conversation_subject text check (char_length(conversation_subject) <= 200),
  conversation_kind   text not null default 'notification'
                        check (conversation_kind in ('notification', 'agent', 'support', 'system')),
  conversation_status text not null default 'open'
                        check (conversation_status in ('open', 'resolved', 'archived')),
  conversation_resolved_at      timestamptz,
  conversation_resolved_channel public.message_channel,
  conversation_resolution       jsonb,
  conversation_last_message_at  timestamptz not null default current_timestamp,
  conversation_created_at timestamptz not null default current_timestamp,
  conversation_updated_at timestamptz not null default current_timestamp
);
create index if not exists conversations_inbox_idx
  on public.conversations (profile_id, conversation_last_message_at desc)
  where conversation_status <> 'archived';
create index if not exists conversations_org_idx
  on public.conversations (organization_id)
  where organization_id is not null;
drop trigger if exists handle_conversations_updated_at on public.conversations;
create trigger handle_conversations_updated_at
  before update on public.conversations
  for each row execute procedure extensions.moddatetime(conversation_updated_at);
create table if not exists public.conversation_messages (
  conversation_message_id uuid primary key default internal.uuid_generate_v7(),
  conversation_id   uuid not null references public.conversations (conversation_id) on delete cascade,
  message_author    text not null check (message_author in ('system', 'agent', 'user')),
  message_direction text not null check (message_direction in ('outbound', 'inbound')),
  conversation_topic_slug extensions.citext references public.conversation_topics (conversation_topic_slug) on delete restrict,
  message_channel   public.message_channel,
  message_body      text,
  message_payload   jsonb not null default '{}',
  message_priority  public.notification_priority,
  message_read_at   timestamptz,
  message_signature_verified boolean not null default false,
  message_idempotency_key     text unique,
  message_created_at timestamptz not null default current_timestamp
);
create index if not exists conversation_messages_thread_idx
  on public.conversation_messages (conversation_id, message_created_at);
create index if not exists conversation_messages_unread_idx
  on public.conversation_messages (conversation_id)
  where message_read_at is null and message_direction = 'outbound';
create or replace function internal.conversation_messages_bump_last_message()
  returns trigger
  language plpgsql
  set search_path to ''
  as $$
    begin
      -- Use greatest(new_ts, clock_timestamp()) so both explicit future timestamps and
      -- same-transaction inserts produce a strictly increasing last_message_at.
      update public.conversations
        set conversation_last_message_at = greatest(conversation_last_message_at, NEW.message_created_at, clock_timestamp()),
            conversation_status = case
              when conversation_status = 'resolved' and NEW.message_direction = 'inbound'
                then 'open'
              else conversation_status
            end
        where conversation_id = NEW.conversation_id;
      return NEW;
    end;
  $$;
drop trigger if exists conversation_messages_trigger_bump_last_message on public.conversation_messages;
create trigger conversation_messages_trigger_bump_last_message
  after insert on public.conversation_messages
  for each row execute procedure internal.conversation_messages_bump_last_message();
create table if not exists public.conversation_message_deliveries (
  conversation_message_delivery_id uuid primary key default internal.uuid_generate_v7(),
  conversation_message_id uuid not null references public.conversation_messages (conversation_message_id) on delete cascade,
  message_channel public.message_channel not null,
  delivery_status text not null default 'queued'
    check (delivery_status in ('queued', 'sent', 'delivered', 'failed', 'skipped')),
  provider_message_id text,
  reply_token text unique,
  delivery_error text,
  delivery_created_at timestamptz not null default current_timestamp,
  delivery_sent_at timestamptz,
  unique (conversation_message_id, message_channel)
);
create table if not exists public.profile_topic_channels (
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  conversation_topic_slug extensions.citext not null references public.conversation_topics (conversation_topic_slug) on delete restrict,
  message_channel public.message_channel not null,
  enabled boolean not null default true,
  profile_topic_channel_created_at timestamptz not null default current_timestamp,
  profile_topic_channel_updated_at timestamptz not null default current_timestamp,
  primary key (profile_id, conversation_topic_slug, message_channel)
);
drop trigger if exists handle_profile_topic_channels_updated_at on public.profile_topic_channels;
create trigger handle_profile_topic_channels_updated_at
  before update on public.profile_topic_channels
  for each row execute procedure extensions.moddatetime(profile_topic_channel_updated_at);
create table if not exists public.profile_contacts (
  profile_contact_id uuid primary key default internal.uuid_generate_v7(),
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  message_channel public.message_channel not null,
  contact_value extensions.citext not null,
  contact_verified_at timestamptz,
  profile_contact_created_at timestamptz not null default current_timestamp,
  profile_contact_updated_at timestamptz not null default current_timestamp,
  unique (message_channel, contact_value)
);
drop trigger if exists handle_profile_contacts_updated_at on public.profile_contacts;
create trigger handle_profile_contacts_updated_at
  before update on public.profile_contacts
  for each row execute procedure extensions.moddatetime(profile_contact_updated_at);
create table if not exists public.profile_push_subscriptions (
  profile_push_subscription_id uuid primary key default internal.uuid_generate_v7(),
  profile_id uuid not null references public.profiles (profile_id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  profile_push_subscription_created_at timestamptz not null default current_timestamp,
  profile_push_subscription_updated_at timestamptz not null default current_timestamp
);
drop trigger if exists handle_profile_push_subscriptions_updated_at on public.profile_push_subscriptions;
create trigger handle_profile_push_subscriptions_updated_at
  before update on public.profile_push_subscriptions
  for each row execute procedure extensions.moddatetime(profile_push_subscription_updated_at);
create table if not exists public.agent_action_log (
  agent_action_log_id uuid primary key default internal.uuid_generate_v7(),
  conversation_message_id uuid not null references public.conversation_messages (conversation_message_id) on delete cascade,
  profile_id uuid not null references public.profiles (profile_id),
  organization_id int references public.organizations (organization_id),
  agency_id int references public.agencies (agency_id),
  tool_name text not null,
  tool_input jsonb not null default '{}',
  tool_output jsonb,
  action_status text not null check (action_status in ('claiming', 'executed', 'rejected', 'clarify', 'error')),
  action_idempotency_key text unique,
  agent_action_created_at timestamptz not null default current_timestamp
);
create table if not exists public.tickets (
  ticket_id uuid primary key default internal.uuid_generate_v7(),
  conversation_id uuid not null unique references public.conversations (conversation_id) on delete cascade,
  tenant_id int not null references public.tenants (tenant_id) on delete cascade,
  organization_id int references public.organizations (organization_id) on delete cascade,
  ticket_subject  text not null check (char_length(ticket_subject) between 1 and 200),
  ticket_status   public.ticket_status not null default 'open',
  ticket_priority public.notification_priority not null default 'medium',
  assigned_agency_id  int references public.agencies (agency_id) on delete set null,
  assigned_profile_id uuid references public.profiles (profile_id) on delete set null,
  ticket_claimed_at  timestamptz,
  ticket_resolved_at timestamptz,
  ticket_created_at timestamptz not null default current_timestamp,
  ticket_updated_at timestamptz not null default current_timestamp
);
create index if not exists tickets_pool_idx on public.tickets (organization_id, ticket_status)
  where ticket_status in ('open', 'claimed', 'in_progress');
drop trigger if exists handle_tickets_updated_at on public.tickets;
create trigger handle_tickets_updated_at
  before update on public.tickets
  for each row execute procedure extensions.moddatetime(ticket_updated_at);
alter table public.conversations enable row level security;
revoke all on table public.conversations from anon, authenticated;
grant select on table public.conversations to anon, authenticated;
grant select, insert, update, delete on table public.conversations to service_role;
drop policy if exists "conversations select own" on public.conversations;
create policy "conversations select own"
  on public.conversations for select
  to authenticated
  using (profile_id = (select public.viewer_profile_id()));
alter table public.conversation_messages enable row level security;
revoke all on table public.conversation_messages from anon, authenticated;
grant select on table public.conversation_messages to anon, authenticated;
grant select, insert, update, delete on table public.conversation_messages to service_role;
drop policy if exists "conversation_messages select own" on public.conversation_messages;
create policy "conversation_messages select own"
  on public.conversation_messages for select
  to authenticated
  using (
    conversation_id in (
      select conversation_id from public.conversations
      where profile_id = (select public.viewer_profile_id())
    )
  );
do $$ begin
  alter publication supabase_realtime add table public.conversation_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
alter table public.conversation_message_deliveries enable row level security;
revoke all on table public.conversation_message_deliveries from anon, authenticated;
grant select on table public.conversation_message_deliveries to authenticated;
grant select, insert, update, delete on table public.conversation_message_deliveries to service_role;
drop policy if exists "conversation_message_deliveries select own" on public.conversation_message_deliveries;
create policy "conversation_message_deliveries select own"
  on public.conversation_message_deliveries for select
  to authenticated
  using (
    conversation_message_id in (
      select cm.conversation_message_id
      from public.conversation_messages cm
      join public.conversations c using (conversation_id)
      where c.profile_id = (select public.viewer_profile_id())
    )
  );
alter table public.profile_topic_channels enable row level security;
revoke all on table public.profile_topic_channels from anon, authenticated;
grant select, insert, update, delete on table public.profile_topic_channels to authenticated;
grant select, insert, update, delete on table public.profile_topic_channels to service_role;
drop policy if exists "profile_topic_channels own" on public.profile_topic_channels;
create policy "profile_topic_channels own"
  on public.profile_topic_channels for all
  to authenticated
  using (profile_id = (select public.viewer_profile_id()))
  with check (profile_id = (select public.viewer_profile_id()));
alter table public.profile_contacts enable row level security;
revoke all on table public.profile_contacts from anon, authenticated;
grant select, insert, delete on table public.profile_contacts to anon;
grant select, insert, update, delete on table public.profile_contacts to authenticated;
grant select, insert, update, delete on table public.profile_contacts to service_role;
drop policy if exists "profile_contacts own" on public.profile_contacts;
create policy "profile_contacts own"
  on public.profile_contacts for all
  to authenticated
  using (profile_id = (select public.viewer_profile_id()))
  with check (profile_id = (select public.viewer_profile_id()));
alter table public.profile_push_subscriptions enable row level security;
revoke all on table public.profile_push_subscriptions from anon, authenticated;
grant select, insert, update, delete on table public.profile_push_subscriptions to authenticated;
grant select, insert, update, delete on table public.profile_push_subscriptions to service_role;
drop policy if exists "profile_push_subscriptions own" on public.profile_push_subscriptions;
create policy "profile_push_subscriptions own"
  on public.profile_push_subscriptions for all
  to authenticated
  using (profile_id = (select public.viewer_profile_id()))
  with check (profile_id = (select public.viewer_profile_id()));
alter table public.agent_action_log enable row level security;
revoke all on table public.agent_action_log from anon, authenticated;
grant select on table public.agent_action_log to authenticated;
grant select, insert, update, delete on table public.agent_action_log to service_role;
drop policy if exists "agent_action_log select own" on public.agent_action_log;
create policy "agent_action_log select own"
  on public.agent_action_log for select
  to authenticated
  using (profile_id = (select public.viewer_profile_id()));
alter table public.tickets enable row level security;
revoke all on table public.tickets from anon, authenticated;
grant select on table public.tickets to authenticated;
grant select, insert, update, delete on table public.tickets to service_role;
drop policy if exists "tickets select own or agency" on public.tickets;
create policy "tickets select own or agency"
  on public.tickets for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.conversation_id = public.tickets.conversation_id
        and c.profile_id = (select public.viewer_profile_id())
    )
    or organization_id in (select public.viewer_agency_permission_org_ids('tickets_manage'))
  );
create or replace function public.conversation_emit(
  recipient_profile_id uuid,
  slug                 extensions.citext,
  body                 text    default null,
  payload              jsonb   default '{}',
  subject              text    default null,
  organization_id      int     default null,
  agency_id            int     default null,
  conversation_id      uuid    default null
)
  returns table (out_conversation_id uuid, out_conversation_message_id uuid)
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _tenant_id          int;
      _conv_id            uuid;
      _msg_id             uuid;
      _topic_priority     public.notification_priority;
      _topic_kind         public.notification_kind;
      _delivery_id        uuid;
      _ch                 public.message_channel;
    begin
      -- Resolve tenant from organization when provided.
      if conversation_emit.organization_id is not null then
        select o.tenant_id into _tenant_id
          from public.organizations o
          where o.organization_id = conversation_emit.organization_id;
      end if;
      -- Look up topic defaults.
      select ct.conversation_topic_priority, ct.conversation_topic_kind
        into _topic_priority, _topic_kind
        from public.conversation_topics ct
        where ct.conversation_topic_slug = conversation_emit.slug
          and ct.conversation_topic_disabled_at is null;
      if not found then
        raise exception 'conversation_topic_not_found' using errcode = 'P0001';
      end if;
      if conversation_emit.conversation_id is not null then
        _conv_id := conversation_emit.conversation_id;
        if not exists (
          select 1 from public.conversations c
          where c.conversation_id = _conv_id
            and c.profile_id = conversation_emit.recipient_profile_id
        ) then
          raise exception 'conversation_not_found' using errcode = 'P0001';
        end if;
      else
        insert into public.conversations (
          profile_id, tenant_id, organization_id, agency_id,
          conversation_subject, conversation_kind
        )
        values (
          conversation_emit.recipient_profile_id, _tenant_id,
          conversation_emit.organization_id, conversation_emit.agency_id,
          conversation_emit.subject, 'notification'
        )
        returning conversations.conversation_id into _conv_id;
      end if;
      insert into public.conversation_messages (
        conversation_id, message_author, message_direction,
        conversation_topic_slug, message_body, message_payload, message_priority
      )
      values (
        _conv_id, 'system', 'outbound',
        conversation_emit.slug, conversation_emit.body,
        coalesce(conversation_emit.payload, '{}'), _topic_priority
      )
      returning conversation_messages.conversation_message_id into _msg_id;
      insert into public.conversation_message_deliveries (
        conversation_message_id, message_channel, delivery_status
      )
      values (_msg_id, 'in_app', 'queued')
      on conflict (conversation_message_id, message_channel) do nothing;
      foreach _ch in array array['email', 'whatsapp', 'sms']::public.message_channel[] loop
        if exists (
          select 1 from public.profile_topic_channels ptc
          where ptc.profile_id = conversation_emit.recipient_profile_id
            and ptc.conversation_topic_slug = conversation_emit.slug
            and ptc.message_channel = _ch
            and ptc.enabled = false
        ) then
          continue;
        end if;
        if not exists (
          select 1 from public.profile_contacts pc
          where pc.profile_id = conversation_emit.recipient_profile_id
            and pc.message_channel = _ch
            and pc.contact_verified_at is not null
        ) then
          continue;
        end if;
        insert into public.conversation_message_deliveries (
          conversation_message_id, message_channel, delivery_status, reply_token
        )
        values (
          _msg_id, _ch, 'queued',
          encode(extensions.gen_random_bytes(24), 'hex')
        )
        on conflict (conversation_message_id, message_channel) do nothing
        returning conversation_message_delivery_id into _delivery_id;
        if _delivery_id is not null then
          perform pgmq.send(
            'conversation_outbound',
            jsonb_build_object(
              'delivery_id', _delivery_id,
              'message_id',  _msg_id,
              'channel',     _ch
            )
          );
        end if;
      end loop;
      if not exists (
        select 1 from public.profile_topic_channels ptc
        where ptc.profile_id = conversation_emit.recipient_profile_id
          and ptc.conversation_topic_slug = conversation_emit.slug
          and ptc.message_channel = 'web_push'
          and ptc.enabled = false
      ) and exists (
        select 1 from public.profile_push_subscriptions pps
        where pps.profile_id = conversation_emit.recipient_profile_id
      ) then
        insert into public.conversation_message_deliveries (
          conversation_message_id, message_channel, delivery_status, reply_token
        )
        values (
          _msg_id, 'web_push', 'queued',
          encode(extensions.gen_random_bytes(24), 'hex')
        )
        on conflict (conversation_message_id, message_channel) do nothing
        returning conversation_message_delivery_id into _delivery_id;
        if _delivery_id is not null then
          perform pgmq.send(
            'conversation_outbound',
            jsonb_build_object(
              'delivery_id', _delivery_id,
              'message_id',  _msg_id,
              'channel',     'web_push'
            )
          );
        end if;
      end if;
      return query select _conv_id, _msg_id;
    end;
  $$;
grant execute on function public.conversation_emit(uuid, extensions.citext, text, jsonb, text, int, int, uuid) to service_role;
create or replace function public.conversation_post_user_message(
  conversation_id uuid,
  body            text,
  payload         jsonb default '{}'
)
  returns uuid
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
      _msg_id    uuid;
    begin
      if _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;
      if not exists (
        select 1 from public.conversations c
        where c.conversation_id = conversation_post_user_message.conversation_id
          and c.profile_id = _caller_id
      ) then
        raise exception 'conversation_not_found' using errcode = 'P0001';
      end if;
      insert into public.conversation_messages (
        conversation_id, message_author, message_direction, message_body, message_payload
      )
      values (
        conversation_post_user_message.conversation_id,
        'user', 'inbound',
        conversation_post_user_message.body,
        coalesce(conversation_post_user_message.payload, '{}')
      )
      returning conversation_messages.conversation_message_id into _msg_id;
      return _msg_id;
    end;
  $$;
grant execute on function public.conversation_post_user_message(uuid, text, jsonb) to authenticated;
create or replace function public.conversation_mark_read(message_ids uuid[])
  returns int
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
      _count     int;
    begin
      if _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;
      update public.conversation_messages cm
        set message_read_at = current_timestamp
        from public.conversations c
        where cm.conversation_id = c.conversation_id
          and c.profile_id = _caller_id
          and cm.conversation_message_id = any(conversation_mark_read.message_ids)
          and cm.message_read_at is null
          and cm.message_direction = 'outbound';
      get diagnostics _count = row_count;
      return _count;
    end;
  $$;
grant execute on function public.conversation_mark_read(uuid[]) to authenticated;
create or replace function public.conversation_archive(p_conversation_id uuid)
  returns void
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
    begin
      if _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;
      update public.conversations
        set conversation_status = 'archived'
        where conversation_id = conversation_archive.p_conversation_id
          and profile_id = _caller_id;
      if not found then
        raise exception 'conversation_not_found' using errcode = 'P0001';
      end if;
    end;
  $$;
grant execute on function public.conversation_archive(uuid) to authenticated;
create or replace function public.viewer_conversations(
  include_archived  boolean default false,
  p_organization_id int     default null,
  p_agency_id       int     default null,
  p_scope           text    default null
)
  returns setof public.conversations
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select c.*
    from public.conversations c
    where c.profile_id = (select public.viewer_profile_id())
      and (viewer_conversations.include_archived or c.conversation_status <> 'archived')
      and (
        viewer_conversations.p_scope is null
        or (viewer_conversations.p_scope = 'personal'      and c.organization_id is null and c.agency_id is null)
        or (viewer_conversations.p_scope = 'organization'  and c.organization_id = viewer_conversations.p_organization_id)
        or (viewer_conversations.p_scope = 'agency'        and c.agency_id = viewer_conversations.p_agency_id)
      )
    order by c.conversation_last_message_at desc;
  $$;
grant execute on function public.viewer_conversations(boolean, int, int, text) to authenticated;
create or replace function public.viewer_conversation_by_id(conversation_id uuid)
  returns setof public.conversations rows 1
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select c.*
    from public.conversations c
    where c.conversation_id = viewer_conversation_by_id.conversation_id
      and c.profile_id = (select public.viewer_profile_id())
    limit 1;
  $$;
grant execute on function public.viewer_conversation_by_id(uuid) to authenticated;
-- viewer_conversation_messages: thread messages for a conversation owned by caller.
create or replace function public.viewer_conversation_messages(p_conversation_id uuid)
  returns setof public.conversation_messages
  stable
  security definer
  parallel safe
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
    begin
      if _caller_id is null then
        return;
      end if;
      if not exists (
        select 1 from public.conversations c
        where c.conversation_id = viewer_conversation_messages.p_conversation_id
          and c.profile_id = _caller_id
      ) then
        return;
      end if;
      return query
        select cm.*
        from public.conversation_messages cm
        where cm.conversation_id = viewer_conversation_messages.p_conversation_id
        order by cm.message_created_at;
    end;
  $$;
grant execute on function public.viewer_conversation_messages(uuid) to authenticated;
-- viewer_unread_count: count of unread outbound messages across non-archived conversations.
-- p_scope filters by conversation scope:
--   'personal'     → organization_id IS NULL AND agency_id IS NULL
create or replace function public.viewer_unread_count(
  p_organization_id int  default null,
  p_agency_id       int  default null,
  p_scope           text default null
)
  returns int
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select count(*)::int
    from public.conversation_messages cm
    join public.conversations c using (conversation_id)
    where c.profile_id = (select public.viewer_profile_id())
      and c.conversation_status <> 'archived'
      and cm.message_direction = 'outbound'
      and cm.message_read_at is null
      and (
        viewer_unread_count.p_scope is null
        or (viewer_unread_count.p_scope = 'personal'      and c.organization_id is null and c.agency_id is null)
        or (viewer_unread_count.p_scope = 'organization'  and c.organization_id = viewer_unread_count.p_organization_id)
        or (viewer_unread_count.p_scope = 'agency'        and c.agency_id = viewer_unread_count.p_agency_id)
      );
  $$;
grant execute on function public.viewer_unread_count(int, int, text) to authenticated;
create or replace function public.agent_action_claim(
  idempotency_key         text,
  conversation_message_id uuid,
  profile_id              uuid,
  tool_name               text,
  tool_input              jsonb,
  organization_id         int    default null
)
  returns table (claimed boolean, prior_status text, prior_output jsonb)
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _prior public.agent_action_log%rowtype;
    begin
      -- Try to find an existing record for this idempotency key (fast path for duplicates).
      select * into _prior
        from public.agent_action_log
        where action_idempotency_key = agent_action_claim.idempotency_key;
      if found then
        return query select false, _prior.action_status, _prior.tool_output;
        return;
      end if;
      -- Insert the claim row. The unique constraint on action_idempotency_key is the mutex:
      -- exactly one concurrent caller wins the insert; the rest hit unique_violation.
      begin
        insert into public.agent_action_log (
          conversation_message_id, profile_id, organization_id,
          tool_name, tool_input, action_status, action_idempotency_key
        )
        values (
          agent_action_claim.conversation_message_id,
          agent_action_claim.profile_id,
          agent_action_claim.organization_id,
          agent_action_claim.tool_name,
          agent_action_claim.tool_input,
          'claiming',
          agent_action_claim.idempotency_key
        );
      exception when unique_violation then
        select * into _prior
          from public.agent_action_log
          where action_idempotency_key = agent_action_claim.idempotency_key;
        return query select false, _prior.action_status, _prior.tool_output;
        return;
      end;
      return query select true, null::text, null::jsonb;
    end;
  $$;
grant execute on function public.agent_action_claim(text, uuid, uuid, text, jsonb, int) to service_role;
create or replace function public.ticket_escalate(
  p_conversation_id uuid,
  subject           text,
  priority          public.notification_priority default 'medium'
)
  returns uuid
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
      _conv      public.conversations%rowtype;
      _ticket_id uuid;
    begin
      if _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;
      select * into _conv
        from public.conversations
        where conversation_id = ticket_escalate.p_conversation_id
          and profile_id = _caller_id;
      if not found then
        raise exception 'conversation_not_found' using errcode = 'P0001';
      end if;
      select ticket_id into _ticket_id
        from public.tickets
        where conversation_id = ticket_escalate.p_conversation_id;
      if found then
        return _ticket_id;
      end if;
      insert into public.tickets (
        conversation_id, tenant_id, organization_id,
        ticket_subject, ticket_priority
      )
      values (
        ticket_escalate.p_conversation_id,
        _conv.tenant_id, _conv.organization_id,
        ticket_escalate.subject, ticket_escalate.priority
      )
      returning tickets.ticket_id into _ticket_id;
      update public.conversations
        set conversation_kind = 'support'
        where conversation_id = ticket_escalate.p_conversation_id;
      return _ticket_id;
    end;
  $$;
grant execute on function public.ticket_escalate(uuid, text, public.notification_priority) to authenticated;
create or replace function public.ticket_escalate_as(
  caller_id         uuid,
  p_conversation_id uuid,
  subject           text,
  priority          public.notification_priority default 'medium'
)
  returns uuid
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _conv      public.conversations%rowtype;
      _ticket_id uuid;
    begin
      if caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;
      select * into _conv
        from public.conversations
        where conversation_id = ticket_escalate_as.p_conversation_id
          and profile_id = ticket_escalate_as.caller_id;
      if not found then
        raise exception 'conversation_not_found' using errcode = 'P0001';
      end if;
      select ticket_id into _ticket_id
        from public.tickets
        where conversation_id = ticket_escalate_as.p_conversation_id;
      if found then
        return _ticket_id;
      end if;
      insert into public.tickets (
        conversation_id, tenant_id, organization_id,
        ticket_subject, ticket_priority
      )
      values (
        ticket_escalate_as.p_conversation_id,
        _conv.tenant_id, _conv.organization_id,
        ticket_escalate_as.subject, ticket_escalate_as.priority
      )
      returning tickets.ticket_id into _ticket_id;
      update public.conversations
        set conversation_kind = 'support'
        where conversation_id = ticket_escalate_as.p_conversation_id;
      return _ticket_id;
    end;
  $$;
grant execute on function public.ticket_escalate_as(uuid, uuid, text, public.notification_priority) to service_role;
create or replace function public.ticket_claim(p_ticket_id uuid)
  returns void
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
      _ticket    public.tickets%rowtype;
      _agency_id int;
    begin
      if _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;
      select * into _ticket
        from public.tickets
        where ticket_id = ticket_claim.p_ticket_id;
      if not found then
        raise exception 'ticket_not_found' using errcode = 'P0001';
      end if;
      if not public.viewer_has_agency_permission(_ticket.organization_id, 'tickets_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;
      select aog.agency_id into _agency_id
        from public.agencies_organizations_grants aog
        where aog.agency_id in (select public.viewer_agency_ids())
          and (aog.organization_id = _ticket.organization_id or aog.organization_id is null)
          and (aog.permission_id = 'tickets_manage' or aog.permission_id = '*')
        order by aog.agency_id
        limit 1;
      update public.tickets
        set ticket_status       = 'claimed',
            assigned_agency_id  = _agency_id,
            assigned_profile_id = _caller_id,
            ticket_claimed_at   = current_timestamp
        where ticket_id = ticket_claim.p_ticket_id
          and ticket_status = 'open';
      if not found then
        raise exception 'ticket_already_claimed' using errcode = 'P0001';
      end if;
    end;
  $$;
grant execute on function public.ticket_claim(uuid) to authenticated;
create or replace function public.ticket_resolve(
  p_ticket_id uuid,
  resolution  jsonb default '{}'
)
  returns void
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _caller_id uuid := public.viewer_profile_id();
      _ticket    public.tickets%rowtype;
    begin
      if _caller_id is null then
        raise exception 'not_authenticated' using errcode = 'P0001';
      end if;
      select * into _ticket
        from public.tickets
        where ticket_id = ticket_resolve.p_ticket_id;
      if not found then
        raise exception 'ticket_not_found' using errcode = 'P0001';
      end if;
      if not public.viewer_has_agency_permission(_ticket.organization_id, 'tickets_manage') then
        raise exception 'no_permission' using errcode = 'P0001';
      end if;
      if _ticket.ticket_status = 'resolved' or _ticket.ticket_status = 'closed' then
        raise exception 'ticket_already_resolved' using errcode = 'P0001';
      end if;
      update public.tickets
        set ticket_status     = 'resolved',
            ticket_resolved_at = current_timestamp
        where ticket_id = ticket_resolve.p_ticket_id;
      update public.conversations
        set conversation_status          = 'resolved',
            conversation_resolved_at     = current_timestamp,
            conversation_resolution      = coalesce(ticket_resolve.resolution, '{}')
        where conversation_id = _ticket.conversation_id;
    end;
  $$;
grant execute on function public.ticket_resolve(uuid, jsonb) to authenticated;
create or replace function public.conversation_outbound_read(vt int, qty int)
  returns setof pgmq.message_record
  security definer
  language sql
  set search_path to ''
  as $$
    select * from pgmq.read('conversation_outbound', vt, qty);
  $$;
grant execute on function public.conversation_outbound_read(int, int) to service_role;
create or replace function public.conversation_outbound_delete(msg_id bigint)
  returns boolean
  security definer
  language sql
  set search_path to ''
  as $$
    select pgmq.delete('conversation_outbound', msg_id);
  $$;
grant execute on function public.conversation_outbound_delete(bigint) to service_role;
create or replace function public.conversation_outbound_archive(msg_id bigint)
  returns boolean
  security definer
  language sql
  set search_path to ''
  as $$
    select pgmq.archive('conversation_outbound', msg_id);
  $$;
grant execute on function public.conversation_outbound_archive(bigint) to service_role;
create or replace function public.caller_has_permission(
  caller_profile_id uuid,
  organization_id   int,
  permission_id     extensions.citext
)
  returns boolean
  stable
  security definer
  parallel safe
  language sql
  set search_path to ''
  as $$
    select exists (
      select 1
      from public.organization_membership_permissions mp
      join public.organization_memberships m on m.organization_membership_id = mp.organization_membership_id
      where m.organization_id = caller_has_permission.organization_id
        and m.profile_id = caller_has_permission.caller_profile_id
        and m.organization_membership_accepted_at is not null
        and m.organization_membership_revoked_at is null
        and m.organization_membership_rejected_at is null
        and (mp.permission_id = caller_has_permission.permission_id or mp.permission_id = '*')
    );
  $$;
grant execute on function public.caller_has_permission(uuid, int, extensions.citext) to service_role;
-- conversation_ingest_inbound: atomically insert an inbound user message.
-- Deduplicates on provider_message_id (message_idempotency_key).
-- Returns the resolved conversation/scope so the agent loop can work without extra queries.
-- Used only via service-role (webhook handlers have no JWT).
create or replace function public.conversation_ingest_inbound(
  conversation_id         uuid,
  profile_id              uuid,
  channel                 public.message_channel,
  body                    text,
  payload                 jsonb,
  provider_message_id     text,
  signature_verified      boolean default false
)
  returns table (
    out_conversation_message_id uuid,
    out_conversation_id         uuid,
    out_profile_id              uuid,
    out_organization_id         int,
    out_agency_id               int,
    out_tenant_id               int,
    out_already_resolved        boolean
  )
  security definer
  language plpgsql
  set search_path to ''
  as $$
    declare
      _conv public.conversations%rowtype;
      _msg_id uuid;
      _idempotency_key text;
    begin
      -- Build a non-null idempotency key (channel-namespaced).
      _idempotency_key := channel::text || ':' || provider_message_id;
      -- Dedupe: if we already processed this provider message, return the existing row.
      select cm.conversation_message_id
        into _msg_id
        from public.conversation_messages cm
        where cm.message_idempotency_key = _idempotency_key;
      if found then
        select c.* into _conv
          from public.conversations c
          where c.conversation_id = conversation_ingest_inbound.conversation_id;
        return query
          select _msg_id,
                 _conv.conversation_id,
                 _conv.profile_id,
                 _conv.organization_id,
                 _conv.agency_id,
                 _conv.tenant_id,
                 (_conv.conversation_resolved_at is not null);
        return;
      end if;
      -- Fetch conversation (validates it exists).
      select c.* into _conv
        from public.conversations c
        where c.conversation_id = conversation_ingest_inbound.conversation_id
          and c.profile_id = conversation_ingest_inbound.profile_id;
      if not found then
        raise exception 'conversation_not_found' using errcode = 'P0001';
      end if;
      insert into public.conversation_messages (
        conversation_id,
        message_author,
        message_direction,
        message_channel,
        message_body,
        message_payload,
        message_signature_verified,
        message_idempotency_key
      )
      values (
        conversation_ingest_inbound.conversation_id,
        'user',
        'inbound',
        conversation_ingest_inbound.channel,
        conversation_ingest_inbound.body,
        coalesce(conversation_ingest_inbound.payload, '{}'),
        conversation_ingest_inbound.signature_verified,
        _idempotency_key
      )
      returning conversation_messages.conversation_message_id into _msg_id;
      return query
        select _msg_id,
               _conv.conversation_id,
               _conv.profile_id,
               _conv.organization_id,
               _conv.agency_id,
               _conv.tenant_id,
               (_conv.conversation_resolved_at is not null);
    end;
  $$;
grant execute on function public.conversation_ingest_inbound(uuid, uuid, public.message_channel, text, jsonb, text, boolean) to service_role;
create or replace function public.conversation_resolve(
  p_conversation_id uuid,
  channel           public.message_channel,
  resolution        jsonb default '{}'
)
  returns void
  security definer
  language plpgsql
  set search_path to ''
  as $$
    begin
      update public.conversations
        set conversation_status           = 'resolved',
            conversation_resolved_at      = current_timestamp,
            conversation_resolved_channel = conversation_resolve.channel,
            conversation_resolution       = coalesce(conversation_resolve.resolution, '{}')
        where conversation_id = conversation_resolve.p_conversation_id
          and conversation_resolved_at is null;
    end;
  $$;
grant execute on function public.conversation_resolve(uuid, public.message_channel, jsonb) to service_role;
create or replace function public.agent_action_complete(
  idempotency_key text,
  status          text,
  tool_output     jsonb default null
)
  returns void
  security definer
  language plpgsql
  set search_path to ''
  as $$
    begin
      if status not in ('executed', 'error', 'rejected', 'clarify') then
        raise exception 'invalid_status' using errcode = 'P0001';
      end if;
      update public.agent_action_log
        set action_status = status,
            tool_output   = agent_action_complete.tool_output
        where action_idempotency_key = agent_action_complete.idempotency_key;
    end;
  $$;
grant execute on function public.agent_action_complete(text, text, jsonb) to service_role;
do $$
  declare
    _drain_url text := coalesce(current_setting('app.drain_url', true), '');
    _drain_secret text := coalesce(current_setting('app.drain_secret', true), '');
  begin
    -- Remove any previous schedule to keep this idempotent on re-run.
    perform cron.unschedule('conversation_outbound_drain')
      where exists (
        select 1 from cron.job where jobname = 'conversation_outbound_drain'
      );
    if _drain_url <> '' and _drain_secret <> '' then
      -- Schedule: every minute, POST to the drain endpoint with shared-secret header.
      perform cron.schedule(
        'conversation_outbound_drain',
        '* * * * *',
        format(
          $cron$
            select net.http_post(
              url     := %L,
              headers := jsonb_build_object('x-drain-secret', %L, 'content-type', 'application/json'),
              body    := '{}'::jsonb
            );
          $cron$,
          _drain_url,
          _drain_secret
        )
      );
    end if;
  exception
    when others then
      raise notice 'conversation_outbound_drain schedule skipped: %', sqlerrm;
  end;
$$;
comment on table public.profiles is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.conversation_topics is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.reserved_slugs is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.tenants is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.organizations is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.addresses_level0 is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.addresses_level1 is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.addresses_level2 is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.addresses_level3 is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.organization_memberships is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.permissions is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.organization_membership_permissions is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.permission_presets is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.agencies is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.agency_memberships is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.agencies_organizations_grants is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.profile_identities is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.tenant_domains is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.conversations is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.conversation_messages is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.conversation_message_deliveries is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.profile_topic_channels is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.profile_contacts is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.profile_push_subscriptions is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.agent_action_log is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
comment on table public.tickets is e'@graphql({"totalCount": {"enabled": true}, "aggregate": {"enabled": true}})';
````

## File: apps/platform/package.json
````json
{
  "name": "@apps/platform",
  "version": "0.0.0",
  "private": true,
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "postinstall": "NODE_ENV=development next typegen || true",
    "dev": "next dev --turbo --experimental-https --experimental-https-key ./certificates/lvh.me-key.pem --experimental-https-cert ./certificates/lvh.me-cert.pem -H ${HOST:-0.0.0.0} --port ${PORT:-7003}",
    "dev:debug": "next dev --turbo --experimental-https --experimental-https-key ./certificates/lvh.me-key.pem --experimental-https-cert ./certificates/lvh.me-cert.pem -H ${HOST:-0.0.0.0} --port ${PORT:-7003} --inspect",
    "dev:exe": "next dev --turbo -H 0.0.0.0 --port ${PORT:-3000}",
    "build": "next build",
    "build:dry": "tsc --noEmit",
    "start": "next start",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "format": "biome check --diagnostic-level=error .",
    "generate:graphql": "graphql-codegen -c graphql.config.ts"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^3.0.85",
    "@formatjs/intl-localematcher": "^0.8.10",
    "@hookform/resolvers": "^5.2.0",
    "@modelcontextprotocol/sdk": "^1.29.0",
    "@next/env": "^16.2.9",
    "@opentelemetry/auto-instrumentations-node": "^0.77.0",
    "@opentelemetry/exporter-trace-otlp-http": "^0.219.0",
    "@opentelemetry/sdk-node": "^0.219.0",
    "@packages/api-ip": "workspace:*",
    "@packages/debug": "workspace:*",
    "@packages/graphy": "workspace:*",
    "@packages/intl": "workspace:*",
    "@packages/kapso": "workspace:*",
    "@packages/react-email": "workspace:*",
    "@packages/react-hooks": "workspace:*",
    "@packages/react-pdf": "workspace:*",
    "@packages/rosetta": "workspace:*",
    "@packages/supabase": "workspace:*",
    "@packages/ui-common": "workspace:*",
    "@packages/utils": "workspace:*",
    "@posthog/next": "^0.4.97",
    "@react-email/render": "2.0.9",
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.108.2",
    "@types/ua-parser-js": "^0.7.39",
    "@vercel/analytics": "^2.0.1",
    "@vercel/speed-insights": "^2.0.0",
    "ai": "^6.0.208",
    "clsx": "^2.1.1",
    "lucide-react": "^1.21.0",
    "jose": "^6.0.0",
    "mcp-handler": "^1.1.0",
    "negotiator": "^1.0.0",
    "next": "16.2.9",
    "next-safe-action": "^8.5.5",
    "next-themes": "^0.4.6",
    "next-zod-route": "^1.0.0",
    "posthog-node": "^5.38.2",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-hook-form": "^7.80.0",
    "react-markdown": "^10.1.0",
    "resend": "^6.14.0",
    "schema-dts": "^2.0.0",
    "sonner": "^2.0.7",
    "swr": "^2.4.1",
    "ua-parser-js": "^2.0.10",
    "web-push": "^3.6.7",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^7.1.3",
    "@graphql-codegen/client-preset": "^6.0.1",
    "@graphql-typed-document-node/core": "^3.2.0",
    "@packages/typescript-config": "workspace:*",
    "@playwright/test": "^1.61.0",
    "@tailwindcss/postcss": "^4.3.1",
    "@types/negotiator": "^0.6.4",
    "@types/node": "^24.12.4",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@types/web-push": "^3.6.4",
    "graphql": "^16.9.0",
    "postcss": "^8.5.15",
    "tailwindcss": "^4.3.1",
    "typescript": "^6.0.3",
    "vitest": "^4.1.9"
  }
}
````

## File: AGENTS.md
````markdown
# SaaS Template — Multi-tenant SaaS Starter

> **Required skills:**
>
> - `/codebase` — load the generated whole-monorepo reference before working anywhere in the repo.
> - `/context7-mcp` — fetch current library/framework docs before writing code (training data goes stale).
> - `/my-conventions` — **read before writing ANY TS/TSX** (imports, typed routes, bracket notation, code style, naming, commits).
> - `/caveman` — ultra-compressed, token-efficient responses.
> - `/ponytail` — laziest solution that actually works (YAGNI, stdlib before deps, shortest path).
>
> **Session start:** if `.env.development.local` exists at repo root, read the comments, we are in a worktree.
>
> **This file is the map, not the manual.** It holds macro architecture + a [Skill Router](#skill-router).
> Execution rules live in skills — open the skill for the subsystem you touch. See [Governance](#governance)
> before adding anything here.

## What This Is

Production-grade multi-tenant SaaS starter. Hard parts pre-wired: authentication (email/password, OAuth, phone OTP, WebAuthn passkeys), two-level multi-tenancy with Postgres RLS, capability-based permissions, agency/affiliate surface for cross-tenant partner access, i18n, React Email/PDF template packages, shadcn-based design system — all in Turborepo monorepo.

Keep reusable infrastructure (`packages/*`, auth, tenancy, routing, permissions, **agency/affiliate** surface — generic B2B pattern for partners/resellers/firms working across multiple customer tenants). **HR/payroll-style tenant surface** is example product implementation — replace with your own.

## Package Manager

Always use **pnpm**. Never npm or yarn.

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 24 |
| Package manager | pnpm 10.x |
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 6 |
| Styling | Tailwind CSS 4.x + shadcn/ui (new-york, in `packages/ui-common/src/shadcn`) |
| API | Typed `pg_graphql` operations + Server Actions for server-only effects |
| Database + Auth | Supabase (Postgres + Auth + Storage + Realtime + RLS) |
| ORM | Supabase (generated types via CLI, no Drizzle) |
| GraphQL | `pg_graphql` + a typed client (`@packages/graphy`) |
| PDF generation | `@react-pdf/renderer` (in `packages/react-pdf`) |
| Email templates | React Email (in `packages/react-email`; delivery not wired) |
| i18n | `@packages/rosetta` + locale from cookie/header (no URL segment) |
| Linting/Formatting | Biome.js 2.x |
| Hosting | Vercel |

> Optional integrations included as examples: `@packages/kapso` (WhatsApp BSP). Remove ones you don't need.

## Architecture

One Next.js app — `apps/platform` — hosts marketing, auth, dashboard, and tenant surfaces, routed by hostname and URL path. Shared logic in `@packages/*`.

```
<repo>/
├── apps/
│   └── platform/             # @apps/platform — single Next.js app
│       ├── app/
│       │   ├── health/route.ts       # /health — canonical health check (public)
│       │   ├── (marketing)/          # / — public landing, FAQ, pricing, legal
│       │   ├── auth/                 # /auth/* — auth + onboarding
│       │   ├── oauth/                # /oauth/* — MCP consent
│       │   ├── api/                  # route handlers (e.g. /api/mcp)
│       │   └── (app)/                # authenticated shell (route group, no URL segment)
│       │       ├── home/             # /home — org picker + account
│       │       ├── tenants/create/   # /tenants/create
│       │       ├── t/[tenant_slug]/[organization_id]/   # /t/{slug}/{org_id}/* — tenant product
│       │       ├── a/[agency_slug]/  # /a/{slug}/* — agency surface
│       │       └── agencies/         # /agencies/* — agency management
│       ├── proxy.ts          # Host routing, locale (cookie/header), session, auth, tenant membership gates
│       ├── styles/globals.css
│       └── next.config.ts
│
├── packages/
│   ├── typescript-config/    # @packages/typescript-config — base, nextjs, react-library presets
│   ├── ui-common/            # @packages/ui-common — shadcn primitives (src/shadcn/**) + shared components (src/**)
│   ├── supabase/             # @packages/supabase — client factories + generated types + schema/RLS/seed/tests
│   ├── graphy/               # @packages/graphy — typed pg_graphql client
│   ├── rosetta/              # @packages/rosetta — i18n runtime
│   ├── react-email/          # @packages/react-email — React Email templates + preview
│   ├── react-pdf/            # @packages/react-pdf — PDF templates
│   ├── debug/ utils/ react-hooks/   # small shared utilities
│   └── kapso/                # @packages/kapso — lite WhatsApp BSP client (optional)
│
└── (your docs)              # Strategy, product spec, etc.
```

### Package Scopes

- `@apps/*` — apps (currently just `@apps/platform`)
- `@packages/*` — shared packages

### Routing

Tenant routing is **path-based** (`/t/{slug}/{organization_id}/...`) — **no `[locale]` URL segment** (locale resolved from cookie/header by the proxy) and **no subdomain extraction**. Details + gates: **`/my-proxy`**.

- `<apex>/...` and `www.<apex>/...` → main site + authenticated app shell.
- `{slug}.<apex>/...` → legacy tenant subdomains are not used; such hosts redirect to the apex. Reach a tenant via the path `<apex>/t/{slug}/{organization_id}/...`.
- Custom apex domains — phase 2; unknown hosts redirect to the configured apex.

`<apex>` is `NEXT_PUBLIC_APEX_HOSTNAME` (hostname only) + `process.env.PORT` (per instance). `lvh.me` + `7003` in dev (Conductor reassigns `PORT` for parallel instances), `example.com` + implicit `443` in prod.

### Auth + onboarding

`proxy.ts` calls `updateSession` to refresh the JWT cookie, then reads the `sub` claim (the `profile_id`) — the only claim the hook carries. JWT holds **no** tenant/organization/agency/onboarding metadata; resolve from DB via `viewer_*` helpers (or `getSupabaseServerUserMetadata()` from `@packages/supabase/client.server`). Gates run in order: public path bypass → auth redirect (`/auth?next=…`) → tenant membership check (`viewer_tenant_validate`). Onboarding completion is **not** a hard gate — surfaced via a /home banner. Full flows + helpers: **`/my-auth`**, **`/my-proxy`**.

**Public paths:** new marketing pages (e.g. `/faq`, `/pricing`) → update `PUBLIC_PATH_REGEX` in `apps/platform/proxy.ts` to avoid the auth gate.

### Reserved Slugs

Reserved slugs are seeded in `packages/supabase/supabase/seed.sql` and cached per-request in `apps/platform/lib/get-tenant-reserved-slugs.ts` using React's `cache()`. New/changed slugs are picked up on the next request automatically. Tenant creation rejects them (`apps/platform/app/(app)/tenants/create/schemas.ts` + `internal.slug_reserved_validate()`).

### Local Dev Ports

| Module | Service | Default port | URL |
|---|---|---|---|
| `apps/platform` | Next.js main app | 7003 | https://lvh.me:7003 |
| `packages/supabase` | Supabase Studio | 7100 | http://localhost:7100 |
| `packages/supabase` | Supabase Inbucket (mailbox) | 54424 | http://localhost:54424 |
| `packages/react-email` | React Email preview | 7101 | http://localhost:7101 |
| `packages/react-pdf` | React PDF preview | 7102 | http://localhost:7102 |

Table above = **bare-local default**. Conductor/exe.dev shift ports per worktree. See `.env.development.local` at repo root.

`lvh.me` is public wildcard DNS resolving every name (apex + subdomain) to `127.0.0.1` — no `/etc/hosts` needed. Cookies scoped to `.lvh.me` so session crosses `lvh.me:7003` ↔ `{slug}.lvh.me:7003`.

### Local HTTPS

`apps/platform` runs over HTTPS in dev (`next dev --experimental-https`) — WebAuthn requires a secure context, and the browser's secure-context allowlist hardcodes `localhost` / `127.0.0.1` / `[::1]`. DNS aliases like `lvh.me` are NOT on the allowlist, so plain HTTP makes `window.PublicKeyCredential` undefined.

TLS cert from [mkcert](https://github.com/FiloSottile/mkcert). One-time setup: `bash scripts/development/https-setup.sh` (runs `mkcert -install`, emits `apps/platform/certificates/lvh.me-{cert,key}.pem`; the dir is gitignored).

Keep these aligned with the HTTPS dev origin — flipping any to `http://` breaks OAuth callbacks and passkey verification:

- `WEBAUTHN_RELYING_PARTY_ORIGIN` (in `.env.example` + `apps/platform/.env.local`): `https://lvh.me:7003`
- `supabase/config.toml` `[auth].site_url`: `https://lvh.me:7003`
- `supabase/config.toml` `[auth].additional_redirect_urls`: `https://lvh.me:7003/**` + `https://*.lvh.me:7003/**`

`WEBAUTHN_RELYING_PARTY_ID` stays `lvh.me` (host only). `NEXT_PUBLIC_APEX_HOSTNAME` is `lvh.me` (hostname only); port from `process.env.PORT` (dev script falls back to 7003); `proxy.ts` builds the full host via `APP_HOST` in `apps/platform/lib/constants.ts`. After editing `config.toml`, restart Supabase (`pnpm db:stop && pnpm db:start`).

## `@packages/ui-common`

Shared UI in `packages/ui-common`, two layers:

- **`src/shadcn/**`** — shadcn/ui primitives + `cn`. Managed by the shadcn CLI. **Never hand-edit** `src/shadcn/components/ui/` — generated, overwritten on the next style switch. Customizations go in `src/` wrappers.
- **`src/**`** — hand-written shared components (e.g. `logo.tsx`). One file per component, no barrels.

```ts
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Logo } from "@packages/ui-common/logo";
```

Add primitives with `pnpm dlx shadcn add <component>` from `packages/ui-common/`. Current style `radix-rhea` (in `components.json`); switching styles + the regen command → **`/shadcn`** skill. Don't put shadcn components in `apps/platform/`.

## MCP Status

Remote MCP server at `/api/mcp` (Streamable HTTP, stateless, via `mcp-handler`). Auth: Supabase OAuth 2.1 Authorization Server (beta) + Dynamic Client Registration (DCR). Flow:

1. MCP client hits `/api/mcp` without a token → `withMcpAuth` returns 401 + `WWW-Authenticate`.
2. Client fetches `/.well-known/oauth-protected-resource` (public, RFC 9728 PRM) → discovers the Authorization Server at `${SUPABASE_URL}/auth/v1`.
3. Client registers via DCR, runs PKCE → Supabase redirects to `/oauth/consent?authorization_id=<id>`.
4. User approves → code → token exchange → Supabase JWT.
5. Client sends `Authorization: Bearer <jwt>` → `verifyToken` validates via `supabase.auth.getUser(token)` → passes the token to `GraphyClientSupabase` → RLS enforces per-user access.

Key paths: **endpoint** `/api/mcp` (`withMcpAuth`); **PRM discovery** `/.well-known/oauth-protected-resource` (public); **consent** `/oauth/consent` (login required). Tenant scoping is global today (apex host) with an optional tenant arg per tool — path-based scoping is phase 2. Config: `packages/supabase/supabase/config.toml` block `[auth.oauth_server]`.

## Database & Multi-tenancy (macro)

Prototype phase — **no incremental migrations**. All schema in one file: `packages/supabase/supabase/migrations/00000000000000_schema.sql`. Change schema → edit it directly → `pnpm db:reset && pnpm generate:types`. Commands: `pnpm db:start`/`db:stop`, `pnpm db:reset` (drop + replay + seed), Studio `http://127.0.0.1:7100`. Full SQL/RLS/codegen workflow: **`/my-supabase`**, **`/my-supabase-codegen`**.

Two-level model:

- `public.tenants` (int4 serial PK) — billing / customer relationship.
- `public.organizations` (int4 serial PK, FK to tenants) — actual operating unit. Most tenants have one org mirroring the tenant; large companies have several.
- `public.organization_memberships(...)` — users belong to **organizations**, not directly to tenants. No `role` column — access is permission-based. Pending invitations and active memberships share this table.

Every tenant-scoped table carries denormalized `tenant_id int` (and `organization_id int` when org-scoped). RLS enforces isolation at the DB layer — never rely on app-level filtering alone. The active tenant comes from the **path segment** (no `x-tenant-*` headers); pages use viewer-scoped GraphQL helpers or resolve `tenant_id` from DB via `viewer_*` helpers.

**Permissions are capability-based, not role-based.** Catalog `public.permissions` (citext slugs: `*` wildcard, `organization_manage`, `tenant_manage`, `members_manage`, `presets_manage`); explicit grants in `public.organization_membership_permissions`; UX-only bundles in `public.permission_presets`. Permissions are **NOT** in the JWT — enforced at query time via `viewer_*` security-definer helpers (wildcard `*` honored). Helper catalog (`viewer_tenant_ids`, `viewer_organization_validate`, `viewer_permission_org_ids`, `viewer_has_tenant_permission`, …) + RLS patterns: **`/my-supabase`**, **`/my-permissions`**.

## Skills

Three kinds, all **committed** and materialized on `pnpm install` by the `postinstall` script (`scripts/skills-setup.mjs`, exposed as `pnpm skills:install`). It symlinks every dir in `skills/` and `skills-third-party/` into both agent stores — no network, no cloning. The stores `.agents/skills/` and `.claude/skills/` are **gitignored** generated symlinks. Read the relevant skill before working in that subsystem.

- **First-party (`my-*`)** — sources committed in `skills/my-*`.
- **Third-party** — vendored (committed) in `skills-third-party/<name>`. `skills-lock.json` (committed) is the provenance record.
- **Generated codebase reference (`codebase`)** — `repomix --skill-generate` packs the monorepo into `skills/codebase/`. Regenerate with `pnpm generate:repomix:skills`. **Generated — never hand-edit.**

`.agents/skills/` is the **universal store** (Codex, Cursor, Copilot, OpenCode, Zed); `.claude/skills/` is Claude Code's. Source of truth = `skills/` + `skills-third-party/`.

Add/refresh a third-party skill (use the github `owner/repo` shorthand, NOT a skills.sh URL):

```bash
pnpm dlx skills add <owner/repo> --skill <skill-name>   # e.g. dietrichgebert/ponytail --skill ponytail
cp -R .agents/skills/<skill-name> skills-third-party/<skill-name>   # vendor the fetched files
pnpm skills:install                                                 # re-link the stores
```

Commit the `skills-third-party/<skill-name>` files + the `skills-lock.json` bump. Vendored skills are frozen at the fetched commit — they do **not** track upstream. Skills run with **full agent permissions** — review source before vendoring.

## Skill Router

Before touching a subsystem, open its skill — it holds the execution rules this file deliberately omits. Also use **`/context7-mcp`** for any external library/framework docs.

| Working on… | Read first |
|---|---|
| SQL schema, RLS, triggers, storage, pgTAP, plpgsql style, multi-step writes | `/my-supabase`, `/my-permissions`, `/psql-query` |
| Type/schema/operation codegen, generated-type errors | `/my-supabase-codegen`, `/my-graphql-codegen` |
| GraphQL queries/mutations/fragments, operation variables, `pg_graphql` exposure | `/my-graphql`, `/my-graphy` |
| Typed Supabase client, server actions, browser SWR hooks | `/my-supabase-react` |
| i18n: dictionaries, cookie locale, `t`/`LOCALES` rules, email/PDF localization | `/my-i18n` |
| Auth, JWT claim, OAuth, OTP, passkeys, onboarding | `/my-auth` |
| Proxy: locale/apex/tenant gates, session refresh, public paths | `/my-proxy` |
| **Any TS/TSX** — imports, typed routes, `next-zod-route`, bracket notation, code style, naming, hooks, lint/build, commits | **`/my-conventions`** |
| React Email / React PDF templates | `/my-react-email`, `/my-react-pdf` |
| shadcn primitives, styles, presets | `/shadcn` |
| WhatsApp / Kapso | `/integrate-whatsapp` |

## Governance

**This file = macro architecture + the router above. Nothing else.**

- A **new subsystem rule** (SQL, GraphQL, i18n, auth, proxy, …) → add it to that subsystem's `my-*` skill, **not here**.
- A **new cross-cutting TS/TSX rule** → add it to **`/my-conventions`**.
- Only **macro architecture** (new top-level dir, new app, new routing tier, a new subsystem that needs a router row) belongs in this file.
- Do **not** add "Critical Rules" / execution detail here — it loads on every session and must stay small.

### Contradicciones entre código y documentación

Si al trabajar en una tarea se detecta una contradicción entre lo que dice el código real y lo que indica `AGENTS.md` o alguna skill propia (`skills/my-*`), **no elegir un camino silenciosamente**. Detener el trabajo, exponer la contradicción al usuario con precisión (archivo:línea del código vs. sección del doc), preguntar qué fuente prevalece, y luego corregir tanto el código como el markdown que resulte incorrecto. La fuente de verdad debe quedar consistente en ambos lados.

## Testing Strategy

Three layers, each a different runner:

| Layer | Runner | Command | Lives in |
|---|---|---|---|
| TypeScript units | Vitest | `pnpm test` (turbo) | `packages/*/src/**/*.test.ts` |
| SQL (RLS, viewer_*, triggers, hook) | pgTAP via `supabase test db` | `pnpm test:db` | `packages/supabase/supabase/tests/**/*.test.sql` |
| End-to-end UI journeys | Playwright + Chromium | `pnpm test:e2e` | `apps/platform/tests/e2e/**/*.spec.ts` |

`pnpm test:db` and `pnpm test:e2e` run against the same local Supabase as `pnpm dev`. pgTAP tests wrap in `begin … rollback`; Playwright provisions/cleans up its own users via `auth.admin` and assumes the dev server is already running. RLS test detail (`set local role authenticated; set local request.jwt.claims …`) → `/my-supabase`, `/my-permissions`. Don't fight onboarding in e2e — not a hard gate; skip via `page.goto`.

## What NOT to Do

- Don't add new technology without strong justification — the stack is intentionally familiar.
- Don't use a tenant slug from the reserved-route list (auth, home, tenants, health, …) — `tenants/create/schemas.ts` + `internal.reserved_slugs` is the source of truth.
- Don't expect tenant/organization/agency/onboarding state in the JWT — the hook is pass-through, only `profile_id` (the `sub` claim) is carried. Resolve from DB via `viewer_*` helpers.
- Don't put shadcn components in `apps/platform/` — they belong in `packages/ui-common/src/shadcn`.
- Don't add execution rules to this file — see [Governance](#governance).
````