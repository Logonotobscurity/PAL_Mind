import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MapView, PalConversation, PalEdge, PalNode, PalNote, PalTask } from "./types";
import { SEED_CONVERSATIONS, SEED_EDGES, SEED_NODES, SEED_TASKS } from "./seed";
import type { Analysis } from "@/lib/conv-map/engine";
import type { VoiceDevelopmentSession } from "@/lib/patterns/p02-voice-development";
import { explorationFromP02 } from "@/lib/domain/from-p02";
import {
  evaluateSearchSpaceAssurance,
  tryCreateActionProposal,
} from "@/lib/domain/search-space-assurance";
import type { ActionProposalDraft, Candidate, ExplorationSession } from "@/lib/domain/exploration";

export type Tab = "home" | "memory" | "work" | "voice" | "skills";

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
  /** First-class exploration objects */
  explorations: ExplorationSession[];
  candidates: Candidate[];
  /** Draft proposals that passed SSA — still not executed */
  actionDrafts: ActionProposalDraft[];
  lastSsaMessage: string | null;
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
  /** Wire P02 wrap → graph + tasks + SSA gate */
  ingestP02Wrap: (session: VoiceDevelopmentSession) => {
    ssaPassed: boolean;
    proposal: ActionProposalDraft | null;
    message: string;
  };
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
      explorations: [],
      candidates: [],
      actionDrafts: [],
      lastSsaMessage: null,
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

      ingestP02Wrap: (session) => {
        const { exploration, candidates } = explorationFromP02(session);
        const asOf = get().asOf;
        const direction =
          session.frozenDirection ??
          session.wrapResult?.nextInvestigation ??
          "Developed direction from voice exploration";

        // Exploration node
        const exNode: PalNode = {
          id: exploration.id,
          label: direction.slice(0, 80),
          kind: "exploration",
          role: "P02 wrap",
          detail: `q${session.questionCount} · ${candidates.length} candidates · ${session.rejections.length} rejected`,
          date: asOf,
          pinned: true,
        };

        // Candidate nodes + edges
        const candNodes: PalNode[] = candidates.map((c) => ({
          id: c.id,
          label: `${c.field}: ${c.mechanism}`.slice(0, 60),
          kind: "candidate" as const,
          role: c.status,
          detail: c.summary.slice(0, 140),
          date: asOf,
        }));

        const candEdges: PalEdge[] = candidates.map((c, i) => ({
          id: `e-${exploration.id}-${c.id}`,
          source: exploration.id,
          target: c.id,
          kind: c.status === "rejected" ? ("rejects" as const) : ("from_exploration" as const),
          label: c.status === "rejected" ? "rejected" : "considered",
          confidence: 0.85,
          evidence: session.id,
          date: asOf,
          sourceNote: c.rejectionWording,
        }));

        // Insight from change moments
        const insightNodes: PalNode[] = session.changeMoments.slice(0, 3).map((m, i) => ({
          id: `insight-${session.id}-${i}`,
          label: m.after.slice(0, 60) || m.before.slice(0, 60),
          kind: "insight" as const,
          role: "idea shift",
          detail: `“${m.before}” → “${m.after}” (${m.trigger})`,
          date: asOf,
        }));

        const insightEdges: PalEdge[] = insightNodes.map((n) => ({
          id: `e-${exploration.id}-${n.id}`,
          source: exploration.id,
          target: n.id,
          kind: "develops" as const,
          label: "changed",
          confidence: 0.9,
          evidence: session.id,
          date: asOf,
        }));

        // Task from next investigation
        const next = session.wrapResult?.nextInvestigation ?? direction;
        const task: PalTask = {
          id: `t-p02-${session.id}`,
          title: `Investigate · ${next.slice(0, 72)}`,
          status: "today",
          related: [exploration.id],
          due: asOf,
        };

        // Conversation record
        const transcript = session.turns.map((t) => `${t.role}: ${t.text}`).join("\n");
        const conv: PalConversation = {
          id: `c-p02-${session.id}`,
          title: `Voice development · ${direction.slice(0, 40)}`,
          date: asOf,
          people: ["you"],
          summary: direction.slice(0, 160),
          transcript,
        };

        // SSA gate
        const ssa = evaluateSearchSpaceAssurance(exploration, candidates);
        const { proposal } = tryCreateActionProposal(exploration, candidates, direction);

        const message = ssa.passed
          ? `SSA passed. Direction stored in memory. ${proposal ? "Action draft created (not executed)." : ""}`
          : `SSA blocked ActionProposal: ${ssa.findings.filter((f) => f.required && !f.passed).map((f) => f.message).join(" · ")}`;

        // Dedupe by id
        const existingNodeIds = new Set(get().nodes.map((n) => n.id));
        const existingEdgeIds = new Set(get().edges.map((e) => e.id));
        const existingEx = get().explorations.filter((e) => e.id !== exploration.id);
        const existingCand = get().candidates.filter((c) => c.sessionId !== session.id);

        set({
          nodes: [
            ...get().nodes.filter((n) => n.id !== exploration.id),
            ...[exNode, ...candNodes, ...insightNodes].filter((n) => !existingNodeIds.has(n.id) || n.id === exploration.id || n.id.startsWith("insight-") || n.kind === "candidate"),
          ].filter((n, i, arr) => arr.findIndex((x) => x.id === n.id) === i),
          edges: [
            ...get().edges,
            ...[...candEdges, ...insightEdges].filter((e) => !existingEdgeIds.has(e.id)),
          ],
          tasks: [task, ...get().tasks.filter((t) => t.id !== task.id)],
          conversations: [conv, ...get().conversations.filter((c) => c.id !== conv.id)],
          explorations: [exploration, ...existingEx],
          candidates: [...candidates, ...existingCand],
          actionDrafts: proposal
            ? [proposal, ...get().actionDrafts.filter((d) => d.explorationSessionId !== exploration.id)]
            : get().actionDrafts,
          lastSsaMessage: message,
          tab: "memory",
        });

        return {
          ssaPassed: ssa.passed,
          proposal,
          message,
        };
      },

      resetSeed: () =>
        set({
          nodes: SEED_NODES,
          edges: SEED_EDGES,
          tasks: SEED_TASKS,
          conversations: SEED_CONVERSATIONS,
          notes: [],
          explorations: [],
          candidates: [],
          actionDrafts: [],
          lastSsaMessage: null,
        }),
    }),
    { name: "pal-memory-v2" },
  ),
);
