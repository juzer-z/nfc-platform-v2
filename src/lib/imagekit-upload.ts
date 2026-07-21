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

  const preparedFile = await optimizeImageForUpload(file, kind);
  const auth = await getImageKitAuth();
  const formData = new FormData();
  formData.append("file", preparedFile);
  formData.append("fileName", preparedFile.name);
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

async function optimizeImageForUpload(file: File, kind: UploadKind) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const image = await loadImage(file);
  const maxSide = kind === "photo" ? 1600 : 1200;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  const outputType =
    file.type === "image/png" || file.type === "image/webp"
      ? "image/webp"
      : "image/jpeg";
  const quality = kind === "photo" ? 0.82 : 0.9;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), outputType, quality);
  });

  if (!blob) {
    return file;
  }

  const extension = outputType === "image/webp" ? "webp" : "jpg";
  const sanitizedName = file.name.replace(/\.[a-z0-9]+$/i, "");

  return new File([blob], `${sanitizedName}.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
