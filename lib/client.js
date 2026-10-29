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
			errorHint: "确认已在 ~/.dsh/.credentials.yaml 配置 {key}，且 OpenCode GO 订阅有效。",
			missing: "接口没有返回该窗口的数据",
			foot: "剩余 = 100% − 已用；进度条按剩余比例绘制，每 60 秒自动刷新一次。"
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
			errorHint: "Check that {key} is set in ~/.dsh/.credentials.yaml and that the OpenCode GO subscription is active.",
			missing: "The API returned no data for this window",
			foot: "Remaining = 100% − used; the bar shows the remaining share and refreshes every 60 seconds."
		};

		// ── helpers ─────────────────────────────────────────────────────────
		const WINDOWS = [
			{ key: "rolling", labelKey: "window.rolling", hintKey: "window.rolling.hint" },
			{ key: "weekly", labelKey: "window.weekly", hintKey: null },
			{ key: "monthly", labelKey: "window.monthly", hintKey: null }
		];

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
			const [, setTick] = react.useState(0);
			const id = react.useId();

			react.useEffect(() => {
				let alive = true;
				setBusy(true);
				const load = async () => {
					try {
						const res = await fetch(ROUTE, { cache: "no-store" });
						const body = await res.json().catch(() => null);
						if (!alive) return;
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
										onClick: () => setStamp((n) => n + 1),
										children: t("refresh")
									})
								]
							})
						]
					}),
					error
						? jsxs("div", {
							className: "ocgq-error",
							role: "alert",
							children: [
								jsx("b", { children: t("errorTitle") }),
								jsx("span", { children: error }),
								jsx("span", { children: t("errorHint", { key: "OPENCODE_GO_API_KEY" }) })
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
		const inject = ["slots", "locale"];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-opencode-go-quota-settings: dictionaries");
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
