# 开发踩坑记录（DSH 插件 / dsh-go 适配）

> 这份文档记录本插件从「设置页只显示 7 个裸字段」一路改到「手机 App 里整页可用 + 模型开关」踩过的坑与验证方法。
> 全部结论都来自 2026-11-02 在本机 dsh-go（DSH 0.2.1-rc.4 / App 1.0.8 / 桥接 0.4.0）上的实测，属可复用经验，不含密钥与个人数据。
> 每条按「现象 → 原因 → 做法」写，方便直接照做。

---

## 一、界面与渲染路径

### 1. dsh-go 不渲染插件自写的网页 UI，它只有两条路

**现象**：插件网页设置页内容很全，但手机 App 里只出现一小截（像一堆原始字段名）。

**原因**：App 的 seams 层对 `settings.section` 槽位有两条路径：

- 插件在 `settings/describe` 里有 schema → `schema-config` 原生适配器接管，只按 `Config` 字段画表单；
- 否则 → 回落成**整页网页岛**（WebView），才显示插件自己的 `settings.section` 页面。

**做法**：想让 App 显示插件自有页面，必须让宿主的 schema-config 适配器「让位」：

```js
ctx.inject(["settings"], (settingsCtx) => {
  settingsCtx.effect(() => {
    const service = settingsCtx.get("settings");
    return service?.configure?.({ auto: false }, ctx.fiber) ?? (() => {});
  }, "own settings page");
});
```

Command Code provider 与 Prime Memory 都是这么做的，可直接对照。

### 2. `configure({ auto: false })` 必须放在 effect 里并返回 dispose

- 不返回 dispose：插件重载时会报 “Settings presentation is already configured for this plugin instance”。
- 用 `settingsCtx.get("settings")` 而不是外层 `ctx.settings`，否则在没有该服务的宿主上会直接抛错。
- 服务缺失时要静默跳过（`?? (() => {})`），否则老宿主上插件加载失败。

### 3. 关掉自动表单后必须保留 Config schema

`auto: false` 只影响「要不要生成表单」，**不影响 `settings/mutate`**。插件页面写配置仍然走：

```
settings.mutate(ns, ops, revision)
```

删掉 `Config` 或让它不可解析，页面就再也写不进设置了。

### 4. 光 `auto:false` 还不够：App 插件详情里仍可能出现重复的原生表单

**现象**：App 里同一个插件出现两个设置入口，一个原生表单、一个自带页面。

**原因**：插件详情页的「设置」还走桥接的 `/dsh-go/v1/plugin-config`，只看有没有 schema 字段，不看 `autoGenerate`。桥接不转发 `auto` 策略。

**做法**：把 `Config` 的每个字段都标 `.hidden()`，让 App 计算出的可见字段数为 0：

```js
export const Config = z.object({
  baseUrl: live(z.string().default(DEFAULT_BASE_URL).description("…").hidden()),
  // …
});
```

App 侧只要 `fieldCount == 0` 就不再列原生入口；而 `settings/mutate` 校验与写入**不受 hidden 影响**。

### 5. 原生状态条（composer strip）是最贵的位置，默认别占

**现象**：给插件加了「输入框上方一行额度」，用户明确要求删掉，因为输入区最稀缺，且本插件数据更新频率低。

**做法**：动态数据放进插件整页（设置页），需要一直可见的极低频信息再考虑 strip。不要用 strip 显示可下钻的报表类数据。

### 6. 原生面板/strip 注册容易静默失败

**坑 1**：`ctx.inject(['dshGo'], (nativeCtx) => { nativeCtx.strip(...) })` —— 回调参数是 **Context**，不是服务；应该 `nativeCtx.dshGo.strip(...)`。错误会被 inject 回调吞掉，`contributions` 里只剩 `ready:false`。

**坑 2**：`dshGo.contributes` 的 id **跨槽位全局唯一**。strip 叫 `quota`、panel 也叫 `quota` 会报 `duplicate-id`，整份清单校验失败。

**坑 3**：清单没写进 `dshGo` 也能注册成功，但 `live` 状态是 false，App 不显示。

**验证方式**（隔离实例上）：

```sh
curl -s -b cookie "http://127.0.0.1:PORT/dsh-go/v1/contributions?locale=zh" | python3 -m json.tool
curl -s -b cookie "http://127.0.0.1:PORT/dsh-go/v1/views/<pkg>/<panel>?locale=zh"
```

`live: true` 且 `data` 有值，才算真的能用。

### 7. 移动端布局要按「网页岛」重做，不是缩小桌面版

