import * as React from "react";

import { FormSelectProps } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { findBreedById } from "../../lib/breed-api-lib";
import { APIBreed } from "../../data-api/api-types";
import { useBreeds } from "./useBreeds";
const { Label, Select } = Form;

export type SelectBreedOption = {
  id: string;
  name: string;
};

function NonOptionText() {
  const { loading } = useBreeds();

  return <>{loading ? "Loading breeds..." : "Select breed"}</>;
}

export type SelectBreedProps = {
  value?: string | null | undefined;
  onChange?: FormSelectProps["onChange"];
  onBreed?: (breed: APIBreed | null | undefined) => void;
};

export default function SelectBreed({
  value,
  onChange,
  onBreed,
}: SelectBreedProps) {
  const { data } = useBreeds();
  const [localValue, setLocalValue] = React.useState<string | null>("");

  const valueFinal = value === undefined ? localValue : value;

  const selectedBreed = React.useMemo(
    () => findBreedById(valueFinal, data),
    [valueFinal, data]
  );

  React.useEffect(() => {
    onBreed?.(selectedBreed);
  }, [data, onBreed, selectedBreed]);

  const hasBreeds = data ? data.length !== 0 : false;

  const handleOnChange = React.useMemo(() => {
    if (onChange) {
      if (value === undefined) {
        return (event: React.ChangeEvent<HTMLSelectElement>) => {
          setLocalValue(event.target.value);
          onChange(event);
        };
      }

      return (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(event);
      };
    }

    if (value === undefined) {
      return (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLocalValue(event.target.value);
      };
    }
  }, [onChange, value]);

  return (
    <>
      <Label htmlFor="cat-breed-select">Breed</Label>
      <InputGroup>
        <Select
          id="cat-breed-select"
          disabled={!hasBreeds}
          value={value !== undefined ? selectedBreed?.id || "" : undefined}
          onChange={handleOnChange}
        >
          <option value="">
            <NonOptionText />
          </option>

          {data?.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
      </InputGroup>
    </>
  );
}
