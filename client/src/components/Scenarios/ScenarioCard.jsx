import React from 'react'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ScenarioCard({ scenario, onClick }) {
  return (
    <div className="scenario-card" onClick={() => onClick && onClick(scenario)}>
      <div className="scenario-card-title">{scenario.title}</div>
      {scenario.description && (
        <div className="scenario-card-desc">{scenario.description}</div>
      )}
      <div className="scenario-card-meta">
        <span className={`badge ${scenario.is_public ? 'badge-public' : 'badge-private'}`}>
          {scenario.is_public ? 'Public' : 'Private'}
        </span>
        {scenario.created_at && <span>{formatDate(scenario.created_at)}</span>}
        {scenario.username && <span>by {scenario.username}</span>}
      </div>
    </div>
  )
}
