import { env } from "./env.server-DRkkE6Ij.mjs";
import { getInbound } from "./inbound.server-DEaQW5as.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/integrations.functions-D665qG7z.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var APP_UID = "conversation-map";
var EVENT_TYPE = "conversation.analyzed";
var getIntegrationStatus_createServerFn_handler = createServerRpc({
	id: "8fe57a24e5142a383fd82bf6eac60cc1e65172bf2a22bad6240823b767ab3d4c",
	name: "getIntegrationStatus",
	filename: "src/lib/conv-map/integrations.functions.ts"
}, (opts) => getIntegrationStatus.__executeServer(opts));
var getIntegrationStatus = createServerFn({ method: "GET" }).handler(getIntegrationStatus_createServerFn_handler, async () => {
	return {
		openrouterEnv: Boolean(env("OPENROUTER_API_KEY")),
		svixEnv: Boolean(env("SVIX_AUTH_TOKEN")),
		xaiEnv: Boolean(env("XAI_API_KEY"))
	};
});
var getInboundTranscript_createServerFn_handler = createServerRpc({
	id: "992f4897c81b9a868d9526cb9c2e7661866a942a95bb0725a579c62e99bceafe",
	name: "getInboundTranscript",
	filename: "src/lib/conv-map/integrations.functions.ts"
}, (opts) => getInboundTranscript.__executeServer(opts));
var getInboundTranscript = createServerFn({ method: "GET" }).handler(getInboundTranscript_createServerFn_handler, async () => {
	const inbound = getInbound();
	if (!inbound) return {
		ok: false,
		error: "No inbound webhook received yet."
	};
	return {
		ok: true,
		receivedAt: inbound.receivedAt,
		eventType: inbound.eventType,
		transcript: inbound.transcript
	};
});
var enrichWithOpenRouter_createServerFn_handler = createServerRpc({
	id: "fcda446d878d91b276f56bb884aa22613b7de707b2fa2230561d8c1f7e3a3eb3",
	name: "enrichWithOpenRouter",
	filename: "src/lib/conv-map/integrations.functions.ts"
}, (opts) => enrichWithOpenRouter.__executeServer(opts));
var enrichWithOpenRouter = createServerFn({ method: "POST" }).validator((input) => input).handler(enrichWithOpenRouter_createServerFn_handler, async ({ data }) => {
	const transcript = data.transcript.slice(0, 12e3);
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
				"X-Title": "Conversation Map"
			},
			prompt
		});
		if (result.ok) return {
			...result,
			provider: "openrouter",
			model: "openrouter/free"
		};
		if (!xai) return result;
	}
	if (xai) {
		const result = await chatComplete({
			url: "https://api.x.ai/v1/chat/completions",
			apiKey: xai,
			model: "grok-4.5",
			prompt
		});
		if (result.ok) return {
			...result,
			provider: "xai",
			model: "grok-4.5",
			note: key ? "OpenRouter failed; used Grok." : "No OpenRouter key — used Grok so this still works."
		};
		return result;
	}
	return {
		ok: false,
		error: "Add an OpenRouter API key (free models use openrouter/free) in the field below, or set OPENROUTER_API_KEY on the server."
	};
});
async function chatComplete(opts) {
	const res = await fetch(opts.url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${opts.apiKey}`,
			...opts.extraHeaders
		},
		body: JSON.stringify({
			model: opts.model,
			messages: [{
				role: "user",
				content: opts.prompt
			}],
			max_tokens: 700,
			temperature: .2
		})
	});
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		return {
			ok: false,
			error: `Model error ${res.status}${body ? `: ${body.slice(0, 180)}` : ""}`
		};
	}
	const raw = (await res.json()).choices?.[0]?.message?.content ?? "";
	const parsed = extractJson(raw);
	if (!parsed) return {
		ok: false,
		error: "The model did not return JSON."
	};
	return {
		ok: true,
		analysis: parsed,
		raw
	};
}
function extractJson(raw) {
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	try {
		return JSON.parse(raw.slice(start, end + 1));
	} catch {
		return null;
	}
}
var publishSvixAnalysis_createServerFn_handler = createServerRpc({
	id: "262e1e7729e31167c8143007e98f9ff4b87aeb9a4dfdf22f12ed47206dfdc193",
	name: "publishSvixAnalysis",
	filename: "src/lib/conv-map/integrations.functions.ts"
}, (opts) => publishSvixAnalysis.__executeServer(opts));
var publishSvixAnalysis = createServerFn({ method: "POST" }).validator((input) => input).handler(publishSvixAnalysis_createServerFn_handler, async ({ data }) => {
	const token = env("SVIX_AUTH_TOKEN");
	if (!token) return {
		ok: false,
		error: "Svix is not configured. Set SVIX_AUTH_TOKEN (from dashboard.svix.com/api-access). Outbound events use application uid “conversation-map” and event type conversation.analyzed."
	};
	const { Svix } = await import("../_libs/svix.mjs").then((n) => n.t);
	const svix = new Svix(token);
	try {
		await svix.application.getOrCreate({
			name: "Conversation Map",
			uid: APP_UID
		});
	} catch (e) {
		return {
			ok: false,
			error: `Svix application: ${String(e)}`
		};
	}
	try {
		await svix.eventType.create({
			name: EVENT_TYPE,
			description: "A conversation was analyzed in Conversation Map"
		});
	} catch {}
	try {
		return {
			ok: true,
			messageId: (await svix.message.create(APP_UID, {
				eventType: EVENT_TYPE,
				payload: {
					type: EVENT_TYPE,
					speakers: data.speakers,
					turns: data.turns,
					overall_level: data.overall_level,
					summary: data.summaryLines.slice(0, 6),
					peakTopic: data.peakTopic ?? null
				}
			})).id
		};
	} catch (e) {
		return {
			ok: false,
			error: `Svix send: ${String(e)}`
		};
	}
});
var addSvixEndpoint_createServerFn_handler = createServerRpc({
	id: "c3dbac3d31ca690bac979e793975bb05890cf2945d9bfe9910894dd3963d6175",
	name: "addSvixEndpoint",
	filename: "src/lib/conv-map/integrations.functions.ts"
}, (opts) => addSvixEndpoint.__executeServer(opts));
var addSvixEndpoint = createServerFn({ method: "POST" }).validator((input) => input).handler(addSvixEndpoint_createServerFn_handler, async ({ data }) => {
	const token = env("SVIX_AUTH_TOKEN");
	if (!token) return {
		ok: false,
		error: "SVIX_AUTH_TOKEN is not set."
	};
	const url = data.url.trim();
	if (!/^https?:\/\//i.test(url)) return {
		ok: false,
		error: "Endpoint must be an http(s) URL."
	};
	const { Svix } = await import("../_libs/svix.mjs").then((n) => n.t);
	const svix = new Svix(token);
	await svix.application.getOrCreate({
		name: "Conversation Map",
		uid: APP_UID
	});
	const ep = await svix.endpoint.create(APP_UID, {
		url,
		description: "Conversation Map analysis destination"
	});
	return {
		ok: true,
		id: ep.id,
		url: ep.url
	};
});
var transcribeAudio_createServerFn_handler = createServerRpc({
	id: "4b637085f7b336e78fcaae4d046f3c30d8411f634ee1dce80c84532100cc17e6",
	name: "transcribeAudio",
	filename: "src/lib/conv-map/integrations.functions.ts"
}, (opts) => transcribeAudio.__executeServer(opts));
var transcribeAudio = createServerFn({ method: "POST" }).validator((input) => input).handler(transcribeAudio_createServerFn_handler, async ({ data }) => {
	const xai = env("XAI_API_KEY");
	if (!xai) return {
		ok: false,
		error: "Audio file transcription needs a server speech model. Use live dictation, or paste a transcript."
	};
	const bin = Buffer.from(data.base64, "base64");
	if (bin.length > 35e5) return {
		ok: false,
		error: "Audio file is too large (keep under ~3 MB)."
	};
	const form = new FormData();
	const blob = new Blob([bin], { type: data.mime || "audio/webm" });
	form.append("file", blob, data.filename || "audio.webm");
	form.append("model", "whisper-1");
	const res = await fetch("https://api.x.ai/v1/audio/transcriptions", {
		method: "POST",
		headers: { Authorization: `Bearer ${xai}` },
		body: form
	});
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		return {
			ok: false,
			error: `Transcription failed (${res.status}). ${body.slice(0, 160)}`
		};
	}
	const json = await res.json();
	if (!json.text?.trim()) return {
		ok: false,
		error: "Empty transcription."
	};
	return {
		ok: true,
		text: json.text.trim()
	};
});
//#endregion
export { addSvixEndpoint_createServerFn_handler, enrichWithOpenRouter_createServerFn_handler, getInboundTranscript_createServerFn_handler, getIntegrationStatus_createServerFn_handler, publishSvixAnalysis_createServerFn_handler, transcribeAudio_createServerFn_handler };
