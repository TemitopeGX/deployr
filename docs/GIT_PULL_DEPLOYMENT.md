# Git Pull Deployment to cPanel - Complete Guide

## 🎯 Overview

This guide shows how to deploy Laravel projects to cPanel using the **Git Pull** method - the cleanest and most professional approach!

---

## 🏗️ How It Works

```
┌─────────────────────────────────────────┐
│  GIT PULL DEPLOYMENT WORKFLOW            │
├─────────────────────────────────────────┤
│                                          │
│  1. User triggers deployment            │
│     (via Deployr)                       │
│                                          │
│  2. Runner connects to cPanel via SSH   │
│                                          │
│  3. Runner navigates to project folder  │
│                                          │
│  4. Runner runs: git pull origin master │
│                                          │
│  5. Runner runs: composer install       │
│                                          │
│  6. Runner runs: php artisan migrate    │
│                                          │
│  7. Runner runs: php artisan cache      │
│                                          │
│  8. ✅ Deployment complete!              │
│                                          │
└─────────────────────────────────────────┘
```

---

## 📋 Prerequisites

### On cPanel:
- ✅ SSH access enabled
- ✅ Git installed
- ✅ Composer installed (or available)
- ✅ PHP 8.1+ available
- ✅ Project folder with git repository

### On Runner:
- ✅ SSH key pair generated
- ✅ Public key added to cPanel
- ✅ Runner updated with SSH deployment logic

---

## 🔑 Step 1: Set Up SSH Access

### A. Generate SSH Key (if you don't have one)

On your local machine (where runner runs):

```bash
ssh-keygen -t rsa -b 4096 -C "deployr@yourdomain.com"
```

Save to: `C:\Users\Operations Lateef\.ssh\id_rsa_deployr`

### B. Add Public Key to cPanel

1. **Copy your public key:**
   ```bash
   cat C:\Users\Operations Lateef\.ssh\id_rsa_deployr.pub
   ```

2. **In cPanel:**
   - Go to **SSH Access** → **Manage SSH Keys**
   - Click **Import Key**
   - Paste your public key
   - Click **Import**
   - Click **Manage** → **Authorize**

3. **Test SSH connection:**
   ```bash
   ssh -i C:\Users\Operations Lateef\.ssh\id_rsa_deployr username@yourdomain.com
   ```

---

## 📁 Step 2: Set Up Project on cPanel

### A. Initial Setup via SSH

```bash
# SSH into cPanel
ssh username@yourdomain.com

# Navigate to public_html or subdomain folder
cd public_html/projects

# Clone your repository
git clone https://github.com/laravel/laravel.git my-project
cd my-project

# Install dependencies
composer install --optimize-autoloader --no-dev

# Set up .env
cp .env.example .env
nano .env  # Edit with your database credentials

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Set permissions
chmod -R 755 storage bootstrap/cache
```

### B. Configure Web Server

1. **Set document root** to: `public_html/projects/my-project/public`
2. **Ensure .htaccess** is in place
3. **Test the site** works

---

## 🤖 Step 3: Update Runner for SSH Deployment

Now we need to update the Go runner to support SSH deployments.

### A. Add SSH Configuration to Runner

The runner needs to know:
- SSH host (your cPanel domain)
- SSH user (your cPanel username)
- SSH key path
- Project path on server

### B. Deployment Process

When deploying via Git Pull, the runner will:

1. **Connect via SSH** to cPanel
2. **Navigate** to project directory
3. **Run:** `git pull origin master`
4. **Run:** `composer install --no-dev`
5. **Run:** `php artisan migrate --force`
6. **Run:** `php artisan config:cache`
7. **Run:** `php artisan route:cache`
8. **Run:** `php artisan view:cache`
9. **Report** status back to backend

---

## 🔧 Step 4: Configure Project in Deployr

When creating a project in Deployr for cPanel deployment:

