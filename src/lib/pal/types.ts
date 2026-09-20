export type NodeKind =
  | "you"
  | "person"
  | "org"
  | "place"
  | "product"
  | "money"
  | "event"
  | "task"
  | "insight"
  | "workflow";

export type EdgeKind =
  | "knows"
  | "supplies"
  | "buys"
  | "priced_at"
  | "delivers"
  | "from_conversation"
  | "may_supply"
  | "follows"
  | "step"
  | "located"
  | "competes";

export type MapView =
  | "memory"
  | "people"
  | "customers"
  | "product"
  | "conversation"
  | "workflow"
  | "market";

export type PalNode = {
  id: string;
  label: string;
  kind: NodeKind;
  role?: string;
  detail?: string;
  date?: string;
  pinned?: boolean;
  collapsed?: boolean;
  forgotten?: boolean;
};

export type PalEdge = {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label: string;
  confidence: number;
  evidence: string;
  date?: string;
  sourceNote?: string;
};

export type PalTask = {
  id: string;
  title: string;
  status: "today" | "upcoming" | "waiting" | "overdue" | "promise";
  related?: string[];
  due?: string;
};

export type PalConversation = {
  id: string;
  title: string;
  date: string;
  people: string[];
  summary: string;
  transcript?: string;
};

export type PalNote = {
  id: string;
  nodeId: string;
  text: string;
  at: string;
};
