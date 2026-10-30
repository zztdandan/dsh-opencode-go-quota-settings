# 发布流程（master 提交 + 版本号触发）

本仓库的发布全部在 GitHub Actions 里完成，规则只有一条：**`package.json` 的 version 变成 npm 上还没有的版本，就发布；否则跳过。**

## 日常发布

```bash
npm version patch --no-git-tag-version   # 或 minor / 手改 package.json
git add package.json
git commit -m "chore: release v$(node -p "require('./package.json').version")"
git push origin master
```

推送后：

1. `CI` 跑 manifest 校验和 `npm pack --dry-run`。
2. `Release` 读取 `package.json` 的 `name@version`：
   - npm 上**没有**这个版本 → `npm publish --access public --provenance`，然后打 `v<version>` tag、创建 GitHub Release；
   - npm 上**已有**这个版本 → 只做校验，不重复发布（幂等）。
3. 失败时直接重跑 `Release`：已发布的版本会被跳过，不会重复发。

只想重跑发布、不改版本：Actions → Release → Run workflow（`workflow_dispatch`）。

## 认证

仓库已配置 `NPM_TOKEN` Actions secret（发布用）。两条路径都支持：

- **NPM_TOKEN**（当前）：granular token，需要 `Read and write (publish and stage)` 或 classic automation，并在过期前轮换；
- **Trusted publishing（推荐，无 token）**：在 npmjs.com → 包 → Settings → Trusted publishing 添加
  `zztdandan/dsh-opencode-go-quota-settings` + workflow `release.yml`，然后删除 `NPM_TOKEN` 也能发布。
  workflow 已声明 `id-token: write` 和 `--provenance`。

## 市场条目要不要每次发版都改？

不用。各市场按不同方式跟随：

| 渠道 | 跟随方式 |
|---|---|
| npm / dshbase / dshfind / dshplugin.store | 扫描 npm 版本或 GitHub `dsh-plugin` topic，自动更新 |
| dsh.so | 条目指向仓库，重新扫描时读取最新 manifest |
| 1024Store | 目录条目是静态 JSON（已合并），安装命令从 npm 读取，新版本自动生效 |
| DSH-Store | 上架时固定 commit；后续更新走它的 Catalog 巡检 |
| awesome-dsh-plugin | 条目是静态 YAML，只在改名/改描述时提 PR |

所以**每次发版只需要 bump 版本号**；市场列表不需要重复提交。
