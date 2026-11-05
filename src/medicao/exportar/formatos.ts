/**
 * Exportação em JSON e CSV e resumo em texto.
 * Todos os campos mantêm a unidade e o estado da medição.
 */
import type { Metrica, Sessao } from "../motor/tipos";

export function exportarJson(sessao: Sessao): string {
  return JSON.stringify(sessao, null, 2);
}

export function exportarCopiaSeguranca(sessoes: Sessao[]): string {
  return JSON.stringify(
    {
      tipo: "copiaSeguranca",
      versaoEsquema: sessoes[0]?.versaoEsquema ?? 1,
      exportadaEm: new Date().toISOString(),
      sessoes,
    },
    null,
    2,
  );
}

export function lerCopiaSeguranca(json: string): unknown[] | null {
  try {
    const dados = JSON.parse(json);
    if (Array.isArray(dados)) return dados;
    if (dados && Array.isArray(dados.sessoes)) return dados.sessoes;
    return null;
  } catch {
    return null;
  }
}

function valorCsv(m: Metrica): string {
  return m.estado === "medida" && m.valor !== null ? String(m.valor) : m.estado;
}

export function exportarCsv(sessao: Sessao): string {
  const linhas: string[] = ["secao,chave,valor,unidade,estado,origem"];
  for (const [chave, m] of Object.entries(sessao.metricas)) {
    linhas.push(`metrica,${chave},${valorCsv(m)},${m.unidade},${m.estado},${m.origem}`);
  }
  for (const [chave, m] of Object.entries(sessao.derivadas)) {
    linhas.push(`derivada,${chave},${valorCsv(m)},${m.unidade},${m.estado},${m.origem}`);
  }
  for (const [chave, p] of Object.entries(sessao.pontuacoes)) {
    if (p) linhas.push(`pontuacao,${chave},${p.pontos},pontos,medida,motor ${p.nomeClasse}`);
  }
  linhas.push(`meta,iniciadaEm,${sessao.iniciadaEm},ISO,,produto`);
  linhas.push(`meta,terminadaEm,${sessao.terminadaEm ?? ""},ISO,,produto`);
  linhas.push(`meta,duracaoMs,${sessao.duracaoMs ?? ""},ms,,motor`);
  linhas.push(`meta,bytesTransferidos,${sessao.bytesTransferidos ?? ""},bytes,derivada,produto`);
  linhas.push(`meta,perfil,${sessao.motor.perfilId},id,,produto`);
  linhas.push(`meta,motor,${sessao.motor.nome} ${sessao.motor.versao},,,produto`);
  for (const [tipo, pontos] of Object.entries(sessao.amostras)) {
    const unidade = tipo.endsWith("Mbps") ? "Mbps" : "ms";
    for (const p of pontos) linhas.push(`amostra,${tipo},${p.valor},${unidade},medida,motor`);
  }
  return linhas.join("\n") + "\n";
}

export function resumoEmTexto(
  sessao: Sessao,
  t: (chave: string) => string,
  formatarData: (iso: string | null) => string,
): string {
  const linha = (rotulo: string, m: Metrica, unidade: string) =>
    `${t(rotulo)}: ${m.estado === "medida" ? `${m.valor} ${unidade}` : m.estado}`;
  const m = sessao.metricas;
  return [
    t("partilha.titulo"),
    linha("metrica.descida", m.descidaMbps, "Mbps"),
    linha("metrica.subida", m.subidaMbps, "Mbps"),
    linha("metrica.latenciaRepouso", m.latenciaRepousoMs, "ms"),
    linha("metrica.jitterRepouso", m.jitterRepousoMs, "ms"),
    linha("metrica.aumentoLatenciaDescida", sessao.derivadas.aumentoLatenciaDescidaMs, "ms"),
    `${t("tabela.data")}: ${formatarData(sessao.iniciadaEm)}`,
    `${t("partilha.perfil")}: ${sessao.motor.perfilId} v${sessao.motor.perfilVersao}`,
    t("partilha.aviso"),
  ].join("\n");
}

export function descarregar(nomeFicheiro: string, conteudo: string, tipoMime: string): void {
  const blob = new Blob([conteudo], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeFicheiro;
  a.click();
  URL.revokeObjectURL(url);
}

/** Carimbo compacto para nomes de ficheiro, sem separadores problemáticos. */
export function carimboParaFicheiro(iso: string): string {
  return iso.slice(0, 19).replace(/[-:T]/g, "");
}
