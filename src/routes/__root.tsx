import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CabecaViva } from "@/componentes/CabecaViva";
import { Dispositivo } from "@/componentes/Dispositivo";
import { RegistarServidor } from "@/componentes/RegistarServidor";
import { ErroDePagina, NaoEncontrada } from "@/componentes/PaginaErro";
import { SCRIPT_TEMA_INICIAL } from "@/medicao/estado/preferencias";
import { localAtivo } from "@/medicao/textos/dicionarios";
import { LOCAIS, SLUG_ORIGEM } from "@/medicao/textos/locais";
import arquivoCss from "@/estilos/global.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Stive" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "color-scheme", content: "light dark" },
      { name: "theme-color", content: "#f1f5f8" },
    ],
    links: [
      { rel: "stylesheet", href: arquivoCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
    ],
    // Aplica o tema antes da primeira pintura, para não haver clarão de tema errado.
    scripts: [{ children: SCRIPT_TEMA_INICIAL }],
  }),
  shellComponent: Estrutura,
  component: () => <Outlet />,
  notFoundComponent: NaoEncontrada,
  errorComponent: ({ error, reset }) => <ErroPaginaComRouter erro={error} reset={reset} />,
});

function ErroPaginaComRouter({ erro, reset }: { erro: unknown; reset: () => void }) {
  const router = useRouter();
  console.error(erro);
  return (
    <ErroDePagina
      aoTentar={() => {
        void router.invalidate();
        reset();
      }}
    />
  );
}

function Estrutura({ children }: { children: ReactNode }) {
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const local = localAtivo(caminho.split("/")[1]) ?? LOCAIS.find((l) => l.slug === SLUG_ORIGEM)!;
  return (
    <html lang={local.codigo} dir={local.dir} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <CabecaViva />
        <Dispositivo />
        <RegistarServidor />
        {children}
        <Scripts />
      </body>
    </html>
  );
}
