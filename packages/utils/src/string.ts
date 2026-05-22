import type { Maybe } from "./maybe";

/** U+00a0 (non-breaking space) */
export const SPACE_NON_BREAKING = " ";

/**
 * `printf` or `console.log("%s", 1)` equivalente for browsers. Node.js has `util.format()`.
 * @example
 * const formatted = FORMAT("hello %s!", user["name"]);
 * @see https://github.com/tmpfs/format-util/blob/master/format.js
 */
export function FORMAT(fmt: string, ...args: any[]): string {
  const re = /(%?)(%([ojadsO]))/g;
  if (args.length) {
    fmt = fmt.replace(re, (match, escaped, _, flag) => {
      let arg = args.shift();
      switch (flag) {
        case "O": {
          arg = JSON.stringify(arg, null, 2);
          break;
        }
        case "o": {
          arg = JSON.stringify(arg);
          break;
        }
        case "s": {
          arg = `${arg}`;
          break;
        }
        case "d": {
          arg = Number(arg);
          break;
        }
        case "j": {
          arg = JSON.stringify(arg);
          break;
        }
        case "a": {
          arg = `[${Array.from(arg)}]`;
          break;
        }
      }
      if (!escaped) {
        return arg;
      }
      args.unshift(arg);
      return match;
    });
  }

  // arguments remain after formatting
  if (args.length) {
    fmt += ` ${args.join(" ")}`;
  }

  // update escaped %% values
  fmt = fmt.replace(/%{2,2}/g, "%");

  return `${fmt}`;
}

/** ChatGPT made this. */
export function HUMANIZE(string: string): string {
  return string
    .replace(/[_\-·]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}

/** Safe filename */
// export function FILENAMEFY(string: string): string {
//   return filenamify(SLUGIFY(string));
// }

export function PAD(n: string | number, places = 2) {
  return String(n).padStart(places, "0");
}

// https://stackoverflow.com/a/9436948
export function IS_STRING(something: unknown): something is string {
  return typeof something === "string" || something instanceof String;
}

/** Made by ChatGPT */
export function STRING_DIFF(prev: string, next: string): string {
  // Split the strings into lines
  const lines1 = next.split("\n");
  const lines2 = prev.split("\n");

  // Compare the lines in each string
  const result = lines1.map((line, index) => {
    // If the lines are the same, return nothing
    if (line === lines2[index]) {
      return "";
    }

    // If the line only exists in the first string, return it with a minus sign
    if (!lines2[index]) {
      return `- ${line}`;
    }

    // If the line only exists in the second string, return it with a plus sign
    if (!line) {
      return `+ ${lines2[index]}`;
    }

    // If the line exists in both strings but is different, return both versions
    return `- ${line}\n+ ${lines2[index]}`;
  });

  // Join the results back into a single string and return it
  return result
    .filter((line) => line.trim().length > 0) // remove empty lines
    .join("\n");
}

/** TODO: Not very safe, it can still throw. */
export function STRINGIFY_SAFE(obj: any, space?: string | number | undefined) {
  if (!obj) {
    return "{}";
  }
  return JSON.stringify(obj, STRINGIFY_SAFE_FN, space);
}

function STRINGIFY_SAFE_FN(_key: string, value: any) {
  if (value instanceof Set) {
    return [...value];
  } else if (value instanceof Map) {
    return Object.fromEntries(value);
  } else {
    return value;
  }
}

export function TITLE_CASE(string: string): string {
  return string
    .split(" ")
    .map((word) => (word[0] || "").toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Truncate a string to a certain length (no ellipsis).
 */
export function TRUNCATE(str: string, len: number) {
  if (str.length <= len) {
    return str;
  } else {
    return str.slice(0, len);
  }
}

/**
 * Truncate a string to a certain length and add an ellipsis. With ellipsis the result will never surpass len chars.
 */
export function TRUNCATE_ELLIPSIS(str: string, len: number, ellipsis: Maybe<string> = "...") {
  if (str.length <= len) return str;
  const ellipsis_str = ellipsis ?? "";
  const max_content_len = len - ellipsis_str.length;
  return max_content_len <= 0 ? ellipsis_str.slice(0, len) : str.slice(0, max_content_len) + ellipsis_str;
}

/**
 * Remove break lines and extra spaces.
 */
export function STRING_INLINE(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Remove accents, ñ and special chars.
 * https://ricardometring.com/javascript-replace-special-characters
 * https://tonsky.me/blog/unicode/#:~:text=are%20four%20forms%3A-,NFD,-tries%20to%20explode
 */
export function STRING_NORMALIZE(string: string, { keepWhitespace = false, keepDashes = false } = {}): string {
  let result = string.normalize("NFD");
  if (keepWhitespace && keepDashes) {
    result = result.replace(/[\u0300-\u036f]|[^0-9a-zA-Z\s-]/g, "");
  } else if (keepWhitespace) {
    result = result.replace(/[\u0300-\u036f]|[^0-9a-zA-Z\s]/g, "");
  } else if (keepDashes) {
    result = result.replace(/[\u0300-\u036f]|[^0-9a-zA-Z-]/g, "");
  } else {
    result = result.replace(/[\u0300-\u036f]|[^0-9a-zA-Z]/g, "");
  }
  if (keepWhitespace) {
    result = result.replace(/\s+/g, " ").trim();
  }
  return result;
}

export function BASE64_ENCODE(str: string): string {
  return Buffer.from(str).toString("base64");
}
export function BASE64_DECODE(str: string): string {
  return Buffer.from(str, "base64").toString("utf-8");
}

export function LEVENSHTEIN(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const row = dp[i];
      const prev = dp[i - 1];
      if (row && prev) {
        row[j] =
          a[i - 1] === b[j - 1] ? (prev[j - 1] ?? 0) : 1 + Math.min(prev[j] ?? 0, row[j - 1] ?? 0, prev[j - 1] ?? 0);
      }
    }
  }
  return dp[m]?.[n] ?? 0;
}

export function SUGGESTIONS_FIND(path: string, candidates: string[], { limit = 3, threshold = 0.4 } = {}): string[] {
  const target = (path.split("?")[0] ?? path).toLowerCase();
  return candidates
    .map((c) => {
      const dist = LEVENSHTEIN(target, c.toLowerCase());
      const similarity = 1 - dist / Math.max(target.length, c.length);
      return { c, similarity };
    })
    .filter(({ similarity }) => similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(({ c }) => c);
}

/** Like Math.min but for strings. Useful on ISO string dates. Returns null if input is empty. */
export function STRING_MIN(...args: [string, ...string[]]): string; // Doesn't return null if at least one argument
export function STRING_MIN(...args: string[]): string | null;
export function STRING_MIN(...args: string[]): string | null {
  if (args.length === 0) return null;
  return args.reduce((a, b) => (a < b ? a : b));
}
/** Like Math.max but for strings. Useful on ISO string dates. Returns null if input is empty. */
export function STRING_MAX(...args: [string, ...string[]]): string; // Doesn't return null if at least one argument
export function STRING_MAX(...args: string[]): string | null;
export function STRING_MAX(...args: string[]): string | null {
  if (args.length === 0) return null;
  return args.reduce((a, b) => (a > b ? a : b));
}
