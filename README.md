# Munro

Munro is an AI agent platform. You buy a subscription, we provision a private virtual computer running your agent, wire it to your messaging app of choice, and your agent does work for you 24/7.

It learns your voice. Every week we ship new skills you can teach it.

## Quick start

- **Landing page** (live): `https://verstige.github.io/numin-io/`
- **Runbook** (the source of truth for what's built, what's pending, and what blocks revenue): [`RUNBOOK.md`](./RUNBOOK.md)

## Repo layout

```
docs/                ← the live marketing landing (single self-contained HTML)
  index.html

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

- Name: **Munro**
- Tagline: _The AI agent that knows your business_
- Color: gold `#C9A84C` on black `#0D0D0F`

## What's NOT in the repo

- API keys, secrets, billing creds — none. Use env vars or your local password manager.
- Customer records — those live in Supabase, not git.
- Provisioned Orgo boxes — those live in Orgo, not git.

See `RUNBOOK.md` for the deploy checklist.
