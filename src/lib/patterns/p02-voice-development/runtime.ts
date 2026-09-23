import type {
  VoiceControlWord,
  VoiceSessionState,
  VoiceDevelopmentSession,
  DivergentCandidate,
  RejectionRecord,
  IdeaChangeMoment,
  VoiceWrapResult,
  VoiceTurn,
} from "./types";
import { P02_RULES } from "./types";

function uid(prefix = "p02") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date().toISOString();
}

/** Detect control words from free-form user speech */
export function detectControlWord(text: string): VoiceControlWord | null {
  const n = text.toLowerCase().trim();
  if (/\b(let'?s explore|explore)\b/.test(n)) return "explore";
  if (/\banother\b/.test(n)) return "another";
  if (/\bchallenge\b/.test(n)) return "challenge";
  if (/\bfreeze\b/.test(n)) return "freeze";
  if (/\breject\b/.test(n)) return "reject";
  if (/\bback\b/.test(n)) return "back";
  if (/\bwrap\b/.test(n)) return "wrap";
  return null;
}

/** Deterministic state transitions matching the LOG_ON library state machine */
export function nextState(
  current: VoiceSessionState,
  event: { type: "user_speech" | "control"; payload?: string; questionCount?: number },
): VoiceSessionState {
  switch (current) {
    case "VOICE_LISTENING":
      return event.type === "user_speech" ? "VOICE_CLARIFYING" : current;

    case "VOICE_CLARIFYING": {
      if (event.type === "control" && event.payload === "explore") return "VOICE_EXPLORATION_WAIT";
      if ((event.questionCount ?? 0) >= P02_RULES.maxQuestionsBeforeExplore) {
        return "VOICE_EXPLORATION_WAIT";
      }
      return "VOICE_CLARIFYING";
    }

    case "VOICE_EXPLORATION_WAIT":
      return "VOICE_SINGLE_CANDIDATE";

    case "VOICE_SINGLE_CANDIDATE":
      return "VOICE_USER_REACTION";

    case "VOICE_USER_REACTION": {
      if (event.type === "control" && event.payload === "reject") return "VOICE_CLARIFYING";
      if (event.type === "control" && event.payload === "freeze") return "VOICE_DEVELOP";
      return "VOICE_DEVELOP";
    }

    case "VOICE_DEVELOP": {
      if (event.type === "control" && event.payload === "wrap") return "VOICE_WRAP";
      if (event.type === "control" && event.payload === "another") return "VOICE_SINGLE_CANDIDATE";
      if (event.type === "control" && event.payload === "back") return "VOICE_CLARIFYING";
      return "VOICE_DEVELOP";
    }

    case "VOICE_WRAP":
      return "VOICE_CLOSED";

    default:
      return current;
  }
}

export function createSession(workspaceId: string, initialUtterance?: string): VoiceDevelopmentSession {
  const id = uid("vs");
  const turns: VoiceTurn[] = [];
  if (initialUtterance?.trim()) {
    turns.push({
      id: uid("t"),
      role: "user",
      text: initialUtterance.trim(),
      timestamp: now(),
    });
  }
  return {
    id,
    workspaceId,
    state: initialUtterance?.trim() ? "VOICE_CLARIFYING" : "VOICE_LISTENING",
    turns,
    questionCount: 0,
    candidatesHistory: [],
    rejections: [],
    changeMoments: [],
    createdAt: now(),
    updatedAt: now(),
  };
}

export function appendTurn(
  session: VoiceDevelopmentSession,
  role: "user" | "system",
  text: string,
  quotedBack?: string,
): VoiceDevelopmentSession {
  const turn: VoiceTurn = {
    id: uid("t"),
    role,
    text,
    timestamp: now(),
    quotedBack,
  };
  return {
    ...session,
    turns: [...session.turns, turn],
    updatedAt: now(),
  };
}

export function recordCandidate(
  session: VoiceDevelopmentSession,
  candidate: Omit<DivergentCandidate, "id" | "createdAt">,
): VoiceDevelopmentSession {
  const full: DivergentCandidate = {
    ...candidate,
    id: uid("cand"),
    createdAt: now(),
  };
  return {
    ...session,
    currentCandidate: full,
    candidatesHistory: [...session.candidatesHistory, full],
    state: "VOICE_SINGLE_CANDIDATE",
    updatedAt: now(),
  };
}

export function recordRejection(
  session: VoiceDevelopmentSession,
  reason: string,
  userWording: string,
): VoiceDevelopmentSession {
  if (!session.currentCandidate) return session;
  const rec: RejectionRecord = {
    candidateId: session.currentCandidate.id,
    reason,
    userWording,
    timestamp: now(),
  };
  return {
    ...session,
    rejections: [...session.rejections, rec],
    currentCandidate: undefined,
    state: "VOICE_CLARIFYING",
    updatedAt: now(),
  };
}

export function recordChangeMoment(
  session: VoiceDevelopmentSession,
  before: string,
  after: string,
  trigger: string,
): VoiceDevelopmentSession {
  const moment: IdeaChangeMoment = {
    before,
    after,
    trigger,
    timestamp: now(),
  };
  return {
    ...session,
    changeMoments: [...session.changeMoments, moment],
    updatedAt: now(),
  };
}

export function freezeDirection(
  session: VoiceDevelopmentSession,
  direction: string,
): VoiceDevelopmentSession {
  return {
    ...session,
    frozenDirection: direction,
    state: "VOICE_DEVELOP",
    updatedAt: now(),
  };
}

export function produceWrap(session: VoiceDevelopmentSession): VoiceWrapResult {
  return {
    changeMoments: session.changeMoments.slice(0, 3),
    rejected: session.rejections,
    nextInvestigation:
      session.frozenDirection ??
      "Continue developing the current direction or call another exploration.",
    systemInterpretation: undefined,
  };
}

export function closeWithWrap(session: VoiceDevelopmentSession): VoiceDevelopmentSession {
  const wrapResult = produceWrap(session);
  return {
    ...session,
    wrapResult,
    state: "VOICE_CLOSED",
    updatedAt: now(),
  };
}

/** System prompt skeleton for the LLM layer (injected at runtime) */
export const P02_SYSTEM_PROMPT = `You are operating as P02 — Voice Development Partner.

Your only job is to help the human discover and develop their own thinking.
You do not take ownership of the direction.

STRICT RULES:
- Stay in listening / clarifying mode until the human has given enough information.
- Ask exactly one question at a time. Never stack questions.
- Wait for the human's response before continuing.
- Do not propose any solution or approach during the interview phase.
- If the human says something contradictory, vague or incomplete, quote the exact words back and ask for clarification. Do not interpret it as error until they explain.
- Interview ends after six questions or when the human says "explore" / "let's explore".

CONTROL WORDS (human may say these at any time):
- explore / let's explore → generate exactly one unexpected approach from another field. Name the field and the specific mechanism. Then stop and wait.
- another → generate one materially different approach (different mechanism).
- challenge → examine one assumption currently in play.
- freeze → preserve the current direction; do not offer new alternatives.
- reject → record the rejection and the reason the human gives.
- back → return to an earlier direction.
- wrap → finish and produce the structured summary.

When generating a candidate (on "explore" or "another"):
- Give exactly one approach.
- Name the external field.
- Name the specific mechanism you are borrowing.
- Explain only enough for the human to react.
- Then stop. Do not generate another idea until they respond.

After the human reacts, ask: "What would you change?"
Use their answer to develop *their* version. Do not replace it with a more polished version that ignores their change.

On "wrap", produce only:
1. Three actual moments where the idea changed (use the human's own words for before and after).
2. What triggered each change.
3. What was rejected and why (in the human's words).
4. What the human wants to investigate next.
Clearly separate the human's statements from any system interpretation.
Do not evaluate how creative the session was.`;
