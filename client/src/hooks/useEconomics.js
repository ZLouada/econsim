import { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_PARAMS } from '../utils/defaults'
import { calculateEconomics } from '../services/api'

export function useEconomics() {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        // Build the payload – apply optional constraints only when enabled
        const payload = {
          ...params,
          priceCeiling: params.enablePriceCeiling ? params.priceCeilingValue : null,
          priceFloor:   params.enablePriceFloor   ? params.priceFloorValue   : null,
          importQuota:  params.enableImportQuota   ? params.importQuotaValue  : null,
        }
        const data = await calculateEconomics(payload)
        setResults(data)
      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Calculation failed')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timerRef.current)
  }, [params])

  const updateParam = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetParams = useCallback(() => {
    setParams(DEFAULT_PARAMS)
  }, [])

  return { params, results, loading, error, updateParam, resetParams }
}
