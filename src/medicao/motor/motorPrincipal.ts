/**
 * Implementação do contrato MotorMedicao sobre o pacote de medição de rede.
 * É a única camada que conhece a API desse pacote.
 *
 * Notas sobre a API da versão fixada:
 * - pausar e retomar são suportados (pause e play);
 * - não existe cancelamento público: cancelar = pausar e descartar o motor.
 */
import NucleoMedicao from "nucleo";
import type { Results } from "nucleo";
import type { EventosMotor, MotorMedicao } from "./contrato";
import type { FaseMedicao, LeituraAoVivo, Sessao } from "./tipos";
import type { Perfil } from "./perfis";
import { normalizarResultados } from "../dominio/normalizar";
import { recolherAmbiente } from "../dominio/ambiente";

export const NOME_MOTOR = "nucleo";
export const VERSAO_MOTOR = "1.14.2";

const FASE_POR_TIPO: Record<string, FaseMedicao> = {
  latency: "latencia",
  download: "descida",
  upload: "subida",
  packetLoss: "perdaPacotes",
};

export type OpcoesMotorPrincipal = {
  perfil: Perfil;
  eventos: EventosMotor;
};

function arredondar(v: number | null, casas: number): number | null {
  if (v === null || !Number.isFinite(v)) return null;
  const f = 10 ** casas;
  return Math.round(v * f) / f;
}

function temDadosUteis(r: Results): boolean {
  return (
    r.getDownloadBandwidthPoints().length > 0 ||
    r.getUploadBandwidthPoints().length > 0 ||
    r.getUnloadedLatencyPoints().length > 0
  );
}

export class MotorPrincipal implements MotorMedicao {
  readonly nome = NOME_MOTOR;
  readonly versao = VERSAO_MOTOR;

  private motor: InstanceType<typeof NucleoMedicao> | null = null;
  private readonly opcoes: OpcoesMotorPrincipal;
  private inicio: Date | null = null;
  private cancelado = false;
  private terminado = false;
  private libertado = false;
  private temporizadorLimite: ReturnType<typeof setTimeout> | null = null;
  private temporizadorProgresso: ReturnType<typeof setInterval> | null = null;
  private paginaOculta = false;
  private aoMudarVisibilidade: (() => void) | null = null;
  private indiceFase: number | null = null;

  constructor(opcoes: OpcoesMotorPrincipal) {
    this.opcoes = opcoes;
  }

  iniciar(): void {
    // Uma sessão ativa por instância: bloqueia início duplicado.
    if (this.motor || this.libertado) return;
    const { perfil, eventos } = this.opcoes;

    this.inicio = new Date();
    this.cancelado = false;
    this.terminado = false;
    this.paginaOculta = false;

    this.motor = new NucleoMedicao(perfil.paraConfigMotor());

    this.motor.onPhaseChange = (carga) => {
      if (!this.motor) return;
      this.indiceFase = carga.measurementId;
      const fase = FASE_POR_TIPO[carga.measurement.type] ?? "latencia";
      eventos.aoMudarFase?.(fase, carga.measurementId, perfil.fases.length);
      this.emitirProgresso();
    };

    this.motor.onResultsChange = () => this.emitirProgresso();

    this.motor.onFinish = (resultados: Results) => {
      if (this.cancelado || this.libertado) return;
      this.terminado = true;
      this.limparTemporizadores();
      eventos.aoConcluir?.(this.construirSessao(resultados, "concluida"));
    };

    this.motor.onError = (mensagem: string, estadoHttp?: number) => {
      if (this.cancelado || this.libertado) return;
      this.limparTemporizadores();
      eventos.aoFalhar?.(mensagem, estadoHttp);
      const resultados = this.motor?.results;
      if (resultados && temDadosUteis(resultados)) {
        eventos.aoReceberParciais?.(this.construirSessao(resultados, "parcial"));
      }
    };

    // Limite da interface: se o motor não terminar dentro do tempo do perfil.
    this.temporizadorLimite = setTimeout(() => {
      if (this.terminado || this.cancelado || this.libertado) return;
      this.pausarInterno();
      const resultados = this.motor?.results;
      this.limparTemporizadores();
      eventos.aoFalhar?.("timeout");
      if (resultados && temDadosUteis(resultados)) {
        eventos.aoReceberParciais?.(this.construirSessao(resultados, "parcial"));
      }
    }, perfil.limiteInterfaceMs);

    if (typeof document !== "undefined") {
      this.aoMudarVisibilidade = () => {
        if (document.visibilityState === "hidden") this.paginaOculta = true;
      };
      document.addEventListener("visibilitychange", this.aoMudarVisibilidade);
    }

    // Atualiza decorrido e estimativa mesmo sem eventos do motor.
    this.temporizadorProgresso = setInterval(() => this.emitirProgresso(), 500);

    this.motor.play();
    eventos.aoMudarFase?.("latencia", 0, perfil.fases.length);
  }

