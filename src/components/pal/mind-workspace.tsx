import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraphCanvas, ViewPills } from "@/components/pal/graph-canvas";
import { InspectPanel } from "@/components/pal/inspect";
import { askMap } from "@/lib/pal/query";
import { usePal } from "@/lib/pal/store";
import { useState } from "react";

const TICKS = ["2026-09-01", "2026-09-10", "2026-09-18", "2026-09-20"];

export function MindWorkspace({ compact }: { compact?: boolean }) {
  const asOf = usePal((s) => s.asOf);
  const setAsOf = usePal((s) => s.setAsOf);
  const ask = usePal((s) => s.ask);
  const setAsk = usePal((s) => s.setAsk);
  const askAnswer = usePal((s) => s.askAnswer);
  const setAskAnswer = usePal((s) => s.setAskAnswer);
  const setView = usePal((s) => s.setView);
  const setGraphOpen = usePal((s) => s.setGraphOpen);
  const graphOpen = usePal((s) => s.graphOpen);
  const nodes = usePal((s) => s.nodes);
  const edges = usePal((s) => s.edges);
  const [focus, setFocus] = useState<string[]>([]);
  const tick = Math.max(0, TICKS.indexOf(asOf));

  function runAsk() {
    const r = askMap(ask, nodes, edges, asOf);
    setAskAnswer(r.answer);
    setFocus(r.focus);
    setView(r.view);
  }

  const body = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ViewPills />
        {compact && !graphOpen ? (
          <Button size="sm" onClick={() => setGraphOpen(true)}>
            Expand
          </Button>
        ) : graphOpen ? (
          <Button size="sm" variant="ghost" onClick={() => setGraphOpen(false)}>
            Close
          </Button>
        ) : null}
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Known as of {asOf}
        <input
          type="range"
          min={0}
          max={3}
          className="w-full accent-primary"
          value={tick}
          onChange={(e) => setAsOf(TICKS[Number(e.target.value)])}
        />
        <span className="flex justify-between font-mono">
          <span>1 Sep</span>
          <span>10 Sep</span>
          <span>18 Sep</span>
          <span>Today</span>
        </span>
      </label>
      <GraphCanvas focus={focus} />
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          placeholder="Ask this map — why has cement price increased?"
          onKeyDown={(e) => {
            if (e.key === "Enter") runAsk();
          }}
        />
        <Button type="button" onClick={runAsk}>
          Ask this map
        </Button>
      </div>
      {askAnswer ? <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">{askAnswer}</p> : null}
      <InspectPanel />
    </div>
  );

  if (graphOpen) {
    return (
      <div className="fixed inset-0 z-40 overflow-y-auto bg-background p-4 pb-28">
        <div className="mx-auto max-w-5xl">{body}</div>
      </div>
    );
  }

  return body;
}
