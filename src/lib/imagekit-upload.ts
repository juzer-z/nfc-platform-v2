import { env } from "./env";
import { imagekitConfig } from "./imagekit";

type ImageKitAuth = {
  token: string;
  expire: number;
  signature: string;
};

type UploadKind = "photo" | "logo";

const DEFAULT_FOLDERS: Record<UploadKind, string> = {
  photo: "/1card-fyi/photos",
  logo: "/1card-fyi/logos",
};

export async function uploadImageToImageKit(file: File, kind: UploadKind) {
  if (!env.imagekitUrlEndpoint || !env.imagekitPublicKey) {
    throw new Error("ImageKit env is missing. Add URL endpoint and public key first.");
  }

  const auth = await getImageKitAuth();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", imagekitConfig.publicKey);
  formData.append("token", auth.token);
  formData.append("expire", String(auth.expire));
  formData.append("signature", auth.signature);
  formData.append("useUniqueFileName", "true");
  formData.append("folder", DEFAULT_FOLDERS[kind]);

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as {
    url?: string;
    error?: { message?: string };
    message?: string;
  };

  if (!response.ok || !data.url) {
    throw new Error(data.error?.message || data.message || "Image upload failed");
  }

  return data.url;
}

async function getImageKitAuth() {
  const response = await fetch("/api/imagekit-auth");
  const data = (await response.json()) as Partial<ImageKitAuth> & {
    error?: string;
  };

  if (!response.ok || !data.token || !data.expire || !data.signature) {
    throw new Error(data.error || "Could not get ImageKit upload auth");
  }

  return {
    token: data.token,
    expire: data.expire,
    signature: data.signature,
  };
}
