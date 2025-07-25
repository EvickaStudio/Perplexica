#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const sampleConfigPath = path.join(__dirname, 'sample.config.toml');
const configPath = path.join(__dirname, 'config.toml');

console.log('Checking for config.toml file...');

if (fs.existsSync(configPath)) {
  console.log('config.toml already exists. Skipping creation.');
  process.exit(0);
}

if (!fs.existsSync(sampleConfigPath)) {
  console.error('sample.config.toml not found. Cannot create config.toml.');
  process.exit(1);
}

try {
  const sampleConfig = fs.readFileSync(sampleConfigPath, 'utf-8');
  fs.writeFileSync(configPath, sampleConfig);
  console.log('✅ config.toml created successfully from sample.config.toml');
  console.log('📝 Please edit config.toml to add your API keys and configuration.');
} catch (error) {
  console.error('❌ Error creating config.toml:', error.message);
  process.exit(1);
} 