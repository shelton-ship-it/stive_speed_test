/**
 * Perfis de teste versionados, mapeados um a um sobre a opção `measurements`
 * do motor de medição.
 *
 * Cada perfil documenta o limite superior de bytes e o número de pedidos por
 * fase. O volume real pode ser menor: o motor termina uma ronda de largura de
 * banda assim que o pedido ultrapassa a duração alvo, por isso os limites
 * abaixo descrevem o pior caso.
 */
import type { ConfigOptions } from "nucleo";

export type TipoFase = "latencia" | "descida" | "subida" | "perdaPacotes";

export type FaseDoPerfil = {
  tipo: TipoFase;
  /** Número de pacotes (latência) ou de pedidos (largura de banda). */
  pedidos: number;
  /** Bytes por pedido na largura de banda; null nas restantes fases. */
  bytesPorPedido: number | null;
  /** Limite superior de bytes da fase. */
  bytesMaximos: number;
};

export type NivelPersonalizado = "leve" | "padrao" | "intensivo";

export type Perfil = {
  id: string;
  versao: number;
  chaveNome: string;
  chaveDescricao: string;
  /** Exige confirmação de consumo de dados antes de iniciar. */
  exigeAvisoDeDados: boolean;
  bytesMaximosDescida: number;
  bytesMaximosSubida: number;
  totalPedidos: number;
  fases: FaseDoPerfil[];
  /** Tempo máximo antes de a interface considerar o teste bloqueado (ms). */
  limiteInterfaceMs: number;
  /** Duração típica estimada, em segundos. */
  duracaoEstimadaSeg: [number, number];
  paraConfigMotor(): ConfigOptions;
};

const KB = 1e3;
const MB = 1e6;

function fase(tipo: TipoFase, pedidos: number, bytesPorPedido: number | null): FaseDoPerfil {
  return {
    tipo,
    pedidos,
    bytesPorPedido,
    bytesMaximos: bytesPorPedido === null ? 0 : pedidos * bytesPorPedido,
  };
}

function somarBytes(fases: FaseDoPerfil[], tipo: "descida" | "subida"): number {
  return fases.filter((f) => f.tipo === tipo).reduce((acc, f) => acc + f.bytesMaximos, 0);
}

type DefinicaoPerfil = {
  id: string;
  versao: number;
  chaveNome: string;
  chaveDescricao: string;
  exigeAvisoDeDados: boolean;
  fases: FaseDoPerfil[];
  limiteInterfaceMs: number;
  duracaoEstimadaSeg: [number, number];
};

function construirPerfil(def: DefinicaoPerfil): Perfil {
  const medicoes = def.fases.map((f) => {
    switch (f.tipo) {
      case "latencia":
        return { type: "latency" as const, numPackets: f.pedidos };
      case "descida":
        return { type: "download" as const, bytes: f.bytesPorPedido as number, count: f.pedidos };
      case "subida":
        return { type: "upload" as const, bytes: f.bytesPorPedido as number, count: f.pedidos };
      case "perdaPacotes":
        return {
          type: "packetLoss" as const,
          numPackets: f.pedidos,
          batchSize: 10,
          batchWaitTime: 10,
          responsesWaitTime: 3000,
        };
    }
  });

  return {
    ...def,
    bytesMaximosDescida: somarBytes(def.fases, "descida"),
    bytesMaximosSubida: somarBytes(def.fases, "subida"),
    totalPedidos: def.fases.reduce((acc, f) => acc + f.pedidos, 0),
    paraConfigMotor(): ConfigOptions {
      return {
        autoStart: false,
        measureDownloadLoadedLatency: true,
        measureUploadLoadedLatency: true,
        measurements: medicoes,
        // O envio de resultados para o endpoint de análise do fornecedor fica
        // desligado: nenhum dado de medição sai do navegador para além dos pedidos de teste.
        logAimApiUrl: null,
        logMeasurementApiUrl: null,
      };
    },
  };
}

