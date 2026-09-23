/**
 * First-class domain objects for exploration (LOG_ON + PAL).
 * Candidates and ExplorationSessions are not UI state — they are durable meaning.
 * An ActionProposal may only be born after SSA passes and the human freezes/wraps.
 */

export type CandidateStatus =
  | "proposed"
  | "reacted"
  | "frozen"
  | "rejected"
  | "superseded";

export type ExplorationSessionStatus =
  | "open"
  | "clarifying"
  | "exploring"
  | "developing"
  | "wrapped"
  | "closed";

/** First-class divergent candidate — survives beyond a single voice turn */
export interface Candidate {
  id: string;
  sessionId: string;
  workspaceId: string;
  /** Named external field the mechanism is borrowed from */
  field: string;
  /** Specific mechanism borrowed */
  mechanism: string;
  /** Only enough for the human to react */
  summary: string;
  status: CandidateStatus;
  /** User wording when rejected, if any */
  rejectionReason?: string;
  rejectionWording?: string;
  createdAt: string;
  updatedAt: string;
  provenance: {
    pattern: "P02";
    controlWord?: "explore" | "another";
    sourceTurnIds?: string[];
  };
}

export interface IdeaChangeMoment {
  before: string;
  after: string;
  trigger: string;
  timestamp: string;
}

/** First-class exploration session — the governed development loop */
export interface ExplorationSession {
  id: string;
  workspaceId: string;
  status: ExplorationSessionStatus;
  /** Linked P02 voice session when voice-native */
  voiceSessionId?: string;
  candidateIds: string[];
  frozenCandidateId?: string;
  frozenDirection?: string;
  changeMoments: IdeaChangeMoment[];
  /** Coverage signals for Search-Space Assurance */
  coverage: SearchSpaceCoverage;
  createdAt: string;
  updatedAt: string;
  wrappedAt?: string;
}

/** What SSA measures before an ActionProposal is allowed */
export interface SearchSpaceCoverage {
  /** Distinct external fields considered */
  fieldsTouched: string[];
  /** Mechanisms that differ materially */
  mechanismsTouched: string[];
  /** Explicit rejections with reason */
  rejectionCount: number;
  /** At least one freeze or explicit human selection */
  hasHumanSelection: boolean;
  /** Clarifying questions asked (voice or text) */
  questionCount: number;
  /** Change moments anchored in user wording */
  changeMomentCount: number;
}

export interface ActionProposalDraft {
  id: string;
  explorationSessionId: string;
  candidateId?: string;
  direction: string;
  workspaceId: string;
  createdAt: string;
}
