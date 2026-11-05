import { Globo } from "./Globo";
import type { Instantaneo } from "../estado/controlador";
import { minimoTeoricoMs } from "../rede/percurso";
import { valorDe } from "../motor/tipos";
import { useI18n } from "../textos/useI18n";
import type { Chave } from "../textos/i18n";
import estilos from "./PercursoTeste.module.css";

/** O globo e os números reais que o explicam. */
export function PercursoTeste({ instantaneo }: { instantaneo: Instantaneo }) {
  const { t, numero } = useI18n();
  const { percurso, estadoPercurso, fase, aoVivo, sessao } = instantaneo;

  const mbps =
    fase === "descida"
      ? (aoVivo?.descidaMbps ?? null)
      : fase === "subida"
        ? (aoVivo?.subidaMbps ?? null)
        : null;
  const latencia = aoVivo?.latenciaRepousoMs ?? valorDe(sessao?.metricas.latenciaRepousoMs);
  const km = percurso?.distanciaKm ?? null;
  const minimo = km !== null ? minimoTeoricoMs(km) : null;
  // Abaixo de 100 km o mínimo é menor que um milissegundo e a comparação não ajuda.
  const fator =
    latencia !== null && minimo !== null && km !== null && km >= 100 ? latencia / minimo : null;

  const legenda: Chave =
    fase === "descida"
      ? "percurso.legendaDescida"
      : fase === "subida"
        ? "percurso.legendaSubida"
        : fase === "latencia" || fase === "perdaPacotes"
          ? "percurso.legendaLatencia"
          : "percurso.legendaRepouso";

  const local = [percurso?.cliente.cidade, percurso?.cliente.pais].filter(Boolean).join(", ");
  const servidor = [percurso?.servidor.iata, percurso?.servidor.cidade].filter(Boolean).join(", ");

  const linha = (rotulo: Chave, valor: string | null) =>
    valor ? (
      <div className={estilos.fato}>
        <dt>{t(rotulo)}</dt>
        <dd>{valor}</dd>
      </div>
    ) : null;

  return (
    <div className={estilos.percurso}>
      <Globo
        percurso={percurso}
        fase={fase}
        mbps={mbps}
        rotulo={t("percurso.rotulo")}
        dica={t("percurso.dica")}
      />
      <p className={estilos.legenda} role="status">
        {percurso && percurso.servidor.ponto ? t(legenda) : null}
        {estadoPercurso === "inativo" ? t("percurso.aguarda") : null}
        {estadoPercurso === "obtendo" ? t("percurso.obtendo") : null}
        {estadoPercurso === "indisponivel" ? t("percurso.indisponivel") : null}
      </p>

      {percurso ? (
        <>
          <dl className={`${estilos.factos} numeros`}>
            {linha("percurso.local", local || null)}
            {linha("percurso.rede", percurso.cliente.rede)}
            {linha("percurso.servidor", servidor || null)}
            {linha(
              "percurso.distancia",
              km !== null ? t("percurso.km", { n: numero(km, 0) }) : null,
            )}
            {linha(
              "percurso.minimoFibra",
              minimo !== null && km !== null && km >= 100 ? `${numero(minimo, 1)} ms` : null,
            )}
            {linha(
              "percurso.latenciaMedida",
              latencia !== null ? `${numero(latencia, 0)} ms` : null,
            )}
            {linha(
              "percurso.fator",
              fator !== null ? t("percurso.fatorValor", { n: numero(fator, 1) }) : null,
            )}
          </dl>
          <p className={estilos.nota}>{t("percurso.notaLocal")}</p>
          {minimo !== null ? <p className={estilos.nota}>{t("percurso.notaFibra")}</p> : null}
        </>
      ) : null}
    </div>
  );
}
