import React from 'react'
import PrivacyPolicy from './PrivacyPol'
export const metadata = {
  title: "Privacy Policy | 18 Homes Real Estate",
  description: "Learn how 18 Homes collects, stores, and safeguards your personal information while you browse our website or use our real estate services.",
  alternates: {
    canonical: "https://18homes.in/privacy-policy",
  },
};
export default function page() {
  return (
    <PrivacyPolicy />
  )
}
