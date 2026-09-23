/**
 * Search-Space Assurance (SSA) — LOG_ON option C
 *
 * An ActionProposal must not be born from a single untested idea.
 * SSA checks that the exploration session has meaningful coverage
 * before the Policy Engine / ASK gate may treat a direction as executable intent.
 */

import type {
  ActionProposalDraft,
  Candidate,
  ExplorationSession,
  SearchSpaceCoverage,
} from "./exploration";

export const SSA_RULES = {
  /** Minimum distinct external fields considered */
  minFields: 1,
  /** Prefer more than one mechanism when time allows */
  minMechanisms: 1,
  /** At least one explicit human selection (freeze) or wrap with direction */
  requireHumanSelection: true,
  /** Prefer at least one recorded rejection when multiple candidates existed */
  preferRejectionWhenMultiple: true,
  /** Minimum clarifying questions before forced exploration is acceptable */
  minQuestionsOrExplore: 1,
  /** Wrap must exist for full assurance */
  requireWrappedSession: true,
} as const;

export type SSACheckId =
  | "has_human_selection"
  | "min_fields"
  | "min_mechanisms"
  | "min_questions"
  | "session_wrapped"
  | "rejection_when_multiple";

export interface SSAFinding {
  id: SSACheckId;
  passed: boolean;
  message: string;
  required: boolean;
}

export interface SSAResult {
  passed: boolean;
  findings: SSAFinding[];
  coverage: SearchSpaceCoverage;
  /** Safe to hand to Policy Engine only when passed === true */
  mayCreateActionProposal: boolean;
}

export function buildCoverage(
  session: ExplorationSession,
  candidates: Candidate[],
): SearchSpaceCoverage {
  const sessionCandidates = candidates.filter((c) => c.sessionId === session.id);
  const fields = [...new Set(sessionCandidates.map((c) => c.field).filter(Boolean))];
  const mechanisms = [
    ...new Set(sessionCandidates.map((c) => c.mechanism).filter(Boolean)),
  ];
  const rejectionCount = sessionCandidates.filter((c) => c.status === "rejected").length;

  return {
    fieldsTouched: fields,
    mechanismsTouched: mechanisms,
    rejectionCount,
    hasHumanSelection: !!session.frozenCandidateId || !!session.frozenDirection,
    questionCount: session.coverage.questionCount,
    changeMomentCount: session.changeMoments.length,
  };
}

export function evaluateSearchSpaceAssurance(
  session: ExplorationSession,
  candidates: Candidate[],
): SSAResult {
  const coverage = buildCoverage(session, candidates);
  const findings: SSAFinding[] = [];

  findings.push({
    id: "has_human_selection",
    passed: coverage.hasHumanSelection,
    message: coverage.hasHumanSelection
      ? "Human selected or froze a direction."
      : "No freeze or explicit selection — cannot form an ActionProposal.",
    required: SSA_RULES.requireHumanSelection,
  });

  findings.push({
    id: "min_fields",
    passed: coverage.fieldsTouched.length >= SSA_RULES.minFields,
    message:
      coverage.fieldsTouched.length >= SSA_RULES.minFields
        ? `Fields considered: ${coverage.fieldsTouched.join(", ") || "—"}`
        : `Need at least ${SSA_RULES.minFields} external field(s); got ${coverage.fieldsTouched.length}.`,
    required: true,
  });

  findings.push({
    id: "min_mechanisms",
    passed: coverage.mechanismsTouched.length >= SSA_RULES.minMechanisms,
    message:
      coverage.mechanismsTouched.length >= SSA_RULES.minMechanisms
        ? `Mechanisms: ${coverage.mechanismsTouched.length}`
        : `Need at least ${SSA_RULES.minMechanisms} mechanism(s).`,
    required: true,
  });

  findings.push({
    id: "min_questions",
    passed: coverage.questionCount >= SSA_RULES.minQuestionsOrExplore || coverage.fieldsTouched.length > 0,
    message:
      coverage.questionCount >= SSA_RULES.minQuestionsOrExplore || coverage.fieldsTouched.length > 0
        ? `Questions: ${coverage.questionCount}`
        : "Need clarifying questions or at least one explore.",
    required: true,
  });

  const wrapped =
    session.status === "wrapped" || session.status === "closed" || !!session.wrappedAt;
  findings.push({
    id: "session_wrapped",
    passed: wrapped,
    message: wrapped
      ? "Session wrapped — provenance complete."
      : "Session not wrapped; wrap before ActionProposal.",
    required: SSA_RULES.requireWrappedSession,
  });

  const multiple = candidates.filter((c) => c.sessionId === session.id).length > 1;
  if (multiple && SSA_RULES.preferRejectionWhenMultiple) {
    findings.push({
      id: "rejection_when_multiple",
      passed: coverage.rejectionCount >= 1,
      message:
        coverage.rejectionCount >= 1
          ? `Rejections recorded: ${coverage.rejectionCount}`
          : "Multiple candidates without a recorded rejection (soft warning).",
      required: false,
    });
  }

  const requiredFailed = findings.some((f) => f.required && !f.passed);
  const passed = !requiredFailed;

  return {
    passed,
    findings,
    coverage,
    mayCreateActionProposal: passed,
  };
}

/**
 * Gate: only create an ActionProposalDraft when SSA passes.
 * Returns null and the SSA result when blocked.
 */
export function tryCreateActionProposal(
  session: ExplorationSession,
  candidates: Candidate[],
  direction: string,
): { proposal: ActionProposalDraft | null; ssa: SSAResult } {
  const ssa = evaluateSearchSpaceAssurance(session, candidates);
  if (!ssa.mayCreateActionProposal) {
    return { proposal: null, ssa };
  }

  const proposal: ActionProposalDraft = {
    id: `ap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    explorationSessionId: session.id,
    candidateId: session.frozenCandidateId,
    direction,
    workspaceId: session.workspaceId,
    createdAt: new Date().toISOString(),
  };

  return { proposal, ssa };
}
