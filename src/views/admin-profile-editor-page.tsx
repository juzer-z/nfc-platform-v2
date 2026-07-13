import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminProfileForm } from "@/components/admin-profile-form";
import { StatusCard } from "@/components/status-card";
import { useAdminSession } from "@/hooks/use-admin-session";
import {
  createEmptyProfileForm,
  mapProfileToForm,
  type ProfileFormValues,
} from "@/lib/profile-form";
import {
  createProfile,
  deleteProfile,
  getProfileById,
  updateProfile,
} from "@/lib/supabase-profiles";

export function AdminProfileEditorPage({
  mode,
}: {
  mode: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const { configured, loading: sessionLoading, session } = useAdminSession();
  const [form, setForm] = useState<ProfileFormValues>(createEmptyProfileForm());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (configured && !session) {
      navigate("/admin/login");
    }
  }, [configured, navigate, session, sessionLoading]);

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
        setForm(mapProfileToForm(data));
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
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    const fullName = form.fullName.trim();
    if (!fullName) {
      setMessage("Full Name is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      if (mode === "create") {
        const { data, error } = await createProfile(form);
        if (error) {
          setMessage(error.message);
          return;
        }
        if (data) {
          navigate(`/admin/profiles/${data.id}`);
        }
        return;
      }

      const { error } = await updateProfile(id, form);
      if (error) {
        setMessage(error.message);
        return;
      }

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
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
          Supabase CRUD is wired here now. Media fields currently accept ImageKit URLs directly;
          signed browser upload will be the next pass.
        </p>
      </div>

      <div className="mt-8">
        {loading || sessionLoading ? (
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
            onChange={update}
            onSubmit={handleSubmit}
            onDelete={mode === "edit" ? handleDelete : undefined}
          />
        )}
      </div>
    </div>
  );
}
