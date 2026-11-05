import estilos from "./Marca.module.css";

/**
 * Logótipo da marca no cabeçalho. Basta substituir public/stive.svg pelo ficheiro
 * oficial. O espaço tem tamanho fixo para o cabeçalho não saltar ao carregar, e o
 * logótipo ajusta-se a ele sem deformar.
 */
export function Marca({ rotulo }: { rotulo: string }) {
  return (
    <span className={estilos.marca}>
      <img
        src="/stive.svg"
        alt={rotulo}
        width={168}
        height={40}
        decoding="async"
        fetchPriority="high"
      />
    </span>
  );
}
