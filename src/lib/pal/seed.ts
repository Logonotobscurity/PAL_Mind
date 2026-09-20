import type { PalConversation, PalEdge, PalNode, PalTask } from "./types";

export const SEED_NODES: PalNode[] = [
  { id: "you", label: "You", kind: "you", role: "operator", detail: "Center of PAL memory." },
  { id: "musa", label: "Musa Trading", kind: "org", role: "Supplier", detail: "Cement supplier. First contact 1 Sep.", date: "2026-09-01" },
  { id: "bisi", label: "Bisi", kind: "person", role: "Customer · high value", detail: "Regular cement buyer.", date: "2026-08-12" },
  { id: "tunde", label: "Tunde", kind: "person", role: "Partner", detail: "Follow-up due on collections.", date: "2026-09-08" },
  { id: "cement", label: "Cement", kind: "product", detail: "50kg bags. Core SKU.", date: "2026-09-01" },
  { id: "price", label: "₦8,500", kind: "money", role: "Musa quote", detail: "Discussed 20 Sep. Up from ₦8,200 competitor signal.", date: "2026-09-20" },
  { id: "price-low", label: "₦8,200", kind: "money", role: "Competitor", detail: "Market signal, medium confidence.", date: "2026-09-18" },
  { id: "price-high", label: "₦8,700", kind: "money", role: "Supplier B", detail: "Alternate quote.", date: "2026-09-19" },
  { id: "delivery", label: "Friday delivery", kind: "event", detail: "Promised by Musa for cement.", date: "2026-09-20" },
  { id: "meet", label: "Supplier meeting", kind: "event", detail: "Price negotiation with Musa.", date: "2026-09-10" },
  { id: "nego", label: "Price negotiation", kind: "event", date: "2026-09-10" },
  { id: "conv", label: "Conversation · 20 Sep", kind: "event", detail: "Voice note after delivery promise.", date: "2026-09-20" },
  { id: "lagos", label: "Alaba market", kind: "place", detail: "Where Musa quotes from.", date: "2026-09-01" },
  { id: "blocks", label: "Blocks", kind: "product", detail: "Possible adjacent SKU — not confirmed.", date: "2026-09-20" },
  { id: "wf1", label: "Catalog item", kind: "workflow", detail: "Meaning-to-action step 1", date: "2026-09-20" },
  { id: "wf2", label: "Extract product", kind: "workflow", date: "2026-09-20" },
  { id: "wf3", label: "Quiet hours", kind: "workflow", date: "2026-09-20" },
  { id: "wf4", label: "Customer message", kind: "workflow", date: "2026-09-20" },
  { id: "wf5", label: "Ledger write", kind: "workflow", date: "2026-09-20" },
  { id: "insight", label: "Price rising", kind: "insight", detail: "Cement quotes climbed ₦300 in two days.", date: "2026-09-20" },
  { id: "task-friday", label: "Confirm Friday truck", kind: "task", date: "2026-09-20" },
];

