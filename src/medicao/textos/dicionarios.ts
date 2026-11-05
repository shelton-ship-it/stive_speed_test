/**
 * Carregamento dos dicionários. Português e inglês são escritos à mão e vão no
 * pacote. Os restantes são ficheiros JSON gerados, carregados só quando o idioma
 * é usado. Um idioma passa a existir no site no momento em que o seu ficheiro
 * gerado existe, sem alterar código.
 */
import { en } from "./en";
import manifesto from "./gerado/_ativos.json";
import { pt } from "./pt";
import type { Dicionario } from "./i18n";
import { LOCAIS, obterLocal, SLUG_RESERVA, SLUG_ORIGEM, type Local } from "./locais";

const modulos = import.meta.glob<Record<string, string>>(["./gerado/*.json", "!./gerado/_*.json"], {
  import: "default",
});

const slugsGerados = new Set(
  Object.keys(modulos).map((caminho) => caminho.replace("./gerado/", "").replace(".json", "")),
);

export type Manifesto = { limiar: number; cobertura: Record<string, number> };

/**
 * Um idioma gerado só é publicado se o ficheiro existir e a cobertura validada
 * atingir o limiar. Um ficheiro vazio ou quase vazio nunca publica uma página
 * que seria quase toda inglês.
 */
export function idiomaPublicado(slug: string, gerados: ReadonlySet<string>, m: Manifesto): boolean {
  if (slug === SLUG_ORIGEM || slug === SLUG_RESERVA) return true;
  return gerados.has(slug) && (m.cobertura[slug] ?? 0) >= m.limiar;
}

/** Idiomas publicados: os dois escritos à mão mais os gerados com cobertura suficiente. */
export function localesAtivos(): Local[] {
  return LOCAIS.filter((l) => idiomaPublicado(l.slug, slugsGerados, manifesto));
}

export function localAtivo(slug: string | undefined): Local | undefined {
  const l = slug ? obterLocal(slug) : undefined;
  return l && localesAtivos().includes(l) ? l : undefined;
}

/**
 * Junta o dicionário gerado por cima do inglês, chave a chave. Uma chave em falta
 * ou inválida mostra o inglês em vez de aparecer vazia ou partir a página.
 */
export function mesclar(base: Dicionario, parcial: Record<string, unknown>): Dicionario {
  const resultado = { ...base };
  for (const chave of Object.keys(base) as Array<keyof Dicionario>) {
    const valor = parcial[chave];
    if (typeof valor === "string" && valor.trim().length > 0) resultado[chave] = valor;
  }
  return resultado;
}

export async function carregarDicionario(slug: string): Promise<Dicionario> {
  if (slug === SLUG_ORIGEM) return pt;
  if (slug === SLUG_RESERVA) return en;
  const carregar = modulos[`./gerado/${slug}.json`];
  if (!carregar) return en;
  return mesclar(en, await carregar());
}

/** Dicionário síncrono para páginas de erro, que não podem esperar por um carregamento. */
export function dicionarioDeReserva(slug: string): Dicionario {
  return slug === SLUG_ORIGEM ? pt : en;
}
