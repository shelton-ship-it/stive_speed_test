import { createFileRoute } from "@tanstack/react-router";
import { Politicas } from "@/paginas/Politicas";

export const Route = createFileRoute("/$idioma/politicas")({ component: Politicas });
