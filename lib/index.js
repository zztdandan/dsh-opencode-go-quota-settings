// @ts-check
/**
 * dsh-opencode-go-quota-settings — host half (settings-page fork of
 * dsh-opencode-go-usage).
 *
 * Watches your OpenCode GO plan quota through the official gateway endpoint
 * (`https://opencode.ai/zen/go/v1/usage`). Proxied through a same-origin route
 * so the browser widget never sees your API key and no CORS is involved.
 *
 * - `GET /dsh-opencode-go-quota-settings/usage` — quota proxy (rolling / weekly /
 *   monthly window percentages from the official API) plus a key-status
 *   snapshot. `?refresh=1` bypasses the host-side TTL for an explicit reload.
 * - `/opencode-go-quota` chat command — prints the same numbers as text.
 * - Settings page — the browser half registers a `settings.section` page
 *   (Settings → OpenCode GO) through the official client-modules scan
 *   (`dsh.client` + `exports["./client"]`); no sidebar widget is registered.
 *
 * Key sharing (the point of this fork):
 *
 *   The quota key is resolved from the SAME places DSH's own `opencode-go`
 *   model route resolves its key, in the same order:
 *
 *   1. the credential reference the live `llm-pi-ai` profile names
 *      (`providers.opencode-go.apiKeyEnv` / `providers.opencode.apiKeyEnv`);
 *   2. the stored pi-ai credential record `llm-pi-ai/opencode-go` written by
 *      the authorization seam (a keyless route authenticates from it);
 *   3. pi-ai's native `OPENCODE_API_KEY` reference (environment or
 *      `$DSH_HOME/.credentials.yaml`);
 *   4. this plugin's own `apiKeyEnv` (default `OPENCODE_GO_API_KEY`, the
 *      reference the Models page derives for the `opencode-go` route).
 *
 *   The settings page therefore needs no duplicate key: whatever is already
 *   configured for the model route is what the quota endpoint uses. Saving a
 *   key from the page writes the same reference and (when the route has no
 *   key reference yet) adds `providers.<route>.apiKeyEnv` through the regular
 *   `settings/mutate` remote — the exact two writes the Models page performs.
 *
 * Installation / configuration (official DSH flows):
 *   - Install: `dsh plugin --profile web add github:zztdandan/dsh-opencode-go-quota-settings` — the
 *     `dsh.bundle.patch` declaration makes the CLI reconcile this package into
 *     the profile's bundle layer stack automatically (no manual patch edits).
 *   - Configure: the loader picks the exported `Config` schema up by itself —
 *     DSH 2.x removed `ctx.settings.register`, so this plugin no longer
 *     registers a namespace by hand. Every field is `.volatile()`, which is
 *     what surfaces it in Settings → Plugins → Plugin configuration and lets
 *     edits hot-apply; a legacy `~/.dsh/settings.yaml` section is migrated
 *     into this entry by the host on first boot. API keys themselves live in
 *     the credentials domain, never in settings.
 *
 * Config fields:
 *   - apiKeyEnv:    fallback credential ref / env var (default OPENCODE_GO_API_KEY);
 *                   only used when the model route names no reference and
 *                   supplies no other key.
 *   - baseUrl:      GO gateway base (default https://opencode.ai/zen/go)
 *   - cacheMs:      host-side cache TTL (default 30000)
 *   - injectSessionHeader: runtime `x-opencode-session` fix (default true);
 *                   the GO gateway 400s chat requests without it. The gateway
 *                   base is read from the called provider's own live config
 *                   (`llm-pi-ai.providers.<route>.baseURL` via the loader), so
 *                   no host names are hard-coded.
 */

import z from "@deepseek-ai/schemastery";
import { patchFetch, recordStream, sessionDiag, sessionHeaderCount, withSession } from "./opencode-session.js";

export const name = "dsh-opencode-go-quota-settings";

/** Required services: web routes, chat commands, credentials. */
export const inject = ["webServer", "commands", "credentials"];

/** Settings namespace owned by this plugin. */
export const namespace = "dsh-opencode-go-quota-settings";

