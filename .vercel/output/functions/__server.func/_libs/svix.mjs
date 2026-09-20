import { n as __exportAll } from "../_runtime.mjs";
import { t as require_dist } from "./standardwebhooks.mjs";
//#region node_modules/svix/dist/index.mjs
var dist_exports = /* @__PURE__ */ __exportAll({
	ApiException: () => ApiException,
	Svix: () => Svix,
	Webhook: () => Webhook
});
var import_dist = require_dist();
var ApplicationInSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			throttleRate: self.throttleRate,
			uid: self.uid,
			metadata: self.metadata
		};
	}
};
var ApplicationOutSerializer = {
	_fromJsonObject(object) {
		return {
			uid: object["uid"],
			name: object["name"],
			throttleRate: object["throttleRate"],
			id: object["id"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			uid: self.uid,
			name: self.name,
			throttleRate: self.throttleRate,
			id: self.id,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			metadata: self.metadata
		};
	}
};
var ApplicationPatchSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			throttleRate: self.throttleRate,
			uid: self.uid,
			metadata: self.metadata
		};
	}
};
var ListResponseApplicationOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => ApplicationOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => ApplicationOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var ApiException = class extends Error {
	code;
	body;
	headers = {};
	constructor(code, body, headers) {
		super(`HTTP-Code: ${code}\nHeaders: ${JSON.stringify(headers)}`);
		this.code = code;
		this.body = body;
		headers.forEach((value, name) => {
			this.headers[name] = value;
		});
	}
};
var LIB_VERSION = "2.5.0";
function getUserAgent() {
	var fields = [`svix-libs/${LIB_VERSION}/javascript`];
	if (typeof process !== "undefined") {
		if (process.version !== void 0) fields.push(`node/${process.version}`);
		if (process.platform !== void 0 && process.arch !== void 0) fields.push(`${process.platform}/${process.arch}`);
	} else if (typeof navigator !== "undefined" && navigator.userAgent !== void 0) fields.push(navigator.userAgent);
	return fields.join(" ");
}
var REGIONS = [
	{
		region: "us",
		url: "https://api.us.svix.com"
	},
	{
		region: "eu",
		url: "https://api.eu.svix.com"
	},
	{
		region: "in",
		url: "https://api.in.svix.com"
	},
	{
		region: "ca",
		url: "https://api.ca.svix.com"
	},
	{
		region: "au",
		url: "https://api.au.svix.com"
	}
];
/** Shared by `Svix` and `api_internal` so the latter need not import the package barrel. */
function createSvixRequestContext(token, options = {}) {
	const regionalUrl = REGIONS.find((x) => x.region === token.split(".")[1])?.url;
	const baseUrl = options.serverUrl?.replace(/\/+$/, "") ?? regionalUrl ?? "https://api.svix.com";
	if (options.retryScheduleInMs) return {
		baseUrl,
		token,
		timeout: options.requestTimeout,
		retryScheduleInMs: options.retryScheduleInMs,
		fetch: options.fetch
	};
	if (options.numRetries) return {
		baseUrl,
		token,
		timeout: options.requestTimeout,
		numRetries: options.numRetries,
		fetch: options.fetch
	};
	return {
		baseUrl,
		token,
		timeout: options.requestTimeout,
		fetch: options.fetch
	};
}
var SvixRequest = class {
	method;
	path;
	constructor(method, path) {
		this.method = method;
		this.path = path;
	}
	body;
	queryParams = {};
	headerParams = {};
	setPathParam(name, value) {
		const newPath = this.path.replace(`{${name}}`, encodeURIComponent(value));
		if (this.path === newPath) throw new Error(`path parameter ${name} not found`);
		this.path = newPath;
	}
	setQueryParams(params) {
		for (const [name, value] of Object.entries(params)) this.setQueryParam(name, value);
	}
	setQueryParam(name, value) {
		if (value === void 0 || value === null) return;
		if (typeof value === "string") this.queryParams[name] = value;
		else if (typeof value === "boolean" || typeof value === "number") this.queryParams[name] = value.toString();
		else if (value instanceof Date) this.queryParams[name] = value.toISOString();
		else if (Array.isArray(value)) {
			if (value.length > 0) this.queryParams[name] = value.join(",");
		} else throw new Error(`query parameter ${name} has unsupported type`);
	}
	setHeaderParam(name, value) {
		if (value === void 0) return;
		this.headerParams[name] = value;
	}
	setBody(value) {
		this.body = JSON.stringify(value);
	}
	/**
	* Send this request, returning the request body as a caller-specified type.
	*
	* If the server returns a 422 error, an `ApiException<HTTPValidationError>` is thrown.
	* If the server returns another 4xx error, an `ApiException<HttpErrorOut>` is thrown.
	*
	* If the server returns a 5xx error, the request is retried up to two times with exponential backoff.
	* If retries are exhausted, an `ApiException<HttpErrorOut>` is thrown.
	*/
	async send(ctx, parseResponseBody) {
		const response = await this.sendInner(ctx);
		if (response.status === 204) return null;
		const responseBody = await response.text();
		return parseResponseBody(JSON.parse(responseBody));
	}
	/** Same as `send`, but the response body is discarded, not parsed. */
	async sendNoResponseBody(ctx) {
		await this.sendInner(ctx);
	}
	async sendInner(ctx) {
		const url = new URL(ctx.baseUrl + this.path);
		for (const [name, value] of Object.entries(this.queryParams)) url.searchParams.set(name, value);
		if (this.headerParams["idempotency-key"] === void 0 && this.method.toUpperCase() === "POST") this.headerParams["idempotency-key"] = `auto_${crypto.randomUUID()}`;
		const randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		if (this.body != null) this.headerParams["content-type"] = "application/json";
		const isCredentialsSupported = "credentials" in Request.prototype;
		return filterResponseForErrors(await sendWithRetry(url, {
			method: this.method.toString(),
			body: this.body,
			headers: {
				accept: "application/json, */*;q=0.8",
				authorization: `Bearer ${ctx.token}`,
				"user-agent": getUserAgent(),
				"svix-req-id": randomId.toString(),
				...this.headerParams
			},
			credentials: isCredentialsSupported ? "same-origin" : void 0,
			signal: ctx.timeout !== void 0 ? AbortSignal.timeout(ctx.timeout) : void 0
		}, ctx.retryScheduleInMs, ctx.retryScheduleInMs?.[0], ctx.retryScheduleInMs?.length ?? ctx.numRetries, ctx.fetch));
	}
};
async function filterResponseForErrors(response) {
	if (response.status < 300) return response;
	const responseBody = await response.text();
	if (response.status === 422) throw new ApiException(response.status, JSON.parse(responseBody), response.headers);
	if (response.status >= 400 && response.status <= 499) throw new ApiException(response.status, JSON.parse(responseBody), response.headers);
	throw new ApiException(response.status, responseBody, response.headers);
}
async function sendWithRetry(url, init, retryScheduleInMs, nextInterval = 50, triesLeft = 2, fetchImpl = fetch, retryCount = 1) {
	const sleep = (interval) => new Promise((resolve) => setTimeout(resolve, interval));
	try {
		const response = await fetchImpl(url, init);
		if (triesLeft <= 0 || response.status < 500) return response;
	} catch (e) {
		if (triesLeft <= 0) throw e;
	}
	await sleep(nextInterval);
	init.headers["svix-retry-count"] = retryCount.toString();
	nextInterval = retryScheduleInMs?.[retryCount] ?? nextInterval * 2;
	return await sendWithRetry(url, init, retryScheduleInMs, nextInterval, --triesLeft, fetchImpl, ++retryCount);
}
var Application = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** List of all the organization's applications. */
	async list(options) {
		const request = new SvixRequest("GET", "/api/v1/app");
		request.setQueryParams({
			exclude_apps_with_no_endpoints: options?.excludeAppsWithNoEndpoints,
			exclude_apps_with_disabled_endpoints: options?.excludeAppsWithDisabledEndpoints,
			exclude_apps_with_svix_play_endpoints: options?.excludeAppsWithSvixPlayEndpoints,
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseApplicationOutSerializer._fromJsonObject);
	}
	/** Create a new application. */
	async create(applicationIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(ApplicationInSerializer._toJsonObject(applicationIn));
		return await request.send(this.requestCtx, ApplicationOutSerializer._fromJsonObject);
	}
	/** Get the application with the UID from `applicationIn`, or create it if it doesn't exist yet. */
	getOrCreate(applicationIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app");
		request.setQueryParam("get_if_exists", true);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(ApplicationInSerializer._toJsonObject(applicationIn));
		return request.send(this.requestCtx, ApplicationOutSerializer._fromJsonObject);
	}
	/** Get an application. */
	async get(appId) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}");
		request.setPathParam("app_id", appId);
		return await request.send(this.requestCtx, ApplicationOutSerializer._fromJsonObject);
	}
	/** Create or update an application. */
	async upsert(appId, applicationIn) {
		const request = new SvixRequest("PUT", "/api/v1/app/{app_id}");
		request.setPathParam("app_id", appId);
		request.setBody(ApplicationInSerializer._toJsonObject(applicationIn));
		return await request.send(this.requestCtx, ApplicationOutSerializer._fromJsonObject);
	}
	/** Delete an application. */
	async delete(appId) {
		const request = new SvixRequest("DELETE", "/api/v1/app/{app_id}");
		request.setPathParam("app_id", appId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Partially update an application. */
	async patch(appId, applicationPatch) {
		const request = new SvixRequest("PATCH", "/api/v1/app/{app_id}");
		request.setPathParam("app_id", appId);
		request.setBody(ApplicationPatchSerializer._toJsonObject(applicationPatch));
		return await request.send(this.requestCtx, ApplicationOutSerializer._fromJsonObject);
	}
};
var ApiTokenOutSerializer = {
	_fromJsonObject(object) {
		return {
			token: object["token"],
			id: object["id"],
			name: object["name"],
			createdAt: new Date(object["createdAt"]),
			expiresAt: object["expiresAt"] ? new Date(object["expiresAt"]) : null,
			scopes: object["scopes"]
		};
	},
	_toJsonObject(self) {
		return {
			token: self.token,
			id: self.id,
			name: self.name,
			createdAt: self.createdAt,
			expiresAt: self.expiresAt,
			scopes: self.scopes
		};
	}
};
var AppPortalCapabilitySerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var AppPortalAccessInSerializer = {
	_fromJsonObject(object) {
		return {
			application: object["application"] != null ? ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
			readOnly: object["readOnly"],
			capabilities: object["capabilities"]?.map((item) => AppPortalCapabilitySerializer._fromJsonObject(item)),
			featureFlags: object["featureFlags"],
			expiry: object["expiry"],
			sessionId: object["sessionId"]
		};
	},
	_toJsonObject(self) {
		return {
			application: self.application != null ? ApplicationInSerializer._toJsonObject(self.application) : void 0,
			readOnly: self.readOnly,
			capabilities: self.capabilities?.map((item) => AppPortalCapabilitySerializer._toJsonObject(item)),
			featureFlags: self.featureFlags,
			expiry: self.expiry,
			sessionId: self.sessionId
		};
	}
};
var AppPortalAccessOutSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			token: object["token"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			token: self.token
		};
	}
};
var ApplicationTokenExpireInSerializer = {
	_fromJsonObject(object) {
		return {
			expiry: object["expiry"],
			sessionIds: object["sessionIds"]
		};
	},
	_toJsonObject(self) {
		return {
			expiry: self.expiry,
			sessionIds: self.sessionIds
		};
	}
};
var RotatePollerTokenInSerializer = {
	_fromJsonObject(object) {
		return {
			expiry: object["expiry"],
			oldTokenExpiry: object["oldTokenExpiry"]
		};
	},
	_toJsonObject(self) {
		return {
			expiry: self.expiry,
			oldTokenExpiry: self.oldTokenExpiry
		};
	}
};
var StreamPortalAccessInSerializer = {
	_fromJsonObject(object) {
		return {
			featureFlags: object["featureFlags"],
			expiry: object["expiry"],
			sessionId: object["sessionId"]
		};
	},
	_toJsonObject(self) {
		return {
			featureFlags: self.featureFlags,
			expiry: self.expiry,
			sessionId: self.sessionId
		};
	}
};
var StreamTokenExpireInSerializer = {
	_fromJsonObject(object) {
		return {
			expiry: object["expiry"],
			sessionIds: object["sessionIds"]
		};
	},
	_toJsonObject(self) {
		return {
			expiry: self.expiry,
			sessionIds: self.sessionIds
		};
	}
};
var Authentication = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Use this function to get magic links (and authentication codes) for connecting your users to the Consumer Application Portal. */
	async appPortalAccess(appId, appPortalAccessIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/auth/app-portal-access/{app_id}");
		request.setPathParam("app_id", appId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(AppPortalAccessInSerializer._toJsonObject(appPortalAccessIn));
		return await request.send(this.requestCtx, AppPortalAccessOutSerializer._fromJsonObject);
	}
	/**
	* Logout an app token.
	*
	* Trying to log out other tokens will fail.
	*/
	async logout(options) {
		const request = new SvixRequest("POST", "/api/v1/auth/logout");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Expire all of the tokens associated with a specific application. */
	async expireAll(appId, applicationTokenExpireIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/auth/app/{app_id}/expire-all");
		request.setPathParam("app_id", appId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(ApplicationTokenExpireInSerializer._toJsonObject(applicationTokenExpireIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Use this function to get magic links (and authentication codes) for connecting your users to the Stream Consumer Portal. */
	async streamPortalAccess(streamId, streamPortalAccessIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/auth/stream-portal-access/{stream_id}");
		request.setPathParam("stream_id", streamId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(StreamPortalAccessInSerializer._toJsonObject(streamPortalAccessIn));
		return await request.send(this.requestCtx, AppPortalAccessOutSerializer._fromJsonObject);
	}
	/**
	* Logout a stream token.
	*
	* Trying to log out other tokens will fail.
	*/
	async streamLogout(options) {
		const request = new SvixRequest("POST", "/api/v1/auth/stream-logout");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Expire all of the tokens associated with a specific stream. */
	async streamExpireAll(streamId, streamTokenExpireIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/auth/stream/{stream_id}/expire-all");
		request.setPathParam("stream_id", streamId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(StreamTokenExpireInSerializer._toJsonObject(streamTokenExpireIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Create a new auth token for the stream poller API. */
	async rotateStreamPollerToken(streamId, sinkId, rotatePollerTokenIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token/rotate");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(RotatePollerTokenInSerializer._toJsonObject(rotatePollerTokenIn));
		return await request.send(this.requestCtx, ApiTokenOutSerializer._fromJsonObject);
	}
	/** Get the current auth token for the stream poller. */
	async getStreamPollerToken(streamId, sinkId) {
		const request = new SvixRequest("GET", "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		return await request.send(this.requestCtx, ApiTokenOutSerializer._fromJsonObject);
	}
};
var AutoConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			createdAt: new Date(object["createdAt"]),
			token: object["token"],
			id: object["id"]
		};
	},
	_toJsonObject(self) {
		return {
			createdAt: self.createdAt,
			token: self.token,
			id: self.id
		};
	}
};
var EndpointSecretRotateInSerializer = {
	_fromJsonObject(object) {
		return {
			key: object["key"],
			gracePeriodSeconds: object["gracePeriodSeconds"]
		};
	},
	_toJsonObject(self) {
		return {
			key: self.key,
			gracePeriodSeconds: self.gracePeriodSeconds
		};
	}
};
var RotateSubscriptionIn2Serializer = {
	_fromJsonObject(object) {
		return { signingSecret: object["signingSecret"] != null ? EndpointSecretRotateInSerializer._fromJsonObject(object["signingSecret"]) : void 0 };
	},
	_toJsonObject(self) {
		return { signingSecret: self.signingSecret != null ? EndpointSecretRotateInSerializer._toJsonObject(self.signingSecret) : void 0 };
	}
};
var AutoconfigSubscription$1 = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Create an AutoConfig subscription. */
	async create(appId, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/autoconfig");
		request.setPathParam("app_id", appId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		return await request.send(this.requestCtx, AutoConfigOutSerializer._fromJsonObject);
	}
	/** Rotate the auth token and signing secret for an AutoConfig subscription. */
	async rotate(appId, autoconfigId, rotateSubscriptionIn2 = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/autoconfig/{autoconfig_id}/rotate");
		request.setPathParam("app_id", appId);
		request.setPathParam("autoconfig_id", autoconfigId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(RotateSubscriptionIn2Serializer._toJsonObject(rotateSubscriptionIn2));
		return await request.send(this.requestCtx, AutoConfigOutSerializer._fromJsonObject);
	}
};
var BackgroundTaskStatusSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var BackgroundTaskTypeSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var BackgroundTaskOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"],
			id: object["id"],
			status: BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
			task: BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
			updatedAt: new Date(object["updatedAt"])
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data,
			id: self.id,
			status: BackgroundTaskStatusSerializer._toJsonObject(self.status),
			task: BackgroundTaskTypeSerializer._toJsonObject(self.task),
			updatedAt: self.updatedAt
		};
	}
};
var ListResponseBackgroundTaskOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => BackgroundTaskOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => BackgroundTaskOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var BackgroundTask = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** List background tasks executed in the past 90 days. */
	async list(options) {
		const request = new SvixRequest("GET", "/api/v1/background-task");
		request.setQueryParams({
			status: options?.status,
			task: options?.task,
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseBackgroundTaskOutSerializer._fromJsonObject);
	}
	/** Get a background task by ID. */
	async get(taskId) {
		const request = new SvixRequest("GET", "/api/v1/background-task/{task_id}");
		request.setPathParam("task_id", taskId);
		return await request.send(this.requestCtx, BackgroundTaskOutSerializer._fromJsonObject);
	}
};
var ConnectorKindSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var ConnectorProductSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var ConnectorInSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			uid: object["uid"],
			logo: object["logo"],
			description: object["description"],
			kind: object["kind"] != null ? ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
			instructions: object["instructions"],
			allowedEventTypes: object["allowedEventTypes"],
			transformation: object["transformation"],
			featureFlags: object["featureFlags"],
			productType: object["productType"] != null ? ConnectorProductSerializer._fromJsonObject(object["productType"]) : void 0
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			uid: self.uid,
			logo: self.logo,
			description: self.description,
			kind: self.kind != null ? ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
			instructions: self.instructions,
			allowedEventTypes: self.allowedEventTypes,
			transformation: self.transformation,
			featureFlags: self.featureFlags,
			productType: self.productType != null ? ConnectorProductSerializer._toJsonObject(self.productType) : void 0
		};
	}
};
var ConnectorOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			orgId: object["orgId"],
			uid: object["uid"],
			kind: ConnectorKindSerializer._fromJsonObject(object["kind"]),
			name: object["name"],
			logo: object["logo"],
			description: object["description"],
			instructions: object["instructions"],
			allowedEventTypes: object["allowedEventTypes"],
			transformation: object["transformation"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			transformationUpdatedAt: new Date(object["transformationUpdatedAt"]),
			featureFlags: object["featureFlags"],
			productType: ConnectorProductSerializer._fromJsonObject(object["productType"])
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			orgId: self.orgId,
			uid: self.uid,
			kind: ConnectorKindSerializer._toJsonObject(self.kind),
			name: self.name,
			logo: self.logo,
			description: self.description,
			instructions: self.instructions,
			allowedEventTypes: self.allowedEventTypes,
			transformation: self.transformation,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			transformationUpdatedAt: self.transformationUpdatedAt,
			featureFlags: self.featureFlags,
			productType: ConnectorProductSerializer._toJsonObject(self.productType)
		};
	}
};
var ConnectorPatchSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			logo: object["logo"],
			description: object["description"],
			kind: object["kind"] != null ? ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
			instructions: object["instructions"],
			allowedEventTypes: object["allowedEventTypes"],
			transformation: object["transformation"],
			featureFlags: object["featureFlags"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			logo: self.logo,
			description: self.description,
			kind: self.kind != null ? ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
			instructions: self.instructions,
			allowedEventTypes: self.allowedEventTypes,
			transformation: self.transformation,
			featureFlags: self.featureFlags
		};
	}
};
var ConnectorUpsertInSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			logo: object["logo"],
			description: object["description"],
			kind: object["kind"] != null ? ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
			instructions: object["instructions"],
			allowedEventTypes: object["allowedEventTypes"],
			transformation: object["transformation"],
			featureFlags: object["featureFlags"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			logo: self.logo,
			description: self.description,
			kind: self.kind != null ? ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
			instructions: self.instructions,
			allowedEventTypes: self.allowedEventTypes,
			transformation: self.transformation,
			featureFlags: self.featureFlags
		};
	}
};
var ListResponseConnectorOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => ConnectorOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => ConnectorOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var Connector = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** List all connectors for an application. */
	async list(options) {
		const request = new SvixRequest("GET", "/api/v1/connector");
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order,
			product_type: options?.productType
		});
		return await request.send(this.requestCtx, ListResponseConnectorOutSerializer._fromJsonObject);
	}
	/** Create a new connector. */
	async create(connectorIn, options) {
		const request = new SvixRequest("POST", "/api/v1/connector");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(ConnectorInSerializer._toJsonObject(connectorIn));
		return await request.send(this.requestCtx, ConnectorOutSerializer._fromJsonObject);
	}
	/** Get a connector. */
	async get(connectorId) {
		const request = new SvixRequest("GET", "/api/v1/connector/{connector_id}");
		request.setPathParam("connector_id", connectorId);
		return await request.send(this.requestCtx, ConnectorOutSerializer._fromJsonObject);
	}
	/** Create or update a connector. */
	async upsert(connectorId, connectorUpsertIn) {
		const request = new SvixRequest("PUT", "/api/v1/connector/{connector_id}");
		request.setPathParam("connector_id", connectorId);
		request.setBody(ConnectorUpsertInSerializer._toJsonObject(connectorUpsertIn));
		return await request.send(this.requestCtx, ConnectorOutSerializer._fromJsonObject);
	}
	/** Delete a connector. */
	async delete(connectorId) {
		const request = new SvixRequest("DELETE", "/api/v1/connector/{connector_id}");
		request.setPathParam("connector_id", connectorId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Partially update a connector. */
	async patch(connectorId, connectorPatch) {
		const request = new SvixRequest("PATCH", "/api/v1/connector/{connector_id}");
		request.setPathParam("connector_id", connectorId);
		request.setBody(ConnectorPatchSerializer._toJsonObject(connectorPatch));
		return await request.send(this.requestCtx, ConnectorOutSerializer._fromJsonObject);
	}
};
var AzureBlobStorageConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			container: object["container"],
			account: object["account"],
			accessKey: object["accessKey"]
		};
	},
	_toJsonObject(self) {
		return {
			container: self.container,
			account: self.account,
			accessKey: self.accessKey
		};
	}
};
var BigQueryConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			projectId: object["projectId"],
			datasetId: object["datasetId"],
			tableId: object["tableId"],
			credentials: object["credentials"]
		};
	},
	_toJsonObject(self) {
		return {
			projectId: self.projectId,
			datasetId: self.datasetId,
			tableId: self.tableId,
			credentials: self.credentials
		};
	}
};
var ClickhouseConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			username: object["username"],
			password: object["password"],
			database: object["database"],
			tableName: object["tableName"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			username: self.username,
			password: self.password,
			database: self.database,
			tableName: self.tableName
		};
	}
};
var DestinationStatusInSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var EventBridgeConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			eventBusName: object["eventBusName"],
			detailType: object["detailType"],
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			region: object["region"]
		};
	},
	_toJsonObject(self) {
		return {
			eventBusName: self.eventBusName,
			detailType: self.detailType,
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			roleArn: self.roleArn,
			externalId: self.externalId,
			region: self.region
		};
	}
};
var FifoEndpointConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			headers: object["headers"],
			key: object["key"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			headers: self.headers,
			key: self.key
		};
	}
};
var GoogleCloudPubSubConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			projectId: object["projectId"],
			topicId: object["topicId"],
			credentials: object["credentials"]
		};
	},
	_toJsonObject(self) {
		return {
			projectId: self.projectId,
			topicId: self.topicId,
			credentials: self.credentials
		};
	}
};
var GoogleCloudStorageConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			bucket: object["bucket"],
			credentials: object["credentials"]
		};
	},
	_toJsonObject(self) {
		return {
			bucket: self.bucket,
			credentials: self.credentials
		};
	}
};
var OtelTracingConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			headers: object["headers"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			headers: self.headers
		};
	}
};
var PostgresConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			password: object["password"],
			tableName: object["tableName"],
			sslRootCert: object["sslRootCert"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			password: self.password,
			tableName: self.tableName,
			sslRootCert: self.sslRootCert
		};
	}
};
var RabbitMqConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			uri: object["uri"],
			routingKey: object["routingKey"]
		};
	},
	_toJsonObject(self) {
		return {
			uri: self.uri,
			routingKey: self.routingKey
		};
	}
};
var RedshiftConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			region: object["region"],
			clusterIdentifier: object["clusterIdentifier"],
			dbUser: object["dbUser"],
			workgroupName: object["workgroupName"],
			dbName: object["dbName"],
			schemaName: object["schemaName"],
			tableName: object["tableName"]
		};
	},
	_toJsonObject(self) {
		return {
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			roleArn: self.roleArn,
			externalId: self.externalId,
			region: self.region,
			clusterIdentifier: self.clusterIdentifier,
			dbUser: self.dbUser,
			workgroupName: self.workgroupName,
			dbName: self.dbName,
			schemaName: self.schemaName,
			tableName: self.tableName
		};
	}
};
var S3ConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			bucket: object["bucket"],
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			region: object["region"],
			endpointUrl: object["endpointUrl"],
			roleArn: object["roleArn"],
			externalId: object["externalId"]
		};
	},
	_toJsonObject(self) {
		return {
			bucket: self.bucket,
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			region: self.region,
			endpointUrl: self.endpointUrl,
			roleArn: self.roleArn,
			externalId: self.externalId
		};
	}
};
var SnowflakeConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			privateKey: object["privateKey"],
			accountIdentifier: object["accountIdentifier"],
			userId: object["userId"],
			dbName: object["dbName"],
			schemaName: object["schemaName"],
			tableName: object["tableName"]
		};
	},
	_toJsonObject(self) {
		return {
			privateKey: self.privateKey,
			accountIdentifier: self.accountIdentifier,
			userId: self.userId,
			dbName: self.dbName,
			schemaName: self.schemaName,
			tableName: self.tableName
		};
	}
};
var SnsConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			topicArn: object["topicArn"],
			region: object["region"],
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			endpointUrl: object["endpointUrl"],
			roleArn: object["roleArn"],
			externalId: object["externalId"]
		};
	},
	_toJsonObject(self) {
		return {
			topicArn: self.topicArn,
			region: self.region,
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			endpointUrl: self.endpointUrl,
			roleArn: self.roleArn,
			externalId: self.externalId
		};
	}
};
var SqsConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			queueUrl: object["queueUrl"],
			region: object["region"],
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			endpointUrl: object["endpointUrl"]
		};
	},
	_toJsonObject(self) {
		return {
			queueUrl: self.queueUrl,
			region: self.region,
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			roleArn: self.roleArn,
			externalId: self.externalId,
			endpointUrl: self.endpointUrl
		};
	}
};
var DestinationInSerializer = {
	_fromJsonObject(object) {
		const type = object["type"];
		function getConfig(type) {
			switch (type) {
				case "pollingEndpoint": return {};
				case "azureBlobStorage": return AzureBlobStorageConfigInSerializer._fromJsonObject(object["config"]);
				case "otelTracing": return OtelTracingConfigInSerializer._fromJsonObject(object["config"]);
				case "fifoEndpoint": return FifoEndpointConfigInSerializer._fromJsonObject(object["config"]);
				case "amazonS3": return S3ConfigInSerializer._fromJsonObject(object["config"]);
				case "googleCloudStorage": return GoogleCloudStorageConfigInSerializer._fromJsonObject(object["config"]);
				case "googleCloudPubSub": return GoogleCloudPubSubConfigInSerializer._fromJsonObject(object["config"]);
				case "sqs": return SqsConfigInSerializer._fromJsonObject(object["config"]);
				case "sns": return SnsConfigInSerializer._fromJsonObject(object["config"]);
				case "bigQuery": return BigQueryConfigInSerializer._fromJsonObject(object["config"]);
				case "clickhouse": return ClickhouseConfigInSerializer._fromJsonObject(object["config"]);
				case "eventBridge": return EventBridgeConfigInSerializer._fromJsonObject(object["config"]);
				case "snowflake": return SnowflakeConfigInSerializer._fromJsonObject(object["config"]);
				case "rabbitMq": return RabbitMqConfigInSerializer._fromJsonObject(object["config"]);
				case "redshift": return RedshiftConfigInSerializer._fromJsonObject(object["config"]);
				case "postgres": return PostgresConfigInSerializer._fromJsonObject(object["config"]);
				default: throw new Error(`Unexpected type: ${type}`);
			}
		}
		return {
			type,
			config: getConfig(type),
			uid: object["uid"],
			status: object["status"] != null ? DestinationStatusInSerializer._fromJsonObject(object["status"]) : void 0,
			batchSize: object["batchSize"],
			maxWaitSecs: object["maxWaitSecs"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		let config;
		switch (self.type) {
			case "pollingEndpoint":
				config = {};
				break;
			case "azureBlobStorage":
				config = AzureBlobStorageConfigInSerializer._toJsonObject(self.config);
				break;
			case "otelTracing":
				config = OtelTracingConfigInSerializer._toJsonObject(self.config);
				break;
			case "fifoEndpoint":
				config = FifoEndpointConfigInSerializer._toJsonObject(self.config);
				break;
			case "amazonS3":
				config = S3ConfigInSerializer._toJsonObject(self.config);
				break;
			case "googleCloudStorage":
				config = GoogleCloudStorageConfigInSerializer._toJsonObject(self.config);
				break;
			case "googleCloudPubSub":
				config = GoogleCloudPubSubConfigInSerializer._toJsonObject(self.config);
				break;
			case "sqs":
				config = SqsConfigInSerializer._toJsonObject(self.config);
				break;
			case "sns":
				config = SnsConfigInSerializer._toJsonObject(self.config);
				break;
			case "bigQuery":
				config = BigQueryConfigInSerializer._toJsonObject(self.config);
				break;
			case "clickhouse":
				config = ClickhouseConfigInSerializer._toJsonObject(self.config);
				break;
			case "eventBridge":
				config = EventBridgeConfigInSerializer._toJsonObject(self.config);
				break;
			case "snowflake":
				config = SnowflakeConfigInSerializer._toJsonObject(self.config);
				break;
			case "rabbitMq":
				config = RabbitMqConfigInSerializer._toJsonObject(self.config);
				break;
			case "redshift":
				config = RedshiftConfigInSerializer._toJsonObject(self.config);
				break;
			case "postgres": config = PostgresConfigInSerializer._toJsonObject(self.config);
		}
		return {
			type: self.type,
			config,
			uid: self.uid,
			status: self.status != null ? DestinationStatusInSerializer._toJsonObject(self.status) : void 0,
			batchSize: self.batchSize,
			maxWaitSecs: self.maxWaitSecs,
			eventTypes: self.eventTypes,
			channels: self.channels,
			metadata: self.metadata
		};
	}
};
var AzureBlobStorageConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			container: object["container"],
			account: object["account"]
		};
	},
	_toJsonObject(self) {
		return {
			container: self.container,
			account: self.account
		};
	}
};
var BigQueryConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			projectId: object["projectId"],
			datasetId: object["datasetId"],
			tableId: object["tableId"]
		};
	},
	_toJsonObject(self) {
		return {
			projectId: self.projectId,
			datasetId: self.datasetId,
			tableId: self.tableId
		};
	}
};
var ClickhouseConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			username: object["username"],
			database: object["database"],
			tableName: object["tableName"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			username: self.username,
			database: self.database,
			tableName: self.tableName
		};
	}
};
var DestinationStatusSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var EventBridgeConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			eventBusName: object["eventBusName"],
			detailType: object["detailType"],
			accessKeyId: object["accessKeyId"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			region: object["region"]
		};
	},
	_toJsonObject(self) {
		return {
			eventBusName: self.eventBusName,
			detailType: self.detailType,
			accessKeyId: self.accessKeyId,
			roleArn: self.roleArn,
			externalId: self.externalId,
			region: self.region
		};
	}
};
var GoogleCloudPubSubConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			projectId: object["projectId"],
			topicId: object["topicId"]
		};
	},
	_toJsonObject(self) {
		return {
			projectId: self.projectId,
			topicId: self.topicId
		};
	}
};
var GoogleCloudStorageConfigOutSerializer = {
	_fromJsonObject(object) {
		return { bucket: object["bucket"] };
	},
	_toJsonObject(self) {
		return { bucket: self.bucket };
	}
};
var EndpointHeadersOutSerializer = {
	_fromJsonObject(object) {
		return {
			headers: object["headers"],
			sensitive: object["sensitive"]
		};
	},
	_toJsonObject(self) {
		return {
			headers: self.headers,
			sensitive: self.sensitive
		};
	}
};
var OtelTracingConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			headers: EndpointHeadersOutSerializer._fromJsonObject(object["headers"])
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			headers: EndpointHeadersOutSerializer._toJsonObject(self.headers)
		};
	}
};
var PostgresConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			tableName: object["tableName"],
			sslRootCert: object["sslRootCert"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			tableName: self.tableName,
			sslRootCert: self.sslRootCert
		};
	}
};
var RabbitMqConfigOutSerializer = {
	_fromJsonObject(object) {
		return { routingKey: object["routingKey"] };
	},
	_toJsonObject(self) {
		return { routingKey: self.routingKey };
	}
};
var RedshiftConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			accessKeyId: object["accessKeyId"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			region: object["region"],
			clusterIdentifier: object["clusterIdentifier"],
			dbUser: object["dbUser"],
			workgroupName: object["workgroupName"],
			dbName: object["dbName"],
			schemaName: object["schemaName"],
			tableName: object["tableName"]
		};
	},
	_toJsonObject(self) {
		return {
			accessKeyId: self.accessKeyId,
			roleArn: self.roleArn,
			externalId: self.externalId,
			region: self.region,
			clusterIdentifier: self.clusterIdentifier,
			dbUser: self.dbUser,
			workgroupName: self.workgroupName,
			dbName: self.dbName,
			schemaName: self.schemaName,
			tableName: self.tableName
		};
	}
};
var S3ConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			bucket: object["bucket"],
			accessKeyId: object["accessKeyId"],
			region: object["region"],
			endpointUrl: object["endpointUrl"],
			roleArn: object["roleArn"],
			externalId: object["externalId"]
		};
	},
	_toJsonObject(self) {
		return {
			bucket: self.bucket,
			accessKeyId: self.accessKeyId,
			region: self.region,
			endpointUrl: self.endpointUrl,
			roleArn: self.roleArn,
			externalId: self.externalId
		};
	}
};
var SinkHttpConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			headers: EndpointHeadersOutSerializer._fromJsonObject(object["headers"])
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			headers: EndpointHeadersOutSerializer._toJsonObject(self.headers)
		};
	}
};
var SnowflakeConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			accountIdentifier: object["accountIdentifier"],
			userId: object["userId"],
			dbName: object["dbName"],
			schemaName: object["schemaName"],
			tableName: object["tableName"]
		};
	},
	_toJsonObject(self) {
		return {
			accountIdentifier: self.accountIdentifier,
			userId: self.userId,
			dbName: self.dbName,
			schemaName: self.schemaName,
			tableName: self.tableName
		};
	}
};
var SnsConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			topicArn: object["topicArn"],
			region: object["region"],
			accessKeyId: object["accessKeyId"],
			roleArn: object["roleArn"],
			externalId: object["externalId"]
		};
	},
	_toJsonObject(self) {
		return {
			topicArn: self.topicArn,
			region: self.region,
			accessKeyId: self.accessKeyId,
			roleArn: self.roleArn,
			externalId: self.externalId
		};
	}
};
var SqsConfigOutSerializer = {
	_fromJsonObject(object) {
		return {
			queueUrl: object["queueUrl"],
			region: object["region"],
			accessKeyId: object["accessKeyId"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			endpointUrl: object["endpointUrl"]
		};
	},
	_toJsonObject(self) {
		return {
			queueUrl: self.queueUrl,
			region: self.region,
			accessKeyId: self.accessKeyId,
			roleArn: self.roleArn,
			externalId: self.externalId,
			endpointUrl: self.endpointUrl
		};
	}
};
var DestinationOutSerializer = {
	_fromJsonObject(object) {
		const type = object["type"];
		function getConfig(type) {
			switch (type) {
				case "pollingEndpoint": return {};
				case "azureBlobStorage": return AzureBlobStorageConfigOutSerializer._fromJsonObject(object["config"]);
				case "otelTracing": return OtelTracingConfigOutSerializer._fromJsonObject(object["config"]);
				case "fifoEndpoint": return SinkHttpConfigOutSerializer._fromJsonObject(object["config"]);
				case "amazonS3": return S3ConfigOutSerializer._fromJsonObject(object["config"]);
				case "snowflake": return SnowflakeConfigOutSerializer._fromJsonObject(object["config"]);
				case "googleCloudStorage": return GoogleCloudStorageConfigOutSerializer._fromJsonObject(object["config"]);
				case "googleCloudPubSub": return GoogleCloudPubSubConfigOutSerializer._fromJsonObject(object["config"]);
				case "redshift": return RedshiftConfigOutSerializer._fromJsonObject(object["config"]);
				case "bigQuery": return BigQueryConfigOutSerializer._fromJsonObject(object["config"]);
				case "clickhouse": return ClickhouseConfigOutSerializer._fromJsonObject(object["config"]);
				case "rabbitMq": return RabbitMqConfigOutSerializer._fromJsonObject(object["config"]);
				case "sqs": return SqsConfigOutSerializer._fromJsonObject(object["config"]);
				case "eventBridge": return EventBridgeConfigOutSerializer._fromJsonObject(object["config"]);
				case "sns": return SnsConfigOutSerializer._fromJsonObject(object["config"]);
				case "postgres": return PostgresConfigOutSerializer._fromJsonObject(object["config"]);
				default: throw new Error(`Unexpected type: ${type}`);
			}
		}
		return {
			type,
			config: getConfig(type),
			id: object["id"],
			uid: object["uid"],
			status: DestinationStatusSerializer._fromJsonObject(object["status"]),
			currentIterator: object["currentIterator"],
			failureReason: object["failureReason"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			batchSize: object["batchSize"],
			maxWaitSecs: object["maxWaitSecs"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			nextRetryAt: object["nextRetryAt"] ? new Date(object["nextRetryAt"]) : null,
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		let config;
		switch (self.type) {
			case "pollingEndpoint":
				config = {};
				break;
			case "azureBlobStorage":
				config = AzureBlobStorageConfigOutSerializer._toJsonObject(self.config);
				break;
			case "otelTracing":
				config = OtelTracingConfigOutSerializer._toJsonObject(self.config);
				break;
			case "fifoEndpoint":
				config = SinkHttpConfigOutSerializer._toJsonObject(self.config);
				break;
			case "amazonS3":
				config = S3ConfigOutSerializer._toJsonObject(self.config);
				break;
			case "snowflake":
				config = SnowflakeConfigOutSerializer._toJsonObject(self.config);
				break;
			case "googleCloudStorage":
				config = GoogleCloudStorageConfigOutSerializer._toJsonObject(self.config);
				break;
			case "googleCloudPubSub":
				config = GoogleCloudPubSubConfigOutSerializer._toJsonObject(self.config);
				break;
			case "redshift":
				config = RedshiftConfigOutSerializer._toJsonObject(self.config);
				break;
			case "bigQuery":
				config = BigQueryConfigOutSerializer._toJsonObject(self.config);
				break;
			case "clickhouse":
				config = ClickhouseConfigOutSerializer._toJsonObject(self.config);
				break;
			case "rabbitMq":
				config = RabbitMqConfigOutSerializer._toJsonObject(self.config);
				break;
			case "sqs":
				config = SqsConfigOutSerializer._toJsonObject(self.config);
				break;
			case "eventBridge":
				config = EventBridgeConfigOutSerializer._toJsonObject(self.config);
				break;
			case "sns":
				config = SnsConfigOutSerializer._toJsonObject(self.config);
				break;
			case "postgres": config = PostgresConfigOutSerializer._toJsonObject(self.config);
		}
		return {
			type: self.type,
			config,
			id: self.id,
			uid: self.uid,
			status: DestinationStatusSerializer._toJsonObject(self.status),
			currentIterator: self.currentIterator,
			failureReason: self.failureReason,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			batchSize: self.batchSize,
			maxWaitSecs: self.maxWaitSecs,
			eventTypes: self.eventTypes,
			channels: self.channels,
			nextRetryAt: self.nextRetryAt,
			metadata: self.metadata
		};
	}
};
var AzureBlobStorageConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			container: object["container"],
			account: object["account"],
			accessKey: object["accessKey"]
		};
	},
	_toJsonObject(self) {
		return {
			container: self.container,
			account: self.account,
			accessKey: self.accessKey
		};
	}
};
var BigQueryConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			projectId: object["projectId"],
			datasetId: object["datasetId"],
			tableId: object["tableId"],
			credentials: object["credentials"]
		};
	},
	_toJsonObject(self) {
		return {
			projectId: self.projectId,
			datasetId: self.datasetId,
			tableId: self.tableId,
			credentials: self.credentials
		};
	}
};
var ClickhouseConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			username: object["username"],
			password: object["password"],
			database: object["database"],
			tableName: object["tableName"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			username: self.username,
			password: self.password,
			database: self.database,
			tableName: self.tableName
		};
	}
};
var EventBridgeConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			eventBusName: object["eventBusName"],
			detailType: object["detailType"],
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			region: object["region"]
		};
	},
	_toJsonObject(self) {
		return {
			eventBusName: self.eventBusName,
			detailType: self.detailType,
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			roleArn: self.roleArn,
			externalId: self.externalId,
			region: self.region
		};
	}
};
var GoogleCloudPubSubConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			projectId: object["projectId"],
			topicId: object["topicId"],
			credentials: object["credentials"]
		};
	},
	_toJsonObject(self) {
		return {
			projectId: self.projectId,
			topicId: self.topicId,
			credentials: self.credentials
		};
	}
};
var GoogleCloudStorageConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			bucket: object["bucket"],
			credentials: object["credentials"]
		};
	},
	_toJsonObject(self) {
		return {
			bucket: self.bucket,
			credentials: self.credentials
		};
	}
};
var OtelTracingConfigPatchSerializer = {
	_fromJsonObject(object) {
		return { url: object["url"] };
	},
	_toJsonObject(self) {
		return { url: self.url };
	}
};
var PostgresConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			password: object["password"],
			tableName: object["tableName"],
			sslRootCert: object["sslRootCert"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			password: self.password,
			tableName: self.tableName,
			sslRootCert: self.sslRootCert
		};
	}
};
var RabbitMqConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			routingKey: object["routingKey"],
			uri: object["uri"]
		};
	},
	_toJsonObject(self) {
		return {
			routingKey: self.routingKey,
			uri: self.uri
		};
	}
};
var RedshiftConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			region: object["region"],
			dbName: object["dbName"],
			schemaName: object["schemaName"],
			tableName: object["tableName"]
		};
	},
	_toJsonObject(self) {
		return {
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			roleArn: self.roleArn,
			externalId: self.externalId,
			region: self.region,
			dbName: self.dbName,
			schemaName: self.schemaName,
			tableName: self.tableName
		};
	}
};
var S3ConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			bucket: object["bucket"],
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			region: object["region"],
			endpointUrl: object["endpointUrl"]
		};
	},
	_toJsonObject(self) {
		return {
			bucket: self.bucket,
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			roleArn: self.roleArn,
			externalId: self.externalId,
			region: self.region,
			endpointUrl: self.endpointUrl
		};
	}
};
var SinkHttpConfigPatchSerializer = {
	_fromJsonObject(object) {
		return { url: object["url"] };
	},
	_toJsonObject(self) {
		return { url: self.url };
	}
};
var SnowflakeConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			privateKey: object["privateKey"],
			accountIdentifier: object["accountIdentifier"],
			userId: object["userId"],
			dbName: object["dbName"],
			schemaName: object["schemaName"],
			tableName: object["tableName"]
		};
	},
	_toJsonObject(self) {
		return {
			privateKey: self.privateKey,
			accountIdentifier: self.accountIdentifier,
			userId: self.userId,
			dbName: self.dbName,
			schemaName: self.schemaName,
			tableName: self.tableName
		};
	}
};
var SnsConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			topicArn: object["topicArn"],
			region: object["region"],
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			endpointUrl: object["endpointUrl"]
		};
	},
	_toJsonObject(self) {
		return {
			topicArn: self.topicArn,
			region: self.region,
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			roleArn: self.roleArn,
			externalId: self.externalId,
			endpointUrl: self.endpointUrl
		};
	}
};
var SqsConfigPatchSerializer = {
	_fromJsonObject(object) {
		return {
			queueUrl: object["queueUrl"],
			region: object["region"],
			accessKeyId: object["accessKeyId"],
			secretAccessKey: object["secretAccessKey"],
			roleArn: object["roleArn"],
			externalId: object["externalId"],
			endpointUrl: object["endpointUrl"]
		};
	},
	_toJsonObject(self) {
		return {
			queueUrl: self.queueUrl,
			region: self.region,
			accessKeyId: self.accessKeyId,
			secretAccessKey: self.secretAccessKey,
			roleArn: self.roleArn,
			externalId: self.externalId,
			endpointUrl: self.endpointUrl
		};
	}
};
var DestinationPatchSerializer = {
	_fromJsonObject(object) {
		const type = object["type"];
		function getConfig(type) {
			switch (type) {
				case "pollingEndpoint": return {};
				case "azureBlobStorage": return AzureBlobStorageConfigPatchSerializer._fromJsonObject(object["config"]);
				case "otelTracing": return OtelTracingConfigPatchSerializer._fromJsonObject(object["config"]);
				case "fifoEndpoint": return SinkHttpConfigPatchSerializer._fromJsonObject(object["config"]);
				case "amazonS3": return S3ConfigPatchSerializer._fromJsonObject(object["config"]);
				case "googleCloudStorage": return GoogleCloudStorageConfigPatchSerializer._fromJsonObject(object["config"]);
				case "googleCloudPubSub": return GoogleCloudPubSubConfigPatchSerializer._fromJsonObject(object["config"]);
				case "sqs": return SqsConfigPatchSerializer._fromJsonObject(object["config"]);
				case "sns": return SnsConfigPatchSerializer._fromJsonObject(object["config"]);
				case "bigQuery": return BigQueryConfigPatchSerializer._fromJsonObject(object["config"]);
				case "clickhouse": return ClickhouseConfigPatchSerializer._fromJsonObject(object["config"]);
				case "eventBridge": return EventBridgeConfigPatchSerializer._fromJsonObject(object["config"]);
				case "snowflake": return SnowflakeConfigPatchSerializer._fromJsonObject(object["config"]);
				case "rabbitMq": return RabbitMqConfigPatchSerializer._fromJsonObject(object["config"]);
				case "redshift": return RedshiftConfigPatchSerializer._fromJsonObject(object["config"]);
				case "postgres": return PostgresConfigPatchSerializer._fromJsonObject(object["config"]);
				default: throw new Error(`Unexpected type: ${type}`);
			}
		}
		return {
			type,
			config: getConfig(type),
			uid: object["uid"],
			status: object["status"] != null ? DestinationStatusInSerializer._fromJsonObject(object["status"]) : void 0,
			batchSize: object["batchSize"],
			maxWaitSecs: object["maxWaitSecs"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		let config;
		switch (self.type) {
			case "pollingEndpoint":
				config = {};
				break;
			case "azureBlobStorage":
				config = AzureBlobStorageConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "otelTracing":
				config = OtelTracingConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "fifoEndpoint":
				config = SinkHttpConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "amazonS3":
				config = S3ConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "googleCloudStorage":
				config = GoogleCloudStorageConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "googleCloudPubSub":
				config = GoogleCloudPubSubConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "sqs":
				config = SqsConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "sns":
				config = SnsConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "bigQuery":
				config = BigQueryConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "clickhouse":
				config = ClickhouseConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "eventBridge":
				config = EventBridgeConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "snowflake":
				config = SnowflakeConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "rabbitMq":
				config = RabbitMqConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "redshift":
				config = RedshiftConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "postgres": config = PostgresConfigPatchSerializer._toJsonObject(self.config);
		}
		return {
			type: self.type,
			config,
			uid: self.uid,
			status: self.status != null ? DestinationStatusInSerializer._toJsonObject(self.status) : void 0,
			batchSize: self.batchSize,
			maxWaitSecs: self.maxWaitSecs,
			eventTypes: self.eventTypes,
			channels: self.channels,
			metadata: self.metadata
		};
	}
};
var ListResponseDestinationOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => DestinationOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => DestinationOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var DestinationTransformInSerializer = {
	_fromJsonObject(object) {
		return { code: object["code"] };
	},
	_toJsonObject(self) {
		return { code: self.code };
	}
};
var DestinationTransformationOutSerializer = {
	_fromJsonObject(object) {
		return {
			code: object["code"],
			enabled: object["enabled"]
		};
	},
	_toJsonObject(self) {
		return {
			code: self.code,
			enabled: self.enabled
		};
	}
};
var EmptyResponseSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var DestinationTransformation = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Get the transformation code associated with this destination. */
	async get(appId, destinationId) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/destination/{destination_id}/transformation");
		request.setPathParam("app_id", appId);
		request.setPathParam("destination_id", destinationId);
		return await request.send(this.requestCtx, DestinationTransformationOutSerializer._fromJsonObject);
	}
	/** Set or unset the transformation code associated with this destination. */
	async patch(appId, destinationId, destinationTransformIn = {}) {
		const request = new SvixRequest("PATCH", "/api/v1/app/{app_id}/destination/{destination_id}/transformation");
		request.setPathParam("app_id", appId);
		request.setPathParam("destination_id", destinationId);
		request.setBody(DestinationTransformInSerializer._toJsonObject(destinationTransformIn));
		return await request.send(this.requestCtx, EmptyResponseSerializer._fromJsonObject);
	}
};
var Destination = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	get transformation() {
		return new DestinationTransformation(this.requestCtx);
	}
	/** List of all the application's destinations. */
	async list(appId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/destination");
		request.setPathParam("app_id", appId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseDestinationOutSerializer._fromJsonObject);
	}
	/** Creates a new destination. */
	async create(appId, destinationIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/destination");
		request.setPathParam("app_id", appId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(DestinationInSerializer._toJsonObject(destinationIn));
		return await request.send(this.requestCtx, DestinationOutSerializer._fromJsonObject);
	}
	/** Get a destination by id or uid. */
	async get(appId, destinationId) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/destination/{destination_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("destination_id", destinationId);
		return await request.send(this.requestCtx, DestinationOutSerializer._fromJsonObject);
	}
	/** Create or update a destination. */
	async upsert(appId, destinationId, destinationIn) {
		const request = new SvixRequest("PUT", "/api/v1/app/{app_id}/destination/{destination_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("destination_id", destinationId);
		request.setBody(DestinationInSerializer._toJsonObject(destinationIn));
		return await request.send(this.requestCtx, DestinationOutSerializer._fromJsonObject);
	}
	/** Delete a destination. */
	async delete(appId, destinationId) {
		const request = new SvixRequest("DELETE", "/api/v1/app/{app_id}/destination/{destination_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("destination_id", destinationId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Partially update a destination. */
	async patch(appId, destinationId, destinationPatch) {
		const request = new SvixRequest("PATCH", "/api/v1/app/{app_id}/destination/{destination_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("destination_id", destinationId);
		request.setBody(DestinationPatchSerializer._toJsonObject(destinationPatch));
		return await request.send(this.requestCtx, DestinationOutSerializer._fromJsonObject);
	}
};
var MessageStatusSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var StatusCodeClassSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var BulkReplayInSerializer = {
	_fromJsonObject(object) {
		return {
			since: new Date(object["since"]),
			until: object["until"] ? new Date(object["until"]) : null,
			eventTypes: object["eventTypes"],
			channel: object["channel"],
			tag: object["tag"],
			status: object["status"] != null ? MessageStatusSerializer._fromJsonObject(object["status"]) : void 0,
			statusCodeClass: object["statusCodeClass"] != null ? StatusCodeClassSerializer._fromJsonObject(object["statusCodeClass"]) : void 0
		};
	},
	_toJsonObject(self) {
		return {
			since: self.since,
			until: self.until,
			eventTypes: self.eventTypes,
			channel: self.channel,
			tag: self.tag,
			status: self.status != null ? MessageStatusSerializer._toJsonObject(self.status) : void 0,
			statusCodeClass: self.statusCodeClass != null ? StatusCodeClassSerializer._toJsonObject(self.statusCodeClass) : void 0
		};
	}
};
var EndpointHeadersInSerializer = {
	_fromJsonObject(object) {
		return { headers: object["headers"] };
	},
	_toJsonObject(self) {
		return { headers: self.headers };
	}
};
var EndpointHeadersPatchInSerializer = {
	_fromJsonObject(object) {
		return {
			headers: object["headers"],
			deleteHeaders: object["deleteHeaders"]
		};
	},
	_toJsonObject(self) {
		return {
			headers: self.headers,
			deleteHeaders: self.deleteHeaders
		};
	}
};
var EndpointInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			secret: object["secret"],
			metadata: object["metadata"],
			headers: object["headers"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			eventTypes: self.eventTypes,
			channels: self.channels,
			secret: self.secret,
			metadata: self.metadata,
			headers: self.headers
		};
	}
};
var EndpointOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			metadata: object["metadata"],
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"])
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			metadata: self.metadata,
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			eventTypes: self.eventTypes,
			channels: self.channels,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt
		};
	}
};
var EndpointPatchSerializer = {
	_fromJsonObject(object) {
		return {
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			url: object["url"],
			disabled: object["disabled"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			url: self.url,
			disabled: self.disabled,
			eventTypes: self.eventTypes,
			channels: self.channels,
			metadata: self.metadata
		};
	}
};
var EndpointSecretOutSerializer = {
	_fromJsonObject(object) {
		return { key: object["key"] };
	},
	_toJsonObject(self) {
		return { key: self.key };
	}
};
var EndpointStatsSerializer = {
	_fromJsonObject(object) {
		return {
			success: object["success"],
			pending: object["pending"],
			sending: object["sending"],
			fail: object["fail"],
			canceled: object["canceled"]
		};
	},
	_toJsonObject(self) {
		return {
			success: self.success,
			pending: self.pending,
			sending: self.sending,
			fail: self.fail,
			canceled: self.canceled
		};
	}
};
var EndpointTransformationInSerializer = {
	_fromJsonObject(object) {
		return {
			code: object["code"],
			enabled: object["enabled"]
		};
	},
	_toJsonObject(self) {
		return {
			code: self.code,
			enabled: self.enabled
		};
	}
};
var EndpointUpsertInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			eventTypes: self.eventTypes,
			channels: self.channels,
			metadata: self.metadata
		};
	}
};
var EventExampleInSerializer = {
	_fromJsonObject(object) {
		return {
			eventType: object["eventType"],
			exampleIndex: object["exampleIndex"]
		};
	},
	_toJsonObject(self) {
		return {
			eventType: self.eventType,
			exampleIndex: self.exampleIndex
		};
	}
};
var ListResponseEndpointOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => EndpointOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => EndpointOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var MessageOutSerializer = {
	_fromJsonObject(object) {
		return {
			eventId: object["eventId"],
			eventType: object["eventType"],
			payload: object["payload"],
			channels: object["channels"],
			id: object["id"],
			timestamp: new Date(object["timestamp"]),
			tags: object["tags"],
			deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null
		};
	},
	_toJsonObject(self) {
		return {
			eventId: self.eventId,
			eventType: self.eventType,
			payload: self.payload,
			channels: self.channels,
			id: self.id,
			timestamp: self.timestamp,
			tags: self.tags,
			deliverAt: self.deliverAt
		};
	}
};
var RecoverInSerializer = {
	_fromJsonObject(object) {
		return {
			since: new Date(object["since"]),
			until: object["until"] ? new Date(object["until"]) : null
		};
	},
	_toJsonObject(self) {
		return {
			since: self.since,
			until: self.until
		};
	}
};
var RecoverOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			status: BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
			task: BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
			updatedAt: new Date(object["updatedAt"])
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			status: BackgroundTaskStatusSerializer._toJsonObject(self.status),
			task: BackgroundTaskTypeSerializer._toJsonObject(self.task),
			updatedAt: self.updatedAt
		};
	}
};
var ReplayInSerializer = {
	_fromJsonObject(object) {
		return {
			since: new Date(object["since"]),
			until: object["until"] ? new Date(object["until"]) : null
		};
	},
	_toJsonObject(self) {
		return {
			since: self.since,
			until: self.until
		};
	}
};
var ReplayOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			status: BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
			task: BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
			updatedAt: new Date(object["updatedAt"])
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			status: BackgroundTaskStatusSerializer._toJsonObject(self.status),
			task: BackgroundTaskTypeSerializer._toJsonObject(self.task),
			updatedAt: self.updatedAt
		};
	}
};
var EndpointTransformationOutSerializer = {
	_fromJsonObject(object) {
		return {
			code: object["code"],
			enabled: object["enabled"],
			variables: object["variables"],
			updatedAt: object["updatedAt"] ? new Date(object["updatedAt"]) : null
		};
	},
	_toJsonObject(self) {
		return {
			code: self.code,
			enabled: self.enabled,
			variables: self.variables,
			updatedAt: self.updatedAt
		};
	}
};
var EndpointTransformationPatchSerializer = {
	_fromJsonObject(object) {
		return {
			code: object["code"],
			enabled: object["enabled"],
			variables: object["variables"]
		};
	},
	_toJsonObject(self) {
		return {
			code: self.code,
			enabled: self.enabled,
			variables: self.variables
		};
	}
};
var EndpointTransformation = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Get the transformation code associated with this endpoint. */
	async get(appId, endpointId) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, EndpointTransformationOutSerializer._fromJsonObject);
	}
	/** Set or unset the transformation code associated with this endpoint. */
	async patch(appId, endpointId, endpointTransformationPatch) {
		const request = new SvixRequest("PATCH", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(EndpointTransformationPatchSerializer._toJsonObject(endpointTransformationPatch));
		return await request.sendNoResponseBody(this.requestCtx);
	}
};
var Endpoint$1 = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	get transformation() {
		return new EndpointTransformation(this.requestCtx);
	}
	/** List the application's endpoints. */
	async list(appId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/endpoint");
		request.setPathParam("app_id", appId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseEndpointOutSerializer._fromJsonObject);
	}
	/**
	* Create a new endpoint for the application.
	*
	* When `secret` is `null` the secret is automatically generated (recommended).
	*/
	async create(appId, endpointIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/endpoint");
		request.setPathParam("app_id", appId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(EndpointInSerializer._toJsonObject(endpointIn));
		return await request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
	}
	/** Get an endpoint. */
	async get(appId, endpointId) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
	}
	/** Create or update an endpoint. */
	async upsert(appId, endpointId, endpointUpsertIn) {
		const request = new SvixRequest("PUT", "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(EndpointUpsertInSerializer._toJsonObject(endpointUpsertIn));
		return await request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
	}
	/** Delete an endpoint. */
	async delete(appId, endpointId) {
		const request = new SvixRequest("DELETE", "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Partially update an endpoint. */
	async patch(appId, endpointId, endpointPatch) {
		const request = new SvixRequest("PATCH", "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(EndpointPatchSerializer._toJsonObject(endpointPatch));
		return await request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
	}
	/**
	* Get the endpoint's signing secret.
	*
	* This is used to verify the authenticity of the webhook.
	* For more information please refer to [the consuming webhooks docs](https://docs.svix.com/consuming-webhooks/).
	*/
	async getSecret(appId, endpointId) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, EndpointSecretOutSerializer._fromJsonObject);
	}
	/**
	* Rotates the endpoint's signing secret.
	*
	* The previous secret will remain valid for the specified grace period (default 24 hours).
	*/
	async rotateSecret(appId, endpointId, endpointSecretRotateIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret/rotate");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Get the additional headers to be sent with the webhook. */
	async getHeaders(appId, endpointId) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, EndpointHeadersOutSerializer._fromJsonObject);
	}
	/** Set the additional headers to be sent with the webhook. */
	async setHeaders(appId, endpointId, endpointHeadersIn) {
		const request = new SvixRequest("PUT", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(EndpointHeadersInSerializer._toJsonObject(endpointHeadersIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Partially set the additional headers to be sent with the webhook. */
	async patchHeaders(appId, endpointId, endpointHeadersPatchIn) {
		const request = new SvixRequest("PATCH", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(EndpointHeadersPatchInSerializer._toJsonObject(endpointHeadersPatchIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/**
	* Replays messages to the endpoint.
	*
	* Only messages that were created after `since` will be sent.
	* Messages that were previously sent to the endpoint are not resent.
	*
	* A completed task will return a payload like the following:
	* ```json
	* {
	*   "id": "qtask_33qen93MNuelBAq1T9G7eHLJRsF",
	*   "status": "finished",
	*   "task": "endpoint.replay",
	*   "data": {
	*     "messagesSent": 2
	*   }
	* }
	* ```
	*/
	async replayMissing(appId, endpointId, replayIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/replay-missing");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(ReplayInSerializer._toJsonObject(replayIn));
		return await request.send(this.requestCtx, ReplayOutSerializer._fromJsonObject);
	}
	/**
	* Bulk replay messages sent to the endpoint.
	*
	* Only messages that were created after `since` will be sent.
	* This will replay both successful, and failed messages
	*
	* A completed task will return a payload like the following:
	* ```json
	* {
	*   "id": "qtask_33qen93MNuelBAq1T9G7eHLJRsF",
	*   "status": "finished",
	*   "task": "endpoint.bulk-replay",
	*   "data": {
	*     "messagesSent": 2
	*   }
	* }
	* ```
	*/
	async bulkReplay(appId, endpointId, bulkReplayIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/bulk-replay");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(BulkReplayInSerializer._toJsonObject(bulkReplayIn));
		return await request.send(this.requestCtx, ReplayOutSerializer._fromJsonObject);
	}
	/** Get basic statistics for the endpoint. */
	async getStats(appId, endpointId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/stats");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setQueryParams({
			since: options?.since,
			until: options?.until
		});
		return await request.send(this.requestCtx, EndpointStatsSerializer._fromJsonObject);
	}
	/**
	* Resend all failed messages since a given time.
	*
	* Messages that were sent successfully, even if failed initially, are not resent.
	*
	* A completed task will return a payload like the following:
	* ```json
	* {
	*   "id": "qtask_33qen93MNuelBAq1T9G7eHLJRsF",
	*   "status": "finished",
	*   "task": "endpoint.recover",
	*   "data": {
	*     "messagesSent": 2
	*   }
	* }
	* ```
	*/
	async recover(appId, endpointId, recoverIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/recover");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(RecoverInSerializer._toJsonObject(recoverIn));
		return await request.send(this.requestCtx, RecoverOutSerializer._fromJsonObject);
	}
	/** Send an example message for an event. */
	async sendExample(appId, endpointId, eventExampleIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/send-example");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(EventExampleInSerializer._toJsonObject(eventExampleIn));
		return await request.send(this.requestCtx, MessageOutSerializer._fromJsonObject);
	}
	/**
	* This operation was renamed to `set-transformation`.
	*
	* @deprecated
	*/
	async transformationPartialUpdate(appId, endpointId, endpointTransformationIn = {}) {
		const request = new SvixRequest("PATCH", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(EndpointTransformationInSerializer._toJsonObject(endpointTransformationIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
};
var EventTypeInSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			description: object["description"],
			archived: object["archived"],
			deprecated: object["deprecated"],
			schemas: object["schemas"],
			groupName: object["groupName"],
			featureFlags: object["featureFlags"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			description: self.description,
			archived: self.archived,
			deprecated: self.deprecated,
			schemas: self.schemas,
			groupName: self.groupName,
			featureFlags: self.featureFlags
		};
	}
};
var EnvironmentInSerializer = {
	_fromJsonObject(object) {
		return {
			eventTypes: object["eventTypes"]?.map((item) => EventTypeInSerializer._fromJsonObject(item)),
			settings: object["settings"],
			connectors: object["connectors"]?.map((item) => ConnectorInSerializer._fromJsonObject(item))
		};
	},
	_toJsonObject(self) {
		return {
			eventTypes: self.eventTypes?.map((item) => EventTypeInSerializer._toJsonObject(item)),
			settings: self.settings,
			connectors: self.connectors?.map((item) => ConnectorInSerializer._toJsonObject(item))
		};
	}
};
var EventTypeOutSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			description: object["description"],
			archived: object["archived"],
			deprecated: object["deprecated"],
			schemas: object["schemas"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			groupName: object["groupName"],
			featureFlags: object["featureFlags"],
			featureFlag: object["featureFlag"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			description: self.description,
			archived: self.archived,
			deprecated: self.deprecated,
			schemas: self.schemas,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			groupName: self.groupName,
			featureFlags: self.featureFlags,
			featureFlag: self.featureFlag
		};
	}
};
var EnvironmentOutSerializer = {
	_fromJsonObject(object) {
		return {
			version: object["version"],
			createdAt: new Date(object["createdAt"]),
			eventTypes: object["eventTypes"].map((item) => EventTypeOutSerializer._fromJsonObject(item)),
			settings: object["settings"],
			connectors: object["connectors"].map((item) => ConnectorOutSerializer._fromJsonObject(item))
		};
	},
	_toJsonObject(self) {
		return {
			version: self.version,
			createdAt: self.createdAt,
			eventTypes: self.eventTypes.map((item) => EventTypeOutSerializer._toJsonObject(item)),
			settings: self.settings,
			connectors: self.connectors.map((item) => ConnectorOutSerializer._toJsonObject(item))
		};
	}
};
var Environment = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/**
	* Download a JSON file containing all org-settings and event types.
	*
	* Note that the schema for [`EnvironmentOut`] is subject to change. The fields
	* herein are provided for convenience but should be treated as JSON blobs.
	*/
	async export(options) {
		const request = new SvixRequest("POST", "/api/v1/environment/export");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		return await request.send(this.requestCtx, EnvironmentOutSerializer._fromJsonObject);
	}
	/**
	* Import a configuration into the active organization.
	*
	* It doesn't delete anything, only adds / updates what was passed to it.
	*
	* Note that the schema for [`EnvironmentIn`] is subject to change. The fields
	* herein are provided for convenience but should be treated as JSON blobs.
	*/
	async import(environmentIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/environment/import");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(EnvironmentInSerializer._toJsonObject(environmentIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
};
var EventTypeImportOpenApiInSerializer = {
	_fromJsonObject(object) {
		return {
			dryRun: object["dryRun"],
			replaceAll: object["replaceAll"],
			spec: object["spec"],
			specRaw: object["specRaw"]
		};
	},
	_toJsonObject(self) {
		return {
			dryRun: self.dryRun,
			replaceAll: self.replaceAll,
			spec: self.spec,
			specRaw: self.specRaw
		};
	}
};
var EventTypeFromOpenApiSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			description: object["description"],
			schemas: object["schemas"],
			deprecated: object["deprecated"],
			groupName: object["groupName"],
			featureFlags: object["featureFlags"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			description: self.description,
			schemas: self.schemas,
			deprecated: self.deprecated,
			groupName: self.groupName,
			featureFlags: self.featureFlags
		};
	}
};
var EventTypeImportOpenApiOutDataSerializer = {
	_fromJsonObject(object) {
		return {
			modified: object["modified"],
			toModify: object["to_modify"]?.map((item) => EventTypeFromOpenApiSerializer._fromJsonObject(item))
		};
	},
	_toJsonObject(self) {
		return {
			modified: self.modified,
			to_modify: self.toModify?.map((item) => EventTypeFromOpenApiSerializer._toJsonObject(item))
		};
	}
};
var EventTypeImportOpenApiOutSerializer = {
	_fromJsonObject(object) {
		return { data: EventTypeImportOpenApiOutDataSerializer._fromJsonObject(object["data"]) };
	},
	_toJsonObject(self) {
		return { data: EventTypeImportOpenApiOutDataSerializer._toJsonObject(self.data) };
	}
};
var EventTypePatchSerializer = {
	_fromJsonObject(object) {
		return {
			description: object["description"],
			archived: object["archived"],
			deprecated: object["deprecated"],
			schemas: object["schemas"],
			featureFlags: object["featureFlags"],
			groupName: object["groupName"]
		};
	},
	_toJsonObject(self) {
		return {
			description: self.description,
			archived: self.archived,
			deprecated: self.deprecated,
			schemas: self.schemas,
			featureFlags: self.featureFlags,
			groupName: self.groupName
		};
	}
};
var EventTypeUpsertInSerializer = {
	_fromJsonObject(object) {
		return {
			description: object["description"],
			archived: object["archived"],
			deprecated: object["deprecated"],
			schemas: object["schemas"],
			featureFlags: object["featureFlags"],
			groupName: object["groupName"]
		};
	},
	_toJsonObject(self) {
		return {
			description: self.description,
			archived: self.archived,
			deprecated: self.deprecated,
			schemas: self.schemas,
			featureFlags: self.featureFlags,
			groupName: self.groupName
		};
	}
};
var ListResponseEventTypeOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => EventTypeOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => EventTypeOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var EventType = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Return the list of event types. */
	async list(options) {
		const request = new SvixRequest("GET", "/api/v1/event-type");
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order,
			include_archived: options?.includeArchived,
			with_content: options?.withContent ?? false
		});
		return await request.send(this.requestCtx, ListResponseEventTypeOutSerializer._fromJsonObject);
	}
	/**
	* Create new or unarchive existing event type.
	*
	* Unarchiving an event type will allow endpoints to filter on it and messages to be sent with it.
	* Endpoints filtering on the event type before archival will continue to filter on it.
	* This operation does not preserve the description and schemas.
	*/
	async create(eventTypeIn, options) {
		const request = new SvixRequest("POST", "/api/v1/event-type");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(EventTypeInSerializer._toJsonObject(eventTypeIn));
		return await request.send(this.requestCtx, EventTypeOutSerializer._fromJsonObject);
	}
	/**
	* Given an OpenAPI spec, create new or update existing event types.
	*
	* If an existing `archived` event type is updated, it will be unarchived.
	* The importer will convert all webhooks found in the either the `webhooks` or `x-webhooks`
	* top-level.
	*/
	async importOpenapi(eventTypeImportOpenApiIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/event-type/import/openapi");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(EventTypeImportOpenApiInSerializer._toJsonObject(eventTypeImportOpenApiIn));
		return await request.send(this.requestCtx, EventTypeImportOpenApiOutSerializer._fromJsonObject);
	}
	/** Get an event type. */
	async get(eventTypeName) {
		const request = new SvixRequest("GET", "/api/v1/event-type/{event_type_name}");
		request.setPathParam("event_type_name", eventTypeName);
		return await request.send(this.requestCtx, EventTypeOutSerializer._fromJsonObject);
	}
	/** Create or update an event type. */
	async upsert(eventTypeName, eventTypeUpsertIn) {
		const request = new SvixRequest("PUT", "/api/v1/event-type/{event_type_name}");
		request.setPathParam("event_type_name", eventTypeName);
		request.setBody(EventTypeUpsertInSerializer._toJsonObject(eventTypeUpsertIn));
		return await request.send(this.requestCtx, EventTypeOutSerializer._fromJsonObject);
	}
	/**
	* Archive an event type.
	*
	* Endpoints already configured to filter on an event type will continue to do so after archival.
	* However, new messages can not be sent with it and endpoints can not filter on it.
	* An event type can be unarchived with the
	* [create operation](#operation/create_event_type_api_v1_event_type__post).
	*/
	async delete(eventTypeName, options) {
		const request = new SvixRequest("DELETE", "/api/v1/event-type/{event_type_name}");
		request.setPathParam("event_type_name", eventTypeName);
		request.setQueryParams({ expunge: options?.expunge });
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Partially update an event type. */
	async patch(eventTypeName, eventTypePatch) {
		const request = new SvixRequest("PATCH", "/api/v1/event-type/{event_type_name}");
		request.setPathParam("event_type_name", eventTypeName);
		request.setBody(EventTypePatchSerializer._toJsonObject(eventTypePatch));
		return await request.send(this.requestCtx, EventTypeOutSerializer._fromJsonObject);
	}
};
var Health = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Verify the API server is up and running. */
	async get() {
		return await new SvixRequest("GET", "/api/v1/health").sendNoResponseBody(this.requestCtx);
	}
};
var IngestSourceConsumerPortalAccessInSerializer = {
	_fromJsonObject(object) {
		return {
			expiry: object["expiry"],
			readOnly: object["readOnly"]
		};
	},
	_toJsonObject(self) {
		return {
			expiry: self.expiry,
			readOnly: self.readOnly
		};
	}
};
var IngestAuthentication = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Get access to the Ingest Source Consumer Portal. */
	async consumerPortalAccess(sourceId, ingestSourceConsumerPortalAccessIn = {}, options) {
		const request = new SvixRequest("POST", "/ingest/api/v1/source/{source_id}/dashboard");
		request.setPathParam("source_id", sourceId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(IngestSourceConsumerPortalAccessInSerializer._toJsonObject(ingestSourceConsumerPortalAccessIn));
		return await request.send(this.requestCtx, AppPortalAccessOutSerializer._fromJsonObject);
	}
};
var IngestEndpointHeadersInSerializer = {
	_fromJsonObject(object) {
		return { headers: object["headers"] };
	},
	_toJsonObject(self) {
		return { headers: self.headers };
	}
};
var IngestEndpointHeadersOutSerializer = {
	_fromJsonObject(object) {
		return {
			headers: object["headers"],
			sensitive: object["sensitive"]
		};
	},
	_toJsonObject(self) {
		return {
			headers: self.headers,
			sensitive: self.sensitive
		};
	}
};
var IngestEndpointInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			secret: object["secret"],
			metadata: object["metadata"],
			headers: object["headers"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			secret: self.secret,
			metadata: self.metadata,
			headers: self.headers
		};
	}
};
var IngestEndpointOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			metadata: self.metadata
		};
	}
};
var IngestEndpointSecretInSerializer = {
	_fromJsonObject(object) {
		return {
			key: object["key"],
			gracePeriodSeconds: object["gracePeriodSeconds"]
		};
	},
	_toJsonObject(self) {
		return {
			key: self.key,
			gracePeriodSeconds: self.gracePeriodSeconds
		};
	}
};
var IngestEndpointSecretOutSerializer = {
	_fromJsonObject(object) {
		return { key: object["key"] };
	},
	_toJsonObject(self) {
		return { key: self.key };
	}
};
var IngestEndpointUpsertInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			metadata: self.metadata
		};
	}
};
var ListResponseIngestEndpointOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => IngestEndpointOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => IngestEndpointOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var IngestEndpointTransformationOutSerializer = {
	_fromJsonObject(object) {
		return {
			code: object["code"],
			enabled: object["enabled"],
			variables: object["variables"]
		};
	},
	_toJsonObject(self) {
		return {
			code: self.code,
			enabled: self.enabled,
			variables: self.variables
		};
	}
};
var IngestEndpointTransformationPatchSerializer = {
	_fromJsonObject(object) {
		return {
			code: object["code"],
			enabled: object["enabled"],
			variables: object["variables"]
		};
	},
	_toJsonObject(self) {
		return {
			code: self.code,
			enabled: self.enabled,
			variables: self.variables
		};
	}
};
var IngestEndpointTransformation = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Get the transformation code associated with this ingest endpoint. */
	async get(sourceId, endpointId) {
		const request = new SvixRequest("GET", "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
		request.setPathParam("source_id", sourceId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, IngestEndpointTransformationOutSerializer._fromJsonObject);
	}
	/** Set or unset the transformation code associated with this ingest endpoint. */
	async patch(sourceId, endpointId, ingestEndpointTransformationPatch) {
		const request = new SvixRequest("PATCH", "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
		request.setPathParam("source_id", sourceId);
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(IngestEndpointTransformationPatchSerializer._toJsonObject(ingestEndpointTransformationPatch));
		return await request.sendNoResponseBody(this.requestCtx);
	}
};
var IngestEndpoint = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	get transformation() {
		return new IngestEndpointTransformation(this.requestCtx);
	}
	/** List ingest endpoints. */
	async list(sourceId, options) {
		const request = new SvixRequest("GET", "/ingest/api/v1/source/{source_id}/endpoint");
		request.setPathParam("source_id", sourceId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseIngestEndpointOutSerializer._fromJsonObject);
	}
	/** Create an ingest endpoint. */
	async create(sourceId, ingestEndpointIn, options) {
		const request = new SvixRequest("POST", "/ingest/api/v1/source/{source_id}/endpoint");
		request.setPathParam("source_id", sourceId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(IngestEndpointInSerializer._toJsonObject(ingestEndpointIn));
		return await request.send(this.requestCtx, IngestEndpointOutSerializer._fromJsonObject);
	}
	/** Get an ingest endpoint. */
	async get(sourceId, endpointId) {
		const request = new SvixRequest("GET", "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
		request.setPathParam("source_id", sourceId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, IngestEndpointOutSerializer._fromJsonObject);
	}
	/** Create or update an ingest endpoint. */
	async upsert(sourceId, endpointId, ingestEndpointUpsertIn) {
		const request = new SvixRequest("PUT", "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
		request.setPathParam("source_id", sourceId);
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(IngestEndpointUpsertInSerializer._toJsonObject(ingestEndpointUpsertIn));
		return await request.send(this.requestCtx, IngestEndpointOutSerializer._fromJsonObject);
	}
	/** Delete an ingest endpoint. */
	async delete(sourceId, endpointId) {
		const request = new SvixRequest("DELETE", "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
		request.setPathParam("source_id", sourceId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/**
	* Get an ingest endpoint's signing secret.
	*
	* This is used to verify the authenticity of the webhook.
	* For more information please refer to [the consuming webhooks docs](https://docs.svix.com/consuming-webhooks/).
	*/
	async getSecret(sourceId, endpointId) {
		const request = new SvixRequest("GET", "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret");
		request.setPathParam("source_id", sourceId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, IngestEndpointSecretOutSerializer._fromJsonObject);
	}
	/**
	* Rotates an ingest endpoint's signing secret.
	*
	* The previous secret will remain valid for the specified grace period (default 24 hours).
	*/
	async rotateSecret(sourceId, endpointId, ingestEndpointSecretIn = {}, options) {
		const request = new SvixRequest("POST", "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret/rotate");
		request.setPathParam("source_id", sourceId);
		request.setPathParam("endpoint_id", endpointId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(IngestEndpointSecretInSerializer._toJsonObject(ingestEndpointSecretIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Get the additional headers to be sent with the ingest. */
	async getHeaders(sourceId, endpointId) {
		const request = new SvixRequest("GET", "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
		request.setPathParam("source_id", sourceId);
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, IngestEndpointHeadersOutSerializer._fromJsonObject);
	}
	/** Set the additional headers to be sent to the endpoint. */
	async setHeaders(sourceId, endpointId, ingestEndpointHeadersIn) {
		const request = new SvixRequest("PUT", "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
		request.setPathParam("source_id", sourceId);
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(IngestEndpointHeadersInSerializer._toJsonObject(ingestEndpointHeadersIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
};
var AdobeSignConfigSerializer = {
	_fromJsonObject(object) {
		return { clientId: object["clientId"] };
	},
	_toJsonObject(self) {
		return { clientId: self.clientId };
	}
};
var AirwallexConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var CheckbookConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var CronConfigSerializer = {
	_fromJsonObject(object) {
		return {
			schedule: object["schedule"],
			payload: object["payload"],
			contentType: object["contentType"]
		};
	},
	_toJsonObject(self) {
		return {
			schedule: self.schedule,
			payload: self.payload,
			contentType: self.contentType
		};
	}
};
var DocusignConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var EasypostConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var GithubConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var HubspotConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var MergeConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var MetaConfigSerializer = {
	_fromJsonObject(object) {
		return {
			secret: object["secret"],
			verifyToken: object["verifyToken"]
		};
	},
	_toJsonObject(self) {
		return {
			secret: self.secret,
			verifyToken: self.verifyToken
		};
	}
};
var NangoConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var OpenClawConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var OrumIoConfigSerializer = {
	_fromJsonObject(object) {
		return { publicKey: object["publicKey"] };
	},
	_toJsonObject(self) {
		return { publicKey: self.publicKey };
	}
};
var PandaDocConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var PortIoConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var RutterConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var SegmentConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var ShopifyConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var SlackConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var StripeConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var SvixConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var TailscaleConfigSerializer = {
	_fromJsonObject(object) {
		return {
			secret: object["secret"],
			timestampGraceSeconds: object["timestampGraceSeconds"]
		};
	},
	_toJsonObject(self) {
		return {
			secret: self.secret,
			timestampGraceSeconds: self.timestampGraceSeconds
		};
	}
};
var TelnyxConfigSerializer = {
	_fromJsonObject(object) {
		return { publicKey: object["publicKey"] };
	},
	_toJsonObject(self) {
		return { publicKey: self.publicKey };
	}
};
var VapiConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var VeriffConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var VgsConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var ZoomConfigSerializer = {
	_fromJsonObject(object) {
		return { secret: object["secret"] };
	},
	_toJsonObject(self) {
		return { secret: self.secret };
	}
};
var IngestSourceInSerializer = {
	_fromJsonObject(object) {
		const type = object["type"];
		function getConfig(type) {
			switch (type) {
				case "generic-webhook": return {};
				case "cron": return CronConfigSerializer._fromJsonObject(object["config"]);
				case "adobe-sign": return AdobeSignConfigSerializer._fromJsonObject(object["config"]);
				case "beehiiv": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "brex": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "checkbook": return CheckbookConfigSerializer._fromJsonObject(object["config"]);
				case "clerk": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "docusign": return DocusignConfigSerializer._fromJsonObject(object["config"]);
				case "easypost": return EasypostConfigSerializer._fromJsonObject(object["config"]);
				case "github": return GithubConfigSerializer._fromJsonObject(object["config"]);
				case "guesty": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "hubspot": return HubspotConfigSerializer._fromJsonObject(object["config"]);
				case "incident-io": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "lithic": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "merge": return MergeConfigSerializer._fromJsonObject(object["config"]);
				case "meta": return MetaConfigSerializer._fromJsonObject(object["config"]);
				case "nango": return NangoConfigSerializer._fromJsonObject(object["config"]);
				case "nash": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "openclaw": return OpenClawConfigSerializer._fromJsonObject(object["config"]);
				case "orum-io": return OrumIoConfigSerializer._fromJsonObject(object["config"]);
				case "panda-doc": return PandaDocConfigSerializer._fromJsonObject(object["config"]);
				case "port-io": return PortIoConfigSerializer._fromJsonObject(object["config"]);
				case "pleo": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "psi-fi": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "replicate": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "resend": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "rutter": return RutterConfigSerializer._fromJsonObject(object["config"]);
				case "safebase": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "sardine": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "segment": return SegmentConfigSerializer._fromJsonObject(object["config"]);
				case "shopify": return ShopifyConfigSerializer._fromJsonObject(object["config"]);
				case "slack": return SlackConfigSerializer._fromJsonObject(object["config"]);
				case "stripe": return StripeConfigSerializer._fromJsonObject(object["config"]);
				case "stych": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "svix": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "zoom": return ZoomConfigSerializer._fromJsonObject(object["config"]);
				case "tailscale": return TailscaleConfigSerializer._fromJsonObject(object["config"]);
				case "telnyx": return TelnyxConfigSerializer._fromJsonObject(object["config"]);
				case "vapi": return VapiConfigSerializer._fromJsonObject(object["config"]);
				case "open-ai": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "render": return SvixConfigSerializer._fromJsonObject(object["config"]);
				case "veriff": return VeriffConfigSerializer._fromJsonObject(object["config"]);
				case "airwallex": return AirwallexConfigSerializer._fromJsonObject(object["config"]);
				case "vgs": return VgsConfigSerializer._fromJsonObject(object["config"]);
				default: throw new Error(`Unexpected type: ${type}`);
			}
		}
		return {
			type,
			config: getConfig(type),
			name: object["name"],
			uid: object["uid"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		let config;
		switch (self.type) {
			case "generic-webhook":
				config = {};
				break;
			case "cron":
				config = CronConfigSerializer._toJsonObject(self.config);
				break;
			case "adobe-sign":
				config = AdobeSignConfigSerializer._toJsonObject(self.config);
				break;
			case "beehiiv":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "brex":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "checkbook":
				config = CheckbookConfigSerializer._toJsonObject(self.config);
				break;
			case "clerk":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "docusign":
				config = DocusignConfigSerializer._toJsonObject(self.config);
				break;
			case "easypost":
				config = EasypostConfigSerializer._toJsonObject(self.config);
				break;
			case "github":
				config = GithubConfigSerializer._toJsonObject(self.config);
				break;
			case "guesty":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "hubspot":
				config = HubspotConfigSerializer._toJsonObject(self.config);
				break;
			case "incident-io":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "lithic":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "merge":
				config = MergeConfigSerializer._toJsonObject(self.config);
				break;
			case "meta":
				config = MetaConfigSerializer._toJsonObject(self.config);
				break;
			case "nango":
				config = NangoConfigSerializer._toJsonObject(self.config);
				break;
			case "nash":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "openclaw":
				config = OpenClawConfigSerializer._toJsonObject(self.config);
				break;
			case "orum-io":
				config = OrumIoConfigSerializer._toJsonObject(self.config);
				break;
			case "panda-doc":
				config = PandaDocConfigSerializer._toJsonObject(self.config);
				break;
			case "port-io":
				config = PortIoConfigSerializer._toJsonObject(self.config);
				break;
			case "pleo":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "psi-fi":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "replicate":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "resend":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "rutter":
				config = RutterConfigSerializer._toJsonObject(self.config);
				break;
			case "safebase":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "sardine":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "segment":
				config = SegmentConfigSerializer._toJsonObject(self.config);
				break;
			case "shopify":
				config = ShopifyConfigSerializer._toJsonObject(self.config);
				break;
			case "slack":
				config = SlackConfigSerializer._toJsonObject(self.config);
				break;
			case "stripe":
				config = StripeConfigSerializer._toJsonObject(self.config);
				break;
			case "stych":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "svix":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "zoom":
				config = ZoomConfigSerializer._toJsonObject(self.config);
				break;
			case "tailscale":
				config = TailscaleConfigSerializer._toJsonObject(self.config);
				break;
			case "telnyx":
				config = TelnyxConfigSerializer._toJsonObject(self.config);
				break;
			case "vapi":
				config = VapiConfigSerializer._toJsonObject(self.config);
				break;
			case "open-ai":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "render":
				config = SvixConfigSerializer._toJsonObject(self.config);
				break;
			case "veriff":
				config = VeriffConfigSerializer._toJsonObject(self.config);
				break;
			case "airwallex":
				config = AirwallexConfigSerializer._toJsonObject(self.config);
				break;
			case "vgs": config = VgsConfigSerializer._toJsonObject(self.config);
		}
		return {
			type: self.type,
			config,
			name: self.name,
			uid: self.uid,
			metadata: self.metadata
		};
	}
};
var AdobeSignConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var AirwallexConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var CheckbookConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var DocusignConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var EasypostConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var GithubConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var HubspotConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var MergeConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var MetaConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var NangoConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var OpenClawConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var OrumIoConfigOutSerializer = {
	_fromJsonObject(object) {
		return { publicKey: object["publicKey"] };
	},
	_toJsonObject(self) {
		return { publicKey: self.publicKey };
	}
};
var PandaDocConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var PortIoConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var RutterConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var SegmentConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var ShopifyConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var SlackConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var StripeConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var SvixConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var TailscaleConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var TelnyxConfigOutSerializer = {
	_fromJsonObject(object) {
		return { publicKey: object["publicKey"] };
	},
	_toJsonObject(self) {
		return { publicKey: self.publicKey };
	}
};
var VapiConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var VeriffConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var VgsConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var ZoomConfigOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var IngestSourceOutSerializer = {
	_fromJsonObject(object) {
		const type = object["type"];
		function getConfig(type) {
			switch (type) {
				case "generic-webhook": return {};
				case "cron": return CronConfigSerializer._fromJsonObject(object["config"]);
				case "adobe-sign": return AdobeSignConfigOutSerializer._fromJsonObject(object["config"]);
				case "beehiiv": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "brex": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "checkbook": return CheckbookConfigOutSerializer._fromJsonObject(object["config"]);
				case "clerk": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "docusign": return DocusignConfigOutSerializer._fromJsonObject(object["config"]);
				case "easypost": return EasypostConfigOutSerializer._fromJsonObject(object["config"]);
				case "github": return GithubConfigOutSerializer._fromJsonObject(object["config"]);
				case "guesty": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "hubspot": return HubspotConfigOutSerializer._fromJsonObject(object["config"]);
				case "incident-io": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "lithic": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "merge": return MergeConfigOutSerializer._fromJsonObject(object["config"]);
				case "meta": return MetaConfigOutSerializer._fromJsonObject(object["config"]);
				case "nango": return NangoConfigOutSerializer._fromJsonObject(object["config"]);
				case "nash": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "openclaw": return OpenClawConfigOutSerializer._fromJsonObject(object["config"]);
				case "orum-io": return OrumIoConfigOutSerializer._fromJsonObject(object["config"]);
				case "panda-doc": return PandaDocConfigOutSerializer._fromJsonObject(object["config"]);
				case "port-io": return PortIoConfigOutSerializer._fromJsonObject(object["config"]);
				case "psi-fi": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "pleo": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "replicate": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "resend": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "rutter": return RutterConfigOutSerializer._fromJsonObject(object["config"]);
				case "safebase": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "sardine": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "segment": return SegmentConfigOutSerializer._fromJsonObject(object["config"]);
				case "shopify": return ShopifyConfigOutSerializer._fromJsonObject(object["config"]);
				case "slack": return SlackConfigOutSerializer._fromJsonObject(object["config"]);
				case "stripe": return StripeConfigOutSerializer._fromJsonObject(object["config"]);
				case "stych": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "svix": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "zoom": return ZoomConfigOutSerializer._fromJsonObject(object["config"]);
				case "tailscale": return TailscaleConfigOutSerializer._fromJsonObject(object["config"]);
				case "telnyx": return TelnyxConfigOutSerializer._fromJsonObject(object["config"]);
				case "vapi": return VapiConfigOutSerializer._fromJsonObject(object["config"]);
				case "open-ai": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "render": return SvixConfigOutSerializer._fromJsonObject(object["config"]);
				case "veriff": return VeriffConfigOutSerializer._fromJsonObject(object["config"]);
				case "airwallex": return AirwallexConfigOutSerializer._fromJsonObject(object["config"]);
				case "vgs": return VgsConfigOutSerializer._fromJsonObject(object["config"]);
				default: throw new Error(`Unexpected type: ${type}`);
			}
		}
		return {
			type,
			config: getConfig(type),
			id: object["id"],
			uid: object["uid"],
			name: object["name"],
			ingestUrl: object["ingestUrl"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		let config;
		switch (self.type) {
			case "generic-webhook":
				config = {};
				break;
			case "cron":
				config = CronConfigSerializer._toJsonObject(self.config);
				break;
			case "adobe-sign":
				config = AdobeSignConfigOutSerializer._toJsonObject(self.config);
				break;
			case "beehiiv":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "brex":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "checkbook":
				config = CheckbookConfigOutSerializer._toJsonObject(self.config);
				break;
			case "clerk":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "docusign":
				config = DocusignConfigOutSerializer._toJsonObject(self.config);
				break;
			case "easypost":
				config = EasypostConfigOutSerializer._toJsonObject(self.config);
				break;
			case "github":
				config = GithubConfigOutSerializer._toJsonObject(self.config);
				break;
			case "guesty":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "hubspot":
				config = HubspotConfigOutSerializer._toJsonObject(self.config);
				break;
			case "incident-io":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "lithic":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "merge":
				config = MergeConfigOutSerializer._toJsonObject(self.config);
				break;
			case "meta":
				config = MetaConfigOutSerializer._toJsonObject(self.config);
				break;
			case "nango":
				config = NangoConfigOutSerializer._toJsonObject(self.config);
				break;
			case "nash":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "openclaw":
				config = OpenClawConfigOutSerializer._toJsonObject(self.config);
				break;
			case "orum-io":
				config = OrumIoConfigOutSerializer._toJsonObject(self.config);
				break;
			case "panda-doc":
				config = PandaDocConfigOutSerializer._toJsonObject(self.config);
				break;
			case "port-io":
				config = PortIoConfigOutSerializer._toJsonObject(self.config);
				break;
			case "psi-fi":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "pleo":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "replicate":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "resend":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "rutter":
				config = RutterConfigOutSerializer._toJsonObject(self.config);
				break;
			case "safebase":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "sardine":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "segment":
				config = SegmentConfigOutSerializer._toJsonObject(self.config);
				break;
			case "shopify":
				config = ShopifyConfigOutSerializer._toJsonObject(self.config);
				break;
			case "slack":
				config = SlackConfigOutSerializer._toJsonObject(self.config);
				break;
			case "stripe":
				config = StripeConfigOutSerializer._toJsonObject(self.config);
				break;
			case "stych":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "svix":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "zoom":
				config = ZoomConfigOutSerializer._toJsonObject(self.config);
				break;
			case "tailscale":
				config = TailscaleConfigOutSerializer._toJsonObject(self.config);
				break;
			case "telnyx":
				config = TelnyxConfigOutSerializer._toJsonObject(self.config);
				break;
			case "vapi":
				config = VapiConfigOutSerializer._toJsonObject(self.config);
				break;
			case "open-ai":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "render":
				config = SvixConfigOutSerializer._toJsonObject(self.config);
				break;
			case "veriff":
				config = VeriffConfigOutSerializer._toJsonObject(self.config);
				break;
			case "airwallex":
				config = AirwallexConfigOutSerializer._toJsonObject(self.config);
				break;
			case "vgs": config = VgsConfigOutSerializer._toJsonObject(self.config);
		}
		return {
			type: self.type,
			config,
			id: self.id,
			uid: self.uid,
			name: self.name,
			ingestUrl: self.ingestUrl,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			metadata: self.metadata
		};
	}
};
var ListResponseIngestSourceOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => IngestSourceOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => IngestSourceOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var RotateTokenOutSerializer = {
	_fromJsonObject(object) {
		return { ingestUrl: object["ingestUrl"] };
	},
	_toJsonObject(self) {
		return { ingestUrl: self.ingestUrl };
	}
};
var IngestSource = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** List of all the organization's Ingest Sources. */
	async list(options) {
		const request = new SvixRequest("GET", "/ingest/api/v1/source");
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseIngestSourceOutSerializer._fromJsonObject);
	}
	/** Create Ingest Source. */
	async create(ingestSourceIn, options) {
		const request = new SvixRequest("POST", "/ingest/api/v1/source");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(IngestSourceInSerializer._toJsonObject(ingestSourceIn));
		return await request.send(this.requestCtx, IngestSourceOutSerializer._fromJsonObject);
	}
	/** Get an Ingest Source by id or uid. */
	async get(sourceId) {
		const request = new SvixRequest("GET", "/ingest/api/v1/source/{source_id}");
		request.setPathParam("source_id", sourceId);
		return await request.send(this.requestCtx, IngestSourceOutSerializer._fromJsonObject);
	}
	/** Create or update an Ingest Source. */
	async upsert(sourceId, ingestSourceIn) {
		const request = new SvixRequest("PUT", "/ingest/api/v1/source/{source_id}");
		request.setPathParam("source_id", sourceId);
		request.setBody(IngestSourceInSerializer._toJsonObject(ingestSourceIn));
		return await request.send(this.requestCtx, IngestSourceOutSerializer._fromJsonObject);
	}
	/** Delete an Ingest Source. */
	async delete(sourceId) {
		const request = new SvixRequest("DELETE", "/ingest/api/v1/source/{source_id}");
		request.setPathParam("source_id", sourceId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/**
	* Rotate the Ingest Source's Url Token.
	*
	* This will rotate the ingest source's token, which is used to
	* construct the unique `ingestUrl` for the source. Previous tokens
	* will remain valid for 48 hours after rotation. The token can be
	* rotated a maximum of three times within the 48-hour period.
	*/
	async rotateToken(sourceId, options) {
		const request = new SvixRequest("POST", "/ingest/api/v1/source/{source_id}/token/rotate");
		request.setPathParam("source_id", sourceId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		return await request.send(this.requestCtx, RotateTokenOutSerializer._fromJsonObject);
	}
};
var Ingest = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	get authentication() {
		return new IngestAuthentication(this.requestCtx);
	}
	get endpoint() {
		return new IngestEndpoint(this.requestCtx);
	}
	get source() {
		return new IngestSource(this.requestCtx);
	}
};
var IntegrationInSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			featureFlags: object["featureFlags"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			featureFlags: self.featureFlags
		};
	}
};
var IntegrationKeyOutSerializer = {
	_fromJsonObject(object) {
		return { key: object["key"] };
	},
	_toJsonObject(self) {
		return { key: self.key };
	}
};
var IntegrationOutSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			id: object["id"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			featureFlags: object["featureFlags"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			id: self.id,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			featureFlags: self.featureFlags
		};
	}
};
var IntegrationUpdateSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			featureFlags: object["featureFlags"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			featureFlags: self.featureFlags
		};
	}
};
var ListResponseIntegrationOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => IntegrationOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => IntegrationOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var Integration = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** List the application's integrations. */
	async list(appId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/integration");
		request.setPathParam("app_id", appId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseIntegrationOutSerializer._fromJsonObject);
	}
	/** Create an integration. */
	async create(appId, integrationIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/integration");
		request.setPathParam("app_id", appId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(IntegrationInSerializer._toJsonObject(integrationIn));
		return await request.send(this.requestCtx, IntegrationOutSerializer._fromJsonObject);
	}
	/** Get an integration. */
	async get(appId, integId) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/integration/{integ_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("integ_id", integId);
		return await request.send(this.requestCtx, IntegrationOutSerializer._fromJsonObject);
	}
	/** Update an integration. */
	async update(appId, integId, integrationUpdate) {
		const request = new SvixRequest("PUT", "/api/v1/app/{app_id}/integration/{integ_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("integ_id", integId);
		request.setBody(IntegrationUpdateSerializer._toJsonObject(integrationUpdate));
		return await request.send(this.requestCtx, IntegrationOutSerializer._fromJsonObject);
	}
	/** Delete an integration. */
	async delete(appId, integId) {
		const request = new SvixRequest("DELETE", "/api/v1/app/{app_id}/integration/{integ_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("integ_id", integId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Rotate the integration's key. The previous key will be immediately revoked. */
	async rotateKey(appId, integId, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/integration/{integ_id}/key/rotate");
		request.setPathParam("app_id", appId);
		request.setPathParam("integ_id", integId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		return await request.send(this.requestCtx, IntegrationKeyOutSerializer._fromJsonObject);
	}
};
var BulkExpungeContentsInSerializer = {
	_fromJsonObject(object) {
		return { ids: object["ids"] };
	},
	_toJsonObject(self) {
		return { ids: self.ids };
	}
};
var BulkExpungeStatusSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var BulkExpungeContentsOutSerializer = {
	_fromJsonObject(object) {
		return { results: Object.fromEntries(Object.entries(object["results"]).map((item) => [item[0], BulkExpungeStatusSerializer._fromJsonObject(item[1])])) };
	},
	_toJsonObject(self) {
		return { results: Object.fromEntries(Object.entries(self.results).map((item) => [item[0], BulkExpungeStatusSerializer._toJsonObject(item[1])])) };
	}
};
var ExpungeAllContentsOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			status: BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
			task: BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
			updatedAt: new Date(object["updatedAt"])
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			status: BackgroundTaskStatusSerializer._toJsonObject(self.status),
			task: BackgroundTaskTypeSerializer._toJsonObject(self.task),
			updatedAt: self.updatedAt
		};
	}
};
var ListResponseMessageOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => MessageOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => MessageOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var MessagePrecheckInSerializer = {
	_fromJsonObject(object) {
		return {
			eventType: object["eventType"],
			channels: object["channels"]
		};
	},
	_toJsonObject(self) {
		return {
			eventType: self.eventType,
			channels: self.channels
		};
	}
};
var MessagePrecheckOutSerializer = {
	_fromJsonObject(object) {
		return { active: object["active"] };
	},
	_toJsonObject(self) {
		return { active: self.active };
	}
};
var PollingEndpointConsumerSeekInSerializer = {
	_fromJsonObject(object) {
		return { after: new Date(object["after"]) };
	},
	_toJsonObject(self) {
		return { after: self.after };
	}
};
var PollingEndpointConsumerSeekOutSerializer = {
	_fromJsonObject(object) {
		return { iterator: object["iterator"] };
	},
	_toJsonObject(self) {
		return { iterator: self.iterator };
	}
};
var PollingEndpointMessageOutSerializer = {
	_fromJsonObject(object) {
		return {
			headers: object["headers"],
			eventId: object["eventId"],
			eventType: object["eventType"],
			payload: object["payload"],
			channels: object["channels"],
			id: object["id"],
			timestamp: new Date(object["timestamp"]),
			tags: object["tags"],
			deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null
		};
	},
	_toJsonObject(self) {
		return {
			headers: self.headers,
			eventId: self.eventId,
			eventType: self.eventType,
			payload: self.payload,
			channels: self.channels,
			id: self.id,
			timestamp: self.timestamp,
			tags: self.tags,
			deliverAt: self.deliverAt
		};
	}
};
var PollingEndpointOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => PollingEndpointMessageOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => PollingEndpointMessageOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			done: self.done
		};
	}
};
var MessagePoller = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Reads the stream of created messages for an application, filtered on the Sink's event types and Channels. */
	async poll(appId, sinkId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/poller/{sink_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("sink_id", sinkId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			event_type: options?.eventType,
			channel: options?.channel,
			after: options?.after
		});
		return await request.send(this.requestCtx, PollingEndpointOutSerializer._fromJsonObject);
	}
	/** Sets the starting offset for the consumer of a polling endpoint. */
	async consumerSeek(appId, sinkId, consumerId, pollingEndpointConsumerSeekIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}/seek");
		request.setPathParam("app_id", appId);
		request.setPathParam("sink_id", sinkId);
		request.setPathParam("consumer_id", consumerId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(PollingEndpointConsumerSeekInSerializer._toJsonObject(pollingEndpointConsumerSeekIn));
		return await request.send(this.requestCtx, PollingEndpointConsumerSeekOutSerializer._fromJsonObject);
	}
	/**
	* Reads the stream of created messages for an application, filtered on the Sink's event types and
	* Channels, using server-managed iterator tracking.
	*/
	async consumerPoll(appId, sinkId, consumerId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("sink_id", sinkId);
		request.setPathParam("consumer_id", consumerId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator
		});
		return await request.send(this.requestCtx, PollingEndpointOutSerializer._fromJsonObject);
	}
};
var MessageInSerializer = {
	_fromJsonObject(object) {
		return {
			eventId: object["eventId"],
			eventType: object["eventType"],
			payload: object["payload"],
			channels: object["channels"],
			application: object["application"] != null ? ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
			tags: object["tags"],
			transformationsParams: object["transformationsParams"],
			deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
			payloadRetentionPeriod: object["payloadRetentionPeriod"],
			payloadRetentionHours: object["payloadRetentionHours"]
		};
	},
	_toJsonObject(self) {
		return {
			eventId: self.eventId,
			eventType: self.eventType,
			payload: self.payload,
			channels: self.channels,
			application: self.application != null ? ApplicationInSerializer._toJsonObject(self.application) : void 0,
			tags: self.tags,
			transformationsParams: self.transformationsParams,
			deliverAt: self.deliverAt,
			payloadRetentionPeriod: self.payloadRetentionPeriod,
			payloadRetentionHours: self.payloadRetentionHours
		};
	}
};
var Message = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	get poller() {
		return new MessagePoller(this.requestCtx);
	}
	/**
	* List all of the application's messages.
	*
	* The `before` and `after` parameters let you filter all items created before or after a certain date. These can be
	* used alongside an iterator to paginate over results within a certain window.
	*
	* Note that by default this endpoint is limited to retrieving 90 days' worth of data
	* relative to now or, if an iterator is provided, 90 days before/after the time indicated
	* by the iterator ID. If you require data beyond those time ranges, you will need to explicitly
	* set the `before` or `after` parameter as appropriate.
	*/
	async list(appId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/msg");
		request.setPathParam("app_id", appId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			channel: options?.channel,
			before: options?.before,
			after: options?.after,
			with_content: options?.withContent ?? false,
			tag: options?.tag,
			event_types: options?.eventTypes
		});
		return await request.send(this.requestCtx, ListResponseMessageOutSerializer._fromJsonObject);
	}
	/**
	* Creates a new message and dispatches it to all of the application's endpoints.
	*
	* The `eventId` is an optional custom unique ID. It's verified to be unique only up to a day, after that no verification will be made.
	* If a message with the same `eventId` already exists for the application, a 409 conflict error will be returned.
	*
	* The `eventType` indicates the type and schema of the event. All messages of a certain `eventType` are expected to have the same schema. Endpoints can choose to only listen to specific event types.
	* Messages can also have `channels`, which similar to event types let endpoints filter by them. Unlike event types, messages can have multiple channels, and channels don't imply a specific message content or schema.
	*
	* The `payload` property is the webhook's body (the actual webhook message). Svix supports payload sizes of up to 1MiB, though it's generally a good idea to keep webhook payloads small, probably no larger than 40kb.
	*/
	async create(appId, messageIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/msg");
		request.setPathParam("app_id", appId);
		request.setQueryParams({ with_content: options?.withContent ?? false });
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(MessageInSerializer._toJsonObject(messageIn));
		return await request.send(this.requestCtx, MessageOutSerializer._fromJsonObject);
	}
	/**
	* A pre-check call for `message.create` that checks whether any active endpoints are
	* listening to this message.
	*
	* Note: most people shouldn't be using this API. Svix doesn't bill you for
	* messages not actually sent, so using this API doesn't save money.
	* If unsure, please ask Svix support before using this API.
	*/
	async precheck(appId, messagePrecheckIn, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/msg/precheck/active");
		request.setPathParam("app_id", appId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(MessagePrecheckInSerializer._toJsonObject(messagePrecheckIn));
		return await request.send(this.requestCtx, MessagePrecheckOutSerializer._fromJsonObject);
	}
	/** Get a message by its ID or eventID. */
	async get(appId, msgId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/msg/{msg_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("msg_id", msgId);
		request.setQueryParams({ with_content: options?.withContent ?? false });
		return await request.send(this.requestCtx, MessageOutSerializer._fromJsonObject);
	}
	/**
	* Delete the given message's payload.
	*
	* Useful in cases when a message was accidentally sent with sensitive content.
	* The message can't be replayed or resent once its payload has been deleted
	* (or has expired).
	*/
	async expungeContent(appId, msgId) {
		const request = new SvixRequest("DELETE", "/api/v1/app/{app_id}/msg/{msg_id}/content");
		request.setPathParam("app_id", appId);
		request.setPathParam("msg_id", msgId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/**
	* Delete the payloads from the given messages under the current application
	*
	* Useful in cases when a message was accidentally sent with sensitive content.
	* A message can't be replayed or resent once its payload has been deleted
	* (or has expired).
	*/
	async bulkExpungeContent(appId, bulkExpungeContentsIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/msg/bulk-expunge");
		request.setPathParam("app_id", appId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(BulkExpungeContentsInSerializer._toJsonObject(bulkExpungeContentsIn));
		return await request.send(this.requestCtx, BulkExpungeContentsOutSerializer._fromJsonObject);
	}
	/**
	* Delete all message payloads for the application.
	*
	* This operation is only available in the <a href="https://svix.com/pricing" target="_blank">Enterprise</a> plan.
	*
	* A completed task will return a payload like the following:
	* ```json
	* {
	*   "id": "qtask_33qen93MNuelBAq1T9G7eHLJRsF",
	*   "status": "finished",
	*   "task": "application.purge_content",
	*   "data": {
	*     "messagesPurged": 150
	*   }
	* }
	* ```
	*/
	async expungeAllContents(appId, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/msg/expunge-all-contents");
		request.setPathParam("app_id", appId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		return await request.send(this.requestCtx, ExpungeAllContentsOutSerializer._fromJsonObject);
	}
};
var MessageStatusTextSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var EndpointMessageOutSerializer = {
	_fromJsonObject(object) {
		return {
			status: MessageStatusSerializer._fromJsonObject(object["status"]),
			statusText: MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
			nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
			eventId: object["eventId"],
			eventType: object["eventType"],
			payload: object["payload"],
			channels: object["channels"],
			id: object["id"],
			timestamp: new Date(object["timestamp"]),
			tags: object["tags"],
			deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null
		};
	},
	_toJsonObject(self) {
		return {
			status: MessageStatusSerializer._toJsonObject(self.status),
			statusText: MessageStatusTextSerializer._toJsonObject(self.statusText),
			nextAttempt: self.nextAttempt,
			eventId: self.eventId,
			eventType: self.eventType,
			payload: self.payload,
			channels: self.channels,
			id: self.id,
			timestamp: self.timestamp,
			tags: self.tags,
			deliverAt: self.deliverAt
		};
	}
};
var ListResponseEndpointMessageOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => EndpointMessageOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => EndpointMessageOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var MessageAttemptTriggerTypeSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var MessageAttemptOutSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			response: object["response"],
			responseStatusCode: object["responseStatusCode"],
			responseDurationMs: object["responseDurationMs"],
			status: MessageStatusSerializer._fromJsonObject(object["status"]),
			statusText: MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
			triggerType: MessageAttemptTriggerTypeSerializer._fromJsonObject(object["triggerType"]),
			msgId: object["msgId"],
			endpointId: object["endpointId"],
			id: object["id"],
			timestamp: new Date(object["timestamp"]),
			msg: object["msg"] != null ? MessageOutSerializer._fromJsonObject(object["msg"]) : void 0
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			response: self.response,
			responseStatusCode: self.responseStatusCode,
			responseDurationMs: self.responseDurationMs,
			status: MessageStatusSerializer._toJsonObject(self.status),
			statusText: MessageStatusTextSerializer._toJsonObject(self.statusText),
			triggerType: MessageAttemptTriggerTypeSerializer._toJsonObject(self.triggerType),
			msgId: self.msgId,
			endpointId: self.endpointId,
			id: self.id,
			timestamp: self.timestamp,
			msg: self.msg != null ? MessageOutSerializer._toJsonObject(self.msg) : void 0
		};
	}
};
var ListResponseMessageAttemptOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => MessageAttemptOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => MessageAttemptOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var MessageEndpointOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			status: MessageStatusSerializer._fromJsonObject(object["status"]),
			statusText: MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
			nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"])
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			status: MessageStatusSerializer._toJsonObject(self.status),
			statusText: MessageStatusTextSerializer._toJsonObject(self.statusText),
			nextAttempt: self.nextAttempt,
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			eventTypes: self.eventTypes,
			channels: self.channels,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt
		};
	}
};
var ListResponseMessageEndpointOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => MessageEndpointOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => MessageEndpointOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var MessageAttempt = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/**
	* List attempts by endpoint id
	*
	* Note that by default this endpoint is limited to retrieving 90 days' worth of data
	* relative to now or, if an iterator is provided, 90 days before/after the time indicated
	* by the iterator ID. If you require data beyond those time ranges, you will need to explicitly
	* set the `before` or `after` parameter as appropriate.
	*/
	async listByEndpoint(appId, endpointId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/attempt/endpoint/{endpoint_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			status: options?.status,
			status_code_class: options?.statusCodeClass,
			channel: options?.channel,
			tag: options?.tag,
			before: options?.before,
			after: options?.after,
			with_content: options?.withContent ?? false,
			with_msg: options?.withMsg,
			expanded_statuses: options?.expandedStatuses ?? true,
			event_types: options?.eventTypes
		});
		return await request.send(this.requestCtx, ListResponseMessageAttemptOutSerializer._fromJsonObject);
	}
	/**
	* List attempts by message ID.
	*
	* Note that by default this endpoint is limited to retrieving 90 days' worth of data
	* relative to now or, if an iterator is provided, 90 days before/after the time indicated
	* by the iterator ID. If you require data beyond those time ranges, you will need to explicitly
	* set the `before` or `after` parameter as appropriate.
	*/
	async listByMsg(appId, msgId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/attempt/msg/{msg_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("msg_id", msgId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			status: options?.status,
			status_code_class: options?.statusCodeClass,
			channel: options?.channel,
			tag: options?.tag,
			endpoint_id: options?.endpointId,
			before: options?.before,
			after: options?.after,
			with_content: options?.withContent ?? false,
			expanded_statuses: options?.expandedStatuses ?? true,
			event_types: options?.eventTypes
		});
		return await request.send(this.requestCtx, ListResponseMessageAttemptOutSerializer._fromJsonObject);
	}
	/**
	* List messages for a particular endpoint.
	*
	* Additionally includes metadata about the latest message attempt.
	* The `before` parameter lets you filter all items created before a certain date and is ignored if an iterator is passed.
	*
	* Note that by default this endpoint is limited to retrieving 90 days' worth of data
	* relative to now or, if an iterator is provided, 90 days before/after the time indicated
	* by the iterator ID. If you require data beyond those time ranges, you will need to explicitly
	* set the `before` or `after` parameter as appropriate.
	*/
	async listAttemptedMessages(appId, endpointId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/endpoint/{endpoint_id}/msg");
		request.setPathParam("app_id", appId);
		request.setPathParam("endpoint_id", endpointId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			channel: options?.channel,
			tag: options?.tag,
			status: options?.status,
			before: options?.before,
			after: options?.after,
			with_content: options?.withContent ?? false,
			expanded_statuses: options?.expandedStatuses ?? true,
			event_types: options?.eventTypes
		});
		return await request.send(this.requestCtx, ListResponseEndpointMessageOutSerializer._fromJsonObject);
	}
	/**
	* List endpoints attempted by a given message.
	*
	* Additionally includes metadata about the latest message attempt.
	* By default, endpoints are listed in ascending order by ID.
	*/
	async listAttemptedDestinations(appId, msgId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/msg/{msg_id}/endpoint");
		request.setPathParam("app_id", appId);
		request.setPathParam("msg_id", msgId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator
		});
		return await request.send(this.requestCtx, ListResponseMessageEndpointOutSerializer._fromJsonObject);
	}
	/** `msg_id`: Use a message id or a message `eventId` */
	async get(appId, msgId, attemptId, options) {
		const request = new SvixRequest("GET", "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}");
		request.setPathParam("app_id", appId);
		request.setPathParam("msg_id", msgId);
		request.setPathParam("attempt_id", attemptId);
		request.setQueryParams({ expanded_statuses: options?.expandedStatuses ?? true });
		return await request.send(this.requestCtx, MessageAttemptOutSerializer._fromJsonObject);
	}
	/**
	* Deletes the given attempt's response body.
	*
	* Useful when an endpoint accidentally returned sensitive content.
	* The message can't be replayed or resent once its payload has been deleted or expired.
	*/
	async expungeContent(appId, msgId, attemptId) {
		const request = new SvixRequest("DELETE", "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}/content");
		request.setPathParam("app_id", appId);
		request.setPathParam("msg_id", msgId);
		request.setPathParam("attempt_id", attemptId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Resend a message to the specified endpoint. */
	async resend(appId, msgId, endpointId, options) {
		const request = new SvixRequest("POST", "/api/v1/app/{app_id}/msg/{msg_id}/endpoint/{endpoint_id}/resend");
		request.setPathParam("app_id", appId);
		request.setPathParam("msg_id", msgId);
		request.setPathParam("endpoint_id", endpointId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		return await request.send(this.requestCtx, EmptyResponseSerializer._fromJsonObject);
	}
};
var OperationalWebhookEndpointOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			eventTypes: object["eventTypes"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			eventTypes: self.eventTypes,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			metadata: self.metadata
		};
	}
};
var ListResponseOperationalWebhookEndpointOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => OperationalWebhookEndpointOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => OperationalWebhookEndpointOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var OperationalWebhookEndpointHeadersInSerializer = {
	_fromJsonObject(object) {
		return { headers: object["headers"] };
	},
	_toJsonObject(self) {
		return { headers: self.headers };
	}
};
var OperationalWebhookEndpointHeadersOutSerializer = {
	_fromJsonObject(object) {
		return {
			headers: object["headers"],
			sensitive: object["sensitive"]
		};
	},
	_toJsonObject(self) {
		return {
			headers: self.headers,
			sensitive: self.sensitive
		};
	}
};
var OperationalWebhookEndpointInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			eventTypes: object["eventTypes"],
			secret: object["secret"],
			metadata: object["metadata"],
			headers: object["headers"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			eventTypes: self.eventTypes,
			secret: self.secret,
			metadata: self.metadata,
			headers: self.headers
		};
	}
};
var OperationalWebhookEndpointSecretInSerializer = {
	_fromJsonObject(object) {
		return {
			key: object["key"],
			gracePeriodSeconds: object["gracePeriodSeconds"]
		};
	},
	_toJsonObject(self) {
		return {
			key: self.key,
			gracePeriodSeconds: self.gracePeriodSeconds
		};
	}
};
var OperationalWebhookEndpointSecretOutSerializer = {
	_fromJsonObject(object) {
		return { key: object["key"] };
	},
	_toJsonObject(self) {
		return { key: self.key };
	}
};
var OperationalWebhookEndpointUpsertInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			description: object["description"],
			throttleRate: object["throttleRate"],
			uid: object["uid"],
			disabled: object["disabled"],
			eventTypes: object["eventTypes"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			description: self.description,
			throttleRate: self.throttleRate,
			uid: self.uid,
			disabled: self.disabled,
			eventTypes: self.eventTypes,
			metadata: self.metadata
		};
	}
};
var OperationalWebhookEndpoint = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** List operational webhook endpoints. */
	async list(options) {
		const request = new SvixRequest("GET", "/api/v1/operational-webhook/endpoint");
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseOperationalWebhookEndpointOutSerializer._fromJsonObject);
	}
	/** Create an operational webhook endpoint. */
	async create(operationalWebhookEndpointIn, options) {
		const request = new SvixRequest("POST", "/api/v1/operational-webhook/endpoint");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(OperationalWebhookEndpointInSerializer._toJsonObject(operationalWebhookEndpointIn));
		return await request.send(this.requestCtx, OperationalWebhookEndpointOutSerializer._fromJsonObject);
	}
	/** Get an operational webhook endpoint. */
	async get(endpointId) {
		const request = new SvixRequest("GET", "/api/v1/operational-webhook/endpoint/{endpoint_id}");
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, OperationalWebhookEndpointOutSerializer._fromJsonObject);
	}
	/** Create or update an operational webhook endpoint. */
	async upsert(endpointId, operationalWebhookEndpointUpsertIn) {
		const request = new SvixRequest("PUT", "/api/v1/operational-webhook/endpoint/{endpoint_id}");
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(OperationalWebhookEndpointUpsertInSerializer._toJsonObject(operationalWebhookEndpointUpsertIn));
		return await request.send(this.requestCtx, OperationalWebhookEndpointOutSerializer._fromJsonObject);
	}
	/** Delete an operational webhook endpoint. */
	async delete(endpointId) {
		const request = new SvixRequest("DELETE", "/api/v1/operational-webhook/endpoint/{endpoint_id}");
		request.setPathParam("endpoint_id", endpointId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/**
	* Get an operational webhook endpoint's signing secret.
	*
	* This is used to verify the authenticity of the webhook.
	* For more information please refer to [the consuming webhooks docs](https://docs.svix.com/consuming-webhooks/).
	*/
	async getSecret(endpointId) {
		const request = new SvixRequest("GET", "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret");
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, OperationalWebhookEndpointSecretOutSerializer._fromJsonObject);
	}
	/**
	* Rotates an operational webhook endpoint's signing secret.
	*
	* The previous secret will remain valid for the specified grace period (default 24 hours).
	*/
	async rotateSecret(endpointId, operationalWebhookEndpointSecretIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret/rotate");
		request.setPathParam("endpoint_id", endpointId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(OperationalWebhookEndpointSecretInSerializer._toJsonObject(operationalWebhookEndpointSecretIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Get the additional headers to be sent with the operational webhook. */
	async getHeaders(endpointId) {
		const request = new SvixRequest("GET", "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
		request.setPathParam("endpoint_id", endpointId);
		return await request.send(this.requestCtx, OperationalWebhookEndpointHeadersOutSerializer._fromJsonObject);
	}
	/** Set the additional headers to be sent with the operational webhook. */
	async setHeaders(endpointId, operationalWebhookEndpointHeadersIn) {
		const request = new SvixRequest("PUT", "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
		request.setPathParam("endpoint_id", endpointId);
		request.setBody(OperationalWebhookEndpointHeadersInSerializer._toJsonObject(operationalWebhookEndpointHeadersIn));
		return await request.sendNoResponseBody(this.requestCtx);
	}
};
var OperationalWebhook = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	get endpoint() {
		return new OperationalWebhookEndpoint(this.requestCtx);
	}
};
var AggregateEventTypesOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			status: BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
			task: BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
			updatedAt: new Date(object["updatedAt"])
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			status: BackgroundTaskStatusSerializer._toJsonObject(self.status),
			task: BackgroundTaskTypeSerializer._toJsonObject(self.task),
			updatedAt: self.updatedAt
		};
	}
};
var AppUsageStatsInSerializer = {
	_fromJsonObject(object) {
		return {
			since: new Date(object["since"]),
			until: new Date(object["until"]),
			appIds: object["appIds"]
		};
	},
	_toJsonObject(self) {
		return {
			since: self.since,
			until: self.until,
			appIds: self.appIds
		};
	}
};
var AppUsageStatsOutSerializer = {
	_fromJsonObject(object) {
		return {
			unresolvedAppIds: object["unresolvedAppIds"],
			id: object["id"],
			status: BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
			task: BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
			updatedAt: new Date(object["updatedAt"])
		};
	},
	_toJsonObject(self) {
		return {
			unresolvedAppIds: self.unresolvedAppIds,
			id: self.id,
			status: BackgroundTaskStatusSerializer._toJsonObject(self.status),
			task: BackgroundTaskTypeSerializer._toJsonObject(self.task),
			updatedAt: self.updatedAt
		};
	}
};
var Statistics = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/**
	* Creates a background task to calculate the listed event types for all apps in the organization.
	*
	* Note that this endpoint is asynchronous. You will need to poll the `Get Background Task` endpoint to
	* retrieve the results of the operation.
	*
	* The completed background task will return a payload like the following:
	* ```json
	* {
	*   "id": "qtask_33qe39Stble9Rn3ZxFrqL5ZSsjT",
	*   "status": "finished",
	*   "task": "event-type.aggregate",
	*   "data": {
	*     "event_types": [
	*       {
	*         "appId": "app_33W1An2Zz5cO9SWbhHsYyDmVC6m",
	*         "explicitlySubscribedEventTypes": ["user.signup", "user.deleted"],
	*         "hasCatchAllEndpoint": false
	*       }
	*     ]
	*   }
	* }
	* ```
	*/
	async aggregateEventTypes() {
		return await new SvixRequest("PUT", "/api/v1/stats/usage/event-types").send(this.requestCtx, AggregateEventTypesOutSerializer._fromJsonObject);
	}
	/**
	* Creates a background task to calculate the number of message attempts (`messageDestinations`) made for all applications in the environment.
	*
	* Note that this endpoint is asynchronous. You will need to poll the `Get Background Task` endpoint to
	* retrieve the results of the operation.
	*
	* The completed background task will return a payload like the following:
	* ```json
	* {
	*   "id": "qtask_33qe39Stble9Rn3ZxFrqL5ZSsjT",
	*   "status": "finished",
	*   "task": "application.stats",
	*   "data": {
	*     "appStats": [
	*       {
	*         "messageDestinations": 2,
	*         "appId": "app_33W1An2Zz5cO9SWbhHsYyDmVC6m",
	*         "appUid": null
	*       }
	*     ]
	*   }
	* }
	* ```
	*/
	async aggregateAppStats(appUsageStatsIn, options) {
		const request = new SvixRequest("POST", "/api/v1/stats/usage/app");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(AppUsageStatsInSerializer._toJsonObject(appUsageStatsIn));
		return await request.send(this.requestCtx, AppUsageStatsOutSerializer._fromJsonObject);
	}
};
var HttpSinkHeadersPatchInSerializer = {
	_fromJsonObject(object) {
		return { headers: object["headers"] };
	},
	_toJsonObject(self) {
		return { headers: self.headers };
	}
};
var StreamEventTypeOutSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			description: object["description"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			deprecated: object["deprecated"],
			archived: object["archived"],
			featureFlags: object["featureFlags"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			description: self.description,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			deprecated: self.deprecated,
			archived: self.archived,
			featureFlags: self.featureFlags
		};
	}
};
var ListResponseStreamEventTypeOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => StreamEventTypeOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => StreamEventTypeOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var StreamEventTypeInSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			description: object["description"],
			featureFlags: object["featureFlags"],
			deprecated: object["deprecated"],
			archived: object["archived"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			description: self.description,
			featureFlags: self.featureFlags,
			deprecated: self.deprecated,
			archived: self.archived
		};
	}
};
var StreamEventTypePatchSerializer = {
	_fromJsonObject(object) {
		return {
			description: object["description"],
			featureFlags: object["featureFlags"],
			deprecated: object["deprecated"],
			archived: object["archived"]
		};
	},
	_toJsonObject(self) {
		return {
			description: self.description,
			featureFlags: self.featureFlags,
			deprecated: self.deprecated,
			archived: self.archived
		};
	}
};
var StreamingEventType = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** List of all the organization's event types for streaming. */
	async list(options) {
		const request = new SvixRequest("GET", "/api/v1/stream/event-type");
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order,
			include_archived: options?.includeArchived
		});
		return await request.send(this.requestCtx, ListResponseStreamEventTypeOutSerializer._fromJsonObject);
	}
	/** Create an event type for Streams. */
	async create(streamEventTypeIn, options) {
		const request = new SvixRequest("POST", "/api/v1/stream/event-type");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn));
		return await request.send(this.requestCtx, StreamEventTypeOutSerializer._fromJsonObject);
	}
	/** Get an event type. */
	async get(name) {
		const request = new SvixRequest("GET", "/api/v1/stream/event-type/{name}");
		request.setPathParam("name", name);
		return await request.send(this.requestCtx, StreamEventTypeOutSerializer._fromJsonObject);
	}
	/** Create or update or create a event type for Streams. */
	async upsert(name, streamEventTypeIn) {
		const request = new SvixRequest("PUT", "/api/v1/stream/event-type/{name}");
		request.setPathParam("name", name);
		request.setBody(StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn));
		return await request.send(this.requestCtx, StreamEventTypeOutSerializer._fromJsonObject);
	}
	/** Delete an event type. */
	async delete(name, options) {
		const request = new SvixRequest("DELETE", "/api/v1/stream/event-type/{name}");
		request.setPathParam("name", name);
		request.setQueryParams({ expunge: options?.expunge });
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Patch an event type for Streams. */
	async patch(name, streamEventTypePatch) {
		const request = new SvixRequest("PATCH", "/api/v1/stream/event-type/{name}");
		request.setPathParam("name", name);
		request.setBody(StreamEventTypePatchSerializer._toJsonObject(streamEventTypePatch));
		return await request.send(this.requestCtx, StreamEventTypeOutSerializer._fromJsonObject);
	}
};
var EventInSerializer = {
	_fromJsonObject(object) {
		return {
			eventType: object["eventType"],
			payload: object["payload"]
		};
	},
	_toJsonObject(self) {
		return {
			eventType: self.eventType,
			payload: self.payload
		};
	}
};
var StreamInSerializer = {
	_fromJsonObject(object) {
		return {
			name: object["name"],
			uid: object["uid"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			name: self.name,
			uid: self.uid,
			metadata: self.metadata
		};
	}
};
var CreateStreamEventsInSerializer = {
	_fromJsonObject(object) {
		return {
			events: object["events"].map((item) => EventInSerializer._fromJsonObject(item)),
			stream: object["stream"] != null ? StreamInSerializer._fromJsonObject(object["stream"]) : void 0
		};
	},
	_toJsonObject(self) {
		return {
			events: self.events.map((item) => EventInSerializer._toJsonObject(item)),
			stream: self.stream != null ? StreamInSerializer._toJsonObject(self.stream) : void 0
		};
	}
};
var CreateStreamEventsOutSerializer = {
	_fromJsonObject(_object) {
		return {};
	},
	_toJsonObject(_self) {
		return {};
	}
};
var EventOutSerializer = {
	_fromJsonObject(object) {
		return {
			eventType: object["eventType"],
			payload: object["payload"],
			timestamp: new Date(object["timestamp"])
		};
	},
	_toJsonObject(self) {
		return {
			eventType: self.eventType,
			payload: self.payload,
			timestamp: self.timestamp
		};
	}
};
var EventStreamOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => EventOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => EventOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			done: self.done
		};
	}
};
var StreamingEvents = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/**
	* Iterate over a stream of events.
	*
	* The sink must be of type `poller` to use the poller endpoint.
	*/
	async get(streamId, sinkId, options) {
		const request = new SvixRequest("GET", "/api/v1/stream/{stream_id}/sink/{sink_id}/events");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			after: options?.after
		});
		return await request.send(this.requestCtx, EventStreamOutSerializer._fromJsonObject);
	}
	/** Creates events on the Stream. */
	async create(streamId, createStreamEventsIn, options) {
		const request = new SvixRequest("POST", "/api/v1/stream/{stream_id}/events");
		request.setPathParam("stream_id", streamId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(CreateStreamEventsInSerializer._toJsonObject(createStreamEventsIn));
		return await request.send(this.requestCtx, CreateStreamEventsOutSerializer._fromJsonObject);
	}
};
var SinkStatusSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var StreamSinkOutSerializer = {
	_fromJsonObject(object) {
		const type = object["type"];
		function getConfig(type) {
			switch (type) {
				case "poller": return {};
				case "pollingEndpoint": return {};
				case "azureBlobStorage": return AzureBlobStorageConfigOutSerializer._fromJsonObject(object["config"]);
				case "otelTracing": return OtelTracingConfigOutSerializer._fromJsonObject(object["config"]);
				case "http": return SinkHttpConfigOutSerializer._fromJsonObject(object["config"]);
				case "amazonS3": return S3ConfigOutSerializer._fromJsonObject(object["config"]);
				case "snowflake": return SnowflakeConfigOutSerializer._fromJsonObject(object["config"]);
				case "googleCloudStorage": return GoogleCloudStorageConfigOutSerializer._fromJsonObject(object["config"]);
				case "googleCloudPubSub": return GoogleCloudPubSubConfigOutSerializer._fromJsonObject(object["config"]);
				case "redshift": return RedshiftConfigOutSerializer._fromJsonObject(object["config"]);
				case "bigQuery": return BigQueryConfigOutSerializer._fromJsonObject(object["config"]);
				case "clickhouse": return ClickhouseConfigOutSerializer._fromJsonObject(object["config"]);
				case "rabbitMq": return RabbitMqConfigOutSerializer._fromJsonObject(object["config"]);
				case "sqs": return SqsConfigOutSerializer._fromJsonObject(object["config"]);
				case "eventBridge": return EventBridgeConfigOutSerializer._fromJsonObject(object["config"]);
				case "sns": return SnsConfigOutSerializer._fromJsonObject(object["config"]);
				case "postgres": return PostgresConfigOutSerializer._fromJsonObject(object["config"]);
				default: throw new Error(`Unexpected type: ${type}`);
			}
		}
		return {
			type,
			config: getConfig(type),
			id: object["id"],
			uid: object["uid"],
			status: SinkStatusSerializer._fromJsonObject(object["status"]),
			currentIterator: object["currentIterator"],
			failureReason: object["failureReason"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			batchSize: object["batchSize"],
			maxWaitSecs: object["maxWaitSecs"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			nextRetryAt: object["nextRetryAt"] ? new Date(object["nextRetryAt"]) : null,
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		let config;
		switch (self.type) {
			case "poller":
				config = {};
				break;
			case "pollingEndpoint":
				config = {};
				break;
			case "azureBlobStorage":
				config = AzureBlobStorageConfigOutSerializer._toJsonObject(self.config);
				break;
			case "otelTracing":
				config = OtelTracingConfigOutSerializer._toJsonObject(self.config);
				break;
			case "http":
				config = SinkHttpConfigOutSerializer._toJsonObject(self.config);
				break;
			case "amazonS3":
				config = S3ConfigOutSerializer._toJsonObject(self.config);
				break;
			case "snowflake":
				config = SnowflakeConfigOutSerializer._toJsonObject(self.config);
				break;
			case "googleCloudStorage":
				config = GoogleCloudStorageConfigOutSerializer._toJsonObject(self.config);
				break;
			case "googleCloudPubSub":
				config = GoogleCloudPubSubConfigOutSerializer._toJsonObject(self.config);
				break;
			case "redshift":
				config = RedshiftConfigOutSerializer._toJsonObject(self.config);
				break;
			case "bigQuery":
				config = BigQueryConfigOutSerializer._toJsonObject(self.config);
				break;
			case "clickhouse":
				config = ClickhouseConfigOutSerializer._toJsonObject(self.config);
				break;
			case "rabbitMq":
				config = RabbitMqConfigOutSerializer._toJsonObject(self.config);
				break;
			case "sqs":
				config = SqsConfigOutSerializer._toJsonObject(self.config);
				break;
			case "eventBridge":
				config = EventBridgeConfigOutSerializer._toJsonObject(self.config);
				break;
			case "sns":
				config = SnsConfigOutSerializer._toJsonObject(self.config);
				break;
			case "postgres": config = PostgresConfigOutSerializer._toJsonObject(self.config);
		}
		return {
			type: self.type,
			config,
			id: self.id,
			uid: self.uid,
			status: SinkStatusSerializer._toJsonObject(self.status),
			currentIterator: self.currentIterator,
			failureReason: self.failureReason,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			batchSize: self.batchSize,
			maxWaitSecs: self.maxWaitSecs,
			eventTypes: self.eventTypes,
			channels: self.channels,
			nextRetryAt: self.nextRetryAt,
			metadata: self.metadata
		};
	}
};
var ListResponseStreamSinkOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => StreamSinkOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => StreamSinkOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var SinkSecretOutSerializer = {
	_fromJsonObject(object) {
		return { key: object["key"] };
	},
	_toJsonObject(self) {
		return { key: self.key };
	}
};
var SinkHttpConfigInSerializer = {
	_fromJsonObject(object) {
		return {
			url: object["url"],
			headers: object["headers"],
			key: object["key"]
		};
	},
	_toJsonObject(self) {
		return {
			url: self.url,
			headers: self.headers,
			key: self.key
		};
	}
};
var SinkStatusInSerializer = {
	_fromJsonObject(object) {
		return object;
	},
	_toJsonObject(self) {
		return self;
	}
};
var StreamSinkInSerializer = {
	_fromJsonObject(object) {
		const type = object["type"];
		function getConfig(type) {
			switch (type) {
				case "poller": return {};
				case "azureBlobStorage": return AzureBlobStorageConfigInSerializer._fromJsonObject(object["config"]);
				case "otelTracing": return OtelTracingConfigInSerializer._fromJsonObject(object["config"]);
				case "http": return SinkHttpConfigInSerializer._fromJsonObject(object["config"]);
				case "amazonS3": return S3ConfigInSerializer._fromJsonObject(object["config"]);
				case "googleCloudStorage": return GoogleCloudStorageConfigInSerializer._fromJsonObject(object["config"]);
				case "googleCloudPubSub": return GoogleCloudPubSubConfigInSerializer._fromJsonObject(object["config"]);
				case "sqs": return SqsConfigInSerializer._fromJsonObject(object["config"]);
				case "sns": return SnsConfigInSerializer._fromJsonObject(object["config"]);
				case "bigQuery": return BigQueryConfigInSerializer._fromJsonObject(object["config"]);
				case "clickhouse": return ClickhouseConfigInSerializer._fromJsonObject(object["config"]);
				case "eventBridge": return EventBridgeConfigInSerializer._fromJsonObject(object["config"]);
				case "snowflake": return SnowflakeConfigInSerializer._fromJsonObject(object["config"]);
				case "rabbitMq": return RabbitMqConfigInSerializer._fromJsonObject(object["config"]);
				case "redshift": return RedshiftConfigInSerializer._fromJsonObject(object["config"]);
				case "postgres": return PostgresConfigInSerializer._fromJsonObject(object["config"]);
				default: throw new Error(`Unexpected type: ${type}`);
			}
		}
		return {
			type,
			config: getConfig(type),
			uid: object["uid"],
			status: object["status"] != null ? SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
			batchSize: object["batchSize"],
			maxWaitSecs: object["maxWaitSecs"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		let config;
		switch (self.type) {
			case "poller":
				config = {};
				break;
			case "azureBlobStorage":
				config = AzureBlobStorageConfigInSerializer._toJsonObject(self.config);
				break;
			case "otelTracing":
				config = OtelTracingConfigInSerializer._toJsonObject(self.config);
				break;
			case "http":
				config = SinkHttpConfigInSerializer._toJsonObject(self.config);
				break;
			case "amazonS3":
				config = S3ConfigInSerializer._toJsonObject(self.config);
				break;
			case "googleCloudStorage":
				config = GoogleCloudStorageConfigInSerializer._toJsonObject(self.config);
				break;
			case "googleCloudPubSub":
				config = GoogleCloudPubSubConfigInSerializer._toJsonObject(self.config);
				break;
			case "sqs":
				config = SqsConfigInSerializer._toJsonObject(self.config);
				break;
			case "sns":
				config = SnsConfigInSerializer._toJsonObject(self.config);
				break;
			case "bigQuery":
				config = BigQueryConfigInSerializer._toJsonObject(self.config);
				break;
			case "clickhouse":
				config = ClickhouseConfigInSerializer._toJsonObject(self.config);
				break;
			case "eventBridge":
				config = EventBridgeConfigInSerializer._toJsonObject(self.config);
				break;
			case "snowflake":
				config = SnowflakeConfigInSerializer._toJsonObject(self.config);
				break;
			case "rabbitMq":
				config = RabbitMqConfigInSerializer._toJsonObject(self.config);
				break;
			case "redshift":
				config = RedshiftConfigInSerializer._toJsonObject(self.config);
				break;
			case "postgres": config = PostgresConfigInSerializer._toJsonObject(self.config);
		}
		return {
			type: self.type,
			config,
			uid: self.uid,
			status: self.status != null ? SinkStatusInSerializer._toJsonObject(self.status) : void 0,
			batchSize: self.batchSize,
			maxWaitSecs: self.maxWaitSecs,
			eventTypes: self.eventTypes,
			channels: self.channels,
			metadata: self.metadata
		};
	}
};
var StreamSinkPatchSerializer = {
	_fromJsonObject(object) {
		const type = object["type"];
		function getConfig(type) {
			switch (type) {
				case "poller": return {};
				case "azureBlobStorage": return AzureBlobStorageConfigPatchSerializer._fromJsonObject(object["config"]);
				case "otelTracing": return OtelTracingConfigPatchSerializer._fromJsonObject(object["config"]);
				case "http": return SinkHttpConfigPatchSerializer._fromJsonObject(object["config"]);
				case "amazonS3": return S3ConfigPatchSerializer._fromJsonObject(object["config"]);
				case "googleCloudStorage": return GoogleCloudStorageConfigPatchSerializer._fromJsonObject(object["config"]);
				case "googleCloudPubSub": return GoogleCloudPubSubConfigPatchSerializer._fromJsonObject(object["config"]);
				case "sqs": return SqsConfigPatchSerializer._fromJsonObject(object["config"]);
				case "sns": return SnsConfigPatchSerializer._fromJsonObject(object["config"]);
				case "bigQuery": return BigQueryConfigPatchSerializer._fromJsonObject(object["config"]);
				case "clickhouse": return ClickhouseConfigPatchSerializer._fromJsonObject(object["config"]);
				case "eventBridge": return EventBridgeConfigPatchSerializer._fromJsonObject(object["config"]);
				case "snowflake": return SnowflakeConfigPatchSerializer._fromJsonObject(object["config"]);
				case "rabbitMq": return RabbitMqConfigPatchSerializer._fromJsonObject(object["config"]);
				case "redshift": return RedshiftConfigPatchSerializer._fromJsonObject(object["config"]);
				case "postgres": return PostgresConfigPatchSerializer._fromJsonObject(object["config"]);
				default: throw new Error(`Unexpected type: ${type}`);
			}
		}
		return {
			type,
			config: getConfig(type),
			uid: object["uid"],
			status: object["status"] != null ? SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
			batchSize: object["batchSize"],
			maxWaitSecs: object["maxWaitSecs"],
			eventTypes: object["eventTypes"],
			channels: object["channels"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		let config;
		switch (self.type) {
			case "poller":
				config = {};
				break;
			case "azureBlobStorage":
				config = AzureBlobStorageConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "otelTracing":
				config = OtelTracingConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "http":
				config = SinkHttpConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "amazonS3":
				config = S3ConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "googleCloudStorage":
				config = GoogleCloudStorageConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "googleCloudPubSub":
				config = GoogleCloudPubSubConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "sqs":
				config = SqsConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "sns":
				config = SnsConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "bigQuery":
				config = BigQueryConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "clickhouse":
				config = ClickhouseConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "eventBridge":
				config = EventBridgeConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "snowflake":
				config = SnowflakeConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "rabbitMq":
				config = RabbitMqConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "redshift":
				config = RedshiftConfigPatchSerializer._toJsonObject(self.config);
				break;
			case "postgres": config = PostgresConfigPatchSerializer._toJsonObject(self.config);
		}
		return {
			type: self.type,
			config,
			uid: self.uid,
			status: self.status != null ? SinkStatusInSerializer._toJsonObject(self.status) : void 0,
			batchSize: self.batchSize,
			maxWaitSecs: self.maxWaitSecs,
			eventTypes: self.eventTypes,
			channels: self.channels,
			metadata: self.metadata
		};
	}
};
var SinkTransformInSerializer = {
	_fromJsonObject(object) {
		return { code: object["code"] };
	},
	_toJsonObject(self) {
		return { code: self.code };
	}
};
var SinkTransformationOutSerializer = {
	_fromJsonObject(object) {
		return {
			code: object["code"],
			enabled: object["enabled"]
		};
	},
	_toJsonObject(self) {
		return {
			code: self.code,
			enabled: self.enabled
		};
	}
};
var StreamingSinkTransformation = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** Get the transformation code associated with this sink. */
	async get(streamId, sinkId) {
		const request = new SvixRequest("GET", "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		return await request.send(this.requestCtx, SinkTransformationOutSerializer._fromJsonObject);
	}
	/** Set or unset the transformation code associated with this sink. */
	async patch(streamId, sinkId, sinkTransformIn = {}) {
		const request = new SvixRequest("PATCH", "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		request.setBody(SinkTransformInSerializer._toJsonObject(sinkTransformIn));
		return await request.send(this.requestCtx, EmptyResponseSerializer._fromJsonObject);
	}
};
var StreamingSink = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	get transformation() {
		return new StreamingSinkTransformation(this.requestCtx);
	}
	/** List of all the stream's sinks. */
	async list(streamId, options) {
		const request = new SvixRequest("GET", "/api/v1/stream/{stream_id}/sink");
		request.setPathParam("stream_id", streamId);
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseStreamSinkOutSerializer._fromJsonObject);
	}
	/** Creates a new sink. */
	async create(streamId, streamSinkIn, options) {
		const request = new SvixRequest("POST", "/api/v1/stream/{stream_id}/sink");
		request.setPathParam("stream_id", streamId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(StreamSinkInSerializer._toJsonObject(streamSinkIn));
		return await request.send(this.requestCtx, StreamSinkOutSerializer._fromJsonObject);
	}
	/** Get a sink by id or uid. */
	async get(streamId, sinkId) {
		const request = new SvixRequest("GET", "/api/v1/stream/{stream_id}/sink/{sink_id}");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		return await request.send(this.requestCtx, StreamSinkOutSerializer._fromJsonObject);
	}
	/** Create or update a sink. */
	async upsert(streamId, sinkId, streamSinkIn) {
		const request = new SvixRequest("PUT", "/api/v1/stream/{stream_id}/sink/{sink_id}");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		request.setBody(StreamSinkInSerializer._toJsonObject(streamSinkIn));
		return await request.send(this.requestCtx, StreamSinkOutSerializer._fromJsonObject);
	}
	/** Delete a sink. */
	async delete(streamId, sinkId) {
		const request = new SvixRequest("DELETE", "/api/v1/stream/{stream_id}/sink/{sink_id}");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Partially update a sink. */
	async patch(streamId, sinkId, streamSinkPatch) {
		const request = new SvixRequest("PATCH", "/api/v1/stream/{stream_id}/sink/{sink_id}");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		request.setBody(StreamSinkPatchSerializer._toJsonObject(streamSinkPatch));
		return await request.send(this.requestCtx, StreamSinkOutSerializer._fromJsonObject);
	}
	/**
	* Get the sink's signing secret (only supported for http sinks)
	*
	* This is used to verify the authenticity of the delivery.
	*
	* For more information please refer to [the consuming webhooks docs](https://docs.svix.com/consuming-webhooks/).
	*/
	async getSecret(streamId, sinkId) {
		const request = new SvixRequest("GET", "/api/v1/stream/{stream_id}/sink/{sink_id}/secret");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		return await request.send(this.requestCtx, SinkSecretOutSerializer._fromJsonObject);
	}
	/** Rotates the signing secret (only supported for http sinks). */
	async rotateSecret(streamId, sinkId, endpointSecretRotateIn = {}, options) {
		const request = new SvixRequest("POST", "/api/v1/stream/{stream_id}/sink/{sink_id}/secret/rotate");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));
		return await request.send(this.requestCtx, EmptyResponseSerializer._fromJsonObject);
	}
};
var StreamOutSerializer = {
	_fromJsonObject(object) {
		return {
			id: object["id"],
			uid: object["uid"],
			name: object["name"],
			createdAt: new Date(object["createdAt"]),
			updatedAt: new Date(object["updatedAt"]),
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			id: self.id,
			uid: self.uid,
			name: self.name,
			createdAt: self.createdAt,
			updatedAt: self.updatedAt,
			metadata: self.metadata
		};
	}
};
var ListResponseStreamOutSerializer = {
	_fromJsonObject(object) {
		return {
			data: object["data"].map((item) => StreamOutSerializer._fromJsonObject(item)),
			iterator: object["iterator"],
			prevIterator: object["prevIterator"],
			done: object["done"]
		};
	},
	_toJsonObject(self) {
		return {
			data: self.data.map((item) => StreamOutSerializer._toJsonObject(item)),
			iterator: self.iterator,
			prevIterator: self.prevIterator,
			done: self.done
		};
	}
};
var StreamPatchSerializer = {
	_fromJsonObject(object) {
		return {
			description: object["description"],
			uid: object["uid"],
			metadata: object["metadata"]
		};
	},
	_toJsonObject(self) {
		return {
			description: self.description,
			uid: self.uid,
			metadata: self.metadata
		};
	}
};
var StreamingStream = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	/** List of all the organization's streams. */
	async list(options) {
		const request = new SvixRequest("GET", "/api/v1/stream");
		request.setQueryParams({
			limit: options?.limit,
			iterator: options?.iterator,
			order: options?.order
		});
		return await request.send(this.requestCtx, ListResponseStreamOutSerializer._fromJsonObject);
	}
	/** Creates a new stream. */
	async create(streamIn, options) {
		const request = new SvixRequest("POST", "/api/v1/stream");
		request.setHeaderParam("idempotency-key", options?.idempotencyKey);
		request.setBody(StreamInSerializer._toJsonObject(streamIn));
		return await request.send(this.requestCtx, StreamOutSerializer._fromJsonObject);
	}
	/** Get a stream by id or uid. */
	async get(streamId) {
		const request = new SvixRequest("GET", "/api/v1/stream/{stream_id}");
		request.setPathParam("stream_id", streamId);
		return await request.send(this.requestCtx, StreamOutSerializer._fromJsonObject);
	}
	/** Create or update a stream. */
	async upsert(streamId, streamIn) {
		const request = new SvixRequest("PUT", "/api/v1/stream/{stream_id}");
		request.setPathParam("stream_id", streamId);
		request.setBody(StreamInSerializer._toJsonObject(streamIn));
		return await request.send(this.requestCtx, StreamOutSerializer._fromJsonObject);
	}
	/** Delete a stream. */
	async delete(streamId) {
		const request = new SvixRequest("DELETE", "/api/v1/stream/{stream_id}");
		request.setPathParam("stream_id", streamId);
		return await request.sendNoResponseBody(this.requestCtx);
	}
	/** Partially update a stream. */
	async patch(streamId, streamPatch) {
		const request = new SvixRequest("PATCH", "/api/v1/stream/{stream_id}");
		request.setPathParam("stream_id", streamId);
		request.setBody(StreamPatchSerializer._toJsonObject(streamPatch));
		return await request.send(this.requestCtx, StreamOutSerializer._fromJsonObject);
	}
};
var Streaming = class {
	requestCtx;
	constructor(requestCtx) {
		this.requestCtx = requestCtx;
	}
	get eventType() {
		return new StreamingEventType(this.requestCtx);
	}
	get events() {
		return new StreamingEvents(this.requestCtx);
	}
	get sink() {
		return new StreamingSink(this.requestCtx);
	}
	get stream() {
		return new StreamingStream(this.requestCtx);
	}
	/**
	* Get the HTTP sink headers.
	*
	* Only valid for `http` or `otelTracing` sinks.
	*/
	async sinkHeadersGet(streamId, sinkId) {
		const request = new SvixRequest("GET", "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		return await request.send(this.requestCtx, EndpointHeadersOutSerializer._fromJsonObject);
	}
	/**
	* Updates the Sink's headers.
	*
	* Only valid for `http` or `otelTracing` sinks.
	*/
	async sinkHeadersPatch(streamId, sinkId, httpSinkHeadersPatchIn) {
		const request = new SvixRequest("PATCH", "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
		request.setPathParam("stream_id", streamId);
		request.setPathParam("sink_id", sinkId);
		request.setBody(HttpSinkHeadersPatchInSerializer._toJsonObject(httpSinkHeadersPatchIn));
		return await request.send(this.requestCtx, EndpointHeadersOutSerializer._fromJsonObject);
	}
};
var Webhook = class {
	inner;
	constructor(secret, options) {
		this.inner = new import_dist.Webhook(secret, options);
	}
	verify(payload, headers_) {
		const headers = {};
		for (const key of Object.keys(headers_)) headers[key.toLowerCase()] = headers_[key];
		headers["webhook-id"] = headers["svix-id"] ?? headers["webhook-id"] ?? "";
		headers["webhook-signature"] = headers["svix-signature"] ?? headers["webhook-signature"] ?? "";
		headers["webhook-timestamp"] = headers["svix-timestamp"] ?? headers["webhook-timestamp"] ?? "";
		this.inner.verify(payload, headers, { jsonParse: false });
	}
	sign(msgId, timestamp, payload) {
		return this.inner.sign(msgId, timestamp, payload);
	}
};
var Svix = class {
	requestCtx;
	constructor(token, options = {}) {
		this.requestCtx = createSvixRequestContext(token, options);
	}
	get application() {
		return new Application(this.requestCtx);
	}
	get authentication() {
		return new Authentication(this.requestCtx);
	}
	get autoconfigSubscription() {
		return new AutoconfigSubscription$1(this.requestCtx);
	}
	get backgroundTask() {
		return new BackgroundTask(this.requestCtx);
	}
	get connector() {
		return new Connector(this.requestCtx);
	}
	get destination() {
		return new Destination(this.requestCtx);
	}
	get endpoint() {
		return new Endpoint$1(this.requestCtx);
	}
	get environment() {
		return new Environment(this.requestCtx);
	}
	get eventType() {
		return new EventType(this.requestCtx);
	}
	get health() {
		return new Health(this.requestCtx);
	}
	get ingest() {
		return new Ingest(this.requestCtx);
	}
	get integration() {
		return new Integration(this.requestCtx);
	}
	get message() {
		return new Message(this.requestCtx);
	}
	get messageAttempt() {
		return new MessageAttempt(this.requestCtx);
	}
	get operationalWebhook() {
		return new OperationalWebhook(this.requestCtx);
	}
	get statistics() {
		return new Statistics(this.requestCtx);
	}
	get streaming() {
		return new Streaming(this.requestCtx);
	}
};
//#endregion
export { dist_exports as t };
