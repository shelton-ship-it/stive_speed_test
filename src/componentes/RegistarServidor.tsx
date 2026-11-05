import { useEffect } from "react";

/** Regista o service worker da aplicação, só em produção e depois de a página carregar. */
export function RegistarServidor() {
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const registar = () =>
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    if (document.readyState === "complete") registar();
    else window.addEventListener("load", registar, { once: true });
  }, []);
  return null;
}
