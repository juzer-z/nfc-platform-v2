import { useEffect, useState } from "react";
import type { Role, UserRoleRecord } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAdminSession } from "./use-admin-session";

type AdminAccessState = {
  configured: boolean;
  loading: boolean;
  session: ReturnType<typeof useAdminSession>["session"];
  canAccess: boolean;
  role: Role | null;
};

export function useAdminAccess(): AdminAccessState {
  const { configured, loading: sessionLoading, session } = useAdminSession();
  const [loading, setLoading] = useState(true);
  const [roleRow, setRoleRow] = useState<UserRoleRecord | null>(null);

  useEffect(() => {
    if (!configured || sessionLoading) return;
    if (!session?.user) {
      setRoleRow(null);
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);

    (async () => {
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (ignore) return;
        setRoleRow(data ?? null);
        setLoading(false);
      } catch {
        if (ignore) return;
        setRoleRow(null);
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [configured, session, sessionLoading]);

  const role = roleRow?.role ?? null;
  const canAccess =
    Boolean(session?.user) &&
    Boolean(roleRow?.is_active) &&
    (role === "SUPER_ADMIN" || role === "HR_ADMIN");

  return {
    configured,
    loading: configured ? sessionLoading || loading : false,
    session,
    canAccess,
    role,
  };
}
