import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceDevelopmentSession, VoiceControlWord } from "@/lib/patterns/p02-voice-development";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Square } from "lucide-react";

const CONTROLS: { word: VoiceControlWord; label: string }[] = [
  { word: "explore", label: "Explore" },
  { word: "another", label: "Another" },
  { word: "challenge", label: "Challenge" },
  { word: "freeze", label: "Freeze" },
  { word: "reject", label: "Reject" },
  { word: "back", label: "Back" },
  { word: "wrap", label: "Wrap" },
];

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [i: number]: { isFinal: boolean; [j: number]: { transcript: string } };
  };
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceDevChat({ compact = false }: { compact?: boolean }) {
  const [session, setSession] = useState<VoiceDevelopmentSession | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    setSpeechSupported(!!getSpeechRecognition());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.turns.length, interim]);

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
      const current = sessionRef.current;
      if (!current || (!text.trim() && !asControl)) return;
      setBusy(true);
      setError(null);
      try {
        const body = asControl
          ? {
              action: "control" as const,
              sessionId: current.id,
              word: asControl,
              text: text.trim() || undefined,
            }
          : {
              action: "speech" as const,
              sessionId: current.id,
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
        setInterim("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "request failed");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setError("Speech recognition not supported in this browser. Use Chrome or Edge.");
      return;
    }
    if (!sessionRef.current) {
      setError("Start a session first.");
      return;
    }
    if (sessionRef.current.state === "VOICE_CLOSED") return;

    try {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      let finalChunk = "";

      rec.onresult = (ev) => {
        let interimText = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const result = ev.results[i];
          const transcript = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalChunk += transcript + " ";
          } else {
            interimText += transcript;
          }
        }
        setInterim(interimText);
        if (finalChunk.trim()) {
          const toSend = finalChunk.trim();
          finalChunk = "";
          void send(toSend);
        }
      };

      rec.onerror = (ev) => {
        if (ev.error === "aborted" || ev.error === "no-speech") return;
        setError(`Mic error: ${ev.error}`);
        setListening(false);
      };

      rec.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = rec;
      rec.start();
      setListening(true);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start microphone");
      setListening(false);
    }
  }, [send]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return (
    <div className={cn("flex flex-col text-foreground", compact ? "min-h-[70vh]" : "min-h-screen")}>
      <header className="mb-3 border-b border-border pb-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Develop ideas by talking
        </p>
        <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">Voice</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Speak or type. Control words steer exploration. No side effects — only direction.
        </p>
        {session && (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {session.state} · q {session.questionCount}/6
            {listening ? " · listening" : ""}
          </p>
        )}
      </header>

      {!session ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            Start a session to develop an unfinished idea. Use the mic for real voice input.
          </p>
          <Button onClick={start} disabled={busy}>
            {busy ? "Starting…" : "Start session"}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto pb-3">
            {session.turns.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  t.role === "user"
                    ? "ml-auto bg-foreground text-background"
                    : "mr-auto bg-muted text-foreground",
                )}
              >
                <pre className="whitespace-pre-wrap font-sans">{t.text}</pre>
              </div>
            ))}
            {interim && (
              <div className="mr-auto max-w-[88%] rounded-2xl bg-muted/60 px-3.5 py-2 text-sm italic text-muted-foreground">
                {interim}…
              </div>
            )}
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
                onClick={() => void send("", c.word)}
              >
                {c.label}
              </Button>
            ))}
          </div>

          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            {speechSupported && (
              <Button
                type="button"
                variant={listening ? "default" : "secondary"}
                size="sm"
                className="size-11 shrink-0 px-0"
                disabled={busy || session.state === "VOICE_CLOSED"}
                onClick={() => (listening ? stopListening() : startListening())}
                aria-label={listening ? "Stop listening" : "Start microphone"}
              >
                {listening ? <Square className="size-4" /> : <Mic className="size-4" />}
              </Button>
            )}
            {!speechSupported && (
              <span className="shrink-0 text-muted-foreground" title="Speech not supported">
                <MicOff className="size-4" />
              </span>
            )}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening… or type" : "Type or use the mic…"}
              disabled={busy || session.state === "VOICE_CLOSED"}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={busy || !input.trim() || session.state === "VOICE_CLOSED"}
            >
              Send
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          {listening && (
            <p className="mt-1 text-xs text-muted-foreground">
              Microphone active — final phrases are sent automatically. Tap the square to stop.
            </p>
          )}
        </>
      )}
    </div>
  );
}
