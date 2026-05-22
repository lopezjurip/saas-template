export function SUM(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