- 页面在手机上是整页 WebView，**560px 以下必须单列**，否则宽表格/网格溢出。
- 输入框要给固定高度（`height/min-height/max-height`），否则在某些 WebView 里被拉伸成巨大的框。
- 额度卡在手机上用 `repeat(3,minmax(0,1fr))` 横排，比一卡一行省一半屏。
- 长说明文字能删就删：App 里没有 hover、没有 tooltip，文字只会占屏。

---

## 二、密钥（secret）与凭据

### 8. 桥接不提供 secret 的凭据绑定，原生表单里的密钥格是死的

**现象**：`apiKey: role('secret')` 在 App 原生表单里显示「未设置 / 需插件适配后设置」，永远无法录入。

**原因**：桥接 `/dsh-go/v1/plugin-config` 的 `secrets[]` 只给 `{path, configured, writable}`，**不给 `credentialRef`**；App 拿不到绑定就直接判定 unbound（Command Code 的 apiKey 同样如此，属平台限制）。

**做法**：不要把密钥做成原生表单字段；改由插件自有页面里的密钥卡片写主机凭据服务，或引导用户去「设置 → 模型 → <服务商>」。**绝不允许**为了「看起来能填」把密钥降级成普通字符串（会明文落配置文档）。

### 9. 密钥同源，别让用户填两遍

本插件按 DSH 自己的路由解析 key：模型路由的 `apiKeyEnv` → pi-ai 登录凭据记录 → `OPENCODE_API_KEY` → 插件自己的兜底 ref。页面里的密钥卡片写的是**同一个凭据引用**，所以「设置 → 模型」与本页面互为等价入口。改密钥逻辑时先读 `inspectKey` 的解析顺序，别新造引用。

### 10. 引擎刚启动的几秒内会误报「未配置」

**现象**：重启引擎后立刻打开插件页，显示「未找到 API key」，刷新一下又好了。

**原因**：凭据存储在插件激活前后有一个很短的就绪窗口。

**做法**：客户端对「缺 key」类响应做 2–3 次退避重试（1.2s/2.4s），并在 App 回到前台（`visibilitychange`）时重读；不要在第一次响应就下结论。

---

## 三、模型目录与「模型开关」

### 11. 线上 `/v1/models` 与本地 pi-ai 目录会漂移

实测（2026-11-02）：线上 28 个模型，本机实际可服务的 24 个，另有 5 个已下线旧名仍在本地目录。写允许列表前必须确认「本机能不能服务」，否则配置校验会拒绝。

### 12. 限制模型要用 `llm-pi-ai` 的 `models` 列表，且必须同时清掉 `modelOverrides`

- 白名单写法：`providers.<route>.models = [{ id }]`（目录能描述该 provider 时，其余字段由目录补齐）。
- `models` 与 `modelOverrides` **不能共存**，写入时必须一起 `unset` 掉 `modelOverrides`。
- 恢复默认：`unset providers.<route>.models`（保留目录元数据，比写全量列表更干净）。
- 写之前要拿 revision：`ctx.settings.describe().find(r => r.ns === "llm-pi-ai")?.revision`，否则并发写会冲突。

### 13. 改完白名单，服务端目录会变，但 App 里的选择器不会自己刷新

**现象**：保存开关成功、`llm.listModels` 返回的数量确实变少了，但对话里的模型选择器还是旧列表。

**原因**：App 的 `session/modelCatalog` 有客户端缓存，只在特定事件后重拉。

**做法**：写入成功后主动发一次事件：

```js
ctx.emit("llm/adapters-updated");
```

App 的 `models_state.dart` 就是监听它（以及窗口内 `settings/document-updated` 的 `llm-pi-ai` 命名空间）来失效目录缓存的。提示文案也要给出可核对的数量（「现在提供 N 个模型」），否则用户无法判断是没生效还是缓存。

### 14. 服务注入：`ctx.get('llm')` 拿不到方法，`resolveModel` 不在公开面上

- Cordis 4 里 `ctx.get(name)` 没有声明 inject 时拿不到服务；把需要的服务加进静态 `inject` 列表：`["webServer", "commands", "credentials", "llm", "settings"]`。
- `ctx.llm.resolveModel` 在本版本不可用（Typert 代理只暴露部分方法）；要用模型清单请用 `await ctx.llm.listModels(route)`。
- `listModels` 反映的是「当前可服务」集合，白名单生效后它就只剩启用的那些——所以「全量目录」要另取（线上接口），不能只靠它。

---

## 四、本地开发与验证

### 15. 起隔离实例的命令行顺序有讲究

```sh
dsh --profile web --patch /etc/dsh-app/dsh-web.patch.yml \
    --host 127.0.0.1 --port 3100 --no-open
```

`--patch` 是**启动器**参数，放在 `web` 后面不解析（`dsh web --patch` 会报 unknown option）。验证桥接接口时还要带上 App 的整套 patch，才能复现手机端行为。

