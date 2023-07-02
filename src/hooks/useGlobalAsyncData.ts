import { dequal } from "dequal";
import * as React from "react";
import { areErrorMessagesEquals } from "../lib/error-lib";
import { Maybe } from "../lib/generic-types";

const GLOBAL_ASYNC_DATA_CONTEXT = React.createContext({
  data: {} as Record<string, any>,
  listeners: {} as Record<string, (() => void)[]>,
  promises: {} as Record<string, Promise<any> | undefined>,
  errors: {} as Record<string, Error | undefined>,
});

export type UseGlobalAsyncDataOptions = {
  checkError?: (a: Maybe<Error>, b: Maybe<Error>) => boolean;
};

export default function useGlobalAsyncData<T>(
  key: string,
  getData: (
    // eslint-disable-next-line no-shadow
    key: string
  ) => Promise<T>,
  { checkError = areErrorMessagesEquals }: UseGlobalAsyncDataOptions = {}
) {
  const context = React.useContext(GLOBAL_ASYNC_DATA_CONTEXT);

  const {
    data: globalData,
    listeners: globalListeners,
    promises: globalPromises,
    errors: globalErrors,
  } = context;

  const [getDataMemoed] = React.useState(() => getData);

  const refetch = React.useMemo(() => {
    if (!Array.isArray(globalListeners[key])) {
      globalListeners[key] = [];
    }

    const listen = () => {
      for (const listenLocal of globalListeners[key]) {
        listenLocal();
      }
    };

    const getDataAsync = async () => {
      globalErrors[key] = undefined;

      return getDataMemoed(key);
    };

    return () => {
      if (!globalPromises[key]) {
        globalPromises[key] = getDataAsync()
          .then((result) => {
            if (!dequal(globalData[key], result)) {
              globalData[key] = result;
            }
          })
          .catch((error) => {
            globalErrors[key] = error;
          })
          .finally(() => {
            if (globalPromises[key]) globalPromises[key] = undefined;
            listen();
          });
      }

      listen();
    };
  }, [
    getDataMemoed,
    globalData,
    globalErrors,
    globalListeners,
    globalPromises,
    key,
  ]);

  const [, _set] = React.useState([]);

  const rerender = React.useCallback(() => {
    _set([]);
  }, []);

  const data = globalData[key] as T | undefined;
  const loading = Boolean(globalPromises[key]);
  const error = globalErrors[key];

  const isRerenderOnRef = React.useRef({
    data: false,
    loading: false,
    error: false,
  });

  React.useEffect(() => {
    const { [key]: listeners } = globalListeners;

    const isRerenderOn = isRerenderOnRef.current;

    const handleDataChange = () => {
      if (globalData[key] !== data) {
        if (isRerenderOn.data) {
          rerender();

          return;
        }
      }

      if (Boolean(globalPromises[key]) !== loading) {
        if (isRerenderOn.loading) {
          rerender();

          return;
        }
      }

      if (!checkError(error, globalErrors[key])) {
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
    globalData,
    globalErrors,
    globalListeners,
    globalPromises,
    key,
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
