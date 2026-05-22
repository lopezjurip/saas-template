import { type Diary, diary, enable } from "diary";

export type DebugInstance = Diary;

export const LOGGER_NOOP: Diary = /*#__PURE__*/ {
  fatal: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  info: () => {},
  log: () => {},
};

export const LOGGER_CONSOLE: Diary = /*#__PURE__*/ {
  fatal: console.error.bind(console),
  debug: console.debug.bind(console),
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

export function CREATE_DEBUGGER(base: string, filterQuery?: string | null) {
  let excludesRegex: RegExp[] = [];

  if (filterQuery) {
    const filters = filterQuery.split(/[\s,]+/);
    const isExclude = (name: string) => name[0] === "-";
    const allows = filters.filter((f) => !isExclude(f));
    const excludes = filters.filter((f) => isExclude(f));
    excludesRegex = excludes.map((e) => new RegExp(`${e.slice(1).replace(/\*/g, ".*")}$`));

    const query = allows.join(",");
    if (query) {
      if (query.startsWith(base)) {
        enable(query);
      } else {
        enable(`${base}:${query}`);
      }
    }
  }

  return function namespaced(namespace: string): DebugInstance {
    const name = `${base}:${namespace}`;
    if (excludesRegex.some((r) => r.test(name))) {
      return LOGGER_NOOP;
    }
    return diary(name);
  };
}

export function censure(secret: string | undefined | null) {
  return "*".repeat((secret || "").length) || undefined;
}
