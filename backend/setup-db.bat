@echo off
echo ========================================
echo   Deployr Database Setup
echo ========================================
echo.
echo This script will help you set up the database for Deployr.
echo.
echo STEP 1: Make sure XAMPP is running
echo   - Open XAMPP Control Panel
echo   - Start Apache
echo   - Start MySQL
echo.
pause
echo.
echo STEP 2: Creating database...
echo.
echo Opening phpMyAdmin in your browser...
echo Please run the following SQL command:
echo.
echo CREATE DATABASE IF NOT EXISTS deployr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.
start http://localhost/phpmyadmin
echo.
pause
echo.
echo STEP 3: Running Laravel migrations...
php artisan migrate
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo You can now start the Laravel server with:
echo   php artisan serve
echo.
pause
