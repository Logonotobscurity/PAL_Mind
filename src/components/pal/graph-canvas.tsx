import { GRAPH_H, GRAPH_W, edgePath, layoutGraph } from "@/lib/pal/layout";
import { usePal } from "@/lib/pal/store";
import type { NodeKind } from "@/lib/pal/types";
import { cn } from "@/lib/utils";

const KIND_RING: Record<NodeKind, string> = {
  you: "var(--color-primary)",
  person: "var(--color-primary)",
  org: "var(--color-primary)",
  place: "var(--color-muted-foreground)",
  product: "var(--color-warn)",
  money: "var(--color-good)",
  event: "var(--color-muted-foreground)",
  task: "var(--color-warn)",
  insight: "var(--color-good)",
  workflow: "var(--color-primary)",
};

export function GraphCanvas({ focus = [] }: { focus?: string[] }) {
  const nodes = usePal((s) => s.nodes);
  const edges = usePal((s) => s.edges);
  const view = usePal((s) => s.view);
  const asOf = usePal((s) => s.asOf);
  const selected = usePal((s) => s.selected);
  const selectedEdge = usePal((s) => s.selectedEdge);
  const select = usePal((s) => s.select);
  const selectEdge = usePal((s) => s.selectEdge);

  const pts = layoutGraph(view, nodes, edges, asOf);
  const by = Object.fromEntries(pts.map((p) => [p.id, p]));
  const live = new Set(pts.map((p) => p.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <svg
        viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
        className="h-[min(62vh,520px)] w-full min-w-[640px] text-foreground"
        role="img"
        aria-label="PAL mind map"
      >
        {edges
          .filter((e) => live.has(e.source) && live.has(e.target) && (!e.date || e.date <= asOf))
          .map((e) => {
            const a = by[e.source];
            const b = by[e.target];
            if (!a || !b) return null;
            const weak = e.confidence < 0.8;
            const on = selectedEdge === e.id || focus.includes(e.source) || focus.includes(e.target);
            return (
              <g key={e.id} className="cursor-pointer" onClick={() => selectEdge(e.id)}>
                <path
                  d={edgePath(a, b)}
                  fill="none"
                  stroke={on ? "var(--color-primary)" : "var(--color-border)"}
                  strokeWidth={on ? 2.2 : 1.2}
                  strokeDasharray={weak ? "5 4" : undefined}
                  opacity={weak ? 0.7 : 1}
                />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={10}
                >
                  {e.label} · {Math.round(e.confidence * 100)}%
                </text>
              </g>
            );
          })}
        {pts.map((p) => {
          const n = nodes.find((x) => x.id === p.id);
          if (!n) return null;
          const on = selected === n.id || focus.includes(n.id);
          return (
            <g
              key={n.id}
              transform={`translate(${p.x}, ${p.y})`}
              className="cursor-pointer"
              onClick={() => select(n.id)}
            >
              <circle
                r={on ? 22 : 18}
                fill="var(--color-card)"
                stroke={KIND_RING[n.kind]}
                strokeWidth={on ? 2.5 : 1.4}
              />
              {n.pinned ? <circle r={3.5} cy={-20} fill="var(--color-primary)" /> : null}
              <text textAnchor="middle" y={36} fontSize={12} className="fill-foreground" fontWeight={500}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ViewPills() {
  const view = usePal((s) => s.view);
  const setView = usePal((s) => s.setView);
  const items: { id: typeof view; label: string }[] = [
    { id: "memory", label: "Memory" },
    { id: "people", label: "People" },
    { id: "customers", label: "Customers" },
    { id: "product", label: "Product" },
    { id: "conversation", label: "Conversation" },
    { id: "workflow", label: "Workflow" },
    { id: "market", label: "Market" },
  ];
  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => setView(it.id)}
          className={cn(
            "h-9 shrink-0 rounded-full px-3 text-xs font-medium",
            view === it.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
