const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
const initializeDatabase = require('./initDb');
const app = express();
const PORT = 5001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// Verify uploads directory is writable
try {
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  console.log('✅ Uploads directory is writable');
} catch (error) {
  console.warn('⚠️  Uploads directory may not be writable:', error.message);
}

// Middleware
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error:', err.message);
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }
  if (err && err.message && err.message.includes('Only image files')) {
    console.error('❌ File validation error:', err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
    }
  }
});

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//     if (allowedMimes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
//     }
//   }
// });

// In-memory storage for data
let dataStore = [];

// GET endpoint - retrieve all stored data
app.get('/api/data', (req, res) => {
  res.json({
    message: 'Data retrieved successfully',
    count: dataStore.length,
    data: dataStore
  });
});

// GET endpoint - retrieve specific data by ID
app.get('/api/data/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = dataStore.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ message: 'Data not found' });
  }
  
  res.json(item);
});

// POST endpoint - add new data
app.post('/api/data', (req, res) => {
  const { name, value, description } = req.body;
  
  // Validation
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  const newItem = {
    id: dataStore.length > 0 ? Math.max(...dataStore.map(d => d.id)) + 1 : 1,
    name,
    value: value || null,
    description: description || '',
    createdAt: new Date().toISOString()
  };
  
  dataStore.push(newItem);
  
  res.status(201).json({
    message: 'Data added successfully',
    data: newItem
  });
});

// POST endpoint - upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  res.status(201).json({
    message: 'Image uploaded successfully',
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`
  });
});

// GET endpoint - retrieve image by filename
app.get('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadsDir, filename);

  // Prevent directory traversal attacks
  if (!filepath.startsWith(uploadsDir)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  fs.exists(filepath, (exists) => {
    if (!exists) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.sendFile(filepath);
  });
});

// GET endpoint - server health and diagnostics
app.get('/api/health', (req, res) => {
  const diagnostics = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uploads: {
      directory: uploadsDir,
      exists: fs.existsSync(uploadsDir),
      writable: (() => {
        try {
          fs.accessSync(uploadsDir, fs.constants.W_OK);
          return true;
        } catch {
          return false;
        }
      })(),
      files: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0
    },
    database: {
      host: process.env.DB_HOST || 'localhost',
      name: process.env.DB_NAME || 'node_app'
    }
  };
  
  res.json(diagnostics);
});

// POST endpoint - add product with multiple images
app.post('/api/products', upload.array('images', 10), async (req, res) => {
  try {
    const { productName, model, category, description } = req.body;

    // Validation
    if (!productName || !model || !category) {
      return res.status(400).json({ 
        message: 'productName, model, and category are required' 
      });
    }

    // Debug: Log file upload information
    console.log('📤 Upload request received');
    console.log('   - Files received:', req.files ? req.files.length : 0);
    if (req.files) {
      req.files.forEach((file, index) => {
        console.log(`   - File ${index + 1}: ${file.originalname} (${file.size} bytes)`);
      });
    }

    // Get image paths
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Debug: Log image paths
    console.log('   - Image paths to save:', imagePaths);

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO products (productName, model, category, description, imagePaths) VALUES (?, ?, ?, ?, ?)',
      [productName, model, category, description || '', JSON.stringify(imagePaths)]
    );
    connection.release();

    console.log(`✅ Product created with ID: ${result.insertId}`);

    res.status(201).json({
      message: 'Product added successfully',
      product: {
        id: result.insertId,
        productName,
        model,
        category,
        description: description || '',
        imagePaths,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error adding product:', error.message);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});

// GET endpoint - retrieve products with filters
app.get('/api/products', async (req, res) => {
  try {
    const { productName, model, category } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (productName) {
      query += ' AND productName LIKE ?';
      params.push(`%${productName}%`);
    }

    if (model) {
      query += ' AND model LIKE ?';
      params.push(`%${model}%`);
    }

    if (category) {
      query += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }

    const connection = await pool.getConnection();
    const [products] = await connection.execute(query, params);
    connection.release();

    // Parse imagePaths from JSON
    const formattedProducts = products.map(p => ({
      ...p,
      imagePaths: JSON.parse(p.imagePaths || '[]')
    }));

    res.json({
      message: 'Products retrieved successfully',
      count: formattedProducts.length,
      products: formattedProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
});

// GET endpoint - retrieve product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const connection = await pool.getConnection();
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    connection.release();

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = {
      ...products[0],
      imagePaths: JSON.parse(products[0].imagePaths || '[]')
    };

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving product', error: error.message });
  }
});
app.listen(PORT, async () => {
  try {
    // Test database connection and initialize
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();
    
    console.log(`\n✅ Database: Connected to MySQL successfully`);
    
    // Initialize database tables
    await initializeDatabase();
    
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`\n📁 File Upload Configuration:`);
    console.log(`   - Uploads Directory: ${uploadsDir}`);
    console.log(`   - Directory Exists: ${fs.existsSync(uploadsDir)}`);
    try {
      fs.accessSync(uploadsDir, fs.constants.W_OK);
      console.log(`   - Directory Writable: ✅ Yes`);
    } catch {
      console.log(`   - Directory Writable: ❌ No (permission issue!)`);
    }
    
    console.log(`\n📚 Available endpoints:`);
    console.log(`   - GET  /api/health - Server diagnostics`);
    console.log(`   - GET  /api/data - Get all data`);
    console.log(`   - GET  /api/data/:id - Get specific data by ID`);
    console.log(`   - POST /api/data - Add new data`);
    console.log(`   - POST /api/upload - Upload single image`);
    console.log(`   - GET  /api/image/:filename - Retrieve uploaded image`);
    console.log(`   - POST /api/products - Add product with images`);
    console.log(`   - GET  /api/products - Get products (filters: ?productName=&model=&category=)`);
    console.log(`   - GET  /api/products/:id - Get product by ID\n`);
  } catch (error) {
    console.error('\n❌ Failed to connect to database:', error.message);
    console.error('\n📋 Debugging information:');
    console.error('   - Check .env file has correct credentials');
    console.error('   - Verify database server is accessible');
    console.error('   - For remote server: ensure firewall allows connections');
    console.error('   - Current config: host=' + (process.env.DB_HOST || 'not set'));
    console.error('   - Current config: user=' + (process.env.DB_USER || 'not set'));
    console.error('\n');
    process.exit(1);
  }
});
