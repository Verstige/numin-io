# Munroe

Munroe is an AI software company with two connected products:

- **Munroe Code** — a persistent agent runtime that handles skills, automations, memory, scheduled work, computer use, and messaging channels.
- **Munroe Chat** — a browser-based AI workspace for conversations, documents, knowledge, voice, and team collaboration.

Both products can be delivered through **Munroe Cloud** as a managed service or installed **locally** on customer-controlled infrastructure.

## Quick start

- **Landing page** (live): `https://verstige.github.io/numin-io/`
- **Runbook** (the source of truth for what's built, what's pending, and what blocks revenue): [`RUNBOOK.md`](./RUNBOOK.md)

## Repo layout

```
docs/                ← live marketing site and product documentation
  index.html
  MUNROE-CHAT.md      ← Munroe Chat product, licensing, architecture, and release brief

munroe-code-cli/     ← installable Munroe Code terminal product
  bin/munroe.js
  src/
  test/

munroe-code-app/     ← native Munroe Code chat application
  electron/
  src/
  release/mac/Munroe Code.app

chat/                ← legacy Open WebUI experiment; not the core Munroe product
  compose.yaml
  .env.example
  README.md

dashboard/           ← customer-facing UI (host separately when accounts ready)
  index.html

admin/               ← operations UI for Julylan (noindex, gated by IP/header)
  index.html

onboarding/          ← post-purchase intake form (6 steps, sends to Formspree/Supabase)
  index.html

scripts/             ← operations
  provision.sh       ← per-customer setup (Orgo + Hermes + channel + Supabase + Telegram DM)

legal/               ← ToS / Privacy / Refund policy templates
  TERMS-OF-SERVICE.md
  PRIVACY-POLICY.md
  REFUND-POLICY.md

src/                 ← legacy Vite + Firebase app from earlier prototype (kept for reference)
```

## Brand

- Name: **Munroe**
- Tagline: _The AI agent that knows your business_
- Color: gold `#C9A84C` on black `#0D0D0F`

## What's NOT in the repo

- API keys, secrets, billing creds — none. Use env vars or your local password manager.
- Customer records — those live in Supabase, not git.
- Provisioned Orgo boxes — those live in Orgo, not git.

See `RUNBOOK.md` for the deploy checklist.
