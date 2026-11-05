import { useState, type ReactNode } from "react";
import {
  Briefcase,
  CircleAlert,
  Clapperboard,
  Copy,
  FileJson,
  FileSpreadsheet,
  FolderDown,
  Gamepad2,
  Globe,
  Info,
  Printer,
  Share2,
  TriangleAlert,
  Video,
} from "lucide-react";
import { Botao } from "@/componentes/Botao";
import type { Amostra, Metrica, Sessao } from "../motor/tipos";
import { valorDe } from "../motor/tipos";
import { calcularEstatisticas, mbpsParaMBs } from "../dominio/estatistica";
import {
  classificarExperiencia,
  VERSAO_REGRAS,
  type Nivel,
  type UsoId,
} from "../dominio/classificar";
import { perfilBase } from "../motor/perfis";
import { diagnosticarLigacao } from "../dominio/diagnosticar";
import {
  carimboParaFicheiro,
  descarregar,
  exportarCsv,
  exportarJson,
  resumoEmTexto,
} from "../exportar/formatos";
import type { Unidade } from "../estado/preferencias";
import { useI18n } from "../textos/useI18n";
import type { Chave } from "../textos/i18n";
import { Grafico, LegendaSeries, type Serie } from "./Grafico";
import estilos from "./Relatorio.module.css";

const ICONES_USO: Record<UsoId, ReactNode> = {
  jogos: <Gamepad2 />,
  streaming: <Clapperboard />,
  videochamadas: <Video />,
  navegacao: <Globe />,
  transferencias: <FolderDown />,
  trabalhoRemoto: <Briefcase />,
};

export function Relatorio({ sessao, unidade }: { sessao: Sessao; unidade: Unidade }) {
  const { t, data } = useI18n();
  return (
    <div className={estilos.relatorio}>
      <header className={estilos.cabeca}>
        <h2>{t("secao.relatorio")}</h2>
        <p>
          {data(sessao.iniciadaEm)},{" "}
          {t(`perfil.${perfilBase(sessao.motor.perfilId)}.nome` as Chave)}
        </p>
      </header>
      <Metricas sessao={sessao} unidade={unidade} />
      <Qualidade sessao={sessao} />
      <Graficos sessao={sessao} unidade={unidade} />
      <Diagnostico sessao={sessao} />
      <Tecnica sessao={sessao} />
      <Partilha sessao={sessao} />
    </div>
  );
}

function ItemMetrica({
  rotulo,
  metrica,
  casas,
  converter,
  unidade,
}: {
  rotulo: Chave;
  metrica: Metrica;
  casas: number;
  converter?: (v: number) => number;
  unidade?: string;
}) {
  const { t, numero } = useI18n();
  const valor = valorDe(metrica);
  const mostrado = valor === null ? null : converter ? converter(valor) : valor;
  return (
    <div className={estilos.metrica}>
      <dt>{t(rotulo)}</dt>
      <dd className="numeros">
        {mostrado === null ? (
          <span className={estilos.semValor}>
            {t(
              metrica.estado === "naoSuportada"
                ? "unidade.naoSuportada"
                : metrica.estado === "invalida"
                  ? "unidade.invalida"
                  : "unidade.indisponivel",
            )}
          </span>
        ) : (
          <>
            <span className={estilos.metricaNumero}>{numero(mostrado, casas)}</span>
            <span className={estilos.metricaUnidade}>{unidade ?? metrica.unidade}</span>
          </>
        )}
      </dd>
      {metrica.estado === "naoSuportada" ? null : (
        <p className={estilos.origem}>
          {t(metrica.origem === "derivada" ? "metrica.origemDerivada" : "metrica.origemMotor")}
        </p>
      )}
    </div>
  );
}

