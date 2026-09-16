const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { computeProbability, runRecommender } = require('./engine');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Load all data ────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');

function loadData(filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'));
  } catch {
    return [];
  }
}

const examsCatalog = loadData('exams_catalog.json');
const dataMap = {
  jee_advanced: loadData('jee_advanced.json'),
  jee_main: loadData('jee_main.json'),
  neet_ug: loadData('neet_ug.json'),
  neet_pg: loadData('neet_pg.json'),
  upsc_cse: loadData('upsc_cse.json'),
  cat: loadData('cat.json'),
  xat: loadData('xat.json'),
  gate: loadData('gate.json'),
  ssc_cgl: loadData('ssc_cgl.json'),
  ibps_po: loadData('ibps_po.json'),
  rrb_ntpc: loadData('rrb_ntpc.json'),
  clat: loadData('clat.json'),
  cuet_ug: loadData('cuet_ug.json'),
  nda: loadData('nda.json'),
  aktu_uptac: loadData('aktu_uptac.json'),
};

// ─── GET /api/exams ──────────────────────────────────────────────────────────
// Returns all exams grouped by domain
app.get('/api/exams', (req, res) => {
  const grouped = {};
  for (const exam of examsCatalog) {
    if (!grouped[exam.domain]) grouped[exam.domain] = [];
    grouped[exam.domain].push(exam);
  }
  res.json({ exams: examsCatalog, grouped });
});

// ─── GET /api/exams/:examId/options ──────────────────────────────────────────
// Returns available institutes, branches, categories, and quotas for an exam
app.get('/api/exams/:examId/options', (req, res) => {
  const { examId } = req.params;
  const records = dataMap[examId];
  if (!records) return res.status(404).json({ error: 'Exam not found' });

  const institutes = [...new Set(records.map((r) => r.institute))].sort();
  const branches = [...new Set(records.map((r) => r.branch))].sort();
  const categories = [...new Set(records.map((r) => r.category))].sort();
  const quotas = [...new Set(records.map((r) => r.quota))].sort();

  // Branch options per institute (for cascading dropdowns)
  const instituteBranchMap = {};
  for (const r of records) {
    if (!instituteBranchMap[r.institute]) instituteBranchMap[r.institute] = new Set();
    instituteBranchMap[r.institute].add(r.branch);
  }
  for (const inst of Object.keys(instituteBranchMap)) {
    instituteBranchMap[inst] = [...instituteBranchMap[inst]].sort();
  }

  // Category-quota pairs per institute+branch
  const categoryQuotaMap = {};
  for (const r of records) {
    const key = `${r.institute}||${r.branch}`;
    if (!categoryQuotaMap[key]) categoryQuotaMap[key] = [];
    const exists = categoryQuotaMap[key].find(
      (x) => x.category === r.category && x.quota === r.quota
    );
    if (!exists) categoryQuotaMap[key].push({ category: r.category, quota: r.quota });
  }

  res.json({ institutes, branches, categories, quotas, instituteBranchMap, categoryQuotaMap });
});

// ─── POST /api/check-cutoff ───────────────────────────────────────────────────
// Compute probability and analytics for a specific choice
app.post('/api/check-cutoff', (req, res) => {
  const { examId, institute, branch, category, quota, userValue } = req.body;

  if (!examId || !institute || !branch || !category || userValue === undefined) {
    return res.status(400).json({ error: 'Missing required fields: examId, institute, branch, category, userValue' });
  }

  const examInfo = examsCatalog.find((e) => e.id === examId);
  if (!examInfo) return res.status(404).json({ error: 'Exam not found in catalog' });

  const allRecords = dataMap[examId];
  if (!allRecords) return res.status(404).json({ error: 'Data not found for exam' });

  // Find the matching record row
  const matched = allRecords.find((r) => {
    const instMatch = r.institute === institute;
    const branchMatch = r.branch === branch;
    const catMatch = r.category === category;
    const quotaMatch = !quota || r.quota === quota;
    return instMatch && branchMatch && catMatch && quotaMatch;
  });

  if (!matched) {
    return res.status(404).json({
      error: 'No historical data found for this combination. Try adjusting the category or quota.',
    });
  }

  const result = computeProbability(parseFloat(userValue), matched.records, examInfo.metricType);
  res.json({ ...result, examInfo, matched: { institute, branch, category, quota } });
});

// ─── POST /api/recommend ──────────────────────────────────────────────────────
// Return all Safe/Target/Reach options for user's value within an exam
app.post('/api/recommend', (req, res) => {
  const { examId, category, quota, userValue } = req.body;

  if (!examId || !category || userValue === undefined) {
    return res.status(400).json({ error: 'Missing required fields: examId, category, userValue' });
  }

  const examInfo = examsCatalog.find((e) => e.id === examId);
  if (!examInfo) return res.status(404).json({ error: 'Exam not found' });

  let allRecords = dataMap[examId];
  if (!allRecords) return res.status(404).json({ error: 'Data not found for exam' });

  // Filter by category and optionally quota
  let filtered = allRecords.filter((r) => {
    const catMatch = r.category === category;
    const quotaMatch = !quota || r.quota === quota;
    return catMatch && quotaMatch;
  });

  if (filtered.length === 0) {
    // Fall back to any matching category
    filtered = allRecords.filter((r) => r.category === category);
  }

  if (filtered.length === 0) {
    return res.status(404).json({ error: 'No data found for this category. Try a different category.' });
  }

  const result = runRecommender(parseFloat(userValue), filtered, examInfo.metricType);
  res.json({ ...result, examInfo, totalOptions: filtered.length });
});

// ─── GET /api/cutoffs ─────────────────────────────────────────────────────────
// Return raw cutoff records with optional filters
app.get('/api/cutoffs', (req, res) => {
  const { examId, institute, branch, category, year } = req.query;

  if (!examId) return res.status(400).json({ error: 'examId query param is required' });

  let records = dataMap[examId];
  if (!records) return res.status(404).json({ error: 'Exam not found' });

  // Flatten nested year records
  let flat = [];
  for (const r of records) {
    if (institute && r.institute !== institute) continue;
    if (branch && r.branch !== branch) continue;
    if (category && r.category !== category) continue;
    for (const yr of r.records) {
      if (year && yr.year !== parseInt(year)) continue;
      flat.push({
        institute: r.institute,
        instituteType: r.instituteType,
        branch: r.branch,
        category: r.category,
        quota: r.quota,
        ...yr,
      });
    }
  }

  flat.sort((a, b) => b.year - a.year);
  res.json({ records: flat, total: flat.length });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    exams: examsCatalog.length,
    datasets: Object.keys(dataMap).map((k) => ({ id: k, records: dataMap[k].length })),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ CutOff Checker API running on http://localhost:${PORT}`);
  console.log(`   Loaded ${examsCatalog.length} exams across ${Object.keys(dataMap).length} datasets`);
});
