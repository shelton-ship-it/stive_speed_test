/**
 * Normalização dos resultados do motor para o modelo interno.
 * Regras: ausência de dados nunca vira zero; valores derivados têm origem
 * "derivada"; todas as amostras são convertidas para ms ou Mbps.
 */
import type { BandwidthPoint, Results } from "nucleo";
import type { Amostra, Diagnostico, PontuacaoMotor, Sessao } from "../motor/tipos";
import { metricaIndisponivel, metricaMedida } from "../motor/tipos";
import { jitterDeSerie } from "./estatistica";
import type { AmbienteNavegador } from "./ambiente";

export const VERSAO_ESQUEMA = 1;
export const VERSAO_PRODUTO = "1.0.0";

const BITS_POR_MEGABIT = 1e6;

export function bpsParaMbps(bps: number): number {
  return bps / BITS_POR_MEGABIT;
}

function latenciasParaAmostras(pontos: number[], inicioMs: number): Amostra[] {
  // O motor devolve apenas o valor de cada ping, sem instante próprio.
  // A ordem de recolha é preservada e não se inventam tempos precisos.
  return pontos.map((valor, i) => ({ t: new Date(inicioMs + i).toISOString(), valor }));
}

function larguraParaAmostras(pontos: BandwidthPoint[]): Amostra[] {
  return pontos
    .filter((p) => Number.isFinite(p.bps) && p.bps >= 0)
    .map((p) => ({
      t: p.measTime.toISOString(),
      valor: bpsParaMbps(p.bps),
      bytes: p.transferSize > 0 ? p.transferSize : p.bytes,
    }));
}

export function somarBytes(pontos: BandwidthPoint[]): number {
  return pontos.reduce(
    (acc, p) =>
      acc + (Number.isFinite(p.transferSize) && p.transferSize > 0 ? p.transferSize : p.bytes),
    0,
  );
}

export type EntradaNormalizacao = {
  resultados: Results;
  perfilId: string;
  perfilVersao: number;
  motorNome: string;
  motorVersao: string;
  iniciadaEm: Date;
  terminadaEm: Date;
  estado: Sessao["estado"];
  paginaOcultaDuranteTeste: boolean;
  ambiente: AmbienteNavegador;
};

