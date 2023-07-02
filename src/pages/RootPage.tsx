import SelectBreedWithSearchParamsValue from "../features/breeds/SelectBreedWithSearchParamsValue";
import CatImageGrid from "../features/images/CatImagesGrid";
import MainLayout from "../layout/MainLayout";

export default function RootPage() {
  return (
    <MainLayout>
      <h2 className="mt-2">Cat Gallery</h2>

      <div className="mb-3">
        <div className="d-inline-block">
          <SelectBreedWithSearchParamsValue />
        </div>
      </div>

      <CatImageGrid />
    </MainLayout>
  );
}
