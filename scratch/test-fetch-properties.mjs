import mongoose from 'mongoose';

const MONGO_URI = "mongodb://Ravi:ravi%4018homes@ac-glfzgff-shard-00-00.dxxn4on.mongodb.net:27017,ac-glfzgff-shard-00-01.dxxn4on.mongodb.net:27017,ac-glfzgff-shard-00-02.dxxn4on.mongodb.net:27017/18homes?ssl=true&replicaSet=atlas-3rcss3-shard-0&authSource=admin&retryWrites=true&w=majority";

const schema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.model('Property', schema);

async function checkProperties() {
  try {
    await mongoose.connect(MONGO_URI);
    const properties = await Property.find({ title: /1bhk/i });
    console.log("Properties found:", JSON.stringify(properties, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkProperties();
