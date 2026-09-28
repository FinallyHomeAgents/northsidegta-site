const MIN_VALUE = 500000;
const MAX_VALUE = 3000000;
function comparisonRows(market, value) {
  return Object.entries(market.municipalities || {})
    .filter(([, town]) => Number.isFinite(town.byType?.all?.avg) && town.byType.all.avg > 0)
    .map(([slug, town]) => ({ slug, name: town.name, average: town.byType.all.avg,
      difference: value - town.byType.all.avg,
      percent: Math.round((value / town.byType.all.avg - 1) * 100) }))
    .sort((a, b) => a.average - b.average);
}
module.exports = { MIN_VALUE, MAX_VALUE, comparisonRows };
