const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.body.token || 
                  req.query.token;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userResult = await db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [decoded.telegram_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Check if user has PRO subscription
const requirePro = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Check if user has active PRO subscription
    const subscriptionResult = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 AND expires_at > NOW()',
      [req.user.id, 'active']
    );

    if (subscriptionResult.rows.length === 0) {
      return res.status(403).json({ 
        error: 'PRO subscription required.',
        upgrade_url: '/upgrade'
      });
    }

    next();
  } catch (error) {
    console.error('PRO subscription check error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      telegram_id: user.telegram_id,
      username: user.username,
      is_admin: user.is_admin 
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = {
  verifyToken,
  requireAdmin,
  requirePro,
  generateToken
};
