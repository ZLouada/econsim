import { Router } from 'express';
import calculateEconomics from '../engine/economics.js';

const router = Router();

/**
 * POST /api/calculate
 * Body: economics parameters (all optional; defaults applied in engine)
 * Returns computed equilibrium, surpluses, curves, etc.
 */
router.post('/', (req, res, next) => {
  try {
    const {
      consumerIncome,
      productionCost,
      taxPerUnit,
      demandElasticity,
      supplyElasticity,
      priceCeiling,
      priceFloor,
      importQuota,
      demandIntercept,
      supplyIntercept,
      demandSlope,
      supplySlope,
    } = req.body;

    // Validate numeric fields when provided
    const numericFields = {
      consumerIncome,
      productionCost,
      taxPerUnit,
      demandElasticity,
      supplyElasticity,
      priceCeiling,
      priceFloor,
      importQuota,
      demandIntercept,
      supplyIntercept,
      demandSlope,
      supplySlope,
    };

    for (const [key, value] of Object.entries(numericFields)) {
      if (value !== undefined && value !== null && typeof value !== 'number') {
        return res.status(400).json({
          success: false,
          error: `Parameter '${key}' must be a number.`,
        });
      }
    }

    // demandSlope and supplySlope must be positive when provided
    if (demandSlope !== undefined && demandSlope !== null && demandSlope <= 0) {
      return res.status(400).json({ success: false, error: "'demandSlope' must be positive." });
    }
    if (supplySlope !== undefined && supplySlope !== null && supplySlope <= 0) {
      return res.status(400).json({ success: false, error: "'supplySlope' must be positive." });
    }

    const results = calculateEconomics(req.body);
    return res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

export default router;
