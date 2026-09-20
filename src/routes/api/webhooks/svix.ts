import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/webhooks/svix")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { env } = await import("@/lib/env.server");
        const { storeInbound } = await import("@/lib/conv-map/inbound.server");
        const payload = await request.text();
        const secret = env("SVIX_WEBHOOK_SECRET");
        if (secret) {
          const { Webhook } = await import("svix");
          const headers = {
            "svix-id": request.headers.get("svix-id") ?? "",
            "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
            "svix-signature": request.headers.get("svix-signature") ?? "",
          };
          try {
            new Webhook(secret).verify(payload, headers);
          } catch {
            return new Response(JSON.stringify({ ok: false, error: "invalid signature" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }
        }
        let body: Record<string, unknown> = {};
        try {
          body = JSON.parse(payload) as Record<string, unknown>;
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid json" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const eventType = String(body.type || body.eventType || "unknown");
        const transcript = extractTranscript(body);
        storeInbound({
          receivedAt: new Date().toISOString(),
          eventType,
          transcript,
        });
        return new Response(JSON.stringify({ ok: true, stored: Boolean(transcript) }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});

function extractTranscript(body: Record<string, unknown>) {
  if (typeof body.transcript === "string") return body.transcript;
  if (typeof body.text === "string") return body.text;
  const nested = body.data;
  if (nested && typeof nested === "object") {
    const d = nested as Record<string, unknown>;
    if (typeof d.transcript === "string") return d.transcript;
    if (typeof d.text === "string") return d.text;
  }
  return "";
}
