/** Fusão de candidatos, seleção das palavras chave por conceito e relatório. */
import type { Local } from "../../src/medicao/textos/locais.ts";
import { CONCEITOS, obterConceito } from "./conceitos.ts";
import { lacunas } from "./mapa.ts";
import type { Mercado } from "./mercados.ts";
import { MERCADOS } from "./mercados.ts";
import {
  chaveDeTermo,
  contarPalavras,
  contemMarca,
  normalizarTermo,
  semelhanca,
} from "./normalizar.ts";
import { pontuar } from "./pontuar.ts";
import type { Candidato, EntradaMapa, MapaIdioma, Origem } from "./tipos.ts";

export type Novo = {
  termo: string;
  origem: Origem;
  conceito?: string | null;
  volume?: number | null;
  tipoVolume?: "mensal" | "impressoes" | null;
  volumeAproximado?: boolean;
  dificuldade?: number | null;
  ocorrencias?: number;
};

const vazio = (termo: string, chave: string): Candidato => ({
  termo,
  chave,
  conceito: null,
  origens: [],
  volume: null,
  tipoVolume: null,
  volumeAproximado: false,
  dificuldade: null,
  ocorrencias: 0,
  marca: false,
  confianca: "baixa",
  pontuacao: 0,
});

/** Junta novos termos aos existentes, por chave normalizada. Nada se perde nem se inventa. */
export function fundir(existentes: Candidato[], novos: Novo[], etiqueta: string): Candidato[] {
  const mapa = new Map(existentes.map((c) => [c.chave, { ...c, origens: [...c.origens] }]));
  for (const n of novos) {
    const termo = normalizarTermo(n.termo, etiqueta);
    if (!termo) continue;
    const chave = chaveDeTermo(termo, etiqueta);
    const c = mapa.get(chave) ?? vazio(termo, chave);
    if (!c.origens.includes(n.origem)) c.origens.push(n.origem);
    if (c.conceito === null && n.conceito) c.conceito = n.conceito;
    if (
      n.volume != null &&
      (c.volume === null ||
        (n.tipoVolume === "mensal" && c.tipoVolume !== "mensal") ||
        n.volume > c.volume)
    ) {
      c.volume = n.volume;
      c.tipoVolume = n.tipoVolume ?? c.tipoVolume;
      c.volumeAproximado = n.volumeAproximado ?? false;
    }
    if (n.dificuldade != null) c.dificuldade = n.dificuldade;
    if (n.ocorrencias) c.ocorrencias = Math.max(c.ocorrencias, n.ocorrencias);
    mapa.set(chave, c);
  }
  return [...mapa.values()];
}

/** Recalcula marca, confiança e pontuação, e ordena de forma estável. */
export function recalcular(candidatos: Candidato[], marcas: readonly string[]): Candidato[] {
  return candidatos
    .map((c) => {
      const marca = contemMarca(c.termo, marcas);
      const p = pontuar({ ...c, marca });
      return { ...c, marca, ...p };
    })
    .sort((a, b) => b.pontuacao - a.pontuacao || a.chave.localeCompare(b.chave));
}

const LIMITE_SEMELHANCA = 0.8;

function escolherDistintos(
  base: Candidato[],
  ja: Candidato[],
  max: number,
  filtro: (c: Candidato) => boolean,
): Candidato[] {
  const escolhidos: Candidato[] = [];
  for (const c of base) {
    if (escolhidos.length >= max) break;
    if (!filtro(c)) continue;
    if ([...ja, ...escolhidos].some((x) => semelhanca(x.chave, c.chave) >= LIMITE_SEMELHANCA))
      continue;
    escolhidos.push(c);
  }
  return escolhidos;
}

export function construirMapa(local: Local, candidatos: Candidato[]): MapaIdioma {
  const mercado: Mercado = MERCADOS[local.slug];
  const palavras = (c: Candidato) => contarPalavras(c.termo, local.intl);
  const conceitos: Record<string, EntradaMapa> = {};
  for (const conceito of CONCEITOS) {
    const doConceito = candidatos.filter((c) => c.conceito === conceito.id && !c.marca);
    const [primaria] = escolherDistintos(
      doConceito,
      [],
      1,
      (c) => palavras(c) >= 2 && palavras(c) <= 5,
    );
    const secundarias = primaria
      ? escolherDistintos(doConceito, [primaria], 4, (c) => palavras(c) <= 6)
      : [];
    const longTail = primaria
      ? escolherDistintos(
          doConceito,
          [primaria, ...secundarias],
          12,
          (c) => palavras(c) >= 4 && palavras(c) <= 10,
        )
      : [];
    conceitos[conceito.id] = {
      primaria: primaria?.termo ?? null,
      secundarias: secundarias.map((c) => c.termo),
      longTail: longTail.map((c) => c.termo),
      evidencia: primaria?.confianca ?? null,
    };
  }
  return {
    idioma: local.slug,
    mercado: { hl: mercado.hl, gl: mercado.gl },
    total: candidatos.length,
    conceitos,
  };
}

/** Relatório em Markdown, determinístico (sem datas) para diffs limpos nos pull requests. */
export function relatorioMarkdown(mapas: MapaIdioma[]): string {
  const f: string[] = ["# Relatório de palavras chave", ""];
  const nConceitos = CONCEITOS.length;
  const gaps = lacunas();

  f.push("## Lacunas de conteúdo", "");
  f.push(
    "Conceitos de pesquisa que o site ainda não responde com nenhum texto. É aqui que há procura sem resposta no site.",
    "",
  );
  f.push(
    "| Conceito | Prioridade | Intenção | Idiomas com procura confirmada |",
    "| --- | --- | --- | --- |",
  );
  for (const id of gaps) {
    const c = obterConceito(id)!;
    const confirmados = mapas.filter((m) => {
      const e = m.conceitos[id]?.evidencia;
      return e === "media" || e === "alta";
    }).length;
    f.push(`| ${id} | ${c.prioridade} | ${c.intencao} | ${confirmados} de ${mapas.length} |`);
  }

  f.push("", "## Cobertura por idioma", "");
  f.push(
    "| Idioma | Mercado | Candidatos | Conceitos com termo | Com evidência média ou alta | Nota |",
    "| --- | --- | --- | --- | --- | --- |",
  );
  for (const m of [...mapas].sort((a, b) => a.idioma.localeCompare(b.idioma))) {
    const entradas = Object.values(m.conceitos);
    const com = entradas.filter((e) => e.primaria).length;
    const forte = entradas.filter((e) => e.evidencia === "media" || e.evidencia === "alta").length;
    const motor = MERCADOS[m.idioma]?.motorLocal;
    f.push(
      `| ${m.idioma} | ${m.mercado.gl} | ${m.total} | ${com} de ${nConceitos} | ${forte} de ${nConceitos} | ${motor ? `Motor local dominante: ${motor}. Complete com os dados dele.` : ""} |`,
    );
  }

  f.push("", "## Como ler este relatório", "");
  f.push("- Evidência alta: o termo tem volume vindo de uma ferramenta real (CSV importado).");
  f.push(
    "- Evidência média: o termo aparece nas sugestões do motor de pesquisa. Prova que se pesquisa, não diz quanto.",
  );
  f.push(
    "- Evidência baixa: o termo foi proposto pela IA e ainda não foi confirmado. É uma hipótese.",
  );
  f.push(
    "- Nenhum volume é estimado pela IA. Sem exportações reais, a evidência não passa de média.",
  );
  f.push("");
  return f.join("\n");
}
