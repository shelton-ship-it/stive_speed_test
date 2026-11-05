import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SLUG_ORIGEM, type Local } from "@/medicao/textos/locais";

/** Ligação para a página de políticas no idioma indicado. */
export function LigacaoPoliticas({
  local,
  children,
  className,
}: {
  local: Local;
  children: ReactNode;
  className?: string;
}) {
  return local.slug === SLUG_ORIGEM ? (
    <Link to="/politicas" className={className}>
      {children}
    </Link>
  ) : (
    <Link to="/$idioma/politicas" params={{ idioma: local.slug }} className={className}>
      {children}
    </Link>
  );
}
