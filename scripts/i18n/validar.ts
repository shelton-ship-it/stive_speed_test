/**
 * Validação das traduções. A saída de um modelo de IA é sempre tratada como
 * não confiável: só entra no projeto se passar todas estas regras.
 */
import type { GrupoEscrita, Local } from "../../src/medicao/textos/locais.ts";

export type Glossario = { versao: number; manterIgual: string[] };

/** Hífen, travessões, sinal de menos, pontos médios, setas, reticências e emojis. */
const PROIBIDOS_GERAIS =
  /[\u2010-\u2015\u2212\u00b7\u2022\u2190-\u21ff\u2026\u{1F000}-\u{1FFFF}\u2600-\u27bf]/u;
const HIFEN = /-/;
/** Controlo, sobreposições de direção e invisíveis: servem para falsificar texto e nunca são necessários. */
// eslint-disable-next-line no-control-regex -- detetar estes caracteres é o objetivo
const INVISIVEIS = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069\u200b-\u200d\ufeff]/;
const MARCACAO = /[<>`]|\*\*|https?:|\[\w+\]\(/;

const ESCRITA: Partial<Record<GrupoEscrita, RegExp>> = {
  cirilico: /\p{Script=Cyrillic}/u,
  grego: /\p{Script=Greek}/u,
  arabe: /\p{Script=Arabic}/u,
  hebraico: /\p{Script=Hebrew}/u,
  hanSimplificado: /\p{Script=Han}/u,
  hanTradicional: /\p{Script=Han}/u,
  japones: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u,
  coreano: /\p{Script=Hangul}/u,
  devanagari: /\p{Script=Devanagari}/u,
  bengali: /\p{Script=Bengali}/u,
  tamil: /\p{Script=Tamil}/u,
  telugu: /\p{Script=Telugu}/u,
  tailandes: /\p{Script=Thai}/u,
};

export function marcadores(texto: string): string[] {
  return (texto.match(/\{\w+\}/g) ?? []).sort();
}

export type EntradaValidacao = {
  chave: string;
  origem: string;
  traducao: unknown;
  local: Local;
  glossario: Glossario;
};

/** Devolve a lista de problemas. Lista vazia significa que a tradução é aceite. */
export function validarTraducao({
  origem,
  traducao,
  local,
  glossario,
}: EntradaValidacao): string[] {
  if (typeof traducao !== "string") return ["não é texto"];
  const erros: string[] = [];
  const t = traducao;

  if (t.trim().length === 0) return ["vazio"];
  if (t !== t.trim()) erros.push("espaços no início ou no fim");
  if (INVISIVEIS.test(t)) erros.push("contém caracteres de controlo ou de direção invisíveis");
  if (t.length > origem.length * 4 + 40) erros.push("muito mais longo que a origem");

  const m1 = marcadores(origem).join("|");
  const m2 = marcadores(t).join("|");
  if (m1 !== m2)
    erros.push(`marcadores diferentes: esperado ${m1 || "nenhum"}, obtido ${m2 || "nenhum"}`);

  if (PROIBIDOS_GERAIS.test(t))
    erros.push("contém travessão, ponto médio, seta, reticências ou emoji");
  if (!local.permitirHifen && HIFEN.test(t)) erros.push("contém hífen");
  if (MARCACAO.test(t)) erros.push("contém marcação, código ou endereço");

  for (const termo of glossario.manterIgual) {
    if (origem.includes(termo) && !t.includes(termo))
      erros.push(`termo protegido em falta: ${termo}`);
  }

  const letras = [...t].filter((c) => /\p{L}/u.test(c));
  // Marcadores como {total} e termos protegidos (Stive...) são sempre latinos: não contam para a escrita.
  let semProtegidos = t.replace(/\{\w+\}/g, " ");
  for (const termo of glossario.manterIgual) semProtegidos = semProtegidos.split(termo).join(" ");
  const letrasEscrita = [...semProtegidos].filter((c) => /\p{L}/u.test(c));
  const esperada = ESCRITA[local.escrita];
  if (esperada) {
    if (letrasEscrita.length >= 12) {
      const certas = letrasEscrita.filter((c) => esperada.test(c)).length;
      if (certas / letrasEscrita.length < 0.5)
        erros.push(`escrita inesperada para ${local.nomeIngles}`);
    }
  } else if (letras.length >= 12 && t === origem && letras.length >= 30 && local.slug !== "ptbr") {
    // Frases curtas podem ser legitimamente iguais em línguas próximas (por exemplo, Fase 2 de 5).
    // O português do Brasil partilha muitas frases inteiras com o de origem, por isso não se aplica.
    erros.push("igual à origem, sem tradução");
  }
  return erros;
}

/** Valida um dicionário inteiro. Devolve só as chaves com problemas. */
export function validarDicionario(
  origem: Record<string, string>,
  dic: Record<string, unknown>,
  local: Local,
  glossario: Glossario,
): Record<string, string[]> {
  const problemas: Record<string, string[]> = {};
  for (const [chave, valor] of Object.entries(dic)) {
    if (!(chave in origem)) {
      problemas[chave] = ["chave que não existe na origem"];
      continue;
    }
    const erros = validarTraducao({
      chave,
      origem: origem[chave],
      traducao: valor,
      local,
      glossario,
    });
    if (erros.length) problemas[chave] = erros;
  }
  return problemas;
}

/** Proporção das letras que pertencem à escrita esperada do idioma. Null para escritas latinas. */
export function proporcaoEscrita(texto: string, local: Local): number | null {
  const esperada = ESCRITA[local.escrita];
  if (!esperada) return null;
  const letras = [...texto].filter((c) => /\p{L}/u.test(c));
  if (letras.length === 0) return 0;
  return letras.filter((c) => esperada.test(c)).length / letras.length;
}
