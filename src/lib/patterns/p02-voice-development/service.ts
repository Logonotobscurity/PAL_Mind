import type {
  VoiceControlWord,
  VoiceDevelopmentSession,
  VoiceSessionState,
  VoiceWrapResult,
  DivergentCandidate,
} from "./types";
import {
  createSession,
  appendTurn,
  nextState,
  detectControlWord,
  recordCandidate,
  recordRejection,
  freezeDirection,
  closeWithWrap,
  P02_SYSTEM_PROMPT,
} from "./runtime";
import { P02_RULES } from "./types";

export interface ProcessResult {
  session: VoiceDevelopmentSession;
  systemReply: string;
  newState: VoiceSessionState;
  candidate?: DivergentCandidate;
  controlWord?: VoiceControlWord;
}

/**
 * Minimal in-memory service. Swap the Map for a real store (Supabase / Kysely)
 * when integrating with the rest of PAL_Mind.
 */
const sessions = new Map<string, VoiceDevelopmentSession>();

export const VoiceDevelopmentService = {
  getSystemPrompt(): string {
    return P02_SYSTEM_PROMPT;
  },

  startSession(workspaceId: string, initialUtterance?: string): VoiceDevelopmentSession {
    const session = createSession(workspaceId, initialUtterance);
    sessions.set(session.id, session);
    return session;
  },

  getSession(sessionId: string): VoiceDevelopmentSession | undefined {
    return sessions.get(sessionId);
  },

  /**
   * Process free-form user speech.
   * Automatically detects control words and advances the state machine.
   */
  processUserSpeech(sessionId: string, text: string): ProcessResult {
    let session = sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    const control = detectControlWord(text);
    session = appendTurn(session, "user", text);

    if (control) {
      return this.handleControlWord(sessionId, control, text);
    }

    // Normal clarifying turn
    const questionCount = session.questionCount + 1;
    const newState = nextState(session.state, {
      type: "user_speech",
      questionCount,
    });

    session = {
      ...session,
      questionCount,
      state: newState,
      updatedAt: new Date().toISOString(),
    };

    // Placeholder system reply — real LLM call would go here
    let systemReply =
      newState === "VOICE_EXPLORATION_WAIT"
        ? "I have enough to explore. Say ‘explore’ when you want one unexpected approach, or keep talking."
        : "Understood. What else feels important about this?";

    session = appendTurn(session, "system", systemReply);
    sessions.set(sessionId, session);

    return { session, systemReply, newState, controlWord: undefined };
  },

  handleControlWord(
    sessionId: string,
    word: VoiceControlWord,
    extra?: string,
  ): ProcessResult {
    let session = sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    let systemReply = "";
    let candidate: DivergentCandidate | undefined;

    switch (word) {
      case "explore":
      case "another": {
        // Real implementation would call the LLM with the system prompt
        // and force a single structured candidate. Here we emit a stub
        // so the runtime and UI can be exercised immediately.
        const stub = {
          field: word === "explore" ? "ecology" : "logistics",
          mechanism:
            word === "explore"
              ? "mutualistic exchange instead of one-way delivery"
              : "just-in-time staging rather than batch push",
          summary:
            word === "explore"
              ? "Treat the relationship as a mutualistic exchange — both sides must gain something measurable, otherwise the link dies."
              : "Stage only what is needed for the next visible step; do not pre-load the full plan.",
        };
        session = recordCandidate(session, stub);
        candidate = session.currentCandidate;
        systemReply = candidate
          ? `From ${candidate.field}: ${candidate.summary}\n\nWhat would you change?`
          : "I need more context before I can offer an approach.";
        session = {
          ...session,
          state: "VOICE_USER_REACTION",
        };
        break;
      }

      case "reject": {
        const reason = extra?.trim() || "No reason given";
        session = recordRejection(session, reason, extra ?? reason);
        systemReply = `Recorded. Rejected because: “${reason}”. What direction feels more useful now?`;
        break;
      }

      case "freeze": {
        const direction =
          session.currentCandidate?.summary ??
          session.frozenDirection ??
          "Current direction";
        session = freezeDirection(session, direction);
        systemReply = `Frozen. We will develop: “${direction}”. Say ‘wrap’ when you want the summary.`;
        break;
      }

      case "challenge": {
        systemReply =
          "What assumption are we treating as fixed that might actually be optional?";
        session = {
          ...session,
          state: "VOICE_CLARIFYING",
          updatedAt: new Date().toISOString(),
        };
        break;
      }

      case "back": {
        session = {
          ...session,
          state: "VOICE_CLARIFYING",
          currentCandidate: undefined,
          updatedAt: new Date().toISOString(),
        };
        systemReply = "Back. What part of the earlier direction do you want to reopen?";
        break;
      }

      case "wrap": {
        session = closeWithWrap(session);
        const w = session.wrapResult!;
        systemReply = [
          "— Wrap —",
          ...w.changeMoments.map(
            (m, i) =>
              `${i + 1}. “${m.before}” → “${m.after}” (trigger: ${m.trigger})`,
          ),
          w.rejected.length
            ? `Rejected: ${w.rejected.map((r) => r.userWording).join("; ")}`
            : "No explicit rejections recorded.",
          `Next: ${w.nextInvestigation}`,
        ].join("\n");
        break;
      }
    }

    session = appendTurn(session, "system", systemReply);
    sessions.set(sessionId, session);

    return {
      session,
      systemReply,
      newState: session.state,
      candidate,
      controlWord: word,
    };
  },

  getWrap(sessionId: string): VoiceWrapResult | undefined {
    return sessions.get(sessionId)?.wrapResult;
  },

  /** Expose rules for UI / tests */
  rules: P02_RULES,
};
