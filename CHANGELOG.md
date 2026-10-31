# Changelog

## 0.3.0

- **Model catalog in Settings.** Read the official Go `GET /v1/models` through
  the host proxy and show context/output limits, modalities, tool/reasoning
  capabilities, per-1M prices, peak multipliers, and protocols. Search, sort the
  DSH default model first, and refresh manually; the host caches the catalog for
  five minutes and invalidates it when the key or endpoint changes.
- **Connection & refresh card.** Edit the gateway URL, auto-refresh interval,
  host cache TTL, `x-opencode-session` injection, and whether the model and
  diagnostics cards are shown. The card writes this plugin's own settings via
  `settings/mutate`, matching the Plugins form, and applies live.
- **Key fingerprint and console links.** Show a short SHA-256 fingerprint so
  the quota key can be compared with the model key without exposing either
  literal, plus links to the Console, Go docs, and status page.
- **Diagnostics card.** Optional troubleshooting snapshot for the key source,
  model route, session-header counters, and the last `llm/stream`; copyable as
  JSON and never containing the key literal.
- **Quota cards** now show the window's share of the monthly allowance and the
  absolute reset time alongside the countdown, and surface non-`ok` statuses.
- **Live session-header switch.** The fetch wrapper is installed once and the
  `llm/stream` handler checks the current setting per call, so the toggle works
  without re-applying the plugin.

## 0.2.1

- Add a **Sync to Models** action for an already-configured key whose model
  route is not bound yet (for example a `OPENCODE_GO_API_KEY` left by an older
  version, or a DSH sign-in record). It only writes
  `providers.<route>.apiKeyEnv`; the credential itself is untouched, so the
  user does not have to paste the key again.

## 0.2.0

- **Reuse the OpenCode GO key DSH already has.** The quota host resolves the
  same key the live `opencode-go` model route uses, in the model's own order:
  the profile's `apiKeyEnv`, the `llm-pi-ai/opencode-go` sign-in record, pi-ai's
  native `OPENCODE_API_KEY`, then this plugin's fallback `apiKeyEnv`.
  No second copy of the key is required.
- **Configure the key in Settings → OpenCode GO.** The new API-key card writes
  through the official credentials remote, to the same reference the model
  route uses. When the route has no key reference yet, it adds
  `providers.<route>.apiKeyEnv` through `settings/mutate` — the same write the
  Models page performs — and creates the OpenCode GO provider on first use.
- Saving a key (or pressing Refresh) now bypasses the host quota cache, and the
  cache is keyed by the resolved key so a changed key is observed immediately.
- `/dsh-opencode-go-quota-settings/usage` also returns a secret-free key-status
  snapshot for the settings page.
- Documentation and the settings screenshot were updated.
