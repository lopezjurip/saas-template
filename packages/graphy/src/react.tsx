import { useLogger } from "@packages/debug/react-logger";
import type { Maybe } from "@packages/utils/maybe";
import React, { type ReactNode, useCallback, useEffect } from "react";
import useSWR, { type SWRConfiguration } from "swr";
import { GRAPHQL_EXTRACT, type GraphyClientSupabase, type GraphyError, type GraphyFetchGraphQLQuery } from "./graphy";

type GraphyContextValue = {
  client: GraphyClientSupabase;
  namespace: string;
};

export const GraphyContext = /*#__PURE__*/ React.createContext<GraphyContextValue | null>(null);

export type GraphyProviderProps = {
  children: ReactNode;
  value: GraphyClientSupabase;
  /**
   * SWR cache namespace to isolate keys across multiple clients.
   * @default "graphy"
   */
  namespace?: string;
};

export function GraphyProvider({ value, namespace = "graphy", children }: GraphyProviderProps) {
  return <GraphyContext.Provider value={{ client: value, namespace }}>{children}</GraphyContext.Provider>;
}

export function useGraphy(): GraphyClientSupabase {
  const ctx = React.useContext(GraphyContext);
  if (!ctx) throw new Error("useGraphy must be used within a GraphyProvider");
  return ctx.client;
}

export interface GraphyFetchGraphQLQueryHookParams<TData, TVariables>
  extends GraphyFetchGraphQLQuery<TData, TVariables> {
  /**
   * If true, the request will not be associated with the access_token and will be cached globally.
   * @default undefined
   */
  indifferent?: boolean;
}

export function useGraphyQuery<TData, TVariables>(
  params: Maybe<GraphyFetchGraphQLQueryHookParams<TData, TVariables>>,
  options?: SWRConfiguration<TData, Error>,
) {
  const client = useGraphy();
  const { namespace } = React.useContext(GraphyContext)!;
  const logger = useLogger();

  const document = params && params.query;
  const extracted = document ? GRAPHQL_EXTRACT(document) : null;
  const display = extracted && extracted.display;
  const hash = extracted && extracted.hash;

  const key = params
    ? ([
        namespace,
        String(client.url),
        params && params.indifferent ? null : client.access_token_hash,
        hash,
        (params && params.variables) || null,
      ] as const)
    : null;

  const result = useSWR<TData, GraphyError, typeof key>(
    key,
    async ([, _url, _access_token, _query_hash, variables]) => {
      if (variables) {
        logger.debug(
          "[useGraphyQuery#useSWR] will execute fetch for %o (%s) with variables: %o",
          display,
          hash,
          variables,
        );
      } else {
        logger.debug("[useGraphyQuery#useSWR] will execute fetch for %o (%s)", display, hash);
      }
      if (globalThis.performance) {
        const timeStart = globalThis.performance.now();
        const response = await client.fetch({ query: document!, variables });
        const timeEnd = globalThis.performance.now();
        logger.debug("[useGraphyQuery#useSWR] fetch duration for %o (%s): %dms", display, hash, timeEnd - timeStart);
        return response;
      } else {
        return client.fetch({ query: document!, variables });
      }
    },
    options,
  );

  const error = result.error;
  const executed = Boolean(result.data);

  useEffect(() => {
    if (!hash) {
      return;
    }
    if (error) {
      logger.error("[useGraphyQuery] request %o (%s) got error: %O", display, hash, error);
    } else if (executed) {
      logger.debug("[useGraphyQuery] request %o (%s) executed successfully.", display, hash);
    } else {
      logger.debug("[useGraphyQuery] request %o (%s) is waiting.", display, hash);
    }
  }, [hash, display, executed, error, logger]);

  return result;
}

export type GraphyHookMutationState<TData, TVariables> = {
  data: TData | null;
  variables: TVariables | null;
  error: GraphyError | null;
  isValidating: boolean;
};

const GRAPHY_HOOK_MUTATE_INITIAL_STATE = {
  data: null,
  variables: null,
  error: null,
  isValidating: false,
} satisfies GraphyHookMutationState<any, any>;

export function useGraphyMutation<TData, TVariables>(mutation: GraphyFetchGraphQLQuery<TData, TVariables>["query"]) {
  const client = useGraphy();
  const logger = useLogger();
  const [state, setState] = React.useState<GraphyHookMutationState<TData, TVariables>>(
    GRAPHY_HOOK_MUTATE_INITIAL_STATE,
  );

  const mutate = useCallback(
    async (variables: TVariables, opts: { thrownOnError?: boolean } = {}) => {
      setState({ data: null, variables, error: null, isValidating: true });
      const { data, error } = await client.mutate({ query: mutation, variables });
      setState({ data: data, variables, error: error, isValidating: false });
      if (opts.thrownOnError && error) {
        logger.error("[useGraphyMutation] mutation failed:", error);
        throw error;
      }
      return { data, error };
    },
    [client, mutation, logger],
  );

  return [state, mutate] as const;
}
