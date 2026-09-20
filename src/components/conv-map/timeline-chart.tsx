import { useEffect, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UtteranceResult } from "@/lib/conv-map/engine";
import { fmtTs } from "@/lib/conv-map/engine";

const SENTIMENT_FILL: Record<string, string> = {
  positive: "var(--color-good)",
  negative: "var(--color-bad)",
  neutral: "var(--color-muted-foreground)",
};

function timeLabel(sec: number) {
  return fmtTs(sec).replace(/^00:/, "");
}

type Row = UtteranceResult & { conflictPct: number; speakerOffset: number };

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: Row;
}) {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  const r = 5 + payload.emotional_intensity * 6;
  const fill = SENTIMENT_FILL[payload.sentiment] ?? SENTIMENT_FILL.neutral;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={0.9} stroke="var(--color-fg)" strokeWidth={1} />
      {payload.possible_trigger ? (
        <polygon
          points={`${cx},${cy - r - 10} ${cx + 5},${cy - r - 3} ${cx - 5},${cy - r - 3}`}
          fill="var(--color-bad)"
        />
      ) : null}
      {payload.deescalating ? (
        <circle
          cx={cx}
          cy={cy + r + 7}
          r={4.5}
          fill="none"
          stroke="var(--color-good)"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
      ) : null}
    </g>
  );
}

function Tip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
}) {
  if (!active || !payload?.[0]) return null;
  const u = payload[0].payload;
  return (
    <div className="max-w-xs rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground shadow-sm">
      <p className="font-medium">
        {u.timestamp} · {u.speaker}
      </p>
      <p className="mt-1 text-muted-foreground">
        {u.sentiment} · intensity {u.emotional_intensity} · conflict {u.conflict_level}
      </p>
      {u.communication_pattern ? <p className="mt-1">{u.communication_pattern}</p> : null}
      <p className="mt-1 leading-snug">{u.text}</p>
    </div>
  );
}

export function TimelineChart({ utterances }: { utterances: UtteranceResult[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const speakers = Array.from(new Set(utterances.map((u) => u.speaker)));
  const speakerIndex = Object.fromEntries(speakers.map((s, i) => [s, i]));
  const data: Row[] = utterances.map((u) => ({
    ...u,
    conflictPct: Math.round(u.conflict_after * 100),
    speakerOffset: (speakerIndex[u.speaker] ?? 0) + 1,
  }));

  if (!ready) {
    return <div className="h-72 animate-pulse rounded-lg bg-muted" aria-hidden />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Conflict level</p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={timeLabel}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />
              <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={11} width={36} />
              <Tooltip content={<Tip />} />
              <Area
                type="monotone"
                dataKey="conflictPct"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.12}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Speaker lanes</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid stroke="var(--color-border)" />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={timeLabel}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />
              <YAxis
                dataKey="speakerOffset"
                type="number"
                domain={[0.4, speakers.length + 0.6]}
                ticks={speakers.map((_, i) => i + 1)}
                tickFormatter={(v) => speakers[v - 1] ?? ""}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                width={72}
              />
              <Tooltip content={<Tip />} />
              <Scatter data={data} dataKey="speakerOffset" shape={<CustomDot />} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-bad" /> negative
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground" /> neutral
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-good" /> positive
          </li>
          <li>triangle = possible trigger</li>
          <li>dashed ring = de-escalation</li>
        </ul>
      </div>
    </div>
  );
}
