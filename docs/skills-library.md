# Munro Code Skill Library

_Every customer box ships with **Munro Code**: Hermes agent + 53 pre-installed skills._

The customer sees **9 categories** of skills in their dashboard. The **agent infrastructure layer** (12 skills) runs silently — it's what makes the agent adaptive, proactive, and self-improving. Customers don't pick those; we maintain them.

---

## What customers see

**41 skills across 9 categories.** Customer picks which ones are enabled for their box. Default: all enabled.

### 1. Sales & Outreach

_Find leads, write the message, send the followup._

| Skill | What it does |
|---|---|
| **apollo** | Enrich people and company records, build targeted lead lists from Apollo.io. |
| **apify-lead-generation** | Generate B2B/B2C leads by scraping Google Maps, Instagram, LinkedIn, TikTok, Facebook. |
| **cold-outreach** | Cold email, SMS, LinkedIn DM sequences using Hormozi, Cleverly, and Hypergen frameworks. |
| **business-development** | Partnership outreach, market research, competitor analysis, proposal generation. |
| **x-twitter** | Read tweets, search, post, like, retweet — turn X into a sales channel. |
| **summarize** | Summarize URLs, PDFs, images, audio, YouTube videos for sales research. |

### 2. Marketing & Content

_Brand voice, GTM, content production, distribution._

| Skill | What it does |
|---|---|
| **content-creator** | SEO-optimized marketing content with consistent brand voice. |
| **marketing-strategy-pmm** | Positioning, GTM strategy, competitive intelligence, product launches. |
| **go-to-market** | Build a go-to-market plan for a new product or market entry. |
| **adaptlypost** | Schedule and manage social media posts across Instagram, X, Bluesky, TikTok, Threads, LinkedIn. |
| **listing-swarm** | Submit your AI product to 70+ AI directories with automated form filling. |
| **chrome-relay** | Browse the web for content research, SEO audits, competitive analysis. |

### 3. Finance & Markets

_Stocks, crypto, prediction markets, portfolio tracking._

| Skill | What it does |
|---|---|
| **yahoo-finance** | Stock prices, quotes, fundamentals, earnings, options, dividends, analyst ratings. |
| **stock-analysis** | Analyze stocks and crypto with portfolio management and watchlist alerts. |
| **aisa-financial-data** | Real-time and historical financial data across equities and crypto. |
| **ai-screener** | Bullish/Bearish stock and crypto screener with daily/weekly/monthly signals. |
| **btc-analyzer** | Live BTC/USDT 15m candles with EMA20 and RSI14 direction analysis. |
| **beetrade** | Connect to Beetrade for auth, market data, bot strategies, alerts. |
| **polymarketodds** | Query Polymarket prediction markets — odds, trends, momentum. |

### 4. Research & Discovery

_News, transcripts, feed monitoring._

| Skill | What it does |
|---|---|
| **news-summary** | Daily news digests pulled from curated sources. |
| **feed-diet** | Audit your information diet across Hacker News and RSS feeds. |
| **youtube-watcher** | Fetch and read YouTube transcripts — summarize or answer questions. |

### 5. Knowledge & Memory

_Long-term memory, notes, document tooling._

| Skill | What it does |
|---|---|
| **elite-longterm-memory** | Persistent memory across agents: WAL protocol, vector search, git-notes. |
| **qmd** | Local hybrid search across markdown notes and docs. |
| **notion** | Read, search, and write Notion pages, databases, and blocks. |
| **markdown-converter** | Convert PDF, Word, PowerPoint, Excel, audio, images to Markdown. |
| **nano-pdf** | Edit PDFs with natural-language instructions. |

### 6. Productivity & Planning

_Daily planning, task tracking, executive coaching._

| Skill | What it does |
|---|---|
| **adhd-founder-planner** | BuJo-style daily planning with swim lanes, dopamine menu, evening reflection. |
| **agent-daily-planner** | Structured daily planning and execution tracking across sessions. |
| **briefing** | Daily briefing — calendar, todos, weather in one shot. |
| **agent-step-sequencer** | Multi-step scheduler: detects when a request needs a plan before executing. |
| **daily-review-ritual** | End-of-day review: progress, insights, plan tomorrow. |
| **crucial-conversations-coach** | Executive coach for high-stakes conversations. |

### 7. Engineering & Code

_Build interfaces, ship faster, track costs._

| Skill | What it does |
|---|---|
| **frontend-design** | Distinctive, production-grade frontend interfaces. |
| **claude-cost-cli** | Query Claude API usage and cost reports from the command line. |
| **free-ride** | Auto-rank free models on OpenRouter and configure fallbacks. |

### 8. Browser & Computer Use

_Headless browsers, screen capture, system automation._

| Skill | What it does |
|---|---|
| **agent-browser** | Rust-based headless browser CLI for AI agent navigation. |
| **peekaboo** | Capture and automate macOS UI with natural-language commands. |
| **warp-bridge** | Stream agent runs into a live Warp terminal session. |

### 9. Health & Personal

_Wearables, calories, body data._

| Skill | What it does |
|---|---|
| **health-sync** | Analyze synced data across Oura, Withings, Hevy, Strava, WHOOP, Eight Sleep. |
| **calorie-counter** | Track daily calorie and protein intake, set goals, log weight. |

---

## What we ship silently (Agent Infrastructure)

These 12 skills ship in every Munro Code box but don't appear on the customer skill picker. They're how the agent thinks, learns, and improves itself. We maintain and update them centrally — customers get improvements automatically.

| Skill | What it does |
|---|---|
| **adaptive-reasoning** | Assess task complexity on every message and adjust reasoning depth. |
| **proactive-agent** | Transform the agent from a task-follower into a partner that anticipates needs. |
| **self-improving-agent** | Capture learnings from errors and corrections to compound over time. |
| **close-loop** | End-of-session workflow: ship, consolidate memory, apply improvements. |
| **context-aware-delegation** | Hand isolated sessions (cron, sub-agents) full context from the main session. |
| **intent-router** | Watch every message, classify intent, auto-route to the right system. |
| **find-skills** | Discover and install the right skill for the user's question. |
| **automation-workflows** | Identify repetitive workflows and design automations for them. |
| **auto-updater** | Daily check for new skill versions; auto-applies on schedule. |
| **task-logger** | Auto-log completed work to your dashboard after every session. |
| **clawdhub** | Browse, install, and publish skills from the public skill registry. |
| **openclaw-backup** | Backup and restore agent data — schedules and one-click restore. |

---

## How this ships

Every customer box is provisioned from `system/munro-code@1.0.0` — a custom Orgo template built on top of `system/hermes-agent@1.0.0`. The template includes:

```
FROM system/hermes-agent:1.0.0
COPY ./skills/* /root/.hermes/skills/
COPY ./prompts/* /root/.hermes/prompts/
COPY ./inherited/* /root/.hermes/inherited/
RUN hermes doctor
```

This is the strategic asset Munro sells: **the same skill library, tuned and battle-tested, baked into every customer's box from minute zero.** A new customer doesn't install skills — they get them.

**When we ship a new skill, every existing customer gets it on next agent restart.**

---

_Last inventory: July 14, 2026. Source: `~/Projects/zoras-memory-system/skills/` (canonical)._
