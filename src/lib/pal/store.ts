import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MapView, PalConversation, PalEdge, PalNode, PalNote, PalTask } from "./types";
import { SEED_CONVERSATIONS, SEED_EDGES, SEED_NODES, SEED_TASKS } from "./seed";
import type { Analysis } from "@/lib/conv-map/engine";

export type Tab = "home" | "memory" | "work" | "skills";

type PalState = {
  tab: Tab;
  view: MapView;
  asOf: string;
  selected: string | null;
  selectedEdge: string | null;
  graphOpen: boolean;
  ask: string;
  askAnswer: string | null;
  nodes: PalNode[];
  edges: PalEdge[];
  tasks: PalTask[];
  conversations: PalConversation[];
  notes: PalNote[];
  setTab: (t: Tab) => void;
  setView: (v: MapView) => void;
  setAsOf: (d: string) => void;
  select: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setGraphOpen: (v: boolean) => void;
  setAsk: (q: string) => void;
  setAskAnswer: (a: string | null) => void;
  pin: (id: string) => void;
  forget: (id: string) => void;
  addNote: (nodeId: string, text: string) => void;
  addTaskFromNode: (id: string) => void;
  ingestAnalysis: (title: string, transcript: string, analysis: Analysis) => void;
  resetSeed: () => void;
};

export const usePal = create<PalState>()(
  persist(
    (set, get) => ({
      tab: "home",
      view: "memory",
      asOf: "2026-09-20",
      selected: null,
      selectedEdge: null,
      graphOpen: false,
      ask: "",
      askAnswer: null,
      nodes: SEED_NODES,
      edges: SEED_EDGES,
      tasks: SEED_TASKS,
      conversations: SEED_CONVERSATIONS,
      notes: [],
      setTab: (tab) => set({ tab }),
      setView: (view) => set({ view, selected: null, selectedEdge: null }),
      setAsOf: (asOf) => set({ asOf }),
      select: (selected) => set({ selected, selectedEdge: null }),
      selectEdge: (selectedEdge) => set({ selectedEdge, selected: null }),
      setGraphOpen: (graphOpen) => set({ graphOpen }),
      setAsk: (ask) => set({ ask }),
      setAskAnswer: (askAnswer) => set({ askAnswer }),
      pin: (id) =>
        set({
          nodes: get().nodes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        }),
      forget: (id) =>
        set({
          nodes: get().nodes.map((n) => (n.id === id ? { ...n, forgotten: true } : n)),
          selected: get().selected === id ? null : get().selected,
        }),
      addNote: (nodeId, text) =>
        set({
          notes: [...get().notes, { id: `n-${Date.now()}`, nodeId, text, at: new Date().toISOString() }],
        }),
      addTaskFromNode: (id) => {
        const n = get().nodes.find((x) => x.id === id);
        if (!n) return;
        set({
          tasks: [
            {
              id: `t-${Date.now()}`,
              title: `Follow up · ${n.label}`,
              status: "today",
              related: [id],
              due: get().asOf,
            },
            ...get().tasks,
          ],
          tab: "work",
          graphOpen: false,
        });
      },
      ingestAnalysis: (title, transcript, analysis) => {
        const id = `c-${Date.now()}`;
        const people = analysis.speakers.map((s) => s.toLowerCase().replace(/\s+/g, "-"));
        const newNodes: PalNode[] = analysis.speakers
          .filter((s) => !get().nodes.some((n) => n.label.toLowerCase() === s.toLowerCase()))
          .map((s, i) => ({
            id: people[i],
            label: s,
            kind: "person" as const,
            role: "From transcript",
            date: get().asOf,
            detail: `${analysis.utterances.filter((u) => u.speaker === s).length} turns`,
          }));
        const conv: PalConversation = {
          id,
          title,
          date: get().asOf,
          people,
          summary: analysis.utterances[0]?.text.slice(0, 140) ?? title,
          transcript,
        };
        const convNode: PalNode = {
          id,
          label: title,
          kind: "event",
          date: get().asOf,
          detail: `${analysis.utterances.length} turns · conflict ${analysis.utterances.at(-1)?.conflict_level}`,
        };
        const newEdges: PalEdge[] = people.map((p, i) => ({
          id: `e-${id}-${i}`,
          source: id,
          target: get().nodes.find((n) => n.label.toLowerCase() === analysis.speakers[i].toLowerCase())?.id ?? p,
          kind: "from_conversation" as const,
          label: "mentions",
          confidence: 0.9,
          evidence: id,
          date: get().asOf,
        }));
        set({
          nodes: [...get().nodes, convNode, ...newNodes],
          edges: [...get().edges, ...newEdges],
          conversations: [conv, ...get().conversations],
          tab: "memory",
        });
      },
      resetSeed: () =>
        set({
          nodes: SEED_NODES,
          edges: SEED_EDGES,
          tasks: SEED_TASKS,
          conversations: SEED_CONVERSATIONS,
          notes: [],
        }),
    }),
    { name: "pal-memory-v1" },
  ),
);
