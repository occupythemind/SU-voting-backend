const pool = require('../../../config/db');

async function listContestCategories(req, res) {
    try {
        // Everyone can read categories
        const result = await pool.query("SELECT * FROM categories ORDER BY created_at DESC;");
        return res.status(200).json({
            categories: result.rows
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


async function listCategoryContestants(req, res) {
    
};


async function voteCategoryContestant(req, res) {
    /* use vote for contestnat (they provide both the category_id, user_id), 
    you log 
    Audit logs (As user "confirm vote", please log with timestamp)
    */
};


async function unvoteCategoryContestant(req, res) {
    /*
    Audit logs (As user "unvote", please log with timestamp)
    */
};


module.exports = {
    listContestCategories,
    listCategoryContestants,
    voteCategoryContestant,
    unvoteCategoryContestant
};
