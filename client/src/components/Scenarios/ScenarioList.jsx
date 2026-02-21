import React, { useEffect, useState } from 'react'
import ScenarioCard from './ScenarioCard'
import { getScenarios } from '../../services/api'

export default function ScenarioList() {
  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  useEffect(() => {
    setLoading(true)
    setError(null)
    getScenarios(page, limit)
      .then((data) => {
        const items = data.data || data.scenarios || data
        setScenarios(items)
        setTotal(data.pagination?.total || data.total || items.length)
      })
      .catch((err) => setError(err?.response?.data?.error || err.message))
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (loading) return <div className="loading">Loading scenarios…</div>
  if (error)   return <div className="form-error">⚠ {error}</div>
  if (!scenarios.length) return <div className="empty-state">No scenarios found. Create one from the Simulator!</div>

  return (
    <>
      <div className="scenarios-grid">
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </>
  )
}
