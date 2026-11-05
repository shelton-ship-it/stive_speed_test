import { Moon, Sun } from "lucide-react";
import { LigacaoIdioma } from "./LigacaoIdioma";
import { Marca } from "./Marca";
import { SeletorIdioma } from "./SeletorIdioma";
import { useI18n } from "@/medicao/textos/useI18n";
import { definirTema, definirUnidade, usePreferencias } from "@/medicao/estado/preferencias";
import estilos from "./Cabecalho.module.css";

/**
 * Cabeçalho fixo. À esquerda o logótipo, ao centro a navegação e à direita os
 * controlos. O canto superior direito fica livre para a cabeça da marca, que é
 * desenhada por cima (ver CabecaViva).
 */
export function Cabecalho() {
  const { t, local } = useI18n();
  const { tema, unidade } = usePreferencias();
  const proximoTema = tema === "escuro" ? "claro" : "escuro";
  const rotuloTema = t(tema === "escuro" ? "controlo.temaParaClaro" : "controlo.temaParaEscuro");

  return (
    <header className={`${estilos.cabecalho} naoImprimir`}>
      <div className={estilos.linha}>
        <LigacaoIdioma local={local} className={estilos.ligacaoMarca}>
          <Marca rotulo={t("marca.inicio")} />
        </LigacaoIdioma>

        <nav className={estilos.navegacao} aria-label={t("nav.principal")}>
          <a href="#teste">{t("nav.teste")}</a>
          <a href="#historico">{t("nav.historico")}</a>
          <a href="#como">{t("nav.comoFunciona")}</a>
          <a href="#perguntas">{t("nav.perguntas")}</a>
        </nav>

        <div
          className={`${estilos.segmento} ${estilos.unidade}`}
          role="group"
          aria-label={t("controlo.unidade")}
        >
          <button
            type="button"
            aria-pressed={unidade === "mbps"}
            onClick={() => definirUnidade("mbps")}
          >
            {t("unidade.mbps")}
          </button>
          <button
            type="button"
            aria-pressed={unidade === "mbs"}
            onClick={() => definirUnidade("mbs")}
          >
            {t("unidade.mbs")}
          </button>
        </div>

        <div className={estilos.controlos}>
          <SeletorIdioma />
          <button
            type="button"
            className={estilos.tema}
            onClick={() => definirTema(proximoTema)}
            aria-label={rotuloTema}
            title={rotuloTema}
          >
            {tema === "escuro" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
