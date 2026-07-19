import React, { Suspense } from "react";
import { BuyComponent } from "./BuyComponent";

export const metadata = {
  title: "Buy Verified Property in Delhi NCR | 18 Homes",
  description: "Explore verified flats, houses, plots, and commercial properties for sale in Delhi, Noida, Ghaziabad & Meerut. Buy your dream property with 18 Homes today.",
  alternates: {
    canonical: "https://18homes.in/buy",
  },
};
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuyComponent />
    </Suspense>
  );
}
