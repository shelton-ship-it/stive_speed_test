import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

/**
 * Endereço público do site para canonical, Open Graph e hreflang.
 * Usa SITE_URL quando definido; caso contrário deduz do pedido, respeitando
 * os cabeçalhos de proxy inverso.
 */
export const obterOrigem = createServerFn({ method: "GET" }).handler(async () => {
  const fixa = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (fixa) return fixa;
  return getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin;
});
