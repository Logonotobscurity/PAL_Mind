import type { UtteranceResult } from "@/lib/conv-map/engine";
import { Badge } from "@/components/ui/badge";

function sentimentVariant(s: string) {
  if (s === "positive") return "positive" as const;
  if (s === "negative") return "negative" as const;
  return "default" as const;
}

function levelVariant(s: string) {
  if (s === "critical" || s === "high") return "negative" as const;
  if (s === "rising") return "warn" as const;
  return "default" as const;
}

export function TurnTable({ utterances }: { utterances: UtteranceResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-2 py-2 font-medium">Time</th>
            <th className="px-2 py-2 font-medium">Speaker</th>
            <th className="px-2 py-2 font-medium">Tone</th>
            <th className="px-2 py-2 font-medium">Intensity</th>
            <th className="px-2 py-2 font-medium">Conflict</th>
            <th className="px-2 py-2 font-medium">Topic</th>
            <th className="px-2 py-2 font-medium">Pattern</th>
            <th className="px-2 py-2 font-medium">Note</th>
            <th className="px-2 py-2 font-medium">Text</th>
          </tr>
        </thead>
        <tbody>
          {utterances.map((u) => (
            <tr key={u.idx} className="border-b border-border/70 align-top">
              <td className="px-2 py-2 font-mono text-xs tabular-nums">{u.timestamp}</td>
              <td className="px-2 py-2 font-medium">{u.speaker}</td>
              <td className="px-2 py-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant={sentimentVariant(u.sentiment)}>{u.sentiment}</Badge>
                  <Badge>{u.tone}</Badge>
                </div>
              </td>
              <td className="px-2 py-2 tabular-nums">{u.emotional_intensity.toFixed(2)}</td>
              <td className="px-2 py-2">
                <Badge variant={levelVariant(u.conflict_level)}>{u.conflict_level}</Badge>
              </td>
              <td className="px-2 py-2 text-muted-foreground">{u.topic}</td>
              <td className="px-2 py-2">{u.communication_pattern ?? "—"}</td>
              <td className="px-2 py-2 text-muted-foreground">
                {u.possible_trigger ? u.possible_trigger.reason : u.deescalating ? "calm" : "—"}
              </td>
              <td className="px-2 py-2 text-xs text-muted-foreground">
                {u.text.length > 72 ? u.text.slice(0, 72) + "…" : u.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
