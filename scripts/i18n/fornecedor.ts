/**
 * Cliente do serviço de IA. Corre apenas em scripts e no CI, nunca no navegador
 * nem no servidor da aplicação: a chave não chega ao código publicado.
 *
 * Formato de pedido: POST {endpoint}/accounts/{conta}/ai/run/{modelo}
 * com cabeçalho Authorization Bearer e corpo { messages, max_tokens, temperature }.
 * A resposta traz o texto em result.response (ou, em modelos compatíveis,
 * em choices[0].message.content).
 *
 * Alternativa: TRADUCAO_FORNECEDOR=gemini usa a API Gemini (Google AI Studio):
 * POST {endpoint}/models/{modelo}:generateContent com o cabeçalho x-goog-api-key.
 * Nesse modo só TRADUCAO_TOKEN (a chave Google) é obrigatória.
 *
 * TRADUCAO_FORNECEDOR=openai usa qualquer serviço compatível com a API OpenAI
 * (Groq, OpenRouter, NVIDIA...): POST {endpoint}/chat/completions com Bearer.
 * Por omissão aponta ao Groq; TRADUCAO_ENDPOINT e TRADUCAO_MODELO mudam o serviço.
 */
import { lerObjetoJson, montarMensagens, type PedidoLote } from "./prompt.ts";

export type Fornecedor = (pedido: PedidoLote) => Promise<Record<string, unknown>>;

export type TipoFornecedor = "cloudflare" | "gemini" | "openai";

export const ENDPOINT_GEMINI = "https://generativelanguage.googleapis.com/v1beta";
export const ENDPOINT_OPENAI = "https://api.groq.com/openai/v1";

export type ConfigFornecedor = {
  /** Omitido equivale a "cloudflare". */
  tipo?: TipoFornecedor;
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
  if (env.TRADUCAO_FORNECEDOR?.trim().toLowerCase() === "gemini") {
    return {
      tipo: "gemini",
      // TRADUCAO_ENDPOINT é da Cloudflare e é ignorado aqui, para uma variável antiga não desviar o pedido.
      endpoint: ENDPOINT_GEMINI,
      conta: "",
      token: em("TRADUCAO_TOKEN"),
      modelo: env.TRADUCAO_MODELO?.trim() || "gemini-flash-latest",
      modoJson: env.TRADUCAO_MODO_JSON !== "0",
    };
  }
  if (env.TRADUCAO_FORNECEDOR?.trim().toLowerCase() === "openai") {
    const ep = env.TRADUCAO_ENDPOINT?.trim();
    return {
      tipo: "openai",
      // Um endpoint da Cloudflare esquecido nas variáveis não pode desviar o pedido.
      endpoint: (ep && !ep.includes("cloudflare.com") ? ep : ENDPOINT_OPENAI).replace(/\/+$/, ""),
      conta: "",
      token: em("TRADUCAO_TOKEN"),
      modelo: env.TRADUCAO_MODELO?.trim() || "openai/gpt-oss-120b",
      modoJson: env.TRADUCAO_MODO_JSON !== "0",
    };
  }
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

/** Converte o esquema JSON para o subconjunto que a API Gemini aceita (tipos em maiúsculas). */
export function esquemaParaGemini(e: unknown): unknown {
  if (Array.isArray(e)) return e.map(esquemaParaGemini);
  if (!e || typeof e !== "object") return e;
  return Object.fromEntries(
    Object.entries(e as Record<string, unknown>).map(([k, v]) => [
      k,
      k === "type" && typeof v === "string" ? v.toUpperCase() : esquemaParaGemini(v),
    ]),
  );
}

function textoGemini(dados: unknown): unknown {
  const d = dados as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown; thought?: unknown }> } }>;
  };
  const partes = d?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(partes)) return undefined;
  return partes
    .filter((p) => p && p.thought !== true && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("");
}

function corpoGemini(pedido: PedidoCliente, cfg: ConfigFornecedor): Record<string, unknown> {
  const sistema = pedido.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n");
  const geracao: Record<string, unknown> = {
    temperature: 0,
    // Os modelos com raciocínio contam o pensamento neste limite: folga para a resposta não ser cortada.
    maxOutputTokens: Math.min(65_536, pedido.maxTokens * 2 + 2048),
  };
  if (cfg.modoJson) {
    geracao.responseMimeType = "application/json";
    if (pedido.esquema) geracao.responseSchema = esquemaParaGemini(pedido.esquema);
  }
  const corpo: Record<string, unknown> = {
    contents: pedido.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: "user", parts: [{ text: m.content }] })),
    generationConfig: geracao,
  };
  if (sistema) corpo.systemInstruction = { parts: [{ text: sistema }] };
  return corpo;
}

/** Mensagem de erro devolvida pelo serviço (curta, sem segredos), para diagnosticar recusas. */
async function detalheErro(resposta: Response): Promise<string> {
  try {
    const d = (await resposta.json()) as {
      error?: { message?: unknown; status?: unknown } | string;
      errors?: Array<{ message?: unknown }>;
      detail?: unknown;
      message?: unknown;
      title?: unknown;
    };
    const e = typeof d?.error === "string" ? d.error : (d?.error?.message ?? d?.error?.status);
    const m = e ?? d?.errors?.[0]?.message ?? d?.detail ?? d?.message ?? d?.title;
    return typeof m === "string" && m ? `: ${m.slice(0, 300)}` : "";
  } catch {
    return "";
  }
}

