export default function MethodologyModal({ onClose }) {
  const weights = [
    { year: 2023, weight: 30 },
    { year: 2022, weight: 25 },
    { year: 2021, weight: 20 },
    { year: 2020, weight: 15 },
    { year: 2019, weight: 10 },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📐 How We Calculate Your Probability</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="methodology-grid">

            <div className="meth-item">
              <div className="meth-label">1 · Multi-Metric Engine</div>
              <div className="meth-val">
                Different Indian competitive exams use different selection criteria:
                <ul style={{ paddingLeft: '1.2rem', marginTop: '6px', lineHeight: '1.9' }}>
                  <li><strong style={{ color: '#818cf8' }}>Rank-based</strong> (JEE Main, JEE Adv, NEET, AKTU) — lower rank is better. Qualifies if Rank ≤ Closing Rank.</li>
                  <li><strong style={{ color: '#6ee7b7' }}>Score-based</strong> (UPSC, SSC CGL, GATE) — higher score is better. Qualifies if Score ≥ Minimum Cutoff.</li>
                  <li><strong style={{ color: '#fcd34d' }}>Percentile-based</strong> (CAT/IIMs) — higher percentile is better. Qualifies if Percentile ≥ Closing Percentile.</li>
                </ul>
              </div>
            </div>

            <div className="meth-item">
              <div className="meth-label">2 · Recency-Weighted Year Scores</div>
              <div className="meth-val" style={{ marginBottom: '10px' }}>
                Recent years carry more weight since recent cutoffs are better predictors.
              </div>
              {weights.map((w) => (
                <div key={w.year} className="weight-row">
                  <span className="weight-year">{w.year}</span>
                  <div className="weight-bar-wrap">
                    <div className="weight-bar" style={{ width: `${w.weight * 3.3}%` }} />
                  </div>
                  <span className="weight-pct">{w.weight}%</span>
                </div>
              ))}
            </div>

            <div className="meth-item">
              <div className="meth-label">3 · Margin Factor</div>
              <div className="meth-val">
                A bonus is awarded when your score is well inside the qualifying threshold, and a small penalty applies when you narrowly miss the cutoff. This reflects real-world selection confidence.
              </div>
            </div>

            <div className="meth-item">
              <div className="meth-label">4 · Trend Momentum</div>
              <div className="meth-val">
                The tool compares early years (2019–2020) vs recent years (2022–2023). If cutoffs are tightening (competition increasing), we flag this prominently. If they're easing, that's a positive signal.
              </div>
            </div>

            <div className="meth-item">
              <div className="meth-label">5 · Classification Badges</div>
              <div className="meth-val">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <span><span style={{ color: '#10b981', fontWeight: 700 }}>🟢 Safe ≥ 72%</span> — Strong historical track record.</span>
                  <span><span style={{ color: '#f59e0b', fontWeight: 700 }}>🟡 Target 42–71%</span> — Realistic but requires some luck.</span>
                  <span><span style={{ color: '#f43f5e', fontWeight: 700 }}>🔴 Reach &lt; 42%</span> — Historically unlikely; apply as a stretch option.</span>
                </div>
              </div>
            </div>

            <div className="alert alert-warning" style={{ marginTop: '4px' }}>
              ⚠️ <strong>Important:</strong> This tool provides statistical estimates based on public historical data. It is <strong>not an official prediction</strong> or a guarantee of seat allotment. Seat matrices, exam difficulty, and candidate pool vary every year. Always verify with the official conducting body.
            </div>

            <div className="meth-item">
              <div className="meth-label">Data Sources</div>
              <div className="meth-val">
                Historical cutoff records are sourced from official conducting bodies: JoSAA / CSAB (JEE), MCC (NEET), UPSC, SSC, IIMs (CAT), CCMT / COAP (GATE), and UPTAC (AKTU). Data covers 2019–2023 (5 years).
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
