# dsh-opencode-go-quota

在 **设置 → OpenCode GO** 里查看 OpenCode GO 套餐额度，不占用左侧栏。这是
[`@astervolans/dsh-opencode-go-usage`](https://github.com/Astervolans/dsh-opencode-go-usage)
的改造分支（上游又是 [yumusb/dsh-opencode-go-usage](https://github.com/yumusb/dsh-opencode-go-usage) 的 fork）。

## 与上游的差异

| | 上游 1.5.0 | 本分支 |
|---|---|---|
| 入口 | 侧栏底部常驻 widget（`sidebar.footer.action`） | **设置页**（`settings.section`），与 Command Code / Codex 的账户页同级 |
| 展示 | 三条进度条 + 时间条，收起为百分比徽标 | 三张额度卡：剩余百分比、进度条、已用比例、重置倒计时与绝对时间 |
| 侧栏占用 | 有 | **无**，不注册任何侧栏槽位 |
| 更新检查 | 读 npm registry | 已移除（本包走 git 分发） |
| 路由 / 命令 | `/opencode-go/usage`、`/opencode-go` | `/dsh-opencode-go-quota/usage`、`/opencode-go-quota`（可与上游并存不撞） |
| 会话头修复 | 有（`x-opencode-session`） | 保留 |

数据来源不变：host 端用你的 key 调官方 `GET https://opencode.ai/zen/go/v1/usage`，浏览器只访问同源代理，key 不进前端。

## 安装

先移除旧插件（避免设置页出现两份 OpenCode GO）：

```bash
dsh plugin --profile web remove @astervolans/dsh-opencode-go-usage
dsh plugin --profile web add github:zztdandan/dsh-opencode-go-quota
```

配置凭据（默认变量名，可在插件配置里改 `apiKeyEnv`）：

```yaml
# ~/.dsh/.credentials.yaml
OPENCODE_GO_API_KEY: sk-...
```

重启 dsh web，硬刷新浏览器。入口：**设置 → OpenCode GO**；对话里也可用 `/opencode-go-quota`。

> 版本门禁：`peerDependencies` 为 `@deepseek-ai/dsh >=0.1.7-rc.1 <0.3.0`，覆盖 0.2.1-rc.2。

## 配置

| 键 | 默认 | 说明 |
|---|---|---|
| `apiKeyEnv` | `OPENCODE_GO_API_KEY` | 凭据引用 / 环境变量名 |
| `baseUrl` | `https://opencode.ai/zen/go` | GO 网关地址 |
| `cacheMs` | `30000` | host 端上游缓存 TTL |
| `injectSessionHeader` | `true` | 为 GO 网关聊天请求注入 `x-opencode-session` |

## 验证边界

- 已做：`node --check` 语法检查；隔离 profile 中安装并启动，确认插件清单 active、`/dsh-opencode-go-quota/usage` 路由可达。
- 未做：真实 OpenCode GO key 的端到端出数、浏览器内视觉验收（本机当前没有 GO key）。
- 页面注册方式与已装的 Command Code / Codex 插件相同（`settings.section` + `ctx.locale` + `inject`），但 slot 行为仍需在真实宿主里目视确认。

## 回滚

```bash
dsh plugin --profile web remove dsh-opencode-go-quota
```

## License

MIT。原版权归 opencode-go-usage contributors；fork 说明见 [NOTICE](./NOTICE)。
