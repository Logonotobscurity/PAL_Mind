import * as L from "./lexicon";

export type Sentiment = "positive" | "neutral" | "negative";
export type ConflictLevel = "low" | "rising" | "high" | "critical";

export type Trigger = {
  reason: string;
  pattern: string | null;
  topic: string;
};

export type ParsedUtterance = {
  idx: number;
  raw: string;
  time: number | null;
  speaker: string;
  source: "json" | "dialog";
};

export type UtteranceResult = {
  timestamp: string;
  time: number;
  speaker: string;
  text: string;
  topic: string;
  tone: string;
  sentiment: Sentiment;
  emotional_intensity: number;
  negative_words: string[];
  positive_words: string[];
  toxic_words: string[];
  patterns: string[];
  communication_pattern: string | null;
  possible_trigger: Trigger | null;
  conflict_delta: number;
  conflict_after: number;
  conflict_level: ConflictLevel;
  deescalating: boolean;
  idx: number;
};

export type Escalation = {
  time: number;
  timecode: string;
  speaker: string;
  idx: number;
  from: number;
  to: number;
  cause: string;
};

export type Deescalation = {
  time: number;
  timecode: string;
  speaker: string;
  idx: number;
  cause: string;
};

export type Analysis = {
  utterances: UtteranceResult[];
  escalations: Escalation[];
  deescalations: Deescalation[];
  speakers: string[];
};

export type Rephrasing = {
  pattern: string;
  suggestion: string;
  example: string;
  from_text: string;
};

export type Summary = {
  turns: number;
  speakers: Record<string, number>;
  topics: Record<string, number>;
  patterns: Record<string, number>;
  peak: UtteranceResult | null;
  summaryLines: string[];
  rephrasings: Rephrasing[];
  overall_level: ConflictLevel;
};

export type MindMapData = {
  topics: { label: string; children: UtteranceResult[] }[];
  triggers: UtteranceResult[];
  resolutions: UtteranceResult[];
};

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function round2(v: number) {
  return Math.round(v * 100) / 100;
}

export function toSeconds(ts: unknown): number | null {
  if (ts == null) return null;
  if (typeof ts === "number") return ts;
  const s = String(ts).trim();
  const m = s.match(/^(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)$/);
  if (m) return +(m[1] || 0) * 3600 + +m[2] * 60 + +m[3];
  const sec = parseFloat(s.replace(/s$/i, ""));
  return Number.isNaN(sec) ? null : sec;
}

export function fmtTs(sec: number | null | undefined) {
  if (sec == null || Number.isNaN(sec)) return "";
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return (
    (h > 0 ? (h < 10 ? "0" : "") + h + ":" : "") +
    (m < 10 ? "0" : "") +
    m +
    ":" +
    (s < 10 ? "0" : "") +
    s
  );
}

function snippet(text: string, n = 70) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t;
}

function cleanSpeaker(name: string) {
  return String(name)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(speaker|user)\s*[:.\-]?/i, "Speaker ");
}

function fillTimes(utterances: ParsedUtterance[]) {
  let t = 0;
  for (const u of utterances) {
    if (u.time == null) u.time = t;
    else t = u.time;
    t += Math.max(3, Math.min(30, Math.round(u.raw.length / 12)));
  }
}

