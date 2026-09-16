import { useNavigate } from 'react-router-dom';

// Every domain now has its own high-quality cinematic image
const ALL_DOMAIN_CARDS = [
  {
    slug: 'Engineering',
    img: '/domain_engineering.jpg',
    tag: 'Engineering',
    title: 'JEE Advanced · JEE Main · GATE · AKTU',
    caption: 'IITs, NITs, IIITs & State Colleges',
    size: 'large',          // spans 7 cols
  },
  {
    slug: 'Medical',
    img: '/domain_medical.jpg',
    tag: 'Medical',
    title: 'NEET UG · NEET PG',
    caption: 'AIIMS, JIPMER & Medical Colleges',
    size: 'medium',         // 5 cols
  },
  {
    slug: 'Management',
    img: '/domain_management.jpg',
    tag: 'Management',
    title: 'CAT · XAT',
    caption: 'IIMs, XLRI & Top B-Schools',
    size: 'medium',
  },
  {
    slug: 'Civil Services',
    img: '/domain_upsc.jpg',
    tag: 'Civil Services',
    title: 'UPSC CSE',
    caption: 'IAS, IPS, IFS & Group A Services',
    size: 'medium',
  },
  {
    slug: 'Govt Recruitment',
    img: '/domain_govt.jpg',
    tag: 'Govt Recruitment',
    title: 'SSC CGL · RRB NTPC',
    caption: 'Central Government Recruitment',
    size: 'medium',
  },
  {
    slug: 'Banking',
    img: '/domain_banking.jpg',
    tag: 'Banking',
    title: 'IBPS PO',
    caption: 'Public Sector Banks Across India',
    size: 'medium',
  },
  {
    slug: 'Law',
    img: '/domain_law.jpg',
    tag: 'Law',
    title: 'CLAT',
    caption: 'National Law Universities',
    size: 'medium',
  },
  {
    slug: 'Defence',
    img: '/domain_defence.jpg',
    tag: 'Defence',
    title: 'NDA Exam',
    caption: 'Army, Navy & Air Force Academy',
    size: 'medium',
  },
  {
    slug: 'Multi-Domain',
    img: '/domain_cuet.jpg',
    tag: 'Multi-Domain',
    title: 'CUET UG',
    caption: 'Central Universities Across India',
    size: 'medium',
  },
];