function Metricas({ sessao, unidade }: { sessao: Sessao; unidade: Unidade }) {
  const { t } = useI18n();
  const m = sessao.metricas;
  const d = sessao.derivadas;
  const conv = unidade === "mbs" ? mbpsParaMBs : undefined;
  const rotuloVel = t(unidade === "mbs" ? "unidade.mbs" : "unidade.mbps");
  return (
    <section aria-labelledby="titMetricas" className={estilos.secao}>
      <h3 id="titMetricas" className="soParaLeitores">
        {t("secao.relatorio")}
      </h3>
      <dl className={estilos.metricas}>
        <ItemMetrica
          rotulo="metrica.descida"
          metrica={m.descidaMbps}
          casas={1}
          converter={conv}
          unidade={rotuloVel}
        />
        <ItemMetrica
          rotulo="metrica.subida"
          metrica={m.subidaMbps}
          casas={1}
          converter={conv}
          unidade={rotuloVel}
        />
        <ItemMetrica rotulo="metrica.latenciaRepouso" metrica={m.latenciaRepousoMs} casas={0} />
        <ItemMetrica rotulo="metrica.jitterRepouso" metrica={m.jitterRepousoMs} casas={0} />
        <ItemMetrica
          rotulo="metrica.latenciaCargaDescida"
          metrica={m.latenciaCargaDescidaMs}
          casas={0}
        />
        <ItemMetrica
          rotulo="metrica.jitterCargaDescida"
          metrica={m.jitterCargaDescidaMs}
          casas={0}
        />
        <ItemMetrica
          rotulo="metrica.latenciaCargaSubida"
          metrica={m.latenciaCargaSubidaMs}
          casas={0}
        />
        <ItemMetrica rotulo="metrica.jitterCargaSubida" metrica={m.jitterCargaSubidaMs} casas={0} />
        <ItemMetrica
          rotulo="metrica.aumentoLatenciaDescida"
          metrica={d.aumentoLatenciaDescidaMs}
          casas={0}
        />
        <ItemMetrica
          rotulo="metrica.aumentoLatenciaSubida"
          metrica={d.aumentoLatenciaSubidaMs}
          casas={0}
        />
        <ItemMetrica rotulo="metrica.perdaPacotes" metrica={m.perdaPacotes} casas={1} />
      </dl>
    </section>
  );
}

const CLASSE_NIVEL: Record<Nivel, string> = {
  excelente: estilos.nivelExcelente,
  boa: estilos.nivelBoa,
  limitada: estilos.nivelLimitada,
  fraca: estilos.nivelFraca,
  semDados: estilos.nivelSemDados,
};

