import { useMemo, type ReactNode } from "react";
import type { Dicionario } from "./i18n";
import type { Local } from "./locais";
import { ContextoDeTextos, criarI18n } from "./useI18n";

export function ProvedorI18n({
  local,
  dicionario,
  children,
}: {
  local: Local;
  dicionario: Dicionario;
  children: ReactNode;
}) {
  const valor = useMemo(() => criarI18n(local, dicionario), [local, dicionario]);
  return <ContextoDeTextos.Provider value={valor}>{children}</ContextoDeTextos.Provider>;
}
