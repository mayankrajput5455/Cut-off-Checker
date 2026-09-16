/**
 * CutOff Checker — Universal Probability Engine
 * Supports RANK (lower=better), SCORE (higher=better), PERCENTILE (higher=better)
 */

// Year weights — most recent year has highest weight
const YEAR_WEIGHTS = {
  2023: 0.30,
  2022: 0.25,
  2021: 0.20,
  2020: 0.15,
  2019: 0.10,
};

/**
 * Checks whether the user qualifies for a given year's cutoff.
 * @param {number} userValue - The user's rank, score, or percentile
 * @param {object} record - A single-year cutoff record from the dataset
 * @param {string} metricType - 'RANK' | 'SCORE' | 'PERCENTILE'
 * @returns {{ qualified: boolean, cutoff: number, margin: number }}
 */
function evaluateYear(userValue, record, metricType) {
  let cutoff, qualified, margin;

  if (metricType === 'RANK') {
    // Lower rank is better; user qualifies if rank <= closingRank
    cutoff = record.closingRank;
    qualified = userValue <= cutoff;
    // margin: positive means user is well inside the cutoff
    margin = cutoff - userValue;
  } else if (metricType === 'SCORE') {
    // Higher score is better; check cutoffScore field
    cutoff = record.cutoffScore !== undefined ? record.cutoffScore : record.closingScore;
    qualified = userValue >= cutoff;
    margin = userValue - cutoff;
  } else if (metricType === 'PERCENTILE') {
    // Higher percentile is better; use closingPercentile
    cutoff = record.closingPercentile !== undefined ? record.closingPercentile : record.cutoffScore;
    qualified = userValue >= cutoff;
    margin = userValue - cutoff;
  } else {
    throw new Error(`Unknown metricType: ${metricType}`);
  }

  return { qualified, cutoff, margin };
}

/**
 * Compute recency-weighted probability and all supporting analytics.
 * @param {number} userValue
 * @param {Array} records - Array of year records from the data file
 * @param {string} metricType
 * @returns {object} Full analytics result
 */
function computeProbability(userValue, records, metricType) {
  if (!records || records.length === 0) {
    return { probability: null, error: 'No historical data available for this selection.' };
  }

  const availableYears = records.map((r) => r.year).sort((a, b) => b - a);
  const totalWeight = availableYears.reduce((sum, y) => sum + (YEAR_WEIGHTS[y] || 0.10), 0);

  let weightedScore = 0;
  let qualifiedCount = 0;
  const yearBreakdown = [];

  for (const record of records) {
    const year = record.year;
    const weight = YEAR_WEIGHTS[year] || 0.10;
    const { qualified, cutoff, margin } = evaluateYear(userValue, record, metricType);

    if (qualified) {
      weightedScore += weight;
      qualifiedCount++;
    }

    // Margin bonus/penalty: ±up to 0.08 based on distance from cutoff
    let normalizedRange = metricType === 'RANK' ? Math.max(cutoff, 1) : Math.max(Math.abs(cutoff), 1);
    let marginRatio = Math.min(Math.abs(margin) / normalizedRange, 1.0);
    let marginBonus = qualified
      ? marginRatio * 0.08 * weight   // qualified + big margin = bonus
      : -marginRatio * 0.08 * weight; // not qualified + close = small penalty

    weightedScore += marginBonus;

    yearBreakdown.push({
      year,
      cutoff,
      userValue,
      qualified,
      margin: Math.round(margin * 100) / 100,
      openingRank: record.openingRank,
      openingScore: record.openingScore,
      openingPercentile: record.openingPercentile,
      maxMarks: record.maxMarks,
      maxScore: record.maxScore,
    });
  }

  // Normalise to 0-99.5%
  let probability = Math.min((weightedScore / totalWeight) * 100, 99.5);
  probability = Math.max(probability, 0.5);

  // Trend: compare closing cutoff of last 2 years vs first 2 years
  const sorted = [...records].sort((a, b) => a.year - b.year);
  let trend = 'stable';
  if (sorted.length >= 3) {
    const early = sorted.slice(0, Math.floor(sorted.length / 2));
    const recent = sorted.slice(-Math.floor(sorted.length / 2));
    const getVal = (r) =>
      metricType === 'RANK' ? r.closingRank : (r.cutoffScore ?? r.closingPercentile ?? r.closingScore ?? 0);
    const earlyAvg = early.reduce((s, r) => s + getVal(r), 0) / early.length;
    const recentAvg = recent.reduce((s, r) => s + getVal(r), 0) / recent.length;
    const diff = recentAvg - earlyAvg;
    const threshold = earlyAvg * 0.05;
    if (metricType === 'RANK') {
      trend = diff > threshold ? 'loosening' : diff < -threshold ? 'tightening' : 'stable';
    } else {
      trend = diff > threshold ? 'tightening' : diff < -threshold ? 'loosening' : 'stable';
    }
  }

  // Plain-language summary
  const summary = generateSummary(userValue, qualifiedCount, records.length, probability, trend, metricType);

  // Classification badge
  let badge, badgeColor;
  if (probability >= 72) { badge = 'Safe Choice'; badgeColor = 'green'; }
  else if (probability >= 42) { badge = 'Target Choice'; badgeColor = 'amber'; }
  else { badge = 'Ambitious / Reach'; badgeColor = 'red'; }

  return {
    probability: Math.round(probability * 10) / 10,
    qualifiedCount,
    totalYears: records.length,
    badge,
    badgeColor,
    trend,
    summary,
    yearBreakdown: yearBreakdown.sort((a, b) => b.year - a.year),
  };
}

function generateSummary(userValue, qualifiedCount, totalYears, probability, trend, metricType) {
  const metricWord = metricType === 'RANK' ? `Rank ${userValue.toLocaleString()}` :
    metricType === 'PERCENTILE' ? `${userValue} percentile` : `Score ${userValue}`;

  let qualStr;
  if (qualifiedCount === totalYears) qualStr = `all ${totalYears} years on record`;
  else if (qualifiedCount === 0) qualStr = `none of the ${totalYears} years on record`;
  else qualStr = `${qualifiedCount} out of ${totalYears} years`;

  let trendStr = '';
  if (trend === 'tightening') trendStr = ' Cutoffs are trending more competitive — plan conservatively.';
  else if (trend === 'loosening') trendStr = ' Cutoffs appear to be easing — a positive signal.';

  return `With ${metricWord}, you would have qualified in ${qualStr} historically, giving a ${Math.round(probability)}% estimated historical chance.${trendStr}`;
}

/**
 * Run the recommender: evaluate all records in a dataset for a user's value.
 * Returns results grouped into Safe, Target, and Reach.
 */
function runRecommender(userValue, allRecords, metricType) {
  const results = [];

  for (const entry of allRecords) {
    const result = computeProbability(userValue, entry.records, metricType);
    if (!result.error) {
      results.push({
        institute: entry.institute,
        instituteType: entry.instituteType,
        branch: entry.branch,
        branchCode: entry.branchCode,
        category: entry.category,
        quota: entry.quota,
        probability: result.probability,
        badge: result.badge,
        badgeColor: result.badgeColor,
        trend: result.trend,
        qualifiedCount: result.qualifiedCount,
        totalYears: result.totalYears,
      });
    }
  }

  results.sort((a, b) => b.probability - a.probability);

  return {
    safe: results.filter((r) => r.probability >= 72),
    target: results.filter((r) => r.probability >= 42 && r.probability < 72),
    reach: results.filter((r) => r.probability < 42),
  };
}

module.exports = { computeProbability, runRecommender, evaluateYear };
