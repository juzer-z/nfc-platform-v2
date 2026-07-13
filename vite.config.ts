import crypto from "node:crypto";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

function imageKitAuthDevPlugin(privateKey?: string) {
  return {
    name: "imagekit-auth-dev",
    configureServer(server: { middlewares: { use: (path: string, handler: (req: { method?: string }, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use("/api/imagekit-auth", (req, res, next) => {
        if (req.method !== "GET") {
          next();
          return;
        }

        if (!privateKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Missing IMAGEKIT_PRIVATE_KEY in local .env" }));
          return;
        }

        const token = crypto.randomUUID().replace(/-/g, "");
        const expire = Math.floor(Date.now() / 1000) + 60 * 5;
        const signature = crypto
          .createHmac("sha1", privateKey)
          .update(`${token}${expire}`)
          .digest("hex");

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify({ token, expire, signature }));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [imageKitAuthDevPlugin(env.IMAGEKIT_PRIVATE_KEY), react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
