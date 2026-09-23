import { createFileRoute } from "@tanstack/react-router";
import { VoiceDevelopmentService } from "@/lib/patterns/p02-voice-development";
import type { VoiceControlWord } from "@/lib/patterns/p02-voice-development";

const CONTROL_WORDS = new Set<string>([
  "explore",
  "another",
  "challenge",
  "freeze",
  "reject",
  "back",
  "wrap",
]);

export const Route = createFileRoute("/api/p02")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            action: "start" | "speech" | "control" | "get";
            workspaceId?: string;
            sessionId?: string;
            text?: string;
            word?: string;
            initial?: string;
          };

          if (body.action === "start") {
            const session = await VoiceDevelopmentService.startSession(
              body.workspaceId ?? "default",
              body.initial,
            );
            return Response.json({ ok: true, session });
          }

          if (body.action === "get") {
            if (!body.sessionId) {
              return Response.json({ ok: false, error: "sessionId required" }, { status: 400 });
            }
            const session = await VoiceDevelopmentService.getSession(body.sessionId);
            if (!session) {
              return Response.json({ ok: false, error: "not found" }, { status: 404 });
            }
            return Response.json({ ok: true, session });
          }

          if (body.action === "speech") {
            if (!body.sessionId || !body.text) {
              return Response.json({ ok: false, error: "sessionId and text required" }, { status: 400 });
            }
            const result = await VoiceDevelopmentService.processUserSpeech(body.sessionId, body.text);
            return Response.json({ ok: true, ...result });
          }

          if (body.action === "control") {
            if (!body.sessionId || !body.word || !CONTROL_WORDS.has(body.word)) {
              return Response.json(
                { ok: false, error: "sessionId and valid control word required" },
                { status: 400 },
              );
            }
            const result = await VoiceDevelopmentService.handleControlWord(
              body.sessionId,
              body.word as VoiceControlWord,
              body.text,
            );
            return Response.json({ ok: true, ...result });
          }

          return Response.json({ ok: false, error: "unknown action" }, { status: 400 });
        } catch (err) {
          console.error("[api/p02]", err);
          return Response.json(
            { ok: false, error: err instanceof Error ? err.message : "server error" },
            { status: 500 },
          );
        }
      },
    },
  },
});
