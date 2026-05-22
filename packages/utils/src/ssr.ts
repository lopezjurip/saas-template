export function isServer() {
  return Boolean(typeof window === "undefined" || !window.document);
}

export function IS_BROWSER() {
  return !isServer();
}

export function IS_REACT_NATIVE() {
  return typeof navigator !== "undefined" && navigator.product === "ReactNative";
}
