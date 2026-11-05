import { cleanup, render, screen } from "@testing-library/react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { Estrutura } from "@/paginas/Estrutura";
import { Inicio } from "@/paginas/Inicio";
import { construirCabecalho, dadosEstruturados } from "@/seo/cabecalho";
import { en } from "@/medicao/textos/en";
import { pt } from "@/medicao/textos/pt";
import { LOCAIS } from "@/medicao/textos/locais";

afterEach(cleanup);

const [LPT, LEN] = [LOCAIS[0], LOCAIS[1]];

async function montar(caminho: "/" | "/en") {
  const raiz = createRootRoute();
  const rpt = createRoute({
    getParentRoute: () => raiz,
    path: "/",
    component: () => (
      <Estrutura local={LPT} dicionario={pt}>
        <Inicio />
      </Estrutura>
    ),
  });
  const ren = createRoute({
    getParentRoute: () => raiz,
    path: "/en",
    component: () => (
      <Estrutura local={LEN} dicionario={en}>
        <Inicio />
      </Estrutura>
    ),
  });
  const router = createRouter({
    routeTree: raiz.addChildren([rpt, ren]),
    history: createMemoryHistory({ initialEntries: [caminho] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
}

describe("páginas", () => {
  it("português tem um único h1, marca reservada e conteúdo informativo", async () => {
    await montar("/");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Teste de velocidade da internet",
    );
    expect(screen.getByRole("heading", { name: "Perguntas frequentes" })).toBeTruthy();
    expect(document.querySelectorAll("details").length).toBeGreaterThanOrEqual(8);
    expect(document.querySelector('img[src="/stive.svg"]')).not.toBeNull();
    expect(screen.queryByText(/smart|speed/i)).toBeNull();
  });

  it("inglês renderiza no idioma certo", async () => {
    await montar("/en");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Internet speed test");
    expect(screen.getByRole("heading", { name: "Frequently asked questions" })).toBeTruthy();
  });

  it("o seletor e o rodapé ligam a todos os idiomas ativos", async () => {
    await montar("/");
    const ligacoes = [...document.querySelectorAll("a[hreflang]")].map((a) =>
      a.getAttribute("hreflang"),
    );
    expect(ligacoes).toContain("pt");
    expect(ligacoes).toContain("en");
  });

  it("não inicia o teste sozinho", async () => {
    await montar("/");
    expect(screen.getByText("Pronto para medir")).toBeTruthy();
  });
});

describe("SEO", () => {
  const ativos = LOCAIS.slice(0, 2);

  it("gera canonical e hreflang absolutos para todos os idiomas ativos", () => {
    const c = construirCabecalho(LPT, pt, "https://exemplo.test", ativos);
    expect(c.links.find((l) => l.rel === "canonical")?.href).toBe("https://exemplo.test/");
    expect(c.links.filter((l) => l.rel === "alternate").map((l) => l.hrefLang)).toEqual([
      "pt",
      "en",
      "x-default",
    ]);
    expect(c.meta.find((m) => m.property === "og:image")?.content).toBe(
      "https://exemplo.test/og.png",
    );
    expect(c.meta.filter((m) => m.property === "og:locale:alternate")).toHaveLength(1);
  });

  it("sem origem omite URLs absolutos em vez de inventar", () => {
    const c = construirCabecalho(LEN, en, "", ativos);
    expect(c.links).toHaveLength(0);
    expect(c.meta.some((m) => m.property === "og:url")).toBe(false);
  });

  it("dados estruturados incluem aplicação e 8 perguntas, com a marca Stive nunca traduzida", () => {
    const g = dadosEstruturados(LPT, pt, "https://exemplo.test")["@graph"];
    expect(g[0]["@type"]).toBe("Organization");
    expect(g[1]["@type"]).toBe("WebApplication");
    expect((g[0] as { name: string }).name).toBe("Stive");
    expect((g[1] as { name: string }).name).toBe("Stive Teste de Velocidade");
    expect((g[1] as { inLanguage: string }).inLanguage).toBe("pt");
    expect((g[2] as { mainEntity: unknown[] }).mainEntity).toHaveLength(8);
  });
});
