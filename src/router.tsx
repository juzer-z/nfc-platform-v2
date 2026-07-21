import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AdminRouteGuard } from "./components/admin-route-guard";
import { AppShell } from "./shell/app-shell";
import { HomePage } from "./views/home-page";
import { PublicProfilePage } from "./views/public-profile-page";

const AdminLoginPage = lazy(() =>
  import("./views/admin-login-page").then((module) => ({
    default: module.AdminLoginPage,
  }))
);
const AdminProfilesPage = lazy(() =>
  import("./views/admin-profiles-page").then((module) => ({
    default: module.AdminProfilesPage,
  }))
);
const AdminProfileEditorPage = lazy(() =>
  import("./views/admin-profile-editor-page").then((module) => ({
    default: module.AdminProfileEditorPage,
  }))
);

function RouteLoader() {
  return (
    <div className="mx-auto flex min-h-[45vh] w-full max-w-5xl items-center justify-center px-4 py-10">
      <div className="rounded-[24px] border border-white/10 bg-white/6 px-5 py-4 text-sm text-white/70 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        Loading page...
      </div>
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "u/:slug", element: <PublicProfilePage /> },
      { path: "admin/login", element: withSuspense(<AdminLoginPage />) },
      {
        path: "admin",
        element: <AdminRouteGuard />,
        children: [
          { path: "profiles", element: withSuspense(<AdminProfilesPage />) },
          {
            path: "profiles/new",
            element: withSuspense(<AdminProfileEditorPage mode="create" />),
          },
          {
            path: "profiles/:id",
            element: withSuspense(<AdminProfileEditorPage mode="edit" />),
          },
        ],
      },
    ],
  },
]);
