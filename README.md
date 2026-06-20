# Node.js Express API Server with MySQL

A REST API server built with Express.js and MySQL database to store products with multiple images and rich HTML descriptions.

## Prerequisites
- Node.js
- MySQL Server (or MariaDB)
- (Optional) phpMyAdmin for database management

## Setup

### Database Setup
See [MYSQL_SETUP.md](MYSQL_SETUP.md) for complete MySQL installation and configuration instructions.

**Quick Setup:**
```bash
# Create database
mysql -u root -p < path/to/MYSQL_SETUP.md

# Or manually:
mysql -u root -p
# Then run the SQL commands from MYSQL_SETUP.md
```

### Environment Configuration
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### Installation

1. Install dependencies:
```bash
npm install
```

## Running the Server

Start the server:
```bash
npm start
```

Or with auto-reload (requires Node.js 18.11.0+):
```bash
npm run dev
```

The server will run on `http://localhost:5001`

## API Endpoints

### Get All Data
```
GET /api/data
```
Returns all stored data.

**Example:**
```bash
curl http://localhost:5001/api/data
```

### Get Specific Data
```
GET /api/data/:id
```
Returns data with a specific ID.

**Example:**
```bash
curl http://localhost:5001/api/data/1
```

### Add New Data
```
POST /api/data
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Item Name",
  "value": "Item Value",
  "description": "Optional description"
}
```

**Example:**
```bash
curl -X POST http://localhost:5001/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Item",
    "value": "Some value",
    "description": "A test item"
  }'
```

**Response:**
```json
{
  "message": "Data added successfully",
  "data": {
    "id": 1,
    "name": "My Item",
    "value": "Some value",
    "description": "A test item",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data
```

**Request Body:**
Form data with file field named `image`

**Supported Formats:** JPEG, PNG, GIF, WebP

**Example:**
```bash
curl -X POST http://localhost:5001/api/upload \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "filename": "1704110400000-123456789.jpg",
  "originalName": "image.jpg",
  "size": 45678,
  "url": "/uploads/1704110400000-123456789.jpg"
}
```

### Get Image
```
GET /api/image/:filename
```

Retrieve an uploaded image by filename.

**Example:**
```bash
curl http://localhost:5001/api/image/1704110400000-123456789.jpg -o downloaded.jpg
```

Or view in browser:
```
http://localhost:5001/api/image/1704110400000-123456789.jpg
```

## Product API Endpoints

### Add Product with Images
```
POST /api/products
Content-Type: multipart/form-data
```

**Form Data Fields:**
- `productName` (required) - Name of the product
- `model` (required) - Model/SKU of the product
- `category` (required) - Product category
- `description` (optional) - HTML content for product description
- `images` (optional) - Multiple image files (max 10)

**Example:**
```bash
curl -X POST http://localhost:5001/api/products \
  -F "productName=Laptop Pro" \
  -F "model=LP-2024" \
  -F "category=Electronics" \
  -F "description=<h2>Powerful Laptop</h2><p>High performance device</p>" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Response:**
```json
{
  "message": "Product added successfully",
  "product": {
    "id": 1,
    "productName": "Laptop Pro",
    "model": "LP-2024",
    "category": "Electronics",
    "description": "<h2>Powerful Laptop</h2><p>High performance device</p>",
    "imagePaths": [
      "/uploads/1704110400000-123456789.jpg",
      "/uploads/1704110400001-987654321.jpg"
    ],
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Get All Products (with Filters)
```
GET /api/products
```

**Query Parameters (all optional):**
- `productName` - Filter by product name (case-insensitive, partial match)
- `model` - Filter by model (case-insensitive, partial match)
- `category` - Filter by category (case-insensitive, partial match)

**Examples:**
```bash
# Get all products
curl http://localhost:5001/api/products

# Filter by product name
curl http://localhost:5001/api/products?productName=Laptop

# Filter by category
curl http://localhost:5001/api/products?category=Electronics

# Multiple filters
curl http://localhost:5001/api/products?productName=Laptop&category=Electronics&model=LP-2024
```

**Response:**
```json
{
  "message": "Products retrieved successfully",
  "count": 1,
  "products": [
    {
      "id": 1,
      "productName": "Laptop Pro",
      "model": "LP-2024",
      "category": "Electronics",
      "description": "<h2>Powerful Laptop</h2><p>High performance device</p>",
      "imagePaths": [
        "/uploads/1704110400000-123456789.jpg",
        "/uploads/1704110400001-987654321.jpg"
      ],
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### Get Product by ID
```
GET /api/products/:id
```

**Example:**
```bash
curl http://localhost:5001/api/products/1
```

**Response:**
```json
{
  "id": 1,
  "productName": "Laptop Pro",
  "model": "LP-2024",
  "category": "Electronics",
  "description": "<h2>Powerful Laptop</h2><p>High performance device</p>",
  "imagePaths": [
    "/uploads/1704110400000-123456789.jpg",
    "/uploads/1704110400001-987654321.jpg"
  ],
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

## Features

- **GET endpoints** to retrieve all or specific data
- **POST endpoint** to add new data with validation
- **Image upload** with file type validation (JPEG, PNG, GIF, WebP)
- **Image retrieval** by filename
- **Product management** with multiple images per product
- **HTML description support** for rich product descriptions
- **Product filtering** by name, model, and category
- **JSON persistence** for products stored in `products.json`
- **In-memory storage** for general data
- **Disk storage** for uploaded images in `uploads/` directory
- **JSON request/response** handling
- **Error handling** with appropriate HTTP status codes
- **Security** - directory traversal protection for file access

## Notes

- Data is stored in-memory and will be cleared when the server restarts
- **Products are persisted in MySQL database and survive server restarts**
- Each data item requires a `name` field
- Each data item gets a unique ID automatically
- Timestamps are created automatically for each item
- Products support HTML descriptions for rich formatting
- Product images are stored in the `uploads/` directory
- Image paths are stored in MySQL database as JSON, not actual image data
- Images are served statically at `/uploads/filename`
- Only image files are accepted (JPEG, PNG, GIF, WebP)
- The `uploads/` directory is created automatically on server startup
- Product filtering is case-insensitive and uses SQL LIKE queries
- Configure MySQL connection via environment variables in `.env`
- Product searches use indexed columns for better performance
