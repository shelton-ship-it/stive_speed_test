import { useRouterState } from "@tanstack/react-router";
import { dicionarioDeReserva, localAtivo } from "@/medicao/textos/dicionarios";
import { traduzir, type Chave } from "@/medicao/textos/i18n";
import { LOCAIS, SLUG_ORIGEM, type Local } from "@/medicao/textos/locais";
import { Botao } from "./Botao";
import { LigacaoIdioma } from "./LigacaoIdioma";
import estilos from "./PaginaErro.module.css";

/** Idioma deduzido do caminho. As páginas de erro usam o dicionário já em memória. */
function useTextosDoCaminho(): { local: Local; t: (c: Chave) => string } {
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const local = localAtivo(caminho.split("/")[1]) ?? LOCAIS.find((l) => l.slug === SLUG_ORIGEM)!;
  const dic = dicionarioDeReserva(local.slug);
  return { local, t: (c) => traduzir(dic, c) };
}

export function NaoEncontrada() {
  const { local, t } = useTextosDoCaminho();
  return (
    <main className={estilos.erro}>
      <h1>{t("naoEncontrada.titulo")}</h1>
      <p>{t("naoEncontrada.texto")}</p>
      <LigacaoIdioma local={local} className={estilos.ligacao}>
        {t("naoEncontrada.voltar")}
      </LigacaoIdioma>
    </main>
  );
}

export function ErroDePagina({ aoTentar }: { aoTentar: () => void }) {
  const { local, t } = useTextosDoCaminho();
  return (
    <main className={estilos.erro}>
      <h1>{t("erroPagina.titulo")}</h1>
      <p>{t("erroPagina.texto")}</p>
      <div className={estilos.acoes}>
        <Botao variante="primario" onClick={aoTentar}>
          {t("erroPagina.tentar")}
        </Botao>
        <LigacaoIdioma local={local} className={estilos.ligacao}>
          {t("naoEncontrada.voltar")}
        </LigacaoIdioma>
      </div>
    </main>
  );
}
