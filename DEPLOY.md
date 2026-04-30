# Deployment Guide — SH Malik Logistics ERP

**Stack:** Laravel 13 · Inertia.js · React 18 · Mantine v7 · MySQL 8

---

## Server Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| PHP | 8.2 | 8.3+ |
| MySQL | 8.0 | 8.0+ |
| Node.js | 18 | 20 LTS |
| Composer | 2.x | 2.x |
| Web server | Nginx or Apache | Nginx |
| RAM | 1 GB | 2 GB+ |
| Disk | 5 GB | 20 GB+ |

**Required PHP extensions:**
`pdo_mysql`, `mbstring`, `xml`, `curl`, `gd`, `zip`, `bcmath`, `tokenizer`, `ctype`, `fileinfo`, `openssl`

---

## 1. Upload Files

```bash
# Clone or upload the project to your server
git clone <repository-url> /var/www/logistics
cd /var/www/logistics/web
```

---

## 2. Install Dependencies

```bash
# PHP dependencies
composer install --no-dev --optimize-autoloader

# Node dependencies + build frontend
npm ci
npm run build
```

---

## 3. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set all required values:

```env
APP_NAME="SH Malik Logistics"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database — use MySQL in production (NOT sqlite)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=logistics_db
DB_USERNAME=logistics_user
DB_PASSWORD=your_strong_password

# Mail (for invoice sending and notifications)
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="SH Malik Logistics"

# File storage
FILESYSTEM_DISK=public

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
```

---

## 4. Create the Database

```sql
-- Run in MySQL as root
CREATE DATABASE logistics_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'logistics_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON logistics_db.* TO 'logistics_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 5. Run Migrations

```bash
php artisan migrate --force
```

This creates all tables and seeds the following lookup data automatically via migrations:
- Roles (Administrator, Operations Manager, Finance Officer, HR Officer, Driver)
- License classes (Class A–E)
- Vehicle document types
- Deduction types (NSSF, NHIF, PAYE, etc.)
- Company settings (placeholder — update via Settings after deploy)

---

## 6. Seed Demo Data

> Run this **once** on initial deployment to populate the system with realistic sample data.
> **WARNING:** This truncates all transactional tables. Do NOT run on a live system with real data.

```bash
php artisan db:seed --force
```

What the seed creates:
| Data | Count |
|------|-------|
| Admin user | 1 |
| Vehicles | 12 |
| Drivers | 12 |
| Clients | 10 |
| Trips (Jan–Apr 2026) | ~39 |
| Cargo shipments | 30 |
| Cargo status logs | ~60 |
| Employees | 15 |
| Payroll runs + slips | 4 months × 15 = 60 slips |
| Leave requests | 10 |
| Fuel logs | 40 |
| Suppliers | 5 |
| Inventory items | 20 |
| Purchase orders | 8 |
| Job vacancies | 5 |
| Job applications | 18 |
| Appraisals | 8 |
| Portal quote requests | 5 |
| Invoices / Quotes / Proformas | ~50 billing documents |
| Payments | ~20 |
| Expenses | ~50 |
| Permits | ~12 |
| Service records | ~10 |
| GPS positions on vehicles | 5 vehicles |

**Default admin login after seeding:**

| Field | Value |
|-------|-------|
| Email | `admin@shmalik.co.tz` |
| Password | `password` |

> **Change this password immediately after first login.**

---

## 7. Storage & Permissions

```bash
# Create storage symlink (for uploaded files — logos, documents)
php artisan storage:link

# Set correct permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## 8. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/logistics/web/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 20M;
}
```

---

## 9. Optimize for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## 10. Queue Worker (optional — for email sending)

If you use queued email (MAIL_MAILER set to a real SMTP server):

```bash
# Using Supervisor — create /etc/supervisor/conf.d/logistics-queue.conf
[program:logistics-queue]
command=php /var/www/logistics/web/artisan queue:work --sleep=3 --tries=3 --max-time=3600
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/logistics-queue.log
```

```bash
supervisorctl reread
supervisorctl update
supervisorctl start logistics-queue
```

---

## Post-Deploy Checklist

After the system is live, complete these steps in the admin panel:

- [ ] Login at `/system/login` with `admin@shmalik.co.tz` / `password`
- [ ] **Change admin password** — Settings → Users
- [ ] **Update company details** — Settings → Company (name, address, TIN, logo, phone)
- [ ] **Delete demo data** — Run `php artisan db:seed --force` then start entering real data, OR manually delete sample records from the UI
- [ ] **Create real admin user** with your own email — Settings → Users
- [ ] **Disable the demo admin account** once your own account is ready
- [ ] **Set up email** — test by sending an invoice from Billing
- [ ] **Register real vehicles** — Fleet → Add Vehicle
- [ ] **Register real drivers** — Drivers → Add Driver
- [ ] **Enable portal access** for clients — Clients → Edit → Portal tab

---

## Upgrade / Re-deploy

```bash
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> Do **NOT** run `db:seed` again after real data has been entered — it will truncate all tables.

---

## Folder Structure (key paths)

```
web/
├── app/
│   ├── Http/Controllers/System/   # Admin panel controllers
│   ├── Http/Controllers/Portal/   # Customer portal controllers
│   ├── Models/                    # Eloquent models
│   └── Services/AlertService.php  # Expiry alert aggregator
├── database/
│   ├── migrations/                # All schema migrations
│   └── seeders/DatabaseSeeder.php # Demo data seeder
├── resources/
│   ├── js/pages/system/           # Admin panel React pages
│   ├── js/pages/portal/           # Customer portal React pages
│   └── views/pdf/                 # PDF templates (dompdf)
├── routes/web.php                 # All application routes
└── public/build/                  # Compiled frontend assets (after npm run build)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 500 error after deploy | `php artisan config:clear && php artisan cache:clear` |
| Page shows blank / white | Check `storage/logs/laravel.log` for errors |
| Uploaded files not accessible | Run `php artisan storage:link` |
| PDF download fails | Ensure `gd` and `mbstring` PHP extensions are installed |
| Seeder fails on MySQL | Ensure `DB_CONNECTION=mysql` in `.env` before running seed |
| GPS map shows no tiles | Check internet access from server (Leaflet uses OpenStreetMap CDN) |
| Build assets not found | Run `npm ci && npm run build` then `php artisan view:clear` |
