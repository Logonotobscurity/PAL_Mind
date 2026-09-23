/**
 * P02 — Voice Development Partner
 * LOG_ON Canonical Prompt Pattern Library v1.0
 *
 * Voice-native exploration: listen → clarify → one divergent proposal → react → develop → wrap.
 * Never creates ActionProposals. Only produces a developed direction + provenance.
 */

export type VoiceControlWord =
  | "explore"
  | "another"
  | "challenge"
  | "freeze"
  | "reject"
  | "back"
  | "wrap";

export type VoiceSessionState =
  | "VOICE_LISTENING"
  | "VOICE_CLARIFYING"
  | "VOICE_EXPLORATION_WAIT"
  | "VOICE_SINGLE_CANDIDATE"
  | "VOICE_USER_REACTION"
  | "VOICE_DEVELOP"
  | "VOICE_WRAP"
  | "VOICE_CLOSED";

export interface VoiceTurn {
  id: string;
  role: "user" | "system";
  text: string;
  timestamp: string;
  /** When the system quotes the user for clarification */
  quotedBack?: string;
}

export interface DivergentCandidate {
  id: string;
  /** Named external field the mechanism is borrowed from */
  field: string;
  /** Specific mechanism borrowed */
  mechanism: string;
  /** Only enough for the human to react */
  summary: string;
  createdAt: string;
}

export interface RejectionRecord {
  candidateId: string;
  reason: string;
  userWording: string;
  timestamp: string;
}

export interface IdeaChangeMoment {
  /** User's actual words before the shift */
  before: string;
  /** User's actual words after the shift */
  after: string;
  trigger: string;
  timestamp: string;
}

export interface VoiceWrapResult {
  changeMoments: IdeaChangeMoment[];
  rejected: RejectionRecord[];
  nextInvestigation: string;
  /** Clearly separated from user statements */
  systemInterpretation?: string;
}

export interface VoiceDevelopmentSession {
  id: string;
  workspaceId: string;
  state: VoiceSessionState;
  turns: VoiceTurn[];
  /** Max 6 before forced explore */
  questionCount: number;
  currentCandidate?: DivergentCandidate;
  candidatesHistory: DivergentCandidate[];
  rejections: RejectionRecord[];
  changeMoments: IdeaChangeMoment[];
  frozenDirection?: string;
  wrapResult?: VoiceWrapResult;
  createdAt: string;
  updatedAt: string;
}

export const P02_RULES = {
  maxQuestionsBeforeExplore: 6,
  oneQuestionAtATime: true,
  neverStackQuestions: true,
  noSolutionsDuringInterview: true,
  onExplore: "exactly_one_candidate" as const,
  onAnother: "one_materially_different_candidate" as const,
  onChallenge: "examine_one_assumption" as const,
  onFreeze: "preserve_current_direction" as const,
  onReject: "record_rejection_and_reason" as const,
  onBack: "return_to_earlier_direction" as const,
  onWrap: "produce_structured_summary" as const,
} as const;
