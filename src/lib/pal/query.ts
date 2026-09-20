import type { PalEdge, PalNode } from "./types";

export function neighbors(id: string, edges: PalEdge[]) {
  return edges.filter((e) => e.source === id || e.target === id);
}

export function explainEdge(edge: PalEdge, nodes: PalNode[]) {
  const a = nodes.find((n) => n.id === edge.source)?.label ?? edge.source;
  const b = nodes.find((n) => n.id === edge.target)?.label ?? edge.target;
  const count = edge.sourceNote ?? `evidence ${edge.evidence}`;
  return `${a} ${edge.label} ${b}. Confidence ${(edge.confidence * 100).toFixed(0)}%. ${count}.`;
}

export function askMap(q: string, nodes: PalNode[], edges: PalEdge[], asOf: string) {
  const query = q.toLowerCase();
  const liveNodes = nodes.filter((n) => !n.forgotten && (!n.date || n.date <= asOf));
  const liveEdges = edges.filter((e) => !e.date || e.date <= asOf);

  if (/cement price|price increased|why has cement/.test(query)) {
    const quotes = liveNodes.filter((n) => n.kind === "money");
    const line = quotes.map((n) => `${n.label} (${n.role ?? n.date})`).join(" → ");
    return {
      answer: `Cement quotes in your memory moved ${line}. Musa’s ₦8,500 on 20 Sep sits above the ₦8,200 competitor signal (18 Sep). Confidence on Musa’s quote is high (0.94); competitor signal is 0.72 — treat the gap as a trend, not a settled market.`,
      focus: ["cement", "price-low", "price", "price-high", "insight"],
      view: "market" as const,
    };
  }
  if (/connected to this supplier|everyone connected|musa/.test(query) && /connected|everyone|show/.test(query)) {
    const n = neighbors("musa", liveEdges);
    const ids = new Set<string>(["musa"]);
    n.forEach((e) => {
      ids.add(e.source);
      ids.add(e.target);
    });
    return {
      answer: `Musa Trading links to ${[...ids]
        .map((id) => liveNodes.find((x) => x.id === id)?.label)
        .filter(Boolean)
        .join(", ")}. Strongest edge: supplies Cement (0.96, conversation_892). Weakest: may supply Blocks (0.61).`,
      focus: [...ids],
      view: "memory" as const,
    };
  }
  if (/bisi|last month|changed around/.test(query)) {
    return {
      answer: `Around Bisi: still a high-value cement customer. No new conversation since ledger activity. Related open work: tell her the ₦8,500 quote. Nothing in memory contradicts her customer role.`,
      focus: ["bisi", "cement", "price"],
      view: "customers" as const,
    };
  }
  if (/unresolved/.test(query)) {
    const weak = liveEdges.filter((e) => e.confidence < 0.8);
    return {
      answer: `Unresolved / low-confidence links: ${weak
        .map((e) => `${e.label} (${(e.confidence * 100).toFixed(0)}%, ${e.evidence})`)
        .join("; ") || "none"}.`,
      focus: weak.flatMap((e) => [e.source, e.target]),
      view: "memory" as const,
    };
  }
  if (/before september 10|before 10/.test(query)) {
    return {
      answer: `Before 10 Sep you knew Musa as a contact in Alaba and Bisi as a customer. The ₦8,500 quote, Friday delivery, and Blocks inference did not exist yet.`,
      focus: ["you", "musa", "bisi", "lagos"],
      view: "people" as const,
    };
  }
  const hits = liveNodes.filter((n) => n.label.toLowerCase().includes(query) || n.detail?.toLowerCase().includes(query));
  if (hits.length) {
    return {
      answer: `Matched ${hits.map((h) => h.label).join(", ")}. Open a node to inspect evidence.`,
      focus: hits.map((h) => h.id),
      view: "memory" as const,
    };
  }
  return {
    answer: "I can traverse this map for price, people around a supplier, unresolved edges, or what you knew before a date.",
    focus: [] as string[],
    view: "memory" as const,
  };
}
