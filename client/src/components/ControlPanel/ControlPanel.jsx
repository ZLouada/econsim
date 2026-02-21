import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SliderInput from './SliderInput'
import SaveScenarioModal from '../Scenarios/SaveScenarioModal'
import { useAuth } from '../../hooks/useAuth'

function Toggle({ label, checked, onChange }) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  )
}

function NumberInput({ label, value, onChange }) {
  return (
    <div className="number-input-row">
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export default function ControlPanel({ params, updateParam, resetParams, currentResults }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const handleSave = () => {
    if (!user) { navigate('/login'); return }
    setShowModal(true)
  }

  const fmt$ = (v) => `$${v.toLocaleString()}`

  return (
    <aside className="control-panel">
      {/* Market Parameters */}
      <div className="panel-section">
        <div className="panel-section-title">Market Parameters</div>
        <SliderInput
          label="Consumer Income"
          min={0} max={200000} step={1000}
          value={params.consumerIncome}
          onChange={(v) => updateParam('consumerIncome', v)}
          formatValue={fmt$}
        />
        <SliderInput
          label="Production Cost"
          min={0} max={100} step={1}
          value={params.productionCost}
          onChange={(v) => updateParam('productionCost', v)}
          formatValue={(v) => `$${v}`}
        />
        <SliderInput
          label="Tax Per Unit"
          min={0} max={50} step={1}
          value={params.taxPerUnit}
          onChange={(v) => updateParam('taxPerUnit', v)}
          formatValue={(v) => `$${v}`}
        />
      </div>

      {/* Elasticity */}
      <div className="panel-section">
        <div className="panel-section-title">Elasticity</div>
        <SliderInput
          label="Demand Elasticity"
          min={0.1} max={5.0} step={0.1}
          value={params.demandElasticity}
          onChange={(v) => updateParam('demandElasticity', v)}
          formatValue={(v) => v.toFixed(1)}
        />
        <SliderInput
          label="Supply Elasticity"
          min={0.1} max={5.0} step={0.1}
          value={params.supplyElasticity}
          onChange={(v) => updateParam('supplyElasticity', v)}
          formatValue={(v) => v.toFixed(1)}
        />
      </div>

      {/* Curve Intercepts & Slopes */}
      <div className="panel-section">
        <div className="panel-section-title">Curve Parameters</div>
        <NumberInput label="Demand Intercept" value={params.demandIntercept} onChange={(v) => updateParam('demandIntercept', v)} />
        <NumberInput label="Demand Slope"     value={params.demandSlope}     onChange={(v) => updateParam('demandSlope', v)} />
        <NumberInput label="Supply Intercept" value={params.supplyIntercept} onChange={(v) => updateParam('supplyIntercept', v)} />
        <NumberInput label="Supply Slope"     value={params.supplySlope}     onChange={(v) => updateParam('supplySlope', v)} />
      </div>

      {/* Price Ceiling */}
      <div className="panel-section">
        <div className="panel-section-title">Price Controls</div>
        <Toggle
          label="Price Ceiling"
          checked={params.enablePriceCeiling}
          onChange={(v) => updateParam('enablePriceCeiling', v)}
        />
        {params.enablePriceCeiling && (
          <SliderInput
            label="Ceiling Value"
            min={0} max={100} step={1}
            value={params.priceCeilingValue}
            onChange={(v) => updateParam('priceCeilingValue', v)}
            formatValue={(v) => `$${v}`}
          />
        )}
        <Toggle
          label="Price Floor"
          checked={params.enablePriceFloor}
          onChange={(v) => updateParam('enablePriceFloor', v)}
        />
        {params.enablePriceFloor && (
          <SliderInput
            label="Floor Value"
            min={0} max={100} step={1}
            value={params.priceFloorValue}
            onChange={(v) => updateParam('priceFloorValue', v)}
            formatValue={(v) => `$${v}`}
          />
        )}
      </div>

      {/* Import Quota */}
      <div className="panel-section">
        <div className="panel-section-title">Trade Policy</div>
        <Toggle
          label="Import Quota"
          checked={params.enableImportQuota}
          onChange={(v) => updateParam('enableImportQuota', v)}
        />
        {params.enableImportQuota && (
          <SliderInput
            label="Quota Value (units)"
            min={0} max={1000} step={10}
            value={params.importQuotaValue}
            onChange={(v) => updateParam('importQuotaValue', v)}
          />
        )}
      </div>

      {/* Actions */}
      <div className="panel-section panel-actions">
        <button className="btn btn-secondary" onClick={resetParams}>↺ Reset to Defaults</button>
        <button className="btn btn-primary"   onClick={handleSave}>💾 Save Scenario</button>
      </div>

      {showModal && (
        <SaveScenarioModal
          params={params}
          results={currentResults}
          onClose={() => setShowModal(false)}
        />
      )}
    </aside>
  )
}
