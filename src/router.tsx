import { createBrowserRouter } from "react-router-dom";
import { AdminRouteGuard } from "./components/admin-route-guard";
import { AppShell } from "./shell/app-shell";
import { HomePage } from "./views/home-page";
import { PublicProfilePage } from "./views/public-profile-page";
import { AdminLoginPage } from "./views/admin-login-page";
import { AdminProfilesPage } from "./views/admin-profiles-page";
import { AdminProfileEditorPage } from "./views/admin-profile-editor-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "u/:slug", element: <PublicProfilePage /> },
      { path: "admin/login", element: <AdminLoginPage /> },
      {
        path: "admin",
        element: <AdminRouteGuard />,
        children: [
          { path: "profiles", element: <AdminProfilesPage /> },
          { path: "profiles/new", element: <AdminProfileEditorPage mode="create" /> },
          { path: "profiles/:id", element: <AdminProfileEditorPage mode="edit" /> },
        ],
      },
    ],
  },
]);
