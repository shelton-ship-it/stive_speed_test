/**
 * Contrato do motor de medição. A interface depende apenas deste contrato,
 * o que permite trocar ou complementar o fornecedor sem reescrever a interface.
 */
import type { FaseMedicao, LeituraAoVivo, Sessao } from "./tipos";

export type EventosMotor = {
  aoMudarFase?: (fase: FaseMedicao, indice: number, total: number) => void;
  aoProgredir?: (leitura: LeituraAoVivo) => void;
  aoConcluir?: (sessao: Sessao) => void;
  /** Sessão com dados parciais quando o teste foi cancelado ou falhou com métricas válidas. */
  aoReceberParciais?: (sessao: Sessao) => void;
  aoFalhar?: (mensagem: string, estadoHttp?: number) => void;
};

export interface MotorMedicao {
  readonly nome: string;
  readonly versao: string;
  /** Inicia a medição. Nunca é chamado automaticamente. */
  iniciar(): void;
  /** Pausa se suportado; devolve false caso contrário. */
  pausar(): boolean;
  retomar(): boolean;
  /** Interrompe o que for possível. O resultado nunca é apresentado como completo. */
  cancelar(): void;
  /** Remove handlers e liberta recursos. */
  libertar(): void;
}
