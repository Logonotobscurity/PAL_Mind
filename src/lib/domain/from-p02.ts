/**
 * Map P02 voice session → first-class ExplorationSession + Candidate[].
 */

import type { VoiceDevelopmentSession, DivergentCandidate } from "@/lib/patterns/p02-voice-development";
import type { Candidate, ExplorationSession, SearchSpaceCoverage } from "./exploration";

function mapVoiceState(
  state: VoiceDevelopmentSession["state"],
): ExplorationSession["status"] {
  switch (state) {
    case "VOICE_LISTENING":
      return "open";
    case "VOICE_CLARIFYING":
      return "clarifying";
    case "VOICE_EXPLORATION_WAIT":
    case "VOICE_SINGLE_CANDIDATE":
    case "VOICE_USER_REACTION":
      return "exploring";
    case "VOICE_DEVELOP":
      return "developing";
    case "VOICE_WRAP":
      return "wrapped";
    case "VOICE_CLOSED":
      return "closed";
    default:
      return "open";
  }
}

export function candidateFromP02(
  c: DivergentCandidate,
  session: VoiceDevelopmentSession,
  status: Candidate["status"] = "proposed",
): Candidate {
  const rejected = session.rejections.find((r) => r.candidateId === c.id);
  return {
    id: c.id,
    sessionId: session.id,
    workspaceId: session.workspaceId,
    field: c.field,
    mechanism: c.mechanism,
    summary: c.summary,
    status: rejected ? "rejected" : status,
    rejectionReason: rejected?.reason,
    rejectionWording: rejected?.userWording,
    createdAt: c.createdAt,
    updatedAt: session.updatedAt,
    provenance: {
      pattern: "P02",
      controlWord: "explore",
    },
  };
}

export function explorationFromP02(session: VoiceDevelopmentSession): {
  exploration: ExplorationSession;
  candidates: Candidate[];
} {
  const candidates: Candidate[] = session.candidatesHistory.map((c) => {
    let status: Candidate["status"] = "proposed";
    if (session.rejections.some((r) => r.candidateId === c.id)) status = "rejected";
    else if (session.currentCandidate?.id === c.id && session.frozenDirection) status = "frozen";
    else if (session.currentCandidate?.id === c.id) status = "reacted";
    return candidateFromP02(c, session, status);
  });

  const coverage: SearchSpaceCoverage = {
    fieldsTouched: [...new Set(candidates.map((c) => c.field))],
    mechanismsTouched: [...new Set(candidates.map((c) => c.mechanism))],
    rejectionCount: session.rejections.length,
    hasHumanSelection: !!session.frozenDirection,
    questionCount: session.questionCount,
    changeMomentCount: session.changeMoments.length,
  };

  const frozen = candidates.find((c) => c.status === "frozen");

  const exploration: ExplorationSession = {
    id: `ex-${session.id}`,
    workspaceId: session.workspaceId,
    status: mapVoiceState(session.state),
    voiceSessionId: session.id,
    candidateIds: candidates.map((c) => c.id),
    frozenCandidateId: frozen?.id,
    frozenDirection: session.frozenDirection,
    changeMoments: session.changeMoments,
    coverage,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    wrappedAt:
      session.state === "VOICE_CLOSED" || session.state === "VOICE_WRAP"
        ? session.updatedAt
        : undefined,
  };

  return { exploration, candidates };
}
