import { env } from "./env";

export const imagekitConfig = {
  urlEndpoint: env.imagekitUrlEndpoint || "https://ik.imagekit.io/placeholder",
  publicKey: env.imagekitPublicKey || "public_test_key",
};