  pausar(): boolean {
    if (!this.motor || this.terminado || this.cancelado) return false;
    this.motor.pause();
    return true;
  }

  retomar(): boolean {
    if (!this.motor || this.terminado || this.cancelado) return false;
    this.motor.play();
    return true;
  }

  cancelar(): void {
    if (!this.motor || this.terminado) return;
    this.pausarInterno();
    this.cancelado = true;
    this.limparTemporizadores();
    // Resultado parcial com estado explícito "cancelada", nunca apresentado como completo.
    this.opcoes.eventos.aoReceberParciais?.(this.construirSessao(this.motor.results, "cancelada"));
  }

  libertar(): void {
    this.libertado = true;
    this.limparTemporizadores();
    if (this.aoMudarVisibilidade && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.aoMudarVisibilidade);
      this.aoMudarVisibilidade = null;
    }
    if (this.motor) {
      this.pausarInterno();
      this.motor.onPhaseChange = undefined as unknown as typeof this.motor.onPhaseChange;
      this.motor = null;
    }
  }

  private pausarInterno(): void {
    try {
      this.motor?.pause();
    } catch {
      /* o estado do motor pode já não permitir pausa */
    }
  }

  private limparTemporizadores(): void {
    if (this.temporizadorLimite !== null) clearTimeout(this.temporizadorLimite);
    if (this.temporizadorProgresso !== null) clearInterval(this.temporizadorProgresso);
    this.temporizadorLimite = null;
    this.temporizadorProgresso = null;
  }

  private emitirProgresso(): void {
    if (!this.motor || !this.inicio) return;
    const r = this.motor.results;
    const pontosDescida = r.getDownloadBandwidthPoints();
    const pontosSubida = r.getUploadBandwidthPoints();
    const decorridoMs = Date.now() - this.inicio.getTime();

    const bytesDe = (pontos: { transferSize: number; bytes: number }[]) =>
      pontos.reduce((acc, p) => acc + (p.transferSize > 0 ? p.transferSize : p.bytes), 0);

    let restanteMs: number | null = null;
    if (decorridoMs > 3000) {
      const feitas = this.indiceFase ?? 0;
      const total = this.opcoes.perfil.fases.length;
      if (feitas < total)
        restanteMs = Math.round((decorridoMs / Math.max(feitas, 1)) * (total - feitas));
    }

    const descida = r.getDownloadBandwidth();
    const subida = r.getUploadBandwidth();
    const leitura: LeituraAoVivo = {
      descidaMbps: arredondar(descida !== undefined ? descida / 1e6 : null, 2),
      subidaMbps: arredondar(subida !== undefined ? subida / 1e6 : null, 2),
      latenciaRepousoMs: arredondar(r.getUnloadedLatency() ?? null, 1),
      latenciaCargaDescidaMs: arredondar(r.getDownLoadedLatency() ?? null, 1),
      latenciaCargaSubidaMs: arredondar(r.getUpLoadedLatency() ?? null, 1),
      bytesDescida: pontosDescida.length ? bytesDe(pontosDescida) : null,
      bytesSubida: pontosSubida.length ? bytesDe(pontosSubida) : null,
      progressoFase:
        this.indiceFase !== null
          ? { feitas: this.indiceFase, total: this.opcoes.perfil.fases.length }
          : null,
      decorridoMs,
      restanteMs,
    };
    this.opcoes.eventos.aoProgredir?.(leitura);
  }

  private construirSessao(
    resultados: Results,
    estado: "concluida" | "parcial" | "cancelada",
  ): Sessao {
    return normalizarResultados({
      resultados,
      perfilId: this.opcoes.perfil.id,
      perfilVersao: this.opcoes.perfil.versao,
      motorNome: this.nome,
      motorVersao: this.versao,
      iniciadaEm: this.inicio ?? new Date(),
      terminadaEm: new Date(),
      estado,
      paginaOcultaDuranteTeste: this.paginaOculta,
      ambiente: recolherAmbiente(),
    });
  }
}