export function normalizarResultados(entrada: EntradaNormalizacao): Sessao {
  const { resultados: r } = entrada;
  const inicioMs = entrada.iniciadaEm.getTime();

  const descida = r.getDownloadBandwidth();
  const subida = r.getUploadBandwidth();
  const latRepouso = r.getUnloadedLatency();
  const latDescida = r.getDownLoadedLatency();
  const latSubida = r.getUpLoadedLatency();

  const ptsRepouso = r.getUnloadedLatencyPoints();
  const ptsDescida = r.getDownLoadedLatencyPoints();
  const ptsSubida = r.getUpLoadedLatencyPoints();
  const ptsLargDescida = r.getDownloadBandwidthPoints();
  const ptsLargSubida = r.getUploadBandwidthPoints();

  const medida = (v: number | null | undefined, unidade: string) =>
    v === undefined || v === null ? metricaIndisponivel(unidade) : metricaMedida(v, unidade);

  // Jitter: usa o valor do motor; se faltar, deriva dos pontos recolhidos.
  const jitterOu = (valorMotor: number | null | undefined, pontos: number[]) =>
    valorMotor !== undefined && valorMotor !== null
      ? valorMotor
      : pontos.length >= 2
        ? jitterDeSerie(pontos)
        : undefined;

  const metricas: Sessao["metricas"] = {
    descidaMbps: medida(descida !== undefined ? bpsParaMbps(descida) : undefined, "Mbps"),
    subidaMbps: medida(subida !== undefined ? bpsParaMbps(subida) : undefined, "Mbps"),
    latenciaRepousoMs: medida(latRepouso, "ms"),
    jitterRepousoMs: medida(jitterOu(r.getUnloadedJitter(), ptsRepouso) ?? undefined, "ms"),
    latenciaCargaDescidaMs: medida(latDescida, "ms"),
    jitterCargaDescidaMs: medida(jitterOu(r.getDownLoadedJitter(), ptsDescida) ?? undefined, "ms"),
    latenciaCargaSubidaMs: medida(latSubida, "ms"),
    jitterCargaSubidaMs: medida(jitterOu(r.getUpLoadedJitter(), ptsSubida) ?? undefined, "ms"),
    // A perda de pacotes exige infraestrutura de relé própria, não configurada.
    perdaPacotes: { valor: null, unidade: "ratio", origem: "motor", estado: "naoSuportada" },
  };

  const aumento = (comCarga?: number, repouso?: number) =>
    comCarga !== undefined && repouso !== undefined
      ? metricaMedida(comCarga - repouso, "ms", "derivada")
      : metricaIndisponivel("ms", "derivada");

  const pontuacoes: Record<string, PontuacaoMotor | null> = {};
  for (const [chave, s] of Object.entries(r.getScores())) {
    pontuacoes[chave] = {
      pontos: s.points,
      indiceClasse: s.classificationIdx,
      nomeClasse: s.classificationName,
    };
  }

  const bytes = somarBytes(ptsLargDescida) + somarBytes(ptsLargSubida);

  const diagnosticos: Diagnostico[] = [];
  if (entrada.paginaOcultaDuranteTeste) {
    diagnosticos.push({
      codigo: "paginaOcultaDuranteTeste",
      gravidade: "aviso",
      chaveMensagem: "diagnostico.paginaOculta",
    });
  }
  if (!entrada.ambiente.tipoLigacao) {
    diagnosticos.push({
      codigo: "tipoLigacaoIndisponivel",
      gravidade: "info",
      chaveMensagem: "diagnostico.tipoLigacaoIndisponivel",
    });
  }
  diagnosticos.push({
    codigo: "perdaPacotesNaoConfigurada",
    gravidade: "info",
    chaveMensagem: "diagnostico.perdaNaoMedida",
  });

  const contagemAmostras: Sessao["contagemAmostras"] = {
    latenciaRepousoMs: { validas: ptsRepouso.length, descartadas: 0 },
    latenciaCargaDescidaMs: { validas: ptsDescida.length, descartadas: 0 },
    latenciaCargaSubidaMs: { validas: ptsSubida.length, descartadas: 0 },
    descidaMbps: { validas: ptsLargDescida.length, descartadas: 0 },
    subidaMbps: { validas: ptsLargSubida.length, descartadas: 0 },
  };
  if (ptsLargDescida.length === 0 && ptsLargSubida.length === 0 && ptsRepouso.length === 0) {
    diagnosticos.push({
      codigo: "semAmostras",
      gravidade: "erro",
      chaveMensagem: "diagnostico.semAmostras",
    });
  } else if (ptsLargDescida.length < 3 || ptsLargSubida.length < 3) {
    diagnosticos.push({
      codigo: "poucasAmostras",
      gravidade: "aviso",
      chaveMensagem: "diagnostico.poucasAmostras",
    });
  }

  return {
    id: crypto.randomUUID(),
    versaoEsquema: VERSAO_ESQUEMA,
    versaoProduto: VERSAO_PRODUTO,
    motor: {
      nome: entrada.motorNome,
      versao: entrada.motorVersao,
      perfilId: entrada.perfilId,
      perfilVersao: entrada.perfilVersao,
    },
    iniciadaEm: entrada.iniciadaEm.toISOString(),
    terminadaEm: entrada.terminadaEm.toISOString(),
    duracaoMs: r.getTotalDurationMs?.() ?? entrada.terminadaEm.getTime() - inicioMs,
    estado: entrada.estado,
    metricas,
    derivadas: {
      aumentoLatenciaDescidaMs: aumento(latDescida, latRepouso),
      aumentoLatenciaSubidaMs: aumento(latSubida, latRepouso),
    },
    pontuacoes,
    contagemAmostras,
    bytesTransferidos: bytes > 0 ? bytes : null,
    amostras: {
      latenciaRepousoMs: latenciasParaAmostras(ptsRepouso, inicioMs),
      latenciaCargaDescidaMs: latenciasParaAmostras(ptsDescida, inicioMs),
      latenciaCargaSubidaMs: latenciasParaAmostras(ptsSubida, inicioMs),
      descidaMbps: larguraParaAmostras(ptsLargDescida),
      subidaMbps: larguraParaAmostras(ptsLargSubida),
    },
    ambiente: {
      navegador: entrada.ambiente.navegador,
      sistema: entrada.ambiente.sistema,
      tipoLigacao: entrada.ambiente.tipoLigacao,
      paginaOcultaDuranteTeste: entrada.paginaOcultaDuranteTeste,
    },
    diagnosticos,
  };
}
