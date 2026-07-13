/**
 * NuminLanding — The real Numin landing page
 * Mounts src/landing.css (gold-on-black OrbitAI-derived design system)
 * Home/Cloud tab toggle: gold (Home, runs on your Mac) vs blue (Cloud, Orgo white-labeled)
 */
import { useState } from "react";
import NuminVsAI from "./NuminVsAI";

const SKINS = {
  home: {
    id: "home" as const,
    label: "Home",
    accent: "#C9A84C",
    accentLight: "#f0d078",
    accentDim: "#E8D5A3",
    accentDeep: "#9c7e2a",
    sub: "Run on your Mac",
    cta: "Start free trial",
    heroBadge: "YOUR AI EMPLOYEE · RUNNING LOCALLY",
    line1: "Six agents.",
    line1b: "One business.",
    line2: "Running",
    line2b: "on your Mac.",
    subcopy: "Numin deploys six specialized AI agents on-site at your company. They handle operations, sales, support, and communications — 24/7, all on your own hardware.",
    ctaNote: "No credit card · Apple Silicon Mac or Orgo Cloud · Hermes-powered",
    ctaPrimary: "Start free trial →",
    ctaSecondary: "▶ Watch demo",
    benefitEyebrow: "The Numin advantage",
    benefitHeadline1: "Most AI tools",
    benefitHeadline1Dim: "answer questions.",
    benefitHeadline2: "Numin",
    benefitHeadline2Dim: "runs",
    benefitHeadline2Suffix: " your business.",
    benefitBody: "ChatGPT is a conversation. Numin is an operating system. The difference is memory, action, and ownership.",
  },
  cloud: {
    id: "cloud" as const,
    label: "Cloud",
    accent: "#3e9cff",
    accentLight: "#7ec3ff",
    accentDim: "#b8dbff",
    accentDeep: "#1e6fc4",
    sub: "White-labeled Orgo Cloud",
    cta: "Start cloud trial",
    heroBadge: "YOUR AI EMPLOYEE · WHITE-LABELED CLOUD",
    line1: "Six agents.",
    line1b: "Zero hardware.",
    line2: "Hosted",
    line2b: "on Orgo Cloud.",
    subcopy: "Get the full Numin experience without buying a Mac. We provision a dedicated cloud Mac, brand it as your own, and you log in from any browser.",
    ctaNote: "No credit card · Browser access · White-labeled as Numin Cloud",
    ctaPrimary: "Provision your agent →",
    ctaSecondary: "▶ Watch cloud demo",
    benefitEyebrow: "The cloud advantage",
    benefitHeadline1: "Most AI tools",
    benefitHeadline1Dim: "need your hardware.",
    benefitHeadline2: "Numin Cloud",
    benefitHeadline2Dim: "runs",
    benefitHeadline2Suffix: " on ours.",
    benefitBody: "Skip the Mac mini. Skip the install. We spin up a dedicated cloud Mac pre-configured with your agents, white-labeled as Numin Cloud, ready in minutes.",
  },
} as const;

type SkinId = keyof typeof SKINS;

const NAV_LINKS = [
  { href: "#agents", label: "Agents" },
  { href: "#advantage", label: "Advantage" },
  { href: "#dashboard", label: "Dashboard" },
];

const AGENT_PILLS = [
  { name: "ARIA", state: "active" },
  { name: "VANCE", state: "active" },
  { name: "NEXUS", state: "active" },
  { name: "PRISM", state: "active" },
  { name: "APEX", state: "active" },
  { name: "NUMIN", state: "active" },
];

const AUDIENCE_TAGS = [
  "Founders", "Agencies", "Consultants", "E-commerce", "Real Estate",
  "Coaches", "Sales Teams", "Ops Teams", "Marketing Teams",
];

const ADVANTAGE_CARDS = [
  {
    icon: "◈",
    title: "Memory that grows",
    body: "Numin learns your business from every conversation, every task, every decision. The longer it runs, the sharper it gets.",
  },
  {
    icon: "▲",
    title: "Agents that act",
    body: "Not chatbots that suggest — agents that execute. Send email, update CRM, book meeting, close ticket. While you sleep.",
  },
  {
    icon: "⬡",
    title: "Trained on you",
    body: "Your products, your clients, your voice. Numin doesn't answer like a generic AI. It answers like your team.",
  },
];

