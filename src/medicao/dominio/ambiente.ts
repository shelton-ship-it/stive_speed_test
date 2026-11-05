/**
 * Contexto do navegador. Apenas informação fiável e não invasiva;
 * nunca se inventa operadora, tipo de rede ou localização.
 */

export type AmbienteNavegador = {
  navegador: string | null;
  sistema: string | null;
  tipoLigacao: string | null;
};

type NavegadorComLigacao = Navigator & { connection?: { effectiveType?: string } };

export function recolherAmbiente(
  nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined,
): AmbienteNavegador {
  if (!nav) return { navegador: null, sistema: null, tipoLigacao: null };
  const ua = nav.userAgent || "";
  const ligacao = (nav as NavegadorComLigacao).connection;
  const tipo =
    ligacao && typeof ligacao.effectiveType === "string" && ligacao.effectiveType
      ? ligacao.effectiveType
      : null;
  return {
    navegador: detetarNavegador(ua),
    sistema: detetarSistema(ua, nav.platform ?? ""),
    tipoLigacao: tipo,
  };
}

export function detetarNavegador(ua: string): string | null {
  if (!ua) return null;
  // A ordem importa: Edge e Chrome declaram-se também como Safari e Chrome.
  const regras: Array<[RegExp, string]> = [
    [/Edg\/([\d.]+)/, "Edge"],
    [/OPR\/([\d.]+)/, "Opera"],
    [/Firefox\/([\d.]+)/, "Firefox"],
    [/Chrome\/([\d.]+)/, "Chrome"],
    [/Version\/([\d.]+).*Safari/, "Safari"],
  ];
  for (const [regra, nome] of regras) {
    const m = regra.exec(ua);
    if (m) return `${nome} ${m[1].split(".")[0]}`;
  }
  return null;
}

export function detetarSistema(ua: string, plataforma: string): string | null {
  if (!ua && !plataforma) return null;
  if (/Windows/.test(ua)) return "Windows";
  const android = /Android ([\d.]+)/.exec(ua);
  if (android) return `Android ${android[1].split(".")[0]}`;
  if (/(iPhone|iPad|iPod)/.test(ua)) return "iOS";
  const mac = /Mac OS X ([\d_.]+)/.exec(ua);
  if (mac) return `macOS ${mac[1].replace(/_/g, ".").split(".").slice(0, 2).join(".")}`;
  if (/Linux/.test(ua) || /Linux/.test(plataforma)) return "Linux";
  return null;
}
