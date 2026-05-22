export type TypedEventListener<M, T extends keyof M> = (evt: M[T]) => void | Promise<void>;

export class TypedCustomEvent<T> {
  public readonly detail: T;
  constructor(
    public readonly type: string,
    opts: { detail: T },
  ) {
    this.detail = opts.detail;
  }
}

export class TypedEventEmitter<M extends Record<string, TypedCustomEvent<any>>> {
  private listeners: { [K in keyof M]?: Set<TypedEventListener<M, K>> } = {};

  public addEventListener<T extends keyof M>(type: T, listener: TypedEventListener<M, T>): void {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }
    this.listeners[type]!.add(listener);
  }

  public removeEventListener<T extends keyof M>(type: T, listener: TypedEventListener<M, T>): void {
    this.listeners[type]?.delete(listener);
  }

  /** Simpler method for `dispatchEvent()`. */
  public async dispatch<T extends keyof M>(type: T, detail: M[T]["detail"]): Promise<boolean> {
    const event = new TypedCustomEvent(type as string, { detail });
    return this.dispatchEvent(event as M[T]);
  }

  public async dispatchEvent<T extends keyof M>(event: M[T]): Promise<boolean> {
    const type = event.type as T;
    const listeners = this.listeners[type];
    if (!listeners || listeners.size === 0) return false;
    for (const listener of listeners) {
      await listener(event);
    }
    return true;
  }
}

/** https://github.com/DerZade/typescript-event-target */

export interface TypedEventListenerObject<M, T extends keyof M> {
  handleEvent: (evt: M[T]) => void | Promise<void>;
}

export type TypedEventListenerOrEventListenerObject<M, T extends keyof M> =
  | TypedEventListener<M, T>
  | TypedEventListenerObject<M, T>;

type ValueIsEvent<T> = {
  [key in keyof T]: Event;
};

/**
 * @deprecated Use TypedEventEmitter instead.
 */
export interface TypedEventTarget<M extends ValueIsEvent<M>> {
  addEventListener: <T extends keyof M & string>(
    type: T,
    listener: TypedEventListenerOrEventListenerObject<M, T> | null,
    options?: boolean | AddEventListenerOptions,
  ) => void;

  removeEventListener: <T extends keyof M & string>(
    type: T,
    callback: TypedEventListenerOrEventListenerObject<M, T> | null,
    options?: EventListenerOptions | boolean,
  ) => void;

  dispatchEvent: (event: Event) => boolean;
}

/**
 * TypedEventTarget is a type-safe EventTarget.
 * @deprecated Use TypedEventEmitter instead.
 * @example
 * const emitter = new TypedEventTarget<{ message: CustomEvent<string> }>();
 * emitter.dispatchTypedEvent("message", new CustomEvent("hello")); // type-safe
 */
// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: this hack is necessary
export class TypedEventTarget<M extends ValueIsEvent<M>> extends EventTarget {
  public dispatchTypedEvent<T extends keyof M>(_type: T, event: M[T]): boolean {
    return super.dispatchEvent(event);
  }
}
