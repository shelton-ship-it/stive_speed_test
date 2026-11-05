export type Origem = "ia" | "autocompletar" | "csv";
export type Confianca = "baixa" | "media" | "alta";

export type Candidato = {
  termo: string;
  /** Forma normalizada e sem acentos, usada para juntar duplicados. */
  chave: string;
  conceito: string | null;
  origens: Origem[];
  /** Volume real vindo de uma ferramenta. Nunca é estimado pela IA. */
  volume: number | null;
  /** O que o volume mede: pesquisas mensais ou impressões do Search Console. */
  tipoVolume: "mensal" | "impressoes" | null;
  /** Volume dado como intervalo (limite inferior) e não como número exato. */
  volumeAproximado: boolean;
  /** 0 a 100. */
  dificuldade: number | null;
  /** Em quantas expansões do autocompletar o termo apareceu. */
  ocorrencias: number;
  marca: boolean;
  confianca: Confianca;
  pontuacao: number;
};

export type EntradaMapa = {
  primaria: string | null;
  secundarias: string[];
  longTail: string[];
  /** Confiança da palavra principal: o que a sustenta. */
  evidencia: Confianca | null;
};

export type MapaIdioma = {
  idioma: string;
  mercado: { hl: string; gl: string };
  total: number;
  conceitos: Record<string, EntradaMapa>;
};
