const pool = require('../../../config/db');

async function createContestCategory(req, res) {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Contest Category Title is required.' });
    }

    const result = await pool.query(
      'INSERT INTO categories (title, description) VALUES ($1, $2) RETURNING *;',
      [title, description]
    );

    return res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateContestCategory(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    if (!title && !description) {
      return res.status(400).json({ error: 'Provide at least one field to update' });
    }

    const result = await pool.query(
      `UPDATE categories
       SET title = COALESCE($1, title),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *;`,
      [title, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json({
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function deleteContestCategory(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM categories
       WHERE id = $1
       RETURNING *;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json({
      message: 'Category deleted successfully',
      category: result.rows[0]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function addUserToContest(req, res) {
  try {
    const { user_id, category_id } = req.body;

    if (!user_id || !category_id) {
      return res.status(400).json({ error: 'user_id and category_id are required' });
    }

    const category = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (category.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const user = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingContest = await pool.query(
      'SELECT id FROM contests WHERE user_id = $1 AND category_id = $2',
      [user_id, category_id]
    );

    if (existingContest.rows.length > 0) {
      return res.status(400).json({ error: 'This user is already a contestant in that category' });
    }

    const result = await pool.query(
      'INSERT INTO contests (user_id, category_id) VALUES ($1, $2) RETURNING *;', 
      [user_id, category_id]
    );

    return res.status(201).json({
      message: 'Contestant added successfully',
      contest: result.rows[0]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function removeUserFromContest(req, res) {
  try {
    const { contest_id } = req.body;

    if (!contest_id) {
      return res.status(400).json({ error: 'contest_id is required' });
    }

    const result = await pool.query(
      `DELETE FROM contests
       WHERE id = $1
       RETURNING *;`,
      [contest_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contestant entry not found' });
    }

    return res.status(200).json({
      message: 'Contestant removed successfully',
      contest: result.rows[0]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function listContestResult(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         cat.id AS category_id,
         cat.title AS category_title,
         cat.description AS category_description,
         json_agg(
           json_build_object(
             'contest_id', con.id,
             'candidate_id', u.id,
             'candidate_name', u.full_name,
             'vote_count', COALESCE(v.vote_count, 0),
             'voters', COALESCE(v.voters, '[]'::json)
           ) ORDER BY COALESCE(v.vote_count, 0) DESC
         ) AS contestants
       FROM categories cat
       JOIN contests con ON con.category_id = cat.id
       JOIN users u ON u.id = con.user_id
       LEFT JOIN (
         SELECT
           con.id AS contest_id,
           COUNT(v.id)::int AS vote_count,
           json_agg(
             json_build_object(
               'voter_id', v.voter_id,
               'full_name', uv.full_name,
               'matric_number', uv.matric_number,
               'voted_at', v.created_at
             ) ORDER BY v.created_at DESC
           ) FILTER (WHERE v.id IS NOT NULL) AS voters
         FROM votes v
         JOIN contests con ON con.id = v.contest_id
         JOIN users uv ON uv.id = v.voter_id
         GROUP BY con.id
       ) v ON v.contest_id = con.id
       GROUP BY cat.id
       ORDER BY cat.created_at DESC;`
    );

    return res.status(200).json({ categories: result.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getCategoryContestResultVisual(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         con.id AS contest_id,
         u.id AS candidate_id,
         u.full_name AS candidate_name,
         COUNT(v.id)::int AS vote_count
       FROM contests con
       JOIN users u ON u.id = con.user_id
       LEFT JOIN votes v ON v.contest_id = con.id
       WHERE con.category_id = $1
       GROUP BY con.id, u.id, u.full_name
       ORDER BY vote_count DESC, u.full_name ASC;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No contestants found for this category' });
    }

    return res.status(200).json({ contestants: result.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function listAuditLogs(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         al.id,
         al.user_id,
         al.action,
         al.created_at,
         u.full_name,
         u.matric_number
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC;`
    );

    return res.status(200).json({ audit_logs: result.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createContestCategory,
  updateContestCategory,
  deleteContestCategory,
  addUserToContest,
  removeUserFromContest,
  listContestResult,
  getCategoryContestResultVisual,
  listAuditLogs
};