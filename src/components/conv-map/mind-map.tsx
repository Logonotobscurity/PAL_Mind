import { ChevronRight } from "lucide-react";
import type { MindMapData, UtteranceResult } from "@/lib/conv-map/engine";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function sentimentVariant(s: string) {
  if (s === "positive") return "positive" as const;
  if (s === "negative") return "negative" as const;
  return "default" as const;
}

function levelVariant(s: string) {
  if (s === "critical" || s === "high") return "negative" as const;
  if (s === "rising") return "warn" as const;
  return "default" as const;
}

function Leaf({ u }: { u: UtteranceResult }) {
  return (
    <li className="flex flex-wrap items-center gap-1.5 border-b border-dashed border-border py-2 last:border-0">
      <Badge variant="accent">{u.speaker}</Badge>
      <Badge variant={sentimentVariant(u.sentiment)}>{u.sentiment}</Badge>
      <Badge>{u.tone}</Badge>
      <p className="w-full text-sm text-foreground">{u.text}</p>
      <Badge variant="outline" className="font-mono tabular-nums">
        {u.timestamp}
      </Badge>
      {u.emotional_intensity > 0.45 ? <Badge variant="warn">intensity {u.emotional_intensity}</Badge> : null}
      <Badge variant={levelVariant(u.conflict_level)}>{u.conflict_level}</Badge>
      {u.possible_trigger ? <Badge variant="negative">trigger</Badge> : null}
      {u.deescalating ? <Badge variant="positive">de-escalation</Badge> : null}
      {u.toxic_words.length ? <Badge variant="negative">wording: {u.toxic_words.join(", ")}</Badge> : null}
    </li>
  );
}

function Group({ title, items, defaultOpen }: { title: string; items: UtteranceResult[]; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-lg border border-border bg-muted/30 px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--motion-quick)] group-open:rotate-90" />
        <span>{title}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {items.length} turn{items.length === 1 ? "" : "s"}
        </span>
      </summary>
      <ul className="mt-2">
        {items.map((u) => (
          <Leaf key={u.idx} u={u} />
        ))}
      </ul>
    </details>
  );
}

export function MindMap({ data }: { data: MindMapData }) {
  return (
    <div className="space-y-4">
      <p className={cn("text-xs font-medium uppercase tracking-wider text-muted-foreground")}>Topics</p>
      <div className="space-y-2">
        {data.topics.map((t) => (
          <Group key={t.label} title={t.label} items={t.children} defaultOpen />
        ))}
      </div>
      {data.triggers.length ? (
        <>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Possible triggers</p>
          <Group title="Trigger moments" items={data.triggers} />
        </>
      ) : null}
      {data.resolutions.length ? (
        <>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Resolution attempts</p>
          <Group title="Concessions / calmer turns" items={data.resolutions} />
        </>
      ) : null}
    </div>
  );
}
