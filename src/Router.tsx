import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootPage from "./pages/RootPage";
import SingleImagePage from "./pages/SingleImagePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootPage />,
  },
  {
    path: "/:imageId",
    element: <SingleImagePage />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
