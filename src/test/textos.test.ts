import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { pt } from "@/medicao/textos/pt";
import { en } from "@/medicao/textos/en";
import { formatarBytes, traduzir } from "@/medicao/textos/i18n";
import { LOCAIS } from "@/medicao/textos/locais";

// Hífen, travessões, sinal de menos, pontos médios, setas, reticências e emojis.
const PROIBIDOS =
  /[-\u2010-\u2015\u2212\u00b7\u2022\u2190-\u21ff\u2026\u{1F000}-\u{1FFFF}\u2600-\u27bf]/u;

describe("textos", () => {
  it("inglês cobre exatamente as mesmas chaves", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(pt).sort());
  });

  it("nenhum texto contém hífen, travessão, ponto médio, seta ou emoji", () => {
    for (const [idioma, dic] of [
      ["pt", pt],
      ["en", en],
    ] as const) {
      for (const [chave, valor] of Object.entries(dic)) {
        expect(PROIBIDOS.test(valor), `${idioma}:${chave} = ${valor}`).toBe(false);
      }
    }
  });

  it("nenhum texto fica vazio e os marcadores existem em ambos os idiomas", () => {
    for (const [chave, valor] of Object.entries(pt)) {
      expect(valor.trim().length, chave).toBeGreaterThan(0);
      const marcadores = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
      expect(marcadores(en[chave as keyof typeof en]), chave).toEqual(marcadores(valor));
    }
  });

  it("título e descrição cabem nos limites de pesquisa", () => {
    for (const d of [pt, en]) {
      expect(d["seo.titulo"].length).toBeLessThanOrEqual(60);
      expect(d["seo.descricao"].length).toBeLessThanOrEqual(160);
    }
  });

  it("interpola parâmetros e formata bytes", () => {
    expect(traduzir(pt, "progresso.fase", { feitas: 2, total: 5 })).toBe("Fase 2 de 5");
    expect(formatarBytes(LOCAIS[0], 1_500_000)).toBe("1,5 MB");
    expect(formatarBytes(LOCAIS[1], 1_500_000)).toBe("1.5 MB");
  });
});

describe("limpeza do projeto", () => {
  const raiz = join(__dirname, "..");
  const ficheiros: string[] = [];
  const percorrer = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      const caminho = join(dir, nome);
      if (statSync(caminho).isDirectory()) percorrer(caminho);
      else if (
        /\.(ts|tsx|css)$/.test(nome) &&
        !nome.endsWith("routeTree.gen.ts") &&
        !/\.test\.tsx?$/.test(nome)
      ) {
        ficheiros.push(caminho);
      }
    }
  };
  percorrer(raiz);

  it("o código não contém nomes de fornecedor nem de gerador", () => {
    const termos = /cloudflare|lovable|smart ?test|speedtest/i;
    // O fornecedor só pode aparecer onde é atribuição obrigatória ou texto de política.
    const permitidos = ["site.ts", "Politicas.tsx", "pt.ts", "en.ts"];
    for (const f of ficheiros) {
      if (permitidos.some((p) => f.endsWith(`/${p}`))) continue;
      expect(termos.test(readFileSync(f, "utf8")), f).toBe(false);
    }
  });

  it("nomes de ficheiros não contêm hífen", () => {
    for (const f of ficheiros) expect(f.split("/").pop()).not.toContain("-");
  });
});
