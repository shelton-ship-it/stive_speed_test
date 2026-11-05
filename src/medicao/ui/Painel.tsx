import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ControladorMedicao, type FabricaDeMotor } from "../estado/controlador";
import { carregarPreferencias, usePreferencias } from "../estado/preferencias";
import { recolherAmbiente, type AmbienteNavegador } from "../dominio/ambiente";
import { mbpsParaMBs } from "../dominio/estatistica";
import { useI18n } from "../textos/useI18n";
import type { Chave } from "../textos/i18n";
import { Grafico, LegendaSeries, type Serie } from "./Grafico";
import { Historico } from "./Historico";
import { Instrumento } from "./Instrumento";
import { PercursoTeste } from "./PercursoTeste";
import { perfilBase } from "../motor/perfis";
import { Relatorio } from "./Relatorio";
import estilos from "./Painel.module.css";

/**
 * Ilha interativa da página: instrumento, tempo real, resultado e histórico.
 * Renderiza também no servidor (estado inicial em repouso) para o HTML já
 * conter a estrutura; os dados do navegador só entram depois da hidratação.
 */
export function Painel({ fabrica }: { fabrica?: FabricaDeMotor } = {}) {
  const { t, numero } = useI18n();
  const { unidade } = usePreferencias();
  const [controlador] = useState(() => new ControladorMedicao(fabrica));
  const instantaneo = useSyncExternalStore(
    controlador.subscrever,
    controlador.obterInstantaneo,
    controlador.obterInstantaneo,
  );
  const [confirmados, setConfirmados] = useState<ReadonlySet<string>>(new Set());
  const [ambiente, setAmbiente] = useState<AmbienteNavegador | null>(null);

  useEffect(() => {
    carregarPreferencias();
    setAmbiente(recolherAmbiente());
    return () => controlador.libertar();
  }, [controlador]);

  const perfil = controlador.perfilAtual;
  const unidadeTexto = t(unidade === "mbs" ? "unidade.mbs" : "unidade.mbps");
  const fator = unidade === "mbs" ? mbpsParaMBs : (v: number) => v;

  const series: Serie[] = useMemo(() => {
    const descida = instantaneo.serie
      .filter((p) => p.descida !== null)
      .map((p) => ({ x: p.t, y: fator(p.descida as number) }));
    const subida = instantaneo.serie
      .filter((p) => p.subida !== null)
      .map((p) => ({ x: p.t, y: fator(p.subida as number) }));
    return [
      { id: "descida", rotulo: t("metrica.descida"), cor: "descida", pontos: descida },
      { id: "subida", rotulo: t("metrica.subida"), cor: "subida", pontos: subida },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instantaneo.serie, unidade, t]);

  const sessaoFinal =
    instantaneo.sessao &&
    ["concluido", "parcial", "cancelado", "falhou"].includes(instantaneo.estado)
      ? instantaneo.sessao
      : null;

  const facto = (rotulo: Chave, valor: string) => (
    <div className={estilos.fato}>
      <dt>{t(rotulo)}</dt>
      <dd>{valor}</dd>
    </div>
  );

  return (
    <>
      <Instrumento
        controlador={controlador}
        instantaneo={instantaneo}
        unidade={unidade}
        avisoConfirmado={confirmados.has(perfil.id)}
        aoConfirmarAviso={() => setConfirmados((c) => new Set(c).add(perfil.id))}
      />

      <div className={estilos.tempoReal}>
        <section aria-labelledby="titTempoReal" className={estilos.bloco}>
          <div className={estilos.blocoCabeca}>
            <h2 id="titTempoReal">{t("grafico.tempoReal")}</h2>
            <LegendaSeries series={series} />
          </div>
          <Grafico
            titulo={t("grafico.tempoReal")}
            series={series}
            unidade={unidadeTexto}
            rotuloX={t("grafico.segundos")}
            mensagemVazio={t("grafico.vazio")}
            formatarX={(x) => `${numero(x, 1)} s`}
            altura={240}
          />
        </section>

        <div className={estilos.coluna}>
          <section aria-labelledby="titPercurso" className={estilos.bloco}>
            <div className={estilos.blocoCabeca}>
              <h2 id="titPercurso">{t("percurso.titulo")}</h2>
            </div>
            <PercursoTeste instantaneo={instantaneo} />
          </section>

          <section aria-labelledby="titLigacao" className={estilos.bloco}>
            <div className={estilos.blocoCabeca}>
              <h2 id="titLigacao">{t("ligacao.titulo")}</h2>
            </div>
            <dl className={`${estilos.factos} numeros`}>
              {facto("ligacao.navegador", ambiente?.navegador ?? t("ambiente.naoIndicado"))}
              {facto("ligacao.sistema", ambiente?.sistema ?? t("ambiente.naoIndicado"))}
              {facto("ligacao.tipo", ambiente?.tipoLigacao ?? t("ligacao.naoIndicado"))}
              {facto("ligacao.protocolo", "HTTPS")}
              {facto("ligacao.perfil", t(`perfil.${perfilBase(perfil.id)}.nome` as Chave))}
              {facto("ligacao.unidade", unidadeTexto)}
            </dl>
            <p className={estilos.nota}>{t("unidade.nota")}</p>
          </section>
        </div>
      </div>

      {sessaoFinal ? <Relatorio sessao={sessaoFinal} unidade={unidade} /> : null}

      <section
        id="historico"
        aria-labelledby="titHistorico"
        className={`${estilos.bloco} naoImprimir`}
      >
        <div className={estilos.blocoCabeca}>
          <h2 id="titHistorico">{t("secao.historico")}</h2>
        </div>
        <Historico chaveAtualizacao={instantaneo.sessao?.id ?? ""} unidade={unidade} />
      </section>
    </>
  );
}
