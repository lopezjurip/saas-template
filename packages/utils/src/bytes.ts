export type ByteUnit = "B" | "KB" | "MB" | "GB";

export function BYTES_CONVERT(value: number, from: ByteUnit, to: ByteUnit): number {
  const FACTORS: Record<ByteUnit, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };
  return (value * FACTORS[from]) / FACTORS[to];
}
