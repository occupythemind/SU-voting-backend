const pool = require('../../../config/db');
const bcrypt = require('bcrypt');
const paymentController = require('../../../controllers/paymentController');
const config = require('../../../config/index');

async function userRegistration(req, res) {

  try {
    const {full_name, matric_number, password} = req.body;

    // Validate
    if (!full_name || !matric_number || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: "full_name", "matric_number", "password"' 
      });
    }

    // Basic password check
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE matric_number = $1',
      [matric_number]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with that matric_number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await pool.query(
      `INSERT INTO users (full_name, matric_number, username, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [full_name, matric_number, username]
    );

    const user = newUser.rows[0];

    // 4. MANUALLY ESTABLISH SESSION
    // req.login is added by Passport. It calls your serializeUser function.
    req.login(user, (err) => {
      if (err) return next(err);

      // 5. Success
      return res.status(201).json({
        message: 'User created. Login successful',
        user: {
          id: user.id,
          matric_number: user.matric_number
        }
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


async function userLogin(req, res) {
    /*
        Here, we check if the user's account had been activated
        then give them feedback if not, or log them in if it had been activated
    */

  try {
    const { matric_number, password } = req.body;

    // 1. Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE matric_number = $1',
      [matric_number]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 3. Check if activated
    if (!user.is_active) {
      return res.status(403).json({
        error: `Account not activated. Please contact our Support Staff to rectify the issue if this error persists.`
      });
    }

    // 4. MANUALLY ESTABLISH SESSION
    // req.login is added by Passport. It calls your serializeUser function.
    req.login(user, (err) => {
      if (err) return next(err);

      // 5. Success
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          matric_number: user.matric_number
        }
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


// View my profile
async function getMyProfile(req, res) {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT 
                id,
                matric_number,
                full_name,
                is_active,
                is_admin,
                created_at
             FROM users
             WHERE id = $1`,
            [userId]
        );

        return res.status(200).json({
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Update my profile
async function updateMyProfile(req, res) {
    try {
        const userId = req.user.id;
        const { full_name, password } = req.body;

        if (!full_name  && !password) {
            return res.status(400).json({ error: "Nothing to update" });
        }

        let hashedPassword = null;

        // Handle password update
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters" });
            }

            hashedPassword = await bcrypt.hash(password, 10);
        }

        const result = await pool.query(
            `UPDATE users
             SET
                full_name = COALESCE($1, full_name),
                password = COALESCE($2, password)
             WHERE id = $3
             RETURNING 
                id, matric_number, full_name;`,
            [full_name, hashedPassword, userId]
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { 
  userRegistration, 
  userLogin,
  getMyProfile,
  updateMyProfile
   
};