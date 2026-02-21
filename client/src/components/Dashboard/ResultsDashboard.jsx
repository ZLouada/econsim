import React from 'react'

function fmt$(v) {
  if (v == null || isNaN(v)) return '–'
  return `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtQ(v) {
  if (v == null || isNaN(v)) return '–'
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function MetricCard({ label, value, colorClass = 'neutral' }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${colorClass}`}>{value}</div>
    </div>
  )
}

export default function ResultsDashboard({ results, loading, error }) {
  if (loading) return <div className="results-dashboard"><div className="loading">Calculating…</div></div>
  if (error)   return <div className="results-dashboard"><div className="form-error">⚠ {error}</div></div>
  if (!results) return <div className="results-dashboard"><div className="loading">No results yet</div></div>

  const {
    equilibriumPrice,
    equilibriumQuantity,
    consumerSurplus,
    producerSurplus,
    totalSurplus,
    deadweightLoss,
    taxRevenue,
    shortageQuantity,
    surplusQuantity,
  } = results

  const shortage_surplus = shortageQuantity > 0
    ? { label: 'Shortage', value: fmtQ(shortageQuantity) + ' units', cls: 'negative' }
    : surplusQuantity > 0
    ? { label: 'Surplus', value: fmtQ(surplusQuantity) + ' units', cls: 'warning' }
    : { label: 'Shortage / Surplus', value: '0 units', cls: 'positive' }

  return (
    <div className="results-dashboard">
      <MetricCard label="Equilibrium Price"    value={fmt$(equilibriumPrice)}    colorClass="neutral" />
      <MetricCard label="Equilibrium Quantity" value={fmtQ(equilibriumQuantity) + ' units'} colorClass="neutral" />
      <MetricCard label="Consumer Surplus"     value={fmt$(consumerSurplus)}     colorClass="positive" />
      <MetricCard label="Producer Surplus"     value={fmt$(producerSurplus)}     colorClass="positive" />
      <MetricCard label="Total Surplus"        value={fmt$(totalSurplus)}        colorClass="positive" />
      <MetricCard label="Deadweight Loss"      value={fmt$(deadweightLoss)}      colorClass={deadweightLoss > 0 ? 'negative' : 'positive'} />
      <MetricCard label="Tax Revenue"          value={fmt$(taxRevenue)}          colorClass={taxRevenue > 0 ? 'warning' : 'neutral'} />
      <MetricCard label={shortage_surplus.label} value={shortage_surplus.value} colorClass={shortage_surplus.cls} />
    </div>
  )
}
