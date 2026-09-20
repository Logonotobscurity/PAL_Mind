import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as Mic, i as Puzzle, o as MessageSquare, r as SquareCheckBig, s as House, t as Upload } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BBGeGDmH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-11 px-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-muted",
			ghost: "text-foreground hover:bg-muted",
			outline: "border border-border bg-transparent hover:bg-muted"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 min-h-9 px-3 text-xs",
			lg: "h-12 px-5"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	ref,
	className: cn("flex min-h-48 w-full rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm font-mono leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
	...props
}));
Textarea.displayName = "Textarea";
var POSITIVE = [
	"agree",
	"agreed",
	"appreciate",
	"appreciated",
	"good",
	"great",
	"happy",
	"thank",
	"thanks",
	"thankful",
	"helpful",
	"understand",
	"understood",
	"okay",
	"ok",
	"fine",
	"love",
	"like",
	"nice",
	"best",
	"better",
	"clear",
	"clearly",
	"solution",
	"resolve",
	"resolved",
	"fair",
	"works",
	"working",
	"support",
	"trust",
	"glad",
	"yes",
	"sure",
	"perfect",
	"awesome",
	"calm",
	"hopeful",
	"willing",
	"let",
	"lets",
	"together",
	"tomorrow"
];
var NEGATIVE = [
	"never",
	"always",
	"hate",
	"bad",
	"worst",
	"wrong",
	"failure",
	"failed",
	"fail",
	"impossible",
	"stupid",
	"useless",
	"waste",
	"wasted",
	"ignore",
	"ignored",
	"interrupt",
	"blame",
	"blamed",
	"fault",
	"problem",
	"unfair",
	"late",
	"missed",
	"forgot",
	"can't",
	"cannot",
	"won't",
	"nothing",
	"nobody",
	"terrible",
	"awful",
	"angry",
	"frustrated",
	"frustrating",
	"annoying",
	"annoyed",
	"upset",
	"sick",
	"tired",
	"lying",
	"lie",
	"liar",
	"selfish",
	"lazy",
	"crazy",
	"unprofessional",
	"disappointed",
	"disappointing",
	"pointless",
	"ridiculous",
	"unacceptable",
	"hard",
	"difficult",
	"stressful",
	"stressed",
	"furious",
	"mad",
	"irritating",
	"irritated",
	"fed",
	"defensive",
	"blames",
	"ignores",
	"ignoring",
	"sarcastic",
	"broken",
	"ruined",
	"mess",
	"chaos",
	"chaotic"
];
var TOXIC = [
	"stupid",
	"idiot",
	"dumb",
	"useless",
	"liar",
	"lying",
	"shut up",
	"pathetic",
	"ridiculous",
	"unprofessional",
	"selfish",
	"lazy",
	"crazy",
	"hate",
	"loser",
	"incompetent",
	"disgusting",
	"shame",
	"jerk",
	"nonsense",
	"moron",
	"insane"
];
var INTENSIFIERS = [
	"very",
	"really",
	"so",
	"extremely",
	"absolutely",
	"totally",
	"completely",
	"utterly",
	"insanely",
	"super",
	"incredibly",
	"horribly",
	"constantly"
];
var GENERALIZATION_RE = [
	{
		re: /\b(you|she|he|they|it)\s+(never|always)\b/i,
		label: "Generalization"
	},
	{
		re: /\b(every time|every single time|all the time|every damn time)\b/i,
		label: "Generalization"
	},
	{
		re: /\b(nobody|everyone|everybody|no one)\s+(ever|always|never)\b/i,
		label: "Generalization"
	},
	{
		re: /\b(everything|nothing|everyone|everybody)\b.{0,14}\b(always|never)\b/i,
		label: "Generalization"
	},
	{
		re: /\bthe (same|usual|typical) (thing|story|excuse)\b/i,
		label: "Generalization"
	}
];
var ABSOLUTE_RE = [{
	re: /\balways\b|\bnever\b/i,
	label: "Absolute language"
}];
var BLAME_RE = [
	{
		re: /\b(always|never|everything)\b.{0,12}\bmy fault\b/i,
		label: "Blame attribution"
	},
	{
		re: /\byou('re| are) (the )?(problem|reason|cause)\b/i,
		label: "Personal blame"
	},
	{
		re: /\bit('s| is) (all )?your fault\b/i,
		label: "Personal blame"
	},
	{
		re: /\byou('re| are) (so |too )?(selfish|lazy|stupid|useless|incompetent|wrong)\b/i,
		label: "Personal attack"
	},
	{
		re: /\byou (always|never) (blame|accuse|criticize)\b/i,
		label: "Blame attribution"
	}
];
var DEFENSIVE_RE = [
	{
		re: /\b(that's|that is) not (fair|true|my fault|accurate)\b/i,
		label: "Defensiveness"
	},
	{
		re: /\bnot (my|our) fault\b/i,
		label: "Defensiveness"
	},
	{
		re: /\byou always blame me\b/i,
		label: "Defensiveness"
	},
	{
		re: /\byou don't understand\b/i,
		label: "Defensiveness"
	}
];
var CONCESSION_RE = [
	{
		re: /\b(okay|ok|fine|alright|fair enough|you're right|you are right)\b/i,
		label: "Concession"
	},
	{
		re: /\b(agree|agreed|let's|lets|let us|shall we)\b/i,
		label: "Agreement"
	},
	{
		re: /\bwilling to\b/i,
		label: "Willingness to adjust"
	},
	{
		re: /\b(step back|move on|take a break|start fresh|both need to|we both)\b/i,
		label: "De-escalation attempt"
	},
	{
		re: /\b(together|compromise|meet halfway|work it out)\b/i,
		label: "Compromise attempt"
	}
];
var REQUEST_RE = [{
	re: /\b(can you|could you|would you|please|how about|maybe we|maybe we should|let's|lets)\b/i,
	label: "Request / proposal"
}];
var APOLOGY_RE = [{
	re: /\b(sorry|apologize|apologies|my bad|my mistake)\b/i,
	label: "Apology"
}];
var TOPICS = [
	{
		name: "Deadlines & deliverables",
		re: /\b(deadline|deadlines|deliver|deliverables|report|task|tasks|schedule|meeting|on time|late|requirements)\b/i
	},
	{
		name: "Responsibility & blame",
		re: /\b(responsib|fault|blame|accountab|who (did|was)|your job|my job|priorit|expectations|unclear)\b/i
	},
	{
		name: "Communication",
		re: /\b(listen|heard|unheard|ignore|interrupt|communicat|talk|explain|explanation|message|clarif|point|get to)\b/i
	},
	{
		name: "Respect & fairness",
		re: /\b(respect|appreciate|fair|unfair|value|trust)\b/i
	},
	{
		name: "Money & budget",
		re: /\b(money|budget|bill|cost|pay|expensive|salary)\b/i
	},
	{
		name: "Family & home",
		re: /\b(family|kids|children|home|house|dinner|weekend|partner)\b/i
	},
	{
		name: "Health & wellbeing",
		re: /\b(health|tired|exhausted|stress|stressful|sick|sleep|burnt)\b/i
	}
];
function clamp(v, lo, hi) {
	return Math.max(lo, Math.min(hi, v));
}
function round2(v) {
	return Math.round(v * 100) / 100;
}
function toSeconds(ts) {
	if (ts == null) return null;
	if (typeof ts === "number") return ts;
	const s = String(ts).trim();
	const m = s.match(/^(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)$/);
	if (m) return +(m[1] || 0) * 3600 + +m[2] * 60 + +m[3];
	const sec = parseFloat(s.replace(/s$/i, ""));
	return Number.isNaN(sec) ? null : sec;
}
function fmtTs(sec) {
	if (sec == null || Number.isNaN(sec)) return "";
	sec = Math.max(0, Math.round(sec));
	const h = Math.floor(sec / 3600);
	const m = Math.floor(sec % 3600 / 60);
	const s = sec % 60;
	return (h > 0 ? (h < 10 ? "0" : "") + h + ":" : "") + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}
function snippet(text, n = 70) {
	const t = text.replace(/\s+/g, " ").trim();
	return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "") + "…" : t;
}
function cleanSpeaker(name) {
	return String(name).trim().replace(/\s+/g, " ").replace(/^(speaker|user)\s*[:.\-]?/i, "Speaker ");
}
function fillTimes(utterances) {
	let t = 0;
	for (const u of utterances) {
		if (u.time == null) u.time = t;
		else t = u.time;
		t += Math.max(3, Math.min(30, Math.round(u.raw.length / 12)));
	}
}
function parseTranscript(text) {
	if (!text || !text.trim()) return {
		utterances: [],
		format: "none"
	};
	const trimmed = text.trim();
	const utterances = [];
	if (trimmed[0] === "{" || trimmed[0] === "[") try {
		const obj = JSON.parse(trimmed);
		const segs = Array.isArray(obj) ? obj : obj.segments || obj.utterances || null;
		if (segs && segs.length) {
			segs.forEach((rawSeg, i) => {
				const seg = rawSeg;
				const txt = String(seg.text || seg.content || "");
				if (!txt) return;
				utterances.push({
					idx: utterances.length,
					raw: txt,
					time: toSeconds(seg.start ?? seg.timestamp ?? seg.time),
					speaker: cleanSpeaker(String(seg.speaker || seg.speaker_name || "Speaker " + (i % 2 + 1))),
					source: "json"
				});
			});
			fillTimes(utterances);
			return {
				utterances,
				format: "json"
			};
		}
	} catch {}
	const lines = trimmed.split(/\r?\n/);
	const distinct = [];
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
				source: "dialog"
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
		utterances.push({
			idx: utterances.length,
			raw: line,
			time: null,
			speaker: other,
			source: "dialog"
		});
	}
	fillTimes(utterances);
	return {
		utterances,
		format: "dialog"
	};
}
function toneFor(sentiment, intensity, patterns, toxHits, deescalating) {
	if (toxHits.length) return "hostile";
	if (patterns.includes("Defensiveness")) return "defensive";
	if (deescalating) return "conciliatory";
	if (sentiment === "negative" && intensity > .45) return "frustrated";
	if (sentiment === "negative") return "negative";
	if (sentiment === "positive") return "positive";
	return "neutral";
}
function levelFor(v) {
	if (v < .34) return "low";
	if (v < .6) return "rising";
	if (v < .85) return "high";
	return "critical";
}
function analyzeUtterance(u, ctx) {
	const text = u.raw;
	const lower = text.toLowerCase();
	const words = lower.match(/[a-z']+/g) || [];
	const posHits = [];
	const negHits = [];
	const toxHits = [];
	const boosters = [];
	words.forEach((w, i) => {
		let negated = false;
		for (let b = Math.max(0, i - 3); b < i; b++) if (/^(not|n't|never|no|don't|doesn't|didn't|won't|can't|cannot|isn't|aren't|without)$/.test(words[b])) {
			negated = true;
			break;
		}
		if (POSITIVE.includes(w)) posHits.push(negated ? "!" + w : w);
		if (NEGATIVE.includes(w)) negHits.push(negated ? "!" + w : w);
		if (TOXIC.includes(w)) toxHits.push(w);
		if (INTENSIFIERS.includes(w)) boosters.push(w);
	});
	for (const t of TOXIC) if (t.includes(" ") && lower.includes(t) && !toxHits.includes(t)) toxHits.push(t);
	const hasShout = /[A-Z]{2,}/.test(text) || /!{1,}/.test(text);
	const posCount = posHits.filter((w) => w[0] !== "!").length;
	const negCount = negHits.filter((w) => w[0] !== "!").length;
	const sentimentScore = posCount - negCount * 1.15;
	const patterns = [];
	function matchList(list) {
		for (const p of list) if (p.re.test(text) && !patterns.includes(p.label)) patterns.push(p.label);
	}
	matchList(GENERALIZATION_RE);
	matchList(ABSOLUTE_RE);
	matchList(BLAME_RE);
	matchList(DEFENSIVE_RE);
	matchList(CONCESSION_RE);
	matchList(REQUEST_RE);
	matchList(APOLOGY_RE);
	const negativePattern = /(Generalization|Absolute|Personal blame|Personal attack|Blame attribution|Defensiveness)/.test(patterns.join(" "));
	const deescalating = /(Concession|Agreement|Apology|Willingness|De-escalation attempt|Compromise attempt)/.test(patterns.join(" "));
	let sentiment;
	if (sentimentScore > .5) sentiment = "positive";
	else if (sentimentScore < -.15) sentiment = "negative";
	else sentiment = "neutral";
	if (deescalating && toxHits.length === 0 && !negativePattern) sentiment = sentimentScore >= .5 ? "positive" : "neutral";
	const intensity = clamp(negCount * .2 + toxHits.length * .22 + boosters.length * .1 + (hasShout ? .2 : 0) + (negativePattern ? .12 : 0), 0, 1);
	let topic = "General";
	let bestScore = 0;
	for (const t of TOPICS) {
		const score = (lower.match(new RegExp(t.re.source, "gi")) || []).length + (t.re.test(text) ? 1 : 0);
		if (score > bestScore) {
			bestScore = score;
			topic = t.name;
		}
	}
	let delta = 0;
	if (sentiment === "negative") delta += .12 + intensity * .22;
	if (negativePattern) delta += .18;
	if (toxHits.length) delta += .22;
	if (deescalating) delta -= .4;
	else if (sentiment === "positive") delta -= .12;
	ctx.conflict = clamp(ctx.conflict + delta, 0, 1);
	let trigger = null;
	if (sentiment === "negative" && (patterns.length || toxHits.length)) trigger = {
		reason: toxHits.length ? `toxic or insulting wording (“${toxHits[0]}”)` : `a ${patterns[0].toLowerCase()} pattern`,
		pattern: patterns[0] || null,
		topic
	};
	const result = {
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
		idx: u.idx
	};
	ctx.results.push(result);
	return result;
}
function analyzeAll(utterances) {
	const ctx = {
		conflict: .12,
		results: []
	};
	for (const u of utterances) analyzeUtterance(u, ctx);
	const results = ctx.results;
	const escalations = [];
	const deescalations = [];
	for (const r of results) {
		if (r.conflict_delta > .3) escalations.push({
			time: r.time,
			timecode: r.timestamp,
			speaker: r.speaker,
			idx: r.idx,
			from: round2(r.conflict_after - r.conflict_delta),
			to: r.conflict_after,
			cause: r.toxic_words.length ? "toxic wording" : r.patterns[0] || r.sentiment + " turn"
		});
		if (r.conflict_delta < -.25) deescalations.push({
			time: r.time,
			timecode: r.timestamp,
			speaker: r.speaker,
			idx: r.idx,
			cause: r.patterns[0] || "calming turn"
		});
	}
	const speakers = [];
	for (const r of results) if (!speakers.includes(r.speaker)) speakers.push(r.speaker);
	return {
		utterances: results,
		escalations,
		deescalations,
		speakers
	};
}
var REPHRASINGS = {
	Generalization: {
		suggestion: "Replace always/never with one specific instance — specifics are harder to argue with than absolutes.",
		example: "“You never help” → “I felt unsupported when the task was left unfinished.”"
	},
	"Absolute language": {
		suggestion: "Consider reviewing how often something actually happens — frequency data cools the argument.",
		example: "“You always …” → “This has happened a few times this week.”"
	},
	"Personal blame": {
		suggestion: "Shift from person to issue: describe the situation and its impact.",
		example: "“You’re the problem” → “The disagreement seems connected to unclear responsibilities.”"
	},
	"Personal attack": {
		suggestion: "Talk about the specific behavior, not the person.",
		example: "“You’re selfish” → “When the report went out late, it added work for the team.”"
	},
	"Blame attribution": {
		suggestion: "Ask “what contributed?” instead of “whose fault?”.",
		example: "“It’s your fault” → “What made the deadline slip, and what can we change?”"
	},
	Defensiveness: {
		suggestion: "Acknowledge the other person’s perspective before sharing yours.",
		example: "“That’s not true” → “I can see why it looked that way. Here’s what I saw.”"
	}
};
function buildSummary(uris) {
	const speakers = {};
	const topics = {};
	const patterns = {};
	for (const u of uris) {
		speakers[u.speaker] = (speakers[u.speaker] || 0) + 1;
		topics[u.topic] = (topics[u.topic] || 0) + 1;
		for (const p of u.patterns) patterns[p] = (patterns[p] || 0) + 1;
	}
	let peak = null;
	for (const u of uris) if (!peak || u.conflict_after > peak.conflict_after) peak = u;
	const trig = uris.filter((u) => u.possible_trigger);
	const de = uris.filter((u) => u.deescalating);
	const firstNeg = uris.find((u) => u.sentiment === "negative") || null;
	const topPatterns = Object.keys(patterns).sort((a, b) => patterns[b] - patterns[a]);
	const lines = [];
	lines.push(`Analyzed ${uris.length} turns · ${Object.keys(speakers).join(", ")} · topics: ${Object.keys(topics).join(" / ")}`);
	if (topPatterns.length) lines.push(`Detected pattern${topPatterns.length > 1 ? "s" : ""}: ${topPatterns.slice(0, 3).join(", ")} — may indicate recurring communication habits worth reviewing.`);
	else lines.push("No strong linguistic patterns detected in this sample.");
	if (peak && peak.conflict_after > .4) lines.push(`Conflict appeared to peak at ${peak.timestamp} (${peak.conflict_level}), around the topic “${peak.topic}”.`);
	if (trig.length) {
		const t0 = trig[0];
		lines.push(`A possible trigger appears around “${t0.topic}” at ${t0.timestamp}: “${snippet(t0.text)}” — likely related to ${t0.possible_trigger.reason}. This interpretation is uncertain.`);
	}
	if (de.length) lines.push(`${de.length} de-escalation attempt${de.length > 1 ? "s" : ""} detected (concession / apology / agreement), starting at ${de[0].timestamp}.`);
	if (firstNeg && peak && peak.conflict_after > .4) lines.push(`Consider reviewing the section from ${firstNeg.timestamp} to ${peak.timestamp} with the rephrasing suggestions below.`);
	lines.push("Note: emotion and intent cannot be determined perfectly from speech alone — every label here is probabilistic, not a verdict.");
	const rephrasings = [];
	const seen = {};
	for (const u of uris) for (const p of u.patterns) if (!seen[p] && REPHRASINGS[p]) {
		seen[p] = 1;
		rephrasings.push({
			pattern: p,
			suggestion: REPHRASINGS[p].suggestion,
			example: REPHRASINGS[p].example,
			from_text: u.text
		});
	}
	if (!rephrasings.length) rephrasings.push({
		pattern: "General",
		suggestion: "No pattern-specific suggestion — consider reviewing the conversation with the speakers directly.",
		example: "",
		from_text: ""
	});
	return {
		turns: uris.length,
		speakers,
		topics,
		patterns,
		peak,
		summaryLines: lines,
		rephrasings,
		overall_level: peak ? peak.conflict_level : "low"
	};
}
function buildMindMapData(uris) {
	const topics = [];
	const map = {};
	for (const u of uris) {
		if (!map[u.topic]) {
			map[u.topic] = {
				label: u.topic,
				children: []
			};
			topics.push(map[u.topic]);
		}
		map[u.topic].children.push(u);
	}
	return {
		topics,
		triggers: uris.filter((u) => u.possible_trigger),
		resolutions: uris.filter((u) => u.deescalating)
	};
}
function runAnalysis(text) {
	const parsed = parseTranscript(text);
	const analysis = analyzeAll(parsed.utterances);
	return {
		parsed,
		analysis,
		summary: buildSummary(analysis.utterances),
		mind: buildMindMapData(analysis.utterances)
	};
}
var SAMPLE_TEXT = [
	"[00:00:00] Alex: Can we talk about the project report? It was due yesterday.",
	"[00:00:05] Sam: Honestly, I'm tired of this. You always bring up work at the end of the day.",
	"[00:00:12] Alex: I'm not trying to blame you. The client asked where the numbers were, and I had nothing to share.",
	"[00:00:20] Sam: You never listen. I told you three times the data export was broken.",
	"[00:00:27] Alex: That's not fair. You didn't mention it in the stand-up, and your emails didn't say blocked.",
	"[00:00:35] Sam: So it's my fault now? Everything is always my fault.",
	"[00:00:42] Alex: This is getting ridiculous. I can't work with someone who blames me for everything.",
	"[00:00:50] Sam: Fine. Let's just stop. We clearly can't talk about this without you getting defensive.",
	"[00:00:58] Alex: Alright, let's take a break and pick this up tomorrow with a clear list of what's blocked.",
	"[00:01:05] Sam: Okay. And I'm sorry for the tone. I know you're stressed too.",
	"[00:01:12] Alex: Thanks. Let's both check the pipeline in the morning and fix it together."
].join("\n");
function cueToLines(raw) {
	const blocks = raw.replace(/\r/g, "").split(/\n\n+/);
	const lines = [];
	for (const block of blocks) {
		const rows = block.split("\n").filter((r) => r && !/^WEBVTT/i.test(r) && !/^\d+$/.test(r));
		if (!rows.length) continue;
		let time = "";
		let text = "";
		for (const row of rows) {
			const tm = row.match(/(\d{2}:\d{2}:\d{2}[.,]\d{2,3})/);
			if (tm && row.includes("-->")) {
				time = tm[1].replace(",", ".").slice(0, 8);
				continue;
			}
			text += (text ? " " : "") + row.replace(/<[^>]+>/g, "");
		}
		if (!text) continue;
		const speakerMatch = text.match(/^([^:]{1,32}):\s*(.*)$/);
		if (speakerMatch) lines.push(`[${time || "00:00:00"}] ${speakerMatch[1]}: ${speakerMatch[2]}`);
		else lines.push(`[${time || "00:00:00"}] Speaker: ${text}`);
	}
	return lines.join("\n");
}
function textFromUpload(filename, content) {
	const name = filename.toLowerCase();
	if (name.endsWith(".vtt") || name.endsWith(".srt")) return cueToLines(content);
	return content;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getIntegrationStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("8fe57a24e5142a383fd82bf6eac60cc1e65172bf2a22bad6240823b767ab3d4c"));
createServerFn({ method: "GET" }).handler(createSsrRpc("992f4897c81b9a868d9526cb9c2e7661866a942a95bb0725a579c62e99bceafe"));
createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("fcda446d878d91b276f56bb884aa22613b7de707b2fa2230561d8c1f7e3a3eb3"));
createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("262e1e7729e31167c8143007e98f9ff4b87aeb9a4dfdf22f12ed47206dfdc193"));
createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("c3dbac3d31ca690bac979e793975bb05890cf2945d9bfe9910894dd3963d6175"));
var transcribeAudio = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("4b637085f7b336e78fcaae4d046f3c30d8411f634ee1dce80c84532100cc17e6"));
var SEED_NODES = [
	{
		id: "you",
		label: "You",
		kind: "you",
		role: "operator",
		detail: "Center of PAL memory."
	},
	{
		id: "musa",
		label: "Musa Trading",
		kind: "org",
		role: "Supplier",
		detail: "Cement supplier. First contact 1 Sep.",
		date: "2026-09-01"
	},
	{
		id: "bisi",
		label: "Bisi",
		kind: "person",
		role: "Customer · high value",
		detail: "Regular cement buyer.",
		date: "2026-08-12"
	},
	{
		id: "tunde",
		label: "Tunde",
		kind: "person",
		role: "Partner",
		detail: "Follow-up due on collections.",
		date: "2026-09-08"
	},
	{
		id: "cement",
		label: "Cement",
		kind: "product",
		detail: "50kg bags. Core SKU.",
		date: "2026-09-01"
	},
	{
		id: "price",
		label: "₦8,500",
		kind: "money",
		role: "Musa quote",
		detail: "Discussed 20 Sep. Up from ₦8,200 competitor signal.",
		date: "2026-09-20"
	},
	{
		id: "price-low",
		label: "₦8,200",
		kind: "money",
		role: "Competitor",
		detail: "Market signal, medium confidence.",
		date: "2026-09-18"
	},
	{
		id: "price-high",
		label: "₦8,700",
		kind: "money",
		role: "Supplier B",
		detail: "Alternate quote.",
		date: "2026-09-19"
	},
	{
		id: "delivery",
		label: "Friday delivery",
		kind: "event",
		detail: "Promised by Musa for cement.",
		date: "2026-09-20"
	},
	{
		id: "meet",
		label: "Supplier meeting",
		kind: "event",
		detail: "Price negotiation with Musa.",
		date: "2026-09-10"
	},
	{
		id: "nego",
		label: "Price negotiation",
		kind: "event",
		date: "2026-09-10"
	},
	{
		id: "conv",
		label: "Conversation · 20 Sep",
		kind: "event",
		detail: "Voice note after delivery promise.",
		date: "2026-09-20"
	},
	{
		id: "lagos",
		label: "Alaba market",
		kind: "place",
		detail: "Where Musa quotes from.",
		date: "2026-09-01"
	},
	{
		id: "blocks",
		label: "Blocks",
		kind: "product",
		detail: "Possible adjacent SKU — not confirmed.",
		date: "2026-09-20"
	},
	{
		id: "wf1",
		label: "Catalog item",
		kind: "workflow",
		detail: "Meaning-to-action step 1",
		date: "2026-09-20"
	},
	{
		id: "wf2",
		label: "Extract product",
		kind: "workflow",
		date: "2026-09-20"
	},
	{
		id: "wf3",
		label: "Quiet hours",
		kind: "workflow",
		date: "2026-09-20"
	},
	{
		id: "wf4",
		label: "Customer message",
		kind: "workflow",
		date: "2026-09-20"
	},
	{
		id: "wf5",
		label: "Ledger write",
		kind: "workflow",
		date: "2026-09-20"
	},
	{
		id: "insight",
		label: "Price rising",
		kind: "insight",
		detail: "Cement quotes climbed ₦300 in two days.",
		date: "2026-09-20"
	},
	{
		id: "task-friday",
		label: "Confirm Friday truck",
		kind: "task",
		date: "2026-09-20"
	}
];
var SEED_EDGES = [
	{
		id: "e1",
		source: "you",
		target: "musa",
		kind: "knows",
		label: "works with",
		confidence: .99,
		evidence: "contact_book",
		date: "2026-09-01"
	},
	{
		id: "e2",
		source: "you",
		target: "bisi",
		kind: "knows",
		label: "serves",
		confidence: .98,
		evidence: "ledger",
		date: "2026-08-12"
	},
	{
		id: "e3",
		source: "you",
		target: "tunde",
		kind: "knows",
		label: "partners",
		confidence: .9,
		evidence: "conversation_110",
		date: "2026-09-08"
	},
	{
		id: "e4",
		source: "musa",
		target: "cement",
		kind: "supplies",
		label: "supplies",
		confidence: .96,
		evidence: "conversation_892",
		date: "2026-09-10",
		sourceNote: "7 recorded interactions"
	},
	{
		id: "e5",
		source: "musa",
		target: "blocks",
		kind: "may_supply",
		label: "may supply",
		confidence: .61,
		evidence: "conversation_901",
		date: "2026-09-20"
	},
	{
		id: "e6",
		source: "cement",
		target: "price",
		kind: "priced_at",
		label: "quoted",
		confidence: .94,
		evidence: "conversation_892",
		date: "2026-09-20"
	},
	{
		id: "e7",
		source: "cement",
		target: "price-low",
		kind: "priced_at",
		label: "competitor",
		confidence: .72,
		evidence: "field_note_44",
		date: "2026-09-18"
	},
	{
		id: "e8",
		source: "cement",
		target: "price-high",
		kind: "priced_at",
		label: "supplier B",
		confidence: .7,
		evidence: "field_note_45",
		date: "2026-09-19"
	},
	{
		id: "e9",
		source: "musa",
		target: "delivery",
		kind: "delivers",
		label: "promised",
		confidence: .88,
		evidence: "conversation_892",
		date: "2026-09-20"
	},
	{
		id: "e10",
		source: "meet",
		target: "nego",
		kind: "follows",
		label: "then",
		confidence: .95,
		evidence: "conversation_880",
		date: "2026-09-10"
	},
	{
		id: "e11",
		source: "nego",
		target: "price",
		kind: "follows",
		label: "then",
		confidence: .93,
		evidence: "conversation_892",
		date: "2026-09-20"
	},
	{
		id: "e12",
		source: "price",
		target: "delivery",
		kind: "follows",
		label: "then",
		confidence: .9,
		evidence: "conversation_892",
		date: "2026-09-20"
	},
	{
		id: "e13",
		source: "delivery",
		target: "task-friday",
		kind: "follows",
		label: "task created",
		confidence: .97,
		evidence: "system",
		date: "2026-09-20"
	},
	{
		id: "e14",
		source: "conv",
		target: "musa",
		kind: "from_conversation",
		label: "mentions",
		confidence: .99,
		evidence: "conversation_892",
		date: "2026-09-20"
	},
	{
		id: "e15",
		source: "musa",
		target: "lagos",
		kind: "located",
		label: "quotes from",
		confidence: .8,
		evidence: "conversation_880",
		date: "2026-09-10"
	},
	{
		id: "e16",
		source: "bisi",
		target: "cement",
		kind: "buys",
		label: "buys",
		confidence: .92,
		evidence: "ledger",
		date: "2026-09-05"
	},
	{
		id: "e17",
		source: "wf1",
		target: "wf2",
		kind: "step",
		label: "then",
		confidence: 1,
		evidence: "workflow_catalog",
		date: "2026-09-20"
	},
	{
		id: "e18",
		source: "wf2",
		target: "wf3",
		kind: "step",
		label: "then",
		confidence: 1,
		evidence: "workflow_catalog",
		date: "2026-09-20"
	},
	{
		id: "e19",
		source: "wf3",
		target: "wf4",
		kind: "step",
		label: "then",
		confidence: 1,
		evidence: "workflow_catalog",
		date: "2026-09-20"
	},
	{
		id: "e20",
		source: "wf4",
		target: "wf5",
		kind: "step",
		label: "then",
		confidence: 1,
		evidence: "workflow_catalog",
		date: "2026-09-20"
	},
	{
		id: "e21",
		source: "price-low",
		target: "price",
		kind: "competes",
		label: "trend up",
		confidence: .74,
		evidence: "insight_price",
		date: "2026-09-20"
	},
	{
		id: "e22",
		source: "insight",
		target: "cement",
		kind: "from_conversation",
		label: "about",
		confidence: .85,
		evidence: "insight_price",
		date: "2026-09-20"
	}
];
var SEED_TASKS = [
	{
		id: "t1",
		title: "Confirm Friday truck with Musa",
		status: "today",
		related: ["musa", "delivery"],
		due: "2026-09-20"
	},
	{
		id: "t2",
		title: "Tell Bisi the ₦8,500 quote",
		status: "upcoming",
		related: ["bisi", "cement"],
		due: "2026-09-21"
	},
	{
		id: "t3",
		title: "Collect from Tunde",
		status: "overdue",
		related: ["tunde"],
		due: "2026-09-18"
	},
	{
		id: "t4",
		title: "Musa promised Friday delivery",
		status: "promise",
		related: ["musa", "delivery"]
	},
	{
		id: "t5",
		title: "Waiting on Supplier B ₦8,700 confirmation",
		status: "waiting",
		related: ["price-high"]
	}
];
var SEED_CONVERSATIONS = [
	{
		id: "c1",
		title: "First contact · Musa",
		date: "2026-09-01",
		people: ["musa"],
		summary: "Introduced as a cement source in Alaba."
	},
	{
		id: "c2",
		title: "Supplier meeting",
		date: "2026-09-10",
		people: ["musa"],
		summary: "Negotiated bag price. Musa still the preferred source."
	},
	{
		id: "c3",
		title: "Quote and Friday promise",
		date: "2026-09-20",
		people: ["musa"],
		summary: "₦8,500 locked verbally. Delivery Friday. Task created.",
		transcript: "[00:00:00] You: Can you confirm cement for Friday?\n[00:00:08] Musa: ₦8,500 a bag. Truck Friday if you send the list today."
	}
];
var usePal = create()(persist((set, get) => ({
	tab: "home",
	view: "memory",
	asOf: "2026-09-20",
	selected: null,
	selectedEdge: null,
	graphOpen: false,
	ask: "",
	askAnswer: null,
	nodes: SEED_NODES,
	edges: SEED_EDGES,
	tasks: SEED_TASKS,
	conversations: SEED_CONVERSATIONS,
	notes: [],
	setTab: (tab) => set({ tab }),
	setView: (view) => set({
		view,
		selected: null,
		selectedEdge: null
	}),
	setAsOf: (asOf) => set({ asOf }),
	select: (selected) => set({
		selected,
		selectedEdge: null
	}),
	selectEdge: (selectedEdge) => set({
		selectedEdge,
		selected: null
	}),
	setGraphOpen: (graphOpen) => set({ graphOpen }),
	setAsk: (ask) => set({ ask }),
	setAskAnswer: (askAnswer) => set({ askAnswer }),
	pin: (id) => set({ nodes: get().nodes.map((n) => n.id === id ? {
		...n,
		pinned: !n.pinned
	} : n) }),
	forget: (id) => set({
		nodes: get().nodes.map((n) => n.id === id ? {
			...n,
			forgotten: true
		} : n),
		selected: get().selected === id ? null : get().selected
	}),
	addNote: (nodeId, text) => set({ notes: [...get().notes, {
		id: `n-${Date.now()}`,
		nodeId,
		text,
		at: (/* @__PURE__ */ new Date()).toISOString()
	}] }),
	addTaskFromNode: (id) => {
		const n = get().nodes.find((x) => x.id === id);
		if (!n) return;
		set({
			tasks: [{
				id: `t-${Date.now()}`,
				title: `Follow up · ${n.label}`,
				status: "today",
				related: [id],
				due: get().asOf
			}, ...get().tasks],
			tab: "work",
			graphOpen: false
		});
	},
	ingestAnalysis: (title, transcript, analysis) => {
		const id = `c-${Date.now()}`;
		const people = analysis.speakers.map((s) => s.toLowerCase().replace(/\s+/g, "-"));
		const newNodes = analysis.speakers.filter((s) => !get().nodes.some((n) => n.label.toLowerCase() === s.toLowerCase())).map((s, i) => ({
			id: people[i],
			label: s,
			kind: "person",
			role: "From transcript",
			date: get().asOf,
			detail: `${analysis.utterances.filter((u) => u.speaker === s).length} turns`
		}));
		const conv = {
			id,
			title,
			date: get().asOf,
			people,
			summary: analysis.utterances[0]?.text.slice(0, 140) ?? title,
			transcript
		};
		const convNode = {
			id,
			label: title,
			kind: "event",
			date: get().asOf,
			detail: `${analysis.utterances.length} turns · conflict ${analysis.utterances.at(-1)?.conflict_level}`
		};
		const newEdges = people.map((p, i) => ({
			id: `e-${id}-${i}`,
			source: id,
			target: get().nodes.find((n) => n.label.toLowerCase() === analysis.speakers[i].toLowerCase())?.id ?? p,
			kind: "from_conversation",
			label: "mentions",
			confidence: .9,
			evidence: id,
			date: get().asOf
		}));
		set({
			nodes: [
				...get().nodes,
				convNode,
				...newNodes
			],
			edges: [...get().edges, ...newEdges],
			conversations: [conv, ...get().conversations],
			tab: "memory"
		});
	},
	resetSeed: () => set({
		nodes: SEED_NODES,
		edges: SEED_EDGES,
		tasks: SEED_TASKS,
		conversations: SEED_CONVERSATIONS,
		notes: []
	})
}), { name: "pal-memory-v1" }));
function CapturePanel() {
	const [text, setText] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(null);
	const [listening, setListening] = (0, import_react.useState)(false);
	const ingest = usePal((s) => s.ingestAnalysis);
	const fileRef = (0, import_react.useRef)(null);
	const audioRef = (0, import_react.useRef)(null);
	const recRef = (0, import_react.useRef)(null);
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
		const w = window;
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
			for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) chunk += ev.results[i][0].transcript;
			if (chunk.trim()) setText((p) => `${p}\n[Speaker]: ${chunk.trim()}`.trim());
		};
		rec.onend = () => setListening(false);
		rec.start();
		recRef.current = rec;
		setListening(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: text,
				onChange: (e) => setText(e.target.value),
				placeholder: "Capture a conversation into PAL memory"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: save,
						children: "Ingest into memory"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => setText(SAMPLE_TEXT),
						children: "Sample"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						type: "button",
						onClick: () => fileRef.current?.click(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " Text"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						type: "button",
						onClick: () => audioRef.current?.click(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " Audio"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: listening ? "default" : "outline",
						type: "button",
						onClick: toggleListen,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }),
							" ",
							listening ? "Stop" : "Talk"
						]
					})
				]
			}),
			err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-bad",
				children: err
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: ".txt,.json,.vtt,.srt",
				className: "sr-only",
				onChange: async (e) => {
					const f = e.target.files?.[0];
					if (f) setText(textFromUpload(f.name, await f.text()));
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: audioRef,
				type: "file",
				accept: "audio/*",
				className: "sr-only",
				onChange: async (e) => {
					const f = e.target.files?.[0];
					if (!f) return;
					const buf = await f.arrayBuffer();
					const bytes = new Uint8Array(buf);
					let binary = "";
					for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
					const res = await transcribeAudio({ data: {
						filename: f.name,
						mime: f.type || "audio/webm",
						base64: btoa(binary)
					} });
					if (res.ok) setText((p) => (p ? p + "\n" : "") + res.text);
					else setErr(res.error);
					e.target.value = "";
				}
			})
		]
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	ref,
	className: cn("flex h-11 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
	...props
}));
Input.displayName = "Input";
function live(nodes, asOf) {
	return nodes.filter((n) => !n.forgotten && (!n.date || n.date <= asOf));
}
function layoutGraph(view, nodes, _edges, asOf) {
	const ns = live(nodes, asOf);
	const ids = new Set(ns.map((n) => n.id));
	const pts = [];
	const place = (id, x, y) => {
		if (ids.has(id)) pts.push({
			id,
			x,
			y
		});
	};
	if (view === "people") {
		place("you", 460, 70);
		place("musa", 180, 320);
		place("bisi", 460, 360);
		place("tunde", 740, 320);
		return pts;
	}
	if (view === "customers") {
		place("bisi", 180, 260);
		place("musa", 460, 260);
		place("tunde", 740, 260);
		return pts;
	}
	if (view === "product") {
		place("cement", 460, 90);
		place("musa", 180, 320);
		place("price", 460, 320);
		place("bisi", 740, 320);
		return pts;
	}
	if (view === "conversation") {
		[
			"meet",
			"nego",
			"price",
			"delivery",
			"task-friday"
		].forEach((id, i) => place(id, 460, 60 + i * 90));
		return pts;
	}
	if (view === "workflow") {
		[
			"wf1",
			"wf2",
			"wf3",
			"wf4",
			"wf5"
		].forEach((id, i) => place(id, 460, 60 + i * 90));
		return pts;
	}
	if (view === "market") {
		place("cement", 460, 80);
		place("price-low", 180, 280);
		place("price", 460, 280);
		place("price-high", 740, 280);
		place("insight", 460, 420);
		return pts;
	}
	place("you", 90, 70);
	place("musa", 460, 90);
	place("cement", 460, 250);
	place("price", 280, 400);
	place("delivery", 640, 400);
	place("conv", 140, 250);
	return pts;
}
function edgePath(a, b) {
	const mx = (a.x + b.x) / 2;
	const my = (a.y + b.y) / 2 - 28;
	return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}
