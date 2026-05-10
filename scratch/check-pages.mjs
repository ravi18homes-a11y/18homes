
import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://Ravi:ravi%4018homes@cluster0.dxxn4on.mongodb.net/18homes?appName=Cluster0";

const PageSchema = new mongoose.Schema({}, { strict: false });
const Page = mongoose.models.Page || mongoose.model('Page', PageSchema);

async function checkPages() {
  try {
    await mongoose.connect(MONGO_URI);
    const pages = await Page.find({});
    console.log(`Found ${pages.length} pages in the database.`);
    pages.forEach(p => {
      console.log(` - Title: ${p.title}, Slug: ${p.slug}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkPages();
