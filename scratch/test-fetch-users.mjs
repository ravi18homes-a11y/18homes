import mongoose from 'mongoose';

const MONGO_URI = "mongodb://Ravi:ravi%4018homes@ac-glfzgff-shard-00-00.dxxn4on.mongodb.net:27017,ac-glfzgff-shard-00-01.dxxn4on.mongodb.net:27017,ac-glfzgff-shard-00-02.dxxn4on.mongodb.net:27017/18homes?ssl=true&replicaSet=atlas-3rcss3-shard-0&authSource=admin&retryWrites=true&w=majority";

const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', schema);

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    const users = await User.find({});
    console.log("Users found:", JSON.stringify(users.map(u => ({ id: u._id, name: u.name, role: u.role, phone: u.phone })), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkUsers();
