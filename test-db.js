#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('\n📋 Database Connection Diagnostic\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'node_app',
  };
  
  console.log('Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Database: ${config.database}`);
  console.log(`  Password: ${config.password ? '***' : 'empty'}`);
  console.log('');
  
  try {
    console.log('🔄 Attempting connection...');
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Connection successful!\n');
    
    // Get version
    const [rows] = await connection.execute('SELECT VERSION()');
    console.log(`✅ MySQL Version: ${rows[0]['VERSION()']}`);
    
    // List databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log(`✅ Available databases: ${databases.map(db => db.Database).join(', ')}`);
    
    // Check if table exists
    try {
      const [tables] = await connection.execute(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'`,
        [config.database]
      );
      
      if (tables.length > 0) {
        console.log(`✅ Products table exists`);
        
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM products');
        console.log(`✅ Products in table: ${count[0].count}`);
      } else {
        console.log(`⚠️  Products table does not exist (will be created on app startup)`);
      }
    } catch (e) {
      console.log(`⚠️  Could not check table (will be created on app startup)`);
    }
    
    await connection.end();
    
    console.log('\n✨ Everything looks good! You can start the server with: npm start\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('  1. Verify .env file exists and has correct credentials');
    console.error('  2. Check that the database server is running and accessible');
    console.error('  3. For remote server: ensure firewall allows port 3306 (or custom port)');
    console.error('  4. Verify username and password are correct');
    console.error('  5. Check that the database is created on the server');
    console.error('');
    process.exit(1);
  }
}

testConnection();
