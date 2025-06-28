#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/smart-inventory';

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  console.log('💾 Creating database backup...');
  console.log('Database:', DATABASE_URL);
  console.log('Backup file:', backupFile);

  try {
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const client = new MongoClient(DATABASE_URL);
    await client.connect();
    
    const db = client.db();
    const backup = {
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      collections: {}
    };
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`Backing up collection: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      
      backup.collections[collectionName] = documents;
    }
    
    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    await client.close();
    
    console.log(`✅ Backup completed: ${backupFile}`);
    console.log(`📊 Backed up ${Object.keys(backup.collections).length} collections`);
    
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    process.exit(1);
  }
}

backupDatabase(); 