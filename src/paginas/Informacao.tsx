import { useI18n } from "@/medicao/textos/useI18n";
import type { Chave } from "@/medicao/textos/i18n";
import estilos from "./Informacao.module.css";

const PASSOS = ["info.passo1", "info.passo2", "info.passo3", "info.passo4"] as const;
const MEDIDAS = [
  ["metrica.descida", "info.medidaDescida"],
  ["metrica.subida", "info.medidaSubida"],
  ["metrica.latenciaRepouso", "info.medidaLatencia"],
  ["metrica.curtaJitter", "info.medidaJitter"],
  ["metrica.latenciaCargaDescida", "info.medidaCarga"],
] as const;
const PERGUNTAS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Conteúdo informativo visível, renderizado no servidor.
 * Responde às dúvidas mais comuns e sustenta os dados estruturados da página.
 */
export function Informacao() {
  const { t } = useI18n();
  return (
    <>
      <section id="como" aria-labelledby="titComo" className={estilos.secao}>
        <div className={estilos.cabeca}>
          <h2 id="titComo">{t("info.comoTitulo")}</h2>
          <p>{t("info.comoIntro")}</p>
        </div>
        <ol className={estilos.passos}>
          {PASSOS.map((chave) => (
            <li key={chave}>{t(chave)}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titMedidas" className={estilos.secao}>
        <div className={estilos.cabeca}>
          <h2 id="titMedidas">{t("info.medidasTitulo")}</h2>
        </div>
        <dl className={estilos.medidas}>
          {MEDIDAS.map(([nome, texto]) => (
            <div key={nome}>
              <dt>{t(nome as Chave)}</dt>
              <dd>{t(texto)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="perguntas" aria-labelledby="titFaq" className={estilos.secao}>
        <div className={estilos.cabeca}>
          <h2 id="titFaq">{t("info.faqTitulo")}</h2>
        </div>
        <div className={estilos.faq}>
          {PERGUNTAS.map((n) => (
            <details key={n}>
              <summary>{t(`faq.p${n}` as Chave)}</summary>
              <p>{t(`faq.r${n}` as Chave)}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
