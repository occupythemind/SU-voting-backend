const pool = require('../../../config/db');


// Get all users
async function getUsers(req, res) {
    try {
        const result = await pool.query(
            `SELECT id, full_name, matric_number, is_active, is_admin, created_at 
             FROM users
             ORDER BY created_at DESC;`
        );

        return res.status(200).json({
            users: result.rows
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


// Get single user
async function getUserById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, full_name, matric_number, is_active, is_admin, created_at 
             FROM users
             WHERE id = $1;`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


// Update user
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const {
            full_name,
            matric_number,
        } = req.body;

        // Prevent empty updates
        if (
            !full_name &&
            !matric_number
        ) {
            return res.status(400).json({
                error: "Provide at least one field to update"
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET
                full_name = COALESCE($1, full_name),
                matric_number = COALESCE($2, matric_number)
             WHERE id = $3
             RETURNING id, full_name, matric_number, is_active, is_admin, created_at;`,
            [
                full_name,
                matric_number,
                id
            ]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


// Delete user
async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM users
             WHERE id = $1
             RETURNING id, matric_number;`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            message: "User deleted successfully",
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};