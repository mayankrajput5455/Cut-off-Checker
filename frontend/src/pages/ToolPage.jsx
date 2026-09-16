import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getExams } from '../api';
import CutoffChecker from '../components/CutoffChecker';
import CollegeRecommender from '../components/CollegeRecommender';
import CutoffExplorer from '../components/CutoffExplorer';
import MethodologyModal from '../components/MethodologyModal';

const DOMAIN_META = {
  'Engineering':      { icon: '⚙️' },
  'Medical':          { icon: '🩺' },
  'Management':       { icon: '📊' },
  'Civil Services':   { icon: '🏛️' },
  'Govt Recruitment': { icon: '🛡️' },
  'Banking':          { icon: '🏦' },
  'Law':              { icon: '⚖️' },
  'Defence':          { icon: '🎖️' },
  'Multi-Domain':     { icon: '🎓' },
};

const METRIC_CLASS = { RANK: 'metric-rank', SCORE: 'metric-score', PERCENTILE: 'metric-pct' };
const METRIC_LABEL = { RANK: 'RANK', SCORE: 'SCORE', PERCENTILE: '%ILE' };

const TABS = [
  { id: 'checker',   label: 'Check My Chances', icon: '🎯' },
  { id: 'recommend', label: 'Find Options',      icon: '🔍' },
  { id: 'explorer',  label: 'Explore Cutoffs',   icon: '📚' },
];

export default function ToolPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [examsData, setExamsData]     = useState({ exams: [], grouped: {} });
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedExam, setSelectedExam]     = useState(null);
  const [activeTab, setActiveTab]           = useState('checker');
  const [showModal, setShowModal]           = useState(false);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    getExams()
      .then((r) => {
        setExamsData(r.data);
        // Pre-select domain from URL ?domain=Engineering
        const urlDomain = searchParams.get('domain');
        const grouped   = r.data.grouped;
        const firstDomain = urlDomain && grouped[urlDomain] ? urlDomain : Object.keys(grouped)[0];
        if (firstDomain) {
          setSelectedDomain(firstDomain);
          setSelectedExam(grouped[firstDomain][0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visibleExams = selectedDomain
    ? examsData.grouped[selectedDomain] || []
    : examsData.exams;

  const handleExamSelect  = (exam)   => { setSelectedExam(exam); setActiveTab('checker'); };
  const handleDomainClick = (domain) => {
    const next = domain === selectedDomain ? null : domain;
    setSelectedDomain(next);
    setSelectedExam(null);
  };

  const totalExams = examsData.exams.length || 15;

  return (
    <div className="app tool-page">

      {/* ══ NAV ══════════════════════════════════════════════════ */}
      <header className="header">
        <div className="header-inner">
          {/* Back to home */}
          <div className="logo" onClick={() => navigate('/')} title="Back to home">
            <div className="logo-icon">📊</div>
            <span className="logo-text">CutOff<span>Checker</span></span>
          </div>

          {/* Breadcrumb context */}
          <div className="tool-breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-home">Home</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">Cutoff Checker</span>
          </div>

          <div className="header-right">
            <div className="stat-chip"><strong>{totalExams}</strong> Exams</div>
            <div className="stat-chip"><strong>5</strong> Years Data</div>
            <button
              className="btn btn-secondary"
              style={{ padding: '5px 14px', fontSize: '0.76rem', borderRadius: '20px' }}
              onClick={() => setShowModal(true)}
            >
              How it works
            </button>
          </div>
        </div>
      </header>

      {/* ══ TOOL HERO (compact) ═══════════════════════════════════ */}
      <section className="tool-hero">
        <div className="tool-hero-content">
          <div className="hero-eyebrow" style={{ marginBottom: '12px' }}>
            🎯 Interactive Cutoff Tool
          </div>
          <h1 className="tool-hero-title">Check Your Admission Chances</h1>
          <p className="tool-hero-sub">
            Select an exam, pick your target college &amp; course, enter your score — get your historical probability in seconds.
          </p>
        </div>
      </section>

      {/* ══ TOOL CONTENT ═════════════════════════════════════════ */}
      <main className="tool-main main-content">

        {loading && (
          <div className="loader" style={{ padding: '5rem' }}>
            <div className="spinner" />
            <span>Loading exams data…</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Domain filter pills */}
            <div className="domain-strip" style={{ marginBottom: '16px' }}>
              {Object.keys(examsData.grouped).map((domain) => {
                const meta = DOMAIN_META[domain] || { icon: '📌' };
                const cls  = domain.replace(/\s+/g, '-');
                return (
                  <button
                    key={domain}
                    className={`domain-pill ${cls} ${selectedDomain === domain ? 'active' : ''}`}
                    data-domain={domain}
                    onClick={() => handleDomainClick(domain)}
                  >
                    <span>{meta.icon}</span>
                    <span>{domain}</span>
                  </button>
                );
              })}
            </div>

            {/* Exam selector grid */}
            <div className="exam-selector">
              <div className="section-label">
                {selectedDomain
                  ? `${DOMAIN_META[selectedDomain]?.icon || ''} ${selectedDomain} — Select an Exam`
                  : 'All Exams — Select One'}
              </div>
              <div className="exam-grid">
                {visibleExams.map((exam) => (
                  <div
                    key={exam.id}
                    className={`exam-card ${selectedExam?.id === exam.id ? 'active' : ''}`}
                    onClick={() => handleExamSelect(exam)}
                  >
                    <span className={`exam-metric-tag ${METRIC_CLASS[exam.metricType]}`}>
                      {METRIC_LABEL[exam.metricType]}
                    </span>
                    <span className="exam-card-name">{exam.shortName || exam.name}</span>
                    <span className="exam-card-authority">{exam.authority}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected exam tabs & content */}
            {selectedExam && (
              <>
                <div className="info-bar">
                  <span style={{ fontSize: '1.1rem' }}>
                    {DOMAIN_META[selectedExam.domain]?.icon || '📌'}
                  </span>
                  <div>
                    <span className="info-bar-name">{selectedExam.name}</span>
                    <span className="info-bar-desc" style={{ marginLeft: '10px' }}>
                      {selectedExam.description}
                    </span>
                  </div>
                  <span
                    className={`exam-metric-tag ${METRIC_CLASS[selectedExam.metricType]}`}
                    style={{ marginLeft: 'auto', flexShrink: 0 }}
                  >
                    {selectedExam.metricLabel}
                  </span>
                </div>

                <div className="tabs">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {activeTab === 'checker'   && <CutoffChecker exam={selectedExam} />}
                {activeTab === 'recommend' && <CollegeRecommender exam={selectedExam} />}
                {activeTab === 'explorer'  && <CutoffExplorer exam={selectedExam} />}
              </>
            )}

            {!selectedExam && (
              <div className="empty-state" style={{ marginTop: '2rem' }}>
                <div className="empty-icon">☝️</div>
                <div className="empty-title">Select an Exam to Begin</div>
                <div className="empty-text">
                  Choose any of the {totalExams} exams above to check your cutoff chances,
                  find matching colleges, or browse historical data.
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ══ MINI FOOTER ══════════════════════════════════════════ */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-links">
            <button onClick={() => navigate('/')}>← Back to Home</button>
            <span className="footer-dot">·</span>
            <button onClick={() => setShowModal(true)}>📐 Methodology</button>
            <span className="footer-dot">·</span>
            <span>Data: 2019–2023 · Not affiliated with any exam body</span>
          </div>
          <div className="footer-copy">
            All probabilities are historical estimates only. Always verify with official authorities.
          </div>
        </div>
      </footer>

      {showModal && <MethodologyModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
