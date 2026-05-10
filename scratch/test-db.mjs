
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI;

async function testConnection() {
  console.log('Testing connection to:', MONGO_URI.replace(/:([^@]+)@/, ':****@'));
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