export function parseTranscript(text: string): { utterances: ParsedUtterance[]; format: string } {
  if (!text || !text.trim()) return { utterances: [], format: "none" };
  const trimmed = text.trim();
  const utterances: ParsedUtterance[] = [];

  if (trimmed[0] === "{" || trimmed[0] === "[") {
    try {
      const obj = JSON.parse(trimmed) as Record<string, unknown> | unknown[];
      const segs = Array.isArray(obj)
        ? obj
        : ((obj as { segments?: unknown[]; utterances?: unknown[] }).segments ||
            (obj as { utterances?: unknown[] }).utterances ||
            null);
      if (segs && segs.length) {
        segs.forEach((rawSeg, i) => {
          const seg = rawSeg as Record<string, unknown>;
          const txt = String(seg.text || seg.content || "");
          if (!txt) return;
          utterances.push({
            idx: utterances.length,
            raw: txt,
            time: toSeconds(seg.start ?? seg.timestamp ?? seg.time),
            speaker: cleanSpeaker(String(seg.speaker || seg.speaker_name || "Speaker " + ((i % 2) + 1))),
            source: "json",
          });
        });
        fillTimes(utterances);
        return { utterances, format: "json" };
      }
    } catch {
      /* fall through */
    }
  }

  const lines = trimmed.split(/\r?\n/);
  const distinct: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(/^\s*(?:\[([^\]]+)\]\s*)?([^:]{1,40}?)\s*:\s?(.*)$/);
    if (m && m[3]) {
      const sp = cleanSpeaker(m[2]);
      if (!distinct.includes(sp)) distinct.push(sp);
      utterances.push({
        idx: utterances.length,
        raw: m[3],
        time: toSeconds(m[1]),
        speaker: sp,
        source: "dialog",
      });
      continue;
    }
    const prev = utterances[utterances.length - 1];
    if (prev && /^[\p{Ll}(,\s]/u.test(line) && line.length < 200) {
      prev.raw += " " + line;
      continue;
    }
    let other = distinct.filter((s) => s !== (prev ? prev.speaker : null))[0];
    if (!other) other = distinct[0] || "Speaker 2";
    if (!distinct.includes(other)) distinct.push(other);
    utterances.push({ idx: utterances.length, raw: line, time: null, speaker: other, source: "dialog" });
  }
  fillTimes(utterances);
  return { utterances, format: "dialog" };
}

function toneFor(
  sentiment: Sentiment,
  intensity: number,
  patterns: string[],
  toxHits: string[],
  deescalating: boolean,
) {
  if (toxHits.length) return "hostile";
  if (patterns.includes("Defensiveness")) return "defensive";
  if (deescalating) return "conciliatory";
  if (sentiment === "negative" && intensity > 0.45) return "frustrated";
  if (sentiment === "negative") return "negative";
  if (sentiment === "positive") return "positive";
  return "neutral";
}

export function levelFor(v: number): ConflictLevel {
  if (v < 0.34) return "low";
  if (v < 0.6) return "rising";
  if (v < 0.85) return "high";
  return "critical";
}

type Ctx = { conflict: number; results: UtteranceResult[] };

function analyzeUtterance(u: ParsedUtterance, ctx: Ctx) {
  const text = u.raw;
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z']+/g) || [];

  const posHits: string[] = [];
  const negHits: string[] = [];
  const toxHits: string[] = [];
  const boosters: string[] = [];
  words.forEach((w, i) => {
    let negated = false;
    for (let b = Math.max(0, i - 3); b < i; b++) {
      if (/^(not|n't|never|no|don't|doesn't|didn't|won't|can't|cannot|isn't|aren't|without)$/.test(words[b])) {
        negated = true;
        break;
      }
    }
    if (L.POSITIVE.includes(w)) posHits.push(negated ? "!" + w : w);
    if (L.NEGATIVE.includes(w)) negHits.push(negated ? "!" + w : w);
    if (L.TOXIC.includes(w)) toxHits.push(w);
    if (L.INTENSIFIERS.includes(w)) boosters.push(w);
  });
  for (const t of L.TOXIC) {
    if (t.includes(" ") && lower.includes(t) && !toxHits.includes(t)) toxHits.push(t);
  }

  const hasShout = /[A-Z]{2,}/.test(text) || /!{1,}/.test(text);
  const posCount = posHits.filter((w) => w[0] !== "!").length;
  const negCount = negHits.filter((w) => w[0] !== "!").length;
  const sentimentScore = posCount - negCount * 1.15;

  const patterns: string[] = [];
  function matchList(list: L.PatternRule[]) {
    for (const p of list) {
      if (p.re.test(text) && !patterns.includes(p.label)) patterns.push(p.label);
    }
  }
  matchList(L.GENERALIZATION_RE);
  matchList(L.ABSOLUTE_RE);
  matchList(L.BLAME_RE);
  matchList(L.DEFENSIVE_RE);
  matchList(L.CONCESSION_RE);
  matchList(L.REQUEST_RE);
  matchList(L.APOLOGY_RE);

  const negativePattern = /(Generalization|Absolute|Personal blame|Personal attack|Blame attribution|Defensiveness)/.test(
    patterns.join(" "),
  );
  const deescalating = /(Concession|Agreement|Apology|Willingness|De-escalation attempt|Compromise attempt)/.test(
    patterns.join(" "),
  );

  let sentiment: Sentiment;
  if (sentimentScore > 0.5) sentiment = "positive";
  else if (sentimentScore < -0.15) sentiment = "negative";
  else sentiment = "neutral";
  if (deescalating && toxHits.length === 0 && !negativePattern) {
    sentiment = sentimentScore >= 0.5 ? "positive" : "neutral";
  }

  const intensity = clamp(
    negCount * 0.2 + toxHits.length * 0.22 + boosters.length * 0.1 + (hasShout ? 0.2 : 0) + (negativePattern ? 0.12 : 0),
    0,
    1,
  );

  let topic = "General";
  let bestScore = 0;
  for (const t of L.TOPICS) {
    const hits = lower.match(new RegExp(t.re.source, "gi")) || [];
    const score = hits.length + (t.re.test(text) ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      topic = t.name;
    }
  }

  let delta = 0;
  if (sentiment === "negative") delta += 0.12 + intensity * 0.22;
  if (negativePattern) delta += 0.18;
  if (toxHits.length) delta += 0.22;
  if (deescalating) delta -= 0.4;
  else if (sentiment === "positive") delta -= 0.12;

  ctx.conflict = clamp(ctx.conflict + delta, 0, 1);

  let trigger: Trigger | null = null;
  if (sentiment === "negative" && (patterns.length || toxHits.length)) {
    trigger = {
      reason: toxHits.length ? `toxic or insulting wording (“${toxHits[0]}”)` : `a ${patterns[0].toLowerCase()} pattern`,
      pattern: patterns[0] || null,
      topic,
    };
  }

  const result: UtteranceResult = {
    timestamp: fmtTs(u.time),
    time: u.time ?? 0,
    speaker: u.speaker,
    text: u.raw,
    topic,
    tone: toneFor(sentiment, intensity, patterns, toxHits, deescalating),
    sentiment,
    emotional_intensity: round2(intensity),
    negative_words: negHits,
    positive_words: posHits,
    toxic_words: toxHits,
    patterns,
    communication_pattern: patterns[0] || null,
    possible_trigger: trigger,
    conflict_delta: round2(delta),
    conflict_after: round2(ctx.conflict),
    conflict_level: levelFor(ctx.conflict),
    deescalating,
    idx: u.idx,
  };
  ctx.results.push(result);
  return result;
}

