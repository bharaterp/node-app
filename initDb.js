const pool = require('./db');

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔄 Checking if products table exists...');
    
    // Create table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productName VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description LONGTEXT,
        imagePaths JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_productName (productName),
        INDEX idx_model (model),
        INDEX idx_category (category)
      )
    `);
    
    console.log('✅ Products table is ready');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

module.exports = initializeDatabase;
