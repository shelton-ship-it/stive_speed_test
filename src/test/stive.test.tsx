import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { CabecaViva } from "@/componentes/CabecaViva";
import { ehTv, proximoNaDirecao } from "@/componentes/dispositivo";
import { Estrutura } from "@/paginas/Estrutura";
import { Politicas } from "@/paginas/Politicas";
import { en } from "@/medicao/textos/en";
import { LOCAIS } from "@/medicao/textos/locais";
import { pt } from "@/medicao/textos/pt";
import { site } from "@/site";

afterEach(cleanup);
const raiz = join(__dirname, "../..");
const ler = (c: string) => readFileSync(join(raiz, c), "utf8");

async function montarPoliticas() {
  const r = createRootRoute();
  const rota = createRoute({
    getParentRoute: () => r,
    path: "/",
    component: () => (
      <Estrutura local={LOCAIS[0]} dicionario={pt}>
        <Politicas />
      </Estrutura>
    ),
  });
  const router = createRouter({
    routeTree: r.addChildren([rota]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
}

describe("marca Stive", () => {
  it("o nome da marca nunca é traduzido e o resto do nome é", () => {
    expect(site.marca).toBe("Stive");
    expect(pt["marca.nome"]).toBe("Stive Teste de Velocidade");
    expect(en["marca.nome"]).toBe("Stive Speed Test");
    expect(pt["rodape.direitos"]).toContain("Stive");
    expect(en["rodape.seguir"]).toContain("Stive");
  });

  it("o glossário de tradução protege Stive e Cloudflare", () => {
    const g = JSON.parse(ler("scripts/i18n/glossario.json"));
    expect(g.manterIgual).toEqual(expect.arrayContaining(["Stive", "Cloudflare"]));
  });

  it("contacto e suporte seguem a mesma regra, em endereços da marca", () => {
    expect(site.contacto).toBe("https://contact.stive.tech");
    expect(site.suporte).toBe("https://support.stive.tech");
  });
});

describe("rodapé e políticas", () => {
  it("o rodapé tem políticas, contacto, suporte e a indicação da Cloudflare", async () => {
    await montarPoliticas();
    const rodape = document.querySelector("footer")!;
    const ligacoes = [...rodape.querySelectorAll("a")].map((a) => [
      a.textContent,
      a.getAttribute("href"),
    ]);
    expect(ligacoes).toEqual(
      expect.arrayContaining([
        ["Contacto", "https://contact.stive.tech"],
        ["Suporte", "https://support.stive.tech"],
      ]),
    );
    expect(rodape.querySelector('a[href="/politicas"]')?.textContent).toBe("Políticas");
    expect(rodape.textContent).toContain("Com tecnologia da API da Cloudflare");
    for (const a of rodape.querySelectorAll('a[target="_blank"]'))
      expect(a.getAttribute("rel")).toContain("noopener");
  });

  it("a página de políticas cobre privacidade, a Cloudflare, armazenamento, direitos e termos", async () => {
    await montarPoliticas();
    const titulos = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    for (const t of [
      "Em resumo",
      "O que a Cloudflare recebe durante o teste",
      "Cookies e armazenamento local",
      "Os seus direitos",
      "Termos de uso",
    ]) {
      expect(titulos).toContain(t);
    }
    expect(
      document.querySelector('a[href="https://www.cloudflare.com/privacypolicy/"]'),
    ).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("as políticas descrevem o que o código realmente faz", () => {
    const motor = ler("src/medicao/motor/perfis.ts");
    expect(motor).toContain("logAimApiUrl: null");
    expect(pt["politicas.cloudflare.p3"]).toContain("Não ativámos o envio opcional");
    const rede = ler("src/medicao/rede/percurso.ts");
    expect(rede).toContain('credentials: "omit"');
  });
});

describe("cabeça da marca", () => {
  it("cria só os suportes de medição, fora da árvore de acessibilidade, sem texto nem campos", () => {
    const { container } = render(<CabecaViva />);
    const c = container.querySelector(".cabeca")!;
    expect(c.getAttribute("aria-hidden")).toBe("true");
    expect(c.textContent).toBe("");
    expect(container.querySelector("input,textarea,button")).toBeNull();
    expect(container.querySelector("#cabecaOlhoE")).not.toBeNull();
    expect(container.querySelector("#cabecaOlhoD")).not.toBeNull();
    expect(container.querySelector(".cabecaCena")).not.toBeNull();
  });

  it("o script mantém o original e traz só as alterações de integração", () => {
    const js = ler("public/cabeca/cabeca.js");
    expect(js).not.toMatch(/limbo|it watches|\.limbo-/);
    expect(js).toContain("setClearColor"); // fundo transparente da cena original
    expect(js).toContain('document.addEventListener("input",ue,!0)');
    expect(js).not.toContain("s.focus()"); // nunca rouba o foco
    expect(js).toContain("prefers-reduced-motion");
    expect(js.length).toBeGreaterThan(500_000); // o bloco original está inteiro
  });

  it("o CSS não põe fundo, borda, sombra nem moldura à volta da cabeça", () => {
    const css = ler("src/estilos/global.css");
    const bloco = css.slice(css.indexOf(".cabeca {"), css.indexOf("@supports (color: oklch"));
    expect(bloco).not.toMatch(/background|border|box-shadow|filter|outline/);
  });
});

describe("todos os ecrãs", () => {
  it("deteta televisões pelo navegador e por ecrã grande sem rato nem toque", () => {
    const base = {
      userAgent: "Mozilla/5.0 Chrome",
      larguraEcra: 1440,
      ponteiroGrosso: false,
      semHover: false,
      pontosDeToque: 0,
    };
    expect(ehTv({ ...base, userAgent: "Mozilla/5.0 (SMART-TV; Tizen 6.0) TV" })).toBe(true);
    expect(ehTv({ ...base, userAgent: "Mozilla/5.0 (Linux; Android 11; AFTMM) AppleWebKit" })).toBe(
      true,
    );
    expect(ehTv({ ...base, semHover: true })).toBe(true);
    expect(ehTv(base)).toBe(false); // computador com rato
    expect(ehTv({ ...base, semHover: true, pontosDeToque: 5 })).toBe(false); // tablet
    expect(ehTv({ ...base, semHover: true, larguraEcra: 800 })).toBe(false);
  });

  it("a navegação por setas escolhe o vizinho certo e prefere o alinhado", () => {
    const c = (id: string, x: number, y: number) => ({ el: document.createElement(id), x, y });
    const centro = c("a", 100, 100);
    const dir = c("b", 220, 104);
    const longe = c("c", 230, 220);
    const baixo = c("d", 98, 190);
    const todos = [centro, dir, longe, baixo];
    expect(proximoNaDirecao(centro, todos, "ArrowRight")?.el).toBe(dir.el);
    expect(proximoNaDirecao(centro, todos, "ArrowDown")?.el).toBe(baixo.el);
    expect(proximoNaDirecao(centro, todos, "ArrowLeft")).toBeNull();
    expect(proximoNaDirecao(centro, todos, "ArrowUp")).toBeNull();
  });

  it("o CSS cobre telemóvel, tablet, ecrã grande, ultra largo, televisão, toque e contraste", () => {
    const css = ler("src/estilos/global.css");
    for (const regra of [
      "min-width: 1600px",
      "min-width: 1920px",
      "min-width: 2560px",
      'data-dispositivo="tv"',
      "hover: none) and (pointer: coarse",
      "orientation: landscape",
      "max-width: 360px",
      "forced-colors: active",
      "prefers-contrast: more",
      "prefers-reduced-motion",
      "safe-area-inset-bottom",
    ]) {
      expect(css, regra).toContain(regra);
    }
  });

  it("o manifesto da aplicação instalável está completo e a marca vem certa", () => {
    const m = JSON.parse(ler("public/manifest.webmanifest"));
    expect(m.name).toBe("Stive Speed Test");
    expect(m.short_name).toBe("Stive");
    expect(m.display).toBe("standalone");
    expect(
      m.icons.map((i: { sizes: string; purpose: string }) => `${i.sizes}:${i.purpose}`),
    ).toEqual(["192x192:any", "512x512:any", "512x512:maskable"]);
    expect(ler("public/icons/LEIAME.txt")).toContain("apple-touch-icon.png");
  });

  it("o service worker só trata o mesmo domínio e nunca guarda pedidos de medição", () => {
    const sw = ler("public/sw.js");
    expect(sw).toContain("url.origin !== self.location.origin");
    expect(sw).toContain('r.method !== "GET"');
    expect(sw).not.toMatch(/cloudflare|speed\./i);
  });
});
