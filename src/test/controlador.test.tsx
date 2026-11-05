import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ControladorMedicao } from "@/medicao/estado/controlador";
import { ProvedorI18n } from "@/medicao/textos/ProvedorI18n";
import { pt } from "@/medicao/textos/pt";
import { LOCAIS } from "@/medicao/textos/locais";
import { Painel } from "@/medicao/ui/Painel";
import { MotorSimulado } from "./motorSimulado";

const fabrica = ({ eventos }: { eventos: ConstructorParameters<typeof MotorSimulado>[0] }) =>
  new MotorSimulado(eventos);

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ControladorMedicao", () => {
  it("percorre as fases e conclui sem iniciar sozinho", async () => {
    const c = new ControladorMedicao(fabrica);
    expect(c.obterInstantaneo().estado).toBe("inativo");

    c.iniciar();
    await vi.advanceTimersByTimeAsync(10);
    expect(c.obterInstantaneo().estado).toBe("emCurso");

    await vi.advanceTimersByTimeAsync(1100);
    expect(c.obterInstantaneo().fase).toBe("latencia");
    await vi.advanceTimersByTimeAsync(1000);
    expect(c.obterInstantaneo().fase).toBe("descida");

    await vi.advanceTimersByTimeAsync(3000);
    expect(c.obterInstantaneo().estado).toBe("concluido");
    expect(c.obterInstantaneo().sessao?.estado).toBe("concluida");
  });

  it("bloqueia início duplicado", async () => {
    let criados = 0;
    const c = new ControladorMedicao((o) => {
      criados++;
      return fabrica(o);
    });
    c.iniciar();
    c.iniciar();
    await vi.advanceTimersByTimeAsync(10);
    c.iniciar();
    expect(criados).toBe(1);
  });

  it("cancelar preserva resultado parcial marcado como cancelado", async () => {
    const c = new ControladorMedicao(fabrica);
    c.iniciar();
    await vi.advanceTimersByTimeAsync(1500);
    c.cancelar();
    await vi.advanceTimersByTimeAsync(10);
    const i = c.obterInstantaneo();
    expect(i.estado).toBe("cancelado");
    expect(i.sessao?.estado).toBe("cancelada");
  });

  it("perfis com consumo elevado não alteram o estado ao escolher durante o teste", async () => {
    const c = new ControladorMedicao(fabrica);
    c.iniciar();
    await vi.advanceTimersByTimeAsync(10);
    c.escolherPerfil("preciso");
    expect(c.obterInstantaneo().perfilId).toBe("equilibrado");
  });
});

describe("Painel", () => {
  it("mostra o resultado depois de um teste e exige confirmação em perfis pesados", async () => {
    render(
      <ProvedorI18n local={LOCAIS[0]} dicionario={pt}>
        <Painel fabrica={fabrica} />
      </ProvedorI18n>,
    );

    fireEvent.click(screen.getByLabelText("Preciso"));
    const iniciar = screen.getByTestId("iniciar") as HTMLButtonElement;
    expect(iniciar.disabled).toBe(true);
    fireEvent.click(screen.getByTestId("confirmarDados"));
    expect(iniciar.disabled).toBe(false);

    fireEvent.click(screen.getByLabelText("Rápido"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("iniciar"));
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByRole("heading", { name: "Resultado", level: 2 })).toBeTruthy();
    expect(screen.getByText("Qualidade para cada uso")).toBeTruthy();
  });
});
