# Changelog

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
