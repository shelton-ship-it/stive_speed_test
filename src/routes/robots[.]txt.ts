import { createFileRoute } from "@tanstack/react-router";
import { obterOrigem } from "@/seo/origem";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const origem = await obterOrigem();
        const corpo = ["User-agent: *", "Allow: /", "", `Sitemap: ${origem}/sitemap.xml`, ""].join(
          "\n",
        );
        return new Response(corpo, { headers: { "content-type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