export function analyzeAll(utterances: ParsedUtterance[]): Analysis {
  const ctx: Ctx = { conflict: 0.12, results: [] };
  for (const u of utterances) analyzeUtterance(u, ctx);
  const results = ctx.results;

  const escalations: Escalation[] = [];
  const deescalations: Deescalation[] = [];
  for (const r of results) {
    if (r.conflict_delta > 0.3) {
      escalations.push({
        time: r.time,
        timecode: r.timestamp,
        speaker: r.speaker,
        idx: r.idx,
        from: round2(r.conflict_after - r.conflict_delta),
        to: r.conflict_after,
        cause: r.toxic_words.length ? "toxic wording" : r.patterns[0] || r.sentiment + " turn",
      });
    }
    if (r.conflict_delta < -0.25) {
      deescalations.push({
        time: r.time,
        timecode: r.timestamp,
        speaker: r.speaker,
        idx: r.idx,
        cause: r.patterns[0] || "calming turn",
      });
    }
  }

  const speakers: string[] = [];
  for (const r of results) {
    if (!speakers.includes(r.speaker)) speakers.push(r.speaker);
  }
  return { utterances: results, escalations, deescalations, speakers };
}

const REPHRASINGS: Record<string, { suggestion: string; example: string }> = {
  Generalization: {
    suggestion: "Replace always/never with one specific instance — specifics are harder to argue with than absolutes.",
    example: "“You never help” → “I felt unsupported when the task was left unfinished.”",
  },
  "Absolute language": {
    suggestion: "Consider reviewing how often something actually happens — frequency data cools the argument.",
    example: "“You always …” → “This has happened a few times this week.”",
  },
  "Personal blame": {
    suggestion: "Shift from person to issue: describe the situation and its impact.",
    example: "“You’re the problem” → “The disagreement seems connected to unclear responsibilities.”",
  },
  "Personal attack": {
    suggestion: "Talk about the specific behavior, not the person.",
    example: "“You’re selfish” → “When the report went out late, it added work for the team.”",
  },
  "Blame attribution": {
    suggestion: "Ask “what contributed?” instead of “whose fault?”.",
    example: "“It’s your fault” → “What made the deadline slip, and what can we change?”",
  },
  Defensiveness: {
    suggestion: "Acknowledge the other person’s perspective before sharing yours.",
    example: "“That’s not true” → “I can see why it looked that way. Here’s what I saw.”",
  },
};

