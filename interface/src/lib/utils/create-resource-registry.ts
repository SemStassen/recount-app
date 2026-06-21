interface Disposable {
  readonly dispose: () => Promise<void> | void;
}

interface CreateCurrentResourceRegistryOptions<
  TKey,
  TValue extends Disposable,
> {
  readonly load: (key: TKey) => Promise<TValue> | TValue;
  readonly equals?: (a: TKey, b: TKey) => boolean;
}

/**
 * Keeps one keyed disposable resource alive at a time.
 *
 * Repeated `load(key)` calls reuse the current resource while the key matches.
 * When the key changes, the previous resource is disposed before the new one
 * becomes current. Concurrent `load(key)` calls for the same key share the same
 * in-flight creation promise.
 */
export function createCurrentResourceRegistry<TKey, TValue extends Disposable>({
  load,
  equals = Object.is,
}: CreateCurrentResourceRegistryOptions<TKey, TValue>) {
  let currentKey: TKey | null = null;
  let currentValue: TValue | null = null;
  let currentValuePromise: Promise<TValue> | null = null;

  const loadResource = async (key: TKey): Promise<TValue> => {
    if (currentKey !== null && equals(currentKey, key)) {
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

    const nextValuePromise = Promise.resolve(load(key));
    currentValuePromise = nextValuePromise;

    let nextValue: TValue;

    try {
      nextValue = await nextValuePromise;
    } catch (error) {
      if (currentValuePromise === nextValuePromise) {
        currentKey = null;
        currentValuePromise = null;
      }

      throw error;
    }

    if (previousValue) {
      await previousValue.dispose();
    }

    if (currentValuePromise !== nextValuePromise) {
      await nextValue.dispose();
      throw new Error("Resource registry load superseded");
    }

    currentValue = nextValue;
    currentValuePromise = null;

    return nextValue;
  };

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
    load: loadResource,
    clear,
  };
}
