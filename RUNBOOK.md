# Munro — Runbook

This is the single source of truth for what's shipped, what's not, and what decisions are pending.

---

## Live NOW (pushed to GH Pages)

- **Landing page**: `https://verstige.github.io/numin-io/` — fully rebranded to Munro. 16 sections, gold accent, working comparison cards, FAQ, pricing tiers, credit packs.
- **Source**: `docs/index.html` (single self-contained file, 220KB, 4,200+ lines)
- **Brand**: All references read "Munro" (105 occurrences). Zero "numin" / "Numin" / "NUMIN" anywhere.
- **Title**: "Munro — The AI agent that knows your business"
- **GitHub**: `Verstige/numin-io` (slug kept for SEO; rename is a separate decision in §Open decisions)

## Built but not deployed (in repo)

| Asset | Path | What it is | How to deploy |
|---|---|---|---|
| Customer dashboard | `dashboard/index.html` | Customer-facing UI: billing portal link, Orgo remote, skill marketplace UI | Host on a real domain (Vercel, Railway, Netlify). Auth-gate before showing real customer data. |
| Admin dashboard | `admin/index.html` | Operations UI: customer list, skill publishing, library | Same. `noindex,nofollow` is set. Add a password-gate / IP allowlist in front. |
| Onboarding form | `onboarding/index.html` | 6-step customer intake (business, goals, current stack, pain points, AI spend, channel) | Points at `formspree.io/f/your-form-id`. Replace with your Formspree ID, OR plug into Supabase. |
| Provisioning script | `scripts/provision.sh` | Bash: per-customer Orgo box + Hermes install + channel wire + Supabase record + operator Telegram DM | Set env vars (see script comments). Run per new customer. |
| ToS / Privacy / Refund | `legal/` | Plain-language templates for the 3 legal docs | Replace placeholders ([YOUR STATE], Stripe portal URLs). Have a lawyer review. |

## Not built yet (waiting on decisions, accounts, or both)

These are the items I cannot finish without you. They are listed in priority order.

### 1. Stripe products + checkout (BLOCKER for revenue)

You need:

- A Stripe account in your name (your business entity: sole prop / LLC)
- Products created: $499 one-time Setup + $99/mo Solo Subscription
- Stripe Customer Portal enabled (free, in Stripe dashboard)
- Two URLs I need: a Stripe "Payment Link" for the Setup, and the Customer Portal URL

**What I'll do once you have those**: wire `scripts/provision.sh` to take the Stripe customer ID as the second arg, and update the landing CTAs to point at the Payment Link.

### 2. Supabase project (BLOCKER for records)

You need a Supabase project. Costs $0 on free tier for <500MB / <50K rows.

Two tables needed:

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

### 3. Domain registration (BLOCKER for shareability)

`verstige.github.io/numin-io/` is a placeholder URL. You need a real domain.

Pick one (most user-friendly to least):

- `munro.ai` (~$80/yr, hard to get, premier feel)
- `getmunro.ai` (~$30/yr fall-back)
- `usemunro.com` (~$12/yr, cheap, fine for v1)
- `munro.run` (cloud-coded feel)

I'd go with `munro.ai` if available. Verify on Namecheap/Cloudflare.

If you buy `munro.ai`, set it as a CNAME to `verstige.github.io`. GH Pages supports custom domains under Settings → Pages.

### 4. Renaming the GH Pages repo / slug

The repo is currently `Verstige/numin-io`. That URL has accumulated (some) inbound links.

Two options:

- **Keep slug `numin-io`**: preserves inbound. Visitors see `verstige.github.io/numin-io/` forever. Awkward brand match.
- **Rename to `Verstige/munro`**: clean brand match. URL changes to `verstige.github.io/munro/`. Old inbound links 404.

I'd recommend: rename the repo, keep an HTTP redirect from the old slug. Will take ~10 min once you decide.

### 5. Hosting the dashboard + admin

The dashboards are static HTML right now. They need a backend to:

- Authenticate customers (Stripe email + magic link)
- Persist customer records (Supabase above)
- Hide admin behind a gate

Recommended: Vercel (free tier) with Next.js wrappers. Or Railway/VPS if you want self-hosted. I'll prep a Next.js scaffold when you pick.

### 6. Orgo image bake

`scripts/provision.sh` references `${MUNRO_BASE_IMAGE:-munro-base-v1}` — a pre-baked OS image with Hermes installed. **You need to bake this once** on Orgo, then every new customer box is spun up from it in seconds instead of installing from scratch.

Bake procedure:

1. Provision a fresh Orgo box
2. SSH in
3. Install Hermes / your agent code
4. Configure the default Telegram bot skeleton
5. Snapshot via Orgo API → save as `munro-base-v1`
6. Document the procedure so you can rebuild when the agent code updates

### 7. Decisions still pending

These I genuinely cannot guess. Each one is one sentence. Please answer them when you can:

- **Tier structure on landing**: keep all 5 tiers, gut to 1 ($499/$99), or somewhere in between? (Solo is now $99/mo; rest of ladder needs your call.)
- **Customer identity model**: Magic-link email, Google OAuth, or both?
- **Channel default for new customers**: Telegram (fastest), iMessage (requires BlueBubbles gateway on each Mac box, slower), or letting customer pick at onboarding?
- **Refund-window length**: 30 days (industry standard) or something else?
- **LLC vs sole prop**: doesn't change the code but affects Stripe Account setup timing
- **Admin auth**: simple password, Vercel password protection, IP allowlist, or something stronger?

I do not need answers all at once. Each unblocks a separate piece.

---

## TL;DR

- **Landing rebrand to Munro is live** ✓
- **Pricing headline updated, Solo $99/mo** ✓ (rest of tiers need your call)
- **Customer dashboard, admin dashboard, onboarding form, provisioning script, legal templates all built in repo** ✓
- **Stripe / Supabase / domain / Orgo image bake all blocked on your accounts** ⏸
- **Tier structure decision still pending** ⏸

When you're ready to go live, start here: create Stripe products + buy domain. Everything else chains off those two.
