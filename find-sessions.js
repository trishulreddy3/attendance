import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Load variables from the backend .env file if it exists
const envPath = path.resolve('backend', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([^=#]+)\s*=\s*(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/attendance";
const client = new MongoClient(uri);

async function findAndClean() {
  try {
    console.log('🔌 Connecting to MongoDB cluster...');
    await client.connect();
    
    // Get list of databases
    const adminDb = client.db().admin();
    const dbsInfo = await adminDb.listDatabases();
    
    for (const dbInfo of dbsInfo.databases) {
      const dbName = dbInfo.name;
      if (dbName === 'admin' || dbName === 'local' || dbName === 'config') continue;
      
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      const colNames = collections.map(c => c.name);
      
      if (colNames.includes('sessions')) {
        const count = await db.collection('sessions').countDocuments();
        console.log(`📂 Database '${dbName}' has 'sessions' collection with ${count} documents.`);
        if (count > 0) {
          const res = await db.collection('sessions').deleteMany({});
          console.log(`   ✅ Cleared ${res.deletedCount} sessions from '${dbName}'`);
        }
      }
    }
    
    console.log('🎉 Done checking all databases in cluster!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

findAndClean();
