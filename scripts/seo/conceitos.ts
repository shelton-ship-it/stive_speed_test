/**
 * Conceitos de pesquisa: as intenções que as pessoas têm quando procuram algo
 * que o site resolve. Uma palavra chave só vale se pertencer a um conceito, e cada
 * conceito liga-se às chaves de texto que o respondem (ver mapa.ts). Os conceitos
 * sem chave associada são lacunas de conteúdo: procura que o site ainda não responde.
 *
 * Os identificadores são neutros em relação ao idioma. A descrição em inglês é
 * o que se envia à IA para ela propor termos na língua e no mercado certos,
 * em vez de traduzir literalmente.
 */

export type Intencao = "transacional" | "informacional" | "comparacao";

export type Conceito = {
  id: string;
  intencao: Intencao;
  /** 1 a 3. Quanto vale para o negócio: uma ferramenta vive de intenção transacional. */
  prioridade: 1 | 2 | 3;
  descricao: string;
};

export const CONCEITOS: readonly Conceito[] = [
  {
    id: "testarVelocidade",
    intencao: "transacional",
    prioridade: 3,
    descricao: "test my internet speed now, check my internet speed, speed test online",
  },
  {
    id: "testarNoTelemovel",
    intencao: "transacional",
    prioridade: 2,
    descricao:
      "test internet speed on a phone, check mobile data speed, wifi speed test on smartphone",
  },
  {
    id: "testarLatencia",
    intencao: "transacional",
    prioridade: 2,
    descricao: "ping test, check my latency or ping, test connection delay",
  },
  {
    id: "testarDownload",
    intencao: "transacional",
    prioridade: 1,
    descricao: "download speed test, how fast is my download speed",
  },
  {
    id: "testarUpload",
    intencao: "transacional",
    prioridade: 1,
    descricao: "upload speed test, how fast is my upload speed",
  },
  {
    id: "velocidadeBoa",
    intencao: "informacional",
    prioridade: 3,
    descricao:
      "what is a good internet speed, is my internet speed good, what is a normal internet speed",
  },
  {
    id: "quantosMbps",
    intencao: "informacional",
    prioridade: 3,
    descricao:
      "how many Mbps do I need for streaming, gaming, working from home or for a number of devices",
  },
  {
    id: "mbpsVsMBs",
    intencao: "informacional",
    prioridade: 2,
    descricao: "difference between Mbps and MB/s, megabits versus megabytes, convert Mbps to MB/s",
  },
  {
    id: "resultadoVaria",
    intencao: "informacional",
    prioridade: 2,
    descricao:
      "why speed test results are different each time, why speed is lower than the contracted plan",
  },
  {
    id: "latencia",
    intencao: "informacional",
    prioridade: 2,
    descricao: "what is latency or ping, what is a good ping, what is normal latency",
  },
  {
    id: "jitter",
    intencao: "informacional",
    prioridade: 1,
    descricao: "what is jitter in internet connections and how to reduce it",
  },
  {
    id: "perdaPacotes",
    intencao: "informacional",
    prioridade: 1,
    descricao: "what is packet loss, how to test and fix packet loss",
  },
  {
    id: "bufferbloat",
    intencao: "informacional",
    prioridade: 1,
    descricao: "bufferbloat, latency under load, internet lags when someone downloads",
  },
  {
    id: "consumoDados",
    intencao: "informacional",
    prioridade: 1,
    descricao: "how much data does a speed test use",
  },
  {
    id: "privacidade",
    intencao: "informacional",
    prioridade: 1,
    descricao: "is an online speed test safe, does it store my data or IP address",
  },
  {
    id: "resultadoFiavel",
    intencao: "informacional",
    prioridade: 2,
    descricao: "how to get an accurate speed test result, how to test internet speed correctly",
  },
  {
    id: "internetLenta",
    intencao: "informacional",
    prioridade: 3,
    descricao: "why is my internet slow, how to fix slow internet, internet keeps lagging",
  },
  {
    id: "melhorarWifi",
    intencao: "informacional",
    prioridade: 2,
    descricao: "how to improve wifi speed and signal, wifi slow at home",
  },
  {
    id: "wifiVsCabo",
    intencao: "informacional",
    prioridade: 1,
    descricao: "wifi versus ethernet cable speed, is wired faster than wifi",
  },
  {
    id: "pingJogos",
    intencao: "informacional",
    prioridade: 2,
    descricao: "what ping is good for online games, how to reduce lag in games",
  },
  {
    id: "videochamadas",
    intencao: "informacional",
    prioridade: 1,
    descricao: "internet speed needed for video calls, Zoom, Meet or Teams freezing",
  },
  {
    id: "tecnologiasRede",
    intencao: "comparacao",
    prioridade: 1,
    descricao: "4G versus 5G versus fiber versus ADSL, typical speeds of each technology",
  },
  {
    id: "comoFunciona",
    intencao: "informacional",
    prioridade: 1,
    descricao: "how does an internet speed test work and how accurate is it",
  },
  {
    id: "comparaOperadoras",
    intencao: "comparacao",
    prioridade: 1,
    descricao:
      "compare internet providers, which provider is faster, check provider speed in my area",
  },
  {
    id: "vpnEfeito",
    intencao: "informacional",
    prioridade: 1,
    descricao: "does a VPN slow down internet, speed test with and without VPN",
  },
];

export const IDS_CONCEITOS: readonly string[] = CONCEITOS.map((c) => c.id);

export function obterConceito(id: string): Conceito | undefined {
  return CONCEITOS.find((c) => c.id === id);
}
