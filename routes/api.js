const express = require('express');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM categories ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get brands by category
router.get('/brands', async (req, res) => {
  try {
    const { category_id } = req.query;
    
    let query = 'SELECT DISTINCT b.* FROM brands b JOIN models m ON b.id = m.brand_id';
    let params = [];
    
    if (category_id) {
      query += ' WHERE m.category_id = $1';
      params.push(category_id);
    }
    
    query += ' ORDER BY b.name';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Brands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get models by brand and category
router.get('/models', async (req, res) => {
  try {
    const { brand_id, category_id } = req.query;
    
    let query = `
      SELECT m.*, b.name as brand_name, c.name as category_name 
      FROM models m 
      JOIN brands b ON m.brand_id = b.id 
      JOIN categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;
    
    if (brand_id) {
      paramCount++;
      query += ` AND m.brand_id = $${paramCount}`;
      params.push(brand_id);
    }
    
    if (category_id) {
      paramCount++;
      query += ` AND m.category_id = $${paramCount}`;
      params.push(category_id);
    }
    
    query += ' ORDER BY m.name';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Models error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get problems by category
router.get('/problems', async (req, res) => {
  try {
    const { category_id } = req.query;
    
    let query = 'SELECT * FROM problems';
    let params = [];
    
    if (category_id) {
      query += ' WHERE category_id = $1';
      params.push(category_id);
    }
    
    query += ' ORDER BY name';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Problems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get instructions by model and problem
router.get('/instructions', async (req, res) => {
  try {
    const { model_id, problem_id } = req.query;
    
    if (!model_id || !problem_id) {
      return res.status(400).json({ error: 'model_id and problem_id are required' });
    }
    
    const result = await db.query(
      `SELECT i.*, m.name as model_name, b.name as brand_name, p.name as problem_name
       FROM instructions i
       JOIN models m ON i.model_id = m.id
       JOIN brands b ON m.brand_id = b.id
       JOIN problems p ON i.problem_id = p.id
       WHERE i.model_id = $1 AND i.problem_id = $2
       ORDER BY i.created_at DESC`,
      [model_id, problem_id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Instructions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific instruction by ID
router.get('/instructions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const result = await db.query(
      `SELECT i.*, m.name as model_name, b.name as brand_name, p.name as problem_name
       FROM instructions i
       JOIN models m ON i.model_id = m.id
       JOIN brands b ON m.brand_id = b.id
       JOIN problems p ON i.problem_id = p.id
       WHERE i.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instruction not found' });
    }
    
    const instruction = result.rows[0];
    
    // Check if user has access to PRO content
    const hasProAccess = await checkProAccess(user.id);
    
    if (instruction.is_pro_pretent && !hasProAccess) {
      return res.status(403).json({ 
        error: 'PRO subscription required',
        upgrade_url: '/upgrade',
        preview: {
          title: instruction.title,
          description: instruction.description,
          difficulty: instruction.difficulty,
          estimated_time: instruction.estimated_time
        }
      });
    }
    
    res.json(instruction);
  } catch (error) {
    console.error('Instruction detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get partners
router.get('/partners', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM partners WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Partners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search instructions
router.get('/search', async (req, res) => {
  try {
    const { q, category_id } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let query = `
      SELECT DISTINCT i.*, m.name as model_name, b.name as brand_name, p.name as problem_name
      FROM instructions i
      JOIN models m ON i.model_id = m.id
      JOIN brands b ON m.brand_id = b.id
      JOIN problems p ON i.problem_id = p.id
      WHERE (
        i.title ILIKE $1 OR 
        i.description ILIKE $1 OR 
        m.name ILIKE $1 OR 
        b.name ILIKE $1 OR 
        p.name ILIKE $1
      )
    `;
    let params = [`%${q}%`];
    let paramCount = 1;
    
    if (category_id) {
      paramCount++;
      query += ` AND m.category_id = $${paramCount}`;
      params.push(category_id);
    }
    
    query += ' ORDER BY i.created_at DESC LIMIT 20';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check PRO access
async function checkProAccess(userId) {
  try {
    const result = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 AND expires_at > NOW()',
      [userId, 'active']
    );
    return result.rows.length > 0 && result.rows[0].plan !== 'free';
  } catch (error) {
    console.error('Check PRO access error:', error);
    return false;
  }
}

module.exports = router;
