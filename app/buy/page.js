import React, { Suspense } from "react";
import { BuyComponent } from "./BuyComponent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuyComponent />
    </Suspense>
  );
}
