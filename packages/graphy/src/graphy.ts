import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
import { ErrorExtendable } from "@packages/utils/errors";
import { HASH } from "@packages/utils/hash";
import { HEADERS_JSON, MIME_JSON } from "@packages/utils/http";
import { JSON_PARSE_SAFE } from "@packages/utils/json";
import type { Maybe } from "@packages/utils/maybe";
import type { GraphQLError as GraphQLErrorType, OperationDefinitionNode } from "graphql";

/** See graphql.config.ts */
export interface DocumentTypeDecorationMeta<TData, TVariables> extends DocumentTypeDecoration<TData, TVariables> {
  // value: string; TODO: is private, how to access?
  definitions?: OperationDefinitionNode[];
  __meta__?: {
    /** See: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#persisted-documents */
    hash?: string;
    [key: string]: unknown;
  };
}

/** Generalized query interface using DocumentTypeDecoration. */
export interface GraphyFetchGraphQLQuery<TData, TVariables> {
  query: DocumentTypeDecorationMeta<TData, TVariables>;
  variables?: TVariables | null | undefined;
}

type GraphQLQueryBody = {
  query?: string;
  variables?: Maybe<Record<any, any>>;
  extensions?: {
    /** See: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#persisted-documents */
    persistedQuery?: {
      version: number;
      sha256Hash: string;
    };
  };
};

export type PageInfo<T extends string = string> = {
  endCursor?: T | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: T | null;
};

/** Uses errors from postgREST: https://docs.postgrest.org/en/latest/references/errors.html */
export type PGGraphQLErrorCodes =
  /** A JWT secret is missing from the configuration. */
  | "PGRST300"
  /** JWT expired. */
  | "PGRST301"
  /** Attempted to do a request without authentication when the anonymous role is disabled by not setting it in db-anon-role. */
  | "PGRST302"
  /** Timed out acquiring connection from connection pool. */
  | "PGRST003";

export type PGGraphQLError = {
  code: PGGraphQLErrorCodes;
  details?: unknown;
  hint?: unknown;
  message: string;
};

function QUERY_OBJECT_TO_STRING(query: unknown): string {
  // @ts-expect-error: "value" is private
  return query["value"];
}

/** Main request function using pure fetch. */
export async function graphyRequest<TData, TVariables>(
  { query, variables }: GraphyFetchGraphQLQuery<TData, TVariables>,
  input: string | URL,
  init: RequestInit = {},
): Promise<TData> {
  const meta = query["__meta__"];
  const version = 1;
  const hash = meta && meta["hash"];
  const body: GraphQLQueryBody = {
    query: QUERY_OBJECT_TO_STRING(query) || undefined,
    variables: variables as {},
    extensions: hash ? { ["persistedQuery"]: { ["version"]: version, ["sha256Hash"]: hash } } : undefined,
  };
  const response = await fetch(input, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
    headers: {
      ...HEADERS_JSON,
      ...init.headers,
    },
  }).catch((error: any) => {
    throw new GraphyNetworkError(`Network error: ${error.message}`);
  });

  // NOTE: GraphQL errors comes with status 200.
  if (!response.ok) {
    const errorResponse = await response.text();
    const isJSON = response.headers?.get("content-type")?.includes(MIME_JSON);

    // Try to parse, fallback to just text.
    if (isJSON) {
      const errorResponseJSON = JSON_PARSE_SAFE<PGGraphQLError>(errorResponse);
      if (errorResponseJSON) {
        const code = errorResponseJSON["code"];
        throw new GraphyResponseError(
          `GraphQL request failed with status ${response.status}: ${errorResponse}`,
          response.status,
          code,
        );
      }
    }

    throw new GraphyResponseError(
      `GraphQL request failed with status ${response.status}: ${errorResponse}`,
      response.status,
    );
  }

  // TODO: validate response
  const responseData: { data: TData; errors?: GraphQLErrorType[] } = await response.json();

  if (responseData["errors"] && responseData["errors"].length > 0) {
    throw new GraphyGraphQLError(responseData["errors"], body);
  }

  return responseData["data"];
}

const QUERY_NAME_REGEX = /*#__PURE__*/ /\bquery\s+(\w+)/;

export function GRAPHQL_EXTRACT(document: DocumentTypeDecorationMeta<any, any>) {
  const meta = document["__meta__"];
  const hash = meta && meta["hash"];
  const definitions: Maybe<OperationDefinitionNode[]> = document["definitions"];
  const query_str = QUERY_OBJECT_TO_STRING(document);

  const query_definition_name = definitions?.map((def) => `${def["operation"]} ${def["name"]?.["value"]}`).join(", ");
  const query_name = query_str && QUERY_NAME_REGEX.exec(query_str)?.[1];
  const display = query_definition_name || query_name;
  return { hash, display };
}

