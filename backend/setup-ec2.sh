#!/bin/bash

# Setup script for ToolTip Backend on EC2
echo "🚀 Setting up ToolTip Backend on EC2..."

# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install Playwright dependencies
sudo yum install -y atk cups-libs gtk3 libXcomposite alsa-lib libXcursor libXdamage libXext libXi libXrandr libXScrnSaver libXtst pango at-spi2-atk libXt xorg-x11-server-Xvfb

# Install Chromium dependencies
sudo yum install -y chromium

# Create app directory
mkdir -p /home/ec2-user/tooltip-backend
cd /home/ec2-user/tooltip-backend

# Clone or copy the backend code
# (We'll copy the files via SCP)

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Create systemd service
sudo tee /etc/systemd/system/tooltip-backend.service > /dev/null <<EOF
[Unit]
Description=ToolTip Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/tooltip-backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable tooltip-backend
sudo systemctl start tooltip-backend

echo "✅ Setup complete! Backend should be running on port 3001"
echo "🔗 Test with: curl http://localhost:3001/health"

