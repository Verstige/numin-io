# Task Logger — Auto-log completed work to Dev Center

## Trigger
Run after every main session response that contains words like: built, fixed, added, created, updated, deployed, connected, synced, removed, completed, done, working, live.

## What to do
1. Read the assistant's last response
2. Extract any completed features/fixes (look for ✅, "built", "fixed", "added", "done", "live", etc.)
3. For each completed item, POST to http://localhost:3001/api/tasks:
   - title: short description of what was done
   - column: "done"
   - priority: "medium" (high if it's a major feature)
   - category: detect from context (vitatech/numin/verstige/devcenter/trading)
   - completedAt: today's date

## Model
Use zai/glm-4.7-flash (FREE) — never use Claude for this.

## Rules
- Only log genuinely completed work, not plans or todos
- Keep titles concise (under 80 chars)
- Skip if nothing was completed (don't log routine answers)
- Don't duplicate — check if a similar task was logged today