export const PERFIS: Perfil[] = [
  construirPerfil({
    id: "rapido",
    versao: 1,
    chaveNome: "perfil.rapido.nome",
    chaveDescricao: "perfil.rapido.descricao",
    exigeAvisoDeDados: false,
    fases: [fase("latencia", 10, null), fase("descida", 5, 1 * MB), fase("subida", 4, 1 * MB)],
    limiteInterfaceMs: 90_000,
    duracaoEstimadaSeg: [10, 25],
  }),
  construirPerfil({
    id: "equilibrado",
    versao: 1,
    chaveNome: "perfil.equilibrado.nome",
    chaveDescricao: "perfil.equilibrado.descricao",
    exigeAvisoDeDados: false,
    fases: [
      fase("latencia", 20, null),
      fase("descida", 4, 100 * KB),
      fase("descida", 8, 1 * MB),
      fase("subida", 6, 1 * MB),
      fase("descida", 5, 10 * MB),
      fase("subida", 4, 10 * MB),
    ],
    limiteInterfaceMs: 180_000,
    duracaoEstimadaSeg: [20, 60],
  }),
  construirPerfil({
    id: "preciso",
    versao: 1,
    chaveNome: "perfil.preciso.nome",
    chaveDescricao: "perfil.preciso.descricao",
    exigeAvisoDeDados: true,
    fases: [
      fase("latencia", 40, null),
      fase("descida", 6, 100 * KB),
      fase("descida", 12, 1 * MB),
      fase("subida", 10, 1 * MB),
      fase("descida", 10, 10 * MB),
      fase("subida", 8, 10 * MB),
      fase("descida", 4, 25 * MB),
      fase("subida", 3, 25 * MB),
    ],
    limiteInterfaceMs: 300_000,
    duracaoEstimadaSeg: [45, 150],
  }),
  construirPerfil({
    id: "diagnostico",
    versao: 1,
    chaveNome: "perfil.diagnostico.nome",
    chaveDescricao: "perfil.diagnostico.descricao",
    exigeAvisoDeDados: true,
    fases: [
      fase("latencia", 50, null),
      fase("descida", 8, 100 * KB),
      fase("descida", 14, 1 * MB),
      fase("subida", 12, 1 * MB),
      fase("descida", 12, 10 * MB),
      fase("subida", 10, 10 * MB),
      fase("latencia", 20, null),
    ],
    limiteInterfaceMs: 300_000,
    duracaoEstimadaSeg: [60, 180],
  }),
];

/** Entrada final da lista de perfis na interface (a configuração é feita à parte). */
export const ID_PERFIL_PERSONALIZADO = "personalizado";

export function obterPerfil(id: string): Perfil {
  const perfil = PERFIS.find((p) => p.id === id);
  if (!perfil) throw new Error(`Perfil desconhecido: ${id}`);
  return perfil;
}

/**
 * Perfil personalizado: a pessoa escolhe um nível de amostragem.
 * Os limites de bytes continuam explícitos e verificáveis.
 */
export function construirPerfilPersonalizado(nivel: NivelPersonalizado): Perfil {
  const escala = nivel === "leve" ? 0.5 : nivel === "intensivo" ? 2 : 1;
  const n = (base: number) => Math.max(2, Math.round(base * escala));
  const sufixo = nivel === "leve" ? "Leve" : nivel === "intensivo" ? "Intensivo" : "Padrao";
  return construirPerfil({
    id: `${ID_PERFIL_PERSONALIZADO}${sufixo}`,
    versao: 1,
    chaveNome: "perfil.personalizado.nome",
    chaveDescricao: "perfil.personalizado.descricao",
    exigeAvisoDeDados: nivel !== "leve",
    fases: [
      fase("latencia", n(20), null),
      fase("descida", n(4), 100 * KB),
      fase("descida", n(8), 1 * MB),
      fase("subida", n(6), 1 * MB),
      fase("descida", n(5), 10 * MB),
      fase("subida", n(4), 10 * MB),
    ],
    limiteInterfaceMs: nivel === "intensivo" ? 420_000 : 240_000,
    duracaoEstimadaSeg: nivel === "leve" ? [15, 40] : nivel === "intensivo" ? [60, 200] : [25, 70],
  });
}

/** Perfis personalizados guardam o nível no id; o nome mostrado é sempre "personalizado". */
export function perfilBase(id: string): string {
  return id.startsWith(ID_PERFIL_PERSONALIZADO) ? ID_PERFIL_PERSONALIZADO : id;
}
