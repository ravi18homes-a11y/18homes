
import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://Ravi:ravi%4018homes@cluster0.dxxn4on.mongodb.net/18homes?appName=Cluster0";

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
