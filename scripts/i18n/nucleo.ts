/**
 * Lógica incremental da tradução. Só retraduz o que mudou na origem, valida tudo
 * e nunca escreve uma tradução rejeitada. Recebe o fornecedor por injeção, por
 * isso é testável sem rede.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Local } from "../../src/medicao/textos/locais.ts";
import { ErroFatal, type Fornecedor } from "./fornecedor.ts";
import type { Item } from "./prompt.ts";
import { validarDicionario, validarTraducao, type Glossario } from "./validar.ts";

export type Estado = { locais: Record<string, Record<string, string>> };

export type ResultadoLocal = {
  slug: string;
  traduzidas: number;
  emCache: number;
  rejeitadas: Record<string, string[]>;
  chamadas: number;
};

export function hashOrigem(pt: string, en: string, glossario: Glossario): string {
  return createHash("sha256")
    .update(`${pt}\u0000${en}\u0000${glossario.versao}`)
    .digest("hex")
    .slice(0, 12);
}

export function lerJson<T>(caminho: string, omissao: T): T {
  return existsSync(caminho) ? (JSON.parse(readFileSync(caminho, "utf8")) as T) : omissao;
}

export function escreverJson(caminho: string, dados: unknown): void {
  mkdirSync(join(caminho, ".."), { recursive: true });
  writeFileSync(caminho, JSON.stringify(dados, null, 2) + "\n", "utf8");
}

export type OpcoesLocal = {
  local: Local;
  pt: Record<string, string>;
  en: Record<string, string>;
  glossario: Glossario;
  existente: Record<string, string>;
  estadoLocal: Record<string, string>;
  fornecedor: Fornecedor;
  tamanhoLote: number;
  forcar: boolean;
  /** Chamada contada antes de cada pedido; lança erro ao passar do limite. */
  contar: () => void;
  rondasDeCorrecao?: number;
};

export async function traduzirLocal(o: OpcoesLocal): Promise<{
  dic: Record<string, string>;
  estado: Record<string, string>;
  resultado: ResultadoLocal;
}> {
  const chaves = Object.keys(o.pt);
  const dic: Record<string, string> = {};
  const estado: Record<string, string> = {};
  let chamadas = 0;

  // 1. Reaproveita o que continua válido e igual à origem atual.
  let emCache = 0;
  const pendentes: string[] = [];
  for (const k of chaves) {
    const h = hashOrigem(o.pt[k], o.en[k] ?? "", o.glossario);
    const antigo = o.existente[k];
    const bom =
      !o.forcar &&
      antigo !== undefined &&
      o.estadoLocal[k] === h &&
      validarTraducao({
        chave: k,
        origem: o.pt[k],
        traducao: antigo,
        local: o.local,
        glossario: o.glossario,
      }).length === 0;
    if (bom) {
      dic[k] = antigo;
      estado[k] = h;
      emCache++;
    } else pendentes.push(k);
  }

  // 2. Traduz em lotes, com rondas de correção para as rejeitadas.
  let falhadas: Record<string, string[]> = {};
  // Falhas do pedido já foram repetidas pelo cliente. Repetir aqui só gastaria chamadas.
  const falhasDePedido: Record<string, string[]> = {};
  let porFazer = pendentes;
  const rondas = 1 + (o.rondasDeCorrecao ?? 2);
  for (let ronda = 0; ronda < rondas && porFazer.length > 0; ronda++) {
    const proximas: Record<string, string[]> = {};
    for (let i = 0; i < porFazer.length; i += o.tamanhoLote) {
      const lote = porFazer.slice(i, i + o.tamanhoLote);
      const itens: Record<string, Item> = Object.fromEntries(
        lote.map((k) => [k, { pt: o.pt[k], en: o.en[k] ?? "" }]),
      );
      const erros =
        ronda > 0 ? Object.fromEntries(lote.map((k) => [k, falhadas[k] ?? []])) : undefined;
      o.contar();
      chamadas++;
      let resposta: Record<string, unknown>;
      try {
        resposta = await o.fornecedor({ local: o.local, itens, glossario: o.glossario, erros });
      } catch (e) {
        if (e instanceof ErroFatal) throw e;
        for (const k of lote)
          falhasDePedido[k] = [`pedido falhou: ${e instanceof Error ? e.message : String(e)}`];
        continue;
      }
      for (const k of lote) {
        const t = typeof resposta[k] === "string" ? (resposta[k] as string).trim() : resposta[k];
        const problemas = validarTraducao({
          chave: k,
          origem: o.pt[k],
          traducao: t,
          local: o.local,
          glossario: o.glossario,
        });
        if (problemas.length === 0) {
          dic[k] = t as string;
          estado[k] = hashOrigem(o.pt[k], o.en[k] ?? "", o.glossario);
        } else proximas[k] = problemas;
      }
    }
    falhadas = proximas;
    porFazer = Object.keys(proximas);
  }

  const ordenado = Object.fromEntries(chaves.filter((k) => k in dic).map((k) => [k, dic[k]]));
  return {
    dic: ordenado,
    estado,
    resultado: {
      slug: o.local.slug,
      traduzidas: Object.keys(dic).length - emCache,
      emCache,
      rejeitadas: { ...falhadas, ...falhasDePedido },
      chamadas,
    },
  };
}

export { validarDicionario };
