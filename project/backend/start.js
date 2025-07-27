#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Street Food Vendor Platform Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📋 Please copy .env.example to .env and configure your environment variables:\n');
  console.log('   cp .env.example .env\n');
  console.log('🔧 Required configurations:');
  console.log('   - MONGODB_URI (MongoDB connection string)');
  console.log('   - JWT_SECRET (JWT secret key)');
  console.log('   - TWILIO_ACCOUNT_SID (Twilio Account SID)');
  console.log('   - TWILIO_AUTH_TOKEN (Twilio Auth Token)');
  console.log('   - EMAIL_USER (SMTP email)');
  console.log('   - EMAIL_PASS (SMTP password)');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Check required environment variables
const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📋 Please configure these in your .env file');
  console.log('\n🔧 Optional configurations:');
  console.log('   - GEMINI_API_KEY (for AI-powered insights)');
  console.log('   - GOOGLE_MAPS_API_KEY (for location services)');
  process.exit(1);
}

// Start the server
console.log('✅ Environment variables loaded');
console.log('🔗 Connecting to database...');

try {
  require('./server');
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}
