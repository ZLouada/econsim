import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function buildCurvePoints(intercept, slope, qMin, qMax, steps = 60) {
  const points = []
  for (let i = 0; i <= steps; i++) {
    const q = qMin + (i / steps) * (qMax - qMin)
    const p = intercept - slope * q  // demand: P = a - b*Q
    points.push({ x: q, y: p })
  }
  return points
}

function buildSupplyPoints(intercept, slope, qMin, qMax, steps = 60) {
  const points = []
  for (let i = 0; i <= steps; i++) {
    const q = qMin + (i / steps) * (qMax - qMin)
    const p = intercept + slope * q  // supply: P = c + d*Q
    points.push({ x: q, y: p })
  }
  return points
}

export default function EconChart({ results, params }) {
  const chartData = useMemo(() => {
    if (!results || !params) return null

    const { equilibriumPrice, equilibriumQuantity } = results
    const qMax = Math.max(equilibriumQuantity * 2, 10)
    const qMin = 0

    const demandPts = buildCurvePoints(params.demandIntercept, params.demandSlope, qMin, qMax)
    const supplyPts = buildSupplyPoints(params.supplyIntercept, params.supplySlope, qMin, qMax)

    // Consumer surplus fill: from Q=0 to Qeq, between demand curve and eq price
    const csFill = demandPts
      .filter((p) => p.x <= equilibriumQuantity)
      .map((p) => ({ x: p.x, y: Math.max(p.y, equilibriumPrice) }))

    // Producer surplus fill: from Q=0 to Qeq, between eq price and supply curve
    const psFill = supplyPts
      .filter((p) => p.x <= equilibriumQuantity)
      .map((p) => ({ x: p.x, y: Math.min(p.y, equilibriumPrice) }))

    const datasets = [
      // Demand curve
      {
        label: 'Demand',
        data: demandPts,
        borderColor: '#4f8ef7',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0,
        parsing: false,
      },
      // Supply curve
      {
        label: 'Supply',
        data: supplyPts,
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0,
        parsing: false,
      },
      // Consumer surplus area
      {
        label: 'Consumer Surplus',
        data: csFill,
        borderColor: 'transparent',
        backgroundColor: 'rgba(34,197,94,0.2)',
        fill: {
          target: { value: equilibriumPrice },
          above: 'rgba(34,197,94,0.2)',
        },
        borderWidth: 0,
        pointRadius: 0,
        tension: 0,
        parsing: false,
      },
      // Producer surplus area
      {
        label: 'Producer Surplus',
        data: psFill,
        borderColor: 'transparent',
        backgroundColor: 'rgba(79,142,247,0.2)',
        fill: {
          target: { value: equilibriumPrice },
          below: 'rgba(79,142,247,0.2)',
        },
        borderWidth: 0,
        pointRadius: 0,
        tension: 0,
        parsing: false,
      },
      // Equilibrium point
      {
        label: 'Equilibrium',
        data: [{ x: equilibriumQuantity, y: equilibriumPrice }],
        borderColor: '#fbbf24',
        backgroundColor: '#fbbf24',
        pointRadius: 8,
        pointHoverRadius: 10,
        borderWidth: 2,
        showLine: false,
        parsing: false,
      },
    ]

    // Deadweight loss when there's a tax or binding price control
    const hasDWL = results.deadweightLoss && results.deadweightLoss > 0
    const distortedQty = results.shortageQuantity > 0
      ? equilibriumQuantity - results.shortageQuantity
      : results.surplusQuantity > 0
      ? equilibriumQuantity - results.surplusQuantity
      : null

    if (hasDWL && distortedQty != null && distortedQty < equilibriumQuantity) {
      const dq = distortedQty
      const dwlPts = demandPts
        .filter((p) => p.x >= dq && p.x <= equilibriumQuantity)
      datasets.push({
        label: 'Deadweight Loss',
        data: dwlPts,
        borderColor: 'transparent',
        backgroundColor: 'rgba(239,68,68,0.3)',
        fill: { target: 'origin', above: 'rgba(239,68,68,0.3)' },
        borderWidth: 0,
        pointRadius: 0,
        tension: 0,
        parsing: false,
      })
    }
    return { datasets }
  }, [results, params])

  if (!chartData) {
    return (
      <div className="chart-area">
        <div className="chart-placeholder">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</div>
          <div>Adjust parameters to see the supply &amp; demand chart</div>
        </div>
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 150 },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'Quantity', color: '#8892a4' },
        grid: { color: 'rgba(46,50,71,0.8)' },
        ticks: { color: '#8892a4' },
        min: 0,
      },
      y: {
        type: 'linear',
        title: { display: true, text: 'Price ($)', color: '#8892a4' },
        grid: { color: 'rgba(46,50,71,0.8)' },
        ticks: { color: '#8892a4', callback: (v) => `$${v}` },
        min: 0,
      },
    },
    plugins: {
      legend: {
        labels: { color: '#e2e8f0', boxWidth: 12, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.label === 'Equilibrium') {
              return [`Price: $${ctx.parsed.y.toFixed(2)}`, `Qty: ${ctx.parsed.x.toFixed(2)}`]
            }
            return `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`
          },
        },
      },
    },
  }

  return (
    <div className="chart-area">
      <Line data={chartData} options={options} style={{ maxHeight: '100%' }} />
    </div>
  )
}
