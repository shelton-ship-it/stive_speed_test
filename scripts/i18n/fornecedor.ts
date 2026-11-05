/**
 * Cliente do serviço de IA. Corre apenas em scripts e no CI, nunca no navegador
 * nem no servidor da aplicação: a chave não chega ao código publicado.
 *
 * Formato de pedido: POST {endpoint}/accounts/{conta}/ai/run/{modelo}
 * com cabeçalho Authorization Bearer e corpo { messages, max_tokens, temperature }.
 * A resposta traz o texto em result.response (ou, em modelos compatíveis,
 * em choices[0].message.content).
 */
import { lerObjetoJson, montarMensagens, type PedidoLote } from "./prompt.ts";

export type Fornecedor = (pedido: PedidoLote) => Promise<Record<string, unknown>>;

export type ConfigFornecedor = {
  endpoint: string;
  conta: string;
  token: string;
  modelo: string;
  /** Pede saída estruturada. Nem todos os modelos a suportam. */
  modoJson: boolean;
  tempoLimiteMs?: number;
  tentativas?: number;
  esperar?: (ms: number) => Promise<void>;
  buscar?: typeof fetch;
};

export class ErroFornecedor extends Error {}

/** Erro que repetir não resolve (credenciais, modelo, pedido inválido): o pipeline pára logo. */
export class ErroFatal extends ErroFornecedor {}

/** Nunca deixa o token aparecer em mensagens de erro ou registos. */
export function ocultar(texto: string, token: string): string {
  return token ? texto.split(token).join("***") : texto;
}

export function configDoAmbiente(env: Record<string, string | undefined>): ConfigFornecedor {
  const em = (nome: string) => {
    const v = env[nome]?.trim();
    if (!v) throw new ErroFatal(`Variável de ambiente em falta: ${nome}`);
    return v;
  };
  return {
    endpoint: em("TRADUCAO_ENDPOINT").replace(/\/+$/, ""),
    conta: em("TRADUCAO_CONTA"),
    token: em("TRADUCAO_TOKEN"),
    modelo: env.TRADUCAO_MODELO?.trim() || "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    modoJson: env.TRADUCAO_MODO_JSON !== "0",
  };
}

function textoDaResposta(dados: unknown): unknown {
  const d = dados as {
    result?: { response?: unknown };
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  return d?.result?.response ?? d?.choices?.[0]?.message?.content;
}

export type Mensagem = { role: "system" | "user"; content: string };

export type PedidoCliente = {
  messages: Mensagem[];
  maxTokens: number;
  /** Esquema JSON da resposta, quando o modo JSON está ativo. */
  esquema?: Record<string, unknown>;
};

/** Cliente genérico: envia mensagens e devolve o objeto JSON da resposta. */
export type Cliente = (pedido: PedidoCliente) => Promise<Record<string, unknown>>;

export function criarCliente(cfg: ConfigFornecedor): Cliente {
  const buscar = cfg.buscar ?? fetch;
  const esperar = cfg.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const tentativas = cfg.tentativas ?? 3;
  const url = `${cfg.endpoint}/accounts/${encodeURIComponent(cfg.conta)}/ai/run/${cfg.modelo}`;

  return async (pedido) => {
    const corpo: Record<string, unknown> = {
      messages: pedido.messages,
      max_tokens: pedido.maxTokens,
      temperature: 0,
    };
    if (cfg.modoJson && pedido.esquema) {
      corpo.response_format = { type: "json_schema", json_schema: pedido.esquema };
    }

    let ultimo = "";
    for (let i = 1; i <= tentativas; i++) {
      const controlo = new AbortController();
      const temporizador = setTimeout(() => controlo.abort(), cfg.tempoLimiteMs ?? 120_000);
      try {
        const resposta = await buscar(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
          body: JSON.stringify(corpo),
          signal: controlo.signal,
        });
        if (resposta.status === 429 || resposta.status >= 500) {
          ultimo = `estado ${resposta.status}`;
        } else if (!resposta.ok) {
          // Erros do pedido (token, modelo, corpo) não melhoram com repetição.
          throw new ErroFatal(`pedido recusado, estado ${resposta.status}`);
        } else {
          const dados = await resposta.json();
          if ((dados as { success?: boolean }).success === false) {
            throw new ErroFatal("o serviço respondeu com success falso");
          }
          const objeto = lerObjetoJson(textoDaResposta(dados));
          if (objeto) return objeto;
          ultimo = "resposta sem JSON válido";
        }
      } catch (e) {
        if (e instanceof ErroFatal) throw new ErroFatal(ocultar(e.message, cfg.token));
        ultimo = ocultar(e instanceof Error ? e.message : String(e), cfg.token);
      } finally {
        clearTimeout(temporizador);
      }
      if (i < tentativas) await esperar(1000 * 2 ** (i - 1));
    }
    throw new ErroFornecedor(`falhou após ${tentativas} tentativas: ${ultimo}`);
  };
}

/** Fornecedor de tradução: camada fina sobre o cliente genérico. */
export function criarFornecedor(cfg: ConfigFornecedor): Fornecedor {
  const cliente = criarCliente(cfg);
  return (pedido) => {
    const chaves = Object.keys(pedido.itens);
    return cliente({
      messages: montarMensagens(pedido),
      maxTokens: Math.min(8192, 600 + chaves.length * 220),
      esquema: {
        type: "object",
        properties: Object.fromEntries(chaves.map((k) => [k, { type: "string" }])),
        required: chaves,
      },
    });
  };
}
