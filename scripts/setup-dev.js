#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Smart Inventory System for development...\n');

// Check Node.js version
const nodeVersion = process.version;
const requiredVersion = '18.0.0';
if (nodeVersion < `v${requiredVersion}`) {
  console.error(`❌ Node.js ${requiredVersion} or higher is required. Current version: ${nodeVersion}`);
  process.exit(1);
}
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local from template...');
  const envExample = path.join(process.cwd(), '.env.local.example');
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envPath);
    console.log('✅ .env.local created! Please update it with your configuration.');
  } else {
    console.log('⚠️  .env.local.example not found. Please create .env.local manually.');
  }
} else {
  console.log('✅ .env.local already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Install git hooks
console.log('\n🪝 Setting up git hooks...');
try {
  execSync('npx husky install', { stdio: 'inherit' });
  console.log('✅ Git hooks installed successfully');
} catch (error) {
  console.log('⚠️  Failed to install git hooks (optional)');
}

// Generate strong secrets for JWT
console.log('\n🔐 Generating secure secrets...');
const crypto = require('crypto');
const jwtSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');
const nextAuthSecret = crypto.randomBytes(32).toString('hex');

console.log('\n📋 Add these secure secrets to your .env.local:');
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`REFRESH_TOKEN_SECRET="${refreshSecret}"`);
console.log(`NEXTAUTH_SECRET="${nextAuthSecret}"`);

// Check MongoDB connection
console.log('\n🗄️  Checking MongoDB...');
const { MongoClient } = require('mongodb');

async function checkMongoDB() {
  const defaultUri = 'mongodb://localhost:27017/smart-inventory';
  
  try {
    const client = new MongoClient(defaultUri);
    await client.connect();
    console.log('✅ MongoDB connection successful');
    await client.close();
  } catch (error) {
    console.log('⚠️  MongoDB connection failed. Make sure MongoDB is running.');
    console.log('   Install: https://www.mongodb.com/docs/manual/installation/');
    console.log('   Or use MongoDB Atlas: https://www.mongodb.com/atlas');
  }
}

checkMongoDB().then(() => {
  console.log('\n🎉 Setup complete! Next steps:');
  console.log('');
  console.log('1. Update .env.local with your configuration');
  console.log('2. Make sure MongoDB is running');
  console.log('3. Run: npm run seed (to populate database)');
  console.log('4. Run: npm run dev (to start development server)');
  console.log('');
  console.log('📖 Read CONTRIBUTING.md for development guidelines');
  console.log('🔗 Visit http://localhost:3000 when ready');
  console.log('');
  console.log('Happy coding! 🚀');
}); 