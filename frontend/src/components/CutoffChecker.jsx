import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { checkCutoff, getExamOptions } from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const COLOR_GAUGE = { green: '#10b981', amber: '#f59e0b', red: '#f43f5e' };
const CIRCUMFERENCE = 2 * Math.PI * 54;

function ProbabilityGauge({ probability, badgeColor }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(probability), 80);
    return () => clearTimeout(t);
  }, [probability]);

  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;
  const color = COLOR_GAUGE[badgeColor] || COLOR_GAUGE.amber;

  return (
    <div className="gauge-wrap">
      <svg className="gauge-svg" viewBox="0 0 120 120">
        <circle className="gauge-bg" cx="60" cy="60" r="54" />
        <circle
          className="gauge-track"
          cx="60" cy="60" r="54"
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge-pct">
        <span className="gauge-number" style={{ color }}>{Math.round(probability)}%</span>
        <span className="gauge-label">CHANCE</span>
      </div>
    </div>
  );
}

function TrendChart({ yearBreakdown, userValue, metricType }) {
  const years = [...yearBreakdown].sort((a, b) => a.year - b.year);
  const labels = years.map((y) => String(y.year));
  const cutoffs = years.map((y) => y.cutoff);
  const userLine = years.map(() => userValue);

  const isRank = metricType === 'RANK';

  const data = {
    labels,
    datasets: [
      {
        label: isRank ? 'Closing Rank' : 'Cutoff Score / Percentile',
        data: cutoffs,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#6366f1',
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Your ' + (isRank ? 'Rank' : 'Score'),
        data: userLine,
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 12 }, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: '#0d1424',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f0f4ff',
        bodyColor: '#94a3b8',
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        reverse: isRank,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8' },
        title: {
          display: true,
          text: isRank ? 'Rank (lower = better ↑)' : 'Score / Percentile (higher = better)',
          color: '#475569',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div style={{ height: 260 }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default function CutoffChecker({ exam }) {
  const [options, setOptions] = useState(null);
  const [form, setForm] = useState({ institute: '', branch: '', category: '', quota: '', userValue: '' });
  const [loading, setLoading] = useState(false);
  const [optLoading, setOptLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (!exam) return;
    setResult(null); setError(null);
    setForm({ institute: '', branch: '', category: '', quota: '', userValue: '' });
    setOptLoading(true);
    getExamOptions(exam.id)
      .then((r) => setOptions(r.data))
      .catch(() => setError('Failed to load exam options'))
      .finally(() => setOptLoading(false));
  }, [exam]);

  const availableBranches = form.institute && options?.instituteBranchMap?.[form.institute]
    ? options.instituteBranchMap[form.institute]
    : options?.branches || [];

  const availableCatQuota = form.institute && form.branch
    ? (options?.categoryQuotaMap?.[`${form.institute}||${form.branch}`] || [])
    : [];

  const availableCategories = availableCatQuota.length
    ? [...new Set(availableCatQuota.map((x) => x.category))]
    : options?.categories || [];

  const availableQuotas = form.category && availableCatQuota.length
    ? [...new Set(availableCatQuota.filter((x) => x.category === form.category).map((x) => x.quota))]
    : options?.quotas || [];

  const handleChange = (field, val) => {
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      if (field === 'institute') { next.branch = ''; next.category = ''; next.quota = ''; }
      if (field === 'branch')    { next.category = ''; next.quota = ''; }
      if (field === 'category')  { next.quota = ''; }
      return next;
    });
    setResult(null); setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userValue || !form.institute || !form.branch || !form.category) {
      setError('Please fill in all required fields.'); return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await checkCutoff({
        examId: exam.id,
        institute: form.institute,
        branch: form.branch,
        category: form.category,
        quota: form.quota || undefined,
        userValue: parseFloat(form.userValue),
      });
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  if (!exam) return null;

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span className="card-title">Will I Get In? — Specific Choice Checker</span>
        </div>
        <div className="card-body">
          {optLoading && <div className="loader"><div className="spinner" /><span>Loading options…</span></div>}
          {!optLoading && options && (
            <form onSubmit={handleSubmit}>
              <div className="form-grid form-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">{exam.metricLabel} <span style={{ color: '#f43f5e' }}>*</span></label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder={exam.metricPlaceholder}
                    value={form.userValue}
                    onChange={(e) => handleChange('userValue', e.target.value)}
                    min="0"
                    step={exam.metricType === 'PERCENTILE' ? '0.01' : '1'}
                    required
                  />
                  <span className="form-hint">
                    {exam.metricType === 'RANK' ? 'Enter as a number (e.g. 12450)'
                      : exam.metricType === 'PERCENTILE' ? 'Enter up to 2 decimal places (e.g. 98.45)'
                      : 'Enter your total score / marks (e.g. 415.25)'}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">{exam.instituteLabel} <span style={{ color: '#f43f5e' }}>*</span></label>
                  <select className="form-control" value={form.institute} onChange={(e) => handleChange('institute', e.target.value)} required>
                    <option value="">Select institute…</option>
                    {options.institutes.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{exam.programLabel} <span style={{ color: '#f43f5e' }}>*</span></label>
                  <select className="form-control" value={form.branch} onChange={(e) => handleChange('branch', e.target.value)} disabled={!form.institute} required>
                    <option value="">Select branch / program…</option>
                    {availableBranches.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{exam.categoryLabel} <span style={{ color: '#f43f5e' }}>*</span></label>
                  <select className="form-control" value={form.category} onChange={(e) => handleChange('category', e.target.value)} disabled={!form.branch} required>
                    <option value="">Select category…</option>
                    {availableCategories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{exam.quotaLabel}</label>
                  <select className="form-control" value={form.quota} onChange={(e) => handleChange('quota', e.target.value)} disabled={!form.category}>
                    <option value="">All / Any quota</option>
                    {availableQuotas.map((q) => <option key={q}>{q}</option>)}
                  </select>
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? <><div className="spinner" style={{ borderWidth: '2px' }} />Analyzing…</> : '✨ Check My Chances'}
              </button>
            </form>
          )}
        </div>
      </div>

      {result && (
        <div ref={resultRef}>
          {/* Probability Hero */}
          <div className="result-hero">
            <ProbabilityGauge probability={result.probability} badgeColor={result.badgeColor} />
            <div className="result-info">
              <div className={`result-badge badge-${result.badgeColor}`}>
                {result.badgeColor === 'green' ? '🟢' : result.badgeColor === 'amber' ? '🟡' : '🔴'} {result.badge}
              </div>
              <div className="result-title" style={{ color: COLOR_GAUGE[result.badgeColor] }}>
                {result.probability}% Historical Chance
              </div>
              <p className="result-summary">{result.summary}</p>
              <div className={`trend-pill trend-${result.trend}`}>
                {result.trend === 'tightening' ? '📈 Cutoffs Tightening' : result.trend === 'loosening' ? '📉 Cutoffs Easing' : '〰 Cutoff Trend: Stable'}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span>📊</span>
              <span className="card-title">5-Year Cutoff Trend</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {result.matched.institute} · {result.matched.branch}
              </span>
            </div>
            <div className="card-body">
              <TrendChart yearBreakdown={result.yearBreakdown} userValue={parseFloat(form.userValue)} metricType={result.examInfo.metricType} />
            </div>
          </div>

          {/* Year Table */}
          <div className="card">
            <div className="card-header">
              <span>📋</span>
              <span className="card-title">Year-by-Year Historical Breakdown</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="year-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Cutoff ({result.examInfo.metricType === 'RANK' ? 'Closing Rank' : 'Min Score / Percentile'})</th>
                    {result.examInfo.metricType === 'RANK' && <th>Opening Rank</th>}
                    <th>Your {result.examInfo.metricType === 'RANK' ? 'Rank' : 'Score'}</th>
                    <th>Margin</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearBreakdown.map((row) => (
                    <tr key={row.year}>
                      <td className="year-cell">{row.year}</td>
                      <td>{row.cutoff?.toLocaleString()}</td>
                      {result.examInfo.metricType === 'RANK' && <td style={{ color: 'var(--text-muted)' }}>{row.openingRank?.toLocaleString() || '—'}</td>}
                      <td className="user-rank-cell">{parseFloat(form.userValue).toLocaleString()}</td>
                      <td style={{ color: row.qualified ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                        {row.qualified ? '+' : ''}{Math.round(row.margin).toLocaleString()}
                      </td>
                      <td className={row.qualified ? 'qualified-yes' : 'qualified-no'}>
                        {row.qualified ? '✅ Would Qualify' : '❌ Would Not'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="disclaimer">
            <span>⚠️</span>
            <span>
              <strong>Disclaimer:</strong> These results are based on historical cutoff patterns and are <strong>not</strong> a guarantee of admission. Actual cutoffs depend on the number of applicants, seat matrix changes, and exam difficulty variations each year. Always verify with official counseling authorities.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