export function buildSummary(uris: UtteranceResult[]): Summary {
  const speakers: Record<string, number> = {};
  const topics: Record<string, number> = {};
  const patterns: Record<string, number> = {};
  for (const u of uris) {
    speakers[u.speaker] = (speakers[u.speaker] || 0) + 1;
    topics[u.topic] = (topics[u.topic] || 0) + 1;
    for (const p of u.patterns) patterns[p] = (patterns[p] || 0) + 1;
  }

  let peak: UtteranceResult | null = null;
  for (const u of uris) {
    if (!peak || u.conflict_after > peak.conflict_after) peak = u;
  }
  const trig = uris.filter((u) => u.possible_trigger);
  const de = uris.filter((u) => u.deescalating);
  const firstNeg = uris.find((u) => u.sentiment === "negative") || null;
  const topPatterns = Object.keys(patterns).sort((a, b) => patterns[b] - patterns[a]);

  const lines: string[] = [];
  lines.push(
    `Analyzed ${uris.length} turns · ${Object.keys(speakers).join(", ")} · topics: ${Object.keys(topics).join(" / ")}`,
  );
  if (topPatterns.length) {
    lines.push(
      `Detected pattern${topPatterns.length > 1 ? "s" : ""}: ${topPatterns.slice(0, 3).join(", ")} — may indicate recurring communication habits worth reviewing.`,
    );
  } else {
    lines.push("No strong linguistic patterns detected in this sample.");
  }
  if (peak && peak.conflict_after > 0.4) {
    lines.push(`Conflict appeared to peak at ${peak.timestamp} (${peak.conflict_level}), around the topic “${peak.topic}”.`);
  }
  if (trig.length) {
    const t0 = trig[0];
    lines.push(
      `A possible trigger appears around “${t0.topic}” at ${t0.timestamp}: “${snippet(t0.text)}” — likely related to ${t0.possible_trigger!.reason}. This interpretation is uncertain.`,
    );
  }
  if (de.length) {
    lines.push(
      `${de.length} de-escalation attempt${de.length > 1 ? "s" : ""} detected (concession / apology / agreement), starting at ${de[0].timestamp}.`,
    );
  }
  if (firstNeg && peak && peak.conflict_after > 0.4) {
    lines.push(`Consider reviewing the section from ${firstNeg.timestamp} to ${peak.timestamp} with the rephrasing suggestions below.`);
  }
  lines.push(
    "Note: emotion and intent cannot be determined perfectly from speech alone — every label here is probabilistic, not a verdict.",
  );

  const rephrasings: Rephrasing[] = [];
  const seen: Record<string, number> = {};
  for (const u of uris) {
    for (const p of u.patterns) {
      if (!seen[p] && REPHRASINGS[p]) {
        seen[p] = 1;
        rephrasings.push({
          pattern: p,
          suggestion: REPHRASINGS[p].suggestion,
          example: REPHRASINGS[p].example,
          from_text: u.text,
        });
      }
    }
  }
  if (!rephrasings.length) {
    rephrasings.push({
      pattern: "General",
      suggestion: "No pattern-specific suggestion — consider reviewing the conversation with the speakers directly.",
      example: "",
      from_text: "",
    });
  }

  return {
    turns: uris.length,
    speakers,
    topics,
    patterns,
    peak,
    summaryLines: lines,
    rephrasings,
    overall_level: peak ? peak.conflict_level : "low",
  };
}

export function buildMindMapData(uris: UtteranceResult[]): MindMapData {
  const topics: { label: string; children: UtteranceResult[] }[] = [];
  const map: Record<string, { label: string; children: UtteranceResult[] }> = {};
  for (const u of uris) {
    if (!map[u.topic]) {
      map[u.topic] = { label: u.topic, children: [] };
      topics.push(map[u.topic]);
    }
    map[u.topic].children.push(u);
  }
  return {
    topics,
    triggers: uris.filter((u) => u.possible_trigger),
    resolutions: uris.filter((u) => u.deescalating),
  };
}

export function runAnalysis(text: string) {
  const parsed = parseTranscript(text);
  const analysis = analyzeAll(parsed.utterances);
  const summary = buildSummary(analysis.utterances);
  const mind = buildMindMapData(analysis.utterances);
  return { parsed, analysis, summary, mind };
}
