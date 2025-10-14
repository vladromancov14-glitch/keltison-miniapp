const express = require('express');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Telegram WebApp initialization
router.post('/webapp-init', async (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    // Parse Telegram WebApp init data
    const urlParams = new URLSearchParams(initData);
    const userData = {};
    
    urlParams.forEach((value, key) => {
      userData[key] = value;
    });

    // Extract user info from initData
    const userInfo = JSON.parse(userData.user || '{}');
    const telegramId = userInfo.id;
    const username = userInfo.username;
    const firstName = userInfo.first_name;
    const lastName = userInfo.last_name;
    const languageCode = userInfo.language_code;

    if (!telegramId) {
      return res.status(400).json({ error: 'Invalid Telegram user data' });
    }

    // Check if user exists, create if not
    let user;
    const existingUser = await db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );

    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];
      
      // Update user info if changed
      await db.query(
        `UPDATE users SET 
         username = $2, first_name = $3, last_name = $4, 
         language_code = $5, updated_at = CURRENT_TIMESTAMP
         WHERE telegram_id = $1`,
        [telegramId, username, firstName, lastName, languageCode]
      );
    } else {
      // Create new user
      const newUser = await db.query(
        `INSERT INTO users (telegram_id, username, first_name, last_name, language_code)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [telegramId, username, firstName, lastName, languageCode]
      );
      user = newUser.rows[0];

      // Create free subscription for new user
      await db.query(
        'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3)',
        [user.id, 'free', 'active']
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Get user subscription info
    const subscription = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [user.id, 'active']
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin,
        is_premium: user.is_premium
      },
      subscription: subscription.rows[0] || { plan: 'free', status: 'active' }
    });

  } catch (error) {
    console.error('WebApp init error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', require('../middleware/auth').verifyToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Get subscription info
    const subscription = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [user.id, 'active']
    );

    res.json({
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin,
        is_premium: user.is_premium
      },
      subscription: subscription.rows[0] || { plan: 'free', status: 'active' }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
