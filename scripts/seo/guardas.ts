/**
 * Travões anti spam. Antes de qualquer palavra chave entrar num texto, estas
 * regras garantem que o resultado é escrita natural e não repetição forçada de
 * termos, que os motores de pesquisa penalizam. Funções puras, sem rede.
 */
import type { Papel } from "./mapa.ts";
import { chaveDeTermo } from "./normalizar.ts";

type Limites = { maxCaracteres: number; maxPrimaria: number; maxSecundariasDistintas: number };

const LIMITES: Partial<Record<Papel, Limites>> = {
  titulo: { maxCaracteres: 60, maxPrimaria: 1, maxSecundariasDistintas: 1 },
  descricao: { maxCaracteres: 160, maxPrimaria: 1, maxSecundariasDistintas: 2 },
  h1: { maxCaracteres: 70, maxPrimaria: 1, maxSecundariasDistintas: 0 },
  lead: { maxCaracteres: 220, maxPrimaria: 1, maxSecundariasDistintas: 2 },
  h2: { maxCaracteres: 80, maxPrimaria: 1, maxSecundariasDistintas: 0 },
  faqPergunta: { maxCaracteres: 120, maxPrimaria: 1, maxSecundariasDistintas: 0 },
  faqResposta: { maxCaracteres: 700, maxPrimaria: 2, maxSecundariasDistintas: 3 },
  definicao: { maxCaracteres: 260, maxPrimaria: 1, maxSecundariasDistintas: 1 },
  passo: { maxCaracteres: 260, maxPrimaria: 1, maxSecundariasDistintas: 1 },
  introducao: { maxCaracteres: 260, maxPrimaria: 1, maxSecundariasDistintas: 1 },
  imagemAlt: { maxCaracteres: 125, maxPrimaria: 1, maxSecundariasDistintas: 0 },
};

/** Número de vezes que o termo aparece no texto, ignorando maiúsculas e acentos. */
export function ocorrencias(texto: string, termo: string, etiqueta = "en"): number {
  const t = chaveDeTermo(texto, etiqueta);
  const k = chaveDeTermo(termo, etiqueta);
  if (!k) return 0;
  let n = 0;
  for (let i = t.indexOf(k); i >= 0; i = t.indexOf(k, i + k.length)) n++;
  return n;
}

/** Percentagem do texto ocupada pelo termo (em palavras). */
export function densidade(texto: string, termo: string, etiqueta = "en"): number {
  const palavras = texto.split(/\s+/u).filter(Boolean).length;
  const nTermo = termo.split(/\s+/u).filter(Boolean).length;
  return palavras === 0 ? 0 : (ocorrencias(texto, termo, etiqueta) * nTermo * 100) / palavras;
}

export type EntradaGuarda = {
  papel: Papel;
  texto: string;
  primaria: string | null;
  secundarias: string[];
  exigePrimaria: boolean;
  etiqueta?: string;
};

export function validarUsoDePalavraChave(e: EntradaGuarda): string[] {
  const erros: string[] = [];
  const lim = LIMITES[e.papel];
  const et = e.etiqueta ?? "en";
  if (!lim) return ["papel sem limites definidos: este tipo de chave não recebe palavras chave"];

  if (e.texto.length > lim.maxCaracteres) erros.push(`excede ${lim.maxCaracteres} caracteres`);

  if (e.primaria) {
    const n = ocorrencias(e.texto, e.primaria, et);
    if (e.exigePrimaria && n === 0) erros.push("falta a palavra chave principal");
    if (n > lim.maxPrimaria)
      erros.push(`palavra chave principal repetida ${n} vezes (máximo ${lim.maxPrimaria})`);
    if (e.papel === "faqResposta" && densidade(e.texto, e.primaria, et) > 3)
      erros.push("densidade da palavra chave acima de 3%");
  } else if (e.exigePrimaria) erros.push("não há palavra chave principal definida");

  const usadas = e.secundarias.filter((s) => ocorrencias(e.texto, s, et) > 0);
  if (usadas.length > lim.maxSecundariasDistintas)
    erros.push(
      `demasiadas palavras chave secundárias (${usadas.length}, máximo ${lim.maxSecundariasDistintas})`,
    );
  for (const s of usadas)
    if (ocorrencias(e.texto, s, et) > 1) erros.push(`palavra chave secundária repetida: ${s}`);

  // Lista de termos separados por vírgulas é a assinatura clássica de keyword stuffing.
  const segmentos = e.texto
    .split(/[,;|/]/u)
    .map((x) => x.trim())
    .filter(Boolean);
  if (segmentos.length >= 4 && segmentos.every((x) => x.split(/\s+/u).length <= 3))
    erros.push("parece uma lista de palavras chave");
  return erros;
}
