const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   }
});

let db;

async function connectToDatabase() {
   if (!db) {
      await client.connect();
      db = client.db('DiscordMinecraftOwO'); // Bạn muốn dùng db nào, đặt tên ở đây
      console.log('✅ Connected to MongoDB');
   }
   return db;
}

module.exports = connectToDatabase;