/** Lê de um 429 da API Gemini quanto esperar (RetryInfo) e se a quota esgotada é a diária (QuotaFailure). */
async function infoQuotaGemini(
  resposta: Response,
): Promise<{ segundos?: number; diaria: boolean }> {
  try {
    const d = (await resposta.json()) as { error?: { details?: Array<Record<string, unknown>> } };
    let segundos: number | undefined;
    let diaria = false;
    for (const x of d?.error?.details ?? []) {
      const tipo = String(x["@type"] ?? "");
      if (tipo.endsWith("RetryInfo") && typeof x.retryDelay === "string") {
        const n = parseFloat(x.retryDelay);
        if (n > 0) segundos = n;
      }
      if (tipo.endsWith("QuotaFailure") && Array.isArray(x.violations)) {
        for (const v of x.violations as Array<Record<string, unknown>>) {
          if (/PerDay/i.test(String(v?.quotaId ?? ""))) diaria = true;
        }
      }
    }
    return { segundos, diaria };
  } catch {
    return { diaria: false };
  }
}

export function criarCliente(cfg: ConfigFornecedor): Cliente {
  const buscar = cfg.buscar ?? fetch;
  const esperar = cfg.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const tentativas = cfg.tentativas ?? 3;
  const gemini = cfg.tipo === "gemini";
  const openai = cfg.tipo === "openai";
  const url = gemini
    ? `${cfg.endpoint}/models/${encodeURIComponent(cfg.modelo)}:generateContent`
    : openai
      ? `${cfg.endpoint}/chat/completions`
      : `${cfg.endpoint}/accounts/${encodeURIComponent(cfg.conta)}/ai/run/${cfg.modelo}`;
  const cabecalhos: Record<string, string> = gemini
    ? { "x-goog-api-key": cfg.token, "Content-Type": "application/json" }
    : { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" };

  return async (pedido) => {
    const corpo: Record<string, unknown> = gemini
      ? corpoGemini(pedido, cfg)
      : {
          ...(openai ? { model: cfg.modelo } : {}),
          messages: pedido.messages,
          max_tokens: pedido.maxTokens,
          temperature: 0,
        };
    if (openai && cfg.modoJson) {
      // Com esquema estrito os valores só podem ser texto; sem ele o modelo costuma copiar a forma {pt, en}.
      corpo.response_format =
        pedido.esquema && /gpt-oss/i.test(cfg.modelo)
          ? {
              type: "json_schema",
              json_schema: {
                name: "traducao",
                strict: true,
                schema: { ...pedido.esquema, additionalProperties: false },
              },
            }
          : { type: "json_object" };
    }
    if (openai && /gpt-oss/i.test(cfg.modelo)) {
      // Modelos de raciocínio: pouco pensamento e folga no limite, para a resposta não vir cortada.
      corpo.reasoning_effort = "low";
      // Pedir menos tokens também poupa o limite por minuto dos planos gratuitos.
      corpo.max_tokens = Math.min(pedido.maxTokens, 3000) + 1000;
    }
    if (!gemini && !openai && cfg.modoJson && pedido.esquema) {
      corpo.response_format = { type: "json_schema", json_schema: pedido.esquema };
    }

    let ultimo = "";
    let esperas429 = 0;
    for (let i = 1; i <= tentativas; i++) {
      let esperaMs: number | undefined;
      const controlo = new AbortController();
      const temporizador = setTimeout(() => controlo.abort(), cfg.tempoLimiteMs ?? 120_000);
      try {
        const resposta = await buscar(url, {
          method: "POST",
          headers: cabecalhos,
          body: JSON.stringify(corpo),
          signal: controlo.signal,
        });
        if (resposta.status === 429 || resposta.status >= 500) {
          ultimo = `estado ${resposta.status}`;
          // Limite de pedidos/tokens por minuto: espera o tempo que o serviço indica, sem gastar tentativas.
          let segundos = Number(resposta.headers?.get?.("retry-after"));
          if (resposta.status === 429 && gemini) {
            const info = await infoQuotaGemini(resposta);
            if (info.diaria) {
              throw new ErroFatal(
                "quota diária da API Gemini esgotada (repõe-se à meia-noite, hora do Pacífico): continua amanhã ou muda de fornecedor",
              );
            }
            // Sem indicação da Google, espera um tempo fixo curto em vez de repetir de imediato.
            segundos = info.segundos ?? 15;
          }
          if (resposta.status === 429 && segundos > 0 && esperas429 < 12) {
            esperas429++;
            esperaMs = Math.min(90_000, Math.ceil(segundos * 1000) + 500);
            i--;
            console.warn(
              `  … limite do serviço (429): a esperar ${Math.round(esperaMs / 1000)} s (espera ${esperas429} de 12)`,
            );
          }
        } else if (!resposta.ok) {
          // Erros do pedido (token, modelo, corpo) não melhoram com repetição.
          throw new ErroFatal(
            `pedido recusado, estado ${resposta.status} em ${new URL(url).host}${new URL(url).pathname}${await detalheErro(resposta)}${resposta.status === 401 || resposta.status === 403 ? ` (chave enviada: ${cfg.token.slice(0, 10)}…, ${cfg.token.length} caracteres)` : ""}`,
          );
        } else {
          const dados = await resposta.json();
          if ((dados as { success?: boolean }).success === false) {
            throw new ErroFatal("o serviço respondeu com success falso");
          }
          const objeto = lerObjetoJson(gemini ? textoGemini(dados) : textoDaResposta(dados));
          if (objeto) return objeto;
          ultimo = "resposta sem JSON válido";
        }
      } catch (e) {
        if (e instanceof ErroFatal) throw new ErroFatal(ocultar(e.message, cfg.token));
        ultimo = ocultar(e instanceof Error ? e.message : String(e), cfg.token);
      } finally {
        clearTimeout(temporizador);
      }
      if (i < tentativas) await esperar(esperaMs ?? 1000 * 2 ** (i - 1));
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
