import { createFileRoute } from "@tanstack/react-router";
import { Estrutura } from "@/paginas/Estrutura";
import { Politicas } from "@/paginas/Politicas";
import { construirCabecalho } from "@/seo/cabecalho";
import { obterOrigem } from "@/seo/origem";
import { carregarDicionario, localesAtivos } from "@/medicao/textos/dicionarios";
import { LOCAIS, SLUG_ORIGEM } from "@/medicao/textos/locais";

const local = LOCAIS.find((l) => l.slug === SLUG_ORIGEM)!;

export const Route = createFileRoute("/politicas")({
  loader: async () => ({
    origem: await obterOrigem(),
    dicionario: await carregarDicionario(local.slug),
  }),
  head: ({ loaderData }) =>
    loaderData
      ? construirCabecalho(
          local,
          loaderData.dicionario,
          loaderData.origem,
          localesAtivos(),
          "politicas",
        )
      : {},
  component: PaginaPoliticas,
});

function PaginaPoliticas() {
  const { dicionario } = Route.useLoaderData();
  return (
    <Estrutura local={local} dicionario={dicionario}>
      <Politicas />
    </Estrutura>
  );
}
