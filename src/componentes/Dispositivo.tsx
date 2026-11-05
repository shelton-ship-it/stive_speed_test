import { useEffect } from "react";
import { ehTv, ligarNavegacaoPorSetas } from "./dispositivo";

/**
 * Marca o elemento raiz com data-dispositivo="tv" quando deteta uma televisão, o que
 * ativa o aumento de escala e o anel de foco grosso no CSS, e liga a navegação por setas.
 */
export function Dispositivo() {
  useEffect(() => {
    const tv = ehTv({
      userAgent: navigator.userAgent,
      larguraEcra: window.screen.width,
      ponteiroGrosso: window.matchMedia("(pointer: coarse)").matches,
      semHover: window.matchMedia("(hover: none)").matches,
      pontosDeToque: navigator.maxTouchPoints ?? 0,
    });
    if (!tv) return;
    document.documentElement.dataset.dispositivo = "tv";
    const desligar = ligarNavegacaoPorSetas();
    return () => {
      delete document.documentElement.dataset.dispositivo;
      desligar();
    };
  }, []);
  return null;
}
