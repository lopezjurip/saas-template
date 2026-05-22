import { describe, expect, it } from "vitest";
import { PromisePool } from "./promise";
import { SLEEP } from "./sleep";

describe("PromisePool", () => {
  it("should run promises concurrently", async () => {
    const pool = new PromisePool(2);
    const results = new Set<number>();
    for (let i = 0; i < 10; i++) {
      await pool.add(async () => {
        await SLEEP(1);
        results.add(i);
      });
    }
    await pool.flush();
    expect(results).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });

  it("should map array using the pool", async () => {
    const pool = new PromisePool(2);
    const array = [1, 2, 3, 4, 5];
    const results = await pool.mapArray(array, async (x) => {
      await SLEEP(1);
      return x * 2;
    });
    expect(results).toEqual([2, 4, 6, 8, 10]);
  });
});
