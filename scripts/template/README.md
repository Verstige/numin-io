# Munro Code Template — `system/munro-code@1.0.0`

This is the Orgo template definition for the customer-facing agent box. Every new customer's box spins up from this template, which extends the upstream Hermes template with our proprietary skill library and the crawl4ai web-fetch engine.

## What ships in the box

```
┌─────────────────────────────────────────────────────────────────┐
│  system/munro-code@1.0.0                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FROM system/hermes-agent@1.0.0                                │
│                                                                 │
│  RUN pip install -U crawl4ai                                   │
│  RUN crawl4ai-setup          # downloads chromium-headless-shell │
│                                                                 │
│  COPY ./skills/        /root/.hermes/skills/                    │
│  COPY ./prompts/       /root/.hermes/prompts/                   │
│  COPY ./inherited/     /root/.hermes/inherited/                 │
│  COPY ./bin/crawl4ai-helper.py  /root/.hermes/bin/             │
│                                                                 │
│  RUN hermes doctor        # validate everything is wired up     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What's in each layer

| Layer | Source of truth | Files |
|---|---|---|
| **`skills/`** | `~/Projects/zoras-memory-system/skills/` (canonical) | All 57 skills shipped (53 with descriptions, 4 placeholders we ignore) |
| **`prompts/`** | (TBD) | System prompts that wire skills into agent behavior |
| **`inherited/`** | `~/Projects/zoras-memory-system/skills/openmontage-patterns.md` | The 6-7 disciplines the landing markets ("scored decisions, not vibes") |
| **`bin/crawl4ai-helper.py`** | (this file) | Helper that wraps `AsyncWebCrawler` for the agent's use |
| **`crawl4ai 0.9.2`** | PyPI | The web-fetch engine |

### Skills breakdown

**Customer-facing (41 skills across 9 categories):**
- Sales & Outreach: apollo, apify-lead-generation, cold-outreach, business-development, x-twitter, summarize
- Marketing & Content: content-creator, marketing-strategy-pmm, go-to-market, adaptlypost, listing-swarm, chrome-relay
- Finance & Markets: yahoo-finance, stock-analysis, aisa-financial-data, ai-screener, btc-analyzer, beetrade, polymarketodds
- Research & Discovery: news-summary, feed-diet, youtube-watcher
- Knowledge & Memory: elite-longterm-memory, qmd, notion, markdown-converter, nano-pdf
- Productivity & Planning: adhd-founder-planner, agent-daily-planner, briefing, agent-step-sequencer, daily-review-ritual, crucial-conversations-coach
- Engineering & Code: frontend-design, claude-cost-cli, free-ride
- Browser & Computer Use: agent-browser, peekaboo, warp-bridge
- Health & Personal: health-sync, calorie-counter

**Silent agent infrastructure (12 skills):**
adaptive-reasoning, proactive-agent, self-improving-agent, close-loop, context-aware-delegation, intent-router, find-skills, automation-workflows, auto-updater, task-logger, clawdhub, openclaw-backup

## How to publish this template

**One-time setup.** Run from this directory:

```bash
# 1. Authenticate Orgo CLI (do this once)
orgo login   # device-code OAuth in browser

# 2. Build the template artifacts (skills/, prompts/, inherited/, bin/)
./build-template.sh

# 3. Validate the template spec
curl -X POST https://www.orgo.ai/api/templates/validate \
  -H "Authorization: Bearer $ORGO_API_KEY" \
  -H "Content-Type: application/yaml" \
  --data-binary @template.yaml

# 4. Publish + build the golden snapshot
curl -X POST "https://www.orgo.ai/api/templates?auto_build=true&force=true" \
  -H "Authorization: Bearer $ORGO_API_KEY" \
  -H "Content-Type: application/yaml" \
  --data-binary @template.yaml

# 5. Poll until status: ready
curl https://www.orgo.ai/api/templates/default/munro-code/1.0.0/build \
  -H "Authorization: Bearer $ORGO_API_KEY"
```

**After publishing**, every `provision.sh` call automatically uses this template_ref:

```json
{ "template_ref": "default/munro-code@1.0.0" }
```

(The current `provision.sh` uses `system/munro-code@1.0.0` — once we publish our own, we switch to `default/munro-code@1.0.0`.)

## Bumping versions

When we ship a new skill:

1. Add the skill folder to `~/Projects/zoras-memory-system/skills/`
2. Run `./build-template.sh` to refresh `skills/`
3. Bump the version in `template.yaml` (e.g., `1.0.0` → `1.1.0`)
4. Re-publish: `POST /api/templates?auto_build=true&force=true`
5. Existing customer boxes pick up the new version on next restart

**No per-customer deploy.** That's the whole point.

## Files in this directory

| File | Purpose |
|---|---|
| `template.yaml` | Orgo template spec (hardware, base image, lifecycle hooks) |
| `build-template.sh` | Pulls skills from the canonical repo, stages them into the template artifacts |
| `bin/crawl4ai-helper.py` | Helper module the agent uses to fetch URLs through crawl4ai |
| `Dockerfile` | (Optional) If we need to test the image locally before publishing |