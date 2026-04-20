interface Disposable {
  dispose(): Promise<void> | void;
}

interface CreateSingleKeyResourceOptions<TKey, TValue extends Disposable> {
  create: (key: TKey) => Promise<TValue> | TValue;
}

/**
 * Keeps a single disposable resource alive for the current key.
 *
 * Repeated `get(key)` calls reuse the current resource while the key matches.
 * When the key changes, the previous resource is disposed before the new one
 * becomes current. Concurrent `get(key)` calls for the same key share the same
 * in-flight creation promise.
 */
export function createSingleKeyResource<
  TKey,
  TValue extends Disposable,
>({ create }: CreateSingleKeyResourceOptions<TKey, TValue>) {
  let currentKey: TKey | null = null;
  let currentValue: TValue | null = null;
  let currentValuePromise: Promise<TValue> | null = null;

  /**
   * Returns the current resource for `key`, creating it when needed.
   */
  const get = async (key: TKey): Promise<TValue> => {
    if (currentKey !== null && Object.is(currentKey, key)) {
      if (currentValue) {
        return currentValue;
      }

      if (currentValuePromise) {
        return currentValuePromise;
      }
    }

    const previousValue = currentValue;
    currentKey = key;
    currentValue = null;

    const nextValuePromise = Promise.resolve(create(key));
    currentValuePromise = nextValuePromise;

    const nextValue = await nextValuePromise;

    if (previousValue) {
      await previousValue.dispose();
    }

    if (currentValuePromise !== nextValuePromise) {
      await nextValue.dispose();
      return get(key);
    }

    currentValue = nextValue;
    currentValuePromise = null;

    return nextValue;
  };

  /**
   * Disposes the current resource and clears the tracked key.
   */
  const clear = async () => {
    currentKey = null;
    currentValuePromise = null;

    if (!currentValue) {
      return;
    }

    const value = currentValue;
    currentValue = null;
    await value.dispose();
  };

  return {
    get,
    clear,
  };
}
