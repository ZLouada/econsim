import React from 'react'
import ControlPanel from '../components/ControlPanel/ControlPanel'
import EconChart from '../components/Chart/EconChart'
import ResultsDashboard from '../components/Dashboard/ResultsDashboard'
import { useEconomics } from '../hooks/useEconomics'

export default function SimulatorPage() {
  const { params, results, loading, error, updateParam, resetParams } = useEconomics()

  return (
    <div className="simulator-layout">
      <ControlPanel
        params={params}
        updateParam={updateParam}
        resetParams={resetParams}
        currentResults={results}
      />
      <EconChart results={results} params={params} />
      <ResultsDashboard results={results} loading={loading} error={error} />
    </div>
  )
}
