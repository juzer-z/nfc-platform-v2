import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminProfileForm } from "@/components/admin-profile-form";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { StatusCard } from "@/components/status-card";
import {
  createEmptyProfileForm,
  getNormalizedProfileForm,
  mapProfileToForm,
  type ProfileFormValues,
} from "@/lib/profile-form";
import {
  createProfile,
  deleteProfile,
  getProfileById,
  updateProfile,
} from "@/lib/supabase-profiles";

type ProfileAuditMeta = {
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
};

function getDraftKey(mode: "create" | "edit", id: string) {
  return mode === "create"
    ? "admin-profile-draft:create"
    : `admin-profile-draft:edit:${id}`;
}

export function AdminProfileEditorPage({
  mode,
}: {
  mode: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const {
    configured,
    loading: accessLoading,
    session,
    canDeleteProfiles,
  } = useAdminAccess();
  const [form, setForm] = useState<ProfileFormValues>(() => {
    if (typeof window === "undefined" || mode !== "create") {
      return createEmptyProfileForm();
    }

    try {
      const saved = window.sessionStorage.getItem(getDraftKey("create", ""));
      return saved ? (JSON.parse(saved) as ProfileFormValues) : createEmptyProfileForm();
    } catch {
      return createEmptyProfileForm();
    }
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [auditMeta, setAuditMeta] = useState<ProfileAuditMeta>({
    createdAt: null,
    updatedAt: null,
    createdBy: null,
  });
  const [draftStatus, setDraftStatus] = useState<{
    state: "idle" | "saving" | "saved";
    text: string;
  }>({
    state: "idle",
    text: "",
  });
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const draftInitializedRef = useRef(false);

  useEffect(() => {
    if (accessLoading) return;
    if (configured && !session) {
      navigate("/admin/login");
    }
  }, [accessLoading, configured, navigate, session]);

  useEffect(() => {
    if (mode !== "edit" || !configured || !session || !id) {
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);

    getProfileById(id).then(({ data, error }) => {
      if (ignore) return;
      if (error) {
        setMessage(error.message);
      } else if (data) {
        const recordWithMeta = data as typeof data & {
          created_by?: string | null;
          user_id?: string | null;
        };
        const fetchedForm = mapProfileToForm(data);
        setAuditMeta({
          createdAt: data.created_at ?? null,
          updatedAt: data.updated_at ?? null,
          createdBy: recordWithMeta.created_by ?? recordWithMeta.user_id ?? null,
        });

        if (typeof window !== "undefined") {
          try {
            const saved = window.sessionStorage.getItem(getDraftKey("edit", id));
            if (saved) {
              setForm(JSON.parse(saved) as ProfileFormValues);
            } else {
              setForm(fetchedForm);
            }
          } catch {
            setForm(fetchedForm);
          }
        } else {
          setForm(fetchedForm);
        }
      } else {
        setMessage("Profile not found.");
      }
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [configured, id, mode, session]);

  function update<K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K]
  ) {
    setHasDraftChanges(true);
    setDraftStatus({
      state: "saving",
      text: "Saving draft...",
    });
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mode === "edit" && !id) return;
    if (!draftInitializedRef.current) {
      draftInitializedRef.current = true;
      return;
    }
    if (!hasDraftChanges) return;

    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(getDraftKey(mode, id), JSON.stringify(form));
        setDraftStatus({
          state: "saved",
          text: `Draft saved ${new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}`,
        });
        setHasDraftChanges(false);
      } catch {
        setDraftStatus({
          state: "idle",
          text: "",
        });
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [form, hasDraftChanges, id, mode]);

  async function handleSubmit(nextForm?: ProfileFormValues) {
    const candidateForm = getNormalizedProfileForm(nextForm ?? form);
    const fullName = candidateForm.fullName.trim();
    if (!fullName) {
      setMessage("Full Name is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      if (mode === "create") {
        const { data, error } = await createProfile(candidateForm);
        if (error) {
          setMessage(error.message);
          return;
        }
        if (data) {
          setAuditMeta({
            createdAt: data.created_at ?? null,
            updatedAt: data.updated_at ?? null,
            createdBy: session?.user.email ?? null,
          });
          if (typeof window !== "undefined") {
            window.sessionStorage.removeItem(getDraftKey("create", ""));
          }
          navigate(`/admin/profiles/${data.id}`);
        }
        return;
      }

      const { error } = await updateProfile(id, candidateForm);
      if (error) {
        setMessage(error.message);
        return;
      }

      setForm(candidateForm);
      setAuditMeta((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        createdBy: prev.createdBy ?? session?.user.email ?? null,
      }));

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(getDraftKey("edit", id));
      }
      setDraftStatus({
        state: "saved",
        text: "All changes saved",
      });
      setHasDraftChanges(false);
      setMessage("Saved successfully.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setMessage("");
    try {
      const { error } = await deleteProfile(id);
      if (error) {
        setMessage(error.message);
        return;
      }
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(getDraftKey("edit", id));
      }
      navigate("/admin/profiles");
    } finally {
      setDeleting(false);
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10">
        <StatusCard
          title="Supabase env missing"
          body="Add your Supabase environment variables in app/.env before using admin create/edit."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10">
      <div>
        <div className="text-sm uppercase tracking-[0.22em] text-cyan-300/75">
          Admin
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
          {mode === "create" ? "Create profile" : "Edit profile"}
        </h1>
      </div>

      <div className="mt-8">
        {loading || accessLoading ? (
          <StatusCard
            title="Loading profile"
            body="Fetching the latest profile state from Supabase..."
          />
        ) : (
          <AdminProfileForm
            form={form}
            mode={mode}
            saving={saving}
            deleting={deleting}
            message={message}
            draftStatus={draftStatus}
            profileId={mode === "edit" ? id : undefined}
            auditMeta={auditMeta}
            onChange={update}
            onSubmit={handleSubmit}
            onDelete={mode === "edit" && canDeleteProfiles ? handleDelete : undefined}
          />
        )}
      </div>
    </div>
  );
}
