/**
 * Classificação de experiência por tipo de uso.
 * As regras são versionadas e baseadas em métricas observadas. São estimativas
 * de adequação da ligação: o teste não mede jogos, serviços ou aplicações reais.
 */
import { valorDe, type Sessao } from "../motor/tipos";

export const VERSAO_REGRAS = 1;

export type Nivel = "excelente" | "boa" | "limitada" | "fraca" | "semDados";
export type UsoId =
  "jogos" | "streaming" | "videochamadas" | "navegacao" | "transferencias" | "trabalhoRemoto";

export type AvaliacaoUso = {
  uso: UsoId;
  nivel: Nivel;
  /** Verdadeiro quando a classificação vem das pontuações calculadas pelo motor. */
  doMotor: boolean;
  /** Chaves de texto das métricas que determinaram o nível. */
  metricasDeterminantes: string[];
  recomendacoes: string[];
};

type Limiares = { excelente: number; boa: number; limitada: number };

const DESCIDA: Limiares = { excelente: 100, boa: 25, limitada: 10 };
const SUBIDA: Limiares = { excelente: 20, boa: 5, limitada: 1 };
const LATENCIA: Limiares = { excelente: 30, boa: 80, limitada: 150 };
const JITTER: Limiares = { excelente: 10, boa: 30, limitada: 60 };
const AUMENTO_CARGA: Limiares = { excelente: 20, boa: 60, limitada: 150 };

function nivelMaiorMelhor(v: number | null, l: Limiares): Nivel {
  if (v === null) return "semDados";
  if (v >= l.excelente) return "excelente";
  if (v >= l.boa) return "boa";
  if (v >= l.limitada) return "limitada";
  return "fraca";
}

function nivelMenorMelhor(v: number | null, l: Limiares): Nivel {
  if (v === null) return "semDados";
  if (v <= l.excelente) return "excelente";
  if (v <= l.boa) return "boa";
  if (v <= l.limitada) return "limitada";
  return "fraca";
}

function pior(niveis: Nivel[]): Nivel {
  const ordem: Nivel[] = ["fraca", "limitada", "boa", "excelente"];
  for (const n of ordem) if (niveis.includes(n)) return n;
  return "semDados";
}

const NIVEL_DO_MOTOR: Record<string, Nivel> = {
  great: "excelente",
  good: "boa",
  average: "limitada",
  poor: "fraca",
  bad: "fraca",
};

function nivelDoMotor(sessao: Sessao, chave: string): Nivel | null {
  const p = sessao.pontuacoes[chave];
  if (!p) return null;
  return NIVEL_DO_MOTOR[p.nomeClasse] ?? "semDados";
}

function recomendar(nivel: Nivel, metrica: "descida" | "subida" | "latencia"): string[] {
  return nivel === "excelente" || nivel === "semDados" ? [] : [`recomendacao.${metrica}`];
}

export function classificarExperiencia(sessao: Sessao): AvaliacaoUso[] {
  const m = sessao.metricas;
  const descida = valorDe(m.descidaMbps);
  const subida = valorDe(m.subidaMbps);
  const latencia = valorDe(m.latenciaRepousoMs);
  const jitter = valorDe(m.jitterRepousoMs);
  const aumentoDescida = valorDe(sessao.derivadas.aumentoLatenciaDescidaMs);
  const aumentoSubida = valorDe(sessao.derivadas.aumentoLatenciaSubidaMs);

  const lista: AvaliacaoUso[] = [];
  const derivada = (
    uso: UsoId,
    niveis: Nivel[],
    metricasDeterminantes: string[],
    recomendacoes: string[],
  ) =>
    lista.push({ uso, nivel: pior(niveis), doMotor: false, metricasDeterminantes, recomendacoes });
  const doMotor = (uso: UsoId, nivel: Nivel) =>
    lista.push({
      uso,
      nivel,
      doMotor: true,
      metricasDeterminantes: ["metrica.pontuacaoMotor"],
      recomendacoes: [],
    });

  const limiaresJogosDescida: Limiares = { excelente: 50, boa: 15, limitada: 5 };
  const nJogos = nivelDoMotor(sessao, "gaming");
  if (nJogos) doMotor("jogos", nJogos);
  else
    derivada(
      "jogos",
      [
        nivelMenorMelhor(latencia, LATENCIA),
        nivelMenorMelhor(jitter, JITTER),
        nivelMenorMelhor(aumentoDescida, AUMENTO_CARGA),
        nivelMaiorMelhor(descida, limiaresJogosDescida),
      ],
      [
        "metrica.latenciaRepouso",
        "metrica.jitterRepouso",
        "metrica.aumentoLatenciaDescida",
        "metrica.descida",
      ],
      [
        ...recomendar(nivelMenorMelhor(latencia, LATENCIA), "latencia"),
        ...recomendar(nivelMenorMelhor(aumentoDescida, AUMENTO_CARGA), "latencia"),
      ],
    );

  const nStreaming = nivelDoMotor(sessao, "streaming");
  const niveisStreaming = [
    nivelMaiorMelhor(descida, limiaresJogosDescida),
    nivelMenorMelhor(jitter, JITTER),
  ];
  if (nStreaming) doMotor("streaming", nStreaming);
  else
    derivada(
      "streaming",
      niveisStreaming,
      ["metrica.descida", "metrica.jitterRepouso"],
      recomendar(niveisStreaming[0], "descida"),
    );

  const nChamadas = nivelDoMotor(sessao, "rtc");
  if (nChamadas) doMotor("videochamadas", nChamadas);
  else {
    const limiaresSubidaChamadas: Limiares = { excelente: 10, boa: 3, limitada: 1 };
    derivada(
      "videochamadas",
      [
        nivelMaiorMelhor(subida, limiaresSubidaChamadas),
        nivelMenorMelhor(latencia, LATENCIA),
        nivelMenorMelhor(aumentoSubida, AUMENTO_CARGA),
      ],
      ["metrica.subida", "metrica.latenciaRepouso", "metrica.aumentoLatenciaSubida"],
      [
        ...recomendar(nivelMaiorMelhor(subida, SUBIDA), "subida"),
        ...recomendar(nivelMenorMelhor(aumentoSubida, AUMENTO_CARGA), "latencia"),
      ],
    );
  }

  derivada(
    "navegacao",
    [
      nivelMaiorMelhor(descida, { excelente: 25, boa: 5, limitada: 1 }),
      nivelMenorMelhor(latencia, { excelente: 100, boa: 200, limitada: 400 }),
    ],
    ["metrica.descida", "metrica.latenciaRepouso"],
    recomendar(nivelMaiorMelhor(descida, DESCIDA), "descida"),
  );
  derivada(
    "transferencias",
    [nivelMaiorMelhor(descida, DESCIDA), nivelMaiorMelhor(subida, SUBIDA)],
    ["metrica.descida", "metrica.subida"],
    [
      ...recomendar(nivelMaiorMelhor(descida, DESCIDA), "descida"),
      ...recomendar(nivelMaiorMelhor(subida, SUBIDA), "subida"),
    ],
  );
  derivada(
    "trabalhoRemoto",
    [
      nivelMaiorMelhor(subida, { excelente: 10, boa: 3, limitada: 1 }),
      nivelMenorMelhor(latencia, LATENCIA),
      nivelMenorMelhor(aumentoDescida, AUMENTO_CARGA),
    ],
    ["metrica.subida", "metrica.latenciaRepouso", "metrica.aumentoLatenciaDescida"],
    recomendar(nivelMaiorMelhor(subida, SUBIDA), "subida"),
  );

  return lista;
}
