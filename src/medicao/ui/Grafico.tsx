import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "../textos/useI18n";
import estilos from "./Grafico.module.css";

export type CorSerie = "descida" | "subida" | "latencia" | "aviso";
export type Ponto = { x: number; y: number };
export type Serie = { id: string; rotulo: string; cor: CorSerie; pontos: Ponto[] };

type Props = {
  titulo: string;
  series: Serie[];
  unidade: string;
  /** Texto do eixo horizontal, por exemplo "segundos". */
  rotuloX: string;
  altura?: number;
  /** Se verdadeiro, mostra a mensagem de vazio por cima do desenho. */
  mensagemVazio?: string;
  /** Converte x em texto para o tooltip (por omissão, o número formatado). */
  formatarX?: (x: number) => string;
};

const MARGEM = { topo: 12, direita: 14, fundo: 28, esquerda: 46 };

/** Passo "redondo" para os eixos: 1, 2, 2,5, 5 ou 10 vezes uma potência de dez. */
function passoRedondo(intervalo: number, alvo: number): number {
  const bruto = intervalo / Math.max(alvo, 1);
  const potencia = 10 ** Math.floor(Math.log10(bruto || 1));
  const fracao = bruto / potencia;
  const base = fracao <= 1 ? 1 : fracao <= 2 ? 2 : fracao <= 2.5 ? 2.5 : fracao <= 5 ? 5 : 10;
  return base * potencia;
}

