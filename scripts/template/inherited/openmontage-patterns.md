# OpenMontage Patterns — Adopted by Numin

> Learned from [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage)
> Applied to all Numin agent tasks. Video-specific (slideshow_risk, render gates)
> does not apply to Numin's email/CRM/ops domain.

## 1. Scored Provider Selection (7-dim weighted)

When choosing between approaches, score on these dimensions:
- task_fit: 0.30
- output_quality: 0.20
- control: 0.15
- reliability: 0.15
- cost_efficiency: 0.10
- latency: 0.05
- continuity: 0.05

Score each candidate, log winner + alternatives considered + reason.

## 2. Checkpoint Protocol

Every multi-step task gets checkpoints:
- Write `in_progress` first (liveness signal — user knows it's not stalled)
- On completion: `completed` (autonomous) or `awaiting_human` (gated)
- Superseded checkpoints archived, never destroyed
- Gated stages cannot complete without explicit human_approved=true

## 3. Reviewer (CHAI Rules)

After completing any non-trivial work product, self-review on three axes:

**A**ccurate: Every finding points to a specific field/line/asset. No hallucinated
criticism. If you can't point to where the problem is, you're guessing.

**C**omplete: After finding one critical issue, scan for the same class. If you find
one bug, where else could the same bug be hiding? Pattern-match before returning.

**C**onstructive: Every critical finding MUST include a proposed_fix (concrete
replacement text, exact field value, or specific corrective action). A critical
finding without a proposed fix is downgraded to `investigation`.

Severity tiers:
- **critical**: must fix, blocks progress. Needs proposed_fix.
- **suggestion**: improves quality, doesn't block. Needs proposed_change.
- **nitpick**: minor polish, nice-to-have.
- **investigation**: real concern but fix is unclear. Don't block on it.

Decision: 0 critical → PASS. 1+ critical → REVISE (max 2 rounds, then PASS_WITH_WARNINGS).

## 4. Pre-commit Risk Gate

Before declaring work "done", score it on 6 dimensions (adapted from slideshow_risk):
- completeness: are all required pieces present?
- consistency: do all parts agree?
- clarity: is the user able to understand the result?
- correctness: does it actually solve the problem?
- presentation: does it look/feel polished?
- safety: does it avoid harmful side-effects?

<2 strong, <3 acceptable, <4 revise, ≥4 fail — do not declare done.

## 5. Capability Extension Protocol

Before writing any new tool/script, classify the gap:
- **One-off transform** (specific to current task): write project-scoped script
- **Recurring need** (will repeat): build reusable tool
- **Missing provider** (need new API): tool wrapper inheriting contract
- **Missing knowledge** (don't know how): web research → document as skill

Ad-hoc scripts MUST be:
- Idempotent (safe to re-run)
- Scoped (writes only to project workspace)
- Logged (decision trail entry)
- User-informed ("I wrote a custom script because no existing tool covers this")

Forbidden:
- Calling external APIs without user approval
- Modifying existing tools (create wrappers instead)
- Skipping the decision log
- Side effects beyond output file

## 6. Decision Audit Trail

Every non-obvious choice logged:
```json
{
  "decision_id": "ext-001",
  "stage": "<current stage>",
  "category": "capability_extension",
  "subject": "Created custom <script|playbook|skill|tool> for <purpose>",
  "options_considered": [
    {"option_id": "existing-tool", "label": "<closest existing tool>", "rejected_because": "<why>"},
    {"option_id": "extension", "label": "<what was created>", "reason": "<why this approach>"}
  ],
  "selected": "extension",
  "reason": "<concise justification>",
  "user_visible": true,
  "confidence": 0.8
}
```

## 7. Three-Layer Knowledge Architecture

When learning a new repo or system, classify each artifact:

- **Layer 1 (what exists)**: tools, manifests, executable code
- **Layer 2 (how to use it)**: skills, conventions, quality bars
- **Layer 3 (how it works)**: provider/technology knowledge packs

This applies to Numin's own structure too:
- L1: Numin's tools, integrations, agents
- L2: Numin's skills (this file is L2)
- L3: Underlying provider knowledge (Hermes Agent, MCP servers, etc.)
