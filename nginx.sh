#!/bin/bash

set -e

echo "======================================"
echo " Nginx Setup Script (EV-Tracker)"
echo " Proxy :80 -> localhost:3000"
echo "======================================"

if [ "$EUID" -ne 0 ]; then
  echo "❌ Run as root or sudo"
  exit 1
fi

# Remove default if exists
rm -f /etc/nginx/sites-enabled/default

echo "🌐 Configuring Nginx reverse proxy..."

cat <<EOF >/etc/nginx/sites-available/tesla.haxcodes.dev
server {
    listen 80;
    server_name tesla.haxcodes.dev;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/tesla.haxcodes.dev /etc/nginx/sites-enabled/

echo "🔍 Testing Nginx configuration..."
nginx -t

echo "🔄 Restarting Nginx..."
systemctl restart nginx

echo "📦 Installing Certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

echo "🔒 Obtaining SSL..."
certbot --nginx -d tesla.haxcodes.dev --non-interactive --agree-tos -m bhuvanthirwani2208usa@gmail.com --redirect

echo "✅ Nginx & SSL Setup Complete!"
