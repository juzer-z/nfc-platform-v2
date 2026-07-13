import { Navigate, Outlet } from "react-router-dom";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { StatusCard } from "./status-card";

export function AdminRouteGuard() {
  const { configured, loading, canAccess } = useAdminAccess();

  if (!configured) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10">
        <StatusCard
          title="Supabase env missing"
          body="Add Supabase environment variables before using the admin area."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10">
        <StatusCard
          title="Checking admin access"
          body="Validating your Supabase session and role..."
        />
      </div>
    );
  }

  if (!canAccess) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
