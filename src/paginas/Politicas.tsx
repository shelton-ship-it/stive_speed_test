import { site } from "@/site";
import { LigacaoIdioma } from "@/componentes/LigacaoIdioma";
import type { Chave } from "@/medicao/textos/i18n";
import { useI18n } from "@/medicao/textos/useI18n";
import estilos from "./Politicas.module.css";

const POLITICA_FORNECEDOR = "https://www.cloudflare.com/privacypolicy/";

type Secao = { id: string; titulo: Chave; paragrafos: Chave[]; fornecedor?: boolean };

/** Ordem e conteúdo das secções. Cada parágrafo é uma chave do dicionário, traduzível. */
const SECOES: Secao[] = [
  {
    id: "resumo",
    titulo: "politicas.resumo.titulo",
    paragrafos: ["politicas.resumo.p1", "politicas.resumo.p2"],
  },
  {
    id: "dados",
    titulo: "politicas.recolha.titulo",
    paragrafos: ["politicas.recolha.p1", "politicas.recolha.p2", "politicas.recolha.p3"],
  },
  {
    id: "fornecedor",
    titulo: "politicas.cloudflare.titulo",
    paragrafos: [
      "politicas.cloudflare.p1",
      "politicas.cloudflare.p2",
      "politicas.cloudflare.p3",
      "politicas.cloudflare.p4",
    ],
    fornecedor: true,
  },
  { id: "consumo", titulo: "politicas.dados.titulo", paragrafos: ["politicas.dados.p1"] },
  {
    id: "armazenamento",
    titulo: "politicas.armazenamento.titulo",
    paragrafos: ["politicas.armazenamento.p1", "politicas.armazenamento.p2"],
  },
  {
    id: "alojamento",
    titulo: "politicas.alojamento.titulo",
    paragrafos: ["politicas.alojamento.p1"],
  },
  {
    id: "direitos",
    titulo: "politicas.direitos.titulo",
    paragrafos: ["politicas.direitos.p1", "politicas.direitos.p2"],
  },
  {
    id: "termos",
    titulo: "politicas.termos.titulo",
    paragrafos: [
      "politicas.termos.p1",
      "politicas.termos.p2",
      "politicas.termos.p3",
      "politicas.termos.p4",
    ],
  },
  {
    id: "alteracoes",
    titulo: "politicas.alteracoes.titulo",
    paragrafos: ["politicas.alteracoes.p1", "politicas.alteracoes.p2"],
  },
];

/** Políticas de privacidade, cookies e termos de uso, numa única página. */
export function Politicas() {
  const { t, local } = useI18n();
  const externa = { target: "_blank", rel: "noopener noreferrer" } as const;
  return (
    <article className={estilos.pagina}>
      <header className={estilos.cabeca}>
        <h1>{t("politicas.titulo")}</h1>
        <p className={estilos.atualizado}>{t("politicas.atualizado")}</p>
        <LigacaoIdioma local={local}>{t("politicas.voltar")}</LigacaoIdioma>
      </header>

      <nav className={estilos.indice} aria-label={t("politicas.indice")}>
        <h2>{t("politicas.indice")}</h2>
        <ol>
          {SECOES.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{t(s.titulo)}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className={estilos.corpo}>
        {SECOES.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`t${s.id}`} className={estilos.secao}>
            <h2 id={`t${s.id}`}>{t(s.titulo)}</h2>
            {s.paragrafos.map((p) => (
              <p key={p}>{t(p)}</p>
            ))}
            {s.fornecedor ? (
              <p>
                <a href={POLITICA_FORNECEDOR} {...externa}>
                  {t("politicas.cloudflare.ligacao")}
                </a>
              </p>
            ) : null}
            {s.id === "alteracoes" ? (
              <p className={estilos.ligacoes}>
                <a href={site.contacto} {...externa}>
                  {t("rodape.contacto")}
                </a>
                <a href={site.suporte} {...externa}>
                  {t("rodape.suporte")}
                </a>
              </p>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
