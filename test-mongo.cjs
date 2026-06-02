const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://trishulreddystar_db_user:HY7OnN9oUf9QgXa9@cluster0.wq9s6hi.mongodb.net/attendance?retryWrites=true&w=majority";
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (err) {
    console.dir(err);
  } finally {
    await client.close();
  }
}
run();
