import { env } from "@/lib/env.server";
import { P02_SYSTEM_PROMPT } from "./runtime";
import type { DivergentCandidate, VoiceDevelopmentSession } from "./types";

export type CandidateDraft = {
  field: string;
  mechanism: string;
  summary: string;
};

/**
 * Generate exactly one divergent candidate.
 * Uses xAI when XAI_API_KEY is present; otherwise a structured offline fallback
 * so the UI and state machine remain fully exercisable.
 */
export async function generateDivergentCandidate(
  session: VoiceDevelopmentSession,
  mode: "explore" | "another",
): Promise<CandidateDraft> {
  const key = env("XAI_API_KEY");
  if (!key) {
    return offlineFallback(session, mode);
  }

  try {
    const userContext = session.turns
      .filter((t) => t.role === "user")
      .map((t) => t.text)
      .join("\n");

    const body = {
      model: "grok-2-latest",
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: P02_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `Mode: ${mode}`,
            "Generate exactly one unexpected approach.",
            "Respond with ONLY valid JSON of the form:",
            '{"field":"...","mechanism":"...","summary":"..."}',
            "No markdown, no extra keys.",
            "",
            "Conversation so far:",
            userContext || "(no prior turns)",
          ].join("\n"),
        },
      ],
    };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("[p02/llm] xAI error", res.status, await res.text());
      return offlineFallback(session, mode);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return offlineFallback(session, mode);

    const parsed = JSON.parse(jsonMatch[0]) as CandidateDraft;
    if (!parsed.field || !parsed.mechanism || !parsed.summary) {
      return offlineFallback(session, mode);
    }
    return parsed;
  } catch (err) {
    console.error("[p02/llm] generate failed", err);
    return offlineFallback(session, mode);
  }
}

function offlineFallback(
  session: VoiceDevelopmentSession,
  mode: "explore" | "another",
): CandidateDraft {
  const used = new Set(session.candidatesHistory.map((c) => c.field));
  const pool: CandidateDraft[] = [
    {
      field: "ecology",
      mechanism: "mutualistic exchange instead of one-way delivery",
      summary:
        "Treat every follow-up as a mutualistic exchange — both sides must gain something measurable, otherwise the link dies.",
    },
    {
      field: "logistics",
      mechanism: "just-in-time staging rather than batch push",
      summary:
        "Stage only what is needed for the next visible step; do not pre-load the full plan.",
    },
    {
      field: "theatre",
      mechanism: "rehearsal loop with explicit audience cues",
      summary:
        "Run a short rehearsal of the next message with a real person before sending it at scale.",
    },
    {
      field: "agriculture",
      mechanism: "crop rotation of channels",
      summary:
        "Rotate contact channels deliberately so no single channel becomes the only path and fatigue sets in.",
    },
    {
      field: "emergency medicine",
      mechanism: "triage before treatment",
      summary:
        "Sort every open thread by urgency and impact first; only then apply the follow-up protocol.",
    },
  ];

  const available = pool.filter((p) => !used.has(p.field));
  const pick = available.length
    ? available[mode === "another" ? available.length - 1 : 0]
    : pool[0];
  return pick;
}
