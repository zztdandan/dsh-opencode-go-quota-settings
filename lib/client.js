// dsh-opencode-go-quota-settings — browser half.
//
// Registers a `settings.section` page (Settings → OpenCode GO) that shows the
// three OpenCode GO quota windows (5 h / weekly / monthly) from the host's
// same-origin proxy route. The API key never reaches the browser, and this
// fork deliberately registers NO sidebar widget: the quota lives in Settings,
// next to the Command Code / Codex account pages.
//
// Hand-authored client bundle in the DSH module-loader factory format:
// `window.__ModuleLoader__.load({ id, factory })`. The factory receives the
// shell module table, so only externalized modules (react / react/jsx-runtime)
// may be required.
window.__ModuleLoader__.load({
	id: "dsh-opencode-go-quota-settings",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const react = require("react");
		const jsxRuntime = require("react/jsx-runtime");
		const jsx = jsxRuntime.jsx;
		const jsxs = jsxRuntime.jsxs;

		const NS = "dsh-opencode-go-quota-settings";
		const ROUTE = "/dsh-opencode-go-quota-settings/usage";

		// ── styles (injected once) ───────────────────────────────────────────
		const CSS_ID = "dsh-opencode-go-quota-settings/settings.css";
		if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + CSS_ID + '"]') === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-opencode-go-quota-settings";
			tag.dataset.pluginCss = CSS_ID;
			tag.textContent = [
				".ocgq{box-sizing:border-box;display:flex;flex-direction:column;gap:16px;max-width:820px;min-width:0}",
				".ocgq-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}",
				".ocgq-title{margin:0;font-size:16px;line-height:24px;font-weight:600;color:var(--dsw-alias-label-primary)}",
				".ocgq-sub{margin:4px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);max-width:560px}",
				".ocgq-actions{display:flex;align-items:center;gap:10px;flex:none}",
				".ocgq-updated{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}",
				".ocgq-btn{appearance:none;cursor:pointer;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;padding:4px 12px;border-radius:8px}",
				".ocgq-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}",
				".ocgq-btn:disabled{cursor:default;opacity:.55}",
				".ocgq-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}",
				".ocgq-card{box-sizing:border-box;display:flex;flex-direction:column;gap:10px;padding:14px 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);min-width:0}",
				".ocgq-card-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px}",
				".ocgq-name{font-size:13px;line-height:18px;font-weight:600;color:var(--dsw-alias-label-primary)}",
				".ocgq-hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}",
				".ocgq-value{display:flex;align-items:baseline;gap:6px}",
				".ocgq-value b{font-size:30px;line-height:36px;font-weight:600;letter-spacing:-.02em;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}",
				".ocgq-value span{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}",
				".ocgq-track{box-sizing:border-box;width:100%;height:6px;border-radius:3px;overflow:hidden;background:var(--dsw-alias-border-l2)}",
				".ocgq-fill{height:100%;border-radius:3px;transition:width .4s ease,background-color .2s ease}",
				".ocgq-meta{display:flex;flex-direction:column;align-items:flex-start;gap:2px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}",
				".ocgq-reset{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}",
				".ocgq-error{box-sizing:border-box;display:flex;flex-direction:column;gap:6px;padding:14px 16px;border:1px solid var(--dsw-alias-state-error-secondary);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}",
				".ocgq-error b{font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary)}",
				".ocgq-error span{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}",
				".ocgq-skeleton{height:132px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-skeleton)}",
				".ocgq-key{box-sizing:border-box;display:flex;flex-direction:column;gap:8px;padding:14px 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}",
				".ocgq-key-head{display:flex;align-items:center;justify-content:space-between;gap:8px}",
				".ocgq-key-title{font-size:13px;line-height:18px;font-weight:600;color:var(--dsw-alias-label-primary)}",
				".ocgq-badge{font-size:11px;line-height:16px;padding:1px 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2)}",
				".ocgq-badge-ok{color:var(--dsw-alias-state-success-primary)}",
				".ocgq-badge-missing{color:var(--dsw-alias-state-warn-primary)}",
				".ocgq-key-sub{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);max-width:620px}",
				".ocgq-key-meta{margin:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}",
				".ocgq-key-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px}",
				".ocgq-input{box-sizing:border-box;flex:1 1 260px;min-width:0;padding:5px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:20px}",
				".ocgq-input:focus{outline:1px solid var(--dsw-alias-state-success-primary);outline-offset:1px}",
				".ocgq-input:disabled{opacity:.6}",
				".ocgq-key-save{flex:none}",
				".ocgq-key-model{margin:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}",
				".ocgq-key-error,.ocgq-key-ok{margin:0;font-size:11px;line-height:16px;overflow-wrap:anywhere}",
				".ocgq-key-error{color:var(--dsw-alias-state-error-primary)}",
				".ocgq-key-ok{color:var(--dsw-alias-state-success-primary)}",
				".ocgq-key-help{margin:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}",
				".ocgq-foot{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}"
			].join("");
			document.head.appendChild(tag);
		}

		// ── locale ──────────────────────────────────────────────────────────
		const zh = {
			nav: "OpenCode GO",
			title: "OpenCode GO 套餐额度",
			subtitle: "滚动 5 小时、每周、每月三个窗口的额度消耗与重置时间，数据来自 OpenCode GO 官方用量接口。",
			refresh: "刷新",
			loading: "正在读取额度…",
			updated: "更新于 {time}",
			"window.rolling": "滚动窗口",
			"window.rolling.hint": "5 小时",
			"window.weekly": "每周",
			"window.monthly": "每月",
			remaining: "剩余",
			used: "已用 {pct}%",
			countdown: "{time}后重置",
			resetAt: "重置时间 {time}",
			soon: "即将重置",
			minutes: "{n}分钟",
			hours: "{n}小时{m}分",
			days: "{n}天{m}小时",
			errorTitle: "读取额度失败",
			errorHint: "可在上方填写密钥，或在「设置 → 模型 → OpenCode Go」中配置 {key}；也请确认订阅有效。",
			missing: "接口没有返回该窗口的数据",
			foot: "剩余 = 100% − 已用；进度条按剩余比例绘制，每 60 秒自动刷新一次。",
			"key.title": "API 密钥",
			"key.configured": "已配置",
			"key.missing": "未配置",
			"key.subtitle": "与「设置 → 模型 → OpenCode Go」共用同一把密钥；在这里保存等同于在模型设置里保存。",
			"key.loading": "正在读取密钥状态…",
			"key.using": "使用 {ref}（{source}）",
			"key.saveTo": "将保存到 {ref}",
			"key.source.model": "模型设置",
			"key.source.record": "DSH 登录凭据",
			"key.source.native": "DSH 环境变量",
			"key.source.derived": "OpenCode Go 默认凭据",
			"key.source.plugin": "插件配置",
			"key.placeholder": "粘贴 OpenCode GO API key",
			"key.save": "保存密钥",
			"key.saving": "保存中…",
			"key.required": "请先填写 API key。",
			"key.invalid": "API key 只能包含可见 ASCII 字符，且不能是 NAME=value 或带引号的形式。",
			"key.noRemote": "浏览器的凭据服务尚未就绪，请刷新页面后重试。",
			"key.noStatus": "尚未读到密钥状态，请稍后重试。",
			"key.saved": "已保存；模型设置与额度都会使用这把密钥。",
			"key.savedWarning": "密钥已保存，但模型设置同步失败：{warning}",
			"key.syncModel": "同步到模型设置",
			"key.syncing": "同步中…",
			"key.modelSynced": "已把现有密钥绑定到模型设置，无需重新粘贴。",
			"key.modelReady": "模型路由已使用同一把密钥。",
			"key.modelPending": "模型路由尚未绑定这把密钥，保存或点「同步到模型设置」即可。",
			"key.modelAbsent": "模型设置里还没有 OpenCode Go；保存或点「同步到模型设置」会一并创建。",
			"key.modelMissingRef": "模型路由引用的凭据还没有配置；保存后会写入该引用。",
			"key.manage": "也可以在「设置 → 模型 → OpenCode Go」中管理这把密钥。"
		};
		const en = {
			nav: "OpenCode GO",
			title: "OpenCode GO plan quota",
			subtitle: "Usage and reset time for the rolling 5-hour, weekly, and monthly windows, served by the official OpenCode GO usage API.",
			refresh: "Refresh",
			loading: "Reading quota…",
			updated: "Updated {time}",
			"window.rolling": "Rolling",
			"window.rolling.hint": "5 hours",
			"window.weekly": "Weekly",
			"window.monthly": "Monthly",
			remaining: "left",
			used: "{pct}% used",
			countdown: "resets in {time}",
			resetAt: "Resets at {time}",
			soon: "resetting",
			minutes: "{n} min",
			hours: "{n} h {m} m",
			days: "{n} d {m} h",
			errorTitle: "Could not read the quota",
			errorHint: "Save a key above, or configure {key} under Settings → Models → OpenCode Go, and check that the subscription is active.",
			missing: "The API returned no data for this window",
			foot: "Remaining = 100% − used; the bar shows the remaining share and refreshes every 60 seconds.",
			"key.title": "API key",
			"key.configured": "Configured",
			"key.missing": "Not configured",
			"key.subtitle": "Shares the same key as Settings → Models → OpenCode Go; saving here is the same as saving there.",
			"key.loading": "Reading key status…",
			"key.using": "Using {ref} ({source})",
			"key.saveTo": "Will save to {ref}",
			"key.source.model": "model settings",
			"key.source.record": "DSH sign-in credential",
			"key.source.native": "DSH environment",
			"key.source.derived": "OpenCode Go default credential",
			"key.source.plugin": "plugin config",
			"key.placeholder": "Paste an OpenCode GO API key",
			"key.save": "Save key",
			"key.saving": "Saving…",
			"key.required": "Enter an API key first.",
			"key.invalid": "An API key must contain visible ASCII characters and must not be a NAME=value line or quoted.",
			"key.noRemote": "The browser credential service is not ready yet; refresh the page and try again.",
			"key.noStatus": "Key status has not loaded yet; try again in a moment.",
			"key.saved": "Saved; the model settings and the quota both use this key.",
			"key.savedWarning": "The key was saved, but syncing the model settings failed: {warning}",
			"key.syncModel": "Sync to Models",
			"key.syncing": "Syncing…",
			"key.modelSynced": "Bound the existing key to the model route; no need to paste it again.",
			"key.modelReady": "The model route already uses the same key.",
			"key.modelPending": "The model route is not bound to this key yet; save or use Sync to Models.",
			"key.modelAbsent": "OpenCode Go is not configured under Models yet; saving or syncing creates it as well.",
			"key.modelMissingRef": "The credential reference named by the model route is not configured; saving writes it.",
			"key.manage": "You can also manage this key under Settings → Models → OpenCode Go."
		};

		// ── helpers ─────────────────────────────────────────────────────────
		const WINDOWS = [
			{ key: "rolling", labelKey: "window.rolling", hintKey: "window.rolling.hint" },
			{ key: "weekly", labelKey: "window.weekly", hintKey: null },
			{ key: "monthly", labelKey: "window.monthly", hintKey: null }
		];

		/**
		 * Remote services are captured through inject-scoped contexts: reading
		 * `ctx.remote.credentials` from this plugin's own context would throw
		 * ("cannot get property ... without inject"), because every namespace is
		 * a service nested under `remote`.
		 */
		let credentialsApi = null;
		let settingsApi = null;

		const KEY_SOURCE_COPY = {
			model: "key.source.model",
			record: "key.source.record",
			native: "key.source.native",
			derived: "key.source.derived",
			plugin: "key.source.plugin"
		};

		function keySourceLabel(t, source) {
			const key = KEY_SOURCE_COPY[source];
			return key === undefined ? "" : t(key);
		}

		/**
		 * The Models page's own key rules: printable ASCII, no spaces, no
		 * `NAME=value` paste, no wrapping quotes. Mirrored rather than imported
		 * because a client bundle may only require the seeded modules.
		 */
		function apiKeyFailure(value, t) {
			const draft = String(value || "").trim();
			if (draft.length === 0) return t("key.required");
			if (/^[A-Z][A-Z0-9_]*=[^=]/.test(draft)) return t("key.invalid");
			const quote = draft[0];
			if ((quote === '"' || quote === "'" || quote === "`") && draft.length > 1 && draft.endsWith(quote)) return t("key.invalid");
			if (!/^[\x21-\x7E]+$/.test(draft)) return t("key.invalid");
			return null;
		}

		/**
		 * Add the key reference to the live `llm-pi-ai` profile when the route
		 * has no `apiKeyEnv` yet — the same settings write the Models page
		 * performs after storing a key.
		 * @returns {{ ok: boolean, synced?: boolean, error?: string }}
		 */
		async function syncModelProfile(status, t) {
			const model = status && status.model;
			if (!model || !model.needsProfile) return { ok: true, synced: false };
			if (!settingsApi) return { ok: false, error: t("key.noRemote") };
			if (!model.settingsNs) return { ok: false, error: t("key.noStatus") };
			try {
				const described = await settingsApi.describe();
				if (!described || !described.ok) {
					return { ok: false, error: (described && described.error && described.error.message) || t("key.errorTitle") };
				}
				const namespaces = described.value && Array.isArray(described.value.namespaces)
					? described.value.namespaces
					: [];
				const row = namespaces.find(item => item && item.ns === model.settingsNs);
				if (!row) return { ok: false, error: t("key.noStatus") };
				const providers = row.value && typeof row.value.providers === "object" && row.value.providers !== null
					? row.value.providers
					: {};
				const route = model.targetRoute || "opencode-go";
				const profile = providers[route];
				const ops = [];
				if (profile === null || typeof profile !== "object" || Array.isArray(profile)) {
					ops.push({ op: "set", path: ["providers", route], value: { apiKeyEnv: status.targetRef } });
				} else if (typeof profile.apiKeyEnv !== "string" || profile.apiKeyEnv.length === 0) {
					ops.push({ op: "set", path: ["providers", route, "apiKeyEnv"], value: status.targetRef });
				}
				if (ops.length === 0) return { ok: true, synced: false };
				const written = await settingsApi.mutate(model.settingsNs, ops, row.revision);
				if (!written || !written.ok) {
					return { ok: false, error: (written && written.error && written.error.message) || t("key.errorTitle") };
				}
				return { ok: true, synced: true };
			} catch (cause) {
				return { ok: false, error: String((cause && cause.message) || cause) };
			}
		}

		function remainingOf(percent) {
			if (typeof percent !== "number" || !Number.isFinite(percent)) return null;
			return Math.max(0, Math.min(100, 100 - percent));
		}

		/** Fill color by REMAINING percent. */
		function fillColor(remaining) {
			if (remaining <= 10) return "var(--dsw-alias-state-error-primary)";
			if (remaining <= 30) return "var(--dsw-alias-state-warn-primary)";
			return "var(--dsw-alias-state-success-primary)";
		}

		function timeUntil(iso, t) {
			const target = new Date(iso).getTime();
			if (!Number.isFinite(target)) return "";
			const diff = target - Date.now();
			if (diff <= 0) return t("soon");
			const mins = Math.floor(diff / 60000);
			if (mins < 60) return t("minutes", { n: mins });
			const hours = Math.floor(mins / 60);
			if (hours < 24) return t("hours", { n: hours, m: mins % 60 });
			return t("days", { n: Math.floor(hours / 24), m: hours % 24 });
		}

		function two(n) {
			return String(n).padStart(2, "0");
		}

		/** 24-hour wall clock, locale-independent (avoids 12-hour AM/PM in zh). */
		function clock(iso) {
			const date = new Date(iso);
			if (!Number.isFinite(date.getTime())) return "";
			return date.getFullYear() + "-" + two(date.getMonth() + 1) + "-" + two(date.getDate()) +
				" " + two(date.getHours()) + ":" + two(date.getMinutes());
		}

		/** HH:MM:SS for the "updated at" line. */
		function wallTime(date) {
			return two(date.getHours()) + ":" + two(date.getMinutes()) + ":" + two(date.getSeconds());
		}

		// ── page component ──────────────────────────────────────────────────
		function QuotaPage(props) {
			const t = props.t || ((key) => key);
			const [data, setData] = react.useState(null);
			const [error, setError] = react.useState(null);
			const [stamp, setStamp] = react.useState(0);
			const [busy, setBusy] = react.useState(true);
			const [fetchedAt, setFetchedAt] = react.useState(null);
			const [keyStatus, setKeyStatus] = react.useState(null);
			const [keyDraft, setKeyDraft] = react.useState("");
			const [keyBusy, setKeyBusy] = react.useState(false);
			const [keySyncing, setKeySyncing] = react.useState(false);
			const [keyError, setKeyError] = react.useState(null);
			const [keyNotice, setKeyNotice] = react.useState(null);
			const forceRefresh = react.useRef(false);
			const [, setTick] = react.useState(0);
			const id = react.useId();

			react.useEffect(() => {
				let alive = true;
				setBusy(true);
				const load = async () => {
					const force = forceRefresh.current;
					forceRefresh.current = false;
					try {
						const res = await fetch(ROUTE + (force ? "?refresh=1" : ""), { cache: "no-store" });
						const body = await res.json().catch(() => null);
						if (!alive) return;
						if (body && body.key && typeof body.key === "object") setKeyStatus(body.key);
						if (!res.ok || body === null || body.error) {
							setError(String((body && body.error) || "HTTP " + res.status));
							setData(null);
						} else {
							setData(body);
							setError(null);
							setFetchedAt(new Date());
						}
					} catch (cause) {
						if (!alive) return;
						setError(String((cause && cause.message) || cause));
						setData(null);
					} finally {
						if (alive) setBusy(false);
					}
				};
				void load();
				const timer = window.setInterval(load, 60000);
				return () => {
					alive = false;
					window.clearInterval(timer);
				};
			}, [stamp]);

			// Re-render twice a minute so the "resets in" countdown advances.
			react.useEffect(() => {
				const timer = window.setInterval(() => setTick((n) => n + 1), 30000);
				return () => window.clearInterval(timer);
			}, []);

			/**
			 * Write the key to the SAME reference the model route uses, then add
			 * that reference to a keyless model profile. Both writes go through
			 * the official remote namespaces, so the Models page sees the key
			 * and the live adapter uses it on the next request.
			 */
			const saveKey = async () => {
				const failure = apiKeyFailure(keyDraft, t);
				if (failure !== null) {
					setKeyError(failure);
					return;
				}
				if (!credentialsApi) {
					setKeyError(t("key.noRemote"));
					return;
				}
				if (!keyStatus || !keyStatus.targetRef) {
					setKeyError(t("key.noStatus"));
					return;
				}
				setKeyBusy(true);
				setKeyError(null);
				setKeyNotice(null);
				try {
					const response = await credentialsApi.set(keyStatus.targetRef, keyDraft.trim());
					if (response && response.ok === false) {
						throw new Error((response.error && response.error.message) || t("key.errorTitle"));
					}
					let warning = null;
					if (keyStatus.model && keyStatus.model.needsProfile) {
						const synced = await syncModelProfile(keyStatus, t);
						if (!synced.ok) warning = synced.error;
					}
					setKeyDraft("");
					setKeyNotice(warning ? t("key.savedWarning", { warning }) : t("key.saved"));
					forceRefresh.current = true;
					setStamp((n) => n + 1);
				} catch (cause) {
					setKeyError(String((cause && cause.message) || cause));
				} finally {
					setKeyBusy(false);
				}
			};

			/**
			 * Bind an already-configured key to the model route without asking
			 * for it again. This is the migration path for a key that quota has
			 * been using under the fallback reference (or a `llm-pi-ai` sign-in
			 * record) while the provider was never configured under Models.
			 */
			const syncExistingKey = async () => {
				if (!keyStatus) return;
				setKeySyncing(true);
				setKeyError(null);
				setKeyNotice(null);
				try {
					const synced = await syncModelProfile(keyStatus, t);
					if (!synced.ok) throw new Error(synced.error);
					setKeyNotice(synced.synced ? t("key.modelSynced") : t("key.modelReady"));
					forceRefresh.current = true;
					setStamp((n) => n + 1);
				} catch (cause) {
					setKeyError(String((cause && cause.message) || cause));
				} finally {
					setKeySyncing(false);
				}
			};

			const keyInfo = keyStatus;
			const keyConfigured = keyInfo !== null && keyInfo.configured === true;
			const keySource = keyInfo !== null && keyInfo.source ? keySourceLabel(t, keyInfo.source) : "";
			const keyRefLine = keyInfo === null
				? t("key.loading")
				: keyConfigured
					? t("key.using", { ref: keyInfo.ref, source: keySource })
					: t("key.saveTo", { ref: keyInfo.targetRef });
			const model = keyInfo !== null && keyInfo.model ? keyInfo.model : null;
			let modelLine = null;
			if (model !== null) {
				if (model.configured) modelLine = t("key.modelReady");
				else if (model.needsProfile) modelLine = model.profile ? t("key.modelPending") : t("key.modelAbsent");
				else if (model.apiKeyEnv) modelLine = t("key.modelMissingRef");
			}
			const keyLocked = keyInfo !== null && keyInfo.writable === false;
			const keyPanel = jsxs("div", {
				className: "ocgq-key",
				children: [
					jsxs("div", {
						className: "ocgq-key-head",
						children: [
							jsx("span", { className: "ocgq-key-title", children: t("key.title") }),
							keyInfo === null
								? null
								: jsx("span", {
									className: "ocgq-badge " + (keyConfigured ? "ocgq-badge-ok" : "ocgq-badge-missing"),
									children: t(keyConfigured ? "key.configured" : "key.missing")
								})
						]
					}),
					jsx("p", { className: "ocgq-key-sub", children: t("key.subtitle") }),
					jsx("p", { className: "ocgq-key-meta", children: keyRefLine }),
					modelLine === null ? null : jsx("p", { className: "ocgq-key-model", children: modelLine }),
					jsxs("div", {
						className: "ocgq-key-row",
						children: [
							jsx("input", {
								type: "password",
								className: "ocgq-input",
								value: keyDraft,
								placeholder: t("key.placeholder"),
								autoComplete: "off",
								spellCheck: false,
								"aria-label": t("key.title"),
								disabled: keyBusy || keySyncing || keyInfo === null || keyLocked,
								onChange: (event) => setKeyDraft(event.target.value),
								onKeyDown: (event) => {
									if (event.key !== "Enter") return;
									event.preventDefault();
									void saveKey();
								}
							}),
							jsx("button", {
								type: "button",
								className: "ocgq-btn ocgq-key-save",
								disabled: keyBusy || keySyncing || keyInfo === null || keyLocked,
								onClick: () => { void saveKey(); },
								children: keyBusy ? t("key.saving") : t("key.save")
							}),
							keyConfigured && model !== null && model.needsProfile
								? jsx("button", {
									type: "button",
									className: "ocgq-btn",
									disabled: keyBusy || keySyncing,
									onClick: () => { void syncExistingKey(); },
									children: keySyncing ? t("key.syncing") : t("key.syncModel")
								})
								: null
						]
					}),
					keyError === null ? null : jsx("p", { className: "ocgq-key-error", role: "alert", children: keyError }),
					keyNotice === null ? null : jsx("p", { className: "ocgq-key-ok", role: "status", children: keyNotice }),
					jsx("p", { className: "ocgq-key-help", children: t("key.manage") })
				]
			});

			const windows = [];
			if (data && data.usage && typeof data.usage === "object") {
				for (const spec of WINDOWS) {
					const win = data.usage[spec.key];
					const remaining = win && typeof win.percent === "number" ? remainingOf(win.percent) : null;
					windows.push(jsxs("article", {
						className: "ocgq-card",
						children: [
							jsxs("div", {
								className: "ocgq-card-head",
								children: [
									jsx("span", { className: "ocgq-name", children: t(spec.labelKey) }),
									spec.hintKey ? jsx("span", { className: "ocgq-hint", children: t(spec.hintKey) }) : null
								]
							}),
							remaining === null
								? jsx("div", { className: "ocgq-reset", children: t("missing") })
								: jsxs(react.Fragment, {
									children: [
										jsxs("div", {
											className: "ocgq-value",
											children: [
												jsx("b", { children: Math.round(remaining) + "%" }),
												jsx("span", { children: t("remaining") })
											]
										}),
										jsx("div", {
											className: "ocgq-track",
											role: "progressbar",
											"aria-label": t(spec.labelKey),
											"aria-valuemin": 0,
											"aria-valuemax": 100,
											"aria-valuenow": Math.round(remaining),
											children: jsx("div", {
												className: "ocgq-fill",
												style: { width: remaining + "%", background: fillColor(remaining) }
											})
										}),
										jsxs("div", {
											className: "ocgq-meta",
											children: [
												jsx("span", { children: t("used", { pct: Math.round(win.percent) }) }),
												win.resetsAt
													? jsx("span", {
														className: "ocgq-reset",
														title: t("resetAt", { time: clock(win.resetsAt) }),
														children: t("countdown", { time: timeUntil(win.resetsAt, t) })
													})
													: null
											]
										}),
									]
								})
						]
					}, spec.key));
				}
			}

			return jsxs("section", {
				className: "ocgq",
				"aria-labelledby": id + "-title",
				children: [
					jsxs("div", {
						className: "ocgq-head",
						children: [
							jsxs("div", {
								children: [
									jsx("h2", { className: "ocgq-title", id: id + "-title", children: t("title") }),
									jsx("p", { className: "ocgq-sub", children: t("subtitle") })
								]
							}),
							jsxs("div", {
								className: "ocgq-actions",
								children: [
									fetchedAt ? jsx("span", { className: "ocgq-updated", children: t("updated", { time: wallTime(fetchedAt) }) }) : null,
									jsx("button", {
										type: "button",
										className: "ocgq-btn",
										disabled: busy,
										onClick: () => {
											forceRefresh.current = true;
											setStamp((n) => n + 1);
										},
										children: t("refresh")
									})
								]
							})
						]
					}),
					keyPanel,
					error
						? jsxs("div", {
							className: "ocgq-error",
							role: "alert",
							children: [
								jsx("b", { children: t("errorTitle") }),
								jsx("span", { children: error }),
								jsx("span", { children: t("errorHint", { key: (keyInfo && keyInfo.targetRef) || "OPENCODE_GO_API_KEY" }) })
							]
						})
						: windows.length > 0
							? jsx("div", { className: "ocgq-grid", children: windows })
							: jsxs("div", {
								className: "ocgq-grid",
								"aria-busy": "true",
								children: [
									jsx("div", { className: "ocgq-skeleton" }, "a"),
									jsx("div", { className: "ocgq-skeleton" }, "b"),
									jsx("div", { className: "ocgq-skeleton" }, "c")
								]
							}),
					data ? jsx("div", { className: "ocgq-foot", children: t("foot") }) : null
				]
			});
		}

		// ── cordis plugin entry ─────────────────────────────────────────────
		const inject = ["slots", "locale", "remote"];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-opencode-go-quota-settings: dictionaries");
			// Nested remote namespaces are services under `remote`; capture each
			// through an inject-scoped context instead of reading
			// `ctx.remote.credentials` from this plugin's own context.
			ctx.inject(["remote.credentials"], (remoteCtx) => {
				credentialsApi = remoteCtx.remote.credentials;
				return () => { credentialsApi = null; };
			});
			ctx.inject(["remote.settings"], (remoteCtx) => {
				settingsApi = remoteCtx.remote.settings;
				return () => { settingsApi = null; };
			});
			const register = () => ctx.slots.register({
				name: "settings.section",
				id: "opencode-go-quota",
				order: 14,
				label: () => ctx.locale.bind(NS)("nav"),
				locale: NS,
				inject: () => ({ t: ctx.locale.bind(NS) })
			}, QuotaPage);
			if (typeof ctx.slots.inject === "function") {
				ctx.slots.inject("settings.section", register);
			} else {
				ctx.effect(register, "dsh-opencode-go-quota-settings: settings page registration");
			}
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