export const SEED_EDGES: PalEdge[] = [
  { id: "e1", source: "you", target: "musa", kind: "knows", label: "works with", confidence: 0.99, evidence: "contact_book", date: "2026-09-01" },
  { id: "e2", source: "you", target: "bisi", kind: "knows", label: "serves", confidence: 0.98, evidence: "ledger", date: "2026-08-12" },
  { id: "e3", source: "you", target: "tunde", kind: "knows", label: "partners", confidence: 0.9, evidence: "conversation_110", date: "2026-09-08" },
  { id: "e4", source: "musa", target: "cement", kind: "supplies", label: "supplies", confidence: 0.96, evidence: "conversation_892", date: "2026-09-10", sourceNote: "7 recorded interactions" },
  { id: "e5", source: "musa", target: "blocks", kind: "may_supply", label: "may supply", confidence: 0.61, evidence: "conversation_901", date: "2026-09-20" },
  { id: "e6", source: "cement", target: "price", kind: "priced_at", label: "quoted", confidence: 0.94, evidence: "conversation_892", date: "2026-09-20" },
  { id: "e7", source: "cement", target: "price-low", kind: "priced_at", label: "competitor", confidence: 0.72, evidence: "field_note_44", date: "2026-09-18" },
  { id: "e8", source: "cement", target: "price-high", kind: "priced_at", label: "supplier B", confidence: 0.7, evidence: "field_note_45", date: "2026-09-19" },
  { id: "e9", source: "musa", target: "delivery", kind: "delivers", label: "promised", confidence: 0.88, evidence: "conversation_892", date: "2026-09-20" },
  { id: "e10", source: "meet", target: "nego", kind: "follows", label: "then", confidence: 0.95, evidence: "conversation_880", date: "2026-09-10" },
  { id: "e11", source: "nego", target: "price", kind: "follows", label: "then", confidence: 0.93, evidence: "conversation_892", date: "2026-09-20" },
  { id: "e12", source: "price", target: "delivery", kind: "follows", label: "then", confidence: 0.9, evidence: "conversation_892", date: "2026-09-20" },
  { id: "e13", source: "delivery", target: "task-friday", kind: "follows", label: "task created", confidence: 0.97, evidence: "system", date: "2026-09-20" },
  { id: "e14", source: "conv", target: "musa", kind: "from_conversation", label: "mentions", confidence: 0.99, evidence: "conversation_892", date: "2026-09-20" },
  { id: "e15", source: "musa", target: "lagos", kind: "located", label: "quotes from", confidence: 0.8, evidence: "conversation_880", date: "2026-09-10" },
  { id: "e16", source: "bisi", target: "cement", kind: "buys", label: "buys", confidence: 0.92, evidence: "ledger", date: "2026-09-05" },
  { id: "e17", source: "wf1", target: "wf2", kind: "step", label: "then", confidence: 1, evidence: "workflow_catalog", date: "2026-09-20" },
  { id: "e18", source: "wf2", target: "wf3", kind: "step", label: "then", confidence: 1, evidence: "workflow_catalog", date: "2026-09-20" },
  { id: "e19", source: "wf3", target: "wf4", kind: "step", label: "then", confidence: 1, evidence: "workflow_catalog", date: "2026-09-20" },
  { id: "e20", source: "wf4", target: "wf5", kind: "step", label: "then", confidence: 1, evidence: "workflow_catalog", date: "2026-09-20" },
  { id: "e21", source: "price-low", target: "price", kind: "competes", label: "trend up", confidence: 0.74, evidence: "insight_price", date: "2026-09-20" },
  { id: "e22", source: "insight", target: "cement", kind: "from_conversation", label: "about", confidence: 0.85, evidence: "insight_price", date: "2026-09-20" },
];

export const SEED_TASKS: PalTask[] = [
  { id: "t1", title: "Confirm Friday truck with Musa", status: "today", related: ["musa", "delivery"], due: "2026-09-20" },
  { id: "t2", title: "Tell Bisi the ₦8,500 quote", status: "upcoming", related: ["bisi", "cement"], due: "2026-09-21" },
  { id: "t3", title: "Collect from Tunde", status: "overdue", related: ["tunde"], due: "2026-09-18" },
  { id: "t4", title: "Musa promised Friday delivery", status: "promise", related: ["musa", "delivery"] },
  { id: "t5", title: "Waiting on Supplier B ₦8,700 confirmation", status: "waiting", related: ["price-high"] },
];

export const SEED_CONVERSATIONS: PalConversation[] = [
  {
    id: "c1",
    title: "First contact · Musa",
    date: "2026-09-01",
    people: ["musa"],
    summary: "Introduced as a cement source in Alaba.",
  },
  {
    id: "c2",
    title: "Supplier meeting",
    date: "2026-09-10",
    people: ["musa"],
    summary: "Negotiated bag price. Musa still the preferred source.",
  },
  {
    id: "c3",
    title: "Quote and Friday promise",
    date: "2026-09-20",
    people: ["musa"],
    summary: "₦8,500 locked verbally. Delivery Friday. Task created.",
    transcript:
      "[00:00:00] You: Can you confirm cement for Friday?\n[00:00:08] Musa: ₦8,500 a bag. Truck Friday if you send the list today.",
  },
];
