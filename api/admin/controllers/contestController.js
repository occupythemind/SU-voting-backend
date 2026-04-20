const pool = require('../../../config/db');

async function createContestCategory(req, res) {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Contest Category Title is required." });
        }

        const result = await pool.query(
            "INSERT INTO categories (title, description, price) VALUES ($1, $2, $3) RETURNING *;",
            [title, description]
        );

        return res.status(201).json({
            message: "category created successfully",
            category: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

async function updateContestCategory(req, res) {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        // Validate ID
        if (!id) {
            return res.status(400).json({ error: "category ID is required" });
        }

        // Optional: ensure at least one field is provided
        if (!title && !description) {
            return res.status(400).json({ error: "Provide at least one field to update" });
        }

        const result = await pool.query(
            `UPDATE categories
             SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
             WHERE id = $4
             RETURNING *;`,
            [title, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "category not found" });
        }

        return res.status(200).json({
            message: "category updated successfully",
            category: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

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
            return res.status(404).json({ error: "category not found" });
        }

        return res.status(200).json({
            message: "category deleted successfully",
            category: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


async function addUserToContest(req, res) {
    
};


async function  removeUserFromContest(req, res) {
    
};


async function listContestResult(req, res) {
    /*
    Total no. of votes for each contestant, on each catgories 
    (ie. Categories --> COntestants & their votes --> List of students who votes for them)
    */
};


async function getCategoryContestResultVisual(req, res) {
    /*
    They must provide a category_id
    Visual rep ( bar chart: Category: Y(Numbers range), X(participants) )
    */
};

module.exports = {
    createContestCategory,
    updateContestCategory,
    deleteContestCategory,
    addUserToContest,
    removeUserFromContest
};