import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useBreeds } from "../breeds/useBreeds";
import { findBreedById } from "../../lib/breed-api-lib";
import CatImages from "./CatImages";
import { APICatImageMeta } from "../../data-api/api-types";
import styled from "@emotion/styled";
import Button from "react-bootstrap/Button";

const LIMIT = 10;

const StyledDivFlex = styled.div`
  gap: 16px;
`;

function NoBreedSelectedText() {
  const { data: breeds, loading } = useBreeds();

  if (breeds?.length) {
    return <>No selected breed.</>;
  }

  return <>{loading ? "Loading..." : "No breeds."}</>;
}

export default function CatImageGrid() {
  const [searchParams] = useSearchParams();
  const { data: breeds } = useBreeds();

  const breedIdParam = searchParams.get("breedId");

  const selectedBreed = React.useMemo(
    () => findBreedById(breedIdParam, breeds),
    [breedIdParam, breeds]
  );

  const [{ page, fetchAt }, setPagination] = React.useState(() => ({
    page: 0,
    fetchAt: Date.now(),
    lastPage: 0,
    lastPageCount: 0,
  }));

  const pageNumbers = React.useMemo(
    () =>
      Array(page + 1)
        .fill(0)
        .map((_, index) => index),
    [page]
  );

  React.useEffect(() => {
    setPagination((current) => ({
      ...current,
      page: 0,
      fetchAt: Date.now(),
    }));
  }, [selectedBreed?.id]);

  const handleOnLoad = React.useCallback(
    (imageMetas: APICatImageMeta[] | undefined, pageLocal: number) => {
      if (imageMetas) {
        setPagination((current) => {
          if (imageMetas.length && pageLocal >= current.page) {
            return {
              ...current,
              lastPage: pageLocal,
              lastPageCount: imageMetas.length,
            };
          }

          return current;
        });
      }
    },
    []
  );

  if (!selectedBreed) {
    return (
      <>
        <p>
          <NoBreedSelectedText />
        </p>
      </>
    );
  }

  return (
    <>
      <StyledDivFlex className="d-flex flex-wrap align-items-start mb-3">
        {pageNumbers.map((pageNumber) => (
          <CatImages
            key={pageNumber}
            breedId={selectedBreed.id}
            page={pageNumber}
            limit={LIMIT}
            fetchAt={fetchAt}
            onLoad={handleOnLoad}
          />
        ))}
      </StyledDivFlex>

      <div className="mb-3">
        <Button
          onClick={() => {
            setPagination((current) => {
              const newFetchAt = Date.now();

              if (LIMIT === current.lastPageCount) {
                return {
                  ...current,
                  page: current.lastPage + 1,
                  fetchAt: newFetchAt,
                };
              }

              return {
                ...current,
                fetchAt: newFetchAt,
              };
            });
          }}
        >
          Load more
        </Button>
      </div>
    </>
  );
}
