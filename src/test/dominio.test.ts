import { describe, expect, it } from "vitest";
import {
  calcularEstatisticas,
  jitterDeSerie,
  mbpsParaMBs,
  percentil,
} from "@/medicao/dominio/estatistica";
import { classificarExperiencia } from "@/medicao/dominio/classificar";
import { diagnosticarLigacao } from "@/medicao/dominio/diagnosticar";
import { detetarNavegador, detetarSistema } from "@/medicao/dominio/ambiente";
import { sessaoValida } from "@/medicao/armazenamento/historico";
import { exportarCsv, lerCopiaSeguranca, carimboParaFicheiro } from "@/medicao/exportar/formatos";
import { metricaMedida } from "@/medicao/motor/tipos";
import { PERFIS, construirPerfilPersonalizado } from "@/medicao/motor/perfis";
import { sessaoDeExemplo } from "./fixtures";

describe("estatística", () => {
  it("calcula percentis por interpolação", () => {
    expect(percentil([1, 2, 3, 4, 5], 0.5)).toBe(3);
    expect(percentil([10], 0.95)).toBe(10);
    expect(percentil([], 0.5)).toBeNull();
  });

  it("assinala atípicos sem os remover", () => {
    const amostras = [10, 11, 10, 12, 11, 10, 200].map((valor, i) => ({ t: String(i), valor }));
    const est = calcularEstatisticas(amostras);
    expect(est.contagem).toBe(7);
    expect(est.atipicos).toEqual([200]);
    expect(est.maximo).toBe(200);
  });

  it("calcula jitter e conversão de unidades", () => {
    expect(jitterDeSerie([10, 20, 10])).toBe(10);
    expect(jitterDeSerie([5])).toBeNull();
    expect(mbpsParaMBs(100)).toBe(12.5);
  });
});

describe("classificação e diagnóstico", () => {
  it("devolve os seis usos com níveis válidos", () => {
    const usos = classificarExperiencia(sessaoDeExemplo());
    expect(usos.map((u) => u.uso)).toEqual([
      "jogos",
      "streaming",
      "videochamadas",
      "navegacao",
      "transferencias",
      "trabalhoRemoto",
    ]);
    expect(usos.find((u) => u.uso === "jogos")?.doMotor).toBe(true);
  });

  it("sem dados nunca classifica como boa", () => {
    const vazia = sessaoDeExemplo({
      pontuacoes: {},
      derivadas: {
        aumentoLatenciaDescidaMs: {
          valor: null,
          unidade: "ms",
          origem: "derivada",
          estado: "indisponivel",
        },
        aumentoLatenciaSubidaMs: {
          valor: null,
          unidade: "ms",
          origem: "derivada",
          estado: "indisponivel",
        },
      },
      metricas: {
        ...sessaoDeExemplo().metricas,
        descidaMbps: { valor: null, unidade: "Mbps", origem: "motor", estado: "indisponivel" },
        subidaMbps: { valor: null, unidade: "Mbps", origem: "motor", estado: "indisponivel" },
        latenciaRepousoMs: { valor: null, unidade: "ms", origem: "motor", estado: "indisponivel" },
        jitterRepousoMs: { valor: null, unidade: "ms", origem: "motor", estado: "indisponivel" },
      },
    });
    for (const u of classificarExperiencia(vazia)) expect(u.nivel).toBe("semDados");
  });

  it("assinala o aumento de latência sob carga como hipótese", () => {
    const itens = diagnosticarLigacao(sessaoDeExemplo());
    const aumento = itens.find((i) => i.observacao === "diagnostico.obs.aumentoSubida");
    expect(aumento?.gravidade).toBe("aviso");
    expect(aumento?.hipoteses.every((h) => h.startsWith("diagnostico.hip."))).toBe(true);
  });

  it("aceita sessão sem anomalias", () => {
    const calma = sessaoDeExemplo({
      derivadas: {
        aumentoLatenciaDescidaMs: metricaMedida(5, "ms", "derivada"),
        aumentoLatenciaSubidaMs: metricaMedida(8, "ms", "derivada"),
      },
      amostras: { ...sessaoDeExemplo().amostras, descidaMbps: [], latenciaRepousoMs: [] },
    });
    expect(
      diagnosticarLigacao(calma).some((i) => i.observacao === "diagnostico.obs.semAnomalias"),
    ).toBe(true);
  });
});

describe("perfis", () => {
  it("limites de bytes coerentes com as fases", () => {
    for (const p of PERFIS) {
      const total = p.fases.reduce((a, f) => a + f.bytesMaximos, 0);
      expect(p.bytesMaximosDescida + p.bytesMaximosSubida).toBe(total);
      expect(p.paraConfigMotor().autoStart).toBe(false);
      expect(p.paraConfigMotor().logAimApiUrl).toBeNull();
    }
  });

  it("perfil personalizado escala com o nível", () => {
    const leve = construirPerfilPersonalizado("leve");
    const intensivo = construirPerfilPersonalizado("intensivo");
    expect(intensivo.bytesMaximosDescida).toBeGreaterThan(leve.bytesMaximosDescida);
    expect(leve.exigeAvisoDeDados).toBe(false);
  });
});

describe("armazenamento e exportação", () => {
  it("valida a estrutura das sessões", () => {
    expect(sessaoValida(sessaoDeExemplo())).toBe(true);
    expect(sessaoValida({})).toBe(false);
    expect(sessaoValida({ ...sessaoDeExemplo(), estado: "inventado" })).toBe(false);
    expect(sessaoValida({ ...sessaoDeExemplo(), iniciadaEm: "nunca" })).toBe(false);
  });

  it("exporta CSV com unidade e estado e lê cópias de segurança", () => {
    const csv = exportarCsv(sessaoDeExemplo());
    expect(csv).toContain("metrica,descidaMbps,248.3,Mbps,medida,motor");
    expect(csv).toContain("metrica,perdaPacotes,naoSuportada");
    expect(lerCopiaSeguranca("não é json")).toBeNull();
    expect(lerCopiaSeguranca(JSON.stringify({ sessoes: [1] }))).toEqual([1]);
  });

  it("gera carimbos de ficheiro sem separadores", () => {
    expect(carimboParaFicheiro("2026-10-27T10:00:00.000Z")).toBe("20261027100000");
  });
});

describe("ambiente", () => {
  it("deteta navegador e sistema na ordem correta", () => {
    expect(detetarNavegador("Mozilla/5.0 Chrome/131.0 Safari/537.36 Edg/130.0")).toBe("Edge 130");
    expect(detetarNavegador("Mozilla/5.0 Firefox/120.0")).toBe("Firefox 120");
    expect(detetarSistema("Mozilla/5.0 (Windows NT 10.0)", "")).toBe("Windows");
    expect(detetarSistema("", "")).toBeNull();
  });
});
