import {
  Activity,
  ArrowDown,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Timer,
  TriangleAlert,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { Botao } from "@/componentes/Botao";
import { PERFIS, type ControladorMedicao, type Instantaneo } from "../estado/controlador";
import { ID_PERFIL_PERSONALIZADO, type NivelPersonalizado } from "../motor/perfis";
import { valorDe } from "../motor/tipos";
import { mbpsParaMBs } from "../dominio/estatistica";
import { posicaoNaRegua } from "../dominio/escala";
import type { Unidade } from "../estado/preferencias";
import { useI18n } from "../textos/useI18n";
import type { Chave } from "../textos/i18n";
import estilos from "./Instrumento.module.css";

type Props = {
  controlador: ControladorMedicao;
  instantaneo: Instantaneo;
  unidade: Unidade;
  avisoConfirmado: boolean;
  aoConfirmarAviso: () => void;
};

const MARCAS_MBPS = [1, 10, 50, 100, 250, 500, 1000];
const MARCAS_MBS = [0.5, 1, 5, 10, 25, 50, 125];

const NIVEIS: NivelPersonalizado[] = ["leve", "padrao", "intensivo"];

export function Instrumento({
  controlador,
  instantaneo,
  unidade,
  avisoConfirmado,
  aoConfirmarAviso,
}: Props) {
  const { t, numero, bytes } = useI18n();
  const ocupado = controlador.ocupado;
  const perfil = controlador.perfilAtual;
  const { aoVivo, sessao, estado, fase } = instantaneo;

  const converter = (mbps: number | null) =>
    mbps === null ? null : unidade === "mbs" ? mbpsParaMBs(mbps) : mbps;
  const rotuloUnidade = t(unidade === "mbs" ? "unidade.mbs" : "unidade.mbps");

  const descida = aoVivo?.descidaMbps ?? valorDe(sessao?.metricas.descidaMbps);
  const subida = aoVivo?.subidaMbps ?? valorDe(sessao?.metricas.subidaMbps);
  const latencia = aoVivo?.latenciaRepousoMs ?? valorDe(sessao?.metricas.latenciaRepousoMs);
  const jitter = valorDe(sessao?.metricas.jitterRepousoMs);

  // A leitura grande acompanha o canal que está a ser medido.
  const aMedirSubida = fase === "subida";
  const principal = aMedirSubida ? subida : (descida ?? subida);
  const rotuloCanal =
    aMedirSubida || (descida === null && subida !== null)
      ? "instrumento.canalSubida"
      : "instrumento.canalDescida";

  const marcas = unidade === "mbs" ? MARCAS_MBS : MARCAS_MBPS;
  const paraMbps = (v: number) => (unidade === "mbs" ? v * 8 : v);

  const precisaAviso = perfil.exigeAvisoDeDados && !avisoConfirmado;
  const iniciarDesativado = ocupado || estado === "verificando" || precisaAviso;
  const terminou =
    ["concluido", "parcial", "cancelado", "falhou"].includes(estado) && sessao !== null;
  const progresso = aoVivo?.progressoFase;

  return (
    <div className={estilos.painel} aria-label={t("instrumento.rotulo")} role="group">
      <div className={estilos.corpo}>
        <div className={estilos.leitura}>
          <p className={estilos.estado} role="status" aria-live="polite">
            {t(`fase.${fase}` as Chave)}
          </p>
          <p className={estilos.valorLinha}>
            <span
              className={`${estilos.valor} ${principal === null ? estilos.valorRepouso : ""} numeros`}
            >
              {principal === null ? "0" : numero(converter(principal), principal >= 100 ? 0 : 1)}
            </span>
            <span className={estilos.unidade}>{rotuloUnidade}</span>
          </p>
          <p className={estilos.canal}>{t(rotuloCanal)}</p>

          <div className={estilos.acoes}>
            {!ocupado ? (
              <Botao
                variante="primario"
                tamanho="grande"
                icone={terminou ? <RotateCcw /> : <Play />}
                disabled={iniciarDesativado}
                onClick={() => controlador.iniciar()}
                data-testid="iniciar"
              >
                {t(terminou ? "acao.repetir" : "acao.iniciar")}
              </Botao>
            ) : (
              <>
                <Botao
                  icone={<Pause />}
                  onClick={() => controlador.pausar()}
                  disabled={estado !== "emCurso" || !instantaneo.suportaPausa}
                >
                  {t("acao.pausar")}
                </Botao>
                <Botao
                  icone={<Play />}
                  onClick={() => controlador.retomar()}
                  disabled={estado !== "pausado"}
                >
                  {t("acao.retomar")}
                </Botao>
                <Botao
                  icone={<X />}
                  onClick={() => controlador.cancelar()}
                  disabled={!["emCurso", "pausado"].includes(estado)}
                >
                  {t("acao.cancelar")}
                </Botao>
              </>
            )}
          </div>
        </div>

        <div className={estilos.reguas}>
          <Pista
            canal="descida"
            rotulo={t("instrumento.canalDescida")}
            valor={descida}
            texto={
              descida === null
                ? t("instrumento.semLeitura")
                : `${numero(converter(descida), 1)} ${rotuloUnidade}`
            }
            icone={<ArrowDown />}
          />
          <Pista
            canal="subida"
            rotulo={t("instrumento.canalSubida")}
            valor={subida}
            texto={
              subida === null
                ? t("instrumento.semLeitura")
                : `${numero(converter(subida), 1)} ${rotuloUnidade}`
            }
            icone={<ArrowUp />}
          />
          <div className={estilos.escala} role="img" aria-label={t("instrumento.escala")}>
            {marcas.map((m) => (
              <span
                key={m}
                className={`${estilos.marca} numeros`}
                style={{ insetInlineStart: `${posicaoNaRegua(paraMbps(m)) * 100}%` }}
              >
                {numero(m, 1)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <dl className={estilos.tira}>
        <Leitura
          canal="descida"
          icone={<ArrowDown />}
          rotulo={t("metrica.descida")}
          valor={converter(descida)}
          unidade={rotuloUnidade}
          casas={1}
        />
        <Leitura
          canal="subida"
          icone={<ArrowUp />}
          rotulo={t("metrica.subida")}
          valor={converter(subida)}
          unidade={rotuloUnidade}
          casas={1}
        />
        <Leitura
          canal="latencia"
          icone={<Timer />}
          rotulo={t("metrica.curtaLatencia")}
          valor={latencia}
          unidade="ms"
          casas={0}
        />
        <Leitura
          canal="latencia"
          icone={<Activity />}
          rotulo={t("metrica.curtaJitter")}
          valor={jitter}
          unidade="ms"
          casas={0}
        />
      </dl>

      {ocupado && progresso ? (
        <div className={estilos.progresso} role="group" aria-label={t("progresso.rotulo")}>
          <progress max={progresso.total} value={progresso.feitas} />
          <p className={`${estilos.progressoTexto} numeros`}>
            {t("progresso.fase", {
              feitas: Math.min(progresso.feitas + 1, progresso.total),
              total: progresso.total,
            })}
            {", "}
            {t("progresso.transferidos", {
              bytes: bytes((aoVivo?.bytesDescida ?? 0) + (aoVivo?.bytesSubida ?? 0)),
            })}
            {aoVivo?.restanteMs != null
              ? `, ${t("progresso.restante", { segundos: numero(aoVivo.restanteMs / 1000, 0) })}`
              : ""}
          </p>
        </div>
      ) : null}

      {instantaneo.chaveErro ? (
        <p className={`${estilos.aviso} ${estilos.erro}`} role="alert">
          <TriangleAlert aria-hidden="true" />
          <span>{t(instantaneo.chaveErro as Chave)}</span>
        </p>
      ) : null}
      {estado === "parcial" || estado === "cancelado" ? (
        <p className={estilos.aviso} role="status">
          <TriangleAlert aria-hidden="true" />
          <span>{t(estado === "parcial" ? "fase.parcial" : "fase.cancelada")}</span>
        </p>
      ) : null}
      {controlador.outroSeparadorEmTeste ? (
        <p className={estilos.aviso} role="status">
          <TriangleAlert aria-hidden="true" />
          <span>{t("erro.outroSeparador")}</span>
        </p>
      ) : null}

      <fieldset className={`${estilos.perfis} naoImprimir`} disabled={ocupado}>
        <legend>{t("perfil.rotulo")}</legend>
        <div className={estilos.opcoes}>
          {[...PERFIS.map((p) => p.id), ID_PERFIL_PERSONALIZADO].map((id) => (
            <label key={id} className={estilos.opcao}>
              <input
                type="radio"
                name="perfil"
                value={id}
                checked={instantaneo.perfilId === id}
                onChange={() => controlador.escolherPerfil(id)}
              />
              <span>{t(`perfil.${id}.nome` as Chave)}</span>
            </label>
          ))}
        </div>

        {instantaneo.perfilId === ID_PERFIL_PERSONALIZADO ? (
          <div className={estilos.nivel}>
            <label htmlFor="nivelPersonalizado">{t("perfil.nivel")}</label>
            <select
              id="nivelPersonalizado"
              value={instantaneo.nivelPersonalizado}
              onChange={(e) => controlador.escolherNivel(e.target.value as NivelPersonalizado)}
            >
              {NIVEIS.map((n) => (
                <option key={n} value={n}>
                  {t(`perfil.nivel.${n}` as Chave)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <p className={estilos.descricao}>{t(perfil.chaveDescricao as Chave)}</p>
        <p className={`${estilos.estimativa} numeros`}>
          {t("perfil.estimativa", {
            pedidos: perfil.totalPedidos,
            descida: bytes(perfil.bytesMaximosDescida),
            subida: bytes(perfil.bytesMaximosSubida),
            duracao: t("perfil.duracao", {
              min: perfil.duracaoEstimadaSeg[0],
              max: perfil.duracaoEstimadaSeg[1],
            }),
          })}
        </p>

        {precisaAviso ? (
          <div className={estilos.aviso} role="alert">
            <ShieldAlert aria-hidden="true" />
            <div className={estilos.avisoCorpo}>
              <p>{t("perfil.aviso")}</p>
              <Botao data-testid="confirmarDados" onClick={aoConfirmarAviso}>
                {t("acao.confirmarDados")}
              </Botao>
            </div>
          </div>
        ) : null}
      </fieldset>
    </div>
  );
}

function Pista({
  canal,
  rotulo,
  valor,
  texto,
  icone,
}: {
  canal: "descida" | "subida";
  rotulo: string;
  valor: number | null;
  texto: string;
  icone: ReactNode;
}) {
  return (
    <div className={`${estilos.pista} ${estilos[canal]}`}>
      <div className={estilos.pistaCabeca}>
        <span className={estilos.pistaRotulo}>
          <span aria-hidden="true" className={estilos.pistaIcone}>
            {icone}
          </span>
          {rotulo}
        </span>
        <span className={`${estilos.pistaValor} numeros`}>{texto}</span>
      </div>
      <div className={estilos.trilho} role="img" aria-label={`${rotulo}: ${texto}`}>
        <div
          className={estilos.enchimento}
          style={{ transform: `scaleX(${posicaoNaRegua(valor)})` }}
        />
        <div
          className={estilos.agulha}
          style={{ insetInlineStart: `${posicaoNaRegua(valor) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Leitura({
  canal,
  icone,
  rotulo,
  valor,
  unidade,
  casas,
}: {
  canal: "descida" | "subida" | "latencia";
  icone: ReactNode;
  rotulo: string;
  valor: number | null;
  unidade: string;
  casas: number;
}) {
  const { numero, t } = useI18n();
  return (
    <div className={`${estilos.leituraItem} ${estilos[canal]}`}>
      <dt>
        <span aria-hidden="true" className={estilos.leituraIcone}>
          {icone}
        </span>
        {rotulo}
      </dt>
      <dd className="numeros">
        {valor === null ? (
          <span className={estilos.semValor}>{t("unidade.indisponivel")}</span>
        ) : (
          <>
            <span className={estilos.leituraNumero}>{numero(valor, casas)}</span>
            <span className={estilos.leituraUnidade}>{unidade}</span>
          </>
        )}
      </dd>
    </div>
  );
}
