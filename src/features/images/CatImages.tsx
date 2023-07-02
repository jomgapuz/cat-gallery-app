import { useEffect } from "react";
import useBreedImages from "./useBreedImages";
import { APICatImageMeta } from "../../data-api/api-types";
import styled from "@emotion/styled";
import Button from "react-bootstrap/Button";

const StyledImg = styled.img`
  width: 236px;
  background-color: #ddd;
`;

const StyledDivCard = styled.div`
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

export type CatImagesProps = {
  breedId: string;
  page: number;
  limit?: number;
  fetchAt?: number;
  onLoad?: (imageMetas: APICatImageMeta[] | undefined, page: number) => void;
};

export default function CatImages({
  breedId,
  page,
  limit,
  fetchAt,
  onLoad,
}: CatImagesProps) {
  const { data: imageMetas, refetch } = useBreedImages({
    breedId,
    page,
    limit,
  });

  useEffect(() => {
    if (fetchAt) {
      refetch();
    }
  }, [fetchAt, refetch]);

  useEffect(() => {
    onLoad?.(imageMetas, page);
  }, [imageMetas, onLoad, page]);

  return (
    <>
      {imageMetas?.map(({ id, url, width, height }) => (
        <StyledDivCard key={id}>
          <StyledImg
            src={url}
            alt={id}
            style={{ height: height * (236 / width) }}
          />

          <div className="p-3">
            <Button variant="primary w-100">View Details</Button>
          </div>
        </StyledDivCard>
      ))}
    </>
  );
}
