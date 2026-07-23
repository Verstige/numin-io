# Munroe Desktop + Local Daemon — Hermes Reuse Audit

**Date:** 2026-07-23
**Scope:** Fastest path to a Munroe-owned desktop app + local daemon using the
*installed* Hermes runtime as the engine. No provider/runtime names on customer
surfaces. Read-only — no files modified.

---

## Executive Summary

The installed Hermes stack at `/Users/julylan/.hermes/hermes-agent/` already
solves the hard problems Munroe needs (cross-platform Electron shell, headless
JSON-RPC backend, credentialed WebSocket transport, model/skills/memory
plumbing). The fastest Munroe-desktop path is **NOT to fork the runtime** —
it is to consume it **as-is** through its existing, public transport
(`hermes serve` + `/api/ws` + JSON-RPC), and rebrand the renderer + CLI
shells.

- **Engine:** Hermes Agent v0.17.0 running headless via `hermes serve --host 127.0.0.1 --port 0`.
- **Transport:** JSON-RPC over WebSocket at `/api/ws` (auth: `?token=` loopback
  or `?ticket=` for OAuth-gated modes).
- **Renderer:** reuse Hermes Desktop's Electron + React + Vite stack at
  `apps/desktop/` — focus changes on **branding, copy, and (optionally) a
  hardened surface subset**.
- **CLI:** the existing `munroe-code-cli` already shells out to the Hermes
  binary — its `runtime.js` builds the right invocations and the
  `buildRuntimeInvocation()` already injects `HERMES_SESSION_SOURCE=munroe-code`
  and `MUNROE_PRODUCT=Munroe Code`.

**TL;DR the cleanest split:**

| Layer | Munroe-owned | Consumes Hermes |
|---|---|---|
| **CLI shell** (`munroe`) | yes — already shipped | invokes Hermes binary via `buildRuntimeInvocation` |
| **Desktop window** (Electron + React) | yes — fork of `apps/desktop/` | `hermes serve` + `JsonRpcGatewayClient` over `/api/ws` |
| **Local daemon** | none — reuse Hermes | `hermes serve` running as a child process |
| **Agent / tools / skills / memory** | none — reuse | the entire `hermes-agent/` Python package |

---

## 1. What exists today

### 1.1 Hermes Desktop (Electron) — `apps/desktop/`

**Layout (under `/Users/julylan/.hermes/hermes-agent/apps/desktop/`):**

```
electron/
  main.cjs                 290 KB — backend spawn, window mgmt, IPC, updates
  preload.cjs              13 KB  — contextBridge API: `window.hermesDesktop`
  backend-command.cjs      2 KB   — `serve` / `dashboard --no-open` routing
  backend-env.cjs          3 KB   — PATH / PYTHONPATH composition for the child
  backend-probes.cjs       4 KB   — pre-flight HTTP / status checks
  backend-ready.cjs        5 KB   — waits for `HERMES_BACKEND_READY port=N`
  bootstrap-runner.cjs     24 KB  — first-launch install orchestration
  connection-config.cjs    10 KB  — remote-gateway URL normalization
  gateway-ws-probe.cjs     6 KB   — WS upgrade probe (post-handshake sanity)
  dashboard-token.cjs      3 KB   — local session token plumbing
  hardening.cjs            8 KB   — sandbox / origin / CSP guards
  ...
src/
  main.tsx, styles.css, app/, components/, hooks/, i18n/, lib/, store/, themes/
  hermes.ts                38 KB  — the renderer-side facade
  global.d.ts              25 KB  — typed `window.hermesDesktop` surface
  lib/                     (100+ files) — bootstrap, IPC, model picker, etc.
public/                    built via `vite build`
dist/                      production render bundle
release/                   electron-builder output
scripts/                   build-stamp, assert-*, run-electron-builder, etc.
package.json               "hermes" productName, version 0.17.0
```

**Build pipeline (already tested):**

- `npm run dev` — Vite renderer on 127.0.0.1:5174 + Electron with HMR
- `npm run build` — TS + Vite + native-deps staging
- `npm run dist:mac|dist:win|dist:linux` — electron-builder DMG/NSIS/MSI/AppImage/deb/rpm
- `npm run test:desktop` — unit tests (pure .cjs helpers, no Electron required)

### 1.2 Hermes Backend — `hermes serve`

**Source:** `hermes_cli/subcommands/dashboard.py` (`serve` registered alongside
`dashboard`; both route to `cmd_dashboard` → `web_server.start_server`).

**Spawn command (exactly what the desktop uses today, `electron/main.cjs:5359`):**

```bash
hermes --profile <name?> serve --host 127.0.0.1 --port 0
```

- `--port 0` → OS-assigned ephemeral port; the child announces
  `HERMES_BACKEND_READY port=<N>` on stdout (parser: `backend-ready.cjs`).
- `headless_backend=True` is set by `serve` — the server **skips the web UI
  build**, exposes only JSON-RPC + REST, never opens a browser.
