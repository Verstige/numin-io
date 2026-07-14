# Munro — Runbook

_Final state, July 14, 2026._

This is the source of truth for what's shipped, what's pending, and what decisions are still owed.

---

## What is Munro

Munro is an AI agent platform. Customers buy a subscription; we provision a private Linux cloud computer running the Hermes agent, wire it to one of four messaging channels (iMessage / Telegram / WhatsApp / Discord), and the agent runs 24/7 doing work for them. The customer never sees the LLM behind it (we default to MiniMax for cost; you can bring your own key). Customers name their own agent.

The brand promise: Munro **finds the signal in the noise.** The platform markets six inherited disciplines (scored decisions, liveness, separate reviewer, real "done" definition, reusable code, layered memory) that ship as defaults — no opt-in required.

The brand mark is a **constellation** — peak + cardinal ticks + focal dot, gold `#C9A84C` on near-black `#0D0D0F`.

**Infra reality (verified July 2026 against Orgo's docs):**

- Cloud box is Linux. Not Mac. (Customers can install the DIY tier on their own Mac if they want Apple.)
- Boots in <500ms.
- Comes pre-installed with Hermes via Orgo's curated `system/hermes-agent@1.0.0` template — no manual bake needed.
- Orgo pricing: Hacker $29, Startup $99, Scale $399 (per-month + AI credits).

---

## Live NOW

- **Landing page**: `https://verstige.github.io/numin-io/` — fully rebranded to Munro, 17 sections, GSAP-driven card animations, Constellation mark in nav, mobile-responsive.

  Sections in order:
  ```
  1. channels · 2. composio · 3. skills · 4. marketplace · 5. inherited
  6. vs-claude · 7. cloud-what · 8. advantage · 9. personality · 10. workflow
  11. efficient · 12. compare · 13. built · 14. benchmarks · 15. own
  16. pricing · 17. faq
  ```

  **Editing decisions applied during the cuts pass:**
  - `#experience` deleted (redundant with `#advantage`)
  - `#credits` deleted (vestigial artifact of pre-pivot product)
  - `#workflow` 6 industries → 3 (Founders · Agencies · Sales)
  - `#vs-claude` 10 cards → 5 (Price · Usage caps · Where it lives · Memory · Always on)
  - `#built`, `#benchmarks`, `#own` moved immediately before `#pricing` (credibility cluster → price)

- **Brand kit**: at `docs/brand/` — `munro-lockup`, `munro-icon`, `munro-wordmark`, `munro-appicon`, `munro-favicon`, `munro-hero`, `manifest.json`. All assets returning 200 from GH Pages.

- **GitHub**: `Verstige/numin-io` (slug kept for SEO continuity; rename is a separate decision).

---

## Built but not deployed

| Asset | Path | What's missing to ship |
|---|---|---|
| Customer dashboard | `dashboard/index.html` | Auth (Supabase), hosting (Vercel/Railway), backend wiring |
| Admin dashboard | `admin/index.html` | Same as above. Buttons are visual-only mocks. |
| Onboarding form | `onboarding/index.html` | Action target — currently points at `formspree.io/f/your-form-id` placeholder |
| Provisioning script | `scripts/provision.sh` | Operator-side bash: Orgo API + Supabase + Telegram bot token |
| ToS / Privacy / Refund | `legal/` | Drafts in plain language. Lawyer review needed before any public-facing link. |

---

## Open work — what unblocks what

These are ordered by revenue impact. **Start at the top.**

### 1. Stripe products + Checkout

**Why first:** Without this, no money can move.

You need:
- A Stripe account in your name (specify business entity — sole prop / LLC)
- Products created: $499 one-time Setup + $99/mo Solo Subscription (your locked price)
- Two URLs I need back:
  - Stripe Payment Link (one-time Setup)
  - Stripe Customer Portal URL

**What I do once you hand me the URLs:** wire `scripts/provision.sh` to accept a Stripe customer ID at provisioning, update landing CTAs (`Start free trial`, `Provision your agent`) to point at the Payment Link.

### 2. Supabase project

**Why second:** the records and the auth both need it.

You create it (free tier covers v1). I need three things:
- Project URL
- Anon key (public, used in dashboard/admin HTML)
- Service role key (private, used in `provision.sh`)

Three tables, schema in `RUNBOOK.md` historical:

```sql
create table customers (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  tier text not null check (tier in ('solo','pro','business','enterprise')),
  channel text not null,
  status text not null default 'pending',
  orgo_box_id text,
  orgo_box_url text,
  stripe_customer_id text,
  created_at timestamptz default now()
);

create table skill_publishes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  summary text not null,
  repo_url text not null,
  category text,
  weekly_drop boolean default true,
  notes text,
  published_at timestamptz default now()
);

create table customer_skills (
  customer_id uuid references customers(id),
  skill_id uuid references skill_publishes(id),
  taught_at timestamptz default now(),
  primary key (customer_id, skill_id)
);
```

### 3. Domain registration

**Why third:** links shared today carry `verstige.github.io/numin-io/`. That's a fossil URL.

Recommended: `munro.ai` (~$80/yr, premier feel — verify availability on Namecheap or Cloudflare).

Alternative: `usemunro.com` (~$12/yr fallback).

Once registered: CNAME to GH Pages via repo Settings → Pages → Custom Domain.

### 4. GH Pages repo rename

`Verstige/numin-io` (slug). Two paths:

- **Keep slug**: preserves any inbound links. URL stays ugly.
- **Rename to `Verstige/munro`**: clean URL. Old `/numin-io/` 404s.

Recommend: rename + add a server-side redirect from old URL to new. ~10 min.

### 5. Hosting for dashboard + admin

GH Pages can't run the backend these dashboards need (auth, persistence).

Recommended: **Vercel** (free tier covers v1, generous Next.js support if we wrap the dashboards later).

Alternatively: **Railway** if you want everything self-hosted on one provider with VitaTech/Verstige already there.

### 6. Orgo credentials + first workspace

**No image bake needed.** Orgo ships Hermes pre-installed via curated templates.

**Required setup (one-time):**

1. Create an Orgo account at https://www.orgo.ai/start and grab an API key
2. Create a `munro` workspace: `POST /api/workspaces` with `{"name": "munro"}`
3. Capture the workspace_id — env var `ORGO_WORKSPACE_ID`
4. Set env vars: `ORGO_API_KEY`, `ORGO_WORKSPACE_ID`, `TELEGRAM_BOT_TOKEN` (when wiring), `MUNRO_OPS_BOT_TOKEN` + `MUNRO_OPS_CHAT_ID` (for the operator-DM), `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (for the customer record)

The provisioning script (`scripts/provision.sh`) handles the full flow: creates the computer from the curated `system/hermes-agent@1.0.0` template (boots in <500ms with Hermes pre-installed), polls for running status, captures both `id` and stable `instance_id`, wires the channel manually, writes a Supabase record, and DMs you.

**Important:** Orgo runs Linux only — no Mac/Apple Silicon. The landing copy reflects this: "a private cloud computer" not "an Apple Silicon Mac mini". The local install (`# DIY Local`) is the macOS path.

**Orgo pricing (per docs, July 2026):**

- **Hacker** $29/mo + $5 AI credits · 1 computer · solo builders
- **Startup** $99/mo + $10 AI credits · 4 computers · small teams
- **Scale** $399/mo + $50 AI credits · 16 computers · production

For Munro's solo customer box ($99/mo + $499 setup), the Solo tier maps cleanly to Orgo's Hacker plan at $29/mo (covered by margin). The $99 to Munro, the customer gets the box + integration + human ops. For business tier, 2 computers maps to Startup. Scale is for teams running multiple customers on one box.

**Hardware options on Orgo:** vCPU 1/2/4/8/16, RAM 4/8/16/32/64 GB, disk up to plan limit. Spect recommends: Solo (2vCPU/8GB/40GB), Business (4vCPU/16GB/80GB).

### 7. Tier structure decision

Locked value-prop is `$499 setup + $99/mo`. The pricing section on the live site currently shows **5 tiers** ranging $0–$2,499. Recommendation:

- **Keep 2 tiers**: DIY (free, your API key, you bring your own LLM) + Managed ($99/mo + $499 setup)
- Drop Solo/Pro/Business/Enterprise until real demand forces them back
- Orgo costs scale well: $29/mo Hacker plan (1 computer) covers the Solo tier with margin; $99/mo Startup covers Business

Decision deferred to a future session.

### 8. Closed-loop gate on admin publish form

Per the marketing promise ("scored decisions, not vibes"), the admin publish-skills form could require a non-empty `stop condition` field before publish. Adds consistency between marketing and runtime. **Optional** — not blocking anything.

### 9. Firecrawl API key on this Mac

Web tools (search, extract, X search) are currently offline. Adding the key unlocks article reads, market checks, and domain verification work. **Set when convenient.**

---

## Policy decisions still pending

Each is one sentence. None blocks launch; all gate polished state.

- **Customer identity model**: magic-link email, Google OAuth, or both
- **Default channel for new customers**: Telegram (fastest), iMessage (requires BlueBubbles gateway), WhatsApp, Discord, or "customer picks at onboarding"
- **Refund window**: 30 days (industry standard) or different
- **Business entity**: sole prop or LLC — affects Stripe account setup
- **Admin auth**: simple password gate, IP allowlist, or stronger

---

## What I would do tomorrow if continuing

If resuming:
1. Stand up Supabase, run the schema, hook it into the dashboards
2. Add the closed-loop `stop condition` field to the admin publish form
3. Cut the 17 stale `*.md` setup docs at repo root (legacy from prior project — confusing the at-a-glance state of the repo)
4. Cut the `_redirects` file in `docs/` (Netlify leftover, unused)

---

## TL;DR

**Live now:** landing page with full brand identity and content; brand kit.

**Built but inert:** customer/admin dashboards, onboarding form, provisioning script, legal templates — they render, they look right, but they don't persist or authenticate.

**Blocking first revenue:** Stripe (you create the products), Supabase (you create the project), then I can wire provisioning and dashboards together.

**Fast-follow:** domain (so the URL says Munro), GH Pages slug rename, hosting for the dashboards.

Policy and product decisions above are not blocking ship — they're flagged for after first customer.
