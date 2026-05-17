<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Semi — Breaking the One-Day Millionaire Cycle</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0B1612;
    --bg2: #111E18;
    --bg3: #162419;
    --surface: #1A2D24;
    --surface2: #1F3328;
    --border: rgba(198,237,196,0.10);
    --border2: rgba(198,237,196,0.18);
    --accent: #4ECDA4;
    --accent2: #C6EDC4;
    --accent3: #2E8B6B;
    --text: #E8F5E4;
    --text2: #99C4A8;
    --text3: #5A8A6A;
    --warn: #F0C060;
    --serif: 'DM Serif Display', Georgia, serif;
    --sans: 'DM Sans', system-ui, sans-serif;
    --mono: 'DM Mono', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--sans);
    background-color: var(--bg);
    color: var(--text);
    line-height: 1.7;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
  }

  /* ─── HERO ─── */
  .hero {
    position: relative;
    text-align: center;
    padding: 100px 40px 80px;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(78,205,164,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 20% 80%, rgba(78,205,164,0.04) 0%, transparent 60%);
    pointer-events: none;
  }

  .cicada-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(78,205,164,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(78,205,164,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 0%, transparent 75%);
    pointer-events: none;
  }

  .logo-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    margin-bottom: 28px;
  }

  .logo-inner {
    font-family: var(--serif);
    font-size: 32px;
    color: var(--accent);
    font-style: italic;
    line-height: 1;
  }

  .hero h1 {
    font-family: var(--serif);
    font-size: clamp(48px, 8vw, 80px);
    font-weight: 400;
    letter-spacing: -1px;
    color: var(--text);
    line-height: 1.1;
    margin-bottom: 20px;
  }

  .hero h1 em {
    font-style: italic;
    color: var(--accent);
  }

  .hero .tagline {
    font-size: 18px;
    font-weight: 300;
    color: var(--text2);
    max-width: 420px;
    margin: 0 auto 36px;
    letter-spacing: 0.01em;
  }

  .badges {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid var(--border2);
    background: var(--surface);
    color: var(--text2);
  }

  .badge.active {
    background: rgba(78,205,164,0.12);
    border-color: rgba(78,205,164,0.35);
    color: var(--accent);
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.75); }
  }

  /* ─── DIVIDER ─── */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, var(--border2) 30%, var(--border2) 70%, transparent 100%);
    margin: 0 40px;
  }

  /* ─── LAYOUT ─── */
  .content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 40px 100px;
  }

  /* ─── SECTION ─── */
  .section {
    padding: 60px 0 0;
  }

  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent3);
    margin-bottom: 14px;
  }

  .section-label::before {
    content: '';
    display: block;
    width: 24px;
    height: 1px;
    background: var(--accent3);
  }

  h2 {
    font-family: var(--serif);
    font-size: 36px;
    font-weight: 400;
    color: var(--text);
    line-height: 1.2;
    margin-bottom: 20px;
  }

  h2 em {
    font-style: italic;
    color: var(--accent2);
  }

  p {
    color: var(--text2);
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 16px;
  }

  strong {
    color: var(--text);
    font-weight: 600;
  }

  /* ─── NAME ORIGIN CARDS ─── */
  .origin-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 32px;
  }

  @media (max-width: 580px) {
    .origin-grid { grid-template-columns: 1fr; }
  }

  .origin-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.25s, background 0.25s;
  }

  .origin-card:hover {
    border-color: var(--border2);
    background: var(--surface2);
  }

  .origin-card::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    background: radial-gradient(circle at 100% 0%, rgba(78,205,164,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .origin-num {
    font-family: var(--serif);
    font-size: 48px;
    font-style: italic;
    color: rgba(78,205,164,0.15);
    line-height: 1;
    margin-bottom: 12px;
  }

  .origin-title {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .origin-card p {
    font-size: 14px;
    margin-bottom: 0;
    color: var(--text2);
  }

  /* ─── MISSION LIST ─── */
  .mission-list {
    list-style: none;
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mission-list li {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    transition: border-color 0.2s;
  }

  .mission-list li:hover {
    border-color: var(--border2);
  }

  .mission-list li:last-child {
    border-color: rgba(78,205,164,0.25);
    background: rgba(78,205,164,0.05);
  }

  .mission-icon {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
    font-size: 12px;
  }

  .mission-icon.check {
    background: rgba(78,205,164,0.15);
    color: var(--accent);
  }

  .mission-icon.star {
    background: rgba(240,192,96,0.15);
    color: var(--warn);
  }

  .mission-list li span {
    font-size: 15px;
    color: var(--text2);
    line-height: 1.6;
  }

  .mission-list li span strong {
    color: var(--text);
  }

  /* ─── FEATURES GRID ─── */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 32px;
  }

  .feature-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 24px;
    transition: border-color 0.2s, transform 0.2s;
  }

  .feature-card:hover {
    border-color: var(--border2);
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(78,205,164,0.1);
    border: 1px solid rgba(78,205,164,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    font-size: 18px;
  }

  .feature-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }

  .feature-desc {
    font-size: 13px;
    color: var(--text3);
    line-height: 1.6;
    margin: 0;
  }

  /* ─── PRIVATE BADGE ─── */
  .private-highlight {
    margin-top: 32px;
    background: linear-gradient(135deg, rgba(78,205,164,0.06) 0%, rgba(78,205,164,0.02) 100%);
    border: 1px solid rgba(78,205,164,0.2);
    border-radius: 16px;
    padding: 28px 32px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .lock-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(78,205,164,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .private-highlight h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--accent2);
    margin-bottom: 4px;
  }

  .private-highlight p {
    font-size: 14px;
    margin: 0;
    color: var(--text3);
  }

  /* ─── TESTING BANNER ─── */
  .testing-banner {
    margin-top: 60px;
    border: 1px solid var(--border2);
    border-radius: 20px;
    padding: 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
    background: var(--bg2);
  }

  .testing-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 60% at 50% 100%, rgba(78,205,164,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .testing-banner .section-label {
    justify-content: center;
  }

  .testing-banner h2 {
    font-size: 28px;
    margin-bottom: 12px;
  }

  .testing-banner p {
    max-width: 440px;
    margin: 0 auto;
    font-size: 15px;
  }

  .caption {
    margin-top: 56px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
    text-align: center;
    font-size: 13px;
    color: var(--text3);
    letter-spacing: 0.02em;
  }

  .caption em {
    font-style: italic;
    color: var(--text2);
  }
</style>
</head>
<body>

<!-- HERO -->
<header class="hero">
  <div class="cicada-grid"></div>
  <div class="logo-wrap">
    <span class="logo-inner">S</span>
  </div>
  <h1>Semi<em>.</em></h1>
  <p class="tagline">Breaking the one-day millionaire cycle.</p>
  <div class="badges">
    <span class="badge active"><span class="badge-dot"></span>Testing Phase</span>
    <span class="badge">Android &amp; iOS</span>
    <span class="badge">100% Offline</span>
  </div>
</header>

<div class="divider"></div>

<main class="content">

  <!-- WHAT IS SEMI -->
  <section class="section">
    <div class="section-label">Origin</div>
    <h2>What is <em>Semi?</em></h2>
    <p>
      The name carries two meanings that cut right to the heart of what this app is built to solve —
      one rooted in Filipino payday culture, one borrowed from nature.
    </p>
    <div class="origin-grid">
      <div class="origin-card">
        <div class="origin-num">01</div>
        <div class="origin-title">Filipino Payday</div>
        <p>
          <strong>"Semi"</strong> is short for <em>semi-monthly salary</em> — the familiar payday cycle
          that arrives every 15th and 30th of the month.
          <em>Tuwing semi.</em>
        </p>
      </div>
      <div class="origin-card">
        <div class="origin-num">02</div>
        <div class="origin-title">Japanese Cicada</div>
        <p>
          In Japanese, <strong>セミ</strong> means cicada — silent for 15 days, suddenly loud
          on payday, spending fast, then going quiet and broke again.
        </p>
      </div>
    </div>
  </section>

  <!-- MISSION -->
  <section class="section">
    <div class="section-label">Mission</div>
    <h2>Our <em>goal</em> is simple.</h2>
    <p>
      Semi is a personal finance tracker designed for Filipino employees.
      Help you plan your 15th and 30th salary <strong>before you spend it.</strong>
    </p>
    <ul class="mission-list">
      <li>
        <span class="mission-icon check">✓</span>
        <span><strong>Know how much salary was actually received</strong> — every payday, no guessing.</span>
      </li>
      <li>
        <span class="mission-icon check">✓</span>
        <span><strong>Know exactly where every peso should go</strong> — plan before you tap.</span>
      </li>
      <li>
        <span class="mission-icon check">✓</span>
        <span><strong>Know which wallet holds what money</strong> — GCash, Maya, BDO, or cash in hand.</span>
      </li>
      <li>
        <span class="mission-icon check">✓</span>
        <span><strong>Avoid spending everything on payday</strong> — the trap ends here.</span>
      </li>
      <li>
        <span class="mission-icon star">★</span>
        <span><strong>Break the one-day millionaire cycle</strong> — permanently.</span>
      </li>
    </ul>
  </section>

  <!-- FEATURES -->
  <section class="section">
    <div class="section-label">Features</div>
    <h2>Built for how <em>Filipinos</em> get paid.</h2>
    <p>
      Every feature in Semi exists to solve a specific, real problem with bi-monthly salary management.
    </p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">📅</div>
        <div class="feature-title">Bi-Monthly Budgeting</div>
        <p class="feature-desc">Budget templates that split automatically between your 15th and 30th paychecks.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✉️</div>
        <div class="feature-title">Smart Envelopes</div>
        <p class="feature-desc">Divide money into clear categories — Rent, Savings, Groceries — so every peso has a job.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">👛</div>
        <div class="feature-title">Wallet Tracking</div>
        <p class="feature-desc">Track exactly where money lives — GCash, Maya, BDO, or physical cash.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⚖️</div>
        <div class="feature-title">Balance Reconciliation</div>
        <p class="feature-desc">Sync app balances with real-world accounts; missing difference is pulled from envelopes automatically.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📋</div>
        <div class="feature-title">Debt Tracking</div>
        <p class="feature-desc">Keep an eye on money you owe or installments you're paying off.</p>
      </div>
    </div>

    <div class="private-highlight">
      <div class="lock-icon">🔒</div>
      <div>
        <h3>100% Offline &amp; Private</h3>
        <p>Your financial data never leaves your phone. Protected by PIN or Biometrics — FaceID or Fingerprint.</p>
      </div>
    </div>
  </section>

  <!-- TESTING BANNER -->
  <div class="testing-banner">
    <div class="section-label">Status</div>
    <h2>Currently in <em>Testing Phase</em></h2>
    <p>
      Semi is in active beta. Features are being refined to deliver the most
      premium experience for managing your hard-earned salary.
    </p>
  </div>

  <p class="caption"><em>Designed with care for the modern Filipino employee.</em></p>

</main>

</body>
</html>
