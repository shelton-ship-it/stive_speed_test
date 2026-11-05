/**
 * Diagnóstico contextual: hipóteses baseadas em observações, sem afirmar
 * causas certas. Separa sempre o que foi observado do que é causa possível.
 */
import type { Sessao } from "../motor/tipos";
import { valorDe } from "../motor/tipos";
import { calcularEstatisticas } from "./estatistica";

export type ItemDiagnostico = {
  /** Observação direta dos dados medidos. */
  observacao: string;
  params?: Record<string, string | number>;
  /** Hipóteses, nunca apresentadas como certezas. */
  hipoteses: string[];
  gravidade: "info" | "aviso";
};

const AUMENTO_SUSPEITO_MS = 100;
const VARIABILIDADE_ALTA = 0.5;

export function diagnosticarLigacao(sessao: Sessao): ItemDiagnostico[] {
  const itens: ItemDiagnostico[] = [];
  const aumentoDescida = valorDe(sessao.derivadas.aumentoLatenciaDescidaMs);
  const aumentoSubida = valorDe(sessao.derivadas.aumentoLatenciaSubidaMs);

  if (aumentoDescida !== null && aumentoDescida > AUMENTO_SUSPEITO_MS) {
    itens.push({
      observacao: "diagnostico.obs.aumentoDescida",
      params: { delta: Math.round(aumentoDescida) },
      hipoteses: ["diagnostico.hip.filasExcessivas", "diagnostico.hip.wifiOuCongestionamento"],
      gravidade: "aviso",
    });
  }
  if (aumentoSubida !== null && aumentoSubida > AUMENTO_SUSPEITO_MS) {
    itens.push({
      observacao: "diagnostico.obs.aumentoSubida",
      params: { delta: Math.round(aumentoSubida) },
      hipoteses: ["diagnostico.hip.filasExcessivas", "diagnostico.hip.prioridadeDeTrafego"],
      gravidade: "aviso",
    });
  }

  const est = calcularEstatisticas(sessao.amostras.descidaMbps);
  if (est.cv !== null && est.cv > VARIABILIDADE_ALTA && est.contagem >= 4) {
    itens.push({
      observacao: "diagnostico.obs.variacaoDescida",
      params: { cv: Math.round(est.cv * 100) },
      hipoteses: ["diagnostico.hip.instabilidadeWifi", "diagnostico.hip.trafegoConcorrente"],
      gravidade: "aviso",
    });
  }

  const lat = calcularEstatisticas(sessao.amostras.latenciaRepousoMs);
  if (lat.atipicos.length > 0 && lat.contagem >= 6) {
    itens.push({
      observacao: "diagnostico.obs.latenciaAtipica",
      params: { count: lat.atipicos.length, total: lat.contagem },
      hipoteses: ["diagnostico.hip.interferenciaOuFila"],
      gravidade: "info",
    });
  }

  if (sessao.ambiente.tipoLigacao === "cellular") {
    itens.push({
      observacao: "diagnostico.obs.movel",
      hipoteses: ["diagnostico.hip.variacaoMovel"],
      gravidade: "info",
    });
  }

  if (sessao.ambiente.paginaOcultaDuranteTeste) {
    itens.push({
      observacao: "diagnostico.obs.paginaOculta",
      hipoteses: ["diagnostico.hip.limitacaoEmSegundoPlano"],
      gravidade: "aviso",
    });
  }

  if (itens.length === 0) {
    itens.push({
      observacao: "diagnostico.obs.semAnomalias",
      hipoteses: ["diagnostico.hip.ressalvasGerais"],
      gravidade: "info",
    });
  }

  itens.push({
    observacao: "diagnostico.obs.nota",
    hipoteses: ["diagnostico.hip.vpnOuProxy"],
    gravidade: "info",
  });

  return itens;
}
