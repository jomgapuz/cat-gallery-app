import { ensureJSONResponse } from "../lib/fetch-lib";
import { APIBreed } from "./api-types";

export default async function getCatBreeds() {
  const response: APIBreed[] = await fetch(
    "https://api.thecatapi.com/v1/breeds"
  ).then(ensureJSONResponse);

  try {
    return response.map(({ id, name, origin, temperament, description }) => ({
      id,
      name,
      origin,
      temperament,
      description,
    }));
  } catch {
    throw new Error("Invalid response");
  }
}
