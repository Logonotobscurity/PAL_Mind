import { createServerFn } from "@tanstack/react-start";
import { env } from "@/lib/env.server";
import { getInbound } from "@/lib/conv-map/inbound.server";

const APP_UID = "conversation-map";
const EVENT_TYPE = "conversation.analyzed";
const MAX_TURNS = 36;
const MAX_CHARS = 180;

export type ProviderStatus = {
  openrouterEnv: boolean;
  svixEnv: boolean;
  xaiEnv: boolean;
};

export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(async (): Promise<ProviderStatus> => {
  return {
    openrouterEnv: Boolean(env("OPENROUTER_API_KEY")),
    svixEnv: Boolean(env("SVIX_AUTH_TOKEN")),
    xaiEnv: Boolean(env("XAI_API_KEY")),
  };
});

export const getInboundTranscript = createServerFn({ method: "GET" }).handler(async () => {
  const inbound = getInbound();
  if (!inbound) return { ok: false as const, error: "No inbound webhook received yet." };
  return {
    ok: true as const,
    receivedAt: inbound.receivedAt,
    eventType: inbound.eventType,
    transcript: inbound.transcript,
  };
});

type EnrichInput = {
  transcript: string;
  lexiconSummary: string;
  openrouterKey?: string;
};

export const enrichWithOpenRouter = createServerFn({ method: "POST" })
  .validator((input: EnrichInput) => input)
  .handler(async ({ data }) => {
    const transcript = data.transcript.slice(0, 12_000);
    const key = (data.openrouterKey || env("OPENROUTER_API_KEY") || "").trim();
    const xai = env("XAI_API_KEY");

    const prompt = `You are reviewing a conversation analysis. The lexicon engine is rule-based and misses sarcasm.
Transcript (truncated):
${transcript}

Lexicon notes:
${data.lexiconSummary.slice(0, 2500)}

Return JSON only:
{"read":"2-4 sentence human read of the arc","agreesWithLexicon":true,"missedTriggers":["..."],"notes":["tuning notes for the lexicon"],"rephrasings":[{"pattern":"...","suggestion":"..."}]}`;

    if (key) {
      const result = await chatComplete({
        url: "https://openrouter.ai/api/v1/chat/completions",
        apiKey: key,
        model: "openrouter/free",
        extraHeaders: {
          "HTTP-Referer": "https://grok.com",
          "X-Title": "Conversation Map",
        },
        prompt,
      });
      if (result.ok) return { ...result, provider: "openrouter" as const, model: "openrouter/free" };
      if (!xai) return result;
    }

    if (xai) {
      const result = await chatComplete({
        url: "https://api.x.ai/v1/chat/completions",
        apiKey: xai,
        model: "grok-4.5",
        prompt,
      });
      if (result.ok) {
        return {
          ...result,
          provider: "xai" as const,
          model: "grok-4.5",
          note: key ? "OpenRouter failed; used Grok." : "No OpenRouter key — used Grok so this still works.",
        };
      }
      return result;
    }

    return {
      ok: false as const,
      error:
        "Add an OpenRouter API key (free models use openrouter/free) in the field below, or set OPENROUTER_API_KEY on the server.",
    };
  });

async function chatComplete(opts: {
  url: string;
  apiKey: string;
  model: string;
  prompt: string;
  extraHeaders?: Record<string, string>;
}) {
  const res = await fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
      ...opts.extraHeaders,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [{ role: "user", content: opts.prompt }],
      max_tokens: 700,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false as const, error: `Model error ${res.status}${body ? `: ${body.slice(0, 180)}` : ""}` };
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = json.choices?.[0]?.message?.content ?? "";
  const parsed = extractJson(raw);
  if (!parsed) return { ok: false as const, error: "The model did not return JSON." };
  return { ok: true as const, analysis: parsed, raw };
}

function extractJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as {
      read?: string;
      agreesWithLexicon?: boolean;
      missedTriggers?: string[];
      notes?: string[];
      rephrasings?: { pattern: string; suggestion: string }[];
    };
  } catch {
    return null;
  }
}

export function compactLexiconSummary(lines: string[], speakers: string[], overall: string) {
  return [`Speakers: ${speakers.join(", ")}`, `Overall conflict: ${overall}`, ...lines.slice(0, 8)].join("\n");
}

export { MAX_TURNS, MAX_CHARS };

type SvixPayload = {
  speakers: string[];
  turns: number;
  overall_level: string;
  summaryLines: string[];
  peakTopic?: string;
};

export const publishSvixAnalysis = createServerFn({ method: "POST" })
  .validator((input: SvixPayload) => input)
  .handler(async ({ data }) => {
    const token = env("SVIX_AUTH_TOKEN");
    if (!token) {
      return {
        ok: false as const,
        error:
          "Svix is not configured. Set SVIX_AUTH_TOKEN (from dashboard.svix.com/api-access). Outbound events use application uid “conversation-map” and event type conversation.analyzed.",
      };
    }
    const { Svix } = await import("svix");
    const svix = new Svix(token);
    try {
      await svix.application.getOrCreate({ name: "Conversation Map", uid: APP_UID });
    } catch (e) {
      return { ok: false as const, error: `Svix application: ${String(e)}` };
    }
    try {
      await svix.eventType.create({
        name: EVENT_TYPE,
        description: "A conversation was analyzed in Conversation Map",
      });
    } catch {
      /* already exists */
    }
    try {
      const msg = await svix.message.create(APP_UID, {
        eventType: EVENT_TYPE,
        payload: {
          type: EVENT_TYPE,
          speakers: data.speakers,
          turns: data.turns,
          overall_level: data.overall_level,
          summary: data.summaryLines.slice(0, 6),
          peakTopic: data.peakTopic ?? null,
        },
      });
      return { ok: true as const, messageId: msg.id };
    } catch (e) {
      return { ok: false as const, error: `Svix send: ${String(e)}` };
    }
  });

export const addSvixEndpoint = createServerFn({ method: "POST" })
  .validator((input: { url: string }) => input)
  .handler(async ({ data }) => {
    const token = env("SVIX_AUTH_TOKEN");
    if (!token) return { ok: false as const, error: "SVIX_AUTH_TOKEN is not set." };
    const url = data.url.trim();
    if (!/^https?:\/\//i.test(url)) return { ok: false as const, error: "Endpoint must be an http(s) URL." };
    const { Svix } = await import("svix");
    const svix = new Svix(token);
    await svix.application.getOrCreate({ name: "Conversation Map", uid: APP_UID });
    const ep = await svix.endpoint.create(APP_UID, {
      url,
      description: "Conversation Map analysis destination",
    });
    return { ok: true as const, id: ep.id, url: ep.url };
  });

export const transcribeAudio = createServerFn({ method: "POST" })
  .validator((input: { filename: string; mime: string; base64: string }) => input)
  .handler(async ({ data }) => {
    const xai = env("XAI_API_KEY");
    if (!xai) {
      return {
        ok: false as const,
        error: "Audio file transcription needs a server speech model. Use live dictation, or paste a transcript.",
      };
    }
    const bin = Buffer.from(data.base64, "base64");
    if (bin.length > 3_500_000) return { ok: false as const, error: "Audio file is too large (keep under ~3 MB)." };
    const form = new FormData();
    const blob = new Blob([bin], { type: data.mime || "audio/webm" });
    form.append("file", blob, data.filename || "audio.webm");
    form.append("model", "whisper-1");
    const res = await fetch("https://api.x.ai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${xai}` },
      body: form,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false as const, error: `Transcription failed (${res.status}). ${body.slice(0, 160)}` };
    }
    const json = (await res.json()) as { text?: string };
    if (!json.text?.trim()) return { ok: false as const, error: "Empty transcription." };
    return { ok: true as const, text: json.text.trim() };
  });
