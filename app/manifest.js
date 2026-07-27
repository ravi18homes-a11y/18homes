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
        src: "https://res.cloudinary.com/domwj0m7s/image/upload/v1785082545/18homes_logo_duhekk.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "maskable any",
      },
      {
        src: "https://res.cloudinary.com/domwj0m7s/image/upload/v1785082545/18homes_logo_duhekk.jpg",
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
