#!/usr/bin/env node

// Clean install script for deployment environments
// This script installs dependencies without optional packages that might cause platform issues

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting clean installation for deployment...');

// Remove problematic files if they exist
try {
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('📦 Removed package-lock.json');
  }
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
    console.log('📁 Removed node_modules');
  }
} catch (error) {
  console.log('⚠️  Could not remove existing files:', error.message);
}

// Install dependencies without optional packages
try {
  console.log('📥 Installing dependencies without optional packages...');
  execSync('npm install --omit=optional --legacy-peer-deps --no-audit --no-fund', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NPM_CONFIG_OPTIONAL: 'false',
      NPM_CONFIG_LEGACY_PEER_DEPS: 'true'
    }
  });
  console.log('✅ Installation completed successfully!');
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
} 