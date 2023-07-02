import { VITE_CATS_API_KEY } from "../env";
import { ensureJSONResponse } from "../lib/fetch-lib";
import { ensureNonEmptyString } from "../lib/string-lib";
import { APICatImageMeta } from "./api-types";

export default async function getCatImageMeta(imageId: string) {
  const response: APICatImageMeta = await fetch(
    `https://api.thecatapi.com/v1/images/${imageId}`,
    {
      headers: {
        "x-api-key": ensureNonEmptyString(VITE_CATS_API_KEY),
      },
    }
  ).then(ensureJSONResponse);

  return response;
}
