import React from 'react'

export default function SliderInput({ label, min, max, step = 1, value, onChange, formatValue }) {
  const display = formatValue ? formatValue(value) : value

  return (
    <div className="slider-input">
      <div className="slider-label">
        <span>{label}</span>
        <span className="slider-value">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
