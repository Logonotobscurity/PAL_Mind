import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { explainEdge } from "@/lib/pal/query";
import { usePal } from "@/lib/pal/store";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function InspectPanel() {
  const selected = usePal((s) => s.selected);
  const selectedEdge = usePal((s) => s.selectedEdge);
  const nodes = usePal((s) => s.nodes);
  const edges = usePal((s) => s.edges);
  const notes = usePal((s) => s.notes);
  const pin = usePal((s) => s.pin);
  const forget = usePal((s) => s.forget);
  const addNote = usePal((s) => s.addNote);
  const addTaskFromNode = usePal((s) => s.addTaskFromNode);
  const select = usePal((s) => s.select);
  const selectEdge = usePal((s) => s.selectEdge);
  const [note, setNote] = useState("");

  const node = nodes.find((n) => n.id === selected);
  const edge = edges.find((e) => e.id === selectedEdge);

  if (!node && !edge) {
    return (
      <p className="text-sm text-muted-foreground">
        Tap a node for profile, conversations, tasks. Tap an edge for confidence and evidence. Long-press actions live
        below once a node is open.
      </p>
    );
  }

  if (edge) {
    return (
      <div className="space-y-3">
        <p className="font-display text-lg">{edge.label}</p>
        <p className="text-sm leading-relaxed">{explainEdge(edge, nodes)}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant={edge.confidence >= 0.8 ? "positive" : "warn"}>
            confidence {edge.confidence.toFixed(2)}
          </Badge>
          <Badge variant="outline">{edge.evidence}</Badge>
          {edge.date ? <Badge variant="outline">{edge.date}</Badge> : null}
        </div>
        <Button variant="ghost" size="sm" onClick={() => selectEdge(null)}>
          Close
        </Button>
      </div>
    );
  }

  if (!node) return null;
  const related = edges.filter((e) => e.source === node.id || e.target === node.id);
  const nodeNotes = notes.filter((n) => n.nodeId === node.id);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{node.kind}</p>
        <h3 className="font-display text-xl">{node.label}</h3>
        {node.role ? <p className="text-sm text-muted-foreground">{node.role}</p> : null}
        {node.detail ? <p className="mt-1 text-sm">{node.detail}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => pin(node.id)}>
          {node.pinned ? "Unpin" : "Pin"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addTaskFromNode(node.id)}>
          Create task
        </Button>
        <Button size="sm" variant="ghost" onClick={() => forget(node.id)}>
          Forget
        </Button>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Relationships</p>
        <ul className="mt-1 space-y-1 text-sm">
          {related.map((e) => {
            const other = e.source === node.id ? e.target : e.source;
            const lab = nodes.find((n) => n.id === other)?.label ?? other;
            return (
              <li key={e.id}>
                <button type="button" className="text-left text-muted-foreground hover:text-foreground" onClick={() => selectEdge(e.id)}>
                  {e.label} → {lab} · {Math.round(e.confidence * 100)}%
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!note.trim()) return;
          addNote(node.id, note.trim());
          setNote("");
        }}
      >
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" />
        <Button type="submit" variant="secondary">
          Note
        </Button>
      </form>
      {nodeNotes.map((n) => (
        <p key={n.id} className="text-xs text-muted-foreground">
          {n.text}
        </p>
      ))}
      <Button variant="ghost" size="sm" onClick={() => select(null)}>
        Close
      </Button>
    </div>
  );
}
