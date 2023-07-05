import { dequal } from "dequal";
import * as React from "react";
import { areErrorMessagesEquals } from "../lib/error-lib";
import { Maybe } from "../lib/generic-types";
import stableHash from "stable-hash";

export type InferContext<T> = T extends React.Context<infer U> ? U : never;

export const GLOBAL_ASYNC_DATA_CONTEXT = React.createContext({
  data: {} as Record<string, any>,
  listeners: {} as Record<string, (() => void)[]>,
  fetchers: {} as Record<string, (key: any) => any>,
  promises: {} as Record<string, Promise<any> | undefined>,
  errors: {} as Record<string, any>,
});

export type GlobalAsyncDataContext = InferContext<
  typeof GLOBAL_ASYNC_DATA_CONTEXT
>;

export type UseGlobalAsyncDataOptions = {
  checkError?: (a: Maybe<Error>, b: Maybe<Error>) => boolean;
};

export function useGlobalAsyncDataContext() {
  return React.useContext(GLOBAL_ASYNC_DATA_CONTEXT);
}

export default function useGlobalAsyncData<T, Key>(
  key: Maybe<Key>,
  getData: (key: Key) => Promise<T>,
  { checkError = areErrorMessagesEquals }: UseGlobalAsyncDataOptions = {}
) {
  const context = useGlobalAsyncDataContext();

  const {
    data: globalData,
    listeners: globalListeners,
    promises: globalPromises,
    errors: globalErrors,
    fetchers: globalFetchers,
  } = context;

  const [getDataMemoed] = React.useState(() => getData);

  const keyHash = stableHash(key);

  const fullKey = React.useMemo(() => {
    if (key) {
      globalFetchers[keyHash] = getDataMemoed;

      return { hash: keyHash, key };
    }

    return null;
  }, [keyHash]);

  const refetch = React.useMemo(() => {
    if (fullKey == null) {
      return async () => {
        //
      };
    }

    const { hash, key: keyLocal } = fullKey;

    if (!Array.isArray(globalListeners[hash])) {
      globalListeners[hash] = [];
    }

    const listen = () => {
      for (const listenLocal of globalListeners[hash]) {
        listenLocal();
      }
    };

    const getDataAsync = async () => {
      globalErrors[hash] = undefined;

      return globalFetchers[hash](keyLocal);
    };

    return async () => {
      if (!globalPromises[hash]) {
        globalPromises[hash] = getDataAsync()
          .then((result) => {
            if (!dequal(globalData[hash], result)) {
              globalData[hash] = result;
            }
          })
          .catch((error) => {
            globalErrors[hash] = error;
          })
          .finally(() => {
            if (globalPromises[hash]) globalPromises[hash] = undefined;
            listen();
          });
      }

      listen();
    };
  }, [
    fullKey,
    globalData,
    globalErrors,
    globalFetchers,
    globalListeners,
    globalPromises,
  ]);

  const [, _set] = React.useState([]);

  const rerender = React.useCallback(() => {
    _set([]);
  }, []);

  const { data, loading, error } = fullKey
    ? {
        data: globalData[fullKey.hash] as T | undefined,
        loading: Boolean(globalPromises[fullKey.hash]),
        error: globalErrors[fullKey.hash],
      }
    : {
        data: undefined,
        loading: false,
        error: undefined,
      };

  const isRerenderOnRef = React.useRef({
    data: false,
    loading: false,
    error: false,
  });

  React.useEffect(() => {
    if (!fullKey) return;

    const { hash } = fullKey;

    const { [hash]: listeners } = globalListeners;

    const isRerenderOn = isRerenderOnRef.current;

    const handleDataChange = () => {
      if (globalData[hash] !== data) {
        if (isRerenderOn.data) {
          rerender();

          return;
        }
      }

      if (Boolean(globalPromises[hash]) !== loading) {
        if (isRerenderOn.loading) {
          rerender();

          return;
        }
      }

      if (!checkError(error, globalErrors[hash])) {
        if (isRerenderOn.error) {
          rerender();

          return;
        }
      }
    };

    listeners.push(handleDataChange);

    handleDataChange();

    return () => {
      const index = listeners.indexOf(handleDataChange);
      listeners.splice(index, 1);
    };
  }, [
    checkError,
    data,
    error,
    fullKey,
    globalData,
    globalErrors,
    globalListeners,
    globalPromises,
    loading,
    rerender,
  ]);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    get data() {
      isRerenderOnRef.current.data = true;
      return data;
    },
    get loading() {
      isRerenderOnRef.current.loading = true;
      return loading;
    },
    get error() {
      isRerenderOnRef.current.error = true;
      return error;
    },
    refetch,
  };
}

export function getCurrentGlobalAsyncData<Result = any>(
  context: GlobalAsyncDataContext,
  key: any
) {
  if (key == null) return undefined;

  const keyHash = stableHash(key);

  return context.data[keyHash] as Result | undefined;
}

export async function refetchGlobalAsyncData<Key, Result>(
  {
    listeners: globalListeners,
    errors: globalErrors,
    fetchers: globalFetchers,
    promises: globalPromises,
    data: globalData,
  }: GlobalAsyncDataContext,
  key: Maybe<Key>,
  getData: (key: Key) => Promise<Result>
) {
  if (key == null) return undefined;

  const keyHash = stableHash(key);

  globalFetchers[keyHash] = getData;

  if (!Array.isArray(globalListeners[keyHash])) {
    globalListeners[keyHash] = [];
  }

  const listen = () => {
    for (const listenLocal of globalListeners[keyHash]) {
      listenLocal();
    }
  };

  const getDataAsync = async () => {
    globalErrors[keyHash] = undefined;

    return globalFetchers[keyHash](key);
  };

  const currentPromise = globalPromises[keyHash];

  if (!currentPromise) {
    const newPromise = getDataAsync()
      .then((result) => {
        if (!dequal(globalData[keyHash], result)) {
          globalData[keyHash] = result;
        }
      })
      .catch((error) => {
        globalErrors[keyHash] = error;
      })
      .finally(() => {
        if (globalPromises[keyHash]) globalPromises[keyHash] = undefined;
        listen();
      });

    globalPromises[keyHash] = newPromise;

    listen();

    await newPromise;

    return globalData[keyHash] as Result | undefined;
  }

  listen();

  await currentPromise;

  return globalData[keyHash] as Result | undefined;
}
