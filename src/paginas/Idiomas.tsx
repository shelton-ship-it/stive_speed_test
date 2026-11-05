import { LigacaoIdioma } from "@/componentes/LigacaoIdioma";
import { LigacaoPoliticas } from "@/componentes/LigacaoPoliticas";
import { localesAtivos } from "@/medicao/textos/dicionarios";
import { useI18n } from "@/medicao/textos/useI18n";
import estilos from "./Idiomas.module.css";

/**
 * Lista de idiomas em ligações reais, no fim da página. Não está no rodapé fixo,
 * que é fino, e dá aos motores de pesquisa um caminho rastreável para todas as versões.
 */
export function Idiomas() {
  const { t, local } = useI18n();
  return (
    <section aria-labelledby="titIdiomas" className={`${estilos.secao} naoImprimir`}>
      <h2 id="titIdiomas">{t("rodape.idiomas")}</h2>
      <nav aria-label={t("rodape.idiomas")} className={estilos.lista}>
        {localesAtivos().map((l) => (
          <LigacaoIdioma key={l.slug} local={l} atual={l.slug === local.slug}>
            {l.nome}
          </LigacaoIdioma>
        ))}
      </nav>
      <p className={estilos.nota}>
        {t("privacidade.nota")} {t("rodape.medicao")}{" "}
        <LigacaoPoliticas local={local}>{t("rodape.politicas")}</LigacaoPoliticas>
      </p>
    </section>
  );
}
