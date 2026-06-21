
import mongoose from 'mongoose';

const MONGO_URI = "mongodb://Ravi:ravi%4018homes@ac-glfzgff-shard-00-00.dxxn4on.mongodb.net:27017,ac-glfzgff-shard-00-01.dxxn4on.mongodb.net:27017,ac-glfzgff-shard-00-02.dxxn4on.mongodb.net:27017/18homes?ssl=true&replicaSet=atlas-3rcss3-shard-0&authSource=admin&retryWrites=true&w=majority";

async function testConnection() {
  console.log('Testing connection to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('SUCCESS: Connected to MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: Could not connect to MongoDB Atlas:', err.message);
    process.exit(1);
  }
}

testConnection();
