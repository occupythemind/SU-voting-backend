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

// Trust the first proxy (important for secure cookies behind reverse proxies like code.run)
app.set('trust proxy', 1);

app.use(cors({
    origin: function (origin, callback) {
        // Allow the specified frontend URL or any origin in development
        const allowedOrigin = process.env.FRONTEND_URL || origin || '*';
        callback(null, allowedOrigin);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(morgan('dev'));

const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
    secret: process.env.SECRET_KEY || 'default-secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        secure: isProduction, // Set to true if in production
        sameSite: isProduction ? 'none' : 'lax', // Must be 'none' for cross-origin cookies
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
app.use('/api/admin/categories', adminManageContestRoutes);
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SU Voting System: Server running on port ${PORT}`);
});

