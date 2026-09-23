import { CapturePanel } from "@/components/pal/capture";
import { MindWorkspace } from "@/components/pal/mind-workspace";
import { VoiceDevChat } from "@/components/pal/voice-dev-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePal } from "@/lib/pal/store";
import { getIntegrationStatus, type ProviderStatus } from "@/lib/conv-map/integrations.functions";
import { useEffect, useState } from "react";
import { Puzzle } from "lucide-react";

export function HomeScreen() {
  const tasks = usePal((s) => s.tasks);
  const convos = usePal((s) => s.conversations);
  const setTab = usePal((s) => s.setTab);
  const today = tasks.filter((t) => t.status === "today" || t.status === "overdue");
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">What is happening</p>
        <h1 className="font-display text-3xl font-medium tracking-tight">PAL</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Memory, relationships, work. The mind map is a projection of structured memory — not an LLM doodle.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
          <CardDescription>{today.length} items need a human.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {today.map((t) => (
            <button key={t.id} type="button" className="block w-full text-left" onClick={() => setTab("work")}>
              {t.title}
              <span className="ml-2 text-muted-foreground">{t.status}</span>
            </button>
          ))}
        </CardContent>
      </Card>
      <Card className="cursor-pointer" onClick={() => setTab("voice")}>
        <CardHeader>
          <CardTitle>Voice development</CardTitle>
          <CardDescription>
            Talk through an unfinished idea. Mic + control words. Exploration only — no side effects.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mind map</CardTitle>
          <CardDescription>Musa · Cement · ₦8,500 · Friday. Expand for the full graph.</CardDescription>
        </CardHeader>
        <CardContent>
          <MindWorkspace compact />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent memory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {convos.slice(0, 3).map((c) => (
            <p key={c.id}>
              <span className="font-mono text-xs text-muted-foreground">{c.date}</span> {c.title} — {c.summary}
            </p>
          ))}
        </CardContent>
      </Card>
      <CapturePanel />
    </div>
  );
}

export function MemoryScreen() {
  const convos = usePal((s) => s.conversations);
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">What happened</p>
        <h1 className="font-display text-3xl font-medium tracking-tight">Memory</h1>
      </header>
      <MindWorkspace />
      <ul className="space-y-3">
        {convos.map((c) => (
          <li key={c.id} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-mono text-muted-foreground">{c.date}</p>
            <p className="font-medium">{c.title}</p>
            <p className="text-sm text-muted-foreground">{c.summary}</p>
          </li>
        ))}
      </ul>
      <CapturePanel />
    </div>
  );
}

export function WorkScreen() {
  const tasks = usePal((s) => s.tasks);
  const groups = ["overdue", "today", "upcoming", "waiting", "promise"] as const;
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">What needs to happen</p>
        <h1 className="font-display text-3xl font-medium tracking-tight">Work</h1>
      </header>
      {groups.map((g) => {
        const items = tasks.filter((t) => t.status === g);
        if (!items.length) return null;
        return (
          <section key={g}>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{g}</h2>
            <ul className="space-y-2">
              {items.map((t) => (
                <li key={t.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  {t.title}
                  {t.due ? <span className="ml-2 font-mono text-xs text-muted-foreground">{t.due}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function VoiceScreen() {
  return <VoiceDevChat compact />;
}

export function SkillsScreen() {
  const reset = usePal((s) => s.resetSeed);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [key, setKey] = useState("");
  useEffect(() => {
    void getIntegrationStatus().then(setStatus);
    try {
      setKey(localStorage.getItem("convmap.openrouterKey") ?? "");
    } catch {
      /* ignore */
    }
  }, []);
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">What PAL can do</p>
        <h1 className="font-display text-3xl font-medium tracking-tight">Skills</h1>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="size-4 text-muted-foreground" />
            Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant={status?.openrouterEnv || key ? "positive" : "outline"}>OpenRouter free</Badge>
          <Badge variant={status?.svixEnv ? "positive" : "outline"}>Svix webhooks</Badge>
          <Badge variant={status?.xaiEnv ? "positive" : "outline"}>Speech transcription</Badge>
          <Badge variant="outline">WhatsApp</Badge>
          <Badge variant="outline">Calendar</Badge>
          <Badge variant="outline">Inventory</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>OpenRouter</CardTitle>
          <CardDescription>Free model router for map questions when you want a second read. Key stays in this browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            type="password"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              try {
                localStorage.setItem("convmap.openrouterKey", e.target.value);
              } catch {
                /* ignore */
              }
            }}
            placeholder="sk-or-…"
          />
          <p className="text-xs text-muted-foreground">
            {status?.openrouterEnv ? "Server already has OPENROUTER_API_KEY." : "Paste a free-tier OpenRouter key to use openrouter/free."}
          </p>
        </CardContent>
      </Card>
      <Button variant="secondary" onClick={reset}>
        Reset demo memory
      </Button>
    </div>
  );
}
