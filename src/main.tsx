import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./styles.css";

if (typeof window !== "undefined") {
  const preloadHref = ["/favicon.svg", "/icons.svg"];

  preloadHref.forEach((href) => {
    const existing = document.head.querySelector(`link[rel="preload"][href="${href}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    document.head.appendChild(link);
  });

  window.requestIdleCallback?.(() => {
    void import("./views/admin-login-page");
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
