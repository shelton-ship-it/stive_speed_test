/**
 * Deteção de dispositivo e navegação por teclado direcional (comando de TV).
 * A deteção é uma melhor tentativa: há televisões que se identificam como
 * computadores. Por isso o modo TV também liga quando o ecrã é grande e não há rato nem toque.
 */

const NAVEGADORES_DE_TV =
  /(smart.?tv|tizen|web0s|webos|hbbtv|apple.?tv|google.?tv|android.?tv|\baft[a-z]{1,4}\b|crkey|bravia|netcast|viera|roku|playstation|xbox|nintendo)/i;

export type Sinais = {
  userAgent: string;
  larguraEcra: number;
  ponteiroGrosso: boolean;
  semHover: boolean;
  pontosDeToque: number;
};

export function ehTv(s: Sinais): boolean {
  if (NAVEGADORES_DE_TV.test(s.userAgent)) return true;
  // Ecrã grande, sem rato (sem hover) e sem toque: quase sempre uma televisão com comando.
  return s.larguraEcra >= 1280 && s.semHover && s.pontosDeToque === 0;
}

type Direcao = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";
type Caixa = { el: HTMLElement; x: number; y: number };

const FOCAVEIS =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),summary,textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function centros(): Caixa[] {
  return [...document.querySelectorAll<HTMLElement>(FOCAVEIS)]
    .filter((el) => el.offsetParent !== null || getComputedStyle(el).position === "fixed")
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        ok: r.width > 0 && r.height > 0,
      };
    })
    .filter((c) => (c as Caixa & { ok: boolean }).ok);
}

/** Escolhe o elemento mais próximo na direção pedida, penalizando o desvio lateral. */
export function proximoNaDirecao(atual: Caixa, candidatos: Caixa[], d: Direcao): Caixa | null {
  let melhor: Caixa | null = null;
  let pontos = Infinity;
  for (const c of candidatos) {
    if (c.el === atual.el) continue;
    const dx = c.x - atual.x;
    const dy = c.y - atual.y;
    const frente = d === "ArrowRight" ? dx : d === "ArrowLeft" ? -dx : d === "ArrowDown" ? dy : -dy;
    if (frente <= 4) continue;
    const lado = d === "ArrowLeft" || d === "ArrowRight" ? Math.abs(dy) : Math.abs(dx);
    const p = frente + lado * 2.2;
    if (p < pontos) {
      pontos = p;
      melhor = c;
    }
  }
  return melhor;
}

/** Liga a navegação por setas. Devolve a função que a desliga. */
export function ligarNavegacaoPorSetas(): () => void {
  const aoPremir = (e: KeyboardEvent) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const ativo = document.activeElement as HTMLElement | null;
    // Campos de texto e listas usam as setas para si.
    if (
      ativo &&
      /^(INPUT|SELECT|TEXTAREA)$/.test(ativo.tagName) &&
      (ativo as HTMLInputElement).type !== "radio"
    )
      return;
    const todos = centros();
    const atual = todos.find((c) => c.el === ativo) ?? null;
    if (!atual) {
      todos[0]?.el.focus();
      e.preventDefault();
      return;
    }
    const alvo = proximoNaDirecao(atual, todos, e.key as Direcao);
    if (alvo) {
      alvo.el.focus({ preventScroll: false });
      alvo.el.scrollIntoView({ block: "nearest", inline: "nearest" });
      e.preventDefault();
    }
  };
  document.addEventListener("keydown", aoPremir);
  return () => document.removeEventListener("keydown", aoPremir);
}
