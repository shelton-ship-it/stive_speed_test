import { useCallback, useEffect, useState } from "react";
import { Download, Eye, Trash2, Upload } from "lucide-react";
import { Botao } from "@/componentes/Botao";
import { historico, sessaoValida } from "../armazenamento/historico";
import { descarregar, exportarCopiaSeguranca, lerCopiaSeguranca } from "../exportar/formatos";
import { mbpsParaMBs } from "../dominio/estatistica";
import { valorDe, type Sessao } from "../motor/tipos";
import type { Unidade } from "../estado/preferencias";
import { useI18n } from "../textos/useI18n";
import type { Chave } from "../textos/i18n";
import { perfilBase } from "../motor/perfis";
import { Relatorio } from "./Relatorio";
import estilos from "./Historico.module.css";

export function Historico({
  chaveAtualizacao,
  unidade,
}: {
  chaveAtualizacao: string;
  unidade: Unidade;
}) {
  const { t, numero, data, bytes } = useI18n();
  const [sessoes, setSessoes] = useState<Sessao[] | null>(null);
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const [detalhe, setDetalhe] = useState<Sessao | null>(null);
  const [aConfirmar, setAConfirmar] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    void historico
      .listar()
      .then(setSessoes)
      .catch(() => setSessoes([]));
  }, []);
  useEffect(recarregar, [recarregar, chaveAtualizacao]);

  const vel = (m: number | null) => (m === null ? null : unidade === "mbs" ? mbpsParaMBs(m) : m);
  const unidadeVel = t(unidade === "mbs" ? "unidade.mbs" : "unidade.mbps");
  const celula = (valor: number | null, casas: number, sufixo: string) =>
    valor === null ? t("unidade.indisponivel") : `${numero(valor, casas)} ${sufixo}`;

  const alternar = (id: string) =>
    setMarcadas((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id].slice(-3),
    );
  const comparadas = (sessoes ?? []).filter((s) => marcadas.includes(s.id));

  async function importar(ficheiro: File | undefined) {
    if (!ficheiro) return;
    const lista = lerCopiaSeguranca(await ficheiro.text());
    if (!lista) {
      setMensagem(t("historico.ficheiroInvalido"));
      return;
    }
    let importadas = 0;
    for (const item of lista) {
      if (sessaoValida(item)) {
        await historico.guardar(item as Sessao);
        importadas++;
      }
    }
    setMensagem(t("historico.importadas", { importadas, rejeitadas: lista.length - importadas }));
    recarregar();
  }

  return (
    <div className={estilos.historico}>
      <p className={estilos.nota}>{t("historico.nota")}</p>

      {sessoes === null ? (
        <p className={estilos.nota}>{t("historico.carregando")}</p>
      ) : sessoes.length === 0 ? (
        <p className={estilos.vazio}>{t("historico.vazio")}</p>
      ) : (
        <>
          <div className={estilos.rolar}>
            <table className={estilos.tabela}>
              <thead>
                <tr>
                  <th scope="col">{t("tabela.comparar")}</th>
                  <th scope="col">{t("tabela.data")}</th>
                  <th scope="col">{t("tabela.descida")}</th>
                  <th scope="col">{t("tabela.subida")}</th>
                  <th scope="col">{t("tabela.latencia")}</th>
                  <th scope="col">{t("tabela.perfil")}</th>
                  <th scope="col">{t("tabela.estado")}</th>
                  <th scope="col">{t("tabela.acoes")}</th>
                </tr>
              </thead>
              <tbody className="numeros">
                {sessoes.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={marcadas.includes(s.id)}
                        onChange={() => alternar(s.id)}
                        aria-label={`${t("tabela.comparar")}: ${data(s.iniciadaEm)}`}
                      />
                    </td>
                    <td>{data(s.iniciadaEm)}</td>
                    <td>{celula(vel(valorDe(s.metricas.descidaMbps)), 1, unidadeVel)}</td>
                    <td>{celula(vel(valorDe(s.metricas.subidaMbps)), 1, unidadeVel)}</td>
                    <td>{celula(valorDe(s.metricas.latenciaRepousoMs), 0, "ms")}</td>
                    <td>{t(`perfil.${perfilBase(s.motor.perfilId)}.nome` as Chave)}</td>
                    <td>{t(`estado.${s.estado}` as Chave)}</td>
                    <td>
                      <div className={estilos.acoes}>
                        <Botao
                          variante="discreto"
                          icone={<Eye />}
                          onClick={() => setDetalhe(s)}
                          aria-label={`${t("acao.verDetalhes")}: ${data(s.iniciadaEm)}`}
                          title={t("acao.verDetalhes")}
                        />
                        <Botao
                          variante="discreto"
                          icone={<Trash2 />}
                          title={t("acao.eliminarSessao")}
                          aria-label={`${t("acao.eliminarSessao")}: ${data(s.iniciadaEm)}`}
                          onClick={async () => {
                            await historico.remover(s.id);
                            setMarcadas((m) => m.filter((x) => x !== s.id));
                            if (detalhe?.id === s.id) setDetalhe(null);
                            recarregar();
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={estilos.nota}>{t("historico.compararDica")}</p>

          {comparadas.length >= 2 ? (
            <section aria-label={t("historico.comparar")} className={estilos.comparacao}>
              <h3>{t("historico.comparar")}</h3>
              <div className={estilos.rolar}>
                <table className={estilos.tabela}>
                  <thead>
                    <tr>
                      <th scope="col">{t("tabela.data")}</th>
                      <th scope="col">{t("tabela.descida")}</th>
                      <th scope="col">{t("tabela.subida")}</th>
                      <th scope="col">{t("tabela.latencia")}</th>
                      <th scope="col">{t("tabela.jitter")}</th>
                      <th scope="col">{t("tabela.duracao")}</th>
                    </tr>
                  </thead>
                  <tbody className="numeros">
                    {comparadas.map((s) => (
                      <tr key={s.id}>
                        <td>{data(s.iniciadaEm)}</td>
                        <td>{celula(vel(valorDe(s.metricas.descidaMbps)), 1, unidadeVel)}</td>
                        <td>{celula(vel(valorDe(s.metricas.subidaMbps)), 1, unidadeVel)}</td>
                        <td>{celula(valorDe(s.metricas.latenciaRepousoMs), 0, "ms")}</td>
                        <td>{celula(valorDe(s.metricas.jitterRepousoMs), 0, "ms")}</td>
                        <td>
                          {s.duracaoMs === null
                            ? t("unidade.indisponivel")
                            : `${numero(s.duracaoMs / 1000, 1)} s`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <div className={estilos.ferramentas}>
            <Botao
              icone={<Download />}
              onClick={() =>
                descarregar(
                  "copiaSeguranca.json",
                  exportarCopiaSeguranca(sessoes),
                  "application/json",
                )
              }
            >
              {t("acao.exportarCopia")}
            </Botao>
            <label className={estilos.importar}>
              <Upload aria-hidden="true" />
              {t("acao.importarCopia")}
              <input
                type="file"
                accept="application/json"
                onChange={(e) => void importar(e.target.files?.[0])}
              />
            </label>
            {!aConfirmar ? (
              <Botao icone={<Trash2 />} onClick={() => setAConfirmar(true)}>
                {t("acao.limparHistorico")}
              </Botao>
            ) : (
              <span className={estilos.confirmacao} role="alert">
                <strong>{t("historico.confirmarLimpar")}</strong>
                <Botao
                  onClick={async () => {
                    await historico.limpar();
                    setAConfirmar(false);
                    setMarcadas([]);
                    setDetalhe(null);
                    recarregar();
                  }}
                >
                  {t("acao.confirmarApagar")}
                </Botao>
                <Botao variante="discreto" onClick={() => setAConfirmar(false)}>
                  {t("acao.manter")}
                </Botao>
              </span>
            )}
          </div>
        </>
      )}

      {mensagem ? (
        <p role="status" className={estilos.nota}>
          {mensagem}
        </p>
      ) : null}

      {detalhe ? (
        <section className={estilos.detalhe} aria-label={t("secao.relatorio")}>
          <div className={estilos.detalheTopo}>
            <p className={`${estilos.nota} numeros`}>{bytes(detalhe.bytesTransferidos)}</p>
            <Botao variante="discreto" onClick={() => setDetalhe(null)}>
              {t("acao.fechar")}
            </Botao>
          </div>
          <Relatorio sessao={detalhe} unidade={unidade} />
        </section>
      ) : null}
    </div>
  );
}
