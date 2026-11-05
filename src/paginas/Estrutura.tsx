import type { ReactNode } from "react";
import { Cabecalho } from "@/componentes/Cabecalho";
import { Rodape } from "@/componentes/Rodape";
import type { Dicionario } from "@/medicao/textos/i18n";
import type { Local } from "@/medicao/textos/locais";
import { ProvedorI18n } from "@/medicao/textos/ProvedorI18n";
import { useI18n } from "@/medicao/textos/useI18n";
import estilos from "./Estrutura.module.css";

function Moldura({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <>
      <a className="saltar" href="#conteudo">
        {t("a11y.saltar")}
      </a>
      <Cabecalho />
      <main id="conteudo" className={estilos.principal}>
        {children}
      </main>
      <Rodape />
    </>
  );
}

/** Estrutura comum a todas as páginas: textos do idioma, cabeçalho, conteúdo e rodapé fixo. */
export function Estrutura({
  local,
  dicionario,
  children,
}: {
  local: Local;
  dicionario: Dicionario;
  children: ReactNode;
}) {
  return (
    <ProvedorI18n local={local} dicionario={dicionario}>
      <Moldura>{children}</Moldura>
    </ProvedorI18n>
  );
}
