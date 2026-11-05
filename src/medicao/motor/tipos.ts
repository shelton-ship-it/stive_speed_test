/**
 * Modelo interno normalizado de uma sessão de medição.
 * É independente da estrutura interna do motor que realiza as medições.
 */

export type EstadoMetrica = "medida" | "indisponivel" | "naoSuportada" | "invalida";
export type OrigemMetrica = "motor" | "derivada";

export type Metrica = {
  valor: number | null;
  unidade: string;
  origem: OrigemMetrica;
  estado: EstadoMetrica;
};

export function metricaIndisponivel(unidade: string, origem: OrigemMetrica = "motor"): Metrica {
  return { valor: null, unidade, origem, estado: "indisponivel" };
}

export function metricaMedida(
  valor: number,
  unidade: string,
  origem: OrigemMetrica = "motor",
): Metrica {
  if (!Number.isFinite(valor) || valor < 0) {
    return { valor: null, unidade, origem, estado: "invalida" };
  }
  return { valor, unidade, origem, estado: "medida" };
}

/** Valor numérico de uma métrica, ou null quando não foi medida. */
export function valorDe(metrica: Metrica | undefined): number | null {
  return metrica && metrica.estado === "medida" ? metrica.valor : null;
}

export type EstadoSessao = "concluida" | "parcial" | "falhou" | "cancelada";

export type Amostra = {
  /** Instante ISO da amostra. */
  t: string;
  /** Milissegundos (latência) ou Mbps (largura de banda). */
  valor: number;
  /** Bytes transferidos quando aplicável. */
  bytes?: number;
};

export type PontuacaoMotor = {
  pontos: number;
  indiceClasse: number;
  nomeClasse: string;
};

export type CodigoDiagnostico =
  | "paginaOcultaDuranteTeste"
  | "tipoLigacaoIndisponivel"
  | "perdaPacotesNaoConfigurada"
  | "semAmostras"
  | "poucasAmostras";

export type Diagnostico = {
  codigo: CodigoDiagnostico;
  gravidade: "info" | "aviso" | "erro";
  chaveMensagem: string;
};

export type Sessao = {
  id: string;
  versaoEsquema: number;
  versaoProduto: string;
  motor: {
    nome: string;
    versao: string;
    perfilId: string;
    perfilVersao: number;
  };
  iniciadaEm: string;
  terminadaEm: string | null;
  duracaoMs: number | null;
  estado: EstadoSessao;
  metricas: {
    descidaMbps: Metrica;
    subidaMbps: Metrica;
    latenciaRepousoMs: Metrica;
    jitterRepousoMs: Metrica;
    latenciaCargaDescidaMs: Metrica;
    jitterCargaDescidaMs: Metrica;
    latenciaCargaSubidaMs: Metrica;
    jitterCargaSubidaMs: Metrica;
    perdaPacotes: Metrica;
  };
  derivadas: {
    aumentoLatenciaDescidaMs: Metrica;
    aumentoLatenciaSubidaMs: Metrica;
  };
  pontuacoes: Record<string, PontuacaoMotor | null>;
  contagemAmostras: Record<string, { validas: number; descartadas: number }>;
  bytesTransferidos: number | null;
  amostras: {
    latenciaRepousoMs: Amostra[];
    latenciaCargaDescidaMs: Amostra[];
    latenciaCargaSubidaMs: Amostra[];
    descidaMbps: Amostra[];
    subidaMbps: Amostra[];
  };
  ambiente: {
    navegador: string | null;
    sistema: string | null;
    tipoLigacao: string | null;
    paginaOcultaDuranteTeste: boolean;
  };
  diagnosticos: Diagnostico[];
  /** Local aproximado e servidor de teste, quando foi possível obtê-los. */
  rede?: {
    localCidade: string | null;
    localPais: string | null;
    servidorIata: string | null;
    servidorCidade: string | null;
    distanciaKm: number | null;
    rede: string | null;
  };
};

/** Fase real reportada pelo motor, para a interface não fingir sequências. */
export type FaseMedicao =
  | "inativa"
  | "verificando"
  | "pronta"
  | "latencia"
  | "descida"
  | "subida"
  | "perdaPacotes"
  | "processando"
  | "concluida"
  | "pausada"
  | "cancelando"
  | "cancelada"
  | "parcial"
  | "falhou";

export type LeituraAoVivo = {
  descidaMbps: number | null;
  subidaMbps: number | null;
  latenciaRepousoMs: number | null;
  latenciaCargaDescidaMs: number | null;
  latenciaCargaSubidaMs: number | null;
  bytesDescida: number | null;
  bytesSubida: number | null;
  progressoFase: { feitas: number; total: number } | null;
  decorridoMs: number;
  /** Estimativa de tempo restante; a interface identifica sempre como estimativa. */
  restanteMs: number | null;
};

/** Ponto da série em tempo real, em Mbps. */
export type PontoVivo = { t: number; descida: number | null; subida: number | null };