### 16. 桥接接口需要 cookie，不是 Bearer

```sh
curl -s -c ck.txt "http://127.0.0.1:PORT/?token=<启动时打印的 token>" -o /dev/null
curl -s -b ck.txt "http://127.0.0.1:PORT/dsh-go/v1/plugin-config"
```

直接用 `?token=` 或 `Authorization: Bearer` 都是 401。

### 17. 本地目录安装（link）会丢 peer 依赖

`dsh plugin --profile web add <本地目录>` 是 pnpm link：包内 `import "@deepseek-ai/schemastery"` 会解析失败（真实路径在 workspace，不在 profile 的 node_modules）。两种可靠做法：

- `npm pack` 出 tarball 再装（等价于发布产物，顺带验证 `files` 字段）；
- 或临时在包目录里 `mkdir -p node_modules/@deepseek-ai && ln -s <profile>/node_modules/@deepseek-ai/schemastery ...`（仅本地调试，别提交）。

### 18. `pkill -f "port 3081"` 会把自己杀掉

后台实例的命令行里也含这个字符串，`pkill -f` 会匹配到当前 shell，整条命令被 SIGTERM。安全写法：

```sh
P="30""81"; for pid in $(pgrep -f "port $P"); do kill $pid 2>/dev/null; done
```

### 19. 测试写入会落在用户的 profile 里

`settings.mutate` 写的是 profile 的用户层 patch（`~/.dsh/profiles/<name>/cordis.patch.yml`）。每次测试前备份、测试后还原并 diff 验证：

```sh
cp cordis.patch.yml /tmp/patch-before.yml
# …测试…
diff <(sed -n '/id: llm-pi-ai/,/^[^ ]/p' /tmp/patch-before.yml) \
     <(sed -n '/id: llm-pi-ai/,/^[^ ]/p' ~/.dsh/profiles/web/cordis.patch.yml)
```

### 20. GitHub 网络不稳时的取证办法

- `git clone` 大仓库经常 `early EOF`；用 `gh api repos/<o>/<r>/contents/<path> -H "Accept: application/vnd.github.raw"` 单文件取。
- `raw.githubusercontent.com` 会 exit 56；`gh api .../git/trees/HEAD?recursive=1` 先列路径再逐文件取更稳。
- `gh run watch` 也可能超时；等待发布时直接用 npm 注册表探测更可靠：

```sh
curl -s -o /dev/null -w "%{http_code}" "https://registry.npmjs.org/<pkg>/<version>?x=$RANDOM"
```

### 21. 发布后 npm 不会立刻可安装

Release 工作流显示 success，但 `npm view` / 安装仍可能 404 数分钟（注册表传播）。用上面带随机参数的探测轮询，别急着判断发布失败。

### 22. 发布流程本身

版本号一改、推到 master，Release 工作流就用 trusted publishing 发 npm（本地不需要 `npm adduser`）。只改文档、不动版本号时工作流会跳过发布，也不会产生新 tag——适合纯文档提交。

---

## 五、清单与元数据

### 23. 插件在 App 里的名字来自 locale，不来自包名

`package.json` 增加：

```json
"exports": { "./locale/*.json": "./locale/*.json" }
```

并放 `locale/zh.json`、`locale/en.json`：

```json
{ "meta": { "title": "OpenCode GO 额度", "description": "…" } }
```

否则 App 列表里显示的是 `dsh-opencode-go-quota-settings` 这样的包名。

### 24. schema 的 description 就是 App 里的字段标题

App 的 `SchemaMeta` 不支持 `i18n`，只认单语言的 `description`：不超过 18 字当标题，更长时把开头的中文短句当标题、其余当提示。所以写法固定为「短标题。一句话说明。」——按用户当前语言写中文即可。

### 25. `settings.models.provider-card` 这类槽位在 App 里只是「去网页版」的链接

未显式声明策略的槽位默认 `SeatPolicy.other`（webLink only），别指望第三方 provider card 能在原生界面展示数据。要原生展示只有两条路：dshGo 清单（strip/panel）或整页岛。

---

## 六、给后来者的最小检查清单

发布前按顺序过一遍：

1. `node scripts/validate.mjs` 通过；
2. 隔离实例里插件 `state: active`、label 是本地化名称；
3. `/dsh-go/v1/plugin-config/<id>` 的字段、`hidden`、`secrets` 符合预期；
4. 页面接口（usage/models）返回真实数据，缺 key 时是「人话」报错；
5. 保存类操作有 revision 校验、成功后清理缓存、测试后还原 profile；
6. 手机上打开一次：整页岛是否出现、布局是否单列、输入框高度是否正常；
7. 版本号变化后再推 master，等 npm 可解析再装回本机。
