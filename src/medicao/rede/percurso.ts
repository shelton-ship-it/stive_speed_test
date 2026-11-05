/**
 * Percurso do teste: local aproximado da pessoa (a partir do endereço IP) e
 * servidor de teste que respondeu. Com os dois pontos calculam-se a distância
 * e o mínimo físico da latência. Nada é inventado: sem dados válidos, o
 * resultado é null e a interface mostra "indisponível".
 */

export type Ponto = { lat: number; lon: number };

export type Percurso = {
  cliente: {
    ponto: Ponto | null;
    cidade: string | null;
    pais: string | null;
    /** Rede indicada pelo endereço IP, por exemplo o nome do operador. */
    rede: string | null;
  };
  servidor: { ponto: Ponto | null; iata: string | null; cidade: string | null };
  distanciaKm: number | null;
};

export type ResumoRede = {
  localCidade: string | null;
  localPais: string | null;
  servidorIata: string | null;
  servidorCidade: string | null;
  distanciaKm: number | null;
  rede: string | null;
};

const RAIO_TERRA_KM = 6371;
/** A luz na fibra óptica percorre cerca de 200 mil km por segundo. */
const KM_POR_MS_NA_FIBRA = 200;

const ORIGEM = (import.meta.env.VITE_ORIGEM_MEDICAO ?? "").trim().replace(/\/+$/, "");

export function origemConfigurada(): boolean {
  return ORIGEM.length > 0;
}

/** Distância pelo círculo máximo (fórmula de haversine), em quilómetros. */
export function distanciaEntre(a: Ponto, b: Ponto): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAIO_TERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Menor latência de ida e volta possível para uma distância, em ms. */
export function minimoTeoricoMs(distanciaKm: number): number {
  return (2 * distanciaKm) / KM_POR_MS_NA_FIBRA;
}

function numeroOuNull(v: unknown): number | null {
  const n = typeof v === "string" ? Number.parseFloat(v) : typeof v === "number" ? v : Number.NaN;
  return Number.isFinite(n) ? n : null;
}

function textoOuNull(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : null;
}

function pontoValido(lat: unknown, lon: unknown): Ponto | null {
  const la = numeroOuNull(lat);
  const lo = numeroOuNull(lon);
  if (la === null || lo === null) return null;
  if (la < -90 || la > 90 || lo < -180 || lo > 180) return null;
  if (la === 0 && lo === 0) return null; // coordenada de omissão, não é um local real
  return { lat: la, lon: lo };
}

type Buscar = (url: string, init?: RequestInit) => Promise<Response>;

async function lerJson(buscar: Buscar, url: string, sinal: AbortSignal): Promise<unknown> {
  const resposta = await buscar(url, { signal: sinal, cache: "no-store", credentials: "omit" });
  if (!resposta.ok) throw new Error(`estado ${resposta.status}`);
  return resposta.json();
}

/** Interpreta as duas respostas. Exportada para ser testada sem rede. */
export function interpretarPercurso(meta: unknown, locais: unknown): Percurso | null {
  if (!meta || typeof meta !== "object") return null;
  const m = meta as Record<string, unknown>;
  const clientePonto = pontoValido(m.latitude, m.longitude);
  const iata = textoOuNull(m.colo)?.toUpperCase() ?? null;

  let servidorPonto: Ponto | null = null;
  let servidorCidade: string | null = null;
  if (iata && Array.isArray(locais)) {
    const achado = locais.find(
      (l): l is Record<string, unknown> =>
        !!l &&
        typeof l === "object" &&
        String((l as Record<string, unknown>).iata).toUpperCase() === iata,
    );
    if (achado) {
      servidorPonto = pontoValido(achado.lat, achado.lon);
      servidorCidade = textoOuNull(achado.city);
    }
  }

  if (!clientePonto && !servidorPonto && !iata) return null;
  return {
    cliente: {
      ponto: clientePonto,
      cidade: textoOuNull(m.city),
      pais: textoOuNull(m.country),
      rede: textoOuNull(m.asOrganization),
    },
    servidor: { ponto: servidorPonto, iata, cidade: servidorCidade },
    distanciaKm:
      clientePonto && servidorPonto
        ? Math.round(distanciaEntre(clientePonto, servidorPonto))
        : null,
  };
}

export type OpcoesPercurso = { origem?: string; buscar?: Buscar; tempoLimiteMs?: number };

/** Obtém o percurso. Devolve null em qualquer falha: a medição nunca depende disto. */
export async function obterPercurso(opcoes: OpcoesPercurso = {}): Promise<Percurso | null> {
  const origem = (opcoes.origem ?? ORIGEM).replace(/\/+$/, "");
  if (!origem) return null;
  const buscar: Buscar = opcoes.buscar ?? ((url, init) => fetch(url, init));
  const controlo = new AbortController();
  const temporizador = setTimeout(() => controlo.abort(), opcoes.tempoLimiteMs ?? 6000);
  try {
    const [meta, locais] = await Promise.all([
      lerJson(buscar, `${origem}/meta`, controlo.signal),
      lerJson(buscar, `${origem}/locations`, controlo.signal).catch(() => null),
    ]);
    return interpretarPercurso(meta, locais);
  } catch {
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}

export function resumirRede(p: Percurso): ResumoRede {
  return {
    localCidade: p.cliente.cidade,
    localPais: p.cliente.pais,
    servidorIata: p.servidor.iata,
    servidorCidade: p.servidor.cidade,
    distanciaKm: p.distanciaKm,
    rede: p.cliente.rede,
  };
}
