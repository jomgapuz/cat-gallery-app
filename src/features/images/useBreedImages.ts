import getCatImageMetasByBreed from "../../data-api/getCatImageMetasByBreed";
import useGlobalAsyncData from "../../hooks/useGlobalAsyncData";
import { Maybe } from "../../lib/generic-types";

export default function useBreedImages(params: {
  breedId: Maybe<string>;
  page?: number;
  limit?: number;
}) {
  const { breedId } = params;

  return useGlobalAsyncData(
    breedId ? { ...params, breedId } : null,
    ({ breedId: _breedId, limit, page }) => {
      return getCatImageMetasByBreed({
        breedId: _breedId,
        page: page,
        limit,
      });
    }
  );
}
