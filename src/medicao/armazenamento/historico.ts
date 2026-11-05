/**
 * Histórico de sessões em IndexedDB, guardado apenas neste dispositivo.
 * A leitura e a importação validam a estrutura para rejeitar dados malformados.
 */
import type { Sessao } from "../motor/tipos";

const NOME_BD = "historicoMedicoes";
const VERSAO_BD = 1;
const LOJA = "sessoes";

export const VERSAO_ESQUEMA_ATUAL = 1;

type Migracao = (sessao: Record<string, unknown>) => Record<string, unknown>;

/** Migrações indexadas pela versão de origem. Manter ordenadas. */
export const migracoes: Record<number, Migracao> = {};

export function migrarSessao(bruta: unknown): Sessao | null {
  if (!bruta || typeof bruta !== "object") return null;
  let s = bruta as Record<string, unknown>;
  const origem = typeof s.versaoEsquema === "number" ? s.versaoEsquema : 0;
  for (let v = origem; v < VERSAO_ESQUEMA_ATUAL; v++) {
    const m = migracoes[v];
    if (!m) break;
    s = m(s);
  }
  return sessaoValida(s) ? (s as unknown as Sessao) : null;
}

const CHAVES_AMOSTRAS = [
  "latenciaRepousoMs",
  "latenciaCargaDescidaMs",
  "latenciaCargaSubidaMs",
  "descidaMbps",
  "subidaMbps",
];

/** Validação estrutural mínima, com limites contra abuso em dados importados. */
export function sessaoValida(candidata: unknown): boolean {
  if (!candidata || typeof candidata !== "object") return false;
  const x = candidata as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (typeof x.id !== "string" || x.id.length > 200) return false;
  if (typeof x.iniciadaEm !== "string" || Number.isNaN(Date.parse(x.iniciadaEm))) return false;
  if (
    x.terminadaEm !== null &&
    (typeof x.terminadaEm !== "string" || Number.isNaN(Date.parse(x.terminadaEm)))
  ) {
    return false;
  }
  if (!["concluida", "parcial", "falhou", "cancelada"].includes(x.estado)) return false;
  if (
    typeof x.versaoEsquema !== "number" ||
    x.versaoEsquema < 1 ||
    x.versaoEsquema > VERSAO_ESQUEMA_ATUAL
  ) {
    return false;
  }
  if (!x.metricas || typeof x.metricas !== "object") return false;
  if (!x.motor || typeof x.motor.perfilId !== "string") return false;
  if (!x.amostras || typeof x.amostras !== "object") return false;
  for (const chave of CHAVES_AMOSTRAS) {
    const lista = x.amostras[chave];
    if (lista !== undefined && !Array.isArray(lista)) return false;
    if (Array.isArray(lista) && lista.length > 5000) return false;
  }
  if (Array.isArray(x.diagnosticos) && x.diagnosticos.length > 200) return false;
  return true;
}

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(NOME_BD, VERSAO_BD);
    pedido.onupgradeneeded = () => {
      const bd = pedido.result;
      if (!bd.objectStoreNames.contains(LOJA)) {
        const loja = bd.createObjectStore(LOJA, { keyPath: "id" });
        loja.createIndex("iniciadaEm", "iniciadaEm");
      }
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

/** Executa uma operação numa transação e fecha sempre a ligação. */
async function executar<T>(
  modo: IDBTransactionMode,
  operacao: (loja: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const bd = await abrir();
  return new Promise((resolve, reject) => {
    const tx = bd.transaction(LOJA, modo);
    const pedido = operacao(tx.objectStore(LOJA));
    tx.oncomplete = () => {
      bd.close();
      resolve(pedido ? pedido.result : undefined);
    };
    tx.onerror = () => {
      bd.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      bd.close();
      reject(tx.error);
    };
  });
}

export const historico = {
  async guardar(sessao: Sessao): Promise<void> {
    await executar("readwrite", (loja) => loja.put(sessao));
  },

  async listar(): Promise<Sessao[]> {
    const brutas = (await executar<unknown[]>("readonly", (loja) => loja.getAll())) ?? [];
    return brutas
      .map(migrarSessao)
      .filter((s): s is Sessao => s !== null)
      .sort((a, b) => b.iniciadaEm.localeCompare(a.iniciadaEm));
  },

  async remover(id: string): Promise<void> {
    await executar("readwrite", (loja) => loja.delete(id));
  },

  async limpar(): Promise<void> {
    await executar("readwrite", (loja) => loja.clear());
  },
};
