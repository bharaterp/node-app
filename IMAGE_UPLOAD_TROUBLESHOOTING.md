# Image Upload Troubleshooting

## Issue: Images Not Being Saved (imagePaths is empty)

When you upload products with images, the `imagePaths` array is empty in the database.

## Diagnosis Steps

### Step 1: Check Server Health
```bash
curl http://localhost:5001/api/health
```

Look for:
- `"writable": true` in the uploads section
- `"exists": true` for the uploads directory
- Correct database host and name

### Step 2: Check Console Logs
When uploading a product, check the server console for messages like:
```
📤 Upload request received
   - Files received: 2
   - File 1: image1.jpg (45678 bytes)
   - Image paths to save: ["/uploads/1234567890-123456789.jpg"]
✅ Product created with ID: 1
```

### Step 3: Verify Uploads Directory

```bash
# Check if uploads directory exists
ls -la /Users/vishaltadha/Documents/Work/node-app/uploads

# Check permissions
ls -ld /Users/vishaltadha/Documents/Work/node-app/uploads

# Should show: drwxr-xr-x (or similar with write permissions for owner)
```

## Common Issues & Solutions

### Issue 1: Files Received: 0
**Problem:** No files are being uploaded

**Solutions:**
1. Make sure you're using `multipart/form-data` in Postman
2. The form field name must be exactly `images` (not `image`, not `file`)
3. Select the file type as "File" in Postman, not "Text"

**In Postman:**
- Body → form-data
- Key: `images`
- Type: Select "File" from dropdown
- Value: Select your image file

### Issue 2: Directory Writable: ❌ No
**Problem:** The `/uploads` directory exists but isn't writable

**Solutions:**
```bash
# Fix permissions
chmod 755 /Users/vishaltadha/Documents/Work/node-app/uploads
chmod 777 /Users/vishaltadha/Documents/Work/node-app/uploads  # More permissive

# Or recreate it
rm -rf /Users/vishaltadha/Documents/Work/node-app/uploads
mkdir -p /Users/vishaltadha/Documents/Work/node-app/uploads
```

### Issue 3: Only Image Files Error
**Problem:** Getting error "Only image files are allowed (jpeg, png, gif, webp)"

**Solutions:**
1. Verify you're uploading actual image files (JPEG, PNG, GIF, WebP)
2. Don't upload PDF, DOC, or other file types
3. Check file extension and MIME type

**Allowed formats:**
- JPEG (.jpg, .jpeg) - image/jpeg
- PNG (.png) - image/png
- GIF (.gif) - image/gif
- WebP (.webp) - image/webp

### Issue 4: 413 Payload Too Large
**Problem:** File upload fails with "413 Payload Too Large"

**Solutions:**
1. Reduce image file size
2. Compress images before uploading
3. Increase Express payload limit (if needed):
   ```javascript
   app.use(express.json({ limit: '50mb' }));
   app.use(express.urlencoded({ limit: '50mb', extended: true }));
   ```

## Testing with curl

### Test 1: Basic Upload
```bash
curl -X POST http://localhost:5001/api/products \
  -F "productName=Test Product" \
  -F "model=TEST-001" \
  -F "category=Test" \
  -F "description=<h2>Test</h2>" \
  -F "images=@/path/to/image.jpg"
```

### Test 2: Multiple Images
```bash
curl -X POST http://localhost:5001/api/products \
  -F "productName=Multi Image Product" \
  -F "model=MULTI-001" \
  -F "category=Test" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg"
```

### Test 3: Without Images
```bash
curl -X POST http://localhost:5001/api/products \
  -F "productName=No Images" \
  -F "model=NOIMG-001" \
  -F "category=Test"
```

Should return:
```json
{
  "imagePaths": []
}
```

## Expected Behavior

### When Upload Works:
1. Product is created in database ✅
2. Images are saved to `/uploads/` directory ✅
3. `imagePaths` contains array of URLs:
   ```json
   "imagePaths": [
     "/uploads/1234567890-123456789.jpg",
     "/uploads/1234567891-987654321.jpg"
   ]
   ```
4. You can access images at: `http://localhost:5001/uploads/filename`

### When Upload Fails Silently:
1. Product is still created in database ✅
2. Images are NOT saved ❌
3. `imagePaths` is empty array: `[]` ❌
4. Check console logs for clues

## On Remote Server

If images work locally but not on remote server:

### 1. Check Directory Exists
```bash
# SSH into your server
ssh your-server

# Check uploads directory
ls -la /path/to/node-app/uploads

# Or create if missing
mkdir -p /path/to/node-app/uploads
chmod 777 /path/to/node-app/uploads
```

### 2. Check Disk Space
```bash
df -h  # Check available space
```

### 3. Check File Upload Limits
Check server configuration (nginx, Apache):
```bash
# For nginx
grep client_max_body_size /etc/nginx/nginx.conf
# Should be large enough (e.g., 100m)

# For Apache
grep LimitRequestBody /etc/apache2/apache2.conf
```

### 4. Check Logs
```bash
# Check application logs
tail -f /path/to/node-app/logs/error.log

# Check system logs
tail -f /var/log/syslog
```

## Quick Fix Checklist

- [ ] Server health check passes: `GET /api/health` returns writable: true
- [ ] Using correct form field name: `images`
- [ ] Using multipart/form-data content type
- [ ] Uploading actual image files (jpg, png, gif, webp)
- [ ] Uploads directory exists and has write permissions
- [ ] No console errors in server logs
- [ ] Database is connected and table exists
- [ ] Enough disk space on server

## Still Not Working?

Check these files and provide their output:

```bash
# 1. Check if uploads directory exists
ls -la uploads/

# 2. Check file permissions
stat uploads/

# 3. Test direct write access
touch uploads/test.txt && rm uploads/test.txt && echo "✅ Writable" || echo "❌ Not writable"

# 4. Check server logs
npm start 2>&1 | grep -i upload

# 5. Test with a simple file
echo "test" > test.txt
curl -X POST http://localhost:5001/api/upload -F "image=@test.txt"
```

If you're still having issues, please run these commands and share the output!
