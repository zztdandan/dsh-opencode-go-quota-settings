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
		const MODELS_ROUTE = "/dsh-opencode-go-quota-settings/models";
		const DEFAULT_BASE_URL = "https://opencode.ai/zen/go";
		const REFRESH_OPTIONS = [30_000, 60_000, 120_000, 300_000];
		const CACHE_OPTIONS = [0, 15_000, 30_000, 60_000, 300_000];

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
				".ocgq-field .ocgq-input{flex:0 0 auto;width:100%}",
				".ocgq-key-save{flex:none}",
				".ocgq-key-model{margin:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}",
				".ocgq-key-error,.ocgq-key-ok{margin:0;font-size:11px;line-height:16px;overflow-wrap:anywhere}",
				".ocgq-key-error{color:var(--dsw-alias-state-error-primary)}",
				".ocgq-key-ok{color:var(--dsw-alias-state-success-primary)}",
				".ocgq-key-help{margin:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}",
				".ocgq-sec{box-sizing:border-box;display:flex;flex-direction:column;gap:10px;padding:14px 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);min-width:0}",
				".ocgq-sec-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}",
				".ocgq-sec-title{margin:0;font-size:13px;line-height:18px;font-weight:600;color:var(--dsw-alias-label-primary)}",
				".ocgq-sec-sub{margin:3px 0 0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);max-width:620px}",
				".ocgq-sec-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:none}",
				".ocgq-sec-meta{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}",
				".ocgq-tag{display:inline-flex;align-items:center;font-size:10px;line-height:14px;padding:0 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);white-space:nowrap}",
				".ocgq-tag-free{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-secondary)}",
				".ocgq-tag-warn{color:var(--dsw-alias-state-warn-primary);border-color:var(--dsw-alias-state-warn-secondary)}",
				".ocgq-linkrow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:2px}",
				".ocgq-link{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;text-decoration:underline;text-underline-offset:2px}",
				".ocgq-link:hover{color:var(--dsw-alias-label-primary)}",
				".ocgq-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}",
				".ocgq-field{display:flex;flex-direction:column;gap:5px;min-width:0}",
				".ocgq-label{font-size:11px;line-height:16px;font-weight:600;color:var(--dsw-alias-label-secondary)}",
				".ocgq-help{margin:0;font-size:10px;line-height:15px;color:var(--dsw-alias-label-tertiary)}",
				".ocgq-select{box-sizing:border-box;width:100%;padding:5px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:20px}",
				".ocgq-select:focus{outline:1px solid var(--dsw-alias-state-success-primary);outline-offset:1px}",
				".ocgq-check{display:flex;align-items:flex-start;gap:8px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary);cursor:pointer}",
				".ocgq-check input{margin:1px 0 0;accent-color:var(--dsw-alias-state-success-primary)}",
				".ocgq-check span{display:flex;flex-direction:column;gap:1px}",
				".ocgq-check small{font-size:10px;line-height:15px;color:var(--dsw-alias-label-tertiary)}",
				".ocgq-model-list{display:flex;flex-direction:column;gap:8px;max-height:430px;overflow:auto;padding-right:4px;overscroll-behavior:contain}",
				".ocgq-model{box-sizing:border-box;display:flex;flex-direction:column;gap:5px;padding:9px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);min-width:0}",
				".ocgq-model[data-default=true]{border-color:var(--dsw-alias-state-success-secondary);background:var(--dsw-alias-bg-layer-2)}",
				".ocgq-model-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap}",
				".ocgq-model-name{font-size:12px;line-height:17px;font-weight:600;color:var(--dsw-alias-label-primary)}",
				".ocgq-model-id{font-size:10px;line-height:15px;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}",
				".ocgq-model-desc{margin:0;font-size:10px;line-height:15px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
				".ocgq-model-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:10px;line-height:15px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}",
				".ocgq-model-tags{display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap;margin-left:6px}",
				".ocgq-status{display:inline-flex;align-items:center;gap:5px;font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary)}",
				".ocgq-status-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary)}",
				".ocgq-status-dot-warn{background:var(--dsw-alias-state-warn-primary)}",
				".ocgq-status-dot-error{background:var(--dsw-alias-state-error-primary)}",
				".ocgq-notice{margin:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}",
				".ocgq-notice-error{color:var(--dsw-alias-state-error-primary)}",
				".ocgq-notice-ok{color:var(--dsw-alias-state-success-primary)}",
				".ocgq-diag{margin:0;box-sizing:border-box;max-height:320px;overflow:auto;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:15px;white-space:pre-wrap;overflow-wrap:anywhere}",
				".ocgq-empty{margin:0;padding:10px 0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}",
				".ocgq-share{font-size:10px;line-height:15px;color:var(--dsw-alias-label-tertiary)}",
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
			foot: "剩余 = 100% − 已用；进度条按剩余比例绘制，每 {seconds} 秒自动刷新一次。",
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
			"key.manage": "也可以在「设置 → 模型 → OpenCode Go」中管理这把密钥。",
			"key.fingerprint": "密钥指纹 {fp}（与模型使用的 key 核对用）",
			"links.console": "OpenCode Console",
			"links.go": "Go 文档",
			"links.status": "服务状态",
			"quota.status": "状态 {status}",
			"window.rolling.share": "月额度的 20%",
			"window.weekly.share": "月额度的 50%",
			"window.monthly.share": "月额度的 100%",
			"models.title": "模型目录",
			"models.subtitle": "读取 OpenCode Go 的 /v1/models：上下文、输出上限、能力与每 1M token 价格。",
			"models.count": "{n} 个模型",
			"models.refresh": "刷新模型",
			"models.collapse": "收起",
			"models.expand": "展开",
			"models.search": "搜索模型名称或 ID",
			"models.loading": "正在读取模型目录…",
			"models.noKey": "配置 API 密钥后会读取模型目录。",
			"models.empty": "没有匹配的模型。",
			"models.updated": "更新于 {time}",
			"models.latency": "{ms} ms",
			"models.default": "DSH 默认",
			"models.free": "免费",
			"models.vision": "视觉",
			"models.tools": "工具",
			"models.reasoning": "推理",
			"models.reasoningWith": "推理 {efforts}",
			"models.peak": "峰时 ×{n}",
			"models.context": "上下文 {n}",
			"models.output": "输出 {n}",
			"models.price": "每 1M：输入 {input} / 输出 {output}",
			"models.cache": "缓存读 {price}",
			"models.freePrice": "免费",
			"models.defaultModel": "DSH 默认模型：{provider} / {model}",
			"models.protocols": "协议 {list}",
			"config.title": "连接与刷新",
			"config.subtitle": "这些字段写入本插件的设置，下一次请求或刷新即生效。",
			"config.baseUrl": "网关地址",
			"config.baseUrlHint": "默认 {default}；一般无需修改。",
			"config.reset": "恢复默认",
			"config.refresh": "自动刷新",
			"config.cache": "额度缓存",
			"config.cacheHint": "只影响额度请求；模型目录缓存 5 分钟，刷新按钮会绕过。",
			"config.sessionHeader": "注入 x-opencode-session",
			"config.sessionHeaderHint": "OpenCode Go 需要该会话头；关闭后聊天可能返回 400。",
			"config.showModels": "显示模型目录",
			"config.showDiagnostics": "显示诊断信息",
			"config.save": "保存设置",
			"config.saving": "保存中…",
			"config.saved": "设置已保存。",
			"config.discard": "放弃修改",
			"config.noChange": "没有需要保存的修改。",
			"config.invalidUrl": "网关地址必须是 http(s) URL。",
			"config.unavailable": "还没有读到插件设置，稍后再试。",
			"config.noRemote": "设置服务尚未就绪，请刷新页面后重试。",
			"config.failed": "保存失败：{error}",
			"config.test": "测试连接",
			"config.testing": "测试中…",
			"config.testOk": "连接正常 · {count} 个模型 · {ms} ms",
			"config.testFail": "连接失败：{error}",
			"config.seconds": "{n} 秒",
			"config.minutes": "{n} 分钟",
			"diag.title": "诊断信息",
			"diag.subtitle": "用于排查密钥、会话头和端点问题；不包含密钥明文。",
			"diag.copy": "复制诊断",
			"diag.copied": "已复制。",
			"diag.copyFailed": "复制失败，请手动选择文本。"
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
			foot: "Remaining = 100% − used; the bar shows the remaining share and refreshes every {seconds} seconds.",
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
			"key.manage": "You can also manage this key under Settings → Models → OpenCode Go.",
			"key.fingerprint": "Key fingerprint {fp} (compare it with the model key)",
			"links.console": "OpenCode Console",
			"links.go": "Go docs",
			"links.status": "Service status",
			"quota.status": "Status {status}",
			"window.rolling.share": "20% of the monthly allowance",
			"window.weekly.share": "50% of the monthly allowance",
			"window.monthly.share": "100% of the monthly allowance",
			"models.title": "Model catalog",
			"models.subtitle": "Read from OpenCode Go /v1/models: context, output cap, capabilities, and price per 1M tokens.",
			"models.count": "{n} models",
			"models.refresh": "Refresh models",
			"models.collapse": "Collapse",
			"models.expand": "Expand",
			"models.search": "Search model name or ID",
			"models.loading": "Reading the model catalog…",
			"models.noKey": "Configure an API key to read the model catalog.",
			"models.empty": "No matching models.",
			"models.updated": "Updated {time}",
			"models.latency": "{ms} ms",
			"models.default": "DSH default",
			"models.free": "Free",
			"models.vision": "Vision",
			"models.tools": "Tools",
			"models.reasoning": "Reasoning",
			"models.reasoningWith": "Reasoning {efforts}",
			"models.peak": "Peak ×{n}",
			"models.context": "Context {n}",
			"models.output": "Output {n}",
			"models.price": "Per 1M: input {input} / output {output}",
			"models.cache": "Cache read {price}",
			"models.freePrice": "Free",
			"models.defaultModel": "DSH default model: {provider} / {model}",
			"models.protocols": "Protocols {list}",
			"config.title": "Connection & refresh",
			"config.subtitle": "These fields write this plugin's settings and apply to the next request or refresh.",
			"config.baseUrl": "Gateway URL",
			"config.baseUrlHint": "Default {default}; usually no change is needed.",
			"config.reset": "Reset",
			"config.refresh": "Auto refresh",
			"config.cache": "Quota cache",
			"config.cacheHint": "Quota requests only; the model catalog is cached for 5 minutes and its refresh button bypasses it.",
			"config.sessionHeader": "Inject x-opencode-session",
			"config.sessionHeaderHint": "OpenCode Go requires this session header; without it chat can return 400.",
			"config.showModels": "Show the model catalog",
			"config.showDiagnostics": "Show diagnostics",
			"config.save": "Save settings",
			"config.saving": "Saving…",
			"config.saved": "Settings saved.",
			"config.discard": "Discard changes",
			"config.noChange": "Nothing to save.",
			"config.invalidUrl": "The gateway URL must be an http(s) URL.",
			"config.unavailable": "Plugin settings have not loaded yet; try again in a moment.",
			"config.noRemote": "The settings service is not ready; refresh the page and try again.",
			"config.failed": "Save failed: {error}",
			"config.test": "Test connection",
			"config.testing": "Testing…",
			"config.testOk": "Connected · {count} models · {ms} ms",
			"config.testFail": "Connection failed: {error}",
			"config.seconds": "{n} s",
			"config.minutes": "{n} min",
			"diag.title": "Diagnostics",
			"diag.subtitle": "Troubleshooting facts for the key, session header, and endpoint; never the key literal.",
			"diag.copy": "Copy diagnostics",
			"diag.copied": "Copied.",
			"diag.copyFailed": "Copy failed; select the text manually."
		};

		// ── helpers ─────────────────────────────────────────────────────────
		const WINDOWS = [
			{ key: "rolling", labelKey: "window.rolling", hintKey: "window.rolling.hint", shareKey: "window.rolling.share" },
			{ key: "weekly", labelKey: "window.weekly", hintKey: null, shareKey: "window.weekly.share" },
			{ key: "monthly", labelKey: "window.monthly", hintKey: null, shareKey: "window.monthly.share" }
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

		/** Compact token counts for the model rows: 1M / 384K / 512. */
		function compactNumber(value) {
			if (typeof value !== "number" || !Number.isFinite(value)) return "—";
			if (value >= 1_000_000) {
				const n = value / 1_000_000;
				return String(n >= 10 ? Math.round(n) : Number(n.toFixed(1))) + "M";
			}
			if (value >= 1_000) {
				const n = value / 1_000;
				return String(n >= 10 ? Math.round(n) : Number(n.toFixed(1))) + "K";
			}
			return String(value);
		}

		/** Price per 1M tokens; zero is rendered as "free". */
		function priceText(value, t) {
			if (value === null || value === undefined) return "—";
			if (value === 0) return t("models.freePrice");
			return "$" + String(Number(value.toFixed(4)));
		}

		/** Select label for a millisecond option. */
		function durationText(ms, t) {
			if (ms >= 60_000 && ms % 60_000 === 0) return t("config.minutes", { n: ms / 60_000 });
			return t("config.seconds", { n: Math.round(ms / 1000) });
		}

		/** Copy text without requiring a secure context (clipboard is not always available). */
		async function copyText(text) {
			try {
				if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
					await navigator.clipboard.writeText(text);
					return true;
				}
			} catch {
				// Fall through to the textarea path.
			}
			try {
				const area = document.createElement("textarea");
				area.value = text;
				area.style.position = "fixed";
				area.style.opacity = "0";
				document.body.appendChild(area);
				area.select();
				const ok = document.execCommand("copy");
				area.remove();
				return ok;
			} catch {
				return false;
			}
		}

		/** Whether a catalog model is the DSH default selected for new sessions. */
		function isDefaultModel(model, defaultModel) {
			return defaultModel !== null
				&& (defaultModel.provider === "opencode-go" || defaultModel.provider === "opencode")
				&& defaultModel.model === model.id;
		}

		/**
		 * Write this plugin's own settings through the official remote. The
		 * namespace id comes from the host (the loader entry id), so a renamed
		 * mount still resolves.
		 */
		async function mutatePluginSettings(ns, ops, t) {
			if (!settingsApi) throw new Error(t("config.noRemote"));
			const described = await settingsApi.describe();
			if (!described || !described.ok) {
				throw new Error((described && described.error && described.error.message) || t("config.unavailable"));
			}
			const namespaces = described.value && Array.isArray(described.value.namespaces) ? described.value.namespaces : [];
			const row = namespaces.find(item => item && item.ns === ns);
			if (!row) throw new Error(t("config.unavailable"));
			const written = await settingsApi.mutate(ns, ops, row.revision);
			if (!written || !written.ok) {
				throw new Error((written && written.error && written.error.message) || t("config.failed", { error: "settings/mutate" }));
			}
			return written.value;
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

		/** One model row: limits, price, and capability tags. */
		function ModelRow(props) {
			const { model, t, defaultModel } = props;
			const isDefault = isDefaultModel(model, defaultModel);
			const tags = [];
			if (isDefault) tags.push(jsx("span", { className: "ocgq-tag ocgq-tag-free", children: t("models.default") }, "default"));
			if (model.free) tags.push(jsx("span", { className: "ocgq-tag ocgq-tag-free", children: t("models.free") }, "free"));
			if (model.vision) tags.push(jsx("span", { className: "ocgq-tag", children: t("models.vision") }, "vision"));
			if (model.tools) tags.push(jsx("span", { className: "ocgq-tag", children: t("models.tools") }, "tools"));
			if (model.reasoning) {
				tags.push(jsx("span", {
					className: "ocgq-tag",
					children: Array.isArray(model.reasoningEfforts) && model.reasoningEfforts.length > 0
						? t("models.reasoningWith", { efforts: model.reasoningEfforts.join(" / ") })
						: t("models.reasoning")
				}, "reasoning"));
			}
			if (model.peakMultiplier !== null) tags.push(jsx("span", { className: "ocgq-tag ocgq-tag-warn", children: t("models.peak", { n: model.peakMultiplier }) }, "peak"));
			const price = model.price && typeof model.price === "object" ? model.price : null;
			return jsxs("article", {
				className: "ocgq-model",
				"data-default": isDefault ? "true" : "false",
				title: model.description || model.id,
				children: [
					jsxs("div", {
						className: "ocgq-model-head",
						children: [
							jsxs("span", {
								children: [
									jsx("span", { className: "ocgq-model-name", children: model.name }),
									tags.length > 0 ? jsx("span", { className: "ocgq-model-tags", children: tags }) : null
								]
							}),
							jsx("span", { className: "ocgq-model-id", children: model.id })
						]
					}),
					model.description ? jsx("p", { className: "ocgq-model-desc", children: model.description }) : null,
					jsxs("div", {
						className: "ocgq-model-meta",
						children: [
							jsx("span", { children: t("models.context", { n: compactNumber(model.context) }) }),
							jsx("span", { children: t("models.output", { n: compactNumber(model.output) }) }),
							price ? jsx("span", { children: t("models.price", { input: priceText(price.input, t), output: priceText(price.output, t) }) }) : null,
							price && price.cacheRead !== null && price.cacheRead !== undefined
								? jsx("span", { children: t("models.cache", { price: priceText(price.cacheRead, t) }) })
								: null,
							model.protocols && model.protocols.length > 0
								? jsx("span", { children: t("models.protocols", { list: model.protocols.join(" / ") }) })
								: null
						]
					})
				]
			}, model.id);
		}

		/** Read-only model catalog card. */
		function ModelsCard(props) {
			const t = props.t;
			const all = props.models && Array.isArray(props.models.models) ? props.models.models : [];
			const query = String(props.query || "").trim().toLowerCase();
			const visible = all
				.filter(model => query.length === 0 || [model.id, model.name, model.family, model.canonicalId]
					.some(value => typeof value === "string" && value.toLowerCase().includes(query)))
				.sort((left, right) => {
					const leftDefault = isDefaultModel(left, props.defaultModel);
					const rightDefault = isDefaultModel(right, props.defaultModel);
					if (leftDefault !== rightDefault) return leftDefault ? -1 : 1;
					return left.name.localeCompare(right.name);
				});
			const updated = props.models && props.models.fetchedAt ? clock(props.models.fetchedAt) : "";
			const defaultLine = props.defaultModel
				? t("models.defaultModel", { provider: props.defaultModel.provider, model: props.defaultModel.model || "—" })
				: null;
			return jsxs("section", {
				className: "ocgq-sec",
				children: [
					jsxs("div", {
						className: "ocgq-sec-head",
						children: [
							jsxs("div", {
								children: [
									jsx("h3", { className: "ocgq-sec-title", children: t("models.title") }),
									jsx("p", { className: "ocgq-sec-sub", children: t("models.subtitle") }),
									defaultLine === null ? null : jsx("p", { className: "ocgq-sec-meta", children: defaultLine })
								]
							}),
							jsxs("div", {
								className: "ocgq-sec-actions",
								children: [
									updated ? jsx("span", { className: "ocgq-sec-meta", children: t("models.updated", { time: updated }) }) : null,
									jsx("button", {
										type: "button",
										className: "ocgq-btn",
										disabled: props.busy,
										onClick: props.onRefresh,
										children: t("models.refresh")
									}),
									jsx("button", {
										type: "button",
										className: "ocgq-btn",
										onClick: props.onToggle,
										children: t(props.open ? "models.collapse" : "models.expand")
									})
								]
							})
						]
					}),
					props.open
						? jsxs(react.Fragment, {
							children: [
								jsxs("div", {
									className: "ocgq-sec-actions",
									children: [
										jsx("input", {
											className: "ocgq-input",
											placeholder: t("models.search"),
											value: props.query,
											onChange: event => props.onQuery(event.target.value),
											"aria-label": t("models.search")
										}),
										jsx("span", {
											className: "ocgq-sec-meta",
											children: props.models === null ? "" : t("models.count", { n: visible.length })
										}),
										props.models && typeof props.models.latencyMs === "number"
											? jsx("span", { className: "ocgq-sec-meta", children: t("models.latency", { ms: props.models.latencyMs }) })
											: null
									]
								}),
								props.error ? jsx("p", { className: "ocgq-notice ocgq-notice-error", children: props.error }) : null,
								!props.configured
									? jsx("p", { className: "ocgq-empty", children: t("models.noKey") })
									: (props.busy || props.models === null) && all.length === 0
										? jsx("p", { className: "ocgq-empty", children: t("models.loading") })
										: visible.length === 0
										? jsx("p", { className: "ocgq-empty", children: t("models.empty") })
										: jsx("div", {
											className: "ocgq-model-list",
											children: visible.map(model => jsx(ModelRow, { model, t, defaultModel: props.defaultModel }, model.id))
										})
							]
						})
						: null
				]
			});
		}

		/** Editable connection/refresh settings card. */
		function ConfigCard(props) {
			const t = props.t;
			const draft = props.draft;
			const disabled = !props.available || props.busy;
			const update = (patch) => props.onEdit(patch);
			const withCurrent = (options, value) => options.includes(value) ? options : [...options, value].sort((a, b) => a - b);
			const probe = props.probe;
			return jsxs("section", {
				className: "ocgq-sec",
				children: [
					jsxs("div", {
						className: "ocgq-sec-head",
						children: [
							jsxs("div", {
								children: [
									jsx("h3", { className: "ocgq-sec-title", children: t("config.title") }),
									jsx("p", { className: "ocgq-sec-sub", children: t("config.subtitle") })
								]
							})
						]
					}),
					draft === null
						? jsx("p", { className: "ocgq-empty", children: t("config.unavailable") })
						: jsxs(react.Fragment, {
							children: [
								jsxs("div", {
									className: "ocgq-grid2",
									children: [
										jsxs("div", {
											className: "ocgq-field",
											children: [
												jsxs("div", {
													className: "ocgq-sec-actions",
													style: { justifyContent: "space-between" },
													children: [
														jsx("label", { className: "ocgq-label", children: t("config.baseUrl") }),
														jsx("button", {
															type: "button",
															className: "ocgq-btn",
															disabled,
															onClick: () => update({ baseUrl: DEFAULT_BASE_URL }),
															children: t("config.reset")
														})
													]
												}),
												jsx("input", {
													className: "ocgq-input",
													value: draft.baseUrl,
													disabled,
													onChange: event => update({ baseUrl: event.target.value })
												}),
												jsx("p", { className: "ocgq-help", children: t("config.baseUrlHint", { default: DEFAULT_BASE_URL }) })
											]
										}),
										jsxs("div", {
											className: "ocgq-field",
											children: [
												jsx("label", { className: "ocgq-label", children: t("config.refresh") }),
												jsx("select", {
													className: "ocgq-select",
													value: String(draft.refreshMs),
													disabled,
													onChange: event => update({ refreshMs: Number(event.target.value) }),
													children: withCurrent(REFRESH_OPTIONS, draft.refreshMs)
														.map(ms => jsx("option", { value: String(ms), children: durationText(ms, t) }, ms))
												})
											]
										}),
										jsxs("div", {
											className: "ocgq-field",
											children: [
												jsx("label", { className: "ocgq-label", children: t("config.cache") }),
												jsx("select", {
													className: "ocgq-select",
													value: String(draft.cacheMs),
													disabled,
													onChange: event => update({ cacheMs: Number(event.target.value) }),
													children: withCurrent(CACHE_OPTIONS, draft.cacheMs)
														.map(ms => jsx("option", { value: String(ms), children: durationText(ms, t) }, ms))
												}),
												jsx("p", { className: "ocgq-help", children: t("config.cacheHint") })
											]
										})
									]
								}),
								jsxs("div", {
									className: "ocgq-grid2",
									children: [
										jsxs("label", {
											className: "ocgq-check",
											children: [
												jsx("input", {
													type: "checkbox",
													checked: draft.injectSessionHeader === true,
													disabled,
													onChange: event => update({ injectSessionHeader: event.target.checked })
												}),
												jsxs("span", {
													children: [
														jsx("span", { children: t("config.sessionHeader") }),
														jsx("small", { children: t("config.sessionHeaderHint") })
													]
												})
											]
										}),
										jsxs("label", {
											className: "ocgq-check",
											children: [
												jsx("input", {
													type: "checkbox",
													checked: draft.showModels !== false,
													disabled,
													onChange: event => update({ showModels: event.target.checked })
												}),
												jsxs("span", { children: [jsx("span", { children: t("config.showModels") })] })
											]
										}),
										jsxs("label", {
											className: "ocgq-check",
											children: [
												jsx("input", {
													type: "checkbox",
													checked: draft.showDiagnostics === true,
													disabled,
													onChange: event => update({ showDiagnostics: event.target.checked })
												}),
												jsxs("span", { children: [jsx("span", { children: t("config.showDiagnostics") })] })
											]
										})
									]
								}),
								jsxs("div", {
									className: "ocgq-sec-actions",
									children: [
										jsx("button", {
											type: "button",
											className: "ocgq-btn",
											disabled: disabled || !props.dirty,
											onClick: props.onSave,
											children: props.busy ? t("config.saving") : t("config.save")
										}),
										jsx("button", {
											type: "button",
											className: "ocgq-btn",
											disabled: disabled || !props.dirty,
											onClick: props.onDiscard,
											children: t("config.discard")
										}),
										jsx("button", {
											type: "button",
											className: "ocgq-btn",
											disabled: disabled,
											onClick: props.onTest,
											children: probe && probe.state === "busy" ? t("config.testing") : t("config.test")
										})
									]
								}),
								probe && probe.state === "ok"
									? jsx("p", { className: "ocgq-notice ocgq-notice-ok", children: t("config.testOk", { count: probe.count, ms: probe.latencyMs }) })
									: probe && probe.state === "error"
										? jsx("p", { className: "ocgq-notice ocgq-notice-error", children: t("config.testFail", { error: probe.error }) })
										: null,
								props.error ? jsx("p", { className: "ocgq-notice ocgq-notice-error", children: props.error }) : null,
								props.notice ? jsx("p", { className: "ocgq-notice ocgq-notice-ok", children: props.notice }) : null
							]
						})
				]
			});
		}

		/** Collapsible diagnostics dump. */
		function DiagnosticsCard(props) {
			const t = props.t;
			return jsxs("section", {
				className: "ocgq-sec",
				children: [
					jsxs("div", {
						className: "ocgq-sec-head",
						children: [
							jsxs("div", {
								children: [
									jsx("h3", { className: "ocgq-sec-title", children: t("diag.title") }),
									jsx("p", { className: "ocgq-sec-sub", children: t("diag.subtitle") })
								]
							}),
							jsx("div", {
								className: "ocgq-sec-actions",
								children: jsx("button", {
									type: "button",
									className: "ocgq-btn",
									onClick: props.onCopy,
									children: t("diag.copy")
								})
							})
						]
					}),
					jsx("pre", { className: "ocgq-diag", children: props.text }),
					props.notice ? jsx("p", { className: "ocgq-notice ocgq-notice-ok", children: props.notice }) : null
				]
			});
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
			const [models, setModels] = react.useState(null);
			const [modelsError, setModelsError] = react.useState(null);
			const [modelsBusy, setModelsBusy] = react.useState(true);
			const [modelsStamp, setModelsStamp] = react.useState(0);
			const [modelsOpen, setModelsOpen] = react.useState(true);
			const [modelQuery, setModelQuery] = react.useState("");
			const [configDraft, setConfigDraft] = react.useState(null);
			const [configBusy, setConfigBusy] = react.useState(false);
			const [configError, setConfigError] = react.useState(null);
			const [configNotice, setConfigNotice] = react.useState(null);
			const [probe, setProbe] = react.useState(null);
			const [diagNotice, setDiagNotice] = react.useState(null);
			const configDirty = react.useRef(false);
			const forceRefresh = react.useRef(false);
			const [, setTick] = react.useState(0);
			const id = react.useId();
			const config = keyStatus !== null && keyStatus.config && typeof keyStatus.config === "object" ? keyStatus.config : null;
			const refreshMs = config !== null && typeof config.refreshMs === "number" && config.refreshMs >= 15_000
				? config.refreshMs
				: 60_000;

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
				const timer = window.setInterval(load, refreshMs);
				return () => {
					alive = false;
					window.clearInterval(timer);
				};
			}, [stamp, refreshMs]);

			// Re-render twice a minute so the "resets in" countdown advances.
			react.useEffect(() => {
				const timer = window.setInterval(() => setTick((n) => n + 1), 30000);
				return () => window.clearInterval(timer);
			}, []);

			// Refresh the editable settings draft from the host unless the user
			// has unsaved edits. The serialized key avoids resetting the form on
			// every quota poll (the status object is new each response).
			const configKey = config === null
				? ""
				: [config.baseUrl, config.cacheMs, config.refreshMs, config.injectSessionHeader, config.showModels, config.showDiagnostics].join("\u0000");
			react.useEffect(() => {
				if (config === null || configDirty.current) return;
				setConfigDraft({
					baseUrl: config.baseUrl,
					cacheMs: config.cacheMs,
					refreshMs: config.refreshMs,
					injectSessionHeader: config.injectSessionHeader,
					showModels: config.showModels,
					showDiagnostics: config.showDiagnostics
				});
			}, [configKey]);

			// Model catalog: fetched separately from quota, cached host-side for
			// five minutes, and refreshed whenever the key or endpoint changes.
			const showModels = config === null || config.showModels !== false;
			react.useEffect(() => {
				if (keyStatus !== null && keyStatus.configured !== true) {
					setModels(null);
					setModelsError(null);
					setModelsBusy(false);
					return;
				}
				if (!keyStatus || !showModels) return;
				let alive = true;
				setModelsBusy(true);
				setModelsError(null);
				const url = MODELS_ROUTE + (modelsStamp > 0 ? "?refresh=1" : "");
				fetch(url, { cache: "no-store" })
					.then(async (res) => {
						const body = await res.json().catch(() => null);
						if (!alive) return;
						if (!res.ok || body === null || body.error) {
							setModelsError(String((body && body.error) || "HTTP " + res.status));
						} else {
							setModels(body);
							setModelsError(null);
						}
					})
					.catch((cause) => {
						if (alive) setModelsError(String((cause && cause.message) || cause));
					})
					.finally(() => {
						if (alive) setModelsBusy(false);
					});
				return () => { alive = false; };
			}, [keyStatus?.configured, keyStatus?.fingerprint, config?.showModels, config?.baseUrl, modelsStamp]);

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
					setModelsStamp((n) => n + 1);
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
					setModelsStamp((n) => n + 1);
				} catch (cause) {
					setKeyError(String((cause && cause.message) || cause));
				} finally {
					setKeySyncing(false);
				}
			};

			/** Stage one settings edit; the host is only written on Save. */
			const updateConfigDraft = (patch) => {
				configDirty.current = true;
				setConfigDraft(current => current === null ? current : { ...current, ...patch });
				setConfigError(null);
				setConfigNotice(null);
			};

			/** Drop local edits and restore the live host config. */
			const discardConfig = () => {
				configDirty.current = false;
				if (config !== null) {
					setConfigDraft({
						baseUrl: config.baseUrl,
						cacheMs: config.cacheMs,
						refreshMs: config.refreshMs,
						injectSessionHeader: config.injectSessionHeader,
						showModels: config.showModels,
						showDiagnostics: config.showDiagnostics
					});
				}
				setConfigError(null);
				setConfigNotice(null);
			};

			/** Persist only the changed fields through the plugin's own settings namespace. */
			const saveConfig = async () => {
				if (!configDraft || !keyStatus || !keyStatus.settingsNs) {
					setConfigError(t("config.unavailable"));
					return;
				}
				const baseUrl = String(configDraft.baseUrl || "").trim();
				let parsedUrl;
				try {
					parsedUrl = new URL(baseUrl);
				} catch {
					setConfigError(t("config.invalidUrl"));
					return;
				}
				if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
					setConfigError(t("config.invalidUrl"));
					return;
				}
				const refreshMs = Number(configDraft.refreshMs);
				const cacheMs = Number(configDraft.cacheMs);
				const ops = [];
				if (baseUrl !== config.baseUrl) ops.push({ op: "set", path: ["baseUrl"], value: baseUrl });
				if (refreshMs !== config.refreshMs) ops.push({ op: "set", path: ["refreshMs"], value: refreshMs });
				if (cacheMs !== config.cacheMs) ops.push({ op: "set", path: ["cacheMs"], value: cacheMs });
				if ((configDraft.injectSessionHeader === true) !== (config.injectSessionHeader === true)) {
					ops.push({ op: "set", path: ["injectSessionHeader"], value: configDraft.injectSessionHeader === true });
				}
				if ((configDraft.showModels !== false) !== (config.showModels !== false)) {
					ops.push({ op: "set", path: ["showModels"], value: configDraft.showModels !== false });
				}
				if ((configDraft.showDiagnostics === true) !== (config.showDiagnostics === true)) {
					ops.push({ op: "set", path: ["showDiagnostics"], value: configDraft.showDiagnostics === true });
				}
				if (ops.length === 0) {
					setConfigNotice(t("config.noChange"));
					return;
				}
				setConfigBusy(true);
				setConfigError(null);
				setConfigNotice(null);
				try {
					await mutatePluginSettings(keyStatus.settingsNs, ops, t);
					configDirty.current = false;
					setConfigNotice(t("config.saved"));
					forceRefresh.current = true;
					setStamp((n) => n + 1);
					setModelsStamp((n) => n + 1);
				} catch (cause) {
					setConfigError(t("config.failed", { error: String((cause && cause.message) || cause) }));
				} finally {
					setConfigBusy(false);
				}
			};

			/** Probe the current gateway/key with one uncached models request. */
			const testConnection = async () => {
				setProbe({ state: "busy" });
				try {
					const res = await fetch(MODELS_ROUTE + "?refresh=1", { cache: "no-store" });
					const body = await res.json().catch(() => null);
					if (!res.ok || body === null || body.error) {
						throw new Error(String((body && body.error) || "HTTP " + res.status));
					}
					const count = Array.isArray(body.models) ? body.models.length : 0;
					setModels(body);
					setModelsError(null);
					setProbe({ state: "ok", count, latencyMs: typeof body.latencyMs === "number" ? body.latencyMs : 0 });
				} catch (cause) {
					setProbe({ state: "error", error: String((cause && cause.message) || cause) });
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
			const diagnostics = {
				key: keyInfo === null ? null : {
					configured: keyInfo.configured,
					ref: keyInfo.ref,
					source: keyInfo.source,
					fingerprint: keyInfo.fingerprint,
					targetRef: keyInfo.targetRef,
					writable: keyInfo.writable,
					model: keyInfo.model,
					candidates: keyInfo.candidates
				},
				config: keyInfo === null ? null : keyInfo.config,
				defaultModel: keyInfo === null ? null : keyInfo.defaultModel,
				sessionHeader: data && data.sessionHeader ? data.sessionHeader : null,
				models: models === null ? null : {
					count: Array.isArray(models.models) ? models.models.length : 0,
					fetchedAt: models.fetchedAt,
					latencyMs: models.latencyMs
				}
			};
			const diagnosticsText = JSON.stringify(diagnostics, null, 2);
			const copyDiagnostics = async () => {
				const ok = await copyText(diagnosticsText);
				setDiagNotice(ok ? t("diag.copied") : t("diag.copyFailed"));
				window.setTimeout(() => setDiagNotice(null), 3000);
			};

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
					keyInfo !== null && keyInfo.fingerprint
						? jsx("p", { className: "ocgq-key-meta", children: t("key.fingerprint", { fp: keyInfo.fingerprint }) })
						: null,
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
					jsx("p", { className: "ocgq-key-help", children: t("key.manage") }),
					jsxs("div", {
						className: "ocgq-linkrow",
						children: [
							jsx("a", { className: "ocgq-link", href: "https://opencode.ai/console", target: "_blank", rel: "noreferrer", children: t("links.console") }),
							jsx("a", { className: "ocgq-link", href: "https://opencode.ai/v2/docs/console/go", target: "_blank", rel: "noreferrer", children: t("links.go") }),
							jsx("a", { className: "ocgq-link", href: "https://opencode.ai/status", target: "_blank", rel: "noreferrer", children: t("links.status") })
						]
					})
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
									jsxs("span", {
										className: "ocgq-sec-actions",
										children: [
											win && typeof win.status === "string" && win.status !== "ok"
												? jsx("span", { className: "ocgq-tag ocgq-tag-warn", children: t("quota.status", { status: win.status }) })
												: null,
											spec.hintKey ? jsx("span", { className: "ocgq-hint", children: t(spec.hintKey) }) : null
										]
									})
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
													: null,
												win.resetsAt
													? jsx("span", { className: "ocgq-reset", children: t("resetAt", { time: clock(win.resetsAt) }) })
													: null,
												jsx("span", { className: "ocgq-share", children: t(spec.shareKey) })
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
					showModels
						? jsx(ModelsCard, {
							t,
							models,
							error: modelsError,
							busy: modelsBusy,
							query: modelQuery,
							onQuery: setModelQuery,
							open: modelsOpen,
							onToggle: () => setModelsOpen(open => !open),
							onRefresh: () => setModelsStamp((n) => n + 1),
							defaultModel: keyInfo === null ? null : keyInfo.defaultModel,
							configured: keyInfo !== null && keyInfo.configured === true
						})
						: null,
					jsx(ConfigCard, {
						t,
						draft: configDraft,
						available: keyInfo !== null && keyInfo.settingsNs !== null && keyInfo.settingsNs !== undefined,
						dirty: configDirty.current,
						busy: configBusy,
						error: configError,
						notice: configNotice,
						probe,
						onEdit: updateConfigDraft,
						onSave: () => { void saveConfig(); },
						onDiscard: discardConfig,
						onTest: () => { void testConnection(); }
					}),
					config !== null && config.showDiagnostics === true
						? jsx(DiagnosticsCard, {
							t,
							text: diagnosticsText,
							onCopy: () => { void copyDiagnostics(); },
							notice: diagNotice
						})
						: null,
					jsx("div", { className: "ocgq-foot", children: t("foot", { seconds: Math.round(refreshMs / 1000) }) })
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
