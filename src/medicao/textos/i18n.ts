/** Tradução por dicionário e formatação por Intl. O idioma é sempre um Local do registo. */
import type { Chave } from "./pt";
import type { Local } from "./locais";

export type { Chave };
export type Dicionario = Record<Chave, string>;

export function traduzir(
  dicionario: Dicionario,
  chave: Chave,
  params?: Record<string, string | number>,
): string {
  let texto: string = dicionario[chave] ?? chave;
  if (params) {
    for (const [k, v] of Object.entries(params)) texto = texto.replaceAll(`{${k}}`, String(v));
  }
  return texto;
}

export function formatarNumero(local: Local, valor: number | null, casas = 1): string {
  if (valor === null || !Number.isFinite(valor)) return "";
  return new Intl.NumberFormat(local.intl, {
    maximumFractionDigits: casas,
    minimumFractionDigits: 0,
  }).format(valor);
}

export function formatarBytes(local: Local, bytes: number | null): string {
  if (bytes === null) return "";
  const unidades = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let u = 0;
  while (v >= 1000 && u < unidades.length - 1) {
    v /= 1000;
    u++;
  }
  return `${formatarNumero(local, v, v >= 100 ? 0 : 1)} ${unidades[u]}`;
}

export function formatarData(local: Local, iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(local.intl, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}
