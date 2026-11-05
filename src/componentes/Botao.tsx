import type { ButtonHTMLAttributes, ReactNode } from "react";
import estilos from "./Botao.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "secundario" | "discreto";
  tamanho?: "normal" | "grande";
  icone?: ReactNode;
};

/** Botão único do projeto: três variantes, ícone opcional e foco visível. */
export function Botao({
  variante = "secundario",
  tamanho = "normal",
  icone,
  children,
  className,
  type = "button",
  ...resto
}: Props) {
  const classes = [
    estilos.botao,
    estilos[variante],
    tamanho === "grande" ? estilos.grande : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...resto}>
      {icone ? (
        <span className={estilos.icone} aria-hidden="true">
          {icone}
        </span>
      ) : null}
      {children}
    </button>
  );
}
