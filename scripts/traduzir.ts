/**
 * Pipeline de tradução automática.
 *
 *   npm run i18n                       traduz o que falta ou mudou, em todos os idiomas
 *   npm run i18n -- --locale es,fr     só estes idiomas
 *   npm run i18n -- --forcar           retraduz tudo
 *   npm run i18n:verificar             valida sem rede (usado no CI)
 *   npm run i18n:verificar -- --estrito  falha também se faltar ou estiver desatualizado
 *
 * O resultado são ficheiros JSON em src/medicao/textos/gerado, guardados no repositório
 * através de pull request. A aplicação nunca chama a IA em tempo de execução.
 */
import { join } from "node:path";
import { LOCAIS_GERADOS, obterLocal } from "../src/medicao/textos/locais.ts";
import { en } from "../src/medicao/textos/en.ts";
import { pt } from "../src/medicao/textos/pt.ts";
import { configDoAmbiente, criarFornecedor, ErroFornecedor } from "./i18n/fornecedor.ts";
import { escreverJson, hashOrigem, lerJson, traduzirLocal, type Estado } from "./i18n/nucleo.ts";
import { validarDicionario, type Glossario } from "./i18n/validar.ts";

const raiz = join(import.meta.dirname, "..");
const pasta = join(raiz, "src/medicao/textos/gerado");
const glossario = lerJson<Glossario>(join(raiz, "scripts/i18n/glossario.json"), {
  versao: 1,
  manterIgual: [],
});

const args = process.argv.slice(2);
const tem = (n: string) => args.includes(`--${n}`);
const valor = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const escolhidos = (valor("locale") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const alvos = escolhidos.length
  ? escolhidos.map((s) => {
      const l = obterLocal(s);
      if (!l || !LOCAIS_GERADOS.includes(l)) {
        console.error(`Idioma desconhecido ou escrito à mão: ${s}`);
        process.exit(2);
      }
      return l;
    })
  : [...LOCAIS_GERADOS];

const origem = pt as Record<string, string>;
const reserva = en as Record<string, string>;
const estado = lerJson<Estado>(join(pasta, "_estado.json"), { locais: {} });
const manifesto = lerJson<{ limiar: number; cobertura: Record<string, number> }>(
  join(pasta, "_ativos.json"),
  {
    limiar: 0.95,
    cobertura: {},
  },
);
const ficheiro = (slug: string) => join(pasta, `${slug}.json`);

function verificar(): number {
  let problemas = 0;
  let incompletos = 0;
  for (const l of alvos) {
    const dic = lerJson<Record<string, string>>(ficheiro(l.slug), {});
    if (Object.keys(dic).length === 0) {
      console.log(`${l.slug.padEnd(7)} sem tradução gerada`);
      incompletos++;
      continue;
    }
    const maus = validarDicionario(origem, dic, l, glossario);
    const faltam = Object.keys(origem).filter((k) => !(k in dic));
    const antigas = Object.keys(dic).filter(
      (k) =>
        k in origem &&
        estado.locais[l.slug]?.[k] !== hashOrigem(origem[k], reserva[k] ?? "", glossario),
    );
    for (const [k, e] of Object.entries(maus)) console.log(`  ${l.slug}.${k}: ${e.join("; ")}`);
    problemas += Object.keys(maus).length;
    if (faltam.length || antigas.length) incompletos++;
    console.log(
      `${l.slug.padEnd(7)} ${Object.keys(dic).length}/${Object.keys(origem).length} chaves, ${Object.keys(maus).length} inválidas, ${faltam.length} em falta, ${antigas.length} desatualizadas`,
    );
  }
  if (problemas > 0) return 1;
  return tem("estrito") && incompletos > 0 ? 1 : 0;
}

async function traduzir(): Promise<number> {
  const fornecedor = criarFornecedor(configDoAmbiente(process.env));
  const limite = Number(valor("max-chamadas") ?? 400);
  let feitas = 0;
  const contar = () => {
    if (++feitas > limite) throw new ErroFornecedor(`limite de ${limite} chamadas atingido`);
  };

  // Grava no disco o que já está traduzido e validado. Nunca cria um ficheiro vazio:
  // a sua existência é um sinal de que o idioma tem conteúdo.
  const guardar = (slug: string, dic: Record<string, string>, est: Record<string, string>) => {
    if (Object.keys(dic).length === 0) return;
    escreverJson(ficheiro(slug), dic);
    estado.locais[slug] = est;
    escreverJson(join(pasta, "_estado.json"), estado);
    manifesto.cobertura[slug] =
      Math.round((Object.keys(dic).length / Object.keys(origem).length) * 1000) / 1000;
    escreverJson(join(pasta, "_ativos.json"), manifesto);
  };

  let rejeitadasTotal = 0;
  for (const l of alvos) {
    const r = await traduzirLocal({
      local: l,
      pt: origem,
      en: reserva,
      glossario,
      existente: lerJson<Record<string, string>>(ficheiro(l.slug), {}),
      estadoLocal: estado.locais[l.slug] ?? {},
      fornecedor,
      tamanhoLote: Number(valor("lote") ?? 20),
      forcar: tem("forcar"),
      contar,
      guardar: (d, e) => guardar(l.slug, d, e),
    });
    guardar(l.slug, r.dic, r.estado);
    const n = Object.keys(r.resultado.rejeitadas).length;
    rejeitadasTotal += n;
    console.log(
      `${l.slug.padEnd(7)} +${r.resultado.traduzidas} novas, ${r.resultado.emCache} em cache, ${n} rejeitadas, ${r.resultado.chamadas} chamadas`,
    );
    for (const [k, e] of Object.entries(r.resultado.rejeitadas))
      console.log(`  ! ${l.slug}.${k}: ${e.join("; ")}`);
  }
  console.log(`Total de chamadas: ${feitas}`);
  return tem("estrito") && rejeitadasTotal > 0 ? 1 : 0;
}

try {
  process.exit(tem("verificar") ? verificar() : await traduzir());
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  console.error("Execução interrompida. O que já foi traduzido e validado ficou guardado.");
  process.exit(1);
}
