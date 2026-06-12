/** https://devtails.xyz/@adam/building-a-promise-pool-in-typescript */
export class PromisePool<T> {
  protected queue: Promise<T>[] = [];
  protected results: T[] = [];

  public constructor(
    public readonly concurrency: number,
    public readonly options?: {
      /** In milliseconds */
      sleep?: number;
      /**
       * Aborts added and pending promises with `abortSignal.throwIfAborted()` if set.
       * Running promises are not affected. Also throws at the end of `flush()`.
       */
      abortSignal?: AbortSignal | null;
    },
  ) {}

  public async add(promise: () => Promise<T>): Promise<void> {
    this.options?.abortSignal?.throwIfAborted();
    if (this.queue.length >= this.concurrency) {
      // halt execution until fastest promise fulfills
      await Promise.race(this.queue);
    }
    this.options?.abortSignal?.throwIfAborted();

    const task = promise();

    const sleep = this.options?.sleep;
    if (sleep && sleep > 0) {
      await new Promise((resolve) => setTimeout(resolve, sleep));
    }

    void task.then((returned) => {
      // When `task` resolves, store the result and remove it from pending queue
      this.results.push(returned);
      this.queue = this.queue.filter((item) => item !== task);
      return returned;
    });

    this.queue.push(task);
  }

  /** Note: return order isn't guaranteed. */
  public async flush(): Promise<T[]> {
    await Promise.all(this.queue);
    this.options?.abortSignal?.throwIfAborted();
    const results = this.results;
    this.results = [];
    return results;
  }

  /**
   * Maps over an array with ordered results, unlike flush().
   */
  public async mapArray<In>(array: In[], fn: (element: In, index: number, array: In[]) => Promise<T>): Promise<T[]> {
    const orderedResults = new Array<T>(array.length);

    for (let i = 0; i < array.length; i++) {
      const element = array[i]!;
      await this.add(async () => {
        const result = await fn(element, i, array);
        orderedResults[i] = result;
        return result;
      });
    }

    await this.flush();
    return orderedResults;
  }
}
