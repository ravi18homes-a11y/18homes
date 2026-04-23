import Navbar from "@/app/COMMON/Navbar";
import PropertyDetailsPage from "./PropertyDetails";
import Footer from "@/app/COMMON/Footer";
import { Suspense } from "react";

export default function page() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <PropertyDetailsPage />
      </Suspense>
      <Footer />
    </>
  );
}
