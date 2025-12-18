import Navbar from "@/app/COMMON/Navbar";
import PropertyDetailsPage from "./PropertyDetails";
import Footer from "@/app/COMMON/Footer";

export default function page() {
  return (
    <>
      <Navbar />
      <PropertyDetailsPage />
      <Footer />
    </>
  );
}
