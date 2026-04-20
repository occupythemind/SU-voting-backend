const pool = require('../../../config/db');

async function listContestCategories(req, res) {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC;');
    return res.status(200).json({ categories: result.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function listCategoryContestants(req, res) {
  try {
    const categoryId = req.params.id;

    const contestantsResult = await pool.query(
      `SELECT
         con.id AS contest_id,
         con.category_id,
         con.user_id,
         u.full_name,
         u.matric_number,
         COUNT(v.id)::int AS vote_count
       FROM contests con
       JOIN users u ON u.id = con.user_id
       LEFT JOIN votes v ON v.contest_id = con.id
       WHERE con.category_id = $1
       GROUP BY con.id, u.full_name, u.matric_number
       ORDER BY vote_count DESC, u.full_name ASC;`,
      [categoryId]
    );

    const userVoteResult = await pool.query(
      `SELECT v.contest_id
       FROM votes v
       JOIN contests con ON con.id = v.contest_id
       WHERE v.voter_id = $1 AND con.category_id = $2`,
      [req.user.id, categoryId]
    );

    return res.status(200).json({
      contestants: contestantsResult.rows,
      user_vote: userVoteResult.rows.length ? userVoteResult.rows[0].contest_id : null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function voteCategoryContestant(req, res) {
  try {
    const categoryId = req.params.id;
    const { contest_id } = req.body;

    if (!contest_id) {
      return res.status(400).json({ error: 'contest_id is required to vote' });
    }

    const contestResult = await pool.query(
      'SELECT id, category_id FROM contests WHERE id = $1',
      [contest_id]
    );

    if (contestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contestant not found' });
    }

    if (contestResult.rows[0].category_id !== categoryId) {
      return res.status(400).json({ error: 'Contestant does not belong to this category' });
    }

    const existingVote = await pool.query(
      `SELECT v.contest_id
       FROM votes v
       JOIN contests con ON con.id = v.contest_id
       WHERE v.voter_id = $1 AND con.category_id = $2`,
      [req.user.id, categoryId]
    );

    if (existingVote.rows.length > 0) {
      if (existingVote.rows[0].contest_id === contest_id) {
        return res.status(400).json({ error: 'You already voted for this contestant' });
      }
      return res.status(400).json({ error: 'You have already voted in this category' });
    }

    await pool.query(
      'INSERT INTO votes (voter_id, contest_id) VALUES ($1, $2)',
      [req.user.id, contest_id]
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `vote:${contest_id}`]
    );

    return res.status(201).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function unvoteCategoryContestant(req, res) {
  try {
    const categoryId = req.params.id;
    const { contest_id } = req.body;

    let deleteResult;
    let removedContestId = contest_id;

    if (contest_id) {
      const contestResult = await pool.query(
        'SELECT id, category_id FROM contests WHERE id = $1',
        [contest_id]
      );

      if (contestResult.rows.length === 0) {
        return res.status(404).json({ error: 'Contestant not found' });
      }

      if (contestResult.rows[0].category_id !== categoryId) {
        return res.status(400).json({ error: 'Contestant does not belong to this category' });
      }

      deleteResult = await pool.query(
        'DELETE FROM votes WHERE voter_id = $1 AND contest_id = $2 RETURNING *',
        [req.user.id, contest_id]
      );
    } else {
      deleteResult = await pool.query(
        `DELETE FROM votes v
         USING contests con
         WHERE v.contest_id = con.id
           AND v.voter_id = $1
           AND con.category_id = $2
         RETURNING v.*;`,
        [req.user.id, categoryId]
      );
      if (deleteResult.rows.length > 0) {
        removedContestId = deleteResult.rows[0].contest_id;
      }
    }

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: 'No vote found to remove' });
    }

    await pool.query(
      'INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)',
      [req.user.id, `unvote:${removedContestId || categoryId}`]
    );

    return res.status(200).json({ message: 'Vote removed successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listContestCategories,
  listCategoryContestants,
  voteCategoryContestant,
  unvoteCategoryContestant
};
