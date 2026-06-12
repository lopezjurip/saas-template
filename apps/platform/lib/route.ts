import { IS_STRING } from "@packages/utils/string";
import type { Route } from "next";

type RouteQueryValue = bigint | boolean | number | string;
type RouteQuery = Record<string, RouteQueryValue | readonly RouteQueryValue[] | null | undefined>;

type RouteParamNames<Pathname extends string> = Pathname extends `${string}[[...${infer Param}]]${infer Rest}`
  ? Param | RouteParamNames<Rest>
  : Pathname extends `${string}[...${infer Param}]${infer Rest}`
    ? Param | RouteParamNames<Rest>
    : Pathname extends `${string}[${infer Param}]${infer Rest}`
      ? Param | RouteParamNames<Rest>
      : never;

type RequiredRouteParamNames<Pathname extends string> = Exclude<RouteParamNames<Pathname>, "locale">;

type RouteQueryFor<Pathname extends string> = RouteQuery & {
  [Param in RequiredRouteParamNames<Pathname>]: RouteQueryValue;
} & {
  locale?: RouteQueryValue;
};

type RouteArguments<Pathname extends string> = [RequiredRouteParamNames<Pathname>] extends [never]
  ? [query?: RouteQueryFor<Pathname>, hash?: string]
  : [query: RouteQueryFor<Pathname>, hash?: string];

export type AppRoute<Pathname extends string = string> = {
  pathname: Pathname;
  query?: RouteQueryFor<Pathname>;
  hash?: string;
};

export function ROUTE_PATH<const Pathname extends string>(pathname: Pathname & Route<Pathname>): Pathname {
  return pathname;
}

export function ROUTE<const Pathname extends string>(
  pathname: Pathname & Route<Pathname>,
  ...[query, hash]: RouteArguments<Pathname>
): AppRoute<Pathname> | Route {
  // return { pathname, query, hash };
  return ROUTE_HREF({ pathname, query, hash });
}

export function UNSAFE_ROUTE(pathname: string, query?: RouteQuery, hash?: string): AppRoute {
  return { pathname, query, hash };
}

export function ROUTE_HREF(route: AppRoute | Route): Route {
  if (IS_STRING(route)) {
    return route;
  }

  // TODO: use urls.ts: URL_NEW
  const query = { ...route["query"] };

  const pathname = route["pathname"].replace(/\[([^\]]+)\]/g, (_, key: string) => {
    const value = query[key];
    if (value === undefined && key === "locale") {
      return "_";
    } else if (value === undefined || value === null || Array.isArray(value)) {
      throw new Error(`Missing scalar route segment: ${key}`);
    } else {
      delete query[key];
      return encodeURIComponent(String(value));
    }
  });

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) search.append(key, String(item));
      }
    } else {
      search.set(key, String(value));
    }
  }

  const queryString = search.toString();
  const hash = route["hash"] ? `#${route["hash"]}` : "";
  return `${pathname}${queryString ? `?${queryString}` : ""}${hash}` as Route;
}
