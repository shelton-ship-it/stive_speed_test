/**
 * Registo dos idiomas suportados. É a única fonte de verdade para o URL, o
 * atributo lang, a direção do texto, a formatação e as instruções de tradução.
 *
 * Este ficheiro usa só sintaxe TypeScript apagável, para o Node o poder carregar
 * diretamente nos scripts de tradução (sem passar pelo Vite).
 *
 * Os slugs de URL não têm hífen (ptbr, es419, zhhant). Os códigos BCP 47
 * (pt-BR, es-419, zh-Hant) existem só nos atributos lang e hreflang, onde a
 * norma os exige.
 */

export type GrupoEscrita =
  | "latino"
  | "cirilico"
  | "grego"
  | "arabe"
  | "hebraico"
  | "hanSimplificado"
  | "hanTradicional"
  | "japones"
  | "coreano"
  | "devanagari"
  | "bengali"
  | "tamil"
  | "telugu"
  | "tailandes";

export type Local = {
  /** Identificador usado no URL. Nunca contém hífen. */
  slug: string;
  /** Código BCP 47 para lang e hreflang. */
  codigo: string;
  /** Nome do idioma escrito no próprio idioma. */
  nome: string;
  /** Nome em inglês, usado nas instruções de tradução. */
  nomeIngles: string;
  dir: "ltr" | "rtl";
  /** Etiqueta para Intl.NumberFormat e Intl.DateTimeFormat. */
  intl: string;
  /** Valor de og:locale. */
  og: string;
  escrita: GrupoEscrita;
  /** Instrução extra para o tradutor, quando há variante ou escolha de escrita. */
  nota?: string;
  /** Idiomas em que o hífen faz parte da gramática comum podem relaxar a regra. */
  permitirHifen?: boolean;
};

const L = (l: Local): Local => l;

