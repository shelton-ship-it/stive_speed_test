import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SLUG_ORIGEM, type Local } from "@/medicao/textos/locais";

type Props = {
  local: Local;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  atual?: boolean;
};

/** Ligação para a versão de um idioma. O idioma de origem vive na raiz. */
export function LigacaoIdioma({ local, children, className, onClick, atual }: Props) {
  const comuns = {
    hrefLang: local.codigo,
    lang: local.codigo,
    dir: local.dir,
    className,
    onClick,
    "aria-current": atual ? ("true" as const) : undefined,
  };
  return local.slug === SLUG_ORIGEM ? (
    <Link to="/" {...comuns}>
      {children}
    </Link>
  ) : (
    <Link to="/$idioma" params={{ idioma: local.slug }} {...comuns}>
      {children}
    </Link>
  );
}
