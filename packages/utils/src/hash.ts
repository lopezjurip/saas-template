/** From color-hash/lib/bkdr-hash */
export function HASH_BKDR(str: string): number {
  const seed = 131;
  const seed2 = 137;
  let hash = 0;
  // make hash more sensitive for short string like 'a', 'b', 'c'
  str += "x";
  // Note: Number.MAX_SAFE_INTEGER equals 9007199254740991
  const MAX_SAFE_INTEGER = Math.floor(9007199254740991 / seed2);
  for (let i = 0; i < str.length; i++) {
    if (hash > MAX_SAFE_INTEGER) {
      hash = Math.floor(hash / seed2);
    }
    hash = hash * seed + str.charCodeAt(i);
  }
  return hash;
}

/** Cross-platform simple hash function. */
export function HASH(str: string): string {
  return String(HASH_BKDR(str));
}
