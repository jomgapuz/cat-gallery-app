import getCatImageMeta from "../../data-api/getCatImageMeta";
import useGlobalAsyncData from "../../hooks/useGlobalAsyncData";
import { Maybe } from "../../lib/generic-types";

export default function useCatImageMeta(imageId: Maybe<string>) {
  return useGlobalAsyncData(
    imageId ? { imageId } : null,
    ({ imageId: imageIdLocal }) => getCatImageMeta(imageIdLocal)
  );
}
