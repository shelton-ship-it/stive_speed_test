/**
 * Pipeline de pesquisa de palavras chave, por idioma e mercado.
 *
 *   npm run palavras -- propor      A IA propõe termos nativos por conceito (hipóteses)
 *   npm run palavras -- expandir    Autocompletar do motor de pesquisa (prova de procura; opcional)
 *   npm run palavras -- importar    Lê os CSV de dados/seo/importar (volume e dificuldade reais)
 *   npm run palavras -- classificar A IA atribui cada termo a um conceito
 *   npm run palavras -- mapear      Pontua, escolhe as palavras chave e escreve o relatório (sem rede)
 *   npm run palavras -- verificar   Valida os dados (sem rede)
 *   npm run palavras -- tudo        propor, importar, classificar e mapear (com --autocompletar, também expandir)
 *
 * Opções: --locale es,fr  --max-chamadas N  --max-por-idioma N  --sementes N  --max-pedidos N
 *
 * Regras que o pipeline cumpre: a IA nunca produz volumes; os volumes só vêm de
 * CSV de ferramentas reais; termos de marcas de terceiros nunca são palavra chave.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LOCAIS, obterLocal, type Local } from "../src/medicao/textos/locais.ts";
import { configDoAmbiente, criarCliente, ErroFatal, type Cliente } from "./i18n/fornecedor.ts";
import { IDS_CONCEITOS, obterConceito } from "./seo/conceitos.ts";
import { classificarTermos, proporTermos } from "./seo/ia.ts";
import { decodificar, lerCsv } from "./seo/fontes/csv.ts";
import { ALFABETO_LATINO, expandir } from "./seo/fontes/autocompletar.ts";
import { construirMapa, fundir, recalcular, relatorioMarkdown } from "./seo/mapear.ts";
import { MERCADOS } from "./seo/mercados.ts";
import type { Candidato, MapaIdioma } from "./seo/tipos.ts";

const raiz = join(import.meta.dirname, "..");
const dados = join(raiz, "dados/seo");
const args = process.argv.slice(2);
const comando = args[0] ?? "";
const tem = (n: string) => args.includes(`--${n}`);
const valor = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const numero = (n: string, omissao: number) => Number(valor(n) ?? omissao);

const marcas: string[] = JSON.parse(
  readFileSync(join(import.meta.dirname, "seo/marcas.json"), "utf8"),
).marcas;

const escolhidos = (valor("locale") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const alvos: Local[] = escolhidos.length
  ? escolhidos.map((s) => {
      const l = obterLocal(s);
      if (!l) {
        console.error(`Idioma desconhecido: ${s}`);
        process.exit(2);
      }
      return l;
    })
  : [...LOCAIS];

const caminho = (tipo: "candidatos" | "mapa", slug: string) => join(dados, tipo, `${slug}.json`);
const ler = <T>(c: string, omissao: T): T =>
  existsSync(c) ? (JSON.parse(readFileSync(c, "utf8")) as T) : omissao;
const gravar = (c: string, d: unknown) => {
  mkdirSync(join(c, ".."), { recursive: true });
  writeFileSync(c, JSON.stringify(d, null, 2) + "\n", "utf8");
};

let chamadas = 0;
const limiteChamadas = numero("max-chamadas", 300);
let clienteIA: Cliente | null = null;
const cliente = (): Cliente => {
  clienteIA ??= criarCliente(configDoAmbiente(process.env));
  const base = clienteIA;
  return (p) => {
    if (++chamadas > limiteChamadas)
      throw new ErroFatal(`limite de ${limiteChamadas} chamadas atingido`);
    return base(p);
  };
};

const candidatosDe = (l: Local) => ler<Candidato[]>(caminho("candidatos", l.slug), []);

async function propor(l: Local): Promise<string> {
  const { termos, rejeitados } = await proporTermos({
    cliente: cliente(),
    local: l,
    mercado: MERCADOS[l.slug],
  });
  const novos = termos.map((t) => ({
    termo: t.termo,
    conceito: t.conceito,
    origem: "ia" as const,
  }));
  gravar(caminho("candidatos", l.slug), recalcular(fundir(candidatosDe(l), novos, l.intl), marcas));
  return `${termos.length} propostos, ${rejeitados} rejeitados`;
}

async function expandirLocal(l: Local): Promise<string> {
  const atuais = recalcular(candidatosDe(l), marcas);
  // Uma semente por conceito, começando pelos mais importantes.
  const sementes: string[] = [];
  const porPrioridade = [...IDS_CONCEITOS].sort(
    (a, b) => (obterConceito(b)?.prioridade ?? 0) - (obterConceito(a)?.prioridade ?? 0),
  );
  for (const id of porPrioridade) {
    const melhor = atuais.find((c) => c.conceito === id && !c.marca);
    if (melhor) sementes.push(melhor.termo);
    if (sementes.length >= numero("sementes", 25)) break;
  }
  const contagem = new Map<string, number>();
  let pedidos = 0;
  const mercado = MERCADOS[l.slug];
  for (const s of sementes) {
    if (pedidos >= numero("max-pedidos", 150)) break;
    const r = await expandir(s, {
      hl: mercado.hl,
      gl: mercado.gl,
      sufixos: l.escrita === "latino" ? ALFABETO_LATINO : [],
      maxPedidos: numero("max-pedidos", 150) - pedidos,
    });
    pedidos += r.pedidos;
    for (const t of r.termos) contagem.set(t.termo, (contagem.get(t.termo) ?? 0) + 1);
  }
  const novos = [...contagem].map(([termo, ocorrencias]) => ({
    termo,
    origem: "autocompletar" as const,
    ocorrencias,
  }));
  gravar(caminho("candidatos", l.slug), recalcular(fundir(candidatosDe(l), novos, l.intl), marcas));
  return `${sementes.length} sementes, ${pedidos} pedidos, ${novos.length} termos`;
}

function importarLocal(l: Local): string {
  const pasta = join(dados, "importar");
  const ficheiros = existsSync(pasta)
    ? readdirSync(pasta).filter(
        (f) =>
          f.toLowerCase().endsWith(".csv") && (f === `${l.slug}.csv` || f.startsWith(`${l.slug}_`)),
      )
    : [];
  const novos = ficheiros.flatMap((f) =>
    lerCsv(decodificar(readFileSync(join(pasta, f)))).map((r) => ({
      ...r,
      origem: "csv" as const,
    })),
  );
  if (novos.length)
    gravar(
      caminho("candidatos", l.slug),
      recalcular(fundir(candidatosDe(l), novos, l.intl), marcas),
    );
  return `${ficheiros.length} ficheiros, ${novos.length} linhas`;
}

async function classificarLocal(l: Local): Promise<string> {
  const todos = recalcular(candidatosDe(l), marcas);
  const porClassificar = todos
    .filter((c) => c.conceito === null && !c.marca)
    .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0) || b.ocorrencias - a.ocorrencias)
    .slice(0, numero("max-classificar", 400));
  const novos: Array<{ termo: string; conceito: string; origem: "ia" }> = [];
  for (let i = 0; i < porClassificar.length; i += 40) {
    const lote = porClassificar.slice(i, i + 40);
    const r = await classificarTermos({
      cliente: cliente(),
      local: l,
      termos: lote.map((c) => c.termo),
    });
    lote.forEach((c, j) => {
      const conceito = r[j];
      if (conceito) novos.push({ termo: c.termo, conceito, origem: "ia" });
    });
  }
  // A classificação não torna o termo "proposto pela IA": mantém as origens e só define o conceito.
  const semOrigemNova = fundir(
    candidatosDe(l),
    novos.map((n) => ({ termo: n.termo, conceito: n.conceito, origem: "ia" as const })),
    l.intl,
  ).map((c) => {
    const antes = candidatosDe(l).find((x) => x.chave === c.chave);
    return antes ? { ...c, origens: antes.origens } : c;
  });
  gravar(caminho("candidatos", l.slug), recalcular(semOrigemNova, marcas));
  return `${porClassificar.length} termos, ${novos.length} classificados`;
}

function mapearLocal(l: Local): MapaIdioma | null {
  const existentes = candidatosDe(l);
  if (existentes.length === 0) return null;
  const todos = recalcular(existentes, marcas);
  const mapa = construirMapa(l, todos);
  // Limite de armazenamento: ficam os melhores e todos os escolhidos para o mapa.
  const escolhidos = new Set(
    Object.values(mapa.conceitos).flatMap((e) => [e.primaria, ...e.secundarias, ...e.longTail]),
  );
  const maximo = numero("max-por-idioma", 1500);
  const ficam = todos.filter((c, i) => i < maximo || escolhidos.has(c.termo));
  gravar(caminho("candidatos", l.slug), ficam);
  gravar(caminho("mapa", l.slug), { ...mapa, total: ficam.length });
  return { ...mapa, total: ficam.length };
}

function escreverRelatorio(): void {
  const mapas = LOCAIS.map((l) => ler<MapaIdioma | null>(caminho("mapa", l.slug), null)).filter(
    (m): m is MapaIdioma => m !== null,
  );
  writeFileSync(join(dados, "RELATORIO.md"), relatorioMarkdown(mapas), "utf8");
}

function verificar(): number {
  let problemas = 0;
  const falha = (m: string) => {
    problemas++;
    console.log(`  ! ${m}`);
  };
  for (const l of LOCAIS) {
    const cands = ler<Candidato[] | null>(caminho("candidatos", l.slug), null);
    if (!cands) continue;
    for (const c of cands) {
      if (c.conceito !== null && !IDS_CONCEITOS.includes(c.conceito))
        falha(`${l.slug}: conceito desconhecido ${c.conceito} em "${c.termo}"`);
      if (c.volume !== null && !c.origens.includes("csv"))
        falha(`${l.slug}: "${c.termo}" tem volume sem origem em ferramenta real`);
    }
    const mapa = ler<MapaIdioma | null>(caminho("mapa", l.slug), null);
    if (!mapa) {
      falha(`${l.slug}: tem candidatos mas não tem mapa (corra mapear)`);
      continue;
    }
    for (const [id, e] of Object.entries(mapa.conceitos)) {
      if (!IDS_CONCEITOS.includes(id)) falha(`${l.slug}: conceito desconhecido no mapa: ${id}`);
      for (const t of [e.primaria, ...e.secundarias].filter((x): x is string => !!x)) {
        const c = cands.find((x) => x.termo === t);
        if (c?.marca) falha(`${l.slug}: marca de terceiros escolhida como palavra chave: "${t}"`);
      }
    }
    console.log(
      `${l.slug.padEnd(7)} ${cands.length} candidatos, ${Object.values(mapa.conceitos).filter((e) => e.primaria).length} conceitos com termo`,
    );
  }
  return problemas > 0 ? 1 : 0;
}

type Passo = (l: Local) => Promise<string> | string;
async function paraCadaIdioma(nome: string, passo: Passo): Promise<void> {
  for (const l of alvos) {
    try {
      console.log(`${nome.padEnd(11)} ${l.slug.padEnd(7)} ${await passo(l)}`);
    } catch (e) {
      if (e instanceof ErroFatal) throw e;
      console.log(
        `${nome.padEnd(11)} ${l.slug.padEnd(7)} falhou: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}

const mapear: Passo = (l) => {
  const m = mapearLocal(l);
  return m
    ? `${Object.values(m.conceitos).filter((e) => e.primaria).length} conceitos com termo`
    : "sem candidatos";
};

try {
  if (comando === "verificar") process.exit(verificar());
  else if (comando === "mapear") {
    await paraCadaIdioma("mapear", mapear);
    escreverRelatorio();
  } else if (comando === "importar") {
    await paraCadaIdioma("importar", importarLocal);
  } else if (comando === "propor") await paraCadaIdioma("propor", propor);
  else if (comando === "expandir") await paraCadaIdioma("expandir", expandirLocal);
  else if (comando === "classificar") await paraCadaIdioma("classificar", classificarLocal);
  else if (comando === "tudo") {
    await paraCadaIdioma("propor", propor);
    if (tem("autocompletar")) await paraCadaIdioma("expandir", expandirLocal);
    await paraCadaIdioma("importar", importarLocal);
    await paraCadaIdioma("classificar", classificarLocal);
    await paraCadaIdioma("mapear", mapear);
    escreverRelatorio();
    console.log(`Chamadas de IA: ${chamadas}`);
  } else {
    console.error(
      "Comando desconhecido. Use: propor, expandir, importar, classificar, mapear, verificar ou tudo.",
    );
    process.exit(2);
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  console.error("Execução interrompida. O que já foi guardado ficou guardado.");
  process.exit(1);
}
