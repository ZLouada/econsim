/**
 * Economics math engine for EconSim.
 * Computes supply/demand equilibrium, surpluses, deadweight loss,
 * and curve data points for rendering.
 */

/**
 * @param {object} params
 * @returns {object} Full economics results
 */
export default function calculateEconomics(params) {
  const {
    consumerIncome = 50000,
    productionCost = 20,
    taxPerUnit = 0,
    demandElasticity = 1.0,   // reserved for future use
    supplyElasticity = 1.0,   // reserved for future use
    priceCeiling = null,
    priceFloor = null,
    importQuota = null,       // reserved for future use
    demandIntercept = 100,
    supplyIntercept = 10,
    demandSlope = 2,
    supplySlope = 1.5,
  } = params;

  // --- Demand: Qd(P) = demandIntercept - demandSlope*P + (consumerIncome/10000) - taxPerUnit*0.5
  // --- Supply: Qs(P) = supplyIntercept + supplySlope*P - productionCost*0.5 - taxPerUnit*0.5
  const demandShift = consumerIncome / 10000 - taxPerUnit * 0.5;
  const supplyShift = -(productionCost * 0.5) - taxPerUnit * 0.5;

  const Qd = (P) => Math.max(0, demandIntercept + demandShift - demandSlope * P);
  const Qs = (P) => Math.max(0, supplyIntercept + supplyShift + supplySlope * P);

  // Equilibrium: demandIntercept + demandShift - demandSlope*P = supplyIntercept + supplyShift + supplySlope*P
  // => (demandIntercept + demandShift - supplyIntercept - supplyShift) = (demandSlope + supplySlope)*P
  const totalSlope = demandSlope + supplySlope;
  const numerator = demandIntercept + demandShift - supplyIntercept - supplyShift;

  let equilibriumPrice, equilibriumQuantity;
  if (Math.abs(totalSlope) < 1e-10) {
    // Parallel curves — no unique equilibrium
    equilibriumPrice = 0;
    equilibriumQuantity = 0;
  } else {
    equilibriumPrice = Math.max(0, numerator / totalSlope);
    equilibriumQuantity = Math.max(0, Qd(equilibriumPrice));
  }

  // No-tax equilibrium (for DWL calculation when tax > 0)
  const demandShiftNoTax = consumerIncome / 10000;
  const supplyShiftNoTax = -(productionCost * 0.5);
  const numeratorNoTax = demandIntercept + demandShiftNoTax - supplyIntercept - supplyShiftNoTax;
  const PnoTax = Math.abs(totalSlope) < 1e-10
    ? equilibriumPrice
    : Math.max(0, numeratorNoTax / totalSlope);
  // No-tax demand/supply functions (no tax shift)
  const QdNoTax = (P) => Math.max(0, demandIntercept + demandShiftNoTax - demandSlope * P);
  const QnoTaxQty = QdNoTax(PnoTax);

  // Curve axis limits
  const Pmax = demandSlope > 0 ? (demandIntercept + demandShift) / demandSlope : 0;
  const Pmin = supplySlope > 0 ? -(supplyIntercept + supplyShift) / supplySlope : 0;
  const curveMaxP = Math.max(0, Pmax + 20);

  // Consumer Surplus: 0.5 * (Pmax - P*) * Q*
  const rawCS = Pmax > equilibriumPrice
    ? 0.5 * (Pmax - equilibriumPrice) * equilibriumQuantity
    : 0;

  // Producer Surplus: 0.5 * (P* - Pmin) * Q*
  const rawPS = equilibriumPrice > Pmin
    ? 0.5 * (equilibriumPrice - Math.max(0, Pmin)) * equilibriumQuantity
    : 0;

  // Tax revenue and DWL from tax
  const taxRevenue = taxPerUnit * equilibriumQuantity;
  const dwlTax = taxPerUnit > 0
    ? Math.max(0, 0.5 * taxPerUnit * (QnoTaxQty - equilibriumQuantity))
    : 0;

  // Price controls
  let shortageQuantity = 0;
  let surplusQuantity = 0;
  let dwlCeiling = 0;
  let dwlFloor = 0;
  let effectivePriceConsumers = equilibriumPrice;
  let effectivePriceProducers = equilibriumPrice;

  const activeCeiling = priceCeiling !== null && priceCeiling < equilibriumPrice;
  const activeFloor = priceFloor !== null && priceFloor > equilibriumPrice;

  if (activeCeiling) {
    const pc = priceCeiling;
    const qdCeiling = Qd(pc);
    const qsCeiling = Qs(pc);
    shortageQuantity = Math.max(0, qdCeiling - qsCeiling);
    dwlCeiling = Math.max(0, 0.5 * (equilibriumPrice - pc) * shortageQuantity);
    effectivePriceConsumers = pc;
    effectivePriceProducers = pc;
  }

  if (activeFloor) {
    const pf = priceFloor;
    const qdFloor = Qd(pf);
    const qsFloor = Qs(pf);
    surplusQuantity = Math.max(0, qsFloor - qdFloor);
    dwlFloor = Math.max(0, 0.5 * (pf - equilibriumPrice) * surplusQuantity);
    effectivePriceConsumers = pf;
    effectivePriceProducers = pf;
  }

  const deadweightLoss = dwlTax + dwlCeiling + dwlFloor;

  // Adjust CS/PS for tax wedge
  let consumerSurplus = rawCS;
  let producerSurplus = rawPS;
  if (taxPerUnit > 0 && !activeCeiling && !activeFloor) {
    // With tax: consumers pay P*+tax, producers receive P*
    // CS shrinks, PS shrinks, government collects tax revenue, DWL is the rest
    const pConsumer = equilibriumPrice + taxPerUnit * (supplySlope / totalSlope);
    const pProducer = equilibriumPrice - taxPerUnit * (demandSlope / totalSlope);
    consumerSurplus = Pmax > pConsumer ? Math.max(0, 0.5 * (Pmax - pConsumer) * equilibriumQuantity) : 0;
    producerSurplus = pProducer > Math.max(0, Pmin) ? Math.max(0, 0.5 * (pProducer - Math.max(0, Pmin)) * equilibriumQuantity) : 0;
  }

  const totalSurplus = consumerSurplus + producerSurplus + taxRevenue;

  // --- Curve data points ---
  const steps = 80;
  const stepSize = curveMaxP / steps;
  const demandCurve = [];
  const supplyCurve = [];

  for (let i = 0; i <= steps; i++) {
    const P = i * stepSize;
    demandCurve.push({ price: P, quantity: Qd(P) });
    supplyCurve.push({ price: P, quantity: Qs(P) });
  }

  // --- Surplus shaded regions ---
  const eqQ = equilibriumQuantity;
  const eqP = equilibriumPrice;

  // Consumer surplus polygon: triangle (Q=0,P=Pmax) -> (Q=eqQ,P=eqP) -> (Q=0,P=eqP)
  const csSurplusRegion = Pmax > eqP ? [
    { x: 0, y: Pmax },
    { x: eqQ, y: eqP },
    { x: 0, y: eqP },
  ] : [];

  // Producer surplus polygon: triangle (Q=0,P=Pmin) -> (Q=eqQ,P=eqP) -> (Q=0,P=eqP)
  const psSurplusRegion = eqP > Math.max(0, Pmin) ? [
    { x: 0, y: Math.max(0, Pmin) },
    { x: eqQ, y: eqP },
    { x: 0, y: eqP },
  ] : [];

  // DWL region
  let dwlRegion = [];
  if (taxPerUnit > 0 && eqQ < QnoTaxQty) {
    dwlRegion = [
      { x: eqQ, y: eqP },
      { x: QnoTaxQty, y: eqP },
    ];
  } else if (activeCeiling) {
    const qsCeil = Math.max(0, Qs(priceCeiling));
    dwlRegion = [
      { x: qsCeil, y: priceCeiling },
      { x: eqQ, y: eqP },
    ];
  } else if (activeFloor) {
    const qdFloor = Math.max(0, Qd(priceFloor));
    dwlRegion = [
      { x: qdFloor, y: priceFloor },
      { x: eqQ, y: eqP },
    ];
  }

  return {
    equilibriumPrice: round(equilibriumPrice),
    equilibriumQuantity: round(equilibriumQuantity),
    consumerSurplus: round(consumerSurplus),
    producerSurplus: round(producerSurplus),
    totalSurplus: round(totalSurplus),
    deadweightLoss: round(deadweightLoss),
    taxRevenue: round(taxRevenue),
    effectivePriceConsumers: round(effectivePriceConsumers),
    effectivePriceProducers: round(effectivePriceProducers),
    shortageQuantity: round(shortageQuantity),
    surplusQuantity: round(surplusQuantity),
    demandCurve,
    supplyCurve,
    equilibriumPoint: { price: round(equilibriumPrice), quantity: round(equilibriumQuantity) },
    surplusRegions: {
      consumerSurplus: csSurplusRegion,
      producerSurplus: psSurplusRegion,
      deadweightLoss: dwlRegion,
    },
  };
}

function round(v, decimals = 4) {
  if (!isFinite(v)) return 0;
  return Math.round(v * 10 ** decimals) / 10 ** decimals;
}
