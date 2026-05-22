import { ASSERT } from "@packages/utils/assert";
import type { Maybe } from "@packages/utils/maybe";
import { SLEEP } from "@packages/utils/sleep";
import type { GraphyClientSupabase } from "./graphy";

/**
 * Parameters for GraphQL cursor-based pagination iterator.
 */
export type GraphyIterCursorParams = {
  /**
   * The key in the response data that contains the paginated collection.
   */
  collectionKey: string;
  /**
   * Number of rows to fetch per query. Default is `100`.
   */
  size?: number;
  /**
   * Maximum number of rows to fetch.
   */
  limit?: number;
  /**
   * Optional sleep time in milliseconds between page fetches.
   */
  sleep?: number;
  /**
   * Sleep mode: "page" sleeps after each page, "iteration" sleeps after each edge.
   */
  sleepMode?: "page" | "iteration";
};

type CollectionLike<TNode> = {
  pageInfo: {
    endCursor?: Maybe<string>;
    hasNextPage: boolean;
  };
  edges: Array<{
    node: TNode;
  }>;
};

/**
 * Iterate over a GraphQL query via cursor-based pagination.
 *
 * Similar to SUPABASE_ITER_KEYSET but for GraphQL queries using Relay-style cursor pagination.
 *
 * @example
 * ```ts
 * const client = CREATE_GRAPHY_CLIENT_ENV(access_token);
 * for await (const { edge, i, page_number } of GRAPHY_ITER_CURSOR<MyNodeType>(client, MyQuery, { filter: {...} }, { collectionKey: "items", size: 100 })) {
 *   console.log(edge);
 * }
 * ```
 */
export async function* GRAPHY_ITER_CURSOR<TNode>(
  client: GraphyClientSupabase,
  query: { __meta__?: { hash?: string } },
  variables: Record<string, unknown>,
  {
    collectionKey,
    size = 100,
    limit = Number.POSITIVE_INFINITY,
    sleep = 0,
    sleepMode = "page",
  }: GraphyIterCursorParams,
): AsyncGenerator<{ edge: { node: TNode }; i: number; page_number: number }, number, unknown> {
  if (Number.isNaN(limit)) {
    throw new Error("[GRAPHY_ITER_CURSOR] Parameter 'limit' must be a finite number");
  } else if (limit < 0) {
    throw new Error("[GRAPHY_ITER_CURSOR] Parameter 'limit' must be greater or equal to 0");
  } else if (Number.isNaN(size)) {
    throw new Error("[GRAPHY_ITER_CURSOR] Parameter 'size' must be a finite number");
  } else if (size < 0) {
    throw new Error("[GRAPHY_ITER_CURSOR] Parameter 'size' must be greater or equal to 0");
  }

  let i = 0;
  let page_length = 0;
  let page_number = 0;
  let after_cursor: string | null = null;
  let has_next_page = true;

  do {
    const paginationVariables = {
      ...variables,
      first: size,
      after: after_cursor,
      before: null,
      last: null,
    };

    const data = await client.fetch({ query, variables: paginationVariables });
    ASSERT(data);

    // @ts-expect-error: dynamic key
    const collection = data[collectionKey] as Maybe<CollectionLike<TNode>>;
    if (!collection) {
      break;
    }
    const pageInfo = collection["pageInfo"];
    const edges = collection["edges"];
    page_length = edges?.length || 0;

    if (edges) {
      for (const edge of edges) {
        if (i < limit) {
          yield { edge, i, page_number };
          if (sleepMode === "iteration" && sleep > 0) {
            await SLEEP(sleep);
          }
        } else {
          break;
        }
        i += 1;
      }
      page_number += 1;
    }

    // Update cursor for next iteration
    after_cursor = pageInfo["endCursor"] ?? null;
    has_next_page = pageInfo["hasNextPage"] ?? false;

    if (sleepMode === "page" && sleep > 0) {
      await SLEEP(sleep);
    }
  } while (has_next_page && i < limit);

  return i;
}
