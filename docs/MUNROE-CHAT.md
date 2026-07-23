# Munroe Chat — Product and Technical Brief

_Status: approved product direction; implementation foundation pending._

## Product definition

**Munroe Chat** is Munroe's browser-based AI workspace. It gives customers a dedicated place to chat with models, work with files and knowledge, use voice, run tools, and collaborate with their team.

It is a separate product surface from **Munroe Code**:

| Product | Primary job | Interface |
|---|---|---|
| **Munroe Chat** | Chat, documents, knowledge, team collaboration, multi-model work | Browser and installable web app |
| **Munroe Code** | Persistent agent execution, automations, skills, scheduled work, computer use | Messaging channels and agent runtime |

The products should connect, not collapse into one another. Munroe Chat is the visual workspace; Munroe Code is the persistent action layer.

## Delivery modes

### Munroe Chat Cloud

A managed browser application hosted by Munroe.

Customer-facing capabilities:

- Secure accounts and conversation history
- Model selection without exposing infrastructure vendors as the Munroe brand
- File upload and document chat
- Personal and shared knowledge bases
- Web search and browsing
- Voice input and spoken responses
- Image generation and editing where enabled
- Notes and reusable workspaces
- Team channels and shared conversations
- Roles, groups, and permissions
- Usage visibility and administrator controls
- Connection to the customer's Munroe Code agent

### Munroe Chat Local

A self-hosted installation on a customer-owned machine or private server.

Customer-facing capabilities:

- Local or private-network deployment
- Optional local-model operation
- Local file and knowledge access
- Persistent conversations stored on customer-controlled infrastructure
- Docker-based setup and updates
- Connection to Munroe Code Local
- Bring-your-own model access

## Foundation decision: Open WebUI

Open WebUI is a strong technical foundation rather than something Munroe should recreate from zero.

Observed upstream architecture at commit `ecd48e2` (Open WebUI 0.10.2, 2026-07-01):

- SvelteKit/Svelte 5 frontend
- Python FastAPI backend
- SQLite or PostgreSQL
- OpenAI-compatible and Ollama-compatible model connections
- Built-in RAG, memory, notes, channels, calendars, automations, voice, image generation, RBAC, OAuth/LDAP/SCIM, analytics, MCP/OpenAPI tools, and PWA support
- Docker, Python package, Kubernetes, and Helm deployment paths
- Approximately 4,904 text files and 536,849 text lines in the audited checkout

This saves years of commodity chat-platform work and lets Munroe focus on its differentiation:

1. Munroe design and onboarding
2. Munroe Code integration
3. Curated model access
4. The Munroe skills and automation system
5. Concierge deployment and support

## Licensing boundary

Open WebUI's current license is **not a normal permissive white-label license**.

It allows modification and redistribution, but current code requires the Open WebUI branding to remain unless one of these applies:

1. The deployment has no more than 50 individual end users in a rolling 30-day period.
2. Open WebUI gives specific written permission.
3. Munroe obtains an enterprise license that expressly permits rebranding.

The upstream code also enforces this presentation behavior: setting `WEBUI_NAME` to another value appends `" (Open WebUI)"` by default.

### Product consequence

Munroe can use the upstream platform for prototypes, internal testing, and small early deployments, but we must not present an unrestricted fully white-labeled fork as a settled commercial right.

Before a broad paid launch, choose one path:

- **Recommended:** obtain an Open WebUI enterprise/branding license.
- Keep visible `Open WebUI` attribution and sell Munroe's managed service/integration around it.
- Build a clean-room Munroe chat application against model and Munroe Code APIs. This is the most expensive path and should only be chosen if licensing economics are bad.

Do not remove upstream branding from deployments over the license threshold without written rights.

## Integration architecture

```text
Customer browser / PWA
        │
        ▼
Munroe Chat
  ├── Conversations and files
  ├── Knowledge and retrieval
  ├── Voice and media
  ├── Team spaces and permissions
  └── Munroe Code connector
             │
             ▼
      Munroe Code runtime
       ├── Persistent memory
       ├── Skills and tools
       ├── Scheduled work
       ├── Browser/computer use
       └── Messaging channels
```

### Recommended connector

Expose Munroe Code to Munroe Chat through an authenticated OpenAI-compatible endpoint or an OpenAPI/MCP tool server. This keeps the chat platform replaceable and avoids coupling Munroe Code to one upstream UI.

The connector should support:

- Streaming chat responses
- Per-customer authentication
- Conversation/user identity mapping
- Tool-call events and approval states
- File references rather than unrestricted filesystem access
- Request and usage logging
- Health checks
- Stable versioning

## Product boundary

Munroe Chat should not be sold as "another ChatGPT clone." The stronger position is:

> **The workspace where you talk to your models and your persistent Munroe agent in one place.**

Chat-only competitors stop when the browser tab closes. Munroe Chat can hand work to Munroe Code, which continues operating through schedules, tools, channels, and a persistent cloud or local computer.

## Initial release scope

### Phase 1 — internal product validation

- Run stock Open WebUI locally with persistent storage
- Connect one approved model endpoint
- Keep license-required attribution
- Add a Munroe Code connector proof of concept
- Validate chat, file upload, knowledge, voice, and mobile/PWA behavior
- Document the real resource footprint

### Phase 2 — Munroe pilot

- Obtain written branding rights or retain required attribution
- Add Munroe authentication and customer provisioning
- Add a restrained Munroe theme within licensed limits
- Connect each customer to their Munroe Code runtime
- Add backups, monitoring, rate limits, and support controls
- Pilot with fewer than 50 individual users while tracking the rolling-user limit

### Phase 3 — commercial cloud

- PostgreSQL and object storage
- Production secrets and encryption
- SSO/RBAC where required
- Multi-instance scaling and Redis-backed sessions
- Billing and plan enforcement
- Usage and cost controls
- Formal Open WebUI enterprise/branding agreement if using current upstream code

## Naming architecture

- **Munroe** — company
- **Munroe Code** — persistent agent runtime
- **Munroe Chat** — browser-based AI workspace
- **Munroe Cloud** — managed infrastructure/delivery layer, not a separate intelligence product

Customer-facing surfaces must not name internal agent, runtime, or model-provider brands.

## Commercial packaging recommendation

Do not create an entirely separate pricing ladder yet. Include Munroe Chat in paid Munroe Cloud subscriptions while we measure usage and support burden.

- **DIY:** optional local Munroe Chat installation during the $499 setup engagement
- **Starter:** private chat workspace for one user
- **Pro:** chat workspace plus deeper knowledge, voice/media, and Munroe Code connection
- **Scale:** team workspaces, roles, shared knowledge, analytics, and multiple agents
- **Enterprise:** SSO, provisioning, private deployment, compliance, SLA, and licensed custom branding

Pricing changes require a real infrastructure and model-cost test before publishing.
