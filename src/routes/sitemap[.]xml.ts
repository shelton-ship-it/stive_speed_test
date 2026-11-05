import { createFileRoute } from "@tanstack/react-router";
import { obterOrigem } from "@/seo/origem";
import { localesAtivos } from "@/medicao/textos/dicionarios";
import { SLUG_ORIGEM, SLUG_RESERVA, caminhoDe, caminhoPoliticas } from "@/medicao/textos/locais";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origem = await obterOrigem();
        const ativos = localesAtivos();
        const href = (l: (typeof ativos)[number]) => `${origem}${caminhoDe(l)}`;
        const alternativas = [
          ...ativos.map(
            (l) => `<xhtml:link rel="alternate" hreflang="${l.codigo}" href="${href(l)}"/>`,
          ),
          `<xhtml:link rel="alternate" hreflang="x-default" href="${origem}/"/>`,
        ].join("");
        const urlsInicio = ativos
          .map((l) => `<url><loc>${href(l)}</loc>${alternativas}</url>`)
          .join("");
        // As políticas só entram em português e inglês, os textos escritos à mão.
        const escritosAMao = ativos.filter(
          (l) => l.slug === SLUG_ORIGEM || l.slug === SLUG_RESERVA,
        );
        const linksPoliticas = [
          ...escritosAMao.map(
            (l) =>
              `<xhtml:link rel="alternate" hreflang="${l.codigo}" href="${origem}${caminhoPoliticas(l)}"/>`,
          ),
          `<xhtml:link rel="alternate" hreflang="x-default" href="${origem}/politicas"/>`,
        ].join("");
        const urlsPoliticas = escritosAMao
          .map((l) => `<url><loc>${origem}${caminhoPoliticas(l)}</loc>${linksPoliticas}</url>`)
          .join("");
        const urls = urlsInicio + urlsPoliticas;
        const corpo =
          `<?xml version="1.0" encoding="UTF-8"?>` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
        return new Response(corpo, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
