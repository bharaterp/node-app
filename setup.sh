#!/bin/bash

# Quick setup script for Node App with MySQL
# Run this script after installing MySQL

echo "🚀 Starting Node.js Express API Server Setup..."

# Check if MySQL is running
if ! mysql -u root -e "SELECT 1" &>/dev/null; then
  echo "❌ MySQL is not running or credentials are incorrect"
  echo "   Start MySQL: brew services start mysql"
  exit 1
fi

echo "✅ MySQL connection verified"

# Create database and tables
echo "📦 Creating database and tables..."
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS node_app;
USE node_app;

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
);
EOF

echo "✅ Database setup complete"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "✅ .env created - update with your MySQL password if needed"
else
  echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

echo ""
echo "✨ Setup complete! Start the server with:"
echo "   npm start"
echo ""
echo "📖 API will be available at: http://localhost:5001"
echo "📚 Check README.md for API documentation"
