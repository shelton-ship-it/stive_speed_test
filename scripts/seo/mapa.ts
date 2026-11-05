/**
 * Mapa de chaves SEO: o que cada chave de texto é para os motores de pesquisa e
 * a que conceito de pesquisa responde. Serve de contrato para o passo que aplica
 * palavras chave aos textos, que só pode tocar chaves mapeadas aqui e dentro
 * dos limites de cada papel.
 *
 * Toda a chave do dicionário tem de estar classificada: ou aqui, ou como
 * interface (sem palavras chave) pelos prefixos abaixo. Um teste falha quando uma
 * chave nova fica por classificar, para ninguém esquecer de decidir.
 */
import { IDS_CONCEITOS } from "./conceitos.ts";

export type Papel =
  | "titulo"
  | "descricao"
  | "h1"
  | "lead"
  | "imagemAlt"
  | "h2"
  | "introducao"
  | "passo"
  | "definicao"
  | "faqPergunta"
  | "faqResposta"
  | "navegacao";

export type EntradaMapa = {
  papel: Papel;
  /** Conceito a que a chave responde. Null em títulos de secção genéricos. */
  conceito: string | null;
  /** Se verdadeiro, o texto aplicado tem de conter a palavra chave principal do conceito. */
  exigePrimaria: boolean;
};

const e = (papel: Papel, conceito: string | null, exigePrimaria = false): EntradaMapa => ({
  papel,
  conceito,
  exigePrimaria,
});

export const MAPA_CHAVES: Readonly<Record<string, EntradaMapa>> = {
  "seo.titulo": e("titulo", "testarVelocidade", true),
  "seo.descricao": e("descricao", "testarVelocidade", true),
  "seo.imagemAlt": e("imagemAlt", "testarVelocidade"),
  "pagina.h1": e("h1", "testarVelocidade", true),
  "pagina.lead": e("lead", "testarVelocidade"),

  "nav.teste": e("navegacao", null),
  "nav.historico": e("navegacao", null),
  "nav.comoFunciona": e("navegacao", null),
  "nav.perguntas": e("navegacao", null),

  "info.comoTitulo": e("h2", "comoFunciona"),
  "info.comoIntro": e("introducao", "comoFunciona"),
  "info.passo1": e("passo", "testarLatencia"),
  "info.passo2": e("passo", "testarDownload"),
  "info.passo3": e("passo", "testarUpload"),
  "info.passo4": e("passo", "bufferbloat"),
  "info.medidasTitulo": e("h2", null),
  "info.medidaDescida": e("definicao", "testarDownload"),
  "info.medidaSubida": e("definicao", "testarUpload"),
  "info.medidaLatencia": e("definicao", "latencia"),
  "info.medidaJitter": e("definicao", "jitter"),
  "info.medidaCarga": e("definicao", "bufferbloat"),
  "info.faqTitulo": e("h2", null),

  "faq.p1": e("faqPergunta", "velocidadeBoa", true),
  "faq.r1": e("faqResposta", "velocidadeBoa"),
  "faq.p2": e("faqPergunta", "resultadoVaria", true),
  "faq.r2": e("faqResposta", "resultadoVaria"),
  "faq.p3": e("faqPergunta", "mbpsVsMBs", true),
  "faq.r3": e("faqResposta", "mbpsVsMBs"),
  "faq.p4": e("faqPergunta", "latencia", true),
  "faq.r4": e("faqResposta", "latencia"),
  "faq.p5": e("faqPergunta", "jitter", true),
  "faq.r5": e("faqResposta", "jitter"),
  "faq.p6": e("faqPergunta", "consumoDados", true),
  "faq.r6": e("faqResposta", "consumoDados"),
  "faq.p7": e("faqPergunta", "privacidade", true),
  "faq.r7": e("faqResposta", "privacidade"),
  "faq.p8": e("faqPergunta", "resultadoFiavel", true),
  "faq.r8": e("faqResposta", "resultadoFiavel"),
};

/** Grupos de chaves que são interface: nunca recebem palavras chave. */
export const PREFIXOS_INTERFACE: readonly string[] = [
  "marca.",
  "a11y.",
  "controlo.",
  "nav.principal",
  "fase.",
  "acao.",
  "instrumento.",
  "perfil.",
  "progresso.",
  "metrica.",
  "unidade.",
  "geral.",
  "grafico.",
  "ligacao.",
  "secao.",
  "uso.",
  "nivel.",
  "recomendacao.",
  "estat.",
  "amostra.",
  "diagnostico.",
  "ambiente.",
  "historico.",
  "tabela.",
  "estado.",
  "partilha.",
  "erro.",
  "privacidade.",
  "rodape.",
  "erroPagina.",
  "naoEncontrada.",
  "percurso.",
  "politicas.",
];

export type Classificacao =
  { tipo: "seo"; entrada: EntradaMapa } | { tipo: "interface" } | { tipo: "porClassificar" };

export function classificarChave(chave: string): Classificacao {
  const entrada = MAPA_CHAVES[chave];
  if (entrada) return { tipo: "seo", entrada };
  if (PREFIXOS_INTERFACE.some((p) => chave === p || chave.startsWith(p)))
    return { tipo: "interface" };
  return { tipo: "porClassificar" };
}

/** Chaves de texto que respondem a um conceito. */
export function chavesDoConceito(conceito: string): string[] {
  return Object.entries(MAPA_CHAVES)
    .filter(([, v]) => v.conceito === conceito)
    .map(([k]) => k);
}

/** Papéis que contam como conteúdo que responde à pesquisa (não só navegação ou imagem). */
const PAPEIS_DE_CONTEUDO: ReadonlySet<Papel> = new Set([
  "titulo",
  "h1",
  "h2",
  "faqPergunta",
  "definicao",
  "passo",
  "introducao",
]);

/** Conceitos sem conteúdo que os responda: procura que o site ainda não satisfaz. */
export function lacunas(): string[] {
  return IDS_CONCEITOS.filter(
    (id) => !chavesDoConceito(id).some((k) => PAPEIS_DE_CONTEUDO.has(MAPA_CHAVES[k].papel)),
  );
}
