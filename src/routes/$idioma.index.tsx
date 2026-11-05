import { createFileRoute } from "@tanstack/react-router";
import { Inicio } from "@/paginas/Inicio";

export const Route = createFileRoute("/$idioma/")({ component: Inicio });
