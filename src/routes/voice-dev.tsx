import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceDevelopmentSession, VoiceControlWord } from "@/lib/patterns/p02-voice-development";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/voice-dev")({
  component: VoiceDevPage,
});

const CONTROLS: { word: VoiceControlWord; label: string }[] = [
  { word: "explore", label: "Explore" },
  { word: "another", label: "Another" },
  { word: "challenge", label: "Challenge" },
  { word: "freeze", label: "Freeze" },
  { word: "reject", label: "Reject" },
  { word: "back", label: "Back" },
  { word: "wrap", label: "Wrap" },
];

function VoiceDevPage() {
  const [session, setSession] = useState<VoiceDevelopmentSession | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.turns.length]);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/p02", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", workspaceId: "default" }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "start failed");
      setSession(data.session);
    } catch (e) {
      setError(e instanceof Error ? e.message : "start failed");
    } finally {
      setBusy(false);
    }
  }, []);

  const send = useCallback(
    async (text: string, asControl?: VoiceControlWord) => {
      if (!session || (!text.trim() && !asControl)) return;
      setBusy(true);
      setError(null);
      try {
        const body = asControl
          ? {
              action: "control",
              sessionId: session.id,
              word: asControl,
              text: text.trim() || undefined,
            }
          : {
              action: "speech",
              sessionId: session.id,
              text: text.trim(),
            };
        const res = await fetch("/api/p02", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error ?? "request failed");
        setSession(data.session);
        setInput("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "request failed");
      } finally {
        setBusy(false);
      }
    },
    [session],
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-background px-4 py-6 text-foreground">
      <header className="mb-4 border-b border-border pb-3">
        <h1 className="text-lg font-semibold tracking-tight">P02 · Voice Development Partner</h1>
        <p className="text-sm text-muted-foreground">
          Speak or type. Use control words to steer. Exploration only — no side effects.
        </p>
        {session && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            state: {session.state} · questions: {session.questionCount}/6 · id: {session.id.slice(0, 12)}…
          </p>
        )}
      </header>

      {!session ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-center text-sm text-muted-foreground">
            Start a session to develop an unfinished idea through conversation.
          </p>
          <Button onClick={start} disabled={busy}>
            {busy ? "Starting…" : "Start session"}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto pb-4">
            {session.turns.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  t.role === "user"
                    ? "ml-auto bg-foreground text-background"
                    : "mr-auto bg-muted text-foreground",
                )}
              >
                <pre className="whitespace-pre-wrap font-sans">{t.text}</pre>
              </div>
            ))}
            {session.currentCandidate && (
              <div className="rounded-xl border border-border bg-card p-3 text-sm">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Candidate · {session.currentCandidate.field}
                </div>
                <div className="mt-1 font-medium">{session.currentCandidate.mechanism}</div>
                <p className="mt-1 text-muted-foreground">{session.currentCandidate.summary}</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {CONTROLS.map((c) => (
              <Button
                key={c.word}
                variant="outline"
                size="sm"
                disabled={busy || session.state === "VOICE_CLOSED"}
                onClick={() => send("", c.word)}
              >
                {c.label}
              </Button>
            ))}
          </div>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak your next thought…"
              disabled={busy || session.state === "VOICE_CLOSED"}
              className="flex-1"
            />
            <Button type="submit" disabled={busy || !input.trim() || session.state === "VOICE_CLOSED"}>
              Send
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </>
      )}
    </div>
  );
}
