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
import { P02Repo } from "./repo";
import { generateDivergentCandidate } from "./llm";

export interface ProcessResult {
  session: VoiceDevelopmentSession;
  systemReply: string;
  newState: VoiceSessionState;
  candidate?: DivergentCandidate;
  controlWord?: VoiceControlWord;
}

async function persist(session: VoiceDevelopmentSession) {
  await P02Repo.save(session);
  return session;
}

export const VoiceDevelopmentService = {
  getSystemPrompt(): string {
    return P02_SYSTEM_PROMPT;
  },

  async startSession(
    workspaceId: string,
    initialUtterance?: string,
  ): Promise<VoiceDevelopmentSession> {
    const session = createSession(workspaceId, initialUtterance);
    await persist(session);
    return session;
  },

  async getSession(sessionId: string): Promise<VoiceDevelopmentSession | null> {
    return P02Repo.get(sessionId);
  },

  async processUserSpeech(sessionId: string, text: string): Promise<ProcessResult> {
    let session = await P02Repo.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    const control = detectControlWord(text);
    session = appendTurn(session, "user", text);

    if (control) {
      return this.handleControlWord(sessionId, control, text);
    }

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

    let systemReply =
      newState === "VOICE_EXPLORATION_WAIT"
        ? "I have enough to explore. Say ‘explore’ when you want one unexpected approach, or keep talking."
        : "Understood. What else feels important about this?";

    session = appendTurn(session, "system", systemReply);
    await persist(session);

    return { session, systemReply, newState, controlWord: undefined };
  },

  async handleControlWord(
    sessionId: string,
    word: VoiceControlWord,
    extra?: string,
  ): Promise<ProcessResult> {
    let session = await P02Repo.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    // Ensure the control word itself is on the transcript if it came from a button
    if (!extra) {
      session = appendTurn(session, "user", word);
    }

    let systemReply = "";
    let candidate: DivergentCandidate | undefined;

    switch (word) {
      case "explore":
      case "another": {
        const draft = await generateDivergentCandidate(
          session,
          word === "explore" ? "explore" : "another",
        );
        session = recordCandidate(session, draft);
        candidate = session.currentCandidate;
        systemReply = candidate
          ? `From ${candidate.field}: ${candidate.summary}\n\nWhat would you change?`
          : "I need more context before I can offer an approach.";
        session = { ...session, state: "VOICE_USER_REACTION" };
        break;
      }

      case "reject": {
        const reason = (extra ?? "").trim() || "No reason given";
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
    await persist(session);

    return {
      session,
      systemReply,
      newState: session.state,
      candidate,
      controlWord: word,
    };
  },

  async getWrap(sessionId: string): Promise<VoiceWrapResult | undefined> {
    const s = await P02Repo.get(sessionId);
    return s?.wrapResult;
  },

  rules: P02_RULES,
};
