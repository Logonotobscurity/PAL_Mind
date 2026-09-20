import { useRef, useState } from "react";
import { Mic, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { runAnalysis } from "@/lib/conv-map/engine";
import { SAMPLE_TEXT } from "@/lib/conv-map/sample";
import { textFromUpload } from "@/lib/conv-map/parse-upload";
import { transcribeAudio } from "@/lib/conv-map/integrations.functions";
import { usePal } from "@/lib/pal/store";

export function CapturePanel() {
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const ingest = usePal((s) => s.ingestAnalysis);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);

  function save() {
    setErr(null);
    if (!text.trim()) {
      setErr("Paste, upload, or dictate first.");
      return;
    }
    const r = runAnalysis(text);
    if (!r.parsed.utterances.length) {
      setErr("Could not parse turns.");
      return;
    }
    ingest("Captured conversation", text, r.analysis);
    setText("");
  }

  function toggleListen() {
    const w = window as unknown as {
      SpeechRecognition?: new () => Rec;
      webkitSpeechRecognition?: new () => Rec;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setErr("Dictation needs Chromium Web Speech. Upload a file instead.");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      let chunk = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) chunk += ev.results[i][0].transcript;
      }
      if (chunk.trim()) setText((p) => `${p}\n[Speaker]: ${chunk.trim()}`.trim());
    };
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  }

  return (
    <div className="space-y-2">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Capture a conversation into PAL memory" />
      <div className="flex flex-wrap gap-2">
        <Button onClick={save}>Ingest into memory</Button>
        <Button variant="secondary" onClick={() => setText(SAMPLE_TEXT)}>
          Sample
        </Button>
        <Button variant="outline" type="button" onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" /> Text
        </Button>
        <Button variant="outline" type="button" onClick={() => audioRef.current?.click()}>
          <Upload className="size-4" /> Audio
        </Button>
        <Button variant={listening ? "default" : "outline"} type="button" onClick={toggleListen}>
          <Mic className="size-4" /> {listening ? "Stop" : "Talk"}
        </Button>
      </div>
      {err ? <p className="text-sm text-bad">{err}</p> : null}
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.json,.vtt,.srt"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) setText(textFromUpload(f.name, await f.text()));
          e.target.value = "";
        }}
      />
      <input
        ref={audioRef}
        type="file"
        accept="audio/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const buf = await f.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = "";
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          const res = await transcribeAudio({
            data: { filename: f.name, mime: f.type || "audio/webm", base64: btoa(binary) },
          });
          if (res.ok) setText((p) => (p ? p + "\n" : "") + res.text);
          else setErr(res.error);
          e.target.value = "";
        }}
      />
    </div>
  );
}

type Rec = {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