/** Extendable GraphQL client. */
export class GraphyClient {
  constructor(
    public readonly url: string | URL,
    protected readonly init: RequestInit = {},
  ) {}

  /**
   * Fetch data from a GraphQL endpoint.
   * @example
   * const data = await client.fetch({ query, variables });
   */
  public async fetch<TData, TVariables>(
    { query, variables }: GraphyFetchGraphQLQuery<TData, TVariables>,
    init?: RequestInit,
  ): Promise<TData> {
    // const { display, hash } = GRAPHQL_EXTRACT(query)
    // const url = NEW_URL(this.url, undefined, { params: { hash, display } });
    const url = this.url;
    return graphyRequest<TData, TVariables>({ query, variables }, url, { ...this.init, ...init });
  }

  /**
   * Fetch data from a GraphQL endpoint and handle errors.
   * @example
   * const { data, error } = await client.query({ query, variables });
   */
  public async query<TData, TVariables>(
    params: GraphyFetchGraphQLQuery<TData, TVariables>,
    init?: RequestInit,
  ): Promise<{ data: TData; error: null } | { data: undefined; error: GraphyError }> {
    try {
      const data = await this.fetch(params, init);
      return { data, error: null };
    } catch (error) {
      if (isGraphyNetworkError(error) || isGraphyResponseError(error) || isGraphyGraphQLError(error)) {
        return { data: undefined, error };
      } else {
        throw error;
      }
    }
  }

  /**
   * Same as `query`, this is just an alias for consistency.
   * @example
   * const { data, error } = await client.mutate({ query, variables });
   */
  public async mutate<TData, TVariables>(
    params: GraphyFetchGraphQLQuery<TData, TVariables>,
    init?: RequestInit,
  ): Promise<{ data: TData; error: null } | { data: undefined; error: GraphyError }> {
    return this.query(params, init);
  }
}

/** GraphQL client for Supabase. */
export class GraphyClientSupabase extends GraphyClient {
  public readonly access_token_hash: string | null;

  constructor(url: string | URL, key: string, access_token?: string | null | undefined, init: RequestInit = {}) {
    const headers: HeadersInit = {};
    headers["apikey"] = key;
    if (access_token) {
      headers["authorization"] = `Bearer ${access_token}`;
    }

    super(url, {
      // cache: "default",
      // credentials: "same-origin",
      ...init,
      headers: {
        ...headers,
        ...init.headers,
      },
    });
    this.access_token_hash = access_token ? HASH(access_token) : null;
  }
}

/** Abstract error class for Graphy errors. */
export abstract class GraphyError extends ErrorExtendable {}

/** Custom error for network-related issues. */
export class GraphyNetworkError extends GraphyError {}

/** Custom error for response status errors (e.g., 400, 500). */
export class GraphyResponseError extends GraphyError {
  public readonly status: number;
  public readonly code?: PGGraphQLErrorCodes;

  constructor(message: string, status: number, code?: PGGraphQLErrorCodes) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Custom error for GraphQL-specific errors. */
export class GraphyGraphQLError extends GraphyError {
  public readonly errors: GraphQLErrorType[];

  constructor(errors: GraphQLErrorType[], query?: GraphQLQueryBody) {
    if (query) {
      super(`GraphQL Error: ${JSON.stringify(errors)} for query: ${JSON.stringify(query)}`);
    } else {
      super(`GraphQL Error: ${JSON.stringify(errors)}`);
    }
    this.errors = errors;
  }
}

/** Guard functions for error identification. */
export function isGraphyError(error: unknown): error is GraphyError {
  return error instanceof GraphyError;
}

/** Guard functions for error identification. */
export function isGraphyNetworkError(error: unknown): error is GraphyNetworkError {
  return error instanceof GraphyNetworkError;
}

/** Guard functions for error identification. */
export function isGraphyResponseError(error: unknown, code?: PGGraphQLErrorCodes): error is GraphyResponseError {
  // return error instanceof GraphyResponseError;
  if (error instanceof GraphyResponseError) {
    if (code) {
      return error.code === code;
    } else {
      return true;
    }
  }
  return false;
}

/** Guard functions for error identification. */
export function isGraphyGraphQLError(error: unknown): error is GraphyGraphQLError {
  return error instanceof GraphyGraphQLError;
}
