import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { uploadImageToImageKit } from "@/lib/imagekit-upload";
import { buildProfilePayload, slugify, type ProfileFormValues } from "@/lib/profile-form";

type Props = {
  form: ProfileFormValues;
  mode: "create" | "edit";
  saving: boolean;
  deleting?: boolean;
  message?: string;
  draftStatus?: {
    state: "idle" | "saving" | "saved";
    text: string;
  };
  onChange: <K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K]
  ) => void;
  onSubmit: () => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function AdminProfileForm({
  form,
  mode,
  saving,
  deleting = false,
  message,
  draftStatus,
  onChange,
  onSubmit,
  onDelete,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [deletingNow, setDeletingNow] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const suggestedSlug = useMemo(() => {
    return form.slug.trim() || slugify(form.fullName) || "your-slug";
  }, [form.fullName, form.slug]);

  const publicUrl = `/u/${suggestedSlug}`;
  const inputClass =
    "mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/40 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/60";

  const payloadPreview = buildProfilePayload(form);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
      <div className="rounded-[28px] border border-white/10 bg-white/7 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
        {draftStatus?.state !== "idle" ? (
          <div className="mb-4 flex justify-end">
            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                draftStatus.state === "saving"
                  ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                  : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              }`}
            >
              {draftStatus.text}
            </div>
          </div>
        ) : null}

        {message || uploadMessage ? (
          <div className="mb-6 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white/85">
            {uploadMessage || message}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Full Name" hint="Required">
            <input
              className={inputClass}
              value={form.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
              placeholder="e.g., Juzer Zulfikar Ali"
            />
          </Field>

          <Field label="Slug" hint={`Public link: ${publicUrl}`}>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(event) => onChange("slug", event.target.value)}
              placeholder="leave blank to auto-generate"
            />
          </Field>

          <Field label="Title">
            <input
              className={inputClass}
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="e.g., Technical Director"
            />
          </Field>

          <Field label="Company">
            <input
              className={inputClass}
              value={form.company}
              onChange={(event) => onChange("company", event.target.value)}
              placeholder="e.g., Ezzy Group"
            />
          </Field>

          <Field label="Department">
            <input
              className={inputClass}
              value={form.department}
              onChange={(event) => onChange("department", event.target.value)}
              placeholder="e.g., Engineering"
            />
          </Field>

          <Field label="Phone">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(event) => onChange("phone", event.target.value)}
              placeholder="+8801XXXXXXXXX"
            />
          </Field>

          <Field label="WhatsApp">
            <input
              className={inputClass}
              value={form.whatsapp}
              onChange={(event) => onChange("whatsapp", event.target.value)}
              placeholder="+8801XXXXXXXXX"
            />
          </Field>

          <Field label="Public Email">
            <input
              className={inputClass}
              value={form.emailPublic}
              onChange={(event) => onChange("emailPublic", event.target.value)}
              placeholder="name@company.com"
            />
          </Field>

          <Field label="LinkedIn">
            <input
              className={inputClass}
              value={form.linkedin}
              onChange={(event) => onChange("linkedin", event.target.value)}
              placeholder="https://www.linkedin.com/in/username/"
            />
          </Field>

          <Field label="Website">
            <input
              className={inputClass}
              value={form.website}
              onChange={(event) => onChange("website", event.target.value)}
              placeholder="ezzy.group"
            />
          </Field>

          <Field label="Address">
            <input
              className={inputClass}
              value={form.address}
              onChange={(event) => onChange("address", event.target.value)}
              placeholder="Gulshan, Dhaka"
            />
          </Field>

          <Field label="Map URL">
            <input
              className={inputClass}
              value={form.mapUrl}
              onChange={(event) => onChange("mapUrl", event.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </Field>

          <Field label="User Photo" hint="Upload to ImageKit or paste URL">
            <UploadPicker
              id="profile-photo"
              label={form.photoUrl ? "Replace photo" : "Upload photo"}
              uploading={uploadingPhoto}
              onPick={async (file) => {
                setUploadMessage("");
                setUploadingPhoto(true);
                try {
                  const url = await uploadImageToImageKit(file, "photo");
                  onChange("photoUrl", url);
                  setUploadMessage("Photo uploaded successfully.");
                } catch (error) {
                  setUploadMessage(
                    error instanceof Error ? error.message : "Photo upload failed."
                  );
                } finally {
                  setUploadingPhoto(false);
                }
              }}
            />
            <input
              className={inputClass}
              value={form.photoUrl}
              onChange={(event) => onChange("photoUrl", event.target.value)}
              placeholder="https://ik.imagekit.io/..."
            />
            {form.photoUrl ? (
              <img
                src={form.photoUrl}
                alt="User preview"
                className="mt-3 h-20 w-20 rounded-2xl border border-white/12 object-cover"
              />
            ) : null}
          </Field>

          <Field label="Company Logo" hint="Upload to ImageKit or paste URL">
            <UploadPicker
              id="company-logo"
              label={form.companyLogoUrl ? "Replace logo" : "Upload logo"}
              uploading={uploadingLogo}
              onPick={async (file) => {
                setUploadMessage("");
                setUploadingLogo(true);
                try {
                  const url = await uploadImageToImageKit(file, "logo");
                  onChange("companyLogoUrl", url);
                  setUploadMessage("Logo uploaded successfully.");
                } catch (error) {
                  setUploadMessage(
                    error instanceof Error ? error.message : "Logo upload failed."
                  );
                } finally {
                  setUploadingLogo(false);
                }
              }}
            />
            <input
              className={inputClass}
              value={form.companyLogoUrl}
              onChange={(event) => onChange("companyLogoUrl", event.target.value)}
              placeholder="https://ik.imagekit.io/..."
            />
            {form.companyLogoUrl ? (
              <div className="mt-3 inline-flex rounded-2xl bg-white p-3">
                <img
                  src={form.companyLogoUrl}
                  alt="Company logo preview"
                  className="h-12 w-auto rounded object-contain"
                />
              </div>
            ) : null}
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <Toggle
            label="Active"
            checked={form.isActive}
            onChange={(value) => onChange("isActive", value)}
          />
          <Toggle
            label="Published"
            checked={form.isPublished}
            onChange={(value) => onChange("isPublished", value)}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving || submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await onSubmit();
              } finally {
                setSubmitting(false);
              }
            }}
            className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving || submitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Profile"
                : "Save Changes"}
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            View Public Page
          </a>

          <Link
            to="/admin/profiles"
            className="rounded-2xl border border-white/12 bg-white/8 px-6 py-3 font-semibold text-white"
          >
            Back
          </Link>

          {mode === "edit" && onDelete ? (
            <button
              type="button"
              disabled={deleting || deletingNow}
              onClick={async () => {
                if (!window.confirm("Delete this profile permanently?")) return;
                setDeletingNow(true);
                try {
                  await onDelete();
                } finally {
                  setDeletingNow(false);
                }
              }}
              className="ml-auto rounded-2xl bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {deleting || deletingNow ? "Deleting..." : "Delete"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <SidebarCard
          title="Saved payload"
          body={`slug: ${payloadPreview.slug}\nstatus: ${
            payloadPreview.is_active && payloadPreview.is_published ? "public" : "hidden"
          }`}
        />
        {mode === "edit" && !onDelete ? (
          <SidebarCard
            title="Role permissions"
            body="Your account can create and edit profiles, but deleting profiles is restricted to higher-level admin roles."
          />
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-white/60">{label}</div>
      {hint ? <div className="mt-1 text-xs text-white/35">{hint}</div> : null}
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-8 w-14 rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-white/20"
        }`}
      >
        <div
          className={`h-6 w-6 rounded-full bg-white transition ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SidebarCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/6 p-5 text-sm leading-6 text-white/70 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-2 whitespace-pre-line">{body}</p>
    </div>
  );
}

function UploadPicker({
  id,
  label,
  uploading,
  onPick,
}: {
  id: string;
  label: string;
  uploading: boolean;
  onPick: (file: File) => Promise<void>;
}) {
  return (
    <div className="mt-2">
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        disabled={uploading}
        onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;
          await onPick(file);
          event.currentTarget.value = "";
        }}
      />
      <label
        htmlFor={id}
        className={`inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition ${
          uploading
            ? "bg-white/10 opacity-60"
            : "bg-white/10 hover:border-blue-400/60 hover:bg-blue-500/20"
        }`}
      >
        {uploading ? "Uploading..." : label}
      </label>
    </div>
  );
}
