/** Normalização de termos de pesquisa. Funciona com qualquer escrita. */

export function normalizarTermo(termo: string, etiqueta = "en"): string {
  let t = termo.normalize("NFKC").trim();
  try {
    t = t.toLocaleLowerCase(etiqueta);
  } catch {
    t = t.toLowerCase();
  }
  // Tira pontuação nas pontas (por exemplo, o ponto de interrogação), mantém a interior.
  t = t.replace(/^[\s"'“”‘’«»¿¡([{]+/u, "").replace(/[\s"'“”‘’«»?!.,;:)\]}？！。，]+$/u, "");
  return t.replace(/\s+/gu, " ");
}

/** Chave de comparação: sem acentos nas escritas em que o acento é opcional. */
export function chaveDeTermo(termo: string, etiqueta = "en"): string {
  return normalizarTermo(termo, etiqueta)
    .normalize("NFD")
    .replace(/([\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}])\p{M}+/gu, "$1")
    .normalize("NFC");
}

/** Número de palavras. Usa o segmentador do motor para escritas sem espaços. */
export function contarPalavras(termo: string, etiqueta = "en"): number {
  try {
    const seg = new Intl.Segmenter(etiqueta, { granularity: "word" });
    let n = 0;
    for (const s of seg.segment(termo)) if (s.isWordLike) n++;
    return n;
  } catch {
    return termo.split(/\s+/u).filter(Boolean).length;
  }
}

/**
 * Semelhança entre dois termos (0 a 1), para não escolher quase duplicados.
 * Uma variante que apenas acrescenta ou retira uma palavra conta como igual.
 */
export function semelhanca(a: string, b: string): number {
  const ta = new Set(a.split(" "));
  const tb = new Set(b.split(" "));
  const comuns = [...ta].filter((x) => tb.has(x)).length;
  const menor = Math.min(ta.size, tb.size);
  if (menor >= 2 && comuns === menor && Math.abs(ta.size - tb.size) <= 1) return 1;
  const uniao = new Set([...ta, ...tb]).size;
  return uniao === 0 ? 0 : comuns / uniao;
}

/** Verdadeiro se o termo contém uma marca da lista, como palavra ou texto contínuo. */
export function contemMarca(termo: string, marcas: readonly string[]): boolean {
  const t = termo.toLowerCase();
  return marcas.some((m) => t.includes(m.toLowerCase()));
}
