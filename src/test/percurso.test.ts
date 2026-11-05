import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  distanciaEntre,
  interpretarPercurso,
  minimoTeoricoMs,
  obterPercurso,
  type Percurso,
} from "@/medicao/rede/percurso";
import { ControladorMedicao } from "@/medicao/estado/controlador";
import { MotorSimulado } from "./motorSimulado";

const META = {
  city: "Maputo",
  country: "MZ",
  latitude: "-25.96553",
  longitude: "32.58322",
  colo: "jnb",
  asOrganization: "Rede de exemplo",
};
const LOCAIS = [
  { iata: "CPT", lat: -33.96, lon: 18.6, city: "Cape Town" },
  { iata: "JNB", lat: -26.14, lon: 28.24, city: "Johannesburg" },
];

describe("percurso", () => {
  it("calcula a distância real entre Maputo e Joanesburgo", () => {
    const km = distanciaEntre({ lat: -25.96553, lon: 32.58322 }, { lat: -26.14, lon: 28.24 });
    expect(km).toBeGreaterThan(430);
    expect(km).toBeLessThan(450);
  });

  it("o mínimo teórico é o dobro do tempo de ida a 200 mil km por segundo", () => {
    expect(minimoTeoricoMs(1000)).toBe(10);
    expect(minimoTeoricoMs(0)).toBe(0);
  });

  it("junta local, servidor e distância", () => {
    const p = interpretarPercurso(META, LOCAIS) as Percurso;
    expect(p.cliente.cidade).toBe("Maputo");
    expect(p.cliente.rede).toBe("Rede de exemplo");
    expect(p.servidor.iata).toBe("JNB");
    expect(p.servidor.cidade).toBe("Johannesburg");
    expect(p.distanciaKm).toBeGreaterThan(430);
  });

  it("sem lista de servidores mantém o local e não inventa o servidor", () => {
    const p = interpretarPercurso(META, null) as Percurso;
    expect(p.cliente.ponto).not.toBeNull();
    expect(p.servidor.ponto).toBeNull();
    expect(p.distanciaKm).toBeNull();
  });

  it("rejeita coordenadas inválidas e a coordenada de omissão", () => {
    const p = interpretarPercurso({ ...META, latitude: "0", longitude: "0", colo: "" }, LOCAIS);
    expect(p).toBeNull();
    expect(
      interpretarPercurso({ ...META, latitude: "999", longitude: "10", colo: "" }, []),
    ).toBeNull();
    expect(interpretarPercurso("lixo", [])).toBeNull();
  });
});

describe("obterPercurso", () => {
  it("devolve null sem origem configurada e em falha de rede", async () => {
    expect(await obterPercurso({ origem: "" })).toBeNull();
    const falha = vi.fn().mockRejectedValue(new Error("sem rede"));
    expect(await obterPercurso({ origem: "https://exemplo.test", buscar: falha })).toBeNull();
  });

  it("pede os dois recursos sem credenciais e usa o resultado", async () => {
    const buscar = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => (url.endsWith("/meta") ? META : LOCAIS),
    })) as unknown as typeof fetch;
    const p = await obterPercurso({ origem: "https://exemplo.test/", buscar });
    expect(p?.servidor.iata).toBe("JNB");
    const chamadas = (buscar as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(chamadas.map((c) => c[0])).toEqual([
      "https://exemplo.test/meta",
      "https://exemplo.test/locations",
    ]);
    expect(chamadas[0][1]).toMatchObject({ credentials: "omit" });
  });
});

describe("controlador com percurso", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("só pede o percurso ao iniciar e junta-o à sessão guardada", async () => {
    const percurso = interpretarPercurso(META, LOCAIS) as Percurso;
    const buscar = vi.fn(async () => percurso);
    const c = new ControladorMedicao(({ eventos }) => new MotorSimulado(eventos), buscar);
    expect(buscar).not.toHaveBeenCalled();
    expect(c.obterInstantaneo().estadoPercurso).toBe("inativo");

    c.iniciar();
    await vi.advanceTimersByTimeAsync(10);
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(c.obterInstantaneo().estadoPercurso).toBe("pronto");

    await vi.advanceTimersByTimeAsync(6000);
    const sessao = c.obterInstantaneo().sessao;
    expect(c.obterInstantaneo().estado).toBe("concluido");
    expect(sessao?.rede?.servidorIata).toBe("JNB");
    expect(sessao?.rede?.localCidade).toBe("Maputo");
  });

  it("falha do percurso não afeta o teste", async () => {
    const c = new ControladorMedicao(
      ({ eventos }) => new MotorSimulado(eventos),
      async () => null,
    );
    c.iniciar();
    await vi.advanceTimersByTimeAsync(6000);
    expect(c.obterInstantaneo().estadoPercurso).toBe("indisponivel");
    expect(c.obterInstantaneo().estado).toBe("concluido");
    expect(c.obterInstantaneo().sessao?.rede).toBeUndefined();
  });
});
