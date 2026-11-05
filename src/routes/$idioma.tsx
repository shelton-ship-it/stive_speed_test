import { Outlet, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { Estrutura } from "@/paginas/Estrutura";
import { construirCabecalho } from "@/seo/cabecalho";
import { obterOrigem } from "@/seo/origem";
import { carregarDicionario, localAtivo, localesAtivos } from "@/medicao/textos/dicionarios";
import { SLUG_ORIGEM } from "@/medicao/textos/locais";

/**
 * Qualquer idioma ativo vive em /{slug}. Esta rota valida o idioma, carrega os
 * textos uma só vez e envolve a página filha (início ou políticas). Slugs
 * desconhecidos, ou ainda sem tradução, devolvem 404.
 */
export const Route = createFileRoute("/$idioma")({
  beforeLoad: ({ params, location }) => {
    if (params.idioma === SLUG_ORIGEM) {
      const resto = location.pathname.replace(/^\/pt/, "") || "/";
      throw redirect({ to: resto, statusCode: 301 });
    }
    if (!localAtivo(params.idioma)) throw notFound();
  },
  loader: async ({ params }) => ({
    origem: await obterOrigem(),
    dicionario: await carregarDicionario(params.idioma),
  }),
  head: ({ loaderData, params, matches }) => {
    const local = localAtivo(params.idioma);
    if (!local || !loaderData) return {};
    const naPolitica = matches.some((m) => String(m.routeId) === "/$idioma/politicas");
    return construirCabecalho(
      local,
      loaderData.dicionario,
      loaderData.origem,
      localesAtivos(),
      naPolitica ? "politicas" : "inicio",
    );
  },
  component: LayoutDoIdioma,
});

function LayoutDoIdioma() {
  const { idioma } = Route.useParams();
  const { dicionario } = Route.useLoaderData();
  return (
    <Estrutura local={localAtivo(idioma)!} dicionario={dicionario}>
      <Outlet />
    </Estrutura>
  );
}
