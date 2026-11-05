/**
 * Sugestões de pesquisa em tempo real. É prova de que as pessoas pesquisam o
 * termo (não é volume). Opcional e desligado por omissão: automatizar pedidos a
 * um motor de pesquisa pode violar os seus termos de uso, por isso é lento e
 * educado (espera entre pedidos, limite total) e para ao primeiro sinal de bloqueio.
 */

export type Buscar = (url: string, init?: RequestInit) => Promise<Response>;

export type OpcoesSugestao = {
  hl: string;
  gl: string;
  url?: string;
  buscar?: Buscar;
};

const URL_OMISSAO = "https://suggestqueries.google.com/complete/search";

/** Uma consulta. Devolve as sugestões por ordem de posição. */
export async function sugerir(termo: string, o: OpcoesSugestao): Promise<string[]> {
  const url = new URL(o.url ?? URL_OMISSAO);
  url.searchParams.set("client", "firefox");
  url.searchParams.set("q", termo);
  url.searchParams.set("hl", o.hl);
  url.searchParams.set("gl", o.gl);
  const buscar = o.buscar ?? ((u, i) => fetch(u, i));
  const resposta = await buscar(url.toString(), {
    headers: { Accept: "application/json" },
    credentials: "omit",
  });
  if (resposta.status === 429 || resposta.status === 403)
    throw new ErroBloqueio(`bloqueado, estado ${resposta.status}`);
  if (!resposta.ok) return [];
  const dados: unknown = await resposta.json().catch(() => null);
  if (!Array.isArray(dados) || !Array.isArray(dados[1])) return [];
  return dados[1].filter((s): s is string => typeof s === "string");
}

export class ErroBloqueio extends Error {}

const ALFABETO = "abcdefghijklmnopqrstuvwxyz".split("");

export type OpcoesExpansao = OpcoesSugestao & {
  /** Letras a juntar à semente. Vazio usa só a semente (escritas sem alfabeto latino). */
  sufixos?: string[];
  maxPedidos: number;
  esperarMs?: number;
  esperar?: (ms: number) => Promise<void>;
};

/** Expande uma semente com a semente sozinha e com cada letra. Devolve termo e posição. */
export async function expandir(
  semente: string,
  o: OpcoesExpansao,
): Promise<{ termos: Array<{ termo: string; posicao: number }>; pedidos: number }> {
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const consultas = [semente, ...(o.sufixos ?? ALFABETO).map((l) => `${semente} ${l}`)];
  const termos: Array<{ termo: string; posicao: number }> = [];
  let pedidos = 0;
  for (const c of consultas) {
    if (pedidos >= o.maxPedidos) break;
    pedidos++;
    try {
      (await sugerir(c, o)).forEach((termo, i) => termos.push({ termo, posicao: i + 1 }));
    } catch (e) {
      if (e instanceof ErroBloqueio) break; // sinal de bloqueio: pára de insistir
      throw e;
    }
    await esperar(o.esperarMs ?? 700);
  }
  return { termos, pedidos };
}

export const ALFABETO_LATINO = ALFABETO;
