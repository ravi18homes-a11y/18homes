export default function manifest() {
  return {
    name: "18 Homes - Best Property for Sale and Rent in NCR",
    short_name: "18Homes",
    description: "Leading Real Estate Company in NCR, Offering Prime Residential and Commercial Properties.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8c4bdc",
    icons: [
      {
        src: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1785662832/18homes_log_best_real_estate_e6spg7.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1785662832/18homes_log_best_real_estate_e6spg7.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
    ],
  };
}
