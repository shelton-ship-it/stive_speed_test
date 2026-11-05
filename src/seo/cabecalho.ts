import { site } from "@/site";
import type { Chave, Dicionario } from "@/medicao/textos/i18n";
import {
  SLUG_ORIGEM,
  SLUG_RESERVA,
  caminhoDe,
  caminhoPoliticas,
  type Local,
} from "@/medicao/textos/locais";

type Meta = Record<string, string>;
export type PaginaSeo = "inicio" | "politicas";

const PERGUNTAS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** Dados estruturados: a marca, a aplicação web e as perguntas frequentes visíveis na página. */
export function dadosEstruturados(local: Local, dic: Dicionario, origem: string) {
  const t = (chave: Chave) => dic[chave];
  const url = origem ? origem + caminhoDe(local) : undefined;
  const nome = t("marca.nome");
  const organizacao = {
    "@type": "Organization",
    name: site.marca,
    ...(site.redes.length ? { sameAs: site.redes.map((r) => r.url) } : {}),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizacao,
      {
        "@type": "WebApplication",
        name: nome,
        description: t("seo.descricao"),
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any modern browser",
        browserRequirements: "Requires JavaScript",
        inLanguage: local.codigo,
        isAccessibleForFree: true,
        publisher: { "@type": "Organization", name: site.marca },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        ...(url ? { url } : {}),
      },
      {
        "@type": "FAQPage",
        inLanguage: local.codigo,
        mainEntity: PERGUNTAS.map((n) => ({
          "@type": "Question",
          name: t(`faq.p${n}` as Chave),
          acceptedAnswer: { "@type": "Answer", text: t(`faq.r${n}` as Chave) },
        })),
      },
    ],
  };
}

/**
 * Constrói meta, links e scripts de uma página localizada, com alternativas para
 * todos os idiomas ativos. As políticas só são indexadas em português e inglês, que
 * são os textos escritos à mão: nos outros idiomas ainda mostram o inglês por reserva.
 */
export function construirCabecalho(
  local: Local,
  dic: Dicionario,
  origem: string,
  ativos: Local[],
  pagina: PaginaSeo = "inicio",
) {
  const t = (chave: Chave) => dic[chave];
  const politicas = pagina === "politicas";
  const caminho = politicas ? caminhoPoliticas : caminhoDe;
  const escritosAMao = (l: Local) => l.slug === SLUG_ORIGEM || l.slug === SLUG_RESERVA;
  const alternativas = politicas ? ativos.filter(escritosAMao) : ativos;
  const titulo = t(politicas ? "politicas.seoTitulo" : "seo.titulo");
  const descricao = t(politicas ? "politicas.seoDescricao" : "seo.descricao");
  const absoluto = (c: string) => (origem ? origem + c : "");
  const url = absoluto(caminho(local));
  const imagem = absoluto("/og.png");

  const meta: Meta[] = [
    { title: titulo },
    { name: "description", content: descricao },
    {
      name: "robots",
      content:
        politicas && !escritosAMao(local)
          ? "noindex, follow"
          : "index, follow, max-image-preview:large, max-snippet:-1",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: t("marca.nome") },
    { name: "application-name", content: t("marca.nome") },
    { property: "og:title", content: titulo },
    { property: "og:description", content: descricao },
    { property: "og:locale", content: local.og },
    ...alternativas
      .filter((l) => l.slug !== local.slug)
      .map((l) => ({ property: "og:locale:alternate", content: l.og })),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: titulo },
    { name: "twitter:description", content: descricao },
  ];
  if (url) meta.push({ property: "og:url", content: url });
  if (imagem) {
    meta.push(
      { property: "og:image", content: imagem },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: t("seo.imagemAlt") },
      { name: "twitter:image", content: imagem },
      { name: "twitter:image:alt", content: t("seo.imagemAlt") },
    );
  }

  const links: Array<Record<string, string>> = [];
  if (url) {
    const padrao = alternativas.find((l) => l.slug === SLUG_ORIGEM) ?? local;
    links.push(
      { rel: "canonical", href: url },
      ...alternativas.map((l) => ({
        rel: "alternate",
        hrefLang: l.codigo,
        href: absoluto(caminho(l)),
      })),
      { rel: "alternate", hrefLang: "x-default", href: absoluto(caminho(padrao)) },
    );
  }

  return {
    meta,
    links,
    scripts: politicas
      ? []
      : [
          {
            type: "application/ld+json",
            // Texto gerado a partir de dados fixos do projeto, nunca de entrada de utilizadores.
            children: JSON.stringify(dadosEstruturados(local, dic, origem)).replace(
              /</g,
              "\\u003c",
            ),
          },
        ],
  };
}
