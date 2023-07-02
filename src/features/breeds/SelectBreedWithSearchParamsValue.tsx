import { useSearchParams } from "react-router-dom";
import SelectBreed from "./SelectBreed";

export default function SelectBreedWithSearchParamsValue() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <SelectBreed
      value={searchParams.get("breedId")}
      onChange={(event) => {
        setSearchParams((current) => {
          current.set("breedId", event.target.value);

          return current;
        });
      }}
    />
  );
}
