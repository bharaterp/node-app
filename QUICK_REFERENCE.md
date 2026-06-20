# Quick Reference

## Starting the Application

```bash
cd /Users/vishaltadha/Documents/Work/node-app

# Start server
npm start

# Start with auto-reload
npm run dev

# Stop: Ctrl+C
```

## MySQL Commands

```bash
# Start MySQL
brew services start mysql

# Stop MySQL
brew services stop mysql

# Connect to MySQL
mysql -u root -p

# Check MySQL status
brew services list
```

## Inside MySQL

```sql
-- List all databases
SHOW DATABASES;

-- Use database
USE node_app;

-- List all tables
SHOW TABLES;

-- View products table structure
DESCRIBE products;

-- View all products
SELECT * FROM products;

-- Count products
SELECT COUNT(*) FROM products;

-- Delete all products
DELETE FROM products;

-- Exit MySQL
EXIT;
```

## Useful curl Commands

```bash
# Get all products
curl http://localhost:5001/api/products

# Filter by category
curl http://localhost:5001/api/products?category=Electronics

# Get specific product
curl http://localhost:5001/api/products/1

# Add product with images
curl -X POST http://localhost:5001/api/products \
  -F "productName=Test" \
  -F "model=TST-001" \
  -F "category=Test" \
  -F "description=<h2>Test</h2>" \
  -F "images=@/path/to/image.jpg"

# Upload standalone image
curl -X POST http://localhost:5001/api/upload \
  -F "image=@/path/to/image.jpg"

# Add data item
curl -X POST http://localhost:5001/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Item","value":"Test"}'
```

## File Paths

```
Project: /Users/vishaltadha/Documents/Work/node-app

Key Files:
- server.js              Main application
- db.js                  MySQL connection
- .env                   Configuration
- uploads/               Uploaded images
- products.json          (no longer used - deleted)
```

## Environment Setup

```bash
# Create .env file
cp .env.example .env

# Edit .env (if needed)
nano .env

# Typical values:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=password
# DB_NAME=node_app
```

## Database Setup One-Liner

```bash
mysql -u root -p -e "
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
);"
```

## Package Management

```bash
# Install all dependencies
npm install

# Install specific package
npm install package-name

# Update packages
npm update

# List installed packages
npm list

# Current dependencies:
# - express: Web framework
# - multer: File upload handling
# - mysql2: MySQL driver
```

## Server Port

- API: http://localhost:5001
- Change in server.js: `const PORT = 5001;`

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MySQL connection refused | `brew services start mysql` |
| Database not found | Run database setup SQL commands |
| Port already in use | `kill -9 $(lsof -t -i :5001)` |
| .env not found | `cp .env.example .env` |
| Slow queries | Database already has indexes on search fields |
| Image upload fails | Check uploads/ directory exists and is writable |

## Performance Stats

- Response time: < 100ms (local)
- Max images per product: 10
- Max file size: Limited by multer config
- Database queries: All use indexes for fast filtering
- Concurrent connections: Up to 10 (configurable in db.js)
