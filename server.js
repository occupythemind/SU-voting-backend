const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const passport = require('passport');
require('./config/passport')(passport);
const session = require('express-session');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type',]
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(session({
    secret: process.env.SECRET_KEY || 'default-secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());


const pool = require('./config/db');

// Routes
const authRoutes = require('./api/v1/routes/authRoutes');
const contestRoutes = require('./api/v1/routes/contestRoutes');
const adminManageAuthRoutes = require('./api/admin/routes/authRoutes');
const adminManageContestRoutes = require('./api/admin/routes/contestRoutes');
const adminManagePermissionRoutes = require('./api/admin/routes/permissionRoutes');

// Public
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', contestRoutes);

// Admin (to manage these functionalities)
app.use('/api/admin/auth', adminManageAuthRoutes);
app.use('/api/admin/competitions', adminManageContestRoutes);
app.use('/api/admin/permissions', adminManagePermissionRoutes);

// Test route
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Server running',
      time: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`UNIDEL Voting System: Server running on http://localhost:${PORT}`);
});