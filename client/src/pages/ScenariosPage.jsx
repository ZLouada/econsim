import React from 'react'
import { Link } from 'react-router-dom'
import ScenarioList from '../components/Scenarios/ScenarioList'

export default function ScenariosPage() {
  return (
    <div className="scenarios-page">
      <h1>📁 Scenarios</h1>
      <p className="page-sub">
        Browse public economic scenarios.{' '}
        <Link to="/" style={{ color: 'var(--accent)' }}>← Back to Simulator</Link>
      </p>
      <ScenarioList />
    </div>
  )
}
