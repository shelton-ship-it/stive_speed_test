import { createContext, useContext } from "react";
import { pt } from "./pt";
import {
  formatarBytes,
  formatarData,
  formatarNumero,
  traduzir,
  type Chave,
  type Dicionario,
} from "./i18n";
import { LOCAIS, type Local } from "./locais";

export type ContextoI18n = {
  local: Local;
  t: (chave: Chave, params?: Record<string, string | number>) => string;
  numero: (valor: number | null, casas?: number) => string;
  bytes: (valor: number | null) => string;
  data: (iso: string | null) => string;
};

export function criarI18n(local: Local, dicionario: Dicionario): ContextoI18n {
  return {
    local,
    t: (chave, params) => traduzir(dicionario, chave, params),
    numero: (valor, casas) => formatarNumero(local, valor, casas),
    bytes: (valor) => formatarBytes(local, valor),
    data: (iso) => formatarData(local, iso),
  };
}

export const ContextoDeTextos = createContext<ContextoI18n>(criarI18n(LOCAIS[0], pt));

export function useI18n(): ContextoI18n {
  return useContext(ContextoDeTextos);
}