function Qualidade({ sessao }: { sessao: Sessao }) {
  const { t } = useI18n();
  const avaliacoes = classificarExperiencia(sessao);
  return (
    <section aria-labelledby="titQualidade" className={estilos.secao}>
      <h3 id="titQualidade" className={estilos.titulo}>
        {t("secao.experiencia")}
      </h3>
      <ul className={estilos.usos}>
        {avaliacoes.map((a) => (
          <li key={a.uso} className={estilos.uso}>
            <span className={estilos.usoIcone} aria-hidden="true">
              {ICONES_USO[a.uso]}
            </span>
            <div className={estilos.usoCorpo}>
              <div className={estilos.usoTopo}>
                <h4>{t(`uso.${a.uso}.nome` as Chave)}</h4>
                <span className={`${estilos.nivel} ${CLASSE_NIVEL[a.nivel]}`}>
                  <i aria-hidden="true" />
                  {t(`nivel.${a.nivel}` as Chave)}
                </span>
              </div>
              <p>{t(`uso.${a.uso}.explicacao` as Chave)}</p>
              <p className={estilos.nota}>
                {t(a.doMotor ? "uso.limiteMotor" : (`uso.${a.uso}.limite` as Chave))}
              </p>
              {a.recomendacoes.length > 0 ? (
                <ul className={estilos.recomendacoes}>
                  {a.recomendacoes.map((r) => (
                    <li key={r}>{t(r as Chave)}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <p className={estilos.nota}>{t("uso.regras", { versao: VERSAO_REGRAS })}</p>
    </section>
  );
}

function Graficos({ sessao, unidade }: { sessao: Sessao; unidade: Unidade }) {
  const { t, numero } = useI18n();
  const porIndice = (lista: Amostra[]) => lista.map((a, i) => ({ x: i + 1, y: a.valor }));
  const fator = unidade === "mbs" ? mbpsParaMBs : (v: number) => v;
  const inicio = Math.min(
    ...[...sessao.amostras.descidaMbps, ...sessao.amostras.subidaMbps]
      .map((a) => Date.parse(a.t))
      .filter(Number.isFinite),
  );
  const porTempo = (lista: Amostra[]) =>
    lista.map((a) => ({ x: (Date.parse(a.t) - inicio) / 1000, y: fator(a.valor) }));

  const seriesLatencia: Serie[] = [
    {
      id: "repouso",
      rotulo: t("grafico.repouso"),
      cor: "latencia",
      pontos: porIndice(sessao.amostras.latenciaRepousoMs),
    },
    {
      id: "descida",
      rotulo: t("grafico.cargaDescida"),
      cor: "descida",
      pontos: porIndice(sessao.amostras.latenciaCargaDescidaMs),
    },
    {
      id: "subida",
      rotulo: t("grafico.cargaSubida"),
      cor: "subida",
      pontos: porIndice(sessao.amostras.latenciaCargaSubidaMs),
    },
  ];
  const seriesLargura: Serie[] = [
    {
      id: "descida",
      rotulo: t("metrica.descida"),
      cor: "descida",
      pontos: porTempo(sessao.amostras.descidaMbps),
    },
    {
      id: "subida",
      rotulo: t("metrica.subida"),
      cor: "subida",
      pontos: porTempo(sessao.amostras.subidaMbps),
    },
  ];
  const unidadeVel = t(unidade === "mbs" ? "unidade.mbs" : "unidade.mbps");

  const m = sessao.metricas;
  const barras = [
    {
      id: "repouso",
      rotulo: t("grafico.repouso"),
      cor: "latencia",
      valor: valorDe(m.latenciaRepousoMs),
    },
    {
      id: "descida",
      rotulo: t("grafico.cargaDescida"),
      cor: "descida",
      valor: valorDe(m.latenciaCargaDescidaMs),
    },
    {
      id: "subida",
      rotulo: t("grafico.cargaSubida"),
      cor: "subida",
      valor: valorDe(m.latenciaCargaSubidaMs),
    },
  ];
  const maximo = Math.max(1, ...barras.map((b) => b.valor ?? 0));

  return (
    <section aria-labelledby="titGraficos" className={estilos.secao}>
      <h3 id="titGraficos" className={estilos.titulo}>
        {t("grafico.tendencia")}
      </h3>
      <div className={estilos.graficos}>
        <figure className={estilos.figura}>
          <figcaption>{t("grafico.latenciaTitulo")} (ms)</figcaption>
          <Grafico
            titulo={t("grafico.latenciaTitulo")}
            series={seriesLatencia}
            unidade="ms"
            rotuloX={t("estat.amostras")}
            mensagemVazio={t("diagnostico.semAmostras")}
            formatarX={(x) => t("grafico.amostra", { n: Math.round(x) })}
          />
          <LegendaSeries series={seriesLatencia} />
        </figure>
        <figure className={estilos.figura}>
          <figcaption>
            {t("grafico.larguraTitulo")} ({unidadeVel})
          </figcaption>
          <Grafico
            titulo={t("grafico.larguraTitulo")}
            series={seriesLargura}
            unidade={unidadeVel}
            rotuloX={t("grafico.segundos")}
            mensagemVazio={t("diagnostico.semAmostras")}
            formatarX={(x) => `${numero(x, 1)} s`}
          />
          <LegendaSeries series={seriesLargura} />
        </figure>
        <figure className={estilos.figura}>
          <figcaption>{t("grafico.cargaTitulo")} (ms)</figcaption>
          <ul className={estilos.barras}>
            {barras.map((b) => (
              <li key={b.id}>
                <span className={estilos.barraRotulo}>{b.rotulo}</span>
                <span className={estilos.barraTrilho}>
                  <span
                    className={`${estilos.barraEnchimento} ${estilos[`cor_${b.cor}`]}`}
                    style={{ inlineSize: `${((b.valor ?? 0) / maximo) * 100}%` }}
                  />
                </span>
                <span className={`${estilos.barraValor} numeros`}>
                  {b.valor === null ? t("unidade.indisponivel") : `${numero(b.valor, 0)} ms`}
                </span>
              </li>
            ))}
          </ul>
        </figure>
      </div>
    </section>
  );
}

function Diagnostico({ sessao }: { sessao: Sessao }) {
  const { t, numero, bytes } = useI18n();
  const itens = diagnosticarLigacao(sessao);
  const avisos = sessao.diagnosticos.filter(
    (d) => d.gravidade !== "info" || d.codigo === "perdaPacotesNaoConfigurada",
  );
  const a = sessao.ambiente;
  return (
    <section aria-labelledby="titDiagnostico" className={estilos.secao}>
      <h3 id="titDiagnostico" className={estilos.titulo}>
        {t("secao.diagnostico")}
      </h3>
      <ul className={estilos.diagnosticos}>
        {itens.map((item, i) => (
          <li key={i} className={item.gravidade === "aviso" ? estilos.diagAviso : ""}>
            <span aria-hidden="true" className={estilos.diagIcone}>
              {item.gravidade === "aviso" ? <TriangleAlert /> : <Info />}
            </span>
            <div>
              <p>
                <strong>
                  {t(
                    item.observacao === "diagnostico.obs.nota"
                      ? "diagnostico.nota"
                      : "diagnostico.observado",
                  )}
                  :
                </strong>{" "}
                {t(item.observacao as Chave, item.params)}
              </p>
              {item.hipoteses.map((h) => (
                <p key={h} className={estilos.nota}>
                  {t(h as Chave)}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {avisos.length > 0 ? (
        <>
          <h4 className={estilos.subtitulo}>{t("secao.avisos")}</h4>
          <ul className={estilos.diagnosticos}>
            {avisos.map((d) => (
              <li key={d.codigo}>
                <span aria-hidden="true" className={estilos.diagIcone}>
                  {d.gravidade === "info" ? <Info /> : <CircleAlert />}
                </span>
                <p>{t(d.chaveMensagem as Chave)}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h4 className={estilos.subtitulo}>{t("secao.contexto")}</h4>
      <dl className={estilos.contexto}>
        <Fato rotulo={t("ambiente.navegador")} valor={a.navegador ?? t("ambiente.naoIndicado")} />
        <Fato rotulo={t("ambiente.sistema")} valor={a.sistema ?? t("ambiente.naoIndicado")} />
        <Fato
          rotulo={t("ambiente.tipoLigacao")}
          valor={a.tipoLigacao ?? t("ambiente.naoIndicado")}
        />
        <Fato
          rotulo={t("ambiente.visibilidade")}
          valor={t(a.paginaOcultaDuranteTeste ? "ambiente.oculta" : "ambiente.visivel")}
        />
        <Fato
          rotulo={t("metrica.duracao")}
          valor={
            sessao.duracaoMs === null
              ? t("unidade.indisponivel")
              : `${numero(sessao.duracaoMs / 1000, 1)} s`
          }
        />
        <Fato
          rotulo={t("metrica.transferidos")}
          valor={bytes(sessao.bytesTransferidos) || t("unidade.indisponivel")}
        />
        {sessao.rede?.localCidade || sessao.rede?.localPais ? (
          <Fato
            rotulo={t("percurso.local")}
            valor={[sessao.rede.localCidade, sessao.rede.localPais].filter(Boolean).join(", ")}
          />
        ) : null}
        {sessao.rede?.servidorIata ? (
          <Fato
            rotulo={t("percurso.servidor")}
            valor={[sessao.rede.servidorIata, sessao.rede.servidorCidade]
              .filter(Boolean)
              .join(", ")}
          />
        ) : null}
        {sessao.rede?.distanciaKm != null ? (
          <Fato
            rotulo={t("percurso.distancia")}
            valor={t("percurso.km", { n: numero(sessao.rede.distanciaKm, 0) })}
          />
        ) : null}
      </dl>
    </section>
  );
}

function Fato({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className={estilos.fato}>
      <dt>{rotulo}</dt>
      <dd className="numeros">{valor}</dd>
    </div>
  );
}

function Tecnica({ sessao }: { sessao: Sessao }) {
  const { t, numero } = useI18n();
  const tipos = [
    "latenciaRepousoMs",
    "latenciaCargaDescidaMs",
    "latenciaCargaSubidaMs",
    "descidaMbps",
    "subidaMbps",
  ] as const;
  const linhas = tipos
    .map((k) => ({ k, est: calcularEstatisticas(sessao.amostras[k]) }))
    .filter((l) => l.est.contagem > 0);
  const pontuacoes = Object.entries(sessao.pontuacoes).filter(([, v]) => v !== null);
  return (
    <details className={estilos.tecnica}>
      <summary>{t("secao.tecnica")}</summary>
      {linhas.length > 0 ? (
        <div className={estilos.rolar}>
          <table className={estilos.tabela}>
            <thead>
              <tr>
                <th scope="col">{t("estat.metrica")}</th>
                <th scope="col">{t("estat.amostras")}</th>
                <th scope="col">{t("estat.mediana")}</th>
                <th scope="col">{t("estat.p95")}</th>
                <th scope="col">{t("estat.minimoMaximo")}</th>
                <th scope="col">{t("estat.variabilidade")}</th>
                <th scope="col">{t("estat.atipicos")}</th>
              </tr>
            </thead>
            <tbody className="numeros">
              {linhas.map(({ k, est }) => (
                <tr key={k}>
                  <th scope="row">{t(`amostra.${k}` as Chave)}</th>
                  <td>{est.contagem}</td>
                  <td>{numero(est.mediana)}</td>
                  <td>{numero(est.p95)}</td>
                  <td>
                    {numero(est.minimo)} / {numero(est.maximo)}
                  </td>
                  <td>
                    {est.cv !== null ? `${numero(est.cv * 100, 0)}%` : t("unidade.indisponivel")}
                  </td>
                  <td>{est.atipicos.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className={estilos.nota}>{t("estat.atipicosNota")}</p>

      <h4 className={estilos.subtitulo}>{t("secao.bruto")}</h4>
      <ul className={`${estilos.contagem} numeros`}>
        {Object.entries(sessao.contagemAmostras).map(([k, c]) => (
          <li key={k}>
            {t(`amostra.${k}` as Chave)}: {c.validas} {t("amostra.validas")}, {c.descartadas}{" "}
            {t("amostra.descartadas")}
          </li>
        ))}
      </ul>

      {pontuacoes.length > 0 ? (
        <>
          <h4 className={estilos.subtitulo}>{t("metrica.pontuacaoMotor")}</h4>
          <ul className={`${estilos.contagem} numeros`}>
            {pontuacoes.map(([k, v]) => (
              <li key={k}>
                {k}: {v?.nomeClasse} ({v?.pontos})
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </details>
  );
}

function Partilha({ sessao }: { sessao: Sessao }) {
  const { t, data } = useI18n();
  const [estado, setEstado] = useState<"parado" | "copiado" | "falhou">("parado");
  const carimbo = carimboParaFicheiro(sessao.iniciadaEm);
  const podePartilhar = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const resumo = () => resumoEmTexto(sessao, (c) => t(c as Chave), data);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(resumo());
      setEstado("copiado");
    } catch {
      setEstado("falhou");
    }
    window.setTimeout(() => setEstado("parado"), 3000);
  }

  async function partilhar() {
    try {
      await navigator.share({ title: t("partilha.titulo"), text: resumo() });
    } catch {
      /* a pessoa cancelou a partilha: não é um erro */
    }
  }

  return (
    <section aria-labelledby="titPartilha" className={`${estilos.secao} naoImprimir`}>
      <h3 id="titPartilha" className={estilos.titulo}>
        {t("secao.partilha")}
      </h3>
      <div className={estilos.botoes}>
        <Botao
          icone={<FileJson />}
          onClick={() =>
            descarregar(`medicao${carimbo}.json`, exportarJson(sessao), "application/json")
          }
        >
          {t("acao.exportarJson")}
        </Botao>
        <Botao
          icone={<FileSpreadsheet />}
          onClick={() => descarregar(`medicao${carimbo}.csv`, exportarCsv(sessao), "text/csv")}
        >
          {t("acao.exportarCsv")}
        </Botao>
        <Botao icone={<Copy />} onClick={copiar}>
          {t("acao.copiarResumo")}
        </Botao>
        {podePartilhar ? (
          <Botao icone={<Share2 />} onClick={partilhar}>
            {t("acao.partilhar")}
          </Botao>
        ) : null}
        <Botao icone={<Printer />} onClick={() => window.print()}>
          {t("acao.imprimir")}
        </Botao>
      </div>
      {estado !== "parado" ? (
        <p role="status" className={estilos.nota}>
          {t(estado === "copiado" ? "partilha.copiado" : "partilha.falhouCopia")}
        </p>
      ) : null}
      {!podePartilhar ? <p className={estilos.nota}>{t("partilha.semSuporte")}</p> : null}
      <p className={estilos.nota}>{t("partilha.aviso")}</p>
    </section>
  );
}
