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

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/pulse-attendance";
// Ensure we use pulse-attendance if it's the cluster URI but missing the db name
let finalUri = uri;
if (finalUri.includes('cluster0') && !finalUri.includes('pulse-attendance')) {
  finalUri = finalUri.replace('/attendance?', '/pulse-attendance?');
}
const client = new MongoClient(finalUri);

async function clean() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node clean-db.js [collection_name...]
       node clean-db.js all

Examples:
  node clean-db.js all                    # Clears EVERYTHING (all collections)
  node clean-db.js sessions               # Clears only the 'sessions' collection
  node clean-db.js students users         # Clears 'students' and 'users' collections
    `);
    process.exit(0);
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    const collectionsInfo = await db.listCollections().toArray();
    const availableCollections = collectionsInfo
      .map(c => c.name)
      .filter(name => !name.startsWith('system.'));

    let targetCollections = [];

    if (args.includes('all')) {
      targetCollections = availableCollections;
      console.log('⚠️  WARNING: You are about to clear ALL collections!');
    } else {
      targetCollections = args.filter(arg => availableCollections.includes(arg));
      
      const notFound = args.filter(arg => !availableCollections.includes(arg));
      if (notFound.length > 0) {
        console.log(`⚠️  Ignoring unknown collections: ${notFound.join(', ')}`);
      }
    }

    if (targetCollections.length === 0) {
      console.log('No valid collections found to clean.');
      return;
    }

    console.log(`🧹 Preparing to clean collections: ${targetCollections.join(', ')}`);

    for (const name of targetCollections) {
      const result = await db.collection(name).deleteMany({});
      console.log(`   ✅ Cleared '${name}' (Deleted ${result.deletedCount} documents)`);
    }

    console.log('🎉 Database cleanup complete!');

  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  } finally {
    await client.close();
  }
}

clean();
