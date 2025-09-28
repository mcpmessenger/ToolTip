#!/bin/bash

# User data script for EC2 instance
echo "🚀 Starting ToolTip Backend setup..." >> /var/log/user-data.log

# Update system
yum update -y >> /var/log/user-data.log 2>&1

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - >> /var/log/user-data.log 2>&1
yum install -y nodejs >> /var/log/user-data.log 2>&1

# Install Git
yum install -y git >> /var/log/user-data.log 2>&1

# Install Playwright dependencies
yum install -y atk cups-libs gtk3 libXcomposite alsa-lib libXcursor libXdamage libXext libXi libXrandr libXScrnSaver libXtst pango at-spi2-atk libXt xorg-x11-server-Xvfb >> /var/log/user-data.log 2>&1

# Create app directory
mkdir -p /home/ec2-user/tooltip-backend
cd /home/ec2-user/tooltip-backend

# Create a simple test server
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'ToolTip Backend is running on EC2',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 ToolTip Backend running on port ${port}`);
});
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "tooltip-backend-ec2",
  "version": "1.0.0",
  "description": "ToolTip Backend on EC2",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# Install dependencies
npm install >> /var/log/user-data.log 2>&1

# Create systemd service
cat > /etc/systemd/system/tooltip-backend.service << 'EOF'
[Unit]
Description=ToolTip Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/tooltip-backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable tooltip-backend
systemctl start tooltip-backend

echo "✅ Setup complete! Backend should be running on port 3001" >> /var/log/user-data.log
echo "🔗 Test with: curl http://localhost:3001/health" >> /var/log/user-data.log

