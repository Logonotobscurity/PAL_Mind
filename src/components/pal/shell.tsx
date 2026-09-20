import { HomeScreen, MemoryScreen, SkillsScreen, WorkScreen } from "@/components/pal/screens";
import { usePal, type Tab } from "@/lib/pal/store";
import { cn } from "@/lib/utils";
import { CheckSquare, Home, MessageSquare, Puzzle } from "lucide-react";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "memory", label: "Memory", icon: MessageSquare },
  { id: "work", label: "Work", icon: CheckSquare },
  { id: "skills", label: "Skills", icon: Puzzle },
];

export function PalShell() {
  const tab = usePal((s) => s.tab);
  const setTab = usePal((s) => s.setTab);
  const graphOpen = usePal((s) => s.graphOpen);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {tab === "home" ? <HomeScreen /> : null}
        {tab === "memory" ? <MemoryScreen /> : null}
        {tab === "work" ? <WorkScreen /> : null}
        {tab === "skills" ? <SkillsScreen /> : null}
      </div>
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur",
          graphOpen && "hidden",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                    on ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={on ? 2.2 : 1.7} />
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
