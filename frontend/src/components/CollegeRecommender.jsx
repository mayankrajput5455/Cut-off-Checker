import { useState, useEffect } from 'react';
import { getExamOptions, getRecommendations } from '../api';

const COLORS = { green: '#10b981', amber: '#f59e0b', red: '#f43f5e' };

function RecCard({ rec }) {
  const color = COLORS[rec.badgeColor] || COLORS.amber;
  return (
    <div className="rec-card" style={{ borderColor: `${color}22` }}>
      <div className="rec-card-top">
        <div>
          <div className="rec-institute">{rec.institute}</div>
          <div className="rec-branch">{rec.branch}</div>
        </div>
        <div className="rec-prob" style={{ color }}>{rec.probability}%</div>
      </div>
      <div className="rec-meta">
        <span className="rec-tag">{rec.category}</span>
        <span className="rec-tag">{rec.quota}</span>
        {rec.instituteType && <span className="rec-tag">{rec.instituteType}</span>}
        <span className="rec-qualified" style={{ marginLeft: 'auto' }}>
          {rec.qualifiedCount}/{rec.totalYears} years ✓
        </span>
      </div>
    </div>
  );
}

export default function CollegeRecommender({ exam }) {
  const [options, setOptions] = useState(null);
  const [form, setForm] = useState({ category: '', quota: '', userValue: '' });
  const [filters, setFilters] = useState({ branch: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [optLoading, setOptLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!exam) return;
    setResults(null); setError(null);
    setForm({ category: '', quota: '', userValue: '' });
    setFilters({ branch: '', type: '' });
    setOptLoading(true);
    getExamOptions(exam.id)
      .then((r) => setOptions(r.data))
      .catch(() => setError('Failed to load options'))
      .finally(() => setOptLoading(false));
  }, [exam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userValue || !form.category) { setError('Please fill in all required fields.'); return; }
    setLoading(true); setError(null); setResults(null);
    try {
      const { data } = await getRecommendations({
        examId: exam.id,
        category: form.category,
        quota: form.quota || undefined,
        userValue: parseFloat(form.userValue),
      });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not fetch recommendations. Try a different category.');
    } finally { setLoading(false); }
  };

  const filterRecs = (list) => {
    return list.filter((r) => {
      const byBranch = !filters.branch || r.branch.toLowerCase().includes(filters.branch.toLowerCase());
      const byType = !filters.type || r.instituteType === filters.type;
      return byBranch && byType;
    });
  };

  const allTypes = results
    ? [...new Set([...results.safe, ...results.target, ...results.reach].map((r) => r.instituteType).filter(Boolean))]
    : [];

  const allBranches = results
    ? [...new Set([...results.safe, ...results.target, ...results.reach].map((r) => r.branch))]
    : [];

  if (!exam) return null;

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <span className="card-title">What Can I Get? — College & Program Recommender</span>
        </div>
        <div className="card-body">
          {optLoading && <div className="loader"><div className="spinner" /><span>Loading…</span></div>}
          {!optLoading && options && (
            <form onSubmit={handleSubmit}>
              <div className="form-grid form-grid-3" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{exam.metricLabel} <span style={{ color: '#f43f5e' }}>*</span></label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder={exam.metricPlaceholder}
                    value={form.userValue}
                    onChange={(e) => setForm({ ...form, userValue: e.target.value })}
                    min="0"
                    step={exam.metricType === 'PERCENTILE' ? '0.01' : '1'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{exam.categoryLabel} <span style={{ color: '#f43f5e' }}>*</span></label>
                  <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                    <option value="">Select category…</option>
                    {options.categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{exam.quotaLabel}</label>
                  <select className="form-control" value={form.quota} onChange={(e) => setForm({ ...form, quota: e.target.value })}>
                    <option value="">All quotas</option>
                    {options.quotas.map((q) => <option key={q}>{q}</option>)}
                  </select>
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? <><div className="spinner" style={{ borderWidth: '2px' }} />Finding matches…</> : '🚀 Find My Options'}
              </button>
            </form>
          )}
        </div>
      </div>

      {results && (
        <>
          {/* Filters */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body" style={{ padding: '1rem 1.5rem' }}>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Filter by Branch / Program</label>
                  <select className="form-control" value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })}>
                    <option value="">All branches</option>
                    {allBranches.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                {allTypes.length > 1 && (
                  <div className="form-group">
                    <label className="form-label">Institute Type</label>
                    <select className="form-control" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                      <option value="">All types</option>
                      {allTypes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tiers */}
          {['safe', 'target', 'reach'].map((tier) => {
            const tierData = { safe: { label: '🟢 Safe Choices', color: 'green', subtitle: '≥ 72% historical probability' }, target: { label: '🟡 Target Choices', color: 'amber', subtitle: '42–71% historical probability' }, reach: { label: '🔴 Ambitious / Reach', color: 'red', subtitle: '< 42% historical probability' } };
            const recs = filterRecs(results[tier]);
            const meta = tierData[tier];
            if (recs.length === 0) return null;
            return (
              <div className="recommend-tier" key={tier}>
                <div className="tier-header">
                  <div className={`tier-dot ${meta.color}`} />
                  <span className="tier-name">{meta.label}</span>
                  <span className="tier-count">{recs.length} options</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{meta.subtitle}</span>
                </div>
                <div className="recommend-grid">
                  {recs.map((rec, i) => <RecCard key={i} rec={rec} />)}
                </div>
              </div>
            );
          })}

          <div className="disclaimer">
            <span>⚠️</span>
            <span>
              <strong>Disclaimer:</strong> Recommendations are based on historical patterns only and are not a guarantee of admission. Always verify with official authorities.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
