const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { verifyToken, requireAdmin, generateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Admin login route (before auth middleware)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple admin authentication (in production, use proper password hashing)
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      // Create or get admin user
      const adminResult = await db.query(
        'SELECT * FROM users WHERE is_admin = true AND username = $1',
        [username]
      );
      
      let admin;
      if (adminResult.rows.length === 0) {
        // Create admin user
        const newAdmin = await db.query(
          'INSERT INTO users (telegram_id, username, first_name, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
          [999999999, username, 'Admin', true]
        );
        admin = newAdmin.rows[0];
      } else {
        admin = adminResult.rows[0];
      }
      
      // Generate JWT token
      const token = generateToken(admin);
      
      res.json({
        success: true,
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          is_admin: admin.is_admin
        }
      });
    } else {
      res.status(401).json({ error: 'Неверные учетные данные' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply auth middleware to all other admin routes
router.use(verifyToken);
router.use(requireAdmin);

// Admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, categories, brands, models, problems, instructions, partners] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM categories'),
      db.query('SELECT COUNT(*) as count FROM brands'),
      db.query('SELECT COUNT(*) as count FROM models'),
      db.query('SELECT COUNT(*) as count FROM problems'),
      db.query('SELECT COUNT(*) as count FROM instructions'),
      db.query('SELECT COUNT(*) as count FROM partners')
    ]);

    res.json({
      users: parseInt(users.rows[0].count),
      categories: parseInt(categories.rows[0].count),
      brands: parseInt(brands.rows[0].count),
      models: parseInt(models.rows[0].count),
      problems: parseInt(problems.rows[0].count),
      instructions: parseInt(instructions.rows[0].count),
      partners: parseInt(partners.rows[0].count)
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Categories CRUD
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    
    const result = await db.query(
      'INSERT INTO categories (name, icon, description) VALUES ($1, $2, $3) RETURNING *',
      [name, icon, description]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description } = req.body;
    
    const result = await db.query(
      'UPDATE categories SET name = $2, icon = $3, description = $4 WHERE id = $1 RETURNING *',
      [id, name, icon, description]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Brands CRUD
router.get('/brands', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM brands ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/brands', async (req, res) => {
  try {
    const { name, logo_url, website } = req.body;
    
    const result = await db.query(
      'INSERT INTO brands (name, logo_url, website) VALUES ($1, $2, $3) RETURNING *',
      [name, logo_url, website]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo_url, website } = req.body;
    
    const result = await db.query(
      'UPDATE brands SET name = $2, logo_url = $3, website = $4 WHERE id = $1 RETURNING *',
      [id, name, logo_url, website]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Models CRUD
router.get('/models', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, b.name as brand_name, c.name as category_name 
       FROM models m 
       JOIN brands b ON m.brand_id = b.id 
       JOIN categories c ON m.category_id = c.id
       ORDER BY m.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/models', async (req, res) => {
  try {
    const { brand_id, category_id, name, description, image_url } = req.body;
    
    const result = await db.query(
      'INSERT INTO models (brand_id, category_id, name, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [brand_id, category_id, name, description, image_url]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create model error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_id, category_id, name, description, image_url } = req.body;
    
    const result = await db.query(
      'UPDATE models SET brand_id = $2, category_id = $3, name = $4, description = $5, image_url = $6 WHERE id = $1 RETURNING *',
      [id, brand_id, category_id, name, description, image_url]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update model error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM models WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Problems CRUD
router.get('/problems', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM problems p 
       JOIN categories c ON p.category_id = c.id
       ORDER BY p.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/problems', async (req, res) => {
  try {
    const { category_id, name, description, severity } = req.body;
    
    const result = await db.query(
      'INSERT INTO problems (category_id, name, description, severity) VALUES ($1, $2, $3, $4) RETURNING *',
      [category_id, name, description, severity]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, severity } = req.body;
    
    const result = await db.query(
      'UPDATE problems SET category_id = $2, name = $3, description = $4, severity = $5 WHERE id = $1 RETURNING *',
      [id, category_id, name, description, severity]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM problems WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Instructions CRUD
router.get('/instructions', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, m.name as model_name, b.name as brand_name, p.name as problem_name
       FROM instructions i
       JOIN models m ON i.model_id = m.id
       JOIN brands b ON m.brand_id = b.id
       JOIN problems p ON i.problem_id = p.id
       ORDER BY i.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get instructions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/instructions', upload.array('files'), async (req, res) => {
  try {
    const { 
      model_id, problem_id, title, description, difficulty, 
      estimated_time, tools_required, parts_required, 
      cost_estimate, is_pro_pretent, steps 
    } = req.body;
    
    // Handle file uploads
    const files = req.files || [];
    const images = files.filter(f => f.mimetype.startsWith('image/')).map(f => `/uploads/${f.filename}`);
    const videos = files.filter(f => f.mimetype.startsWith('video/')).map(f => `/uploads/${f.filename}`);
    
    // Parse JSON fields
    const tools = tools_required ? JSON.parse(tools_required) : [];
    const parts = parts_required ? JSON.parse(parts_required) : [];
    const stepsData = steps ? JSON.parse(steps) : [];
    
    const result = await db.query(
      `INSERT INTO instructions (
        model_id, problem_id, title, description, difficulty, estimated_time,
        tools_required, parts_required, cost_estimate, is_pro_pretent, 
        steps, images, videos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        model_id, problem_id, title, description, difficulty, estimated_time,
        tools, parts, cost_estimate, is_pro_pretent === 'true',
        JSON.stringify(stepsData), images, videos
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create instruction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/instructions/:id', upload.array('files'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      model_id, problem_id, title, description, difficulty, 
      estimated_time, tools_required, parts_required, 
      cost_estimate, is_pro_pretent, steps 
    } = req.body;
    
    // Handle file uploads
    const files = req.files || [];
    const images = files.filter(f => f.mimetype.startsWith('image/')).map(f => `/uploads/${f.filename}`);
    const videos = files.filter(f => f.mimetype.startsWith('video/')).map(f => `/uploads/${f.filename}`);
    
    // Parse JSON fields
    const tools = tools_required ? JSON.parse(tools_required) : [];
    const parts = parts_required ? JSON.parse(parts_required) : [];
    const stepsData = steps ? JSON.parse(steps) : [];
    
    // If no new files uploaded, keep existing ones
    let updateImages = images;
    let updateVideos = videos;
    
    if (files.length === 0) {
      const existing = await db.query('SELECT images, videos FROM instructions WHERE id = $1', [id]);
      if (existing.rows.length > 0) {
        updateImages = existing.rows[0].images || [];
        updateVideos = existing.rows[0].videos || [];
      }
    }
    
    const result = await db.query(
      `UPDATE instructions SET 
        model_id = $2, problem_id = $3, title = $4, description = $5, 
        difficulty = $6, estimated_time = $7, tools_required = $8, 
        parts_required = $9, cost_estimate = $10, is_pro_pretent = $11,
        steps = $12, images = $13, videos = $14, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [
        id, model_id, problem_id, title, description, difficulty, estimated_time,
        tools, parts, cost_estimate, is_pro_pretent === 'true',
        JSON.stringify(stepsData), updateImages, updateVideos
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instruction not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update instruction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/instructions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM instructions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instruction not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete instruction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Partners CRUD
router.get('/partners', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM partners ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/partners', async (req, res) => {
  try {
    const { name, website, logo_url, description, is_active } = req.body;
    
    const result = await db.query(
      'INSERT INTO partners (name, website, logo_url, description, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, website, logo_url, description, is_active !== false]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/partners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, website, logo_url, description, is_active } = req.body;
    
    const result = await db.query(
      'UPDATE partners SET name = $2, website = $3, logo_url = $4, description = $5, is_active = $6 WHERE id = $1 RETURNING *',
      [id, name, website, logo_url, description, is_active !== false]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/partners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('DELETE FROM partners WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
