import SelectBreedWithSearchParamsValue from "../features/breeds/SelectBreedWithSearchParamsValue";
import MainLayout from "../layout/MainLayout";

export default function RootPage() {
  return (
    <MainLayout>
      <div>
        <div className="d-inline-block">
          <SelectBreedWithSearchParamsValue />
        </div>
      </div>
    </MainLayout>
  );
}
