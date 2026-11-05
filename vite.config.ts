import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// O destino de publicação é detetado automaticamente pelo Nitro a partir do
// ambiente de build. Para forçar um destino, defina NITRO_PRESET (ex.: node_server).
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart(),
    viteReact(),
    nitro(),
  ],
});
