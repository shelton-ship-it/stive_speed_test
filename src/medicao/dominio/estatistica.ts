/**
 * Estatísticas sobre as amostras: mediana, percentis, dispersão e valores
 * atípicos. Os atípicos são assinalados, nunca removidos dos dados.
 */
import type { Amostra } from "../motor/tipos";

export type Estatisticas = {
  contagem: number;
  minimo: number | null;
  maximo: number | null;
  mediana: number | null;
  p25: number | null;
  p75: number | null;
  p95: number | null;
  media: number | null;
  desvioPadrao: number | null;
  /** Coeficiente de variação (desvio padrão sobre a média). */
  cv: number | null;
  atipicos: number[];
};

export function percentil(ordenados: number[], p: number): number | null {
  if (ordenados.length === 0) return null;
  if (ordenados.length === 1) return ordenados[0];
  const posicao = (ordenados.length - 1) * p;
  const baixo = Math.floor(posicao);
  const alto = Math.ceil(posicao);
  const fracao = posicao - baixo;
  return ordenados[baixo] * (1 - fracao) + ordenados[alto] * fracao;
}

export function jitterDeSerie(pontos: number[]): number | null {
  if (pontos.length < 2) return null;
  let soma = 0;
  for (let i = 1; i < pontos.length; i++) soma += Math.abs(pontos[i] - pontos[i - 1]);
  return soma / (pontos.length - 1);
}

export function calcularEstatisticas(amostras: Amostra[]): Estatisticas {
  const valores = amostras.map((a) => a.valor).filter((v) => Number.isFinite(v));
  if (valores.length === 0) {
    return {
      contagem: 0,
      minimo: null,
      maximo: null,
      mediana: null,
      p25: null,
      p75: null,
      p95: null,
      media: null,
      desvioPadrao: null,
      cv: null,
      atipicos: [],
    };
  }
  const ordenados = [...valores].sort((a, b) => a - b);
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const variancia =
    valores.length > 1
      ? valores.reduce((acc, v) => acc + (v - media) ** 2, 0) / (valores.length - 1)
      : 0;
  const desvio = Math.sqrt(variancia);

  // Regra documentada: fora de 1,5 vezes o intervalo interquartil.
  const q1 = percentil(ordenados, 0.25) as number;
  const q3 = percentil(ordenados, 0.75) as number;
  const iqr = q3 - q1;
  const atipicos = valores.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);

  return {
    contagem: valores.length,
    minimo: ordenados[0],
    maximo: ordenados[ordenados.length - 1],
    mediana: percentil(ordenados, 0.5),
    p25: q1,
    p75: q3,
    p95: percentil(ordenados, 0.95),
    media,
    desvioPadrao: valores.length > 1 ? desvio : null,
    cv: media !== 0 && valores.length > 1 ? desvio / media : null,
    atipicos,
  };
}

/** Mbps para MB/s: unidades diferentes, a interface indica sempre qual está em uso. */
export function mbpsParaMBs(mbps: number): number {
  return mbps / 8;
}
