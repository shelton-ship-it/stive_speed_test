import type { EventosMotor, MotorMedicao } from "@/medicao/motor/contrato";
import type { Sessao } from "@/medicao/motor/tipos";
import { sessaoDeExemplo } from "./fixtures";

/** Motor simulado: percorre as fases com temporizadores e termina com uma sessão de exemplo. */
export class MotorSimulado implements MotorMedicao {
  readonly nome = "simulado";
  readonly versao = "0";
  private temporizadores: ReturnType<typeof setTimeout>[] = [];
  private pausado = false;

  constructor(
    private readonly eventos: EventosMotor,
    private readonly sessao: Sessao = sessaoDeExemplo(),
  ) {}

  iniciar(): void {
    const fases = ["latencia", "descida", "subida"] as const;
    fases.forEach((fase, i) => {
      this.temporizadores.push(
        setTimeout(
          () => {
            this.eventos.aoMudarFase?.(fase, i, fases.length);
            this.eventos.aoProgredir?.({
              descidaMbps: i >= 1 ? 120 : null,
              subidaMbps: i >= 2 ? 30 : null,
              latenciaRepousoMs: 20,
              latenciaCargaDescidaMs: null,
              latenciaCargaSubidaMs: null,
              bytesDescida: i >= 1 ? 1_000_000 : null,
              bytesSubida: null,
              progressoFase: { feitas: i, total: fases.length },
              decorridoMs: (i + 1) * 1000,
              restanteMs: null,
            });
          },
          (i + 1) * 1000,
        ),
      );
    });
    this.temporizadores.push(setTimeout(() => this.eventos.aoConcluir?.(this.sessao), 4000));
  }

  pausar(): boolean {
    this.pausado = true;
    return true;
  }
  retomar(): boolean {
    this.pausado = false;
    return true;
  }
  cancelar(): void {
    this.temporizadores.forEach(clearTimeout);
    this.eventos.aoReceberParciais?.({ ...this.sessao, estado: "cancelada" });
  }
  libertar(): void {
    this.temporizadores.forEach(clearTimeout);
    this.temporizadores = [];
  }
  get emPausa(): boolean {
    return this.pausado;
  }
}
