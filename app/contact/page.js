import React from 'react'
import ContactPage from './ContactPage'
import ContactFirst from './ContactFirst'
import Footer from '../COMMON/Footer'
import Navbar from '../COMMON/Navbar'
export const metadata = {
  title: "Get in Touch with 18 Homes | Delhi NCR Property",
  description: "Have questions about buying or selling property? Contact 18 Homes for trusted real estate guidance and verified property solutions across Delhi NCR.",
  alternates: {
    canonical: "https://18homes.in/contact",
  },
};
function page() {
  return (
    <div>
      <Navbar color="white" />
      <ContactPage />
      <ContactFirst />
      <Footer />
    </div>
  )
}

export default page
