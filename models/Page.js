import mongoose from "mongoose";

const SeoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: String, default: "" },
    canonicalUrl: { type: String, default: "" },
    noIndex: { type: Boolean, default: false },
    openGraphTitle: { type: String, default: "" },
    openGraphDescription: { type: String, default: "" },
    openGraphImage: { type: String, default: "" },
    schemaMarkup: { type: String, default: "" },
  },
  { _id: false },
);

const SectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const PageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    mainMenu: {
      type: String,
      enum: ["home", "buy", "sell", "contact", "pages"],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      default: null,
    },
    slugSegment: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    sections: { type: [SectionSchema], default: [] },
    seo: { type: SeoSchema, default: () => ({}) },
    showInNavbar: { type: Boolean, default: true },
  },
  { timestamps: true },
);

PageSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
});

PageSchema.index({ mainMenu: 1, parentId: 1, slugSegment: 1 });
PageSchema.index({ slug: 1 }, { unique: true });

export default mongoose.models.Page || mongoose.model("Page", PageSchema);

