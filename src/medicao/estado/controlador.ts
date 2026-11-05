/**
 * Máquina de estados explícita e controlador do teste.
 * Regras: uma sessão ativa por controlador; início duplicado bloqueado;
 * um erro nunca converte métricas ausentes em zero; cancelar preserva parciais.
 */
import type { EventosMotor, MotorMedicao } from "../motor/contrato";
import type { FaseMedicao, LeituraAoVivo, PontoVivo, Sessao } from "../motor/tipos";
import {
  PERFIS,
  construirPerfilPersonalizado,
  ID_PERFIL_PERSONALIZADO,
  obterPerfil,
  type NivelPersonalizado,
  type Perfil,
} from "../motor/perfis";
import { historico } from "../armazenamento/historico";
import { obterPercurso, resumirRede, type Percurso } from "../rede/percurso";

export type EstadoTeste =
  | "inativo"
  | "verificando"
  | "pronto"
  | "emCurso"
  | "pausado"
  | "cancelando"
  | "cancelado"
  | "processando"
  | "concluido"
  | "parcial"
  | "falhou";

export type EstadoPercurso = "inativo" | "obtendo" | "pronto" | "indisponivel";

export type Instantaneo = {
  estado: EstadoTeste;
  fase: FaseMedicao;
  aoVivo: LeituraAoVivo | null;
  /** Série de velocidade em Mbps desde o início do teste. */
  serie: PontoVivo[];
  sessao: Sessao | null;
  chaveErro: string | null;
  perfilId: string;
  nivelPersonalizado: NivelPersonalizado;
  suportaPausa: boolean;
  percurso: Percurso | null;
  estadoPercurso: EstadoPercurso;
};

type Ouvinte = () => void;

export type OpcoesFabrica = { perfil: Perfil; eventos: EventosMotor };
export type FabricaDeMotor = (opcoes: OpcoesFabrica) => MotorMedicao | Promise<MotorMedicao>;

const MAXIMO_PONTOS = 600;

/** Motor de produção, carregado só quando a pessoa inicia o teste. */
const fabricaDeProducao: FabricaDeMotor = async (opcoes) => {
  const { MotorPrincipal } = await import("../motor/motorPrincipal");
  return new MotorPrincipal(opcoes);
};

export class ControladorMedicao {
  private motor: MotorMedicao | null = null;
  private instantaneo: Instantaneo;
  private readonly ouvintes = new Set<Ouvinte>();
  private canal: BroadcastChannel | null = null;
  private outroSeparadorAtivo = false;
  private readonly fabrica: FabricaDeMotor;
  private inicioSerie = 0;

  private readonly buscarPercurso: () => Promise<Percurso | null>;

  constructor(fabrica?: FabricaDeMotor, buscarPercurso?: () => Promise<Percurso | null>) {
    this.fabrica = fabrica ?? fabricaDeProducao;
    this.buscarPercurso = buscarPercurso ?? (() => obterPercurso());
    this.instantaneo = {
      estado: "inativo",
      fase: "inativa",
      aoVivo: null,
      serie: [],
      sessao: null,
      chaveErro: null,
      perfilId: "equilibrado",
      nivelPersonalizado: "padrao",
      suportaPausa: true,
      percurso: null,
      estadoPercurso: "inativo",
    };
    if (typeof BroadcastChannel !== "undefined") {
      try {
        this.canal = new BroadcastChannel("testesSimultaneos");
        this.canal.onmessage = (e) => {
          const tipo = (e.data as { tipo?: string } | null)?.tipo;
          if (tipo === "iniciado") this.outroSeparadorAtivo = true;
          else if (tipo === "terminado") this.outroSeparadorAtivo = false;
        };
      } catch {
        /* a sinalização entre separadores é opcional */
      }
    }
  }

  obterInstantaneo = (): Instantaneo => this.instantaneo;

  subscrever = (ouvinte: Ouvinte): (() => void) => {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  };

  private definir(parcial: Partial<Instantaneo>): void {
    this.instantaneo = { ...this.instantaneo, ...parcial };
    this.ouvintes.forEach((o) => o());
  }

  get perfilAtual(): Perfil {
    if (this.instantaneo.perfilId === ID_PERFIL_PERSONALIZADO) {
      return construirPerfilPersonalizado(this.instantaneo.nivelPersonalizado);
    }
    return obterPerfil(this.instantaneo.perfilId);
  }

  get ocupado(): boolean {
    return ["verificando", "emCurso", "pausado", "cancelando", "processando"].includes(
      this.instantaneo.estado,
    );
  }

  /** Informativo: outro separador desta aplicação tem um teste em curso. */
  get outroSeparadorEmTeste(): boolean {
    return this.outroSeparadorAtivo && !this.ocupado;
  }

  escolherPerfil(id: string): void {
    if (this.ocupado) return;
    this.definir({ perfilId: id });
  }

  escolherNivel(nivel: NivelPersonalizado): void {
    if (this.ocupado) return;
    this.definir({ nivelPersonalizado: nivel, perfilId: ID_PERFIL_PERSONALIZADO });
  }

  /** Verifica suporte do navegador sem iniciar medições. */
  podeExecutar(): { ok: boolean; chaveErro?: string } {
    if (typeof fetch !== "function" || !("ReadableStream" in globalThis)) {
      return { ok: false, chaveErro: "erro.naoSuportado" };
    }
    return { ok: true };
  }

