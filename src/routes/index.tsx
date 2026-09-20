import { createFileRoute } from "@tanstack/react-router";
import { PalShell } from "@/components/pal/shell";

export const Route = createFileRoute("/")({ component: PalShell });
