/**
 * Headless hooks for cursor-based and offset-based GraphQL pagination.
 * Prefer cursor-based pagination — it's faster and more efficient.
 */

import { useLogger } from "@packages/debug/react-logger";
import type { Maybe } from "@packages/utils/maybe";
import { FLOOR, IS_FINITE } from "@packages/utils/number";
import type React from "react";
import { useState } from "react";
import type { PageInfo } from "./graphy";

export type PaginationHookCursor =
  | {
      /** Required to have a starting page size. */
      first: number;
      /** Optional if you set the other value. */
      last?: Maybe<number>;
      after?: Maybe<string>;
      before?: Maybe<string>;
    }
  | {
      /** Optional if you set the other value. */
      first?: Maybe<number>;
      /** Required to have a starting page size. */
      last: number;
      after?: Maybe<string>;
      before?: Maybe<string>;
    };

export type PaginationHookOffset =
  | {
      /** Required to have a starting page size. */
      first: number;
      last?: Maybe<number>;
      offset?: Maybe<number>;
    }
  | {
      first?: Maybe<number>;
      /** Required to have a starting page size. */
      last: number;
      offset?: Maybe<number>;
    };

/**
 * Make sure to put this hook before the graphy query.
 */
export function usePaginationCursorState(initial: PaginationHookCursor) {
  const [pagination, setPagination] = useState<PaginationHookCursor>(initial);
  return [pagination, setPagination] as const;
}

export function usePaginationOffsetState(initial: PaginationHookOffset) {
  const [pagination, setPagination] = useState<PaginationHookOffset>(initial);
  return [pagination, setPagination] as const;
}

export type PaginationCursorOptions = {
  /**
   * If true, the limit will be reset when the limit is changed.
   * @default true
   */
  limitReset?: boolean;
};

/**
 * Headless hook to handle pagination actions for cursor-based pagination.
 * @example
  ```tsx
  const QueryDocument = gql(`
    query QueryDocument($after: Cursor, $before: Cursor, $first: Int, $last: Int) {
      rows: dataCollection(first: $first, after: $after, before: $before, last: $last) {
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        edges {
          node {
            id
          }
        }
      }
    }
  `);
  const [pagination, dispatcher] = usePaginationCursorState({ first: 100 });
  const { data } = useGraphyQuery({
    query: QueryDocument,
    variables: { ...pagination },
  });
  const paginationActions = usePaginationCursor(data?.["rows"]?.["pageInfo"], pagination, dispatcher);
  ```
 */
export function usePaginationCursor(
  pageInfo: Maybe<PageInfo>,
  pagination: PaginationHookCursor,
  dispatcher: React.Dispatch<React.SetStateAction<PaginationHookCursor>>,
  { limitReset = true }: PaginationCursorOptions = {},
) {
  const logger = useLogger();
  const isLoading = !pageInfo;
  const hasPreviousPage = pageInfo && pageInfo["hasPreviousPage"];
  const hasNextPage = pageInfo && pageInfo["hasNextPage"];

  const limitDefault = (pagination["first"] ?? pagination["last"])!;

  function handleChangeLimit(limit: number) {
    if (!IS_FINITE(limit)) {
      return logger.warn("[usePaginationCursor#handleChangeLimit] limit is not a number: %o", limit);
    }
    dispatcher((state: PaginationHookCursor) => {
      const after = limitReset ? null : state["after"];
      const before = limitReset ? null : state["before"];
      if (IS_FINITE(state["first"])) {
        return { ...state, first: limit, last: undefined, after, before };
      } else {
        return { ...state, first: undefined, last: limit, after, before };
      }
    });
  }

  function handleNextPage() {
    if (hasNextPage) {
      dispatcher((state: PaginationHookCursor) => {
        const cursor = pageInfo["endCursor"];
        const next: PaginationHookCursor = {
          ...state,
          after: cursor,
          first: state["last"] ?? limitDefault,
          before: null,
          last: null,
        };
        logger.log("[usePaginationCursor#handleNextPage] will go from %o to %o", state, next);
        return next;
      });
    }
  }

  function handlePreviousPage() {
    if (hasPreviousPage) {
      dispatcher((state: PaginationHookCursor) => {
        const cursor = pageInfo["startCursor"];
        const next: PaginationHookCursor = {
          ...state,
          after: null,
          first: null,
          before: cursor,
          last: state["first"] ?? limitDefault,
        };
        logger.log("[usePaginationCursor#handlePreviousPage] will go from %o to %o", state, next);
        return next;
      });
    }
  }

  function handleFirstPage() {
    dispatcher({
      after: null,
      first: limitDefault,
      before: null,
      last: null,
    });
  }

  function handleLastPage() {
    dispatcher({
      after: null,
      first: null,
      before: null,
      last: limitDefault,
    });
  }

  function reset() {
    dispatcher({
      after: null,
      first: limitDefault,
      before: null,
      last: null,
    });
  }

  return {
    isLoading,
    limit: limitDefault,
    hasPreviousPage,
    hasNextPage,
    hasMorePages: hasNextPage || hasPreviousPage,
    handleChangeLimit,
    handleNextPage,
    handlePreviousPage,
    handleFirstPage,
    handleLastPage,
    reset,
  };
}