var KIND_RING = {
	you: "var(--color-primary)",
	person: "var(--color-primary)",
	org: "var(--color-primary)",
	place: "var(--color-muted-foreground)",
	product: "var(--color-warn)",
	money: "var(--color-good)",
	event: "var(--color-muted-foreground)",
	task: "var(--color-warn)",
	insight: "var(--color-good)",
	workflow: "var(--color-primary)"
};
function GraphCanvas({ focus = [] }) {
	const nodes = usePal((s) => s.nodes);
	const edges = usePal((s) => s.edges);
	const view = usePal((s) => s.view);
	const asOf = usePal((s) => s.asOf);
	const selected = usePal((s) => s.selected);
	const selectedEdge = usePal((s) => s.selectedEdge);
	const select = usePal((s) => s.select);
	const selectEdge = usePal((s) => s.selectEdge);
	const pts = layoutGraph(view, nodes, edges, asOf);
	const by = Object.fromEntries(pts.map((p) => [p.id, p]));
	const live = new Set(pts.map((p) => p.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-xl border border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 920 520`,
			className: "h-[min(62vh,520px)] w-full min-w-[640px] text-foreground",
			role: "img",
			"aria-label": "PAL mind map",
			children: [edges.filter((e) => live.has(e.source) && live.has(e.target) && (!e.date || e.date <= asOf)).map((e) => {
				const a = by[e.source];
				const b = by[e.target];
				if (!a || !b) return null;
				const weak = e.confidence < .8;
				const on = selectedEdge === e.id || focus.includes(e.source) || focus.includes(e.target);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "cursor-pointer",
					onClick: () => selectEdge(e.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: edgePath(a, b),
						fill: "none",
						stroke: on ? "var(--color-primary)" : "var(--color-border)",
						strokeWidth: on ? 2.2 : 1.2,
						strokeDasharray: weak ? "5 4" : void 0,
						opacity: weak ? .7 : 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
						x: (a.x + b.x) / 2,
						y: (a.y + b.y) / 2 - 10,
						textAnchor: "middle",
						className: "fill-muted-foreground",
						fontSize: 10,
						children: [
							e.label,
							" · ",
							Math.round(e.confidence * 100),
							"%"
						]
					})]
				}, e.id);
			}), pts.map((p) => {
				const n = nodes.find((x) => x.id === p.id);
				if (!n) return null;
				const on = selected === n.id || focus.includes(n.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `translate(${p.x}, ${p.y})`,
					className: "cursor-pointer",
					onClick: () => select(n.id),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							r: on ? 22 : 18,
							fill: "var(--color-card)",
							stroke: KIND_RING[n.kind],
							strokeWidth: on ? 2.5 : 1.4
						}),
						n.pinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							r: 3.5,
							cy: -20,
							fill: "var(--color-primary)"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							textAnchor: "middle",
							y: 36,
							fontSize: 12,
							className: "fill-foreground",
							fontWeight: 500,
							children: n.label
						})
					]
				}, n.id);
			})]
		})
	});
}
function ViewPills() {
	const view = usePal((s) => s.view);
	const setView = usePal((s) => s.setView);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-1 overflow-x-auto pb-1",
		children: [
			{
				id: "memory",
				label: "Memory"
			},
			{
				id: "people",
				label: "People"
			},
			{
				id: "customers",
				label: "Customers"
			},
			{
				id: "product",
				label: "Product"
			},
			{
				id: "conversation",
				label: "Conversation"
			},
			{
				id: "workflow",
				label: "Workflow"
			},
			{
				id: "market",
				label: "Market"
			}
		].map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setView(it.id),
			className: cn("h-9 shrink-0 rounded-full px-3 text-xs font-medium", view === it.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
			children: it.label
		}, it.id))
	});
}
function neighbors(id, edges) {
	return edges.filter((e) => e.source === id || e.target === id);
}
function explainEdge(edge, nodes) {
	const a = nodes.find((n) => n.id === edge.source)?.label ?? edge.source;
	const b = nodes.find((n) => n.id === edge.target)?.label ?? edge.target;
	const count = edge.sourceNote ?? `evidence ${edge.evidence}`;
	return `${a} ${edge.label} ${b}. Confidence ${(edge.confidence * 100).toFixed(0)}%. ${count}.`;
}
function askMap(q, nodes, edges, asOf) {
	const query = q.toLowerCase();
	const liveNodes = nodes.filter((n) => !n.forgotten && (!n.date || n.date <= asOf));
	const liveEdges = edges.filter((e) => !e.date || e.date <= asOf);
	if (/cement price|price increased|why has cement/.test(query)) return {
		answer: `Cement quotes in your memory moved ${liveNodes.filter((n) => n.kind === "money").map((n) => `${n.label} (${n.role ?? n.date})`).join(" → ")}. Musa’s ₦8,500 on 20 Sep sits above the ₦8,200 competitor signal (18 Sep). Confidence on Musa’s quote is high (0.94); competitor signal is 0.72 — treat the gap as a trend, not a settled market.`,
		focus: [
			"cement",
			"price-low",
			"price",
			"price-high",
			"insight"
		],
		view: "market"
	};
	if (/connected to this supplier|everyone connected|musa/.test(query) && /connected|everyone|show/.test(query)) {
		const n = neighbors("musa", liveEdges);
		const ids = /* @__PURE__ */ new Set(["musa"]);
		n.forEach((e) => {
			ids.add(e.source);
			ids.add(e.target);
		});
		return {
			answer: `Musa Trading links to ${[...ids].map((id) => liveNodes.find((x) => x.id === id)?.label).filter(Boolean).join(", ")}. Strongest edge: supplies Cement (0.96, conversation_892). Weakest: may supply Blocks (0.61).`,
			focus: [...ids],
			view: "memory"
		};
	}
	if (/bisi|last month|changed around/.test(query)) return {
		answer: `Around Bisi: still a high-value cement customer. No new conversation since ledger activity. Related open work: tell her the ₦8,500 quote. Nothing in memory contradicts her customer role.`,
		focus: [
			"bisi",
			"cement",
			"price"
		],
		view: "customers"
	};
	if (/unresolved/.test(query)) {
		const weak = liveEdges.filter((e) => e.confidence < .8);
		return {
			answer: `Unresolved / low-confidence links: ${weak.map((e) => `${e.label} (${(e.confidence * 100).toFixed(0)}%, ${e.evidence})`).join("; ") || "none"}.`,
			focus: weak.flatMap((e) => [e.source, e.target]),
			view: "memory"
		};
	}
	if (/before september 10|before 10/.test(query)) return {
		answer: `Before 10 Sep you knew Musa as a contact in Alaba and Bisi as a customer. The ₦8,500 quote, Friday delivery, and Blocks inference did not exist yet.`,
		focus: [
			"you",
			"musa",
			"bisi",
			"lagos"
		],
		view: "people"
	};
	const hits = liveNodes.filter((n) => n.label.toLowerCase().includes(query) || n.detail?.toLowerCase().includes(query));
	if (hits.length) return {
		answer: `Matched ${hits.map((h) => h.label).join(", ")}. Open a node to inspect evidence.`,
		focus: hits.map((h) => h.id),
		view: "memory"
	};
	return {
		answer: "I can traverse this map for price, people around a supplier, unresolved edges, or what you knew before a date.",
		focus: [],
		view: "memory"
	};
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-muted text-muted-foreground",
		outline: "border-border text-foreground",
		positive: "border-transparent bg-good/15 text-good",
		negative: "border-transparent bg-bad/15 text-bad",
		warn: "border-transparent bg-warn/15 text-warn",
		accent: "border-transparent bg-primary/15 text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function InspectPanel() {
	const selected = usePal((s) => s.selected);
	const selectedEdge = usePal((s) => s.selectedEdge);
	const nodes = usePal((s) => s.nodes);
	const edges = usePal((s) => s.edges);
	const notes = usePal((s) => s.notes);
	const pin = usePal((s) => s.pin);
	const forget = usePal((s) => s.forget);
	const addNote = usePal((s) => s.addNote);
	const addTaskFromNode = usePal((s) => s.addTaskFromNode);
	const select = usePal((s) => s.select);
	const selectEdge = usePal((s) => s.selectEdge);
	const [note, setNote] = (0, import_react.useState)("");
	const node = nodes.find((n) => n.id === selected);
	const edge = edges.find((e) => e.id === selectedEdge);
	if (!node && !edge) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Tap a node for profile, conversations, tasks. Tap an edge for confidence and evidence. Long-press actions live below once a node is open."
	});
	if (edge) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg",
				children: edge.label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed",
				children: explainEdge(edge, nodes)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: edge.confidence >= .8 ? "positive" : "warn",
						children: ["confidence ", edge.confidence.toFixed(2)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: edge.evidence
					}),
					edge.date ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: edge.date
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => selectEdge(null),
				children: "Close"
			})
		]
	});
	if (!node) return null;
	const related = edges.filter((e) => e.source === node.id || e.target === node.id);
	const nodeNotes = notes.filter((n) => n.nodeId === node.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wider text-muted-foreground",
					children: node.kind
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: node.label
				}),
				node.role ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: node.role
				}) : null,
				node.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm",
					children: node.detail
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => pin(node.id),
						children: node.pinned ? "Unpin" : "Pin"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => addTaskFromNode(node.id),
						children: "Create task"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => forget(node.id),
						children: "Forget"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
				children: "Relationships"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1 space-y-1 text-sm",
				children: related.map((e) => {
					const other = e.source === node.id ? e.target : e.source;
					const lab = nodes.find((n) => n.id === other)?.label ?? other;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "text-left text-muted-foreground hover:text-foreground",
						onClick: () => selectEdge(e.id),
						children: [
							e.label,
							" → ",
							lab,
							" · ",
							Math.round(e.confidence * 100),
							"%"
						]
					}) }, e.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (ev) => {
					ev.preventDefault();
					if (!note.trim()) return;
					addNote(node.id, note.trim());
					setNote("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: note,
					onChange: (e) => setNote(e.target.value),
					placeholder: "Add note"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "secondary",
					children: "Note"
				})]
			}),
			nodeNotes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: n.text
			}, n.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => select(null),
				children: "Close"
			})
		]
	});
}
var TICKS = [
	"2026-09-01",
	"2026-09-10",
	"2026-09-18",
	"2026-09-20"
];
function MindWorkspace({ compact }) {
	const asOf = usePal((s) => s.asOf);
	const setAsOf = usePal((s) => s.setAsOf);
	const ask = usePal((s) => s.ask);
	const setAsk = usePal((s) => s.setAsk);
	const askAnswer = usePal((s) => s.askAnswer);
	const setAskAnswer = usePal((s) => s.setAskAnswer);
	const setView = usePal((s) => s.setView);
	const setGraphOpen = usePal((s) => s.setGraphOpen);
	const graphOpen = usePal((s) => s.graphOpen);
	const nodes = usePal((s) => s.nodes);
	const edges = usePal((s) => s.edges);
	const [focus, setFocus] = (0, import_react.useState)([]);
	const tick = Math.max(0, TICKS.indexOf(asOf));
	function runAsk() {
		const r = askMap(ask, nodes, edges, asOf);
		setAskAnswer(r.answer);
		setFocus(r.focus);
		setView(r.view);
	}
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewPills, {}), compact && !graphOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => setGraphOpen(true),
					children: "Expand"
				}) : graphOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => setGraphOpen(false),
					children: "Close"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-xs text-muted-foreground",
				children: [
					"Known as of ",
					asOf,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 3,
						className: "w-full accent-primary",
						value: tick,
						onChange: (e) => setAsOf(TICKS[Number(e.target.value)])
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex justify-between font-mono",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1 Sep" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "10 Sep" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "18 Sep" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Today" })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphCanvas, { focus }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-[1fr_auto]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: ask,
					onChange: (e) => setAsk(e.target.value),
					placeholder: "Ask this map — why has cement price increased?",
					onKeyDown: (e) => {
						if (e.key === "Enter") runAsk();
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: runAsk,
					children: "Ask this map"
				})]
			}),
			askAnswer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg bg-muted/50 p-3 text-sm leading-relaxed",
				children: askAnswer
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectPanel, {})
		]
	});
	if (graphOpen) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 overflow-y-auto bg-background p-4 pb-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-5xl",
			children: body
		})
	});
	return body;
}
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col gap-1 p-5 pb-0", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
	ref,
	className: cn("font-display text-lg font-medium tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-5", className),
	...props
}));
CardContent.displayName = "CardContent";
function HomeScreen() {
	const tasks = usePal((s) => s.tasks);
	const convos = usePal((s) => s.conversations);
	const setTab = usePal((s) => s.setTab);
	const today = tasks.filter((t) => t.status === "today" || t.status === "overdue");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
					children: "What is happening"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "PAL"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted-foreground",
					children: "Memory, relationships, work. The mind map is a projection of structured memory — not an LLM doodle."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Today" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [today.length, " items need a human."] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-2 text-sm",
				children: today.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "block w-full text-left",
					onClick: () => setTab("work"),
					children: [t.title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-muted-foreground",
						children: t.status
					})]
				}, t.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Mind map" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Musa · Cement · ₦8,500 · Friday. Expand for the full graph." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MindWorkspace, { compact: true }) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Recent memory" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-2 text-sm",
				children: convos.slice(0, 3).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-muted-foreground",
						children: c.date
					}),
					" ",
					c.title,
					" — ",
					c.summary
				] }, c.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CapturePanel, {})
		]
	});
}
function MemoryScreen() {
	const convos = usePal((s) => s.conversations);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
				children: "What happened"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Memory"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MindWorkspace, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: convos.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-mono text-muted-foreground",
							children: c.date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: c.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: c.summary
						})
					]
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CapturePanel, {})
		]
	});
}
function WorkScreen() {
	const tasks = usePal((s) => s.tasks);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
			children: "What needs to happen"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "Work"
		})] }), [
			"overdue",
			"today",
			"upcoming",
			"waiting",
			"promise"
		].map((g) => {
			const items = tasks.filter((t) => t.status === g);
			if (!items.length) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground",
				children: g
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: items.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-card px-4 py-3 text-sm",
					children: [t.title, t.due ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 font-mono text-xs text-muted-foreground",
						children: t.due
					}) : null]
				}, t.id))
			})] }, g);
		})]
	});
}
function SkillsScreen() {
	const reset = usePal((s) => s.resetSeed);
	const [status, setStatus] = (0, import_react.useState)(null);
	const [key, setKey] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		getIntegrationStatus().then(setStatus);
		try {
			setKey(localStorage.getItem("convmap.openrouterKey") ?? "");
		} catch {}
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
				children: "What PAL can do"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Skills"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Puzzle, { className: "size-4 text-muted-foreground" }), "Connected"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: status?.openrouterEnv || key ? "positive" : "outline",
						children: "OpenRouter free"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: status?.svixEnv ? "positive" : "outline",
						children: "Svix webhooks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: status?.xaiEnv ? "positive" : "outline",
						children: "Speech transcription"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "WhatsApp"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Calendar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Inventory"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "OpenRouter" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Free model router for map questions when you want a second read. Key stays in this browser." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					value: key,
					onChange: (e) => {
						setKey(e.target.value);
						try {
							localStorage.setItem("convmap.openrouterKey", e.target.value);
						} catch {}
					},
					placeholder: "sk-or-…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: status?.openrouterEnv ? "Server already has OPENROUTER_API_KEY." : "Paste a free-tier OpenRouter key to use openrouter/free."
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: reset,
				children: "Reset demo memory"
			})
		]
	});
}
var TABS = [
	{
		id: "home",
		label: "Home",
		icon: House
	},
	{
		id: "memory",
		label: "Memory",
		icon: MessageSquare
	},
	{
		id: "work",
		label: "Work",
		icon: SquareCheckBig
	},
	{
		id: "skills",
		label: "Skills",
		icon: Puzzle
	}
];
function PalShell() {
	const tab = usePal((s) => s.tab);
	const setTab = usePal((s) => s.setTab);
	const graphOpen = usePal((s) => s.graphOpen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background pb-24 text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl px-4 py-6 sm:px-6",
			children: [
				tab === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeScreen, {}) : null,
				tab === "memory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoryScreen, {}) : null,
				tab === "work" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkScreen, {}) : null,
				tab === "skills" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillsScreen, {}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: cn("fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur", graphOpen && "hidden"),
			style: { paddingBottom: "env(safe-area-inset-bottom)" },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mx-auto grid max-w-lg grid-cols-4",
				children: TABS.map((t) => {
					const Icon = t.icon;
					const on = tab === t.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(t.id),
						className: cn("flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium", on ? "text-foreground" : "text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-5",
							strokeWidth: on ? 2.2 : 1.7
						}), t.label]
					}) }, t.id);
				})
			})
		})]
	});
}
var SplitComponent = PalShell;
//#endregion
export { SplitComponent as component };
