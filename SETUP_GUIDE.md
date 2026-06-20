# Complete Setup Guide - Node.js Express API with MySQL

## Step-by-Step Setup

### Step 1: Install MySQL (macOS)

```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Secure your installation
mysql_secure_installation
# When prompted:
# - Validate Password Component: y
# - Password Level: 0 (or higher)
# - New password: password (or your preference)
# - Remove anonymous users: y
# - Disable root remote login: y
# - Remove test database: y
# - Reload privilege tables: y
```

### Step 2: Create Database

```bash
# Connect to MySQL with root
mysql -u root -p
# Enter password when prompted

# Then copy-paste these SQL commands:
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

# Type: EXIT;
```

### Step 3: Configure Application

```bash
# Navigate to project
cd /Users/vishaltadha/Documents/Work/node-app

# Copy environment template
cp .env.example .env

# Edit .env (optional - defaults should work if you set password to "password")
# nano .env
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=password
# DB_NAME=node_app
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Start Server

```bash
npm start
# or with auto-reload
npm run dev
```

You should see:
```
Server is running on http://localhost:5001
Database: Connected to MySQL successfully
```

## Verify Setup

Test the API:
```bash
curl http://localhost:5001/api/products

# Should return:
# {"message":"Products retrieved successfully","count":0,"products":[]}
```

## Using phpMyAdmin (Optional)

### macOS Installation
```bash
brew install phpmyadmin

# Follow Homebrew instructions to configure
# Usually accessible at: http://localhost/phpmyadmin
```

### Access
- URL: `http://localhost/phpmyadmin`
- Username: `root`
- Password: Your MySQL password

## Test All Endpoints

### 1. Add a Product with Images

```bash
curl -X POST http://localhost:5001/api/products \
  -F "productName=Laptop Pro" \
  -F "model=LP-2024" \
  -F "category=Electronics" \
  -F "description=<h2>Powerful Laptop</h2><p>Best performance</p>" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### 2. Get All Products

```bash
curl http://localhost:5001/api/products
```

### 3. Filter Products

```bash
# By category
curl http://localhost:5001/api/products?category=Electronics

# By product name
curl http://localhost:5001/api/products?productName=Laptop

# By model
curl http://localhost:5001/api/products?model=LP-2024

# Multiple filters
curl http://localhost:5001/api/products?category=Electronics&productName=Laptop
```

### 4. Get Specific Product

```bash
curl http://localhost:5001/api/products/1
```

## File Structure

```
node-app/
├── server.js              # Main Express server
├── db.js                  # MySQL connection pool
├── package.json           # Dependencies
├── .env                   # Configuration (create from .env.example)
├── .env.example           # Configuration template
├── README.md              # API documentation
├── MYSQL_SETUP.md         # Detailed MySQL guide
├── SETUP_GUIDE.md         # This file
├── setup.sh               # Automated setup script
├── uploads/               # Image storage directory
└── node_modules/          # Installed packages
```

## Environment Variables

Create `.env` file with:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=node_app
```

**Important:** Never commit `.env` to version control!

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productName VARCHAR(255) NOT NULL,        -- Product name (indexed)
  model VARCHAR(255) NOT NULL,              -- Product model/SKU (indexed)
  category VARCHAR(255) NOT NULL,           -- Category (indexed)
  description LONGTEXT,                     -- HTML content
  imagePaths JSON,                          -- Array of image URLs
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Start MySQL
```bash
brew services start mysql
# or
mysql.server start
```

### Authentication Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** 
- Verify password in `.env` matches your MySQL setup
- If using default, ensure password is set to 'password'
- Reset MySQL password:
  ```bash
  mysql -u root
  ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
  ```

### Database Not Found
```
Error: Unknown database 'node_app'
```
**Solution:** Run the database creation SQL commands from Step 2

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5001
```
**Solution:** 
```bash
# Kill process on port 5001
lsof -i :5001
kill -9 <PID>

# Or change port in server.js: const PORT = 5002;
```

## Performance Optimization

The products table has indexes on:
- `productName` - Fast search by product name
- `model` - Fast search by model
- `category` - Fast search by category

This ensures quick filtering even with large datasets.

## Security Notes

- Never commit `.env` file
- Don't store passwords in code
- Use SQL prepared statements (already implemented)
- Validate all inputs (already implemented)
- Use HTTPS in production

## Next Steps

1. ✅ Database is set up and persists data
2. ✅ All endpoints use MySQL
3. ✅ Images still stored on disk
4. ✅ Ready for production deployment

For production, consider:
- Hosting MySQL on managed service (AWS RDS, DigitalOcean, etc.)
- Using SSL/HTTPS
- Implementing authentication
- Adding rate limiting
- Using environment-specific configuration
