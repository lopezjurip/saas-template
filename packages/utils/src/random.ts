/** Random integer: min and max included. */
export function RANDOM_INT(min = 0, max = 100): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function RANDOM_FLOAT(min = 0, max = 1): number {
  return Math.random() * (max - min) + min;
}