export function Grafico({
  titulo,
  series,
  unidade,
  rotuloX,
  altura = 220,
  mensagemVazio,
  formatarX,
}: Props) {
  const { t, numero } = useI18n();
  const id = useId().replace(/:/g, "");
  const caixa = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(640);
  const [cursor, setCursor] = useState<number | null>(null);

  useEffect(() => {
    const el = caixa.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver(([entrada]) => {
      const l = Math.round(entrada.contentRect.width);
      if (l > 0) setLargura(l);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const todos = useMemo(() => series.flatMap((s) => s.pontos), [series]);
  const vazio = todos.length === 0;

  const dominio = useMemo(() => {
    if (vazio) return { x0: 0, x1: 60, y1: 100, passoY: 25 };
    const xs = todos.map((p) => p.x);
    const x0 = Math.min(...xs);
    let x1 = Math.max(...xs);
    if (x1 === x0) x1 = x0 + 1;
    const maxY = Math.max(...todos.map((p) => p.y), 1);
    const passoY = passoRedondo(maxY, 4);
    const y1 = Math.ceil((maxY * 1.05) / passoY) * passoY;
    return { x0, x1, y1, passoY };
  }, [todos, vazio]);

  const w = largura - MARGEM.esquerda - MARGEM.direita;
  const h = altura - MARGEM.topo - MARGEM.fundo;
  const sx = (x: number) => MARGEM.esquerda + ((x - dominio.x0) / (dominio.x1 - dominio.x0)) * w;
  const sy = (y: number) => MARGEM.topo + h - (y / dominio.y1) * h;

  const ticksY: number[] = [];
  for (let v = 0; v <= dominio.y1 + 1e-9; v += dominio.passoY) ticksY.push(v);
  const passoX = passoRedondo(dominio.x1 - dominio.x0, Math.max(2, Math.floor(w / 90)));
  const ticksX: number[] = [];
  for (let v = Math.ceil(dominio.x0 / passoX) * passoX; v <= dominio.x1 + 1e-9; v += passoX)
    ticksX.push(v);

  const caminho = (pontos: Ponto[]) =>
    pontos
      .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`)
      .join(" ");
  const area = (pontos: Ponto[]) =>
    pontos.length < 2
      ? ""
      : `${caminho(pontos)} L${sx(pontos[pontos.length - 1].x).toFixed(1)} ${sy(0).toFixed(1)} L${sx(pontos[0].x).toFixed(1)} ${sy(0).toFixed(1)} Z`;

  const aoMover = (e: React.PointerEvent<SVGSVGElement>) => {
    if (vazio) return;
    const caixaSvg = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - caixaSvg.left;
    const x = dominio.x0 + ((px - MARGEM.esquerda) / w) * (dominio.x1 - dominio.x0);
    setCursor(Math.min(dominio.x1, Math.max(dominio.x0, x)));
  };

  const valoresNoCursor = useMemo(() => {
    if (cursor === null) return [];
    return series
      .map((s) => {
        if (s.pontos.length === 0) return null;
        let melhor = s.pontos[0];
        for (const p of s.pontos)
          if (Math.abs(p.x - cursor) < Math.abs(melhor.x - cursor)) melhor = p;
        return { serie: s, ponto: melhor };
      })
      .filter((v): v is { serie: Serie; ponto: Ponto } => v !== null);
  }, [cursor, series]);

  const resumo = vazio
    ? titulo
    : t("grafico.resumo", {
        titulo,
        min: `${numero(Math.min(...todos.map((p) => p.y)), 1)} ${unidade}`,
        max: `${numero(Math.max(...todos.map((p) => p.y)), 1)} ${unidade}`,
        ultimo: `${numero(todos[todos.length - 1].y, 1)} ${unidade}`,
      });

  const xGuia = valoresNoCursor.length ? sx(valoresNoCursor[0].ponto.x) : null;

  return (
    <div className={estilos.grafico} ref={caixa} style={{ blockSize: altura }}>
      <svg
        width={largura}
        height={altura}
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label={resumo}
        onPointerMove={aoMover}
        onPointerLeave={() => setCursor(null)}
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.id} id={`${id}${s.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0"
                className={`${estilos.paragem} ${estilos[s.cor]}`}
                stopOpacity="0.28"
              />
              <stop offset="1" className={`${estilos.paragem} ${estilos[s.cor]}`} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {ticksY.map((v) => (
          <g key={`y${v}`}>
            <line
              className={estilos.grelha}
              x1={MARGEM.esquerda}
              x2={largura - MARGEM.direita}
              y1={sy(v)}
              y2={sy(v)}
            />
            <text className={estilos.rotulo} x={MARGEM.esquerda - 8} y={sy(v) + 4} textAnchor="end">
              {numero(v, 1)}
            </text>
          </g>
        ))}
        {ticksX.map((v) => (
          <text
            key={`x${v}`}
            className={estilos.rotulo}
            x={sx(v)}
            y={altura - 8}
            textAnchor="middle"
          >
            {numero(v, 1)}
          </text>
        ))}

        {series.map((s) =>
          s.pontos.length === 0 ? null : (
            <g key={s.id}>
              <path d={area(s.pontos)} fill={`url(#${id}${s.id})`} />
              <path
                d={caminho(s.pontos)}
                className={`${estilos.linha} ${estilos[`traco_${s.cor}`]}`}
              />
              {s.pontos.length === 1 ? (
                <circle
                  cx={sx(s.pontos[0].x)}
                  cy={sy(s.pontos[0].y)}
                  r={3.5}
                  className={estilos[`ponto_${s.cor}`]}
                />
              ) : null}
            </g>
          ),
        )}

        {xGuia !== null ? (
          <g>
            <line
              className={estilos.guia}
              x1={xGuia}
              x2={xGuia}
              y1={MARGEM.topo}
              y2={MARGEM.topo + h}
            />
            {valoresNoCursor.map(({ serie, ponto }) => (
              <circle
                key={serie.id}
                cx={sx(ponto.x)}
                cy={sy(ponto.y)}
                r={4}
                className={estilos[`ponto_${serie.cor}`]}
              />
            ))}
          </g>
        ) : null}
      </svg>

      <span className={estilos.eixo}>{rotuloX}</span>

      {valoresNoCursor.length > 0 && xGuia !== null ? (
        <div
          className={estilos.dica}
          style={{ insetInlineStart: Math.min(Math.max(xGuia + 12, 8), largura - 170) }}
          aria-hidden="true"
        >
          <strong className="numeros">
            {formatarX
              ? formatarX(valoresNoCursor[0].ponto.x)
              : numero(valoresNoCursor[0].ponto.x, 1)}
          </strong>
          {valoresNoCursor.map(({ serie, ponto }) => (
            <span key={serie.id} className={`${estilos.itemDica} numeros`}>
              <i className={`${estilos.chave} ${estilos[`fundo_${serie.cor}`]}`} />
              {serie.rotulo}: {numero(ponto.y, 1)} {unidade}
            </span>
          ))}
        </div>
      ) : null}

      {vazio && mensagemVazio ? <p className={estilos.vazio}>{mensagemVazio}</p> : null}
    </div>
  );
}

/** Legenda partilhada pelos gráficos de várias séries. */
export function LegendaSeries({ series }: { series: Array<Pick<Serie, "id" | "rotulo" | "cor">> }) {
  return (
    <ul className={estilos.legenda}>
      {series.map((s) => (
        <li key={s.id}>
          <i className={`${estilos.chave} ${estilos[`fundo_${s.cor}`]}`} />
          {s.rotulo}
        </li>
      ))}
    </ul>
  );
}
