import { useEffect } from "react";

declare global {
  interface Window {
    __cabecaCarregada?: boolean;
  }
}

/**
 * Cabeça da marca, no canto do cabeçalho. O comportamento, a cena e os gestos são
 * do script original em /cabeca/cabeca.js, que corre só no navegador. Este
 * componente apenas cria os elementos que o script procura e o carrega uma vez,
 * depois de a página estar pronta, para não competir com o conteúdo.
 *
 * Vive na raiz da aplicação e nunca é desmontado, por isso o script não corre duas vezes.
 * É decorativo: fica fora da árvore de acessibilidade e não recebe cliques.
 */
export function CabecaViva() {
  useEffect(() => {
    if (window.__cabecaCarregada) return;
    // Quem pediu para poupar dados fica sem a cabeça (são cerca de 140 KB comprimidos).
    const ligacao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (ligacao?.saveData) return;

    const carregar = () => {
      if (window.__cabecaCarregada) return;
      window.__cabecaCarregada = true;
      const s = document.createElement("script");
      s.src = "/cabeca/cabeca.js";
      s.async = true;
      document.body.appendChild(s);
    };
    // O Safari não tem requestIdleCallback.
    const temOcioso = "requestIdleCallback" in window;
    const ocioso = temOcioso
      ? window.requestIdleCallback(carregar, { timeout: 1800 })
      : window.setTimeout(carregar, 400);
    return () => {
      if (temOcioso) window.cancelIdleCallback(ocioso);
      else window.clearTimeout(ocioso);
    };
  }, []);

  return (
    <div className="cabeca" aria-hidden="true">
      <div className="cabecaCena" />
      <div className="cabecaCorpo" />
      <span id="cabecaOlhoE" />
      <span id="cabecaOlhoD" />
    </div>
  );
}
