#!/bin/bash

# TGPS Payroll System Deployment Script
# Usage: ./deploy.sh [production|staging]

# Exit on any error
set -e

# Configuration
APP_NAME="tgps-payroll"
DEPLOY_ENV=${1:-production}
DEPLOY_PATH="/opt/$APP_NAME"
BACKUP_PATH="/var/lib/$APP_NAME/backups"
LOG_PATH="/var/log/$APP_NAME"
DB_PATH="/var/lib/$APP_NAME/payroll_system.db"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
SYSTEMD_SERVICE="/etc/systemd/system/$APP_NAME.service"
CERTBOT_EMAIL="admin@tgps.com"
DOMAIN="payroll.tgps.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root"
fi

# Verify environment
log "Verifying environment..."
if [ "$DEPLOY_ENV" != "production" ] && [ "$DEPLOY_ENV" != "staging" ]; then
    error "Invalid environment. Use 'production' or 'staging'"
fi

# Create required directories
log "Creating directories..."
mkdir -p "$DEPLOY_PATH"
mkdir -p "$BACKUP_PATH"
mkdir -p "$LOG_PATH"
mkdir -p "/var/lib/$APP_NAME/uploads"

# Install system dependencies
log "Installing system dependencies..."
apt-get update
apt-get install -y curl git nginx sqlite3 certbot python3-certbot-nginx

# Install Node.js 18.x if not present
if ! command -v node &> /dev/null; then
    log "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Backup existing database if exists
if [ -f "$DB_PATH" ]; then
    log "Backing up existing database..."
    BACKUP_FILE="$BACKUP_PATH/payroll_$(date +%Y%m%d_%H%M%S).db"
    sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
fi

# Clone/pull repository
log "Updating application code..."
if [ -d "$DEPLOY_PATH/.git" ]; then
    cd "$DEPLOY_PATH"
    git fetch --all
    git reset --hard origin/main
else
    git clone https://github.com/your-repo/tgps-payroll "$DEPLOY_PATH"
    cd "$DEPLOY_PATH"
fi

# Install dependencies
log "Installing Node.js dependencies..."
npm ci --production

# Build application
log "Building application..."
npm run build

# Create environment file
log "Creating environment file..."
cat > "$DEPLOY_PATH/.env.$DEPLOY_ENV" << EOL
NODE_ENV=$DEPLOY_ENV
PORT=8080
HOST=0.0.0.0
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRY=8h
BCRYPT_ROUNDS=12
DB_PATH=$DB_PATH
UPLOAD_PATH=/var/lib/$APP_NAME/uploads
TZ=Asia/Manila
EOL

# Create Nginx configuration
log "Configuring Nginx..."
cat > "$NGINX_CONF" << EOL
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";

    # Application proxy
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location /uploads {
        alias /var/lib/$APP_NAME/uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Security
    location ~ /\. {
        deny all;
    }
}
EOL

# Create symbolic link
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

# Create systemd service
log "Creating systemd service..."
cat > "$SYSTEMD_SERVICE" << EOL
[Unit]
Description=TGPS Payroll System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/bin/npm run start:$DEPLOY_ENV
Restart=always
Environment=NODE_ENV=$DEPLOY_ENV
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOL

# Setup SSL with Certbot
log "Setting up SSL certificate..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$CERTBOT_EMAIL"

# Create backup script
log "Creating backup script..."
cat > "$DEPLOY_PATH/backup.sh" << EOL
#!/bin/bash
DATE=\$(date +%Y%m%d)
BACKUP_DIR=$BACKUP_PATH
mkdir -p \$BACKUP_DIR
sqlite3 $DB_PATH ".backup '\$BACKUP_DIR/payroll_\$DATE.db'"
find \$BACKUP_DIR -name "payroll_*.db" -mtime +30 -delete
EOL

chmod +x "$DEPLOY_PATH/backup.sh"

# Add to crontab
log "Setting up automated backups..."
echo "0 1 * * * $DEPLOY_PATH/backup.sh" > /etc/cron.d/tgps-backup

# Configure log rotation
log "Configuring log rotation..."
cat > /etc/logrotate.d/tgps << EOL
$LOG_PATH/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload $APP_NAME
    endscript
}
EOL

# Set permissions
log "Setting permissions..."
chown -R www-data:www-data "$DEPLOY_PATH"
chown -R www-data:www-data "/var/lib/$APP_NAME"
chown -R www-data:www-data "$LOG_PATH"
chmod -R 755 "$DEPLOY_PATH"
chmod -R 755 "/var/lib/$APP_NAME"
chmod -R 755 "$LOG_PATH"

# Configure firewall
log "Configuring firewall..."
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Start services
log "Starting services..."
systemctl daemon-reload
systemctl enable nginx
systemctl enable "$APP_NAME"
systemctl restart nginx
systemctl restart "$APP_NAME"

# Verify deployment
log "Verifying deployment..."
sleep 5
if curl -s -f -o /dev/null "https://$DOMAIN"; then
    log "✅ Deployment successful! System is running at https://$DOMAIN"
else
    error "Deployment verification failed. Please check the logs."
fi

# Print summary
log "
===========================================
🎉 TGPS Payroll System Deployment Complete!
===========================================

📝 Summary:
- Environment: $DEPLOY_ENV
- Domain: https://$DOMAIN
- Database: $DB_PATH
- Backups: $BACKUP_PATH
- Logs: $LOG_PATH

🔍 Verify these items:
1. Visit https://$DOMAIN
2. Test admin login
3. Check mobile portal
4. Verify SSL certificate
5. Test all features

⚠️ Important:
- Keep .env.$DEPLOY_ENV secure
- Regular backups are scheduled
- Logs are rotated automatically
- SSL auto-renews via certbot

📞 Support:
- Technical: support@tgps.com
- Emergency: +63 xxx xxx xxxx

===========================================
"