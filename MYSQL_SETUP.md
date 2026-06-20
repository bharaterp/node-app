# MySQL Setup Guide

## Prerequisites
- MySQL Server (or MariaDB)
- Node.js

## Installation

### macOS (Using Homebrew)
```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### Windows
Download and install from: https://dev.mysql.com/downloads/mysql/

## Database Setup

### 1. Connect to MySQL
```bash
mysql -u root -p
# Enter your root password
```

### 2. Create Database and Tables
```sql
CREATE DATABASE node_app;
USE node_app;

CREATE TABLE products (
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

EXIT;
```

## Application Configuration

### 1. Set Environment Variables
Create a `.env` file in the root directory (copy from `.env.example`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=node_app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
# or with auto-reload
npm run dev
```

## Using phpMyAdmin (Optional)

To visualize and manage your database with phpMyAdmin:

### macOS
```bash
brew install phpmyadmin
# Configure according to Homebrew instructions
```

### General Access
1. Install phpMyAdmin: https://www.phpmyadmin.net/
2. Access at: `http://localhost/phpmyadmin`
3. Login with your MySQL credentials

## Verifying Setup

Test the connection by making a request:
```bash
curl http://localhost:5001/api/products
```

Should return:
```json
{
  "message": "Products retrieved successfully",
  "count": 0,
  "products": []
}
```

## Troubleshooting

**Connection refused:**
- Verify MySQL is running: `brew services list` (macOS)
- Check MySQL is listening on port 3306

**Authentication failed:**
- Verify credentials in `.env` match your MySQL setup
- Check password doesn't contain special characters (or escape them)

**Database not found:**
- Ensure you ran the SQL setup commands above
- Verify database name in `.env` matches

## Data Structure

### Products Table Schema
```
- id: Auto-incrementing primary key
- productName: Product name (indexed for search)
- model: Product model/SKU (indexed)
- category: Product category (indexed)
- description: HTML content for rich descriptions
- imagePaths: JSON array of image URLs
- createdAt: Auto-generated creation timestamp
- updatedAt: Auto-updated modification timestamp
```
