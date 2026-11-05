import { site } from "@/site";
import { useI18n } from "@/medicao/textos/useI18n";
import { LigacaoPoliticas } from "./LigacaoPoliticas";
import { IconeRede } from "./IconesRedes";
import estilos from "./Rodape.module.css";

/**
 * Rodapé fino e fixo no fundo do ecrã: políticas, contacto e suporte, redes
 * sociais e a indicação do fornecedor das APIs de medição. O contacto e o
 * suporte seguem a mesma regra: são endereços próprios da marca, abertos num novo separador.
 */
export function Rodape() {
  const { t, local } = useI18n();
  const [antes, depois] = t("rodape.poweredBy").split("{marca}");
  const externa = { target: "_blank", rel: "noopener noreferrer" } as const;

  return (
    <footer className={`${estilos.rodape} naoImprimir`}>
      <div className={estilos.conteudo}>
        <p className={estilos.direitos}>
          {t("rodape.direitos", { ano: new Date().getFullYear() })}
        </p>

        <nav className={estilos.ligacoes} aria-label={t("rodape.navegacao")}>
          <LigacaoPoliticas local={local}>{t("rodape.politicas")}</LigacaoPoliticas>
          <a href={site.contacto} {...externa}>
            {t("rodape.contacto")}
          </a>
          <a href={site.suporte} {...externa}>
            {t("rodape.suporte")}
          </a>
        </nav>

        {site.redes.length > 0 ? (
          <ul className={estilos.redes} aria-label={t("rodape.redes")}>
            {site.redes.map((r) => (
              <li key={r.id}>
                <a
                  href={r.url}
                  {...externa}
                  aria-label={t("rodape.seguir", { rede: r.nome })}
                  title={r.nome}
                >
                  <IconeRede rede={r.id} />
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <p className={estilos.fornecedor}>
          {antes}
          <a href={site.fornecedor.url} {...externa}>
            {site.fornecedor.nome}
          </a>
          {depois}
        </p>
      </div>
    </footer>
  );
}
