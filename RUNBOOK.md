# Munroe — Runbook

_Final state, July 14, 2026._

This is the source of truth for what's shipped, what's pending, and what decisions are still owed.

---

## What is Munroe

Munroe is an AI software company with two connected products:

- **Munroe Code** — a persistent agent runtime installed on a private Linux cloud computer or a customer-owned local computer. It handles skills, automations, scheduled work, memory, browser/computer use, and messaging channels.
- **Munroe Chat** — a browser-based AI workspace for conversations, files, knowledge, voice, models, and team collaboration. It connects to Munroe Code when work must continue beyond the browser session.

Customers can use either product through **Cloud** (managed by Munroe) or **Local** (installed on customer-controlled infrastructure). Customers name their own agent. Customer-facing surfaces never expose internal runtime or model-provider brands.

The brand promise: Munroe **finds the signal in the noise.** The platform markets six inherited disciplines (scored decisions, liveness, separate reviewer, real "done" definition, reusable code, layered memory) that ship as defaults — no opt-in required.

The underlying model is **MiniMax** (M3 · 1M context · multimodal). Munroe is positioned against Claude Code (the Anthropic competitor) on token volume &mdash; MiniMax's flagship Token Plan at $50/mo offers 5.1B tokens/mo versus Claude Code Max 5x at $100/mo with capped usage. Munroe absorbs MiniMax as its model and adds the box, channels, specialist configuration, and human ops. **Same model family, different posture.**

**Pricing proof-point:** Starter $50/mo / 1.7B tokens vs Claude Code Pro at $17–20/mo (capped). Pro $99/mo / 5.1B tokens vs Claude Code Max 5x from $100/mo (5× cap). The customer-facing comparison table lives on the live site (`#pricing-compare`).

The brand mark is a **constellation** — peak + cardinal ticks + focal dot, gold `#C9A84C` on near-black `#0D0D0F`.

**Infra reality (verified July 2026 against Orgo's docs):**

- Cloud box is Linux. Not Mac. (Customers can install the DIY tier on their own Mac if they want Apple.)
- Boots in <500ms.
- Comes pre-installed with Hermes via Orgo's curated `system/hermes-agent@1.0.0` template — no manual bake needed.
- Orgo pricing: Hacker $29, Startup $99, Scale $399 (per-month + AI credits).

---

## Live NOW

- **Munroe Code v1.0**: complete local product with CLI + signed native macOS application. The global `munroe` executable initializes and resumes project workspaces, runs one-shot coding tasks, exposes setup/status/projects/model/permissions/doctor/app commands, routes model policies (`auto`, `minimax`, `kimi`), and shares `.munroe/` project state with the desktop app. The Munroe Code desktop app provides project selection, persistent conversations, native chat, model switching, Safe/Standard permissions, usage metadata, and a context-isolated Electron bridge. Packaged app: `munroe-code-app/release/mac/Munroe Code.app` (`ai.munroe.code`), signed with Apple Development identity. Real desktop model invocation returned `MUNROE_DESKTOP_LIVE`. Verification: 10 CLI/service tests, TypeScript checks, Vite production build, zero production npm vulnerabilities, security sentinels, code-sign inspection, visual QA, and persisted conversation reload.

- **Landing page**: `https://verstige.github.io/numin-io/` — fully rebranded to Munroe, 17 sections, GSAP-driven card animations, Constellation mark in nav, mobile-responsive.

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
| Munroe Chat product brief | `docs/MUNROE-CHAT.md` | Open WebUI foundation audited; local proof-of-concept and commercial branding rights still required. |

### Munroe Chat licensing gate

Open WebUI is the selected foundation for the initial Munroe Chat proof of concept. Its current license requires the `Open WebUI` branding to remain unless the deployment has no more than 50 end users in a rolling 30-day period, the copyright holder gives written permission, or Munroe obtains an enterprise license permitting rebranding.

**Do not ship a broadly white-labeled Munroe Chat fork without written branding rights.** Until then, keep required attribution, limit use to internal/pilot validation, or build an independent UI against Munroe Code and model APIs. See `docs/MUNROE-CHAT.md` for the architecture and release phases.

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

For Munroe's solo customer box ($99/mo + $499 setup), the Solo tier maps cleanly to Orgo's Hacker plan at $29/mo (covered by margin). The $99 to Munroe, the customer gets the box + integration + human ops. For business tier, 2 computers maps to Startup. Scale is for teams running multiple customers on one box.

**Hardware options on Orgo:** vCPU 1/2/4/8/16, RAM 4/8/16/32/64 GB, disk up to plan limit. Spect recommends: Solo (2vCPU/8GB/40GB), Business (4vCPU/16GB/80GB).

### 7. Tier structure (LOCKED July 14, 2026)

Five pricing tiers replaced with four clean ones on the live site:

| Tier | $/mo | Setup | Token cap | Audience |
|---|---|---|---|---|
| **DIY** | $0 | $499 | byo-key | Technical founders |
| **Starter** | $50 | $499 | 1.7B | Solo operators |
| **Pro** (most popular) | $99 | $499 | 5.1B | Daily operators |
| **Scale** | $199 | $499 | 12.5B | Multi-agent teams |
| **Enterprise** | custom | annual | negotiable | Compliance / on-prem |

**Strategic math behind this:** Munroe's underlying LLM is MiniMax. Buying MiniMax's flagship Token Plan at $50/month for 12.5B tokens means the API cost per customer is amortized across every shared customer on the same plan. Munroe's markup is on the box, the integration, and the human operator.

**Margin per customer at scale (10+ customers sharing one Max plan):**
- Starter ($50/mo): ~$45/mo margin after token cost
- Pro ($99/mo): ~$93/mo margin
- Scale ($199/mo): ~$192/mo margin
- Enterprise: built on top, custom

**Design choices reflected in the copy:**
- "Six agents" → "Unlimited specialists" everywhere. The customer can spin up as many as they want.
- "White-label" → "Enterprise" tier. We're not offering white-labeling; we offer capacity + compliance.
- "Add-ons" tier removed. The custom work conversation now lives in Enterprise and a future "Contact sales" path.
- Setup fee flat at $499 across all tiers. Selling setup as amortizable professional services, not a per-feature tax.
- DIY only free for the monthly. Setup at $499 covers the work session ("we install on your Mac, you keep the binary").

See `/Users/julylan/Projects/Numin/docs/index.html` `#pricing` section for the live implementation.


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

**Fast-follow:** domain (so the URL says Munroe), GH Pages slug rename, hosting for the dashboards.

Policy and product decisions above are not blocking ship — they're flagged for after first customer.
