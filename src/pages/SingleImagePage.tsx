import { Button } from "react-bootstrap";
import MainLayout from "../layout/MainLayout";
import { useParams } from "react-router-dom";
import useCatImageMeta from "../features/images/useCatImageMeta";

export default function SingleImagePage() {
  const params = useParams();

  const { data } = useCatImageMeta(params.imageId);

  const breed = data?.breeds?.[0];

  return (
    <MainLayout>
      <h2 className="mt-2">Cat Gallery</h2>

      <div className="mb-3 d-flex align-items-center gap-3">
        <Button
          onClick={() => {
            window.history.back();
          }}
        >
          Back
        </Button>
      </div>

      <div className="border rounded overflow-hidden mb-4">
        {breed ? (
          <div className="p-2">
            <h3>{breed.name}</h3>

            <p>
              <big>
                <strong>Origin: {breed.origin}</strong>
              </big>
            </p>
            <p>
              <strong>{breed.temperament}</strong>
            </p>
            <p>{breed.description}</p>
          </div>
        ) : null}

        {data ? (
          <div style={{ marginBottom: -8, marginRight: -4, marginLeft: -4 }}>
            <img src={data.url} className="w-100 d-block" />
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
