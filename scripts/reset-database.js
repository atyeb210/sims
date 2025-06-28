#!/usr/bin/env node

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/smart-inventory';

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data in the database!');
  console.log('Database:', DATABASE_URL);
  
  // In a real script, you'd want to add a confirmation prompt
  console.log('\n🗑️  Resetting database...');

  try {
    const client = new MongoClient(DATABASE_URL);
    await client.connect();
    
    const db = client.db();
    
    // Drop all collections
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      console.log(`Dropping collection: ${collection.name}`);
      await db.collection(collection.name).drop();
    }
    
    await client.close();
    
    console.log('✅ Database reset completed');
    console.log('\n💡 Run "npm run seed" to populate with sample data');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
}

// Add confirmation in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Cannot reset database in production environment');
  process.exit(1);
}

resetDatabase(); 