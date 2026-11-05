/**
 * Importação de exportações de ferramentas reais de palavras chave: Google Keyword
 * Planner, Search Console, Semrush, Ahrefs e semelhantes. É a fonte de volume e
 * dificuldade verdadeiros. Aceita vírgula, ponto e vírgula ou tabulação, aspas,
 * UTF 8 e UTF 16 (o Keyword Planner exporta em UTF 16), e cabeçalhos em vários idiomas.
 */
import { chaveDeTermo } from "../normalizar.ts";

export type LinhaCsv = {
  termo: string;
  volume: number | null;
  tipoVolume: "mensal" | "impressoes" | null;
  volumeAproximado: boolean;
  dificuldade: number | null;
};

export function decodificar(dados: Uint8Array): string {
  if (dados.length >= 2 && dados[0] === 0xff && dados[1] === 0xfe)
    return new TextDecoder("utf-16le").decode(dados).replace(/^\ufeff/, "");
  if (dados.length >= 2 && dados[0] === 0xfe && dados[1] === 0xff)
    return new TextDecoder("utf-16be").decode(dados).replace(/^\ufeff/, "");
  return new TextDecoder("utf-8").decode(dados).replace(/^\ufeff/, "");
}

function detetarSeparador(texto: string): string {
  const amostra = texto.split(/\r?\n/).slice(0, 8).join("\n");
  const contagem = (c: string) =>
    (amostra.match(new RegExp(c === "\t" ? "\\t" : `\\${c}`, "g")) ?? []).length;
  const candidatos = [",", ";", "\t"]
    .map((c) => [c, contagem(c)] as const)
    .sort((a, b) => b[1] - a[1]);
  return candidatos[0][1] > 0 ? candidatos[0][0] : ",";
}

/** Leitor de CSV com aspas e quebras de linha dentro de campos. */
export function lerLinhas(texto: string): string[][] {
  const sep = detetarSeparador(texto);
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo);
      campo = "";
      if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  linha.push(campo);
  if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
  return linhas;
}

const base = (s: string) => chaveDeTermo(s).replace(/[^\p{L}\p{N}]/gu, "");

const COLUNA_TERMO = [
  "keyword",
  "keywords",
  "query",
  "queries",
  "topqueries",
  "searchterm",
  "searchquery",
  "consulta",
  "consultas",
  "consultasprincipais",
  "termo",
  "palavrachave",
  "palavraschave",
  "palabraclave",
  "motclé",
  "motcle",
  "suchbegriff",
  "parolachiave",
];
const COLUNA_MENSAL = [
  "volume",
  "searchvolume",
  "avgmonthlysearches",
  "monthlysearches",
  "mediademensalpesquisas",
  "mediademensualbusquedas",
  "pesquisasmensais",
  "buscasmensuales",
];
const COLUNA_IMPRESSOES = ["impressions", "impressoes", "impresiones", "impressionen"];
const COLUNA_DIFICULDADE = [
  "kd",
  "keyworddifficulty",
  "difficulty",
  "dificuldade",
  "dificultad",
  "competition",
  "concorrencia",
  "competencia",
];

/** Interpreta números como 1200, "1,200", "1.200", "1 200", "1,5K" e intervalos de volume. */
export function lerVolume(bruto: string): { valor: number | null; aproximado: boolean } {
  const t = bruto.trim().toLowerCase();
  if (!t) return { valor: null, aproximado: false };
  const intervalo = t.split(/\s*[\u2013\u2014-]\s*/u);
  const partes = intervalo.length > 1;
  const unico = (s: string): number | null => {
    const m = /^([\d.,\s]+)\s*([km])?$/u.exec(s.trim());
    if (!m) return null;
    let n = m[1].replace(/\s/gu, "");
    // Separadores de milhares: 1.200 ou 1,200. Caso contrário, é decimal.
    if (/^\d{1,3}([.,]\d{3})+$/u.test(n)) n = n.replace(/[.,]/gu, "");
    else n = n.replace(",", ".");
    const v = Number.parseFloat(n);
    if (!Number.isFinite(v)) return null;
    return Math.round(v * (m[2] === "k" ? 1_000 : m[2] === "m" ? 1_000_000 : 1));
  };
  const valor = unico(intervalo[0]);
  return { valor, aproximado: partes && valor !== null };
}

function lerDificuldade(bruto: string): number | null {
  const t = base(bruto);
  if (!t) return null;
  if (["low", "baixa", "baja", "faible", "niedrig"].includes(t)) return 25;
  if (["medium", "media", "medio", "moyenne", "mittel"].includes(t)) return 50;
  if (["high", "alta", "haute", "hoch"].includes(t)) return 75;
  const n = Number.parseFloat(bruto.replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}

export function lerCsv(texto: string): LinhaCsv[] {
  const linhas = lerLinhas(texto);
  // O Keyword Planner antepõe linhas de título: o cabeçalho é a primeira linha com uma coluna de termo.
  const iCab = linhas.findIndex((l) => l.some((c) => COLUNA_TERMO.includes(base(c))));
  if (iCab < 0) return [];
  const cab = linhas[iCab].map(base);
  const col = (nomes: string[]) => cab.findIndex((c) => nomes.includes(c));
  const iTermo = col(COLUNA_TERMO);
  const iMensal = col(COLUNA_MENSAL);
  const iImpr = col(COLUNA_IMPRESSOES);
  const iDif = col(COLUNA_DIFICULDADE);

  const saida: LinhaCsv[] = [];
  for (const l of linhas.slice(iCab + 1)) {
    const termo = (l[iTermo] ?? "").trim();
    if (!termo || termo.length > 120) continue;
    const bruto = iMensal >= 0 ? l[iMensal] : iImpr >= 0 ? l[iImpr] : "";
    const { valor, aproximado } = lerVolume(bruto ?? "");
    saida.push({
      termo,
      volume: valor,
      tipoVolume: valor === null ? null : iMensal >= 0 ? "mensal" : "impressoes",
      volumeAproximado: aproximado,
      dificuldade: iDif >= 0 ? lerDificuldade(l[iDif] ?? "") : null,
    });
  }
  return saida;
}
