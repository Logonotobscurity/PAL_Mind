-- P02 Voice Development Partner sessions
create table if not exists p02_voice_sessions (
  id            text primary key,
  workspace_id  text not null,
  state         text not null,
  question_count integer not null default 0,
  turns         jsonb not null default '[]',
  current_candidate jsonb,
  candidates_history jsonb not null default '[]',
  rejections    jsonb not null default '[]',
  change_moments jsonb not null default '[]',
  frozen_direction text,
  wrap_result   jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists p02_voice_sessions_workspace_idx
  on p02_voice_sessions (workspace_id);

create index if not exists p02_voice_sessions_updated_idx
  on p02_voice_sessions (updated_at desc);
