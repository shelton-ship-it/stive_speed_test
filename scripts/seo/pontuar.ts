/**
 * Pontuação de oportunidade. Fórmula documentada e determinística:
 *
 *   demanda    = log10(1 + volume) / 5, limitada a 1     (volume real)
 *              = 0,25 + 0,10 por ocorrência no autocompletar, até 0,75
 *              = 0,10                                    (só proposta pela IA)
 *   facilidade = 1 menos dificuldade/100, ou 0,5 se desconhecida
 *   encaixe    = 0,5 + 0,25 por nível de prioridade do conceito (0,75 a 1,25)
 *   confiança  = 1 (volume real), 0,8 (autocompletar), 0,5 (só IA)
 *
 *   pontuação = demanda * (0,4 + 0,6 * facilidade) * encaixe * confiança
 *
 * A IA nunca produz volume: um termo só proposto pela IA é uma hipótese e pesa
 * pouco até ser confirmado por autocompletar ou por uma ferramenta real.
 */
import { obterConceito } from "./conceitos.ts";
import type { Candidato, Confianca } from "./tipos.ts";

export function confiancaDe(c: Pick<Candidato, "volume" | "origens">): Confianca {
  if (c.volume !== null) return "alta";
  if (c.origens.includes("autocompletar")) return "media";
  return "baixa";
}

export function pontuar(c: Omit<Candidato, "pontuacao" | "confianca">): {
  pontuacao: number;
  confianca: Confianca;
} {
  const confianca = confiancaDe(c);
  const demanda =
    c.volume !== null
      ? Math.min(1, Math.log10(1 + c.volume) / 5)
      : c.origens.includes("autocompletar")
        ? Math.min(0.75, 0.25 + 0.1 * c.ocorrencias)
        : 0.1;
  const facilidade = c.dificuldade === null ? 0.5 : 1 - c.dificuldade / 100;
  const prioridade = (c.conceito ? obterConceito(c.conceito)?.prioridade : undefined) ?? 1;
  const encaixe = 0.5 + 0.25 * prioridade;
  const mult = confianca === "alta" ? 1 : confianca === "media" ? 0.8 : 0.5;
  const pontuacao = demanda * (0.4 + 0.6 * facilidade) * encaixe * mult;
  return { pontuacao: Math.round(pontuacao * 10_000) / 10_000, confianca };
}
