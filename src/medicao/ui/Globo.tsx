import { useEffect, useRef } from "react";
import {
  geoArea,
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import type { FaseMedicao } from "../motor/tipos";
import type { Percurso } from "../rede/percurso";
import { usePreferencias } from "../estado/preferencias";
import estilos from "./Globo.module.css";

type Props = {
  percurso: Percurso | null;
  fase: FaseMedicao;
  /** Velocidade do canal em medição, em Mbps, que controla o ritmo dos pulsos. */
  mbps: number | null;
  rotulo: string;
  dica: string;
};

type Cores = Record<
  | "esfera"
  | "terra"
  | "grelha"
  | "contorno"
  | "descida"
  | "subida"
  | "latencia"
  | "tinta"
  | "acento",
  string
>;

type TerraGeo = { type: "MultiPolygon"; coordinates: number[][][][] };

const PI2 = Math.PI * 2;

/** Fecha o anel e garante a orientação que a projeção esférica espera. */
function prepararTerra(aneis: number[][][]): TerraGeo {
  const poligonos = aneis.map((anel) => {
    const fechado =
      anel[0][0] === anel[anel.length - 1][0] && anel[0][1] === anel[anel.length - 1][1]
        ? anel
        : [...anel, anel[0]];
    const area = geoArea({ type: "Polygon", coordinates: [fechado] });
    return [area > PI2 ? [...fechado].reverse() : fechado];
  });
  return { type: "MultiPolygon", coordinates: poligonos };
}

function lerCores(): Cores {
  const css = getComputedStyle(document.documentElement);
  const v = (nome: string) => css.getPropertyValue(nome).trim();
  return {
    esfera: v("--superficieAlta"),
    terra: v("--linhaForte"),
    grelha: v("--linha"),
    contorno: v("--linhaForte"),
    descida: v("--descida"),
    subida: v("--subida"),
    latencia: v("--latencia"),
    tinta: v("--tinta"),
    acento: v("--acento"),
  };
}

function direcaoDaFase(fase: FaseMedicao): "descida" | "subida" | "latencia" | null {
  if (fase === "descida") return "descida";
  if (fase === "subida") return "subida";
  if (fase === "latencia" || fase === "perdaPacotes") return "latencia";
  return null;
}

/**
 * Globo que mostra o percurso real do teste: o local aproximado, o servidor que
 * respondeu e o arco entre eles. Os pulsos só aparecem enquanto há tráfego, vão
 * no sentido real dos dados (download chega, upload sai) e aceleram com a
 * velocidade medida. Sem percurso, o globo apenas roda em repouso.
 */
export function Globo({ percurso, fase, mbps, rotulo, dica }: Props) {
  const tela = useRef<HTMLCanvasElement>(null);
  const { tema } = usePreferencias();
  // Estado de desenho num ref: o ciclo de animação lê sempre o valor mais recente
  // sem recriar o ciclo a cada leitura de velocidade.
  const vivo = useRef({ percurso, fase, mbps });
  vivo.current = { percurso, fase, mbps };
  const terra = useRef<TerraGeo | null>(null);
  const cores = useRef<Cores | null>(null);
  const redesenhar = useRef<() => void>(() => {});

  useEffect(() => {
    cores.current = lerCores();
    redesenhar.current();
  }, [tema]);

  useEffect(() => {
    const canvas = tela.current;
    if (!canvas) return;
    const contexto = canvas.getContext("2d");
    if (!contexto) return;
    const ctx: CanvasRenderingContext2D = contexto;

    let ativo = true;
    let visivel = true;
    let quadro = 0;
    let anterior = 0;
    let fasePulso = 0;
    let lado = 320;
    const rot = { lon: 20, lat: -15, zoom: 1 };
    let ultimaInteracao = -Infinity;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cores.current = lerCores();

    void import("../rede/terra.json").then((m) => {
      terra.current = prepararTerra(m.default as number[][][]);
      desenhar(0);
    });

    const medir = () => {
      const l = Math.round(canvas.getBoundingClientRect().width);
      if (l <= 0) return;
      lado = l;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(l * dpr);
      canvas.height = Math.round(l * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      desenhar(0);
    };

    function alvo() {
      const p = vivo.current.percurso;
      const c = p?.cliente.ponto;
      const s = p?.servidor.ponto;
      if (c && s) {
        const [lon, lat] = geoInterpolate([c.lon, c.lat], [s.lon, s.lat])(0.5);
        const ang = geoDistance([c.lon, c.lat], [s.lon, s.lat]);
        // Aproxima o globo para o arco ocupar boa parte do ecrã, com limite para a terra de baixa resolução.
        const zoom = Math.min(
          3.2,
          Math.max(1, 0.85 / Math.max(Math.sin(Math.min(ang, Math.PI / 2)), 0.01)),
        );
        return { lon, lat, zoom };
      }
      const unico = c ?? s;
      if (unico) return { lon: unico.lon, lat: unico.lat, zoom: 2.2 };
      return null;
    }

    function desenhar(dt: number) {
      const k = cores.current;
      if (!k || lado <= 0) return;
      const { percurso: p, fase: f, mbps: v } = vivo.current;
      const raioBase = lado / 2 - 6;
      const proj = geoOrthographic()
        .translate([lado / 2, lado / 2])
        .scale(raioBase * rot.zoom)
        .rotate([-rot.lon, -rot.lat])
        .clipAngle(90);
      const caminho = geoPath(proj, ctx);
      const esfera: GeoPermissibleObjects = { type: "Sphere" };

      ctx.clearRect(0, 0, lado, lado);
      ctx.beginPath();
      caminho(esfera);
      ctx.fillStyle = k.esfera;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      caminho(esfera);
      ctx.clip();

      ctx.beginPath();
      caminho(geoGraticule10());
      ctx.strokeStyle = k.grelha;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      if (terra.current) {
        ctx.beginPath();
        caminho(terra.current);
        ctx.fillStyle = k.terra;
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      const c = p?.cliente.ponto;
      const s = p?.servidor.ponto;
      const centro: [number, number] = [rot.lon, rot.lat];
      const visivelNoPonto = (lon: number, lat: number) =>
        geoDistance([lon, lat], centro) < Math.PI / 2 - 0.02;

      if (c && s) {
        const direcao = direcaoDaFase(f);
        const cor =
          direcao === "subida"
            ? k.subida
            : direcao === "latencia"
              ? k.latencia
              : direcao === "descida"
                ? k.descida
                : k.acento;
        ctx.beginPath();
        caminho({
          type: "LineString",
          coordinates: [
            [c.lon, c.lat],
            [s.lon, s.lat],
          ],
        });
        ctx.strokeStyle = cor;
        ctx.globalAlpha = direcao ? 0.9 : 0.6;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (direcao && !reduzido) {
          const ritmo = 0.18 + 0.22 * Math.log10(1 + Math.max(v ?? 0, 0));
          fasePulso = (fasePulso + dt * ritmo) % 1;
          const entre = geoInterpolate([c.lon, c.lat], [s.lon, s.lat]);
          const total = 5;
          for (let i = 0; i < total; i++) {
            let t = (fasePulso + i / total) % 1;
            // A latência vai e volta; a subida sai do cliente; a descida chega ao cliente.
            if (direcao === "descida") t = 1 - t;
            if (direcao === "latencia") t = t < 0.5 ? t * 2 : (1 - t) * 2;
            const [lon, lat] = entre(t);
            if (!visivelNoPonto(lon, lat)) continue;
            const xy = proj([lon, lat]);
            if (!xy) continue;
            ctx.beginPath();
            ctx.arc(xy[0], xy[1], 3.6, 0, PI2);
            ctx.fillStyle = cor;
            ctx.fill();
          }
        }
      }

      const marcador = (
        ponto: { lon: number; lat: number } | null | undefined,
        cor: string,
        anel: boolean,
      ) => {
        if (!ponto || !visivelNoPonto(ponto.lon, ponto.lat)) return;
        const xy = proj([ponto.lon, ponto.lat]);
        if (!xy) return;
        ctx.beginPath();
        ctx.arc(xy[0], xy[1], anel ? 7 : 5, 0, PI2);
        ctx.fillStyle = cor;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = k.esfera;
        ctx.stroke();
        if (anel) {
          ctx.beginPath();
          ctx.arc(xy[0], xy[1], 12, 0, PI2);
          ctx.strokeStyle = cor;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      };
      marcador(c, k.descida, true);
      marcador(s, k.tinta, false);
      ctx.restore();

      ctx.beginPath();
      caminho(esfera);
      ctx.strokeStyle = k.contorno;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    function passo(agora: number) {
      if (!ativo) return;
      const dt = anterior ? Math.min((agora - anterior) / 1000, 0.1) : 0;
      anterior = agora;
      if (visivel && !document.hidden) {
        const a = alvo();
        const livre = agora - ultimaInteracao > 5000;
        if (a && livre) {
          const suave = 1 - Math.exp(-dt * 3);
          let dLon = a.lon - rot.lon;
          dLon = ((dLon + 540) % 360) - 180;
          rot.lon += dLon * suave;
          rot.lat += (a.lat - rot.lat) * suave;
          rot.zoom += (a.zoom - rot.zoom) * suave;
        } else if (!a) {
          rot.zoom += (1 - rot.zoom) * (1 - Math.exp(-dt * 3));
          if (!reduzido && livre) rot.lon += dt * 8;
        }
        desenhar(dt);
      }
      quadro = requestAnimationFrame(passo);
    }

    redesenhar.current = () => desenhar(0);

    // Arrastar para rodar.
    let arrasto: { x: number; y: number } | null = null;
    const aoPressionar = (e: PointerEvent) => {
      arrasto = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };
    const aoMover = (e: PointerEvent) => {
      if (!arrasto) return;
      const fator = 0.45 / rot.zoom;
      rot.lon -= (e.clientX - arrasto.x) * fator;
      rot.lat = Math.max(-80, Math.min(80, rot.lat + (e.clientY - arrasto.y) * fator));
      arrasto = { x: e.clientX, y: e.clientY };
      ultimaInteracao = performance.now();
      if (reduzido) desenhar(0);
    };
    const aoSoltar = () => {
      arrasto = null;
    };
    canvas.addEventListener("pointerdown", aoPressionar);
    canvas.addEventListener("pointermove", aoMover);
    canvas.addEventListener("pointerup", aoSoltar);
    canvas.addEventListener("pointercancel", aoSoltar);

    const obsTamanho = new ResizeObserver(medir);
    obsTamanho.observe(canvas);
    const obsVisivel = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
    });
    obsVisivel.observe(canvas);
    medir();

    if (reduzido) {
      // Sem animação: posiciona de imediato no alvo e desenha por pedido.
      const a = alvo();
      if (a) Object.assign(rot, a);
      desenhar(0);
    } else {
      quadro = requestAnimationFrame(passo);
    }

    return () => {
      ativo = false;
      cancelAnimationFrame(quadro);
      obsTamanho.disconnect();
      obsVisivel.disconnect();
      canvas.removeEventListener("pointerdown", aoPressionar);
      canvas.removeEventListener("pointermove", aoMover);
      canvas.removeEventListener("pointerup", aoSoltar);
      canvas.removeEventListener("pointercancel", aoSoltar);
    };
  }, []);

  // Em movimento reduzido não há ciclo: redesenha quando o percurso muda.
  useEffect(() => {
    redesenhar.current();
  }, [percurso, fase]);

  return (
    <div className={estilos.globo}>
      <canvas ref={tela} className={estilos.tela} role="img" aria-label={rotulo} />
      <p className={estilos.dica}>{dica}</p>
    </div>
  );
}
