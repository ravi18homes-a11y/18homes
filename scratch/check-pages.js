const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://Ravi:ravi%4018homes@cluster0.dxxn4on.mongodb.net/18homes?appName=Cluster0";

const PageSchema = new mongoose.Schema(
  {
    title: String,
    mainMenu: String,
    parentId: mongoose.Schema.Types.ObjectId,
    slugSegment: String,
    slug: String,
    status: String,
    sections: Array,
  },
  { collection: "pages" }
);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  const Page = mongoose.models.Page || mongoose.model("Page", PageSchema);
  const pages = await Page.find({}).lean();
  console.log("Total pages found:", pages.length);
  pages.forEach(p => {
    console.log(`- Title: "${p.title}", Slug: "${p.slug}", Menu: "${p.mainMenu}", Status: "${p.status}", Sections Count: ${p.sections?.length || 0}`);
  });
  await mongoose.disconnect();
}

run().catch(console.error);
