# Warp Bridge Skill

Use when dispatching Atlas tasks to also stream them live into a Warp session that Julylan can watch AND interact with in real time.

## Setup — Do once

1. **Verify Oz CLI installed** at `/Applications/Warp.app/Contents/Resources/bin/oz`
2. **Environment ID** for IGC: `Vc4A5wwtSHxAtTD5bECRg8`
3. **GitHub org**: `Verstige` (confirmed — owns `igc-v2-live`)

## Two-way Warp session — how it works

When you dispatch an Atlas task, also fire an Oz agent run with `--share "public:edit"`. This creates a Warp shareable session URL that Julylan can open in his browser or Warp app. He watches the agent work live AND can drop comments or corrections into the session in real time. The agent sees his messages and responds.

## Bridge function — run before dispatching

```typescript
// fires an Oz agent run and returns the shareable Warp session URL
async function fireWarpAgent(task: string, description: string, envId: string): Promise<string> {
  const ozBin = '/Applications/Warp.app/Contents/Resources/bin/oz'
  const shareFlag = 'public:edit'
  
  const runId = await exec(`${ozBin} agent run \
    --name "${description}" \
    --environment "${envId}" \
    --prompt "${task.replace(/"/g, '\\"')}" \
    --model "claude-4-5-sonnet" \
    --share "${shareFlag}" \
    --output-format pretty`)
  
  // parse "Sharing session at: https://app.warp.dev/session/..." from stdout
  const match = runId.stdout.match(/Sharing session at: (https:\/\/app\.warp\.dev\/session\/[^s]+)/)
  if (match) return match[1]
  
  // fallback: run list → find latest run with matching env
  const runs = await exec(`${ozBin} run list --output-format json`)
  return `https://oz.warp.dev/runs/${runs.latest.id}`
}
```

## Workflow

1. **You (Zora)** → decide a task needs a Warp session (complex builds, things Julylan wants to watch)
2. **Fire the bridge** → run `oz agent run --share "public:edit"` with the task prompt + environment
3. **Julylan opens** → `https://app.warp.dev/session/...` in browser or Warp app
4. **Julylan watches** → sees the agent working in real time
5. **Julylan can comment** → his messages go directly into the agent's context mid-task
6. **Agent adjusts** → based on his feedback before finishing

## What Julylan sees

- Live terminal session in Warp (browser or app)
- Each command the agent runs, streamed in real time
- Files being edited, git operations, build output
- He can type messages directly into the session
- No need to wait for completion to course-correct

## Key Oz commands reference

```bash
# Fire an agent with real-time sharing (2-way)
oz agent run \
  --name "Task name" \
  --environment "Vc4A5wwtSHxAtTD5bECRg8" \
  --prompt "Task description..." \
  --model "claude-4-5-sonnet" \
  --share "public:edit"

# List active runs
oz run list

# Get run status
oz run get <run-id>

# Environment info
oz environment list
oz environment get <env-id>
```

## Notes

- `--share "public:edit"` = anyone with the link can view AND type — set to `public:view` for read-only
- Session URL format: `https://app.warp.dev/session/<session-id>` — opens in browser or Warp app
- Oz run URL format: `https://oz.warp.dev/runs/<run-id>` — web dashboard view
- The agent runs asynchronously — you get the session URL back immediately, Julylan watches live as the agent works
- The `--share` flag means Julylan isn't just watching — he's in the session with the agent