export const LOCAIS: readonly Local[] = [
  L({
    slug: "pt",
    codigo: "pt",
    nome: "Português",
    nomeIngles: "Portuguese",
    dir: "ltr",
    intl: "pt-PT",
    og: "pt_PT",
    escrita: "latino",
  }),
  L({
    slug: "en",
    codigo: "en",
    nome: "English",
    nomeIngles: "English",
    dir: "ltr",
    intl: "en-GB",
    og: "en_GB",
    escrita: "latino",
  }),
  L({
    slug: "es",
    codigo: "es",
    nome: "Español",
    nomeIngles: "Spanish",
    dir: "ltr",
    intl: "es-ES",
    og: "es_ES",
    escrita: "latino",
    nota: "Use Spanish as spoken in Spain, formal register (usted).",
  }),
  L({
    slug: "fr",
    codigo: "fr",
    nome: "Français",
    nomeIngles: "French",
    dir: "ltr",
    intl: "fr-FR",
    og: "fr_FR",
    escrita: "latino",
    nota: "Formal register (vous). French uses many hyphens in grammar, so rephrase to avoid them.",
  }),
  L({
    slug: "de",
    codigo: "de",
    nome: "Deutsch",
    nomeIngles: "German",
    dir: "ltr",
    intl: "de-DE",
    og: "de_DE",
    escrita: "latino",
    nota: "Formal register (Sie). Avoid hyphenated compounds.",
  }),
  L({
    slug: "it",
    codigo: "it",
    nome: "Italiano",
    nomeIngles: "Italian",
    dir: "ltr",
    intl: "it-IT",
    og: "it_IT",
    escrita: "latino",
    nota: "Formal register (Lei).",
  }),
  L({
    slug: "ar",
    codigo: "ar",
    nome: "العربية",
    nomeIngles: "Arabic",
    dir: "rtl",
    intl: "ar",
    og: "ar_AR",
    escrita: "arabe",
    nota: "Modern Standard Arabic. Keep Western digits inside placeholders unchanged.",
  }),
  L({
    slug: "zh",
    codigo: "zh-Hans",
    nome: "简体中文",
    nomeIngles: "Chinese (Simplified)",
    dir: "ltr",
    intl: "zh-CN",
    og: "zh_CN",
    escrita: "hanSimplificado",
    nota: "Simplified Chinese as used in mainland China.",
  }),
  L({
    slug: "ptbr",
    codigo: "pt-BR",
    nome: "Português (Brasil)",
    nomeIngles: "Brazilian Portuguese",
    dir: "ltr",
    intl: "pt-BR",
    og: "pt_BR",
    escrita: "latino",
    nota: "Brazilian vocabulary and spelling (você, arquivo, celular, tela). Not European Portuguese.",
  }),
  L({
    slug: "es419",
    codigo: "es-419",
    nome: "Español (Latinoamérica)",
    nomeIngles: "Latin American Spanish",
    dir: "ltr",
    intl: "es-419",
    og: "es_LA",
    escrita: "latino",
    nota: "Neutral Latin American Spanish (computadora, celular, ustedes). Not Spain Spanish.",
  }),
  L({
    slug: "zhhant",
    codigo: "zh-Hant",
    nome: "繁體中文",
    nomeIngles: "Chinese (Traditional)",
    dir: "ltr",
    intl: "zh-TW",
    og: "zh_TW",
    escrita: "hanTradicional",
    nota: "Traditional Chinese as used in Taiwan.",
  }),
  L({
    slug: "ru",
    codigo: "ru",
    nome: "Русский",
    nomeIngles: "Russian",
    dir: "ltr",
    intl: "ru-RU",
    og: "ru_RU",
    escrita: "cirilico",
    nota: "Formal register (вы).",
  }),
  L({
    slug: "ja",
    codigo: "ja",
    nome: "日本語",
    nomeIngles: "Japanese",
    dir: "ltr",
    intl: "ja-JP",
    og: "ja_JP",
    escrita: "japones",
    nota: "Polite register (desu/masu).",
  }),
  L({
    slug: "ko",
    codigo: "ko",
    nome: "한국어",
    nomeIngles: "Korean",
    dir: "ltr",
    intl: "ko-KR",
    og: "ko_KR",
    escrita: "coreano",
    nota: "Polite register (haeyo/hapsyo).",
  }),
  L({
    slug: "hi",
    codigo: "hi",
    nome: "हिन्दी",
    nomeIngles: "Hindi",
    dir: "ltr",
    intl: "hi-IN",
    og: "hi_IN",
    escrita: "devanagari",
  }),
  L({
    slug: "tr",
    codigo: "tr",
    nome: "Türkçe",
    nomeIngles: "Turkish",
    dir: "ltr",
    intl: "tr-TR",
    og: "tr_TR",
    escrita: "latino",
    nota: "Formal register (siz).",
  }),
  L({
    slug: "id",
    codigo: "id",
    nome: "Bahasa Indonesia",
    nomeIngles: "Indonesian",
    dir: "ltr",
    intl: "id-ID",
    og: "id_ID",
    escrita: "latino",
    nota: "Avoid reduplication written with a hyphen; rephrase instead.",
  }),
  L({
    slug: "vi",
    codigo: "vi",
    nome: "Tiếng Việt",
    nomeIngles: "Vietnamese",
    dir: "ltr",
    intl: "vi-VN",
    og: "vi_VN",
    escrita: "latino",
  }),
  L({
    slug: "pl",
    codigo: "pl",
    nome: "Polski",
    nomeIngles: "Polish",
    dir: "ltr",
    intl: "pl-PL",
    og: "pl_PL",
    escrita: "latino",
    nota: "Formal register (Pan/Pani, neutral phrasing).",
  }),
  L({
    slug: "nl",
    codigo: "nl",
    nome: "Nederlands",
    nomeIngles: "Dutch",
    dir: "ltr",
    intl: "nl-NL",
    og: "nl_NL",
    escrita: "latino",
    nota: "Formal register (u). Avoid hyphenated compounds.",
  }),
  L({
    slug: "th",
    codigo: "th",
    nome: "ไทย",
    nomeIngles: "Thai",
    dir: "ltr",
    intl: "th-TH",
    og: "th_TH",
    escrita: "tailandes",
    nota: "Polite register.",
  }),
  L({
    slug: "uk",
    codigo: "uk",
    nome: "Українська",
    nomeIngles: "Ukrainian",
    dir: "ltr",
    intl: "uk-UA",
    og: "uk_UA",
    escrita: "cirilico",
    nota: "Formal register (ви).",
  }),
  L({
    slug: "he",
    codigo: "he",
    nome: "עברית",
    nomeIngles: "Hebrew",
    dir: "rtl",
    intl: "he-IL",
    og: "he_IL",
    escrita: "hebraico",
    nota: "Use gender neutral phrasing where possible.",
  }),
  L({
    slug: "fa",
    codigo: "fa",
    nome: "فارسی",
    nomeIngles: "Persian (Farsi)",
    dir: "rtl",
    intl: "fa-IR",
    og: "fa_IR",
    escrita: "arabe",
    nota: "Persian as used in Iran, formal register.",
  }),
  L({
    slug: "ur",
    codigo: "ur",
    nome: "اردو",
    nomeIngles: "Urdu",
    dir: "rtl",
    intl: "ur-PK",
    og: "ur_PK",
    escrita: "arabe",
    nota: "Urdu as used in Pakistan, formal register.",
  }),
  L({
    slug: "bn",
    codigo: "bn",
    nome: "বাংলা",
    nomeIngles: "Bengali",
    dir: "ltr",
    intl: "bn-BD",
    og: "bn_IN",
    escrita: "bengali",
  }),
  L({
    slug: "sw",
    codigo: "sw",
    nome: "Kiswahili",
    nomeIngles: "Swahili",
    dir: "ltr",
    intl: "sw-KE",
    og: "sw_KE",
    escrita: "latino",
  }),
  L({
    slug: "ms",
    codigo: "ms",
    nome: "Bahasa Melayu",
    nomeIngles: "Malay",
    dir: "ltr",
    intl: "ms-MY",
    og: "ms_MY",
    escrita: "latino",
    nota: "Malay as used in Malaysia. Avoid reduplication written with a hyphen.",
  }),
  L({
    slug: "tl",
    codigo: "tl",
    nome: "Tagalog",
    nomeIngles: "Filipino (Tagalog)",
    dir: "ltr",
    intl: "fil-PH",
    og: "tl_PH",
    escrita: "latino",
    nota: "Filipino. Avoid hyphenated affixes by choosing alternative wording when natural.",
  }),
  L({
    slug: "ro",
    codigo: "ro",
    nome: "Română",
    nomeIngles: "Romanian",
    dir: "ltr",
    intl: "ro-RO",
    og: "ro_RO",
    escrita: "latino",
    nota: "Use correct comma below diacritics (ș, ț).",
  }),
  L({
    slug: "el",
    codigo: "el",
    nome: "Ελληνικά",
    nomeIngles: "Greek",
    dir: "ltr",
    intl: "el-GR",
    og: "el_GR",
    escrita: "grego",
    nota: "Modern Greek, monotonic accents.",
  }),
  L({
    slug: "cs",
    codigo: "cs",
    nome: "Čeština",
    nomeIngles: "Czech",
    dir: "ltr",
    intl: "cs-CZ",
    og: "cs_CZ",
    escrita: "latino",
    nota: "Formal register (vy).",
  }),
  L({
    slug: "sk",
    codigo: "sk",
    nome: "Slovenčina",
    nomeIngles: "Slovak",
    dir: "ltr",
    intl: "sk-SK",
    og: "sk_SK",
    escrita: "latino",
    nota: "Formal register (vy).",
  }),
  L({
    slug: "hu",
    codigo: "hu",
    nome: "Magyar",
    nomeIngles: "Hungarian",
    dir: "ltr",
    intl: "hu-HU",
    og: "hu_HU",
    escrita: "latino",
    nota: "Formal register (Ön), neutral phrasing.",
  }),
  L({
    slug: "sv",
    codigo: "sv",
    nome: "Svenska",
    nomeIngles: "Swedish",
    dir: "ltr",
    intl: "sv-SE",
    og: "sv_SE",
    escrita: "latino",
    nota: "Avoid hyphenated compounds.",
  }),
  L({
    slug: "no",
    codigo: "no",
    nome: "Norsk",
    nomeIngles: "Norwegian Bokmål",
    dir: "ltr",
    intl: "nb-NO",
    og: "nb_NO",
    escrita: "latino",
    nota: "Norwegian Bokmål. Avoid hyphenated compounds.",
  }),
  L({
    slug: "da",
    codigo: "da",
    nome: "Dansk",
    nomeIngles: "Danish",
    dir: "ltr",
    intl: "da-DK",
    og: "da_DK",
    escrita: "latino",
    nota: "Avoid hyphenated compounds.",
  }),
  L({
    slug: "fi",
    codigo: "fi",
    nome: "Suomi",
    nomeIngles: "Finnish",
    dir: "ltr",
    intl: "fi-FI",
    og: "fi_FI",
    escrita: "latino",
  }),
  L({
    slug: "bg",
    codigo: "bg",
    nome: "Български",
    nomeIngles: "Bulgarian",
    dir: "ltr",
    intl: "bg-BG",
    og: "bg_BG",
    escrita: "cirilico",
  }),
  L({
    slug: "sr",
    codigo: "sr",
    nome: "Српски",
    nomeIngles: "Serbian",
    dir: "ltr",
    intl: "sr-Cyrl-RS",
    og: "sr_RS",
    escrita: "cirilico",
    nota: "Write in Serbian Cyrillic script only, never Latin.",
  }),
  L({
    slug: "ca",
    codigo: "ca",
    nome: "Català",
    nomeIngles: "Catalan",
    dir: "ltr",
    intl: "ca-ES",
    og: "ca_ES",
    escrita: "latino",
    nota: "Avoid the Catalan middle dot (punt volat) and hyphens; rephrase to avoid them.",
  }),
  L({
    slug: "af",
    codigo: "af",
    nome: "Afrikaans",
    nomeIngles: "Afrikaans",
    dir: "ltr",
    intl: "af-ZA",
    og: "af_ZA",
    escrita: "latino",
  }),
  L({
    slug: "ta",
    codigo: "ta",
    nome: "தமிழ்",
    nomeIngles: "Tamil",
    dir: "ltr",
    intl: "ta-IN",
    og: "ta_IN",
    escrita: "tamil",
  }),
  L({
    slug: "te",
    codigo: "te",
    nome: "తెలుగు",
    nomeIngles: "Telugu",
    dir: "ltr",
    intl: "te-IN",
    og: "te_IN",
    escrita: "telugu",
  }),
];

/** Idioma de origem, escrito à mão. É a referência do que significa cada texto. */
export const SLUG_ORIGEM = "pt";
/** Segundo idioma escrito à mão. Serve de referência extra e de reserva por chave. */
export const SLUG_RESERVA = "en";

export function obterLocal(slug: string): Local | undefined {
  return LOCAIS.find((l) => l.slug === slug);
}

/** Idiomas que dependem de tradução automática (todos menos os dois escritos à mão). */
export const LOCAIS_GERADOS: readonly Local[] = LOCAIS.filter(
  (l) => l.slug !== SLUG_ORIGEM && l.slug !== SLUG_RESERVA,
);

/** Caminho público de um idioma: o idioma de origem vive na raiz. */
export function caminhoDe(l: Local): string {
  return l.slug === SLUG_ORIGEM ? "/" : `/${l.slug}`;
}

/** Caminho da página de políticas de um idioma. */
export function caminhoPoliticas(l: Local): string {
  return l.slug === SLUG_ORIGEM ? "/politicas" : `/${l.slug}/politicas`;
}
