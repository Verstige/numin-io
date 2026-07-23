# Munroe Code CLI

Munroe Code is an agentic coding workspace for the terminal.

```bash
npm install -g ./munroe-code-cli
cd your-project
munroe
```

## Runtime prerequisite

Munroe Code v0.1 uses the installed Munroe agent runtime. The installer currently expects the runtime executable on `PATH` or at `MUNROE_RUNTIME_PATH`. Run `munroe doctor` to verify it before beginning work.

## Commands

```text
munroe                         Start or resume this project's workspace
munroe "fix the failing test"  Run one task
munroe init                    Initialize .munroe/
munroe resume                  Resume interactively
munroe status                  Show project status
munroe model                   Show model policy
munroe model auto|minimax|kimi Change model policy
munroe permissions             Show permission policy
munroe permissions safe|standard|trusted
munroe doctor                  Check the installation
```

Project state is stored in `.munroe/`. Add `.munroe/` to the project's `.gitignore`; it contains local sessions, configuration, usage reports, and permission preferences.

`standard` is the default permission mode. Dangerous operations still require approval. Enabling `trusted` requires typing `TRUSTED` in an interactive terminal; it then bypasses runtime command approvals and should only be used in disposable or fully trusted repositories.
