function getMarketTrend(value) {
  const displayValue = String(value ?? "").trim();
  const numericValue = Number.parseFloat(displayValue.replace(/[^0-9.+-]/g, ""));

  if (Number.isFinite(numericValue) && numericValue < 0) {
    return { direction: "down", arrow: "↓", label: `↓ ${displayValue}` };
  }
  if (Number.isFinite(numericValue) && numericValue > 0) {
    return { direction: "up", arrow: "↑", label: `↑ ${displayValue}` };
  }
  return { direction: "neutral", arrow: "", label: displayValue };
}

module.exports = { getMarketTrend };
