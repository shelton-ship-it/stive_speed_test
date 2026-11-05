/**
 * Configuração do site. A marca, os endereços de contacto e de suporte e as redes
 * sociais ficam todos aqui, num único sítio.
 *
 * Os endereços das redes sociais vêm do ambiente (VITE_REDE_X, VITE_REDE_FACEBOOK,
 * VITE_REDE_TIKTOK). Uma rede sem endereço não mostra ícone, para nunca haver um
 * ícone que não leva a lado nenhum.
 */
const ambiente = import.meta.env;

export type Rede = "x" | "facebook" | "tiktok";

const REDES: Array<{ id: Rede; nome: string; url: string }> = [
  { id: "x", nome: "X", url: (ambiente.VITE_REDE_X ?? "").trim() },
  { id: "facebook", nome: "Facebook", url: (ambiente.VITE_REDE_FACEBOOK ?? "").trim() },
  { id: "tiktok", nome: "TikTok", url: (ambiente.VITE_REDE_TIKTOK ?? "").trim() },
];

export const site = {
  /** Nome da marca. Nunca é traduzido. */
  marca: "Stive",
  contacto: "https://contact.stive.tech",
  suporte: "https://support.stive.tech",
  /** A medição usa as APIs da Cloudflare, e o rodapé tem de o dizer. */
  fornecedor: { nome: "Cloudflare", url: "https://www.cloudflare.com/" },
  redes: REDES.filter((r) => r.url.length > 0),
};
