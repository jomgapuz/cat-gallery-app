import { VITE_CATS_API_KEY } from "../env";
import { ensureJSONResponse } from "../lib/fetch-lib";
import { ensureNonEmptyString } from "../lib/string-lib";
import { APICatImageMeta } from "./api-types";

export default async function getCatImageMetasByBreed({
  breedId,
  limit = 10,
  page = 0,
  hasBreedInfo = true,
}: {
  breedId: string;
  page?: number;
  limit?: number;
  hasBreedInfo?: boolean;
}) {
  const response: APICatImageMeta[] = await fetch(
    `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&page=${page}&limit=${limit}&has_breeds=${
      hasBreedInfo ? 1 : 0
    }`,
    {
      headers: {
        "x-api-key": ensureNonEmptyString(VITE_CATS_API_KEY),
      },
    }
  ).then(ensureJSONResponse);

  return response;
}