/**
 * Hook to manage pagination state for offset-based pagination.
 * @example
  const [pagination, dispatcher] = usePaginationOffsetState({ first: 100 });
  const { data } = useGraphyQuery({
    query: QueryDocument,
    variables: { ...pagination },
  });
  const paginationActions = usePaginationOffset(data?.["rows"]?.["pageInfo"], pagination, dispatcher);
 */
export function usePaginationOffset(
  pageInfo: Maybe<PageInfo>,
  pagination: PaginationHookOffset,
  dispatcher: React.Dispatch<React.SetStateAction<PaginationHookOffset>>,
) {
  const limitDefault = (pagination["first"] || pagination["last"])!;

  /** Human (first is 1) */
  const pageCurrent = FLOOR((pagination.offset || 0) / (pagination.first || limitDefault)) + 1;
  const hasPreviousPage = pageInfo?.["hasPreviousPage"];
  const hasNextPage = pageInfo?.["hasNextPage"];

  function handleGoToPage(page: number) {
    const { first } = pagination;
    if (page < 1) {
      page = 1;
    }
    const offset = (page - 1) * (first || limitDefault);
    dispatcher((prev: PaginationHookOffset) => {
      return {
        ...prev,
        offset: offset,
      };
    });
  }

  function handleChangeLimit(newLimit: number) {
    dispatcher((prev: PaginationHookOffset) => {
      return {
        ...prev,
        first: newLimit,
        offset: 0,
      };
    });
  }

  function handleNextPage() {
    const { offset, first } = pagination;
    dispatcher((prev: PaginationHookOffset) => {
      return {
        ...prev,
        offset: (offset || 0) + (first || limitDefault),
      };
    });
  }

  function handlePreviousPage() {
    const { offset, first } = pagination;
    dispatcher((prev: PaginationHookOffset) => {
      return {
        ...prev,
        offset: Math.max((offset || 0) - (first || limitDefault), 0),
      };
    });
  }

  return {
    pageCurrent,
    hasPreviousPage,
    hasNextPage,
    handleGoToPage,
    handleChangeLimit,
    handleNextPage,
    handlePreviousPage,
  };
}

export type PaginationCursorActions = ReturnType<typeof usePaginationCursor>;

export type VariableSimple = {
  filter?: Maybe<Record<string, any>>;
  after?: Maybe<any>;
  first?: Maybe<any>;
  before?: Maybe<any>;
  last?: Maybe<any>;
};

/**
 * Helper to build admin tables with GraphQL.
 * @deprecated use `usePaginationCursor(...)` instead
 */
export function useGraphQLTableCursor<Node>(
  data: Maybe<{ pageInfo: PageInfo; edges: { node: Node }[] }>,
  variables: VariableSimple,
  variablesSet: React.Dispatch<React.SetStateAction<VariableSimple>>,
) {
  const LIMIT_DEFAULT = variables["first"] || 100;
  const edges = data?.["edges"];
  const headers = edges?.[0]?.["node"]
    ? (Object.keys(edges[0]["node"]).filter((h) => h !== "__typename") as Array<keyof Node>)
    : [];

  const pageInfo = data?.["pageInfo"];
  const hasPreviousPage = pageInfo?.["hasPreviousPage"];
  const hasNextPage = pageInfo?.["hasNextPage"];

  function handleChangeLimit(limit: number) {
    variablesSet((state: VariableSimple) => ({
      ...state,
      first: IS_FINITE(state["first"]) ? limit : state["first"],
      last: IS_FINITE(state["last"]) ? limit : state["last"],
    }));
  }

  function handleNextPage() {
    if (pageInfo?.["hasNextPage"]) {
      variablesSet((state: VariableSimple) => ({
        ...state,
        after: pageInfo["endCursor"],
        first: state["last"] || LIMIT_DEFAULT,
        before: null,
        last: null,
      }));
    }
  }

  function handlePreviousPage() {
    if (pageInfo?.["hasPreviousPage"]) {
      variablesSet((state: VariableSimple) => ({
        ...state,
        after: null,
        first: null,
        before: pageInfo["startCursor"],
        last: state["first"] || LIMIT_DEFAULT,
      }));
    }
  }

  function* iterator() {
    if (edges) {
      for (const edge of edges) {
        const node = edge["node"];
        if (node) {
          yield { node };
        }
      }
    }
  }

  return { headers, hasPreviousPage, hasNextPage, iterator, handleChangeLimit, handleNextPage, handlePreviousPage };
}
