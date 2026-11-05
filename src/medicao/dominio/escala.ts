/** Posição (0 a 1) de uma velocidade em Mbps na régua logarítmica do instrumento. */
export function posicaoNaRegua(mbps: number | null): number {
  if (mbps === null || mbps <= 0) return 0;
  return Math.min(1, Math.log10(1 + mbps) / Math.log10(1001));
}
