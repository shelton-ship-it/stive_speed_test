/**
 * Preferências da pessoa (tema e unidade), guardadas no próprio navegador.
 *
 * Tema: por omissão segue o navegador, em tempo real, sem gravar nada. Só quando
 * a pessoa usa o botão do tema é que a escolha é gravada e passa a mandar. O CSS
 * trata do tema por omissão com prefers-color-scheme, por isso não há clarão nem
 * dependência de JavaScript. O atributo data-tema só existe após uma escolha explícita.
 *
 * O estado é um pequeno armazém externo, partilhado entre o cabeçalho e o painel.
 * No servidor e na primeira renderização usam-se sempre os valores por omissão,
 * para a hidratação coincidir com o HTML gerado.
 */
import { useSyncExternalStore } from "react";

export type Tema = "claro" | "escuro";
export type Unidade = "mbps" | "mbs";

/** Tema efetivo (o que está a ser mostrado) e se foi escolhido pela pessoa. */
export type Preferencias = { tema: Tema; temaEscolhido: boolean; unidade: Unidade };

const CHAVE_TEMA = "tema";
const CHAVE_UNIDADE = "unidade";
const COR_BARRA: Record<Tema, string> = { claro: "#f4f5f8", escuro: "#0d1017" };

const OMISSAO: Preferencias = { tema: "claro", temaEscolhido: false, unidade: "mbps" };

let estado: Preferencias = OMISSAO;
let carregado = false;
const ouvintes = new Set<() => void>();

function lerArmazenado(chave: string): string | null {
  try {
    return window.localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: string): void {
  try {
    window.localStorage.setItem(chave, valor);
  } catch {
    /* armazenamento indisponível: a preferência vale apenas para esta visita */
  }
}

function consultaEscuro(): MediaQueryList | null {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
}

function corDaBarra(tema: Tema): void {
  if (typeof document === "undefined") return;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COR_BARRA[tema]);
}

function emitir(): void {
  ouvintes.forEach((o) => o());
}

/** Lê as preferências guardadas e passa a acompanhar o tema do navegador. Chamado uma vez, já no navegador. */
export function carregarPreferencias(): void {
  if (carregado || typeof window === "undefined") return;
  carregado = true;

  const guardadoTema = lerArmazenado(CHAVE_TEMA);
  const escolhido = guardadoTema === "claro" || guardadoTema === "escuro";
  const sistema = consultaEscuro();
  const temaInicial: Tema = escolhido
    ? (guardadoTema as Tema)
    : sistema?.matches
      ? "escuro"
      : "claro";
  if (escolhido) document.documentElement.dataset.tema = temaInicial;
  corDaBarra(temaInicial);

  estado = {
    tema: temaInicial,
    temaEscolhido: escolhido,
    unidade: lerArmazenado(CHAVE_UNIDADE) === "mbs" ? "mbs" : "mbps",
  };

  // Enquanto a pessoa não escolher, acompanha o sistema ao vivo (por exemplo, o modo escuro automático ao fim do dia).
  sistema?.addEventListener("change", (e) => {
    if (estado.temaEscolhido) return;
    const tema: Tema = e.matches ? "escuro" : "claro";
    estado = { ...estado, tema };
    corDaBarra(tema);
    emitir();
  });
  emitir();
}

export function definirTema(tema: Tema): void {
  estado = { ...estado, tema, temaEscolhido: true };
  gravar(CHAVE_TEMA, tema);
  document.documentElement.dataset.tema = tema;
  corDaBarra(tema);
  emitir();
}

export function definirUnidade(unidade: Unidade): void {
  estado = { ...estado, unidade };
  gravar(CHAVE_UNIDADE, unidade);
  emitir();
}

function subscrever(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function usePreferencias(): Preferencias {
  return useSyncExternalStore(
    subscrever,
    () => estado,
    () => OMISSAO,
  );
}

/**
 * Script executado antes da primeira pintura: só aplica uma escolha explícita já
 * guardada. Sem escolha, o CSS segue o navegador sozinho. Texto fixo, sem dados externos.
 */
export const SCRIPT_TEMA_INICIAL = `(function(){try{var t=localStorage.getItem("${CHAVE_TEMA}");if(t==="claro"||t==="escuro"){document.documentElement.dataset.tema=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="escuro"?"${COR_BARRA.escuro}":"${COR_BARRA.claro}")}}catch(e){}})();`;