- `serve` is the canonical name; older runtimes (<= 0.15.x) only know
  `dashboard --no-open` — `backend-command.cjs` keeps a fallback detector
  (`sourceDeclaresServe` greps `add_parser("serve"`) so a mid-upgrade install
  never breaks.

**Auth modes (loopback is the default for desktop):**

- **Loopback `?token=` (local spawn):** the server mints a session token at
  boot; the desktop reads it via `HERMES_DESKTOP_READY_FILE` (file path env
  var) and the main process injects it into the renderer's preload. The
  renderer builds `ws://127.0.0.1:<port>/api/ws?token=<token>` via
  `buildHermesWebSocketUrl` in `apps/shared/src/websocket-url.ts`.
- **OAuth-gated `?ticket=` (remote / hosted):** server requires a fresh
  single-use ticket (`POST /api/auth/ws-ticket`, 30s TTL). Desktop mints via
  `getGatewayWsUrl` IPC and `resolveGatewayWsUrl` handles token-vs-ticket
  coercion. Not relevant for Munroe unless a user explicitly points at a
  hosted gateway.

**Endpoints (from `hermes_cli/web_server.py`):**

| Endpoint | Purpose |
|---|---|
| `GET /api/status` | server liveness, profiles, gateway state, auth_required flag |
| `WS /api/ws` | JSON-RPC gateway — the full Hermessurface |
| `WS /api/pty` | PTY bridge for the embedded chat (xterm.js) |
| `WS /api/pub` / `WS /api/events` | chat-tab event broadcast sidecar |
| `WS /api/console` | console WS (debug surface) |
| `POST /api/auth/ws-ticket` | mint single-use WS ticket (OAuth mode) |
| `POST /api/auth/ws-ticket/internal` | internal credential (server-spawned) |

**JSON-RPC method surface (from `tui_gateway/server.py` — 110+ methods):**

The renderer-facing `JsonRpcGatewayClient` speaks ~110 methods. The minimum
needed for a Munroe-branded coding agent:

| Category | Methods |
|---|---|
| Session lifecycle | `session.create`, `session.list`, `session.most_recent`, `session.resume`, `session.active_list`, `session.activate`, `session.delete`, `session.title`, `session.cwd.set`, `session.close`, `session.branch`, `session.status`, `session.history`, `session.usage`, `session.context_breakdown`, `session.save`, `session.undo`, `session.compress`, `session.interrupt`, `session.steer` |
| LLM | `llm.oneshot`, `prompt.submit`, `prompt.background`, `model.options`, `model.save_key`, `model.disconnect`, `complete.path`, `complete.slash` |
| Attachments | `file.attach`, `image.attach`, `image.attach_bytes`, `pdf.attach`, `clipboard.paste`, `image.detach`, `input.detect_drop` |
| Response flows | `clarify.respond`, `approval.respond`, `sudo.respond`, `secret.respond`, `terminal.read.respond` |
| Agent events | `message.start`, `message.delta`, `message.complete`, `thinking.delta`, `reasoning.delta`, `reasoning.available`, `tool.start`, `tool.progress`, `tool.complete`, `tool.generating`, `status.update`, `clarify.request`, `approval.request`, `sudo.request`, `secret.request`, `background.complete`, `error`, `gateway.ready`, `session.info` |
| Config / setup | `config.get`, `config.set`, `setup.status`, `setup.runtime_check`, `project.facts`, `verification.status`, `projects.discover_repos`, `projects.record_repos`, `projects.tree`, `projects.project_sessions` |
| Process | `process.stop`, `process.list`, `process.kill`, `reload.mcp`, `reload.env` |
| Commands | `commands.catalog`, `cli.exec`, `command.resolve`, `command.dispatch`, `slash.exec` |
| Preview | `preview.restart`, `paste.collapse` |
| Profile / settings | `profile.*` (via IPC), `config.get`, `config.set` |
| Insights / rollback | `insights.get`, `rollback.list`, `rollback.restore` |
| Voice | `voice.toggle`, `voice.record`, `voice.tts` |
| Billing | `credits.view`, `billing.state`, `billing.charge`, `billing.charge_status`, `billing.auto_reload`, `billing.step_up` |
| Delegation | `delegation.status`, `delegation.pause`, `subagent.interrupt`, `spawn_tree.save/list/load`, `handoff.request`, `handoff.state`, `handoff.fail` |
| Pet (decoration) | `pet.*` — 20+ methods for the desktop mascot/pet overlay (skip in Munroe) |

**Wire protocol (newline-delimited JSON-RPC 2.0):**

```json
// request
{"jsonrpc":"2.0","id":"r1","method":"session.create","params":{"close_on_disconnect":true,"source":"tool","profile":"munroe"}}

// response
{"jsonrpc":"2.0","id":"r1","result":{"session_id":"..."}}

// event (no id, method="event")
{"jsonrpc":"2.0","method":"event","params":{"type":"message.delta","session_id":"...","payload":{"delta":"..."}}}
```

