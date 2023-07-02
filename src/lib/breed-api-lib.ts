import { Maybe } from "./generic-types";

export function findBreedById<T extends { id: string }>(
  breedId: Maybe<string>,
  breeds: Maybe<T[]>
) {
  if (breedId && breeds) {
    if (breeds.length !== 0) {
      const breedFound = breeds.find(({ id }) => id === breedId);

      if (breedFound) return breedFound;
    }

    return null;
  }

  return undefined;
}
