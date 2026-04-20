const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('./db');

module.exports = function(passport) {
  passport.use(new LocalStrategy(
    { usernameField: 'matric_number' },
    async (matric_number, password, done) => {
      try {
        const result = await pool.query('SELECT * FROM users WHERE matric_number = $1', [matric_number]);
        if (result.rows.length === 0) return done(null, false, { message: 'Invalid credentials' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Invalid credentials' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, result.rows[0]);
    } catch (err) {
      done(err, null);
    }
  });
};
