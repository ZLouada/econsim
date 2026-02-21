import { Router } from 'express';
import pool from '../db/index.js';
import auth from '../middleware/auth.js';

const router = Router();

// Helpers
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

async function uniqueSlug(base) {
  let slug = slugify(base);
  const MAX_ATTEMPTS = 100;
  for (let suffix = 0; suffix < MAX_ATTEMPTS; suffix++) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const { rows } = await pool.query('SELECT id FROM scenarios WHERE slug = $1', [candidate]);
    if (rows.length === 0) return candidate;
  }
  throw Object.assign(new Error('Could not generate a unique slug after maximum attempts.'), { status: 500 });
}

// ─── POST /api/scenarios ─────────────────────────────────────────────────────
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, description, parameters, results, is_public = true } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, error: "'title' is required." });
    }
    if (!parameters || typeof parameters !== 'object') {
      return res.status(400).json({ success: false, error: "'parameters' object is required." });
    }

    const slug = await uniqueSlug(title);
    const { rows } = await pool.query(
      `INSERT INTO scenarios (user_id, title, description, slug, parameters, results, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title.trim(), description || null, slug, parameters, results || null, is_public]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/scenarios ───────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { rows: countRows } = await pool.query(
      'SELECT COUNT(*) FROM scenarios WHERE is_public = TRUE'
    );
    const total = parseInt(countRows[0].count);

    const { rows } = await pool.query(
      `SELECT s.*, u.username
       FROM scenarios s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.is_public = TRUE
       ORDER BY s.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/scenarios/share/:slug ──────────────────────────────────────────
// Must be declared BEFORE /:id to avoid shadowing
router.get('/share/:slug', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, u.username
       FROM scenarios s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.slug = $1`,
      [req.params.slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Scenario not found.' });
    }
    const scenario = rows[0];
    if (!scenario.is_public) {
      return res.status(403).json({ success: false, error: 'This scenario is private.' });
    }
    return res.json({ success: true, data: scenario });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/scenarios/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, u.username
       FROM scenarios s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Scenario not found.' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/scenarios/:id ───────────────────────────────────────────────────
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { rows: existing } = await pool.query('SELECT * FROM scenarios WHERE id = $1', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Scenario not found.' });
    }
    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to edit this scenario.' });
    }

    const { title, description, parameters, results, is_public } = req.body;
    const current = existing[0];

    const newTitle = title !== undefined ? title.trim() : current.title;
    const newDescription = description !== undefined ? description : current.description;
    const newParameters = parameters !== undefined ? parameters : current.parameters;
    const newResults = results !== undefined ? results : current.results;
    const newIsPublic = is_public !== undefined ? is_public : current.is_public;

    const { rows } = await pool.query(
      `UPDATE scenarios
       SET title = $1, description = $2, parameters = $3, results = $4, is_public = $5
       WHERE id = $6
       RETURNING *`,
      [newTitle, newDescription, newParameters, newResults, newIsPublic, req.params.id]
    );
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/scenarios/:id ────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT user_id FROM scenarios WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Scenario not found.' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this scenario.' });
    }
    await pool.query('DELETE FROM scenarios WHERE id = $1', [req.params.id]);
    return res.json({ success: true, message: 'Scenario deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
