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
    twitterTitle: { type: String, default: "" },
    twitterDescription: { type: String, default: "" },
    twitterImage: { type: String, default: "" },
    twitterCard: { type: String, default: "summary_large_image" },
    schemaMarkup: { type: String, default: "" },
  },
  { _id: false }
);

const HeroSlideSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    heading1: { type: String, default: "" },
    heading2: { type: String, default: "" },
    heading3: { type: String, default: "" },
    heading4: { type: String, default: "" },
  },
  { _id: false }
);

const ServiceItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    desc: { type: String, default: "" },
    img: { type: String, default: "" },
  },
  { _id: false }
);

const BlogItemSchema = new mongoose.Schema(
  {
    date: { type: String, default: "" },
    title: { type: String, default: "" },
    img: { type: String, default: "" },
  },
  { _id: false }
);

const TestimonialItemSchema = new mongoose.Schema(
  {
    text: { type: String, default: "" },
    name: { type: String, default: "" },
    role: { type: String, default: "" },
    img: { type: String, default: "" },
  },
  { _id: false }
);

const FooterSchema = new mongoose.Schema(
  {
    logo: { type: String, default: "" },
    address: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    phone2: { type: String, default: "" },
    phone3: { type: String, default: "" },
    copyright: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    justdial: { type: String, default: "" },
    youtube: { type: String, default: "" },
    services: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const HomepageSchema = new mongoose.Schema(
  {
    seo: { type: SeoSchema, default: () => ({}) },
    hero: {
      slides: { type: [HeroSlideSchema], default: [] },
    },
    about: {
      subtitle: { type: String, default: "About" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      image: { type: String, default: "" },
      points: { type: [String], default: [] },
    },
    services: {
      subtitle: { type: String, default: "Service" },
      title: { type: String, default: "" },
      items: { type: [ServiceItemSchema], default: [] },
    },
    blogs: {
      subtitle: { type: String, default: "Latest post" },
      title: { type: String, default: "" },
      items: { type: [BlogItemSchema], default: [] },
    },
    instruments: {
      subtitle: { type: String, default: "" },
      title: { type: String, default: "" },
      desc1: { type: String, default: "" },
      desc2: { type: String, default: "" },
      desc3: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    testimonials: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      items: { type: [TestimonialItemSchema], default: [] },
    },
    contact: {
      title: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    footer: { type: FooterSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.Homepage || mongoose.model("Homepage", HomepageSchema);
