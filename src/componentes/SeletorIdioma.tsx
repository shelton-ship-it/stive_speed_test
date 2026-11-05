import { Languages } from "lucide-react";
import { useEffect, useRef } from "react";
import { localesAtivos } from "@/medicao/textos/dicionarios";
import { useI18n } from "@/medicao/textos/useI18n";
import { LigacaoIdioma } from "./LigacaoIdioma";
import estilos from "./SeletorIdioma.module.css";

/** Lista de idiomas em ligações reais: funciona sem JavaScript e é rastreável. */
export function SeletorIdioma() {
  const { t, local } = useI18n();
  const caixa = useRef<HTMLDetailsElement>(null);
  const ativos = localesAtivos();

  useEffect(() => {
    const fora = (e: PointerEvent) => {
      if (caixa.current?.open && !caixa.current.contains(e.target as Node))
        caixa.current.open = false;
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && caixa.current?.open) {
        caixa.current.open = false;
        caixa.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, []);

  return (
    <details ref={caixa} className={estilos.seletor}>
      <summary aria-label={t("controlo.idioma")} title={t("controlo.idioma")}>
        <Languages aria-hidden="true" />
        <span>{local.codigo.split("-")[0].toUpperCase()}</span>
      </summary>
      <ul className={estilos.lista}>
        {ativos.map((l) => (
          <li key={l.slug}>
            <LigacaoIdioma
              local={l}
              atual={l.slug === local.slug}
              className={estilos.item}
              onClick={() => {
                if (caixa.current) caixa.current.open = false;
              }}
            >
              {l.nome}
            </LigacaoIdioma>
          </li>
        ))}
      </ul>
    </details>
  );
}
