# Deploying Deployr Backend to cPanel

## 🎯 Overview

This guide will help you deploy the Deployr backend (Laravel API) to your cPanel hosting.

---

## 📋 Prerequisites

- ✅ cPanel access
- ✅ PHP 8.1+ available
- ✅ MySQL database access
- ✅ SSH access (optional but recommended)
- ✅ Domain or subdomain configured

---

## 🚀 Deployment Steps

### Step 1: Prepare the Backend

First, let's prepare the backend for production:

```bash
cd backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Create production .env file
cp .env .env.production
```

Edit `.env.production` with your cPanel details:

```env
APP_NAME=Deployr
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_cpanel_database_name
DB_USERNAME=your_cpanel_database_user
DB_PASSWORD=your_cpanel_database_password

QUEUE_CONNECTION=database
```

---

### Step 2: Create Database on cPanel

1. **Log in to cPanel**
2. **Go to MySQL Databases**
3. **Create a new database:**
   - Database name: `deployr` (or your choice)
4. **Create a database user:**
   - Username: `deployr_user`
   - Password: (strong password)
5. **Add user to database** with ALL PRIVILEGES

---

### Step 3: Upload Files to cPanel

#### Option A: Using File Manager (Easier)

1. **Compress the backend folder:**
   ```bash
   # On your local machine
   cd c:\Users\Operations Lateef\work\deployer
   # Create a zip file of the backend folder
   ```

2. **Upload to cPanel:**
   - Go to cPanel File Manager
   - Navigate to `public_html` (or subdomain folder)
   - Upload the zip file
   - Extract it

3. **Move files to correct location:**
   ```
   public_html/
   ├── backend/  (Laravel app root)
   │   ├── app/
   │   ├── bootstrap/
   │   ├── config/
   │   ├── database/
   │   ├── public/  ← This needs to be in public_html
   │   └── ...
   ```

   **Important:** The `public` folder contents should be in `public_html`

#### Option B: Using Git (Recommended)

1. **SSH into cPanel:**
   ```bash
   ssh your-username@your-domain.com
   ```

2. **Clone the repository:**
   ```bash
   cd public_html
   git clone https://github.com/yourusername/deployr-backend.git deployr
   cd deployr
   ```

3. **Install dependencies:**
   ```bash
   composer install --optimize-autoloader --no-dev
   ```

---

### Step 4: Configure cPanel for Laravel

#### A. Set Document Root

1. **Go to cPanel → Domains**
2. **Click on your domain/subdomain**
3. **Set Document Root to:**
   ```
   public_html/deployr/public
   ```
   (or wherever your Laravel `public` folder is)

#### B. Create .htaccess

In `public_html/deployr/public/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

### Step 5: Set Permissions

```bash
# SSH into server
cd public_html/deployr

# Set permissions
chmod -R 755 storage bootstrap/cache
chown -R your-username:your-username storage bootstrap/cache
```

---

### Step 6: Run Migrations

```bash
cd public_html/deployr

# Run migrations
php artisan migrate --force

# Generate app key (if not set)
php artisan key:generate

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

### Step 7: Test the API

Visit your domain:

```
https://your-domain.com/api/auth/register
```

You should see a JSON response (or error if no data sent).

Test with curl:

```bash
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

---

## 🔧 Troubleshooting

### Issue: 500 Internal Server Error

**Solution:**
1. Check `.env` file exists and is configured
2. Run `php artisan config:clear`
3. Check file permissions (755 for folders, 644 for files)
4. Check error logs in cPanel

### Issue: Database Connection Error

**Solution:**
1. Verify database credentials in `.env`
2. Ensure database user has privileges
3. Check if database host is `localhost` or IP

### Issue: Routes Not Working

**Solution:**
1. Check `.htaccess` file exists in `public` folder
2. Ensure mod_rewrite is enabled
3. Clear route cache: `php artisan route:clear`

### Issue: Storage/Cache Errors

**Solution:**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

---

## 📊 Verify Deployment

### Check these URLs:

1. **Homepage:** `https://your-domain.com`
2. **API Test:** `https://your-domain.com/api/auth/register`
3. **Health Check:** `https://your-domain.com/up`

### Test API Endpoints:

```bash
# Register user
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Should return user data and API token
```

---

## 🎯 Next Steps

Once the backend is deployed:

1. ✅ Update runner configuration to use production URL
2. ✅ Test runner connection
3. ✅ Deploy your first project to cPanel
4. ✅ Celebrate! 🎉

---

## 📝 Production Checklist

- [ ] Database created and configured
- [ ] Files uploaded to cPanel
- [ ] Document root set correctly
- [ ] .env file configured
- [ ] Permissions set (755/644)
- [ ] Migrations run
- [ ] Config cached
- [ ] API endpoints tested
- [ ] SSL certificate installed (recommended)

---

## 🔒 Security Notes

1. **Never commit `.env` to Git**
2. **Use strong database passwords**
3. **Enable SSL/HTTPS**
4. **Set `APP_DEBUG=false` in production**
5. **Keep Laravel and dependencies updated**

---

**Ready to deploy!** 🚀

Follow these steps and your backend will be live on cPanel!
