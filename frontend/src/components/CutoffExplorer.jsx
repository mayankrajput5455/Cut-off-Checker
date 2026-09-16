import { useState, useEffect } from 'react';
import { getCutoffs, getExamOptions } from '../api';

export default function CutoffExplorer({ exam }) {
  const [options, setOptions] = useState(null);
  const [filters, setFilters] = useState({ institute: '', branch: '', category: '', year: '' });
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!exam) return;
    setRecords([]); setFetched(false); setFilters({ institute: '', branch: '', category: '', year: '' }); setSearch('');
    getExamOptions(exam.id).then((r) => setOptions(r.data)).catch(() => {});
  }, [exam]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await getCutoffs({
        examId: exam.id,
        institute: filters.institute || undefined,
        branch: filters.branch || undefined,
        category: filters.category || undefined,
        year: filters.year || undefined,
      });
      setRecords(data.records || []);
      setFetched(true);
    } catch { setRecords([]); setFetched(true); }
    finally { setLoading(false); }
  };

  const filtered = records.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.institute?.toLowerCase().includes(q) ||
      r.branch?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q)
    );
  });

  const metricType = exam?.metricType || 'RANK';

  if (!exam) return null;

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span style={{ fontSize: '1.2rem' }}>📚</span>
          <span className="card-title">Historical Cutoff Explorer</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {exam.name} · {exam.authority}
          </span>
        </div>
        <div className="card-body">
          <div className="form-grid form-grid-2" style={{ marginBottom: '1rem' }}>
            {options && (
              <>
                <div className="form-group">
                  <label className="form-label">{exam.instituteLabel}</label>
                  <select className="form-control" value={filters.institute} onChange={(e) => setFilters({ ...filters, institute: e.target.value })}>
                    <option value="">All institutes</option>
                    {options.institutes.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Branch / Program</label>
                  <select className="form-control" value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })}>
                    <option value="">All branches</option>
                    {options.branches.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                    <option value="">All categories</option>
                    {options.categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-control" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
                    <option value="">All years</option>
                    {[2023, 2022, 2021, 2020, 2019].map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
          <button className="btn btn-primary" onClick={fetchRecords} disabled={loading}>
            {loading ? <><div className="spinner" style={{ borderWidth: '2px' }} />Loading…</> : '🔍 Load Cutoff Records'}
          </button>
        </div>
      </div>

      {fetched && (
        <div className="card">
          <div className="card-header">
            <span>📄</span>
            <span className="card-title">{filtered.length} records found</span>
            <div className="search-bar" style={{ marginLeft: 'auto', width: '220px', position: 'relative' }}>
              <span className="search-icon">🔍</span>
              <input
                className="form-control"
                type="text"
                placeholder="Search institute, branch…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
              />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗂️</div>
                <div className="empty-title">No records found</div>
                <div className="empty-text">Try adjusting your filters or search term.</div>
              </div>
            ) : (
              <table className="year-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Institute</th>
                    <th>Branch / Program</th>
                    <th>Category</th>
                    <th>Quota / Stage</th>
                    {metricType === 'RANK' && <th>Opening Rank</th>}
                    <th>{metricType === 'RANK' ? 'Closing Rank' : metricType === 'PERCENTILE' ? 'Min. Percentile' : 'Min. Score / Marks'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={i}>
                      <td className="year-cell">{r.year}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{r.institute}</td>
                      <td>{r.branch}</td>
                      <td><span className="rec-tag">{r.category}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.quota}</td>
                      {metricType === 'RANK' && <td>{r.openingRank?.toLocaleString() || '—'}</td>}
                      <td style={{ color: 'var(--accent-indigo)', fontWeight: 700 }}>
                        {(r.closingRank ?? r.cutoffScore ?? r.closingPercentile)?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
