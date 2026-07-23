# Munroe Code CLI v0.1 implementation plan

## Goal

Ship an installable `munroe` executable that presents Munroe Code as its own product while delegating the mature agent loop to the locally installed runtime.

## v0.1 boundary

The CLI owns:

- Munroe naming, help, onboarding, and command surface
- Per-project `.munroe/` state
- Stable project session naming
- Model policy (`auto`, `minimax`, `kimi`)
- Safe defaults: checkpoints on, no automatic dangerous-command bypass
- Runtime discovery and health diagnostics
- A project-aware system prompt that keeps implementation providers behind the Munroe product boundary

The underlying runtime continues to own:

- Interactive TUI
- Tool calling and approvals
- Filesystem/shell tools
- Conversation persistence
- Memory, skills, delegation, and checkpoints
- Provider authentication

## Commands

- `munroe` — start or resume the project session
- `munroe "prompt"` — run one project-aware task and print the result
- `munroe resume` — resume the project session interactively
- `munroe status` — show project/runtime configuration
- `munroe model [auto|minimax|kimi]` — show or persist project model policy
- `munroe permissions [show|safe|standard|trusted]` — show or persist project permission policy
- `munroe doctor` — verify Node, Git, runtime, credentials/config, and project state
- `munroe init` — initialize `.munroe/`

## Tests first

1. Initializing creates private project state and does not overwrite existing settings.
2. Model routing uses MiniMax by default, Kimi when selected and configured, and fails clearly when Kimi credentials are absent.
3. Session names are stable per project.
4. Runtime argument construction includes project source, toolsets, checkpoints, model/provider, and safe approval behavior.
5. One-shot mode forwards a project-aware prompt and returns runtime output.
6. Doctor reports missing runtime without attempting installation.
7. User-provided arguments are passed as process arguments, never interpolated into a shell command.

## Verification

- `npm test`
- `npm run lint`
- `npm pack --dry-run`
- local `npm link`
- exercise `munroe init`, `status`, `model`, `permissions`, `doctor`
- run a real one-shot request in a temporary Git repository
- inspect generated `.munroe/` state and runtime usage report