```json
{
  "name": "My Laravel App",
  "repo_url": "https://github.com/laravel/laravel",
  "framework": "laravel",
  "target": "cpanel",
  "deployment_config": {
    "method": "git-pull",
    "ssh_host": "yourdomain.com",
    "ssh_user": "cpanel_username",
    "ssh_key_path": "C:\\Users\\Operations Lateef\\.ssh\\id_rsa_deployr",
    "remote_path": "/home/cpanel_username/public_html/projects/my-project",
    "branch": "master"
  }
}
```

---

## 🚀 Step 5: Test Deployment

### A. Trigger Deployment

```bash
# Via API
curl -X POST https://your-deployr-backend.com/api/jobs \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id":1,"branch":"master"}'
```

### B. Watch Runner Execute

The runner will:
1. ✅ Find the job
2. ✅ Connect to cPanel via SSH
3. ✅ Run `git pull`
4. ✅ Run `composer install`
5. ✅ Run Laravel commands
6. ✅ Report completion

### C. Verify Deployment

1. **Check your website** - Should show latest code
2. **Check logs** in Deployr backend
3. **Verify** database migrations ran

---

## 📊 Deployment Commands

Here's what the runner executes on cPanel:

```bash
# 1. Navigate to project
cd /home/username/public_html/projects/my-project

# 2. Pull latest code
git pull origin master

# 3. Install dependencies
composer install --optimize-autoloader --no-dev

# 4. Run migrations
php artisan migrate --force

# 5. Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Set permissions (if needed)
chmod -R 755 storage bootstrap/cache
```

---

## 🔒 Security Best Practices

### 1. Use SSH Keys (Not Passwords)
- ✅ More secure
- ✅ No password in code
- ✅ Can be revoked easily

### 2. Restrict SSH Key Access
```bash
# In cPanel, restrict key to specific IP
# Or use key with passphrase
```

### 3. Use Deployment Keys
- Create a separate SSH key just for deployments
- Don't use your personal SSH key

### 4. Limit Runner Permissions
- Runner should only access deployment folders
- Use restricted shell if possible

---

## 🐛 Troubleshooting

### Issue: SSH Connection Refused

**Solution:**
1. Check SSH is enabled in cPanel
2. Verify SSH port (usually 22)
3. Check firewall rules
4. Test manual SSH connection

### Issue: Git Pull Fails

**Solution:**
1. Check git is installed: `which git`
2. Verify repository is initialized
3. Check remote URL: `git remote -v`
4. Ensure no uncommitted changes

### Issue: Composer Not Found

**Solution:**
```bash
# Install composer locally in project
cd /home/username/public_html/projects/my-project
curl -sS https://getcomposer.org/installer | php
php composer.phar install
```

### Issue: Permission Denied

**Solution:**
```bash
# Fix permissions
chmod -R 755 storage bootstrap/cache
chown -R username:username storage bootstrap/cache
```

---

## ✅ Deployment Checklist

Before first deployment:
- [ ] SSH access configured
- [ ] SSH key added to cPanel
- [ ] Project cloned on cPanel
- [ ] .env file configured
- [ ] Database created
- [ ] Initial setup complete (composer, migrations)
- [ ] Website accessible
- [ ] Runner configured with SSH details

For each deployment:
- [ ] Code pushed to GitHub
- [ ] Deployment triggered in Deployr
- [ ] Runner executes successfully
- [ ] Website updated
- [ ] No errors in logs

---

## 🎯 Advantages of Git Pull Method

✅ **Clean** - No file uploads, just pull latest code  
✅ **Fast** - Only changed files are updated  
✅ **Reliable** - Git tracks everything  
✅ **Rollback** - Easy to revert: `git reset --hard`  
✅ **Professional** - Industry standard approach  

---

## 📝 Next Steps

1. **Deploy backend** to cPanel
2. **Set up SSH** access
3. **Update runner** with SSH logic
4. **Test deployment** with Laravel repo
5. **Celebrate!** 🎉

---

**This is the professional way to deploy!** 🚀