Per-token frames (`message.delta`, `reasoning.delta`, `thinking.delta`) are
coalesced (~30 fps); non-streaming frames flush the buffer ahead of themselves
to preserve order. See `tui_gateway/ws.py` `_TOKEN_COALESCE_S = 0.033`.

### 1.3 The shared IPC client — `apps/shared/`

`apps/shared/src/` exports exactly two files:

- `json-rpc-gateway.ts` — `JsonRpcGatewayClient` (350 LOC, fully tested):
  - `connect(wsUrl)`, `close()`, `request<T>(method, params, timeoutMs, signal)`
  - `on(type, handler)`, `onAny(handler)`, `onState(handler)`
  - `connectionState` (`idle | connecting | open | closed | error`)
  - Reconnect-aware: 15s connect timeout, 120s default request timeout,
    promise-style resolves on `requestId` match.
- `websocket-url.ts` — `buildHermesWebSocketUrl`, `resolveGatewayWsUrl`,
  `GatewayReauthRequiredError`, `isGatewayReauthRequired` (the OAuth
  refresh-on-ticket-failure path).

**This is the contract Munroe's renderer speaks.** No alternative IPC — the
desktop and the web dashboard both use this client.

### 1.4 The desktop main-process IPC bridge — `electron/preload.cjs`

`window.hermesDesktop` exposes 100+ IPC methods via `contextBridge`. The ones
relevant to Munroe customization:

| Category | Surface |
|---|---|
| Connection | `getConnection`, `revalidateConnection`, `touchBackend`, `getGatewayWsUrl`, `getConnectionConfig`, `saveConnectionConfig`, `applyConnectionConfig`, `testConnectionConfig`, `probeConnectionConfig`, `oauthLoginConnectionConfig`, `oauthLogoutConnectionConfig` |
| Profile | `profile.get`, `profile.set` |
| Backend | `getBootProgress`, `getBootstrapState`, `onBootstrapEvent`, `getVersion`, `getRemoteDisplayReason`, `onBackendExit` |
| API proxy | `api(request)` (generic IPC pass-through to the gateway) |
| Generic | `notify`, `requestMicrophoneAccess`, `readFileDataUrl`, `readFileText`, `selectPaths`, `writeClipboard`, `openExternal`, `openPreviewInBrowser`, `fetchLinkTitle`, `sanitizeWorkspaceCwd`, `revealLogs`, `getRecentLogs`, `revealPath` |
| FS | `readDir`, `gitRoot`, `renamePath`, `writeTextFile`, `trashPath` |
| Git | `git.worktreeList/Add/Remove`, `git.branchSwitch/List`, `git.repoStatus`, `git.fileDiff`, `git.scanRepos`, `git.review.*` (list/diff/stage/unstage/revert/revParse/commit/commitContext/push/shipInfo/createPr) |
| Terminal (xterm) | `terminal.start`, `terminal.write`, `terminal.resize`, `terminal.dispose`, `terminal.onData`, `terminal.onExit` |
| Theme | `themes.fetchMarketplace`, `themes.searchMarketplace` |
| Settings | `settings.getDefaultProjectDir`, `settings.setDefaultProjectDir`, `settings.pickDefaultProjectDir` |
| Updates | `updates.check`, `updates.apply`, `updates.getBranch`, `updates.setBranch`, `updates.onProgress` |
| Zoom | `zoom.get`, `zoom.setPercent`, `zoom.onChanged` |
| Pet overlay | `petOverlay.*` (drop entirely for Munroe, or rebrand) |
| Notifications | `onNotificationAction`, `onClosePreviewRequested`, `onOpenUpdatesRequested`, `onDeepLink`, `signalDeepLinkReady`, `onWindowStateChanged`, `onFocusSession`, `onPreviewFileChanged`, `onPowerResume` |
| Uninstall | `uninstall.summary`, `uninstall.run` |

The `api(request)` method is the master pass-through — it carries
`{method, params, profile}` to the main process, which then forwards it as a
JSON-RPC call to the gateway. **This is what the renderer uses for every
session/LLM call.** Wiring Munroe UI logic is mostly a matter of routing
through `api()` and rendering the events back.

### 1.5 The Munroe CLI — `/Users/julylan/Projects/Numin/munroe-code-cli/`

Three files + a bin entry:

```
bin/munroe.js               #!/usr/bin/env node → main()
src/
  cli.js      6.7 KB        main(); munroe / init / resume / status / model / permissions / doctor
  config.js   2.7 KB        .munroe/ project state, schema validation
  runtime.js  3.7 KB        findRuntime(); buildRuntimeInvocation(); resolveModelPolicy()
test/                        node --test
package.json "@munroe/code" 0.1.0
```

**What `runtime.js` already gets right** (re: white-label):

- `--skills numin-saas-rebuild` — pins one Munroe-owned skill (sit at parity
  with the rest of the agent runtime).
