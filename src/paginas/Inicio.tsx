import { Painel } from "@/medicao/ui/Painel";
import { useI18n } from "@/medicao/textos/useI18n";
import { Idiomas } from "./Idiomas";
import { Informacao } from "./Informacao";
import estilos from "./Inicio.module.css";

/** Página inicial: título, instrumento de medição e conteúdo informativo. */
export function Inicio() {
  const { t } = useI18n();
  return (
    <>
      <section id="teste" aria-labelledby="titPagina" className={estilos.teste}>
        <div className={estilos.apresentacao}>
          <h1 id="titPagina">{t("pagina.h1")}</h1>
          <p>{t("pagina.lead")}</p>
        </div>
        <Painel />
      </section>
      <Informacao />
      <Idiomas />
    </>
  );
}