  iniciar(): void {
    if (this.motor || this.ocupado) return;
    const verificacao = this.podeExecutar();
    if (!verificacao.ok) {
      this.definir({ estado: "falhou", chaveErro: verificacao.chaveErro ?? "erro.generico" });
      return;
    }

    this.inicioSerie = Date.now();
    this.definir({
      estado: "verificando",
      fase: "verificando",
      chaveErro: null,
      sessao: null,
      aoVivo: null,
      serie: [],
    });
    this.canal?.postMessage({ tipo: "iniciado" });
    void this.carregarPercurso();

    const perfil = this.perfilAtual;
    void Promise.resolve(
      this.fabrica({
        perfil,
        eventos: {
          aoMudarFase: (fase) => {
            this.definir({
              estado: this.instantaneo.estado === "pausado" ? "pausado" : "emCurso",
              fase,
            });
          },
          aoProgredir: (leitura) => this.registarLeitura(leitura),
          aoConcluir: async (bruta) => {
            const sessao = await this.comRede(bruta);
            this.libertarMotor();
            this.canal?.postMessage({ tipo: "terminado" });
            this.definir({ estado: "processando", fase: "processando" });
            void this.finalizar(sessao);
          },
          aoReceberParciais: async (bruta) => {
            const sessao = await this.comRede(bruta);
            const estavaACancelar = this.instantaneo.estado === "cancelando";
            this.libertarMotor();
            this.canal?.postMessage({ tipo: "terminado" });
            const estado: EstadoTeste = estavaACancelar
              ? "cancelado"
              : this.instantaneo.estado === "falhou"
                ? "falhou"
                : "parcial";
            this.definir({ estado, fase: estavaACancelar ? "cancelada" : "parcial", sessao });
            if (sessao.estado !== "cancelada")
              void historico.guardar(sessao).catch(() => undefined);
          },
          aoFalhar: (mensagem) => {
            this.definir({ estado: "falhou", fase: "falhou", chaveErro: chaveDeErro(mensagem) });
          },
        },
      }),
    )
      .then((motor) => {
        // O estado pode ter mudado enquanto o motor era carregado.
        if (this.instantaneo.estado !== "verificando") {
          motor.libertar();
          return;
        }
        this.motor = motor;
        this.definir({ estado: "emCurso", fase: "latencia" });
        motor.iniciar();
      })
      .catch(() => {
        this.definir({ estado: "falhou", fase: "falhou", chaveErro: "erro.generico" });
      });
  }

  pausar(): void {
    if (this.instantaneo.estado !== "emCurso" || !this.motor) return;
    if (this.motor.pausar()) this.definir({ estado: "pausado", fase: "pausada" });
  }

  retomar(): void {
    if (this.instantaneo.estado !== "pausado" || !this.motor) return;
    if (this.motor.retomar()) this.definir({ estado: "emCurso" });
  }

  cancelar(): void {
    if (!this.motor || !["emCurso", "pausado"].includes(this.instantaneo.estado)) return;
    this.definir({ estado: "cancelando", fase: "cancelando" });
    this.motor.cancelar();
  }

  libertar(): void {
    this.libertarMotor();
    this.canal?.close();
    this.canal = null;
  }

  private libertarMotor(): void {
    if (this.motor) {
      this.motor.libertar();
      this.motor = null;
    }
  }

  /** Acrescenta a leitura à série, juntando atualizações muito próximas. */
  private registarLeitura(leitura: LeituraAoVivo): void {
    const agora = Date.now();
    const serie = this.instantaneo.serie.slice();
    const ultimo = serie[serie.length - 1];
    const ponto: PontoVivo = {
      t: (agora - this.inicioSerie) / 1000,
      descida: leitura.descidaMbps,
      subida: leitura.subidaMbps,
    };
    if (ultimo && ponto.t - ultimo.t < 0.25) {
      serie[serie.length - 1] = {
        t: ponto.t,
        descida: ponto.descida ?? ultimo.descida,
        subida: ponto.subida ?? ultimo.subida,
      };
    } else if (ponto.descida !== null || ponto.subida !== null) {
      serie.push(ponto);
    }
    if (serie.length > MAXIMO_PONTOS) serie.splice(0, serie.length - MAXIMO_PONTOS);
    this.definir({ aoVivo: leitura, serie });
  }

  /** Obtém o percurso uma vez por controlador e repete só se falhou. */
  private async carregarPercurso(): Promise<void> {
    const atual = this.instantaneo.estadoPercurso;
    if (atual === "obtendo" || atual === "pronto") return;
    this.definir({ estadoPercurso: "obtendo" });
    const percurso = await this.buscarPercurso().catch(() => null);
    this.definir({ percurso, estadoPercurso: percurso ? "pronto" : "indisponivel" });
  }

  /** Junta o percurso à sessão se já estiver disponível. Nunca atrasa o resultado nem o cancelamento. */
  private async comRede(sessao: Sessao): Promise<Sessao> {
    const p = this.instantaneo.percurso;
    return p ? { ...sessao, rede: resumirRede(p) } : sessao;
  }

  private async finalizar(sessao: Sessao): Promise<void> {
    try {
      await historico.guardar(sessao);
    } catch {
      /* histórico indisponível (por exemplo IndexedDB bloqueado): não invalida os resultados */
    }
    this.definir({ estado: "concluido", fase: "concluida", sessao });
  }
}

function chaveDeErro(mensagem: string): string {
  const m = String(mensagem ?? "").toLowerCase();
  if (m === "timeout") return "erro.tempoEsgotado";
  if (m.includes("upload")) return "erro.falhaSubida";
  if (m.includes("download")) return "erro.falhaDescida";
  if (m.includes("cors") || m.includes("header")) return "erro.bloqueio";
  if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch"))
    return "erro.rede";
  return "erro.generico";
}

export { PERFIS };
