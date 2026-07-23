# Munroe Code v1 — Full Product Implementation Plan

> **For Hermes:** Execute this plan task-by-task and verify real behavior before reporting completion.

**Goal:** Ship a complete Munroe-owned coding agent product with an installable CLI, local authenticated backend, native desktop chat application, project workspaces, model switching, conversation persistence, tool execution, and packaged macOS application.

**Architecture:** Munroe owns the product surface and project configuration. The existing agent engine remains an internal runtime behind a Munroe adapter. The CLI and desktop app share the same `.munroe/` project state and invoke the same runtime policy. The desktop app uses Electron IPC with strict argv-based process spawning rather than exposing unrestricted shell execution to the renderer.

**Tech Stack:** Node.js 20+, Electron, React, Vite, TypeScript, native Electron IPC, existing Munroe CLI/runtime adapter, Node test runner, electron-builder.

---

## Product boundary

Customer-visible:

- Munroe Code CLI
- Munroe Code desktop app
- Munroe project workspaces
- Munroe model modes: Auto, Core, Kimi
- Chat history, project selection, usage, permissions, diagnostics

Internal-only:

- Agent runtime executable
- Provider names and credentials
- Infrastructure vendors

## v1 acceptance criteria

1. `munroe setup` initializes a project and verifies the internal runtime.
2. `munroe app` opens the native Munroe Code application.
3. CLI one-shot and desktop chat both complete real model calls.
4. Desktop lets the user select a project directory.
5. Desktop supports new chats and persisted local history.
6. Desktop includes Auto/Core/Kimi model switcher.
7. Desktop exposes Safe/Standard permission modes; Trusted remains CLI-confirmed only.
8. Desktop shows response status, errors, and usage metadata.
9. Renderer cannot execute arbitrary commands directly.
10. The macOS `.app` builds, launches, and renders successfully.
11. Munroe customer surfaces contain no internal runtime/provider branding.
12. Unit, integration, packaging, visual, and console verification pass.

## Execution sequence

### Phase 1 — Shared Munroe protocol

- Extend `munroe-code-cli/src/config.js` with conversation storage and recent-project registry.
- Extend `munroe-code-cli/src/runtime.js` with desktop-safe query invocation and structured usage output.
- Add tests before implementation for history, project registry, and desktop invocation.

### Phase 2 — CLI completion

- Add `munroe setup`.
- Add `munroe app [--project PATH]`.
- Add `munroe projects`.
- Add clear runtime bootstrap diagnostics and install guidance.
- Verify every command on a temporary Git repository.

### Phase 3 — Native desktop application

Create `munroe-code-app/`:

- Electron main process
- Context-isolated preload bridge
- React renderer
- Project sidebar
- Conversation sidebar
- Chat transcript
- Prompt composer
- Model switcher
- Permission switcher
- Settings/diagnostics view
- Usage display
- Munroe brand assets

### Phase 4 — Runtime integration

Electron main process exposes allowlisted IPC only:

- `munroe:project:choose`
- `munroe:project:status`
- `munroe:chat:send`
- `munroe:history:list`
- `munroe:history:read`
- `munroe:history:new`
- `munroe:config:get`
- `munroe:config:set`
- `munroe:doctor`

All runtime calls use executable + argv arrays with `shell:false`.

### Phase 5 — Packaging and launch

- Generate Munroe `.icns` from existing brand icon.
- Build React renderer.
- Package unpacked macOS app and DMG/ZIP where possible.
- Launch the packaged `.app`.
- Verify process, window, console, and rendered UI.

### Phase 6 — End-to-end validation

- Create temporary Git project.
- Open it in Munroe Code.
- Start new conversation.
- Select Auto model.
- Send a real prompt.
- Confirm response persists and usage is recorded.
- Switch model policy and confirm config persists.
- Run CLI against the same project and verify shared state.

### Phase 7 — Ship

- Run security scan for secrets, shell interpolation, unsafe IPC, and unrestricted filesystem access.
- Run independent code review.
- Update `README.md`, `RUNBOOK.md`, and product skill.
- Stage only Munroe v1 files and preserve unrelated working-tree changes.
- Commit and push after all verification passes.
