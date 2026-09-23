import { getSql } from "@/lib/db";
import type { VoiceDevelopmentSession } from "./types";

type Row = {
  id: string;
  workspace_id: string;
  state: string;
  question_count: number;
  turns: unknown;
  current_candidate: unknown;
  candidates_history: unknown;
  rejections: unknown;
  change_moments: unknown;
  frozen_direction: string | null;
  wrap_result: unknown;
  created_at: string;
  updated_at: string;
};

function rowToSession(r: Row): VoiceDevelopmentSession {
  return {
    id: r.id,
    workspaceId: r.workspace_id,
    state: r.state as VoiceDevelopmentSession["state"],
    questionCount: Number(r.question_count),
    turns: (r.turns as VoiceDevelopmentSession["turns"]) ?? [],
    currentCandidate: (r.current_candidate as VoiceDevelopmentSession["currentCandidate"]) ?? undefined,
    candidatesHistory: (r.candidates_history as VoiceDevelopmentSession["candidatesHistory"]) ?? [],
    rejections: (r.rejections as VoiceDevelopmentSession["rejections"]) ?? [],
    changeMoments: (r.change_moments as VoiceDevelopmentSession["changeMoments"]) ?? [],
    frozenDirection: r.frozen_direction ?? undefined,
    wrapResult: (r.wrap_result as VoiceDevelopmentSession["wrapResult"]) ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export const P02Repo = {
  async save(session: VoiceDevelopmentSession): Promise<void> {
    const sql = await getSql();
    await sql`
      insert into p02_voice_sessions (
        id, workspace_id, state, question_count, turns,
        current_candidate, candidates_history, rejections,
        change_moments, frozen_direction, wrap_result,
        created_at, updated_at
      ) values (
        ${session.id},
        ${session.workspaceId},
        ${session.state},
        ${session.questionCount},
        ${JSON.stringify(session.turns)}::jsonb,
        ${session.currentCandidate ? JSON.stringify(session.currentCandidate) : null}::jsonb,
        ${JSON.stringify(session.candidatesHistory)}::jsonb,
        ${JSON.stringify(session.rejections)}::jsonb,
        ${JSON.stringify(session.changeMoments)}::jsonb,
        ${session.frozenDirection ?? null},
        ${session.wrapResult ? JSON.stringify(session.wrapResult) : null}::jsonb,
        ${session.createdAt}::timestamptz,
        ${session.updatedAt}::timestamptz
      )
      on conflict (id) do update set
        state = excluded.state,
        question_count = excluded.question_count,
        turns = excluded.turns,
        current_candidate = excluded.current_candidate,
        candidates_history = excluded.candidates_history,
        rejections = excluded.rejections,
        change_moments = excluded.change_moments,
        frozen_direction = excluded.frozen_direction,
        wrap_result = excluded.wrap_result,
        updated_at = excluded.updated_at
    `;
  },

  async get(id: string): Promise<VoiceDevelopmentSession | null> {
    const sql = await getSql();
    const rows = await sql<Row>`
      select * from p02_voice_sessions where id = ${id} limit 1
    `;
    if (!rows.length) return null;
    return rowToSession(rows[0]);
  },

  async listByWorkspace(workspaceId: string, limit = 20): Promise<VoiceDevelopmentSession[]> {
    const sql = await getSql();
    const rows = await sql<Row>`
      select * from p02_voice_sessions
      where workspace_id = ${workspaceId}
      order by updated_at desc
      limit ${limit}
    `;
    return rows.map(rowToSession);
  },
};