const DEFAULT_BASE_URL = "https://opencode.ai/zen/go";
const DEFAULT_API_KEY_ENV = "OPENCODE_GO_API_KEY";
const DEFAULT_CACHE_MS = 30_000;
/** pi-ai's own provider id for the OpenCode GO route. */
const MODEL_ROUTE = "opencode-go";
/** OpenCode Zen; shares the OpenCode API key and is a harmless key source. */
const FALLBACK_MODEL_ROUTE = "opencode";
/** pi-ai's native API-key reference for both OpenCode routes. */
const NATIVE_API_KEY_ENV = "OPENCODE_API_KEY";
/** Scope pi-ai writes its provider credential records under (`llm-pi-ai/<route>`). */
const PI_AI_RECORD_SCOPE = "llm-pi-ai";

/**
 * Mark one field live-editable when the resolved schemastery supports it.
 *
 * `.volatile()` only exists in schemastery >= 3.18.4, and DSH resolves a
 * plugin's own dependencies from the profile first — so an older hoisted copy
 * (e.g. 3.18.2, installed while the plugin's range still allowed it) wins over
 * the installation's newer one, and an unguarded call fails activation with
 * `TypeError: ...volatile is not a function`. With an older copy the plugin
 * still activates from its entry config; it only loses the auto-generated
 * settings page and hot-edit, which need real volatile refs.
 * @template T
 * @param {T} field
 * @returns {T}
 */
function live(field) {
	return typeof field?.volatile === "function" ? field.volatile() : field;
}

/**
 * Settings schema for this plugin's namespace.
 *
 * DSH 2.x details:
 * - Fields are marked live/volatile (see {@link live}), so they appear in
 *   Settings → Plugins → Plugin configuration and edits hot-apply (the host
 *   mutates the running volatile refs; this plugin re-reads config on every
 *   request/command).
 * - The loader consumes `Config` directly — no `ctx.settings.register` (that
 *   service method was removed in 2.x, and calling it fails activation with
 *   `TypeError: ctx.settings.register is not a function`).
 * - `apiKeyEnv` is a credential ref (`role("credential-ref")`), mirroring
 *   DSH's own providers; the value itself stays out of settings.
 * - `injectSessionHeader` enables the runtime `x-opencode-session` fix: the
 *   gateway 400s chat-completion requests without it (see lib/opencode-session.js).
 */
export const Config = z.object({
	apiKeyEnv: live(z.string().role("credential-ref").default(DEFAULT_API_KEY_ENV)),
	baseUrl: live(z.string().default(DEFAULT_BASE_URL)),
	cacheMs: live(z.number().default(DEFAULT_CACHE_MS)),
	injectSessionHeader: live(z.boolean().default(true))
});

/** True for a non-array object. */
function asRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

