/**
 * Mercado de pesquisa de cada idioma: língua e país da interface do motor de
 * pesquisa. A mesma língua pesquisa de forma diferente em países diferentes
 * (pt em Moçambique, Portugal e Brasil; es em Espanha e na América Latina),
 * por isso a pesquisa de palavras chave é sempre feita por idioma e mercado.
 */

export type Mercado = {
  /** Idioma da interface (parâmetro hl). */
  hl: string;
  /** País do mercado principal (parâmetro gl). */
  gl: string;
  /** Motor local que domina o mercado, quando não é o Google. Os dados do Google subestimam a procura. */
  motorLocal?: string;
};

export const MERCADOS: Readonly<Record<string, Mercado>> = {
  pt: { hl: "pt-PT", gl: "MZ" },
  en: { hl: "en", gl: "US" },
  es: { hl: "es", gl: "ES" },
  fr: { hl: "fr", gl: "FR" },
  de: { hl: "de", gl: "DE" },
  it: { hl: "it", gl: "IT" },
  ar: { hl: "ar", gl: "SA" },
  zh: { hl: "zh-CN", gl: "CN", motorLocal: "Baidu" },
  ptbr: { hl: "pt-BR", gl: "BR" },
  es419: { hl: "es-419", gl: "MX" },
  zhhant: { hl: "zh-TW", gl: "TW" },
  ru: { hl: "ru", gl: "RU", motorLocal: "Yandex" },
  ja: { hl: "ja", gl: "JP" },
  ko: { hl: "ko", gl: "KR", motorLocal: "Naver" },
  hi: { hl: "hi", gl: "IN" },
  tr: { hl: "tr", gl: "TR" },
  id: { hl: "id", gl: "ID" },
  vi: { hl: "vi", gl: "VN" },
  pl: { hl: "pl", gl: "PL" },
  nl: { hl: "nl", gl: "NL" },
  th: { hl: "th", gl: "TH" },
  uk: { hl: "uk", gl: "UA" },
  he: { hl: "he", gl: "IL" },
  fa: { hl: "fa", gl: "IR" },
  ur: { hl: "ur", gl: "PK" },
  bn: { hl: "bn", gl: "BD" },
  sw: { hl: "sw", gl: "KE" },
  ms: { hl: "ms", gl: "MY" },
  tl: { hl: "tl", gl: "PH" },
  ro: { hl: "ro", gl: "RO" },
  el: { hl: "el", gl: "GR" },
  cs: { hl: "cs", gl: "CZ", motorLocal: "Seznam" },
  sk: { hl: "sk", gl: "SK" },
  hu: { hl: "hu", gl: "HU" },
  sv: { hl: "sv", gl: "SE" },
  no: { hl: "no", gl: "NO" },
  da: { hl: "da", gl: "DK" },
  fi: { hl: "fi", gl: "FI" },
  bg: { hl: "bg", gl: "BG" },
  sr: { hl: "sr", gl: "RS" },
  ca: { hl: "ca", gl: "ES" },
  af: { hl: "af", gl: "ZA" },
  ta: { hl: "ta", gl: "IN" },
  te: { hl: "te", gl: "IN" },
};
