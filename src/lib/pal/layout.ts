import type { MapView, PalEdge, PalNode } from "./types";

export type Pt = { id: string; x: number; y: number };

const W = 920;
const H = 520;

function live(nodes: PalNode[], asOf: string) {
  return nodes.filter((n) => !n.forgotten && (!n.date || n.date <= asOf));
}

export function layoutGraph(view: MapView, nodes: PalNode[], _edges: PalEdge[], asOf: string): Pt[] {
  const ns = live(nodes, asOf);
  const ids = new Set(ns.map((n) => n.id));
  const pts: Pt[] = [];
  const place = (id: string, x: number, y: number) => {
    if (ids.has(id)) pts.push({ id, x, y });
  };

  if (view === "people") {
    place("you", W / 2, 70);
    place("musa", 180, 320);
    place("bisi", W / 2, 360);
    place("tunde", 740, 320);
    return pts;
  }
  if (view === "customers") {
    place("bisi", 180, 260);
    place("musa", W / 2, 260);
    place("tunde", 740, 260);
    return pts;
  }
  if (view === "product") {
    place("cement", W / 2, 90);
    place("musa", 180, 320);
    place("price", W / 2, 320);
    place("bisi", 740, 320);
    return pts;
  }
  if (view === "conversation") {
    ["meet", "nego", "price", "delivery", "task-friday"].forEach((id, i) => place(id, W / 2, 60 + i * 90));
    return pts;
  }
  if (view === "workflow") {
    ["wf1", "wf2", "wf3", "wf4", "wf5"].forEach((id, i) => place(id, W / 2, 60 + i * 90));
    return pts;
  }
  if (view === "market") {
    place("cement", W / 2, 80);
    place("price-low", 180, 280);
    place("price", W / 2, 280);
    place("price-high", 740, 280);
    place("insight", W / 2, 420);
    return pts;
  }
  place("you", 90, 70);
  place("musa", W / 2, 90);
  place("cement", W / 2, 250);
  place("price", 280, 400);
  place("delivery", 640, 400);
  place("conv", 140, 250);
  return pts;
}

export function edgePath(a: Pt, b: Pt) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - 28;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

export { W as GRAPH_W, H as GRAPH_H };
