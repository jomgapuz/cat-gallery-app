import * as React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useBreeds } from "../breeds/useBreeds";
import { findBreedById } from "../../lib/breed-api-lib";
import CatImages from "./CatImages";
import { APICatImageMeta } from "../../data-api/api-types";
import styled from "@emotion/styled";
import Button from "react-bootstrap/Button";
import useBreedImages from "./useBreedImages";
import {
  getCurrentGlobalAsyncData,
  refetchGlobalAsyncData,
  useGlobalAsyncDataContext,
} from "../../hooks/useGlobalAsyncData";
import getCatImageMetasByBreed from "../../data-api/getCatImageMetasByBreed";
import getCatImageMeta from "../../data-api/getCatImageMeta";

const LIMIT = 10;

const StyledDivFlex = styled.div`
  gap: 16px;
`;

const NO_MORE_CAT_IMAGES_MESSAGE =
  "Apologies but we could not load new cats for you at this time! Miau!";

function NoBreedSelectedText() {
  const { data: breeds, loading } = useBreeds();

  if (breeds?.length) {
    return <>No selected breed.</>;
  }

  return <>{loading ? "Loading..." : "No breeds."}</>;
}

function LoadMoreButton({
  onClick,
  breedId,
  page,
}: {
  onClick: () => void;
  page: number;
  breedId: string;
}) {
  const { loading } = useBreedImages({
    breedId: breedId,
    page,
    limit: LIMIT,
  });

  return (
    <Button onClick={onClick} disabled={loading}>
      {loading ? "Loading..." : "Load more"}
    </Button>
  );
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
    loading: false,
  }));

  const pageNumbers = React.useMemo(
    () =>
      Array(page + 1)
        .fill(0)
        .map((_, index) => index),
    [page]
  );

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setErrorMessage("");

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

  const globalContext = useGlobalAsyncDataContext();

  const handleLoadMoreOnClick = React.useCallback(async () => {
    if (!selectedBreed) return;

    setErrorMessage(null);

    const [previousNumberOfPages, currentNumberOfPages] = await new Promise<
      [previousNumberOfPages: number, currentNumberOfPages: number]
    >((resolve) => {
      setPagination((current) => {
        const newFetchAt = Date.now();

        if (LIMIT === current.lastPageCount) {
          const newPage = current.lastPage + 1;

          resolve([current.page, newPage]);

          return {
            ...current,
            page: newPage,
            fetchAt: newFetchAt,
          };
        }

        resolve([current.page, current.page]);

        return {
          ...current,
          fetchAt: newFetchAt,
        };
      });
    });

    // Get current count
    let count = 0;

    Array(previousNumberOfPages + 1)
      .fill(0)
      .forEach((_, pageNumber) => {
        const imageMetasPage = getCurrentGlobalAsyncData<APICatImageMeta[]>(
          globalContext,
          {
            breedId: selectedBreed.id,
            limit: LIMIT,
            page: pageNumber,
          }
        );

        if (imageMetasPage) {
          count += imageMetasPage.length;
        }
      });

    // Get new count
    let newCount = 0;

    await Promise.all(
      Array(currentNumberOfPages + 1)
        .fill(0)
        .map(async (_, pageNumber) => {
          const result = await refetchGlobalAsyncData(
            globalContext,
            {
              breedId: selectedBreed.id,
              limit: LIMIT,
              page: pageNumber,
            },
            ({ breedId: _breedId, limit, page: pageLocal }) => {
              return getCatImageMetasByBreed({
                breedId: _breedId,
                page: pageLocal,
                limit,
              });
            }
          );

          if (result) {
            newCount += result.length;
          }
        })
    );

    if (count === newCount) {
      setErrorMessage(NO_MORE_CAT_IMAGES_MESSAGE);
    }
  }, [globalContext, selectedBreed]);

  const { search } = useLocation();
  const navigate = useNavigate();

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
            onViewDetails={(imageMeta) => {
              refetchGlobalAsyncData(
                globalContext,
                { imageId: imageMeta.id },
                ({ imageId }) => getCatImageMeta(imageId),
                imageMeta
              );

              const { id } = imageMeta;

              navigate({
                pathname: `/${id}`,
                search,
              });
            }}
          />
        ))}
      </StyledDivFlex>

      <div className="mb-3 d-flex align-items-center gap-3">
        <LoadMoreButton
          onClick={handleLoadMoreOnClick}
          breedId={selectedBreed.id}
          page={page}
        />

        {errorMessage ? (
          <div className="text-danger">{errorMessage}</div>
        ) : null}
      </div>
    </>
  );
}