const BENTO_CELLS = [
  {
    cls: "bento-cell bento-cell-large",
    icon: "◈",
    title: "Six specialized agents",
    dim: " working as one team",
    desc: "ARIA researches. VANCE builds. NEXUS coordinates. PRISM writes. APEX sells. NUMIN orchestrates. Each owns a domain — together they run your business.",
    mock: (
      <div className="bento-mock">
        {["ARIA · Research", "VANCE · Build", "NEXUS · Plan", "PRISM · Write", "APEX · Sell", "NUMIN · Orchestrate"].map((row, i) => (
          <div className="bento-mock-row" key={i}>
            <span>{row}</span>
            <span className={i === 1 ? "badge-optimized" : "badge-high"}>{i === 1 ? "active" : "idle"}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    cls: "bento-cell bento-cell-top-right",
    icon: "⬡",
    title: "Always on",
    dim: ", never waiting",
    desc: "Runs 24/7. Monitors inbox overnight, surfaces the urgent stuff, drafts the rest. You wake up to a triaged morning.",
    mock: (
      <div className="mini-stats">
        <div className="mini-stat"><div className="mini-stat-val">142</div><div className="mini-stat-lbl">emails triaged</div></div>
        <div className="mini-stat"><div className="mini-stat-val">8</div><div className="mini-stat-lbl">meetings booked</div></div>
        <div className="mini-stat"><div className="mini-stat-val">3</div><div className="mini-stat-lbl">deals updated</div></div>
      </div>
    ),
  },
  {
    cls: "bento-cell bento-cell-bottom-left",
    icon: "▲",
    title: "Real integrations",
    dim: ", real actions",
    desc: "Gmail, Calendar, Slack, Notion, HubSpot, Salesforce, Pipedrive, Stripe, and 1,000+ more. Numin lives inside your stack.",
    mock: (
      <div className="bento-check-list">
        {["Email · Gmail + Outlook", "Calendar · Google + Apple", "CRM · HubSpot + Salesforce", "Comms · Slack + Teams"].map((item) => (
          <div className="bento-check-item" key={item}>{item}</div>
        ))}
      </div>
    ),
  },
  {
    cls: "bento-cell bento-cell-bottom-right",
    icon: "◆",
    title: "Built for output",
    dim: ", not conversation",
    desc: "Most AI tools answer questions. Numin closes loops. Less typing, more shipping.",
    mock: (
      <div className="bar-chart">
        {[40, 55, 35, 70, 50, 85, 60, 90, 75, 100].map((h, i) => (
          <div className={`bar ${i === 9 ? "active" : ""}`} key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
    ),
  },
];

const FOOTER_LINKS = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Support" },
  { href: "#", label: "Status" },
];

function TabToggle({ skin, onChange }: { skin: SkinId; onChange: (s: SkinId) => void }) {
  return (
    <div className="lp-tab-toggle" role="tablist" aria-label="Deployment model">
      {(Object.keys(SKINS) as SkinId[]).map((id) => {
        const s = SKINS[id];
        return (
          <button
            key={id}
            role="tab"
            aria-selected={skin === id}
            className={`lp-tab ${skin === id ? "active" : ""}`}
            onClick={() => onChange(id)}
            style={{
              ["--tab-accent" as any]: s.accent,
            }}
          >
            <span className="lp-tab-dot" />
            <span className="lp-tab-label">{s.label}</span>
            <span className="lp-tab-sub">{s.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function NuminLanding() {
  const [skin, setSkin] = useState<SkinId>("home");
  const s = SKINS[skin];

  return (
    <div
      className={`lp-page skin-${skin}`}
      style={{
        ["--accent" as any]: s.accent,
        ["--accent-light" as any]: s.accentLight,
        ["--accent-dim" as any]: s.accentDim,
        ["--accent-deep" as any]: s.accentDeep,
      }}
    >
      {/* Background layers */}
      <div className="stars-layer" aria-hidden="true" />
      <div className="hero-nebula" aria-hidden="true" />
      <div className="hero-grid-overlay" aria-hidden="true" />
      <div className="hero-orb hero-orb-1" aria-hidden="true" />
      <div className="hero-orb hero-orb-2" aria-hidden="true" />
      <div className="hero-orb hero-orb-3" aria-hidden="true" />
      <div className="orbit-arc orbit-arc-1" aria-hidden="true" />
      <div className="orbit-arc orbit-arc-2" aria-hidden="true" />
      <div className="orbit-arc orbit-arc-3" aria-hidden="true" />
      <div className="planet planet-main animate-float-planet" aria-hidden="true" />
      <div className="planet planet-small" aria-hidden="true" />

      {/* Nav */}
      <nav className="lp-nav">
        <a href="/" className="lp-nav-logo">
          numin<span className="lp-nav-logo-dot">.</span>
        </a>
        <ul className="lp-nav-links">
          {NAV_LINKS.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
        </ul>
        <div className="lp-nav-actions">
          <a className="btn-nav-signin" href="/workspace">Sign in</a>
          <a className="btn-nav-cta" href="/workspace">{s.cta}</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <TabToggle skin={skin} onChange={setSkin} />
        <div className="hero-badge">
          <span className="hero-badge-dot">N</span>
          {s.heroBadge}
        </div>
        <h1 className="animate-reveal">
          <span className="dim">{s.line1}</span> <span className="text-shimmer">{s.line1b}</span><br />
          <span className="dim">{s.line2}</span> <span style={{ color: "var(--accent)" }}>{s.line2b}</span>
        </h1>
        <p className="lp-hero-sub animate-reveal animate-reveal-d1">
          {s.subcopy}
        </p>
        <div className="lp-hero-btns animate-reveal animate-reveal-d2">
          <a className="btn-primary-hero" href="/workspace">
            {s.ctaPrimary}
          </a>
          <a className="btn-ghost-hero" href="/demo">
            {s.ctaSecondary}
          </a>
        </div>
        <div className="agent-strip">
          <span className="agent-strip-label">Live</span>
          {AGENT_PILLS.map((a) => (
            <span className="agent-pill" key={a.name}>
              <span className={`agent-pill-dot ${a.state}`} />
              {a.name}
            </span>
          ))}
        </div>
        <div className="lp-dashboard-preview animate-reveal animate-reveal-d3">
          <div style={{ padding: "60px 32px", textAlign: "center", color: "#5c6178" }}>
            [ Dashboard preview · renders real Numin app on scroll ]
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="audience-section">
        <h2 className="audience-heading">
          Built for <span className="cyan">operators</span> who don't want to hire
        </h2>
        <div className="audience-grid">
          {AUDIENCE_TAGS.map((t, i) => (
            <div className={`audience-tag ${i === 0 ? "active" : ""}`} key={t}>
              <span className="dot" /> {t}
            </div>
          ))}
        </div>
        <div className="audience-planet-wrap" aria-hidden="true">
          <div className="planet planet-main" style={{ bottom: "-100px" }} />
        </div>
        <p className="audience-footer-text">
          If you run a business and your time is the bottleneck — <span className="dim">Numin is the lever.</span>
        </p>
      </section>

      {/* Advantage */}
      <section className="advantage-section" id="advantage">
        <div className="advantage-eyebrow">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          {s.benefitEyebrow}
        </div>
        <h2 className="advantage-heading">
          {s.benefitHeadline1} <span className="dim">{s.benefitHeadline1Dim}</span><br />
          {s.benefitHeadline2} <span className="dim">{s.benefitHeadline2Dim}</span>{s.benefitHeadline2Suffix}
        </h2>
        <p className="advantage-body-text">
          {s.benefitBody}
        </p>
        <div className="advantage-cards-row">
          {ADVANTAGE_CARDS.map((c) => (
            <div className="advantage-card" key={c.title}>
              <div className="icon-wrap">{c.icon}</div>
              <div className="card-bullet">{c.title}</div>
              <div className="card-body-text">{c.body}</div>
            </div>
          ))}
        </div>
        <p className="advantage-tagline">
          One subscription. <span className="bright">Six agents.</span> Your entire back office.
        </p>
      </section>

      {/* Bento */}
      <section className="bento-section" id="agents">
        <div className="bento-eyebrow">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          Inside Numin
        </div>
        <h2 className="bento-heading">
          Six specialized agents, <span style={{ color: "rgba(247,249,252,0.45)", fontWeight: 300 }}>one shared brain</span>
        </h2>
        <p className="bento-sub">Each agent owns a domain. Together they run the company.</p>
        <div className="bento-grid">
          {BENTO_CELLS.map((cell) => (
            <div className={cell.cls} key={cell.title}>
              <div className="bento-icon-wrap">{cell.icon}</div>
              <h3 className="bento-title">
                {cell.title}<span>{cell.dim}</span>
              </h3>
              <p className="bento-desc">{cell.desc}</p>
              {cell.mock}
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard showcase */}
      <section className="dashboard-section" id="dashboard">
        <div className="dashboard-section-inner">
          <h2 className="dashboard-showcase-heading">
            One dashboard. <span className="dim">Every metric.</span><br />
            <span className="dim">Every</span> agent.
          </h2>
          <p className="dashboard-showcase-sub">
            Real-time visibility into what your agents are doing, what's blocked, and what's ready for your attention.
          </p>
          <div className="dashboard-full-card">
            <div style={{ padding: "100px 32px", textAlign: "center", color: "#5c6178" }}>
              [ Dashboard screenshot · pending real capture ]
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-heading">
          Stop managing.<br />
          <span style={{ color: "var(--accent)" }}>Start operating.</span>
        </h2>
        <p className="cta-sub">14-day free trial. Runs on your Mac. No cloud required.</p>
        <div className="lp-hero-btns">
          <a className="btn-primary-hero" href="/workspace">
            {s.ctaPrimary}
          </a>
          <a className="btn-ghost-hero" href="/demo">{s.ctaSecondary}</a>
        </div>
        <p className="cta-note">{s.ctaNote}</p>
        <div className="cta-planet-wrap" aria-hidden="true">
          <div className="cta-arc" style={{ width: 600, height: 600 }} />
          <div className="cta-arc" style={{ width: 900, height: 900 }} />
          <div className="cta-planet-main" />
          <div className="cta-planet-small" />
        </div>
      </section>

      {/* Numin vs AI */}
      <NuminVsAI />

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">
          numin<span>.</span>
        </div>
        <div className="lp-footer-links">
          {FOOTER_LINKS.map((l) => (
            <a key={l.label} href={l.href}>{l.label}</a>
          ))}
        </div>
        <div className="lp-footer-social">
          {["X", "in", "GH"].map((s) => (
            <a key={s} className="social-icon" href="#">{s}</a>
          ))}
        </div>
      </footer>
      <div className="lp-footer-bottom">
        © 2026 Numin · Your AI Employee, Running Locally
      </div>
    </div>
  );
}