const STATS = [
  { value: '15',   label: 'Exams Covered',  sub: 'JEE to CLAT to NDA' },
  { value: '5',    label: 'Years of Data',   sub: '2019–2023 official cutoffs' },
  { value: '500+', label: 'Cutoff Records',  sub: 'Across all institutes' },
  { value: '100%', label: 'Free & Open',     sub: 'No login required' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Select Your Exam', desc: 'Choose from 15 major Indian competitive exams across 9 domains.' },
  { step: '02', title: 'Enter Your Score', desc: 'Input your rank, score, or percentile depending on the exam.' },
  { step: '03', title: 'Pick Your Target', desc: 'Select the institute, branch, and category you are aiming for.' },
  { step: '04', title: 'Get Your Chances', desc: 'Receive a data-backed probability score based on 5 years of cutoffs.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const goToTool = (domain = null) => {
    const path = domain ? `/tool?domain=${encodeURIComponent(domain)}` : '/tool';
    navigate(path);
  };

  return (
    <div className="app">

      {/* ══ NAV ══════════════════════════════════════════════════ */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('/')}>
            <div className="logo-icon">📊</div>
            <span className="logo-text">CutOff<span>Checker</span></span>
          </div>
          <div className="header-right">
            <div className="stat-chip"><strong>15</strong> Exams</div>
            <div className="stat-chip"><strong>9</strong> Domains</div>
            <div className="stat-chip"><strong>500+</strong> Records</div>
            <button
              className="btn btn-primary"
              style={{ padding: '7px 18px', fontSize: '0.82rem' }}
              onClick={() => goToTool()}
            >
              Check Cutoff →
            </button>
          </div>
        </div>
      </header>

      {/* ══ HERO ═════════════════════════════════════════════════ */}
      <section className="hero-section">
        <div className="hero-img-wrap">
          <img src="/hero_bg.jpg" alt="Indian university campus at dusk" className="hero-img" />
          <div className="hero-img-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">🇮🇳 India's One-Stop Cutoff Probability Platform</div>
          <h1 className="hero-title">
            Know Your Chances.<br />
            <span className="hl">Before Results Day.</span>
          </h1>
          <p className="hero-sub">
            Enter your rank, score, or percentile — get a data-backed admission
            probability built on 5 years of official cutoffs across 15 major exams.
          </p>
          <div className="hero-cta-row">
            <button className="btn-cta-primary" onClick={() => goToTool()}>
              Check My Cutoff ↗
            </button>
            <button
              className="btn-cta-ghost"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            >
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* ══ STATS STRIP ══════════════════════════════════════════ */}
      <section className="stats-section">
        <div className="stats-bg">
          <img src="/stats_section.jpg" alt="" className="stats-bg-img" />
          <div className="stats-bg-overlay" />
        </div>
        <div className="stats-inner">
          {STATS.map((s) => (
            <div className="stat-block" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ BENTO DOMAIN SHOWCASE — ALL 9 WITH IMAGES ═══════════ */}
      <section className="showcase-section">
        <div className="showcase-inner">
          <div className="section-eyebrow">Choose Your Path</div>
          <h2 className="section-title">Every major exam. One platform.</h2>
          <p className="section-sub">
            From IIT gates to NLU courts — 5 years of historical cutoff data for
            India's most competitive exams, instantly at your fingertips.
          </p>

          <div className="bento-grid-full">
            {ALL_DOMAIN_CARDS.map((card) => (
              <div
                key={card.slug}
                className={`bento-card bento-${card.size} ${card.slug === 'Engineering' ? 'bento-feature' : ''}`}
                onClick={() => goToTool(card.slug)}
                title={`Explore ${card.tag} cutoffs`}
              >
                <img src={card.img} alt={card.caption} className="bento-img" loading="lazy" />
                <div className="bento-overlay" />
                <div className="bento-content">
                  <span className="bento-tag">{card.tag}</span>
                  <h3 className="bento-title">{card.title}</h3>
                  <p className="bento-caption">{card.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURE — Laptop shot ═════════════════════════════════ */}
      <section className="feature-section">
        <div className="feature-inner">
          <div className="feature-text">
            <div className="section-eyebrow" style={{ textAlign: 'left' }}>Data-Driven Intelligence</div>
            <h2 className="section-title" style={{ textAlign: 'left', maxWidth: '420px' }}>
              5 years of data. Instant probability.
            </h2>
            <p className="section-sub" style={{ textAlign: 'left', maxWidth: '400px', margin: 0 }}>
              Our probability engine analyzes 5 years of official cutoff data,
              weighted by recency, to give you the most accurate historical chance of admission.
            </p>
            <ul className="feature-list">
              <li><span className="feature-check">✓</span> Year-by-year historical breakdown</li>
              <li><span className="feature-check">✓</span> Trend analysis — tightening or easing</li>
              <li><span className="feature-check">✓</span> Safe / Target / Reach categorization</li>
              <li><span className="feature-check">✓</span> All categories, quotas & institute types</li>
            </ul>
            <div style={{ marginTop: '8px' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.9rem' }}
                onClick={() => goToTool()}
              >
                Try It Free →
              </button>
            </div>
          </div>
          <div className="feature-img-wrap">
            <img src="/feature_laptop.jpg" alt="CutOff Checker dashboard" className="feature-img" />
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════ */}
      <section className="hiw-section" id="how-it-works">
        <div className="hiw-inner">
          <div className="section-eyebrow">Simple by Design</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Four steps. Zero guesswork.</p>
          <div className="hiw-grid">
            {HOW_IT_WORKS.map((s) => (
              <div className="hiw-card" key={s.step}>
                <div className="hiw-step">{s.step}</div>
                <h3 className="hiw-title">{s.title}</h3>
                <p className="hiw-desc">{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button className="btn-cta-primary" onClick={() => goToTool()}>
              Start Checking Cutoffs →
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════ */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="logo-icon" style={{ width: '24px', height: '24px', fontSize: '12px' }}>📊</div>
            <span className="logo-text" style={{ fontSize: '0.9rem' }}>CutOff<span>Checker</span></span>
          </div>
          <div className="footer-links">
            <button onClick={() => goToTool()}>🎯 Check Cutoff</button>
            <span className="footer-dot">·</span>
            <span>Data: 2019–2023 official sources</span>
            <span className="footer-dot">·</span>
            <span>Not affiliated with any exam body</span>
          </div>
          <div className="footer-copy">
            Built with ❤️ for India's students · All probabilities are historical estimates only
          </div>
        </div>
      </footer>

    </div>
  );
}
