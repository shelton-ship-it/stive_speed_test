import type { Amostra, Sessao } from "@/medicao/motor/tipos";
import { metricaMedida, metricaIndisponivel } from "@/medicao/motor/tipos";

function serie(
  base: number,
  variacao: number,
  n: number,
  inicioMs: number,
  passoMs = 400,
  bytes?: number,
): Amostra[] {
  return Array.from({ length: n }, (_, i) => ({
    t: new Date(inicioMs + i * passoMs).toISOString(),
    valor: Math.max(0.5, base + Math.sin(i * 1.7) * variacao + (i % 3) * variacao * 0.2),
    ...(bytes ? { bytes } : {}),
  }));
}

/** Sessão sintética completa, para testes e pré-visualização. */
export function sessaoDeExemplo(sobrepor: Partial<Sessao> = {}): Sessao {
  const inicio = Date.parse("2026-10-27T10:00:00Z");
  return {
    id: "exemplo1",
    versaoEsquema: 1,
    versaoProduto: "1.0.0",
    motor: { nome: "nucleo", versao: "1.14.2", perfilId: "equilibrado", perfilVersao: 1 },
    iniciadaEm: new Date(inicio).toISOString(),
    terminadaEm: new Date(inicio + 38_000).toISOString(),
    duracaoMs: 38_000,
    estado: "concluida",
    metricas: {
      descidaMbps: metricaMedida(248.3, "Mbps"),
      subidaMbps: metricaMedida(41.7, "Mbps"),
      latenciaRepousoMs: metricaMedida(18, "ms"),
      jitterRepousoMs: metricaMedida(3, "ms"),
      latenciaCargaDescidaMs: metricaMedida(96, "ms"),
      jitterCargaDescidaMs: metricaMedida(14, "ms"),
      latenciaCargaSubidaMs: metricaMedida(142, "ms"),
      jitterCargaSubidaMs: metricaMedida(22, "ms"),
      perdaPacotes: { valor: null, unidade: "ratio", origem: "motor", estado: "naoSuportada" },
    },
    derivadas: {
      aumentoLatenciaDescidaMs: metricaMedida(78, "ms", "derivada"),
      aumentoLatenciaSubidaMs: metricaMedida(124, "ms", "derivada"),
    },
    pontuacoes: {
      streaming: { pontos: 60, indiceClasse: 3, nomeClasse: "good" },
      gaming: { pontos: 30, indiceClasse: 2, nomeClasse: "average" },
      rtc: { pontos: 20, indiceClasse: 1, nomeClasse: "poor" },
    },
    contagemAmostras: {
      latenciaRepousoMs: { validas: 20, descartadas: 0 },
      latenciaCargaDescidaMs: { validas: 12, descartadas: 0 },
      latenciaCargaSubidaMs: { validas: 10, descartadas: 0 },
      descidaMbps: { validas: 17, descartadas: 0 },
      subidaMbps: { validas: 10, descartadas: 0 },
    },
    bytesTransferidos: 104_800_000,
    amostras: {
      latenciaRepousoMs: serie(18, 4, 20, inicio, 1),
      latenciaCargaDescidaMs: serie(96, 30, 12, inicio, 1),
      latenciaCargaSubidaMs: serie(142, 40, 10, inicio, 1),
      descidaMbps: serie(220, 60, 17, inicio, 1200, 1_000_000),
      subidaMbps: serie(40, 8, 10, inicio + 20_000, 1500, 1_000_000),
    },
    ambiente: {
      navegador: "Chrome 131",
      sistema: "Windows",
      tipoLigacao: "4g",
      paginaOcultaDuranteTeste: false,
    },
    diagnosticos: [
      {
        codigo: "perdaPacotesNaoConfigurada",
        gravidade: "info",
        chaveMensagem: "diagnostico.perdaNaoMedida",
      },
    ],
    ...sobrepor,
  };
}

export const semMetrica = metricaIndisponivel;