/** A non-empty string, or undefined. */
function nonEmptyString(value) {
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Unwrap a cosmokit volatile reference (schema `.volatile()` fields resolve to refs). */
function unwrap(value) {
	return value !== null && typeof value === "object" && typeof value.get === "function" ? value.get() : value;
}

/** Entry ids / package names probed when reading another plugin's live config. */
const LOCALE_ENTRY_SOURCES = ["locale", "@deepseek-ai/dsh-client-locale"];
const PI_AI_ENTRY_SOURCES = ["llm-pi-ai", "@deepseek-ai/dsh-llm-pi-ai"];

/**
 * Read one live loader entry. `sources` is probed as (entry id, then package
 * name); the first active match wins. Returns `undefined` when no match is live
 * yet — callers fall back to their own defaults, so load order never blocks
 * activation.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {string[]} sources
 * @returns {any | undefined}
 */
function liveEntry(ctx, sources) {
	const loader = ctx.loader ?? ctx.root?.loader;
	if (!loader || typeof loader.entries !== "function") return undefined;
	for (const probe of sources) {
		for (const entry of loader.entries()) {
			if (!entry?.fiber || entry.fiber.uid == null || entry.disabled) continue;
			if (entry.options?.id === probe || entry.options?.name === probe) return entry;
			// The computed id carries the owning group's prefix; reading it can
			// throw for an entry with no parent group, so it is probed last.
			let qualified;
			try {
				qualified = entry.id;
			} catch {
				qualified = undefined;
			}
			if (qualified === probe) return entry;
		}
	}
	return undefined;
}

/**
 * Read another profile entry's resolved config from the loader.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {string[]} sources
 * @returns {Record<string, unknown> | undefined}
 */
function liveEntryConfig(ctx, sources) {
	return liveEntry(ctx, sources)?.fiber?.config;
}

/**
 * The settings namespace of a live entry. `llm-pi-ai` uses its own entry id as
 * the settings namespace, so a deployment that mounts it under another id must
 * be followed rather than assumed.
 * @param {any} entry
 * @returns {string | null}
 */
function entryNamespace(entry) {
	try {
		return nonEmptyString(entry?.options?.id) ?? nonEmptyString(entry?.id) ?? null;
	} catch {
		return null;
	}
}

/**
 * Read the live `llm-pi-ai` provider profiles and locate the OpenCode route.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
function readModelConfig(ctx) {
	const entry = liveEntry(ctx, PI_AI_ENTRY_SOURCES);
	let providers = {};
	try {
		providers = asRecord(unwrap(entry?.fiber?.config?.providers)) ?? {};
	} catch {
		providers = {};
	}
	const goProfile = asRecord(providers[MODEL_ROUTE]);
	const fallbackProfile = asRecord(providers[FALLBACK_MODEL_ROUTE]);
	const profile = goProfile ?? fallbackProfile;
	const route = goProfile !== undefined ? MODEL_ROUTE : fallbackProfile !== undefined ? FALLBACK_MODEL_ROUTE : MODEL_ROUTE;
	return {
		entry,
		providers,
		profile,
		route,
		namedRef: nonEmptyString(profile?.apiKeyEnv),
		settingsNs: entryNamespace(entry)
	};
}

/**
 * Resolve one credential reference through the DSH credentials service
 * (process env, `$DSH_HOME/.credentials.yaml`, `.env` layers).
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {string} refName
 * @returns {Promise<string | null>}
 */
async function resolveCredentialRef(ctx, refName) {
	try {
		const hit = await ctx.credentials.resolve(refName);
		return nonEmptyString(hit?.value) ?? null;
	} catch {
		return null;
	}
}

/**
 * Describe one reference for the status snapshot (never returns the value).
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {string} refName
 */
async function describeCredentialRef(ctx, refName) {
	try {
		const info = await ctx.credentials.describe(refName);
		return {
			configured: info?.configured === true,
			writable: info?.writable !== false,
			source: nonEmptyString(info?.source) ?? null
		};
	} catch {
		return { configured: false, writable: true, source: null };
	}
}

/**
 * Read the pi-ai credential record a keyless route authenticates from.
 * `llm-pi-ai` writes `llm-pi-ai/<provider id>` records through the authorization
 * seam; a route that names no `apiKeyEnv` consumes that record before its
 * native environment variables.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {string} route
 * @returns {Promise<string | null>}
 */
async function readCredentialRecord(ctx, route) {
	if (typeof ctx.credentials.readRecord !== "function") return null;
	try {
		const record = await ctx.credentials.readRecord(`${PI_AI_RECORD_SCOPE}/${route}`);
		return record?.kind === "api-key" ? (nonEmptyString(record.key) ?? null) : null;
	} catch {
		return null;
	}
}

/**
 * Build the key facts shared by the quota proxy and the settings page.
 *
 * The `status` half is safe to serialize (no key); `key` is the resolved
 * literal and must never leave the host.
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {{ apiKeyEnv: string, baseUrl: string, cacheMs: number, injectSessionHeader: boolean, locale: string }} config
 */
async function inspectKey(ctx, config) {
	const model = readModelConfig(ctx);
	const pluginRef = nonEmptyString(config.apiKeyEnv) ?? DEFAULT_API_KEY_ENV;

	const goRecordKey = await readCredentialRecord(ctx, MODEL_ROUTE);
	const fallbackRecordKey = goRecordKey === null ? await readCredentialRecord(ctx, FALLBACK_MODEL_ROUTE) : null;
	const record = goRecordKey !== null
		? { route: MODEL_ROUTE, key: goRecordKey }
		: fallbackRecordKey !== null
			? { route: FALLBACK_MODEL_ROUTE, key: fallbackRecordKey }
			: null;

	/** @type {{ ref: string, kind: "ref" | "record", source: string, value: string | null }[]} */
	const sources = [];
	if (model.namedRef !== undefined) sources.push({ ref: model.namedRef, kind: "ref", source: "model", value: null });
	if (record !== null) sources.push({ ref: `${PI_AI_RECORD_SCOPE}/${record.route}`, kind: "record", source: "record", value: record.key });
	sources.push({ ref: NATIVE_API_KEY_ENV, kind: "ref", source: "native", value: null });
	if (pluginRef !== NATIVE_API_KEY_ENV && pluginRef !== model.namedRef) {
		sources.push({ ref: pluginRef, kind: "ref", source: pluginRef === DEFAULT_API_KEY_ENV ? "derived" : "plugin", value: null });
	}
	if (DEFAULT_API_KEY_ENV !== pluginRef && DEFAULT_API_KEY_ENV !== NATIVE_API_KEY_ENV && DEFAULT_API_KEY_ENV !== model.namedRef) {
		sources.push({ ref: DEFAULT_API_KEY_ENV, kind: "ref", source: "derived", value: null });
	}

	const seen = new Set();
	const candidates = [];
	for (const source of sources) {
		if (seen.has(source.ref)) continue;
		seen.add(source.ref);
		const value = source.kind === "record" ? source.value : await resolveCredentialRef(ctx, source.ref);
		candidates.push({ ...source, value, configured: value !== null });
	}
	const configuredRefs = new Set(candidates.filter(candidate => candidate.configured).map(candidate => candidate.ref));
	const effective = candidates.find(candidate => candidate.configured) ?? null;

	// The route the model itself consumes: a named reference wins; otherwise a
	// stored record; otherwise pi-ai's native environment reference.
	const modelRecord = record !== null && record.route === model.route ? record : null;
	const modelConfigured = model.profile !== undefined && (model.namedRef !== undefined
		? configuredRefs.has(model.namedRef)
		: modelRecord !== null || configuredRefs.has(NATIVE_API_KEY_ENV));

	// Where the settings page writes. Mirror the model's own reference when it
	// names one; otherwise keep the already-configured native/derived reference
	// instead of creating a second copy. A stored record has no write API here,
	// so switching to an explicit reference is the only way to update it from
	// this page.
	/** @type {string} */
	let targetRef;
	if (model.namedRef !== undefined) targetRef = model.namedRef;
	else if (record !== null) targetRef = pluginRef;
	else if (configuredRefs.has(NATIVE_API_KEY_ENV)) targetRef = NATIVE_API_KEY_ENV;
	else if (configuredRefs.has(pluginRef)) targetRef = pluginRef;
	else if (configuredRefs.has(DEFAULT_API_KEY_ENV)) targetRef = DEFAULT_API_KEY_ENV;
	else targetRef = pluginRef;
	const targetInfo = await describeCredentialRef(ctx, targetRef);

	const needsProfile = model.profile === undefined
		|| (model.namedRef === undefined && (modelRecord !== null || targetRef !== NATIVE_API_KEY_ENV));

	return {
		key: effective !== null ? effective.value : null,
		status: {
			configured: effective !== null,
			ref: effective?.ref ?? null,
			source: effective?.source ?? null,
			targetRef,
			writable: targetInfo.writable,
			baseUrl: config.baseUrl,
			model: {
				route: model.route,
				targetRoute: MODEL_ROUTE,
				settingsNs: model.settingsNs,
				profile: model.profile !== undefined,
				apiKeyEnv: model.namedRef ?? null,
				configured: modelConfigured,
				needsProfile
			},
			candidates: candidates.map(candidate => ({
				ref: candidate.ref,
				kind: candidate.kind,
				source: candidate.source,
				configured: candidate.configured
			}))
		}
	};
}

/** The no-key diagnostic, naming both configuration surfaces. */
function missingKeyMessage(locale, status) {
	const refs = [...new Set((status?.candidates ?? [])
		.map(candidate => candidate.ref)
		.filter(ref => !ref.includes("/")))];
	const list = refs.length > 0 ? refs.join(" / ") : DEFAULT_API_KEY_ENV;
	return locale === "en"
		? `OpenCode GO: no API key found. Save one in Settings → OpenCode GO, or configure Settings → Models → OpenCode Go (credential ${list}).`
		: `OpenCode GO: 未找到 API key。可在「设置 → OpenCode GO」中保存，或在「设置 → 模型 → OpenCode Go」中配置（凭据 ${list}）。`;
}

/** Fetch the GO plan quota payload from the gateway. */
async function fetchUsage(baseUrl, apiKey) {
	const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/v1/usage`, {
		headers: { Authorization: `Bearer ${apiKey}` },
		signal: AbortSignal.timeout(15_000)
	});
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`gateway ${res.status}: ${body.slice(0, 300)}`);
	}
	return await res.json();
}

/** Human-friendly chat output, localized (zh | en). */
function renderUsageText(data, lang) {
	const zh = lang !== "en";
	const u = data?.usage;
	if (!u || typeof u !== "object") return "OpenCode GO: unexpected response shape.";
	const lines = [zh ? "OpenCode GO 套餐用量:" : "OpenCode GO plan usage:"];
	const defs = [
		["rolling", zh ? "滚动窗口 (5h)" : "Rolling (5h)"],
		["weekly", zh ? "周窗口" : "Weekly"],
		["monthly", zh ? "月窗口" : "Monthly"]
	];
	for (const [key, label] of defs) {
		const w = u[key];
		if (!w || typeof w.percent !== "number") continue;
		const status = w.status === "ok" ? (zh ? "正常" : "ok") : w.status;
		const resets = w.resetsAt
			? (zh ? `重置于 ${new Date(w.resetsAt).toLocaleString("zh-CN")}` : `resets at ${new Date(w.resetsAt).toLocaleString("en-US")}`)
			: "";
		lines.push(`  ${label}: ${w.percent}% (${status})${resets ? `, ${resets}` : ""}`);
	}
	return lines.join("\n");
}

/** Whether this request explicitly asks to bypass the host-side cache. */
function wantsRefresh(req) {
	try {
		return new URL(req.url ?? "", "http://localhost").searchParams.get("refresh") === "1";
	} catch {
		return false;
	}
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {Record<string, unknown>} config - the resolved plugin config
 *   (validated against the exported `Config` schema; schema defaults applied).
 *   DSH 2.x hands this in directly — the loader owns the schema, the profile
 *   patch (or the migrated legacy settings.yaml) supplies overrides, and
 *   volatile values arrive as live refs the settings page updates in place.
 */
export function apply(ctx, config = {}) {
	const readConfig = () => {
		const own = unwrap(config);
		const localeEntry = liveEntryConfig(ctx, LOCALE_ENTRY_SOURCES) ?? {};
		const preference = unwrap(localeEntry.preference);
		return {
			apiKeyEnv: unwrap(own.apiKeyEnv) ?? DEFAULT_API_KEY_ENV,
			baseUrl: unwrap(own.baseUrl) ?? DEFAULT_BASE_URL,
			cacheMs: typeof unwrap(own.cacheMs) === "number" ? unwrap(own.cacheMs) : DEFAULT_CACHE_MS,
			injectSessionHeader: unwrap(own.injectSessionHeader) !== false,
			// DSH's own locale preference (live entry config); absent falls
			// back to zh (the browser decides when the user never picked).
			locale: typeof preference === "string" ? preference : "zh"
		};
	};

	// ── runtime x-opencode-session injection ───────────────────────────────
	// The GO gateway rejects chat-completion requests without
	// `x-opencode-session` (HTTP 400 MissingSessionID) when the installed pi-ai
	// build does not add it itself. Instead of patching DSH's installed files
	// (wiped by every upgrade), wrap globalThis.fetch once and stand on the
	// official `llm/stream` waterfall to learn the per-call harness session id,
	// so every GO gateway request carries the real, per-conversation session id
	// (see lib/opencode-session.js). The gateway base is resolved from the
	// called provider's OWN live config — the `llm-pi-ai` entry's
	// `providers.<route>.baseURL` — so no host names are ever hard-coded, and
	// other providers are untouched (the fetch wrapper only fires when the URL
	// matches that call's base).
	if (readConfig().injectSessionHeader) {
		patchFetch();
		ctx.on("llm/stream", (options, next) => {
			const info = {
				provider: options.provider ?? null,
				hasSessionId: options.sessionId !== void 0,
				base: null,
				baseFrom: /** @type {"settings" | "config" | null} */ (null)
			};
			if (options.sessionId === void 0) {
				recordStream(info);
				return next();
			}
			const providers = unwrap(liveEntryConfig(ctx, PI_AI_ENTRY_SOURCES)?.providers);
			const configured = providers?.[options.provider]?.baseURL;
			const base = typeof configured === "string" && configured.length > 0 ? configured : readConfig().baseUrl;
			info.base = typeof base === "string" ? base : null;
			info.baseFrom = typeof configured === "string" && configured.length > 0 ? "settings" : "config";
			recordStream(info);
			if (typeof base !== "string" || base.length === 0) return next();
			return withSession(next(), { sessionId: String(options.sessionId), base });
		});
	}

	// Host-side cache: one in-flight promise + a TTL, so several open tabs or
	// the command never hammer the gateway. Keyed by the resolved literal so a
	// key change is observed immediately; `?refresh=1` bypasses it.
	/** @type {{ at: number, key: string | null, promise: Promise<unknown> } | null} */
	let quotaCache = null;
	/**
	 * @param {string | null} key
	 * @param {boolean} force
	 * @param {any} keyStatus
	 */
	const quotaOnce = (key, force, keyStatus) => {
		const now = Date.now();
		const config = readConfig();
		if (!force && quotaCache !== null && quotaCache.key === key && now - quotaCache.at < config.cacheMs) {
			return quotaCache.promise;
		}
		const promise = (async () => {
			if (key === null || key.length === 0) throw new Error(missingKeyMessage(config.locale, keyStatus));
			return await fetchUsage(config.baseUrl, key);
		})();
		quotaCache = { at: now, key, promise };
		promise.catch(() => { if (quotaCache?.promise === promise) quotaCache = null; });
		return promise;
	};

	const handleUsage = async (req, res) => {
		res.setHeader("content-type", "application/json; charset=utf-8");
		res.setHeader("cache-control", "no-store");
		const config = readConfig();
		/** @type {any} */
		let keyStatus = null;
		/** @type {string | null} */
		let key = null;
		try {
			const inspected = await inspectKey(ctx, config);
			keyStatus = inspected.status;
			key = inspected.key;
		} catch {
			// A status read must never turn a quota request into a blank 500.
			// The missing-key diagnostic still names every place to configure.
			keyStatus = {
				configured: false,
				ref: null,
				source: null,
				targetRef: config.apiKeyEnv,
				writable: true,
				baseUrl: config.baseUrl,
				model: null,
				candidates: []
			};
		}
		try {
			const data = await quotaOnce(key, wantsRefresh(req), keyStatus);
			res.end(JSON.stringify({
				...data,
				key: keyStatus,
				sessionHeader: { active: config.injectSessionHeader, count: sessionHeaderCount(), diag: sessionDiag() }
			}));
		} catch (error) {
			res.statusCode = 502;
			res.end(JSON.stringify({
				error: error instanceof Error ? error.message : String(error),
				key: keyStatus
			}));
		}
	};

	// Same-origin route the browser widget polls.
	ctx.webServer.register({
		kind: "exact",
		path: "/dsh-opencode-go-quota-settings/usage",
		handler: handleUsage
	});

	// ── browser widget ─────────────────────────────────────────────────────
	// DSH 2.x composes the widget through the official client-modules scan:
	// this package's `dsh.client` declaration and `exports["./client"]` are
	// picked up per loader entry, the bundle is served from the /plugins combo
	// routes, and its boot-graph row lands in the `window.__DSH_BOOT__`
	// manifest by the host itself. The 1.x mechanism (self-hosted bundle route
	// + `webServer.tapIndex` row injection) was removed: it wrote into the old
	// array-shaped boot manifest, which 2.x replaced with a `{ rev, entries,
	// batches }` object — hand-appending a row there would fail the boot
	// parser, and the client-modules scanner already does this for any
	// installation location.

	// Chat command so the numbers are reachable from a conversation too.
	ctx.commands.register({
		name: "opencode-go-quota",
		description: "show OpenCode GO plan usage (rolling/weekly/monthly windows)",
		handler: async () => {
			try {
				const config = readConfig();
				const inspected = await inspectKey(ctx, config);
				const data = await quotaOnce(inspected.key, true, inspected.status);
				const text = renderUsageText(data, config.locale);
				return { kind: "success", text };
			} catch (error) {
				return { kind: "error", text: error instanceof Error ? error.message : String(error) };
			}
		}
	});
}
