import getCatBreeds from "../../data-api/getCatBreeds";
import useGlobalAsyncData from "../../hooks/useGlobalAsyncData";

export function useBreeds() {
  return useGlobalAsyncData("breeds", () => {
    return getCatBreeds();
  });
}
