import Footer from "./COMMON/Footer";
import Navbar from "./COMMON/Navbar";
import HomeBlogs from "./components/Blogs";
import ContactSection from "./components/ContactSection";
import FilterPropertiesComp from "./components/FilterPropertiesComp";
import HeroSlider from "./components/HeroSection";
import HomeAbout from "./components/HomeAbout";
import HomeBuyComp from "./components/HomeBuyComp";
import HomeServices from "./components/HomeService";
import InstrumentsSection from "./components/InstrumentsSection";
import Testimonials from "./components/Testimonials";


export default function Home() {
  return (
    <main>
      <div>
      <Navbar/>
      <HeroSlider/>
      <HomeAbout/>
      <FilterPropertiesComp/>
       <HomeServices/> 
      <HomeBuyComp/>
      <HomeBlogs/>
      <InstrumentsSection/>
      <Testimonials/>
      <ContactSection/>
      <Footer/>
      
      </div>
    </main>
  );
}