- `HERMES_SESSION_SOURCE=munroe-code` — visible in session headers.
- `MUNROE_PRODUCT=Munroe Code` — env var the renderer could surface.
- Model policy is mapped to provider-neutral labels
  (`Munroe Auto`, `Munroe Core`, `Munroe Kimi`).
- The system prompt explicitly says: *"Never expose or discuss internal
  runtime or model-provider brands in the user-facing response. Refer to
  yourself and the product only as Munroe or Munroe Code."*

**Gap:** the CLI is currently `stdio: 'inherit'`-attached to the runtime, so
the user sees Hermes' TUI directly. That's the *fastest* path to a working
`munroe` command, but it ships the Hermes CLI surface verbatim — it is the
**largest white-label risk** in the current setup.

---

## 2. The fastest-clean architecture

### 2.1 Recommended split

```
┌───────────────────────────────────────────────────────────────┐
│  Munroe Desktop (Electron + React) — Munroe-owned fork       │
│                                                               │
│  Render:  apps/desktop/src/  (rebrand + optional surface cut) │
│  Main:    apps/desktop/electron/  (rebrand, spawn 'munroe')   │
│  Bin:     package.json "productName": "Munroe"                │
│  Build:   npm run dist:mac|win|linux  (electron-builder)      │
└───────────────────────────────────────────────────────────────┘
                              │  WebSocket JSON-RPC
                              │  ws://127.0.0.1:<ephemeral>/api/ws?token=...
                              ▼
┌───────────────────────────────────────────────────────────────┐
│  Local daemon — NOT a separate process                        │
│                                                               │
│  Hermes runtime (already installed at ~/.hermes/hermes-agent)│
│  $ munroe serve --host 127.0.0.1 --port 0  ← spawned by main  │
│                                                               │
│  - HEADLESS: skips web UI build                               │
│  - Reuses whole agent stack (tools, skills, memory, sessions) │
│  - Stays the same code path the CLI uses today                │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 Why this is fast

| Concern | Already solved by | Cost in Munroe |
|---|---|---|
| Cross-platform packaging (DMG/NSIS/MSI/AppImage/deb/rpm) | `electron-builder` (`npm run dist:*`) | zero |
| Backend spawn / lifecycle / log capture | `electron/main.cjs` + `backend-ready.cjs` | rebrand `hermes` → `munroe` |
| Loopback auth token | `electron/dashboard-token.cjs` + ready-file pattern | zero |
| WS transport + JSON-RPC + reconnection | `apps/shared/src/json-rpc-gateway.ts` | zero |
| Renderer shell (chat, code, terminal, file browser, git, voice) | `apps/desktop/src/` | rebrand + locale strings |
| Per-token streaming with coalescing | `tui_gateway/ws.py` | zero |
| Skills / memory / sessions / subagents | the agent runtime | zero |
| Updates | `electron/update-*.cjs` + `npm run dist` | rebrand |

**Minimum new code for a Munroe-branded desktop app, day 1:**

- Fork `apps/desktop/` into `/Users/julylan/Projects/Numin/munroe-desktop/`.
- Rewrite `package.json`: `name: "@munroe/desktop"`, `productName: "Munroe"`,
  `version: "0.1.0"`, `description: "Munroe — agentic software workspace"`.
- Update `src/hermes.ts` and `src/store/*` exposed names:
  - `hermesDesktop` → `munroe`
  - `HERMES_DESKTOP_*` env vars → `MUNROE_DESKTOP_*` (in `electron/main.cjs`)
  - `HERMES_HOME` default → `~/.munroe` (or reuse `~/.hermes` for storage but
    brand as "Munroe home")
- Replace `brand` strings + i18n in `src/styles.css`, `src/main.tsx`,
  `src/i18n/`, `assets/`, `themes/`, `pr-assets/`.
- In `electron/main.cjs` change the backend invocation from
  `hermes serve --host 127.0.0.1 --port 0` to
  `munroe serve --host 127.0.0.1 --port 0` (alias shim — see §2.4).
- Update entitlements (`electron/entitlements.mac.plist`):
  `com.nousresearch.hermes` → `com.munroe.app`.
- Update deep-link scheme, file association, installer name, icon.

**Estimated:** 2-3 days for a developer familiar with the codebase. The
renderer frontend stays ~80% intact; the IPC bridge stays 100% intact.

### 2.3 The CLI stays

The existing `munroe-code-cli` already wraps the Hermes runtime and injects
Munroe's branding (`HERMES_SESSION_SOURCE=munroe-code`, `MUNROE_PRODUCT`,
custom skills, custom system prompt). It is the right path for terminal
users. The desktop app is the extension, not a replacement.

**Strangler pattern (recommended):**

1. Ship `munroe-code-cli@0.1` as-is. Terminal users already get a Munroe-branded
   experience because the system prompt and skill loading rebadge the agent.
2. Add `munroe-code-cli desktop` that invokes the new desktop binary (same
   pattern as `hermes desktop`).
3. The desktop binary spawns `munroe serve` (a thin wrapper over `hermes serve`
   that exports `MUNROE_PRODUCT=Munroe Code` and the right skills).

### 2.4 The "munroe serve" wrapper

Two clean options:

**Option A — `munroe` shim on PATH (recommended for v1):**

```bash
#!/usr/bin/env bash
# /usr/local/bin/munroe
exec env \
  MUNROE_PRODUCT="Munroe Code" \
  HERMES_SESSION_SOURCE=munroe-code \
  HERMES_SKILLS_OVERRIDE=numin-saas-rebuild \
  hermes "$@"
```

This keeps the runtime Hermes-internal (no fork of `hermes-agent/`) and lets
the desktop spawn the same engine as the CLI. The `serve` flag falls through
to `hermes serve` with everything wired correctly.

**Option B — fork the CLI entrypoint:**

Extend `munroe-code-cli/src/cli.js` so `munroe serve` is a first-class
subcommand that re-execs `hermes serve` with the right env, and `munroe
desktop` builds/launches the desktop binary. This is the eventual right
shape but more code.

---

## 3. Exact endpoints / IPC patterns

### 3.1 Backend spawn (from `electron/main.cjs:5359`)

```js
const backendArgs = ['--profile', profile, 'serve', '--host', '127.0.0.1', '--port', '0']
```

Plus from `electron/backend-env.cjs:buildDesktopBackendEnv`:

```js
{
  PYTHONPATH: '${hermesHome}/hermes-agent:${hermesHome}/hermes-agent/hermes_cli:...',
  PATH: '${hermesHome}/node/bin:${hermesHome}/venv/bin:/usr/local/bin:/usr/bin:/bin'
}
```

Plus from `electron/main.cjs:5385-5387`:

```js
env.HERMES_DESKTOP = '1'
env.HERMES_DESKTOP_READY_FILE = readyFile  // file the child writes with the token
```

**Ready parsing** (`electron/backend-ready.cjs`):

```js
const _READY_RE = /^HERMES_(?:BACKEND|DASHBOARD)_READY port=(\d+)/m
// Waits up to 90s (clamped to 45s minimum) on the child's stdout for:
//   HERMES_BACKEND_READY port=54321
```

### 3.2 Renderer → gateway (the only transport)

```ts
import { JsonRpcGatewayClient, buildHermesWebSocketUrl } from '@hermes/shared'

const ws = buildHermesWebSocketUrl({
  path: '/api/ws',
  // basePath: '' — default for local spawn
  authParam: ['token', sessionToken],
})
const client = new JsonRpcGatewayClient()
await client.connect(ws)

// Fire-and-await RPC
const { session_id } = await client.request<{ session_id: string }>(
  'session.create',
  { close_on_disconnect: true, source: 'tool', profile: 'munroe' }
)

// Stream events
const unsubscribe = client.on('message.delta', (event) => {
  if (event.session_id === session_id) {
    appendToCurrentMessage(event.payload.delta)
  }
})

// Cleanup
client.close()
```

Reconnection: `JsonRpcGatewayClient` exposes `connectionState` for UI badges
(`idle | connecting | open | closed | error`); the desktop layer wraps it with
exponential-backoff retry (the `pet/` install pattern in `apps/desktop/src/`
already does this).

### 3.3 Main ↔ renderer (preload bridge)

The renderer's `window.hermesDesktop.api(request)` is the universal
pass-through:

```ts
const result = await window.hermesDesktop.api({
  method: 'session.create',
  params: { close_on_disconnect: true, source: 'tool' },
  profile: 'munroe',
})
```

The main process proxies this to the gateway as JSON-RPC. Anything not in the
preload's bespoke surface (notification, FS, git, terminal, etc.) can go
through here.

### 3.4 HTTP endpoints (renderer-direct over loopback)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/status?profile=<name>` | liveness, gateway state, auth_required, session counts |
| POST | `/api/auth/ws-ticket` | mint OAuth ticket (not needed for loopback) |

The renderer does NOT call REST directly — it goes through `window.hermesDesktop.api()`.
The main process owns the `X-Hermes-Session-Token` header.

### 3.5 WS event vocabulary

The renderer subscribes to events via `client.on(type, handler)`. The full
list is in `apps/shared/src/json-rpc-gateway.ts:GatewayEventName`:

```ts
'gateway.ready' | 'session.info'
| 'message.start' | 'message.delta' | 'message.complete'
| 'thinking.delta' | 'reasoning.delta' | 'reasoning.available'
| 'status.update'
| 'tool.start' | 'tool.progress' | 'tool.complete' | 'tool.generating'
| 'clarify.request' | 'approval.request' | 'sudo.request' | 'secret.request'
| 'background.complete' | 'error' | 'skin.changed'
```

Higher-level events (`session.info`, `gateway.ready`) carry the session +
backend state needed for the UI. The streaming events
(`message.delta`, `reasoning.delta`, `thinking.delta`) are coalesced at
~30 fps by the server.

---

## 4. Minimum files

To produce a working Munroe-branded desktop app (Day 1):

### 4.1 New repo: `/Users/julylan/Projects/Numin/munroe-desktop/`

```
munroe-desktop/
  package.json                 # productName: "Munroe", name: "@munroe/desktop"
  README.md
  tsconfig.json
  vite.config.ts
  index.html
  eslint.config.mjs
  .prettierrc
  components.json
  DESIGN.md                    # fork of upstream
  public/                      # icons, etc. (rebrand)
  scripts/                     # rebrand + assert scripts
  src/                         # COPIED from apps/desktop/src, rebranded
  electron/                    # COPIED from apps/desktop/electron, rebranded
    main.cjs
    preload.cjs
    backend-command.cjs
    backend-env.cjs
    backend-ready.cjs
    backend-probes.cjs
    bootstrap-runner.cjs
    connection-config.cjs
    gateway-ws-probe.cjs
    dashboard-token.cjs
    hardening.cjs
    entitlements.mac.plist
    entitlements.mac.inherit.plist
    ...
  apps/shared/                 # import from Hermes via @hermes/shared workspace
```

**Files to change (the absolute minimum):**

1. `package.json` — name, productName, version, description, author, bins.
2. `electron/main.cjs` — `HERMES_DESKTOP_*` env var prefix → `MUNROE_DESKTOP_*`,
   backend command/args (`hermes` → `munroe` shim), window title, app ID,
   deep-link scheme, icon, entitlements file.
3. `electron/preload.cjs` — `window.hermesDesktop` → `window.munroe` (rename
   the contextBridge binding). Update all IPC channel names from `hermes:*`
   to `munroe:*` — but keep the event types and parameter shapes identical.
4. `electron/backend-env.cjs` — `buildDesktopBackendEnv` defaults to inject
   `MUNROE_PRODUCT=Munroe Code`, `HERMES_SESSION_SOURCE=munroe-code`.
5. `electron/bootstrap-runner.cjs` — first-launch install copy (Munroe welcome
   instead of Hermes welcome).
6. `src/hermes.ts` → `src/munroe.ts` — the renderer-side facade. Method names
   on `window.munroe` mirror the preload rename.
7. `src/global.d.ts` — `declare global { interface Window { munroe: ... } }`.
8. `src/main.tsx`, `src/app/**`, `src/components/**` — replace word "Hermes"
   with "Munroe" in user-facing copy. Brand assets in `src/styles.css`,
   `src/themes/`, `pr-assets/`.
9. `src/i18n/**` — all 16 locales. Strip "Hermes" references in user-facing
   strings (keep internal identifiers).
10. `assets/`, `public/` — logos, splash, icon set.
11. `DESIGN.md` — fork and rebrand.
12. `app/` → rename to `renderer/` (optional clarity).

**Files that DO NOT change** (100% reused):

- `apps/shared/src/json-rpc-gateway.ts` — the wire protocol client.
- `apps/shared/src/websocket-url.ts` — URL builders.
- All `boot`/`probe`/`token`/`hardening`/`entitlements` logic.
- Every `@method(...)` on the backend — the full 110+ RPC surface.
- The `tui_gateway` server — the server is unchanged.
- The existing `munroe-code-cli/src/runtime.js` — it already wraps the
  runtime correctly.

### 4.2 The `munroe` shim binary

```
/usr/local/bin/munroe (or %LOCALAPPDATA%\Programs\Munroe\bin\munroe on Windows)
```

```bash
#!/usr/bin/env bash
# Drop-in shim: forwards every command to the installed Hermes runtime while
# exporting the white-label env. Lets the desktop spawn `munroe serve` without
# forking the Python package.
exec env \
  MUNROE_PRODUCT="Munroe Code" \
  HERMES_SESSION_SOURCE=munroe-code \
  HERMES_SKILLS_OVERRIDE=numin-saas-rebuild \
  "${HERMES_BIN:-hermes}" "$@"
```

The desktop spawns `munroe serve --host 127.0.0.1 --port 0` and gets back
`HERMES_BACKEND_READY port=N` on stdout (unchanged parsing logic).

---

## 5. White-label pitfalls

The Hermes stack has **4 places** where the brand leaks. Each must be patched
for a customer-facing product.

### 5.1 Backend-leaked names

**Status:** low risk. The backend (`hermes_cli/web_server.py`) only exposes
the JSON-RPC surface and REST endpoints; it does not advertise its brand in
responses. The `/api/status` body is a JSON of `gateway_state`, profiles,
session counts — no brand string.

**Caveat:** `hermes_cli/*` does write `HERMES_HOME` and `~/.hermes` paths
throughout. If Munroe wants a different home directory, every consumer of
`HERMES_HOME` must be checked. The safest path is to **keep `~/.hermes`** as
the storage location (the runtime's SQLite, config, sessions, skills — all
live here) and rebrand only the *user-facing* references. The user sees
`~/.munroe`; the runtime sees `~/.hermes`; you write a symlink in the
installer.

### 5.2 Renderer-leaked names

**Status:** medium risk. The renderer has many user-visible strings:

- `src/styles.css` — comments, brand colors (gold theme `FFD700`).
- `src/i18n/<locale>/**` — Hermes references in translated strings.
- `src/app/**` — onboardings, settings labels, welcome screens.
- `src/themes/` — theme metadata.
- `pr-assets/` — release screenshots.
- `src/main.tsx` — `<title>`, document title, splash.

**Fix:** a `grep -RIn -E "Hermes|hermes|nousresearch|Nous Research" src/`
sweep; replace each surface hit with `Munroe|munroe`. Automated by a single
script (`scripts/rebrand.sh`) called at build time.

### 5.3 IPC bridge / env var prefix

**Status:** high risk (if missed). The preload exposes `window.hermesDesktop.*`
and the main process listens on `ipcMain.handle('hermes:*', ...)`. The
backend env includes `HERMES_DESKTOP=1`, `HERMES_DESKTOP_READY_FILE=...`,
`HERMES_HOME=...`, `HERMES_PROFILE=...`.

**Decision:** keep `HERMES_*` env vars **unchanged** (they are an
internal contract with the runtime). Rename only the **customer-visible**
surface:

- `window.hermesDesktop` → `window.munroe`
- Branded strings in copy

That minimizes the risk of breaking the auth/connection-config
(`electron/connection-config.cjs`) which is heavily tested against the
existing IPC names.

### 5.4 CLI seams

**Status:** low risk (already addressed). The `munroe-code-cli` already
injects:

- `HERMES_SESSION_SOURCE=munroe-code`
- `MUNROE_PRODUCT=Munroe Code`
- `--skills numin-saas-rebuild` (skills subset)
- Custom system prompt that says "never expose internal runtime brands"

The `runtime.js` `findRuntime()` falls back to `hermes` on PATH if
`MUNROE_RUNTIME_PATH` is unset. With the `munroe` shim, the CLI finds the
shim first → shim forwards to Hermes with the right env. The CLI sees a
"munroe" binary; the runtime sees itself unchanged.

### 5.5 The shared client import

**Status:** OK. `apps/shared/src/json-rpc-gateway.ts` is a **pure** client
with no brand string. Importing it via `@hermes/shared` workspace is fine;
the workspace name is internal. If customer surfaces ever see an import
path, a `paths` alias in `tsconfig.json` can rewrite it to `@munroe/shared`.

### 5.6 The agent's internal mental model

**Status:** handled in `runtime.js`. The system prompt already tells the
agent: *"Refer to yourself and the product only as Munroe or Munroe Code."*
The `HERMES_SESSION_SOURCE` env var is reflected in session metadata for
debugging. End users in the GUI never see it.

### 5.7 The "agent" wording in RPC events

**Status:** invisible. All event payloads (`message.delta`, `tool.start`,
etc.) are content streams — no brand strings. The session info payload is
`{session_id, profile, model, ...}` — neutral.

---

## 6. Operational pitfalls

### 6.1 Backend cold-start latency

`HERMES_DESKTOP_PORT_ANNOUNCE_TIMEOUT_MS` defaults to 90s; clamped to 45s
minimum. Cold-start on a fresh install can hit 30-60s on slow disks or under
antivirus scans. The installer must warm the backend before the splash
fade-out, or show a "Munroe is loading…" overlay (the desktop already
does this via `bootstrap-runner.cjs`).

### 6.2 Electron-builder bundling

The desktop bundles the **renderer** (React + Vite) but NOT the Python
runtime. The runtime (`hermes-agent/`) and its venv live in `~/.hermes/`
and are managed by the install. The desktop reads
`HERMES_DESKTOP_HERMES_ROOT` (or a managed install marker) to find the
runtime.

**For Munroe:** the `munroe` shim must be on PATH *before* first launch
or the installer must drop it into the runtime's `node/bin/` directory.

### 6.3 Re-exec / sandbox for updates

`electron/main.cjs` has a sophisticated `decideRelaunchOutcome` flow for
self-updates that re-execs the desktop binary in a sandboxed child. On
bricking, it falls back to `manual` mode. The Munroe fork must preserve
this — it's why the desktop works on macOS/Linux/Windows without
re-installation.

### 6.4 Profile scoping

`hermes_cli` supports a `--profile <name>` flag that scopes config, sessions,
and skills to a named profile. Munroe should ship a single `munroe` profile
by default but expose `--profile` to power users. The desktop's "profile
switcher" in `src/hermes.ts` (search for `profile`) is already there — just
rebrand.

### 6.5 Pet / decorations

The desktop ships a "pet" overlay (a small mascot that lives in the corner).
All `pet.*` RPC methods can be dropped from the Munroe renderer if you
don't want it. The IPC exposes them via `window.hermesDesktop.petOverlay`
— just don't render that surface.

### 6.6 OAuth / hosted mode

The desktop supports connecting to a *remote* Hermes gateway via OAuth
(`HERMES_DESKTOP_REMOTE_URL` + ticket-based auth). If Munroe ever offers a
hosted backend, all of this works unchanged. For a local-only v1, just
don't expose the "Connect to remote" UI.

### 6.7 Provider names in the model picker

`model.options` returns the raw provider list (Anthropic, OpenAI, Google,
etc.). The MUI/renderers wrap these in branded labels. For a Munroe-only
build, prune the picker to only the providers you support, or replace the
labels with neutral ones ("Munroe Core", "Munroe Swift", "Munroe Pro").

---

## 7. Decision matrix

| Question | Answer |
|---|---|
| Fork the Python runtime? | **No.** It is the engine. Reuse it. |
| Fork the desktop app? | **Yes** — copy `apps/desktop/` to `munroe-desktop/`, rebrand UI + IPC names. |
| Write a separate daemon? | **No.** `hermes serve` IS the daemon. `munroe serve` shim is the brand layer. |
| Rewrite the CLI? | **No.** `munroe-code-cli` is already correct. |
| Build a new IPC protocol? | **No.** JSON-RPC over WS at `/api/ws` is the contract. |
| Use the same installer pipeline? | **Yes.** `electron-builder` is reusable. |
| Keep `~/.hermes` storage path? | **Probably yes.** Rename only on customer-facing surfaces. |
| Need OAuth / hosted mode for v1? | **No.** Local-only loopback is enough. |
| Drop pet overlay? | **Recommended for v1.** Easy to add back later. |

---

## 8. Suggested execution plan

### Phase 1 — Day 1 (clean rebrand, no behavior change)

1. Copy `apps/desktop/` to `munroe-desktop/`.
2. `package.json` rebind: `name`, `productName`, `description`, `author`.
3. `electron/main.cjs`: `hermes` → `munroe` shim invocation.
4. `electron/preload.cjs`: `window.hermesDesktop` → `window.munroe`.
5. `src/` headline strings, window title, splash — "Hermes" → "Munroe".
6. `scripts/rebrand.sh` — automated string sweep.
7. `npm run dev` — confirm Electron boots, chat connects, session creates.
8. `npm run dist:mac` — confirm DMG builds.

**Acceptance:** Munroe-branded Electron app launches, connects to local
`hermes serve` via `munroe` shim, runs a chat session, shows no "Hermes"
strings in copy.

### Phase 2 — Week 1 (CLI + desktop integration)

1. Add `munroe-code-cli desktop` subcommand that builds/launches the
   Munroe desktop.
2. Add `munroe-code-cli doctor` entries that verify the desktop binary is
   installed.
3. Release `munroe-code-cli@0.2` and `munroe-desktop@0.1` together.

### Phase 3 — Month 1 (Munroe-owned daemon option)

If Hermes ever becomes a poor runtime fit (license, model-provider control,
features), the JSON-RPC contract is the *only* seam. A Munroe-native backend
(re-)implementing the `tui_gateway/server.py` method surface is a clean
swap. The shared client and the desktop are unaffected — they speak
JSON-RPC at `/api/ws`. The server-side Python is the only thing to replace.

---

## 9. Files referenced

- `apps/desktop/electron/main.cjs` (290 KB) — backend spawn, IPC, windows
- `apps/desktop/electron/preload.cjs` (13 KB) — contextBridge surface
- `apps/desktop/electron/backend-command.cjs` — `serve` vs `dashboard --no-open` routing
- `apps/desktop/electron/backend-env.cjs` — PATH / PYTHONPATH composition
- `apps/desktop/electron/backend-ready.cjs` — readiness parser
- `apps/desktop/electron/connection-config.cjs` — remote URL normalization
- `apps/desktop/electron/gateway-ws-probe.cjs` — WS upgrade probe
- `apps/desktop/electron/dashboard-token.cjs` — local session token
- `apps/desktop/package.json` — build scripts, prod manifest
- `apps/shared/src/json-rpc-gateway.ts` — wire-protocol client
- `apps/shared/src/websocket-url.ts` — URL builders
- `hermes_cli/subcommands/dashboard.py` — `serve` subcommand parser
- `hermes_cli/web_server.py` — FastAPI app, `/api/ws`, `/api/status`
- `tui_gateway/server.py` — full 110+ RPC method surface
- `tui_gateway/ws.py` — WS transport + token coalescing
- `tui_gateway/dispatch.py` — request handler
- `products/munroe-code-cli/src/{cli,config,runtime}.js` — current CLI

(All paths relative to `/Users/julylan/.hermes/hermes-agent/`.)

---

## 10. One-liner summary

> **The fastest clean Munroe desktop is a rebranded copy of `apps/desktop/`
> that reuses the installed Hermes runtime via `hermes serve` + the JSON-RPC
> gateway at `/api/ws`. No daemon to write. No IPC to design. No transport
> to debug. Reuse the engine, rebrand the surface, ship in days.**
