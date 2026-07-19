import Footer from '../COMMON/Footer'
import Navbar from '../COMMON/Navbar'
import HomeAbout from '../components/HomeAbout'
import AboutPage from './AboutPage'
import MissionVisson from './MissionVisson'

export const metadata = {
  title: "About 18 Homes | Trusted Real Estate Company in Delhi NCR",
  description: "Learn about 18 Homes, a trusted real estate company helping you buy, sell, and rent verified properties in Delhi NCR, Noida, Ghaziabad & Meerut. Contact us today.",
  alternates: {
    canonical: "https://18homes.in/about",
  },
};

function page() {
  return (
    <div>
      <Navbar color="white" />
      <AboutPage />
      <HomeAbout />
      <MissionVisson />

      <Footer />

    </div>
  )
}

export default page
