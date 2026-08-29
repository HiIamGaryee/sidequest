import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import "./index.css";

// Prevent external browser extension errors (e.g. MetaMask / web3 extensions) from disrupting app lifecycle
if (typeof window !== "undefined") {
  const isExtensionNoise = (err: unknown) => {
    if (!err) return false;
    const str = String(
      typeof err === "object" && err !== null && "message" in err
        ? (err as { message?: string }).message
        : err
    ).toLowerCase();
    return (
      str.includes("metamask") ||
      str.includes("ethereum") ||
      str.includes("web3") ||
      str.includes("failed to connect")
    );
  };

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      if (isExtensionNoise(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    },
    true
  );

  window.addEventListener(
    "error",
    (event) => {
      if (isExtensionNoise(event.message) || isExtensionNoise(event.error)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    },
    true
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

