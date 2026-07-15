"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../COMMON/Navbar";
import Footer from "../COMMON/Footer";
import PageHeader from "../COMMON/PageHeader";

const SECTIONS = [
  { id: "intro", title: "1. Introduction & Acceptance" },
  { id: "eligibility", title: "2. Eligibility & Registration" },
  { id: "usage", title: "3. Use of the Platform" },
  { id: "listings", title: "4. Property Listings & Disclaimers" },
  { id: "booking", title: "5. Booking & Financial Transactions" },
  { id: "ip", title: "6. Intellectual Property" },
  { id: "liability", title: "7. Limitation of Liability" },
  { id: "governing-law", title: "8. Governing Law" },
  { id: "contact", title: "9. Contact Information" },
];

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("intro");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = element.offsetTop - 120;
      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar color="white" />
      <PageHeader title="Terms & Conditions" />

      {/* Main Content Area */}
      <main className="flex-grow max-w-[1450px] mx-auto w-full px-6 lg:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sticky Left Sidebar (Navigation) */}
          <aside className="w-full lg:w-1/4 lg:sticky lg:top-28 h-fit bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hidden lg:block">
            <h3 className="text-lg font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
              Table of Contents
            </h3>
            <ul className="space-y-3">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left py-2 px-3 rounded-lg text-[15px] font-medium transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-[#1B1333] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Legal Text Area */}
          <section className="w-full lg:w-3/4 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 space-y-12">
            <div className="border-b border-slate-100 pb-6">
              <p className="text-sm text-slate-500 font-medium">Last Updated: July 15, 2026</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
                Terms of Service & User Agreement
              </h2>
              <p className="text-slate-600 mt-4 leading-relaxed">
                Welcome to 18 Homes. Please read these Terms and Conditions carefully before using our platform. By accessing or using our services, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our website.
              </p>
            </div>

            {/* Intro */}
            <div id="intro" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                1. Introduction & Acceptance
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                18 Homes ("us", "we", or "our") operates the web application 18homes.in. We offer a platform designed to connect property buyers, sellers, landlords, tenants, and real estate professionals in the National Capital Region (NCR) of India.
              </p>
              <p className="text-slate-600 leading-relaxed">
                These terms govern your access and use of the platform, including any listings, services, interactive tools, search criteria, and databases. By browsing or creating an account, you represent that you have read, understood, and agreed to the terms outlined herein.
              </p>
            </div>

            {/* Eligibility */}
            <div id="eligibility" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. Eligibility & Registration
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                To use the complete services of 18 Homes, you must be at least 18 years of age and competent to enter into a legally binding contract under the Indian Contract Act, 1872.
              </p>
              <p className="text-slate-600 leading-relaxed">
                If you create an account, you must provide accurate, current, and complete details (such as your phone number, email address, and name). You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </div>

            {/* Usage */}
            <div id="usage" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                3. Use of the Platform
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                You agree to use our website only for lawful purposes related to renting, purchasing, selling, or researching real estate. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Post false, inaccurate, misleading, or defamatory property details or descriptions.</li>
                <li>Transmit spam, unauthorized advertising, chain letters, or malicious code (viruses, trojans).</li>
                <li>Attempt to scrape, harvest, or extract data from our site without explicit prior written authorization.</li>
                <li>Impersonate any other person, agent, owner, or representative of 18 Homes.</li>
              </ul>
            </div>

            {/* Listings */}
            <div id="listings" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                4. Property Listings & Disclaimers
              </h3>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
                <p className="text-amber-800 text-sm font-semibold">Important Disclaimer for Users</p>
                <p className="text-amber-700 text-sm mt-1">
                  18 Homes functions strictly as an online search platform. We host details provided by property owners, builders, and agents. We do not own, manage, or endorse any properties listed on the platform unless explicitly stated.
                </p>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                While we strive to screen listings, users are strongly advised to perform independent checks regarding property ownership, clear title, dimensions, society rules, local government approvals, and the authenticity of the counterparties before paying any deposits or signing agreements.
              </p>
              <p className="text-slate-600 leading-relaxed">
                18 Homes is not responsible for any financial loss, dynamic discrepancies, quality issues, or contractual breaches between users of this platform.
              </p>
            </div>

            {/* Booking */}
            <div id="booking" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                5. Booking & Financial Transactions
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Any payment, deposit, or token money paid to owners, builders, or agents is entirely at your own risk. 18 Homes does not collect, process, or hold token funds on behalf of listed properties, nor do we act as escrows.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Payments made through checkout services (such as Razorpay or other payment links integration on the website) for packages, listing promotions, or premium services are non-refundable unless specified otherwise in writing.
              </p>
            </div>

            {/* IP */}
            <div id="ip" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                6. Intellectual Property
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The content, layout, design, graphics, logo, source code, database compilation, and software of 18 Homes are protected by intellectual property laws of India.
              </p>
              <p className="text-slate-600 leading-relaxed">
                You may not copy, reproduce, modify, distribute, or display any portion of our site without our prior written consent. When you upload photos or property information to our platform, you grant 18 Homes a non-exclusive, worldwide, royalty-free, perpetual license to host, display, and share that content.
              </p>
            </div>

            {/* Liability */}
            <div id="liability" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                7. Limitation of Liability
              </h3>
              <p className="text-slate-600 leading-relaxed">
                In no event shall 18 Homes, its directors, employees, partners, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the service; (ii) any conduct or content of any third party on the service; or (iii) unauthorized access, use, or alteration of your content.
              </p>
            </div>

            {/* Governing Law */}
            <div id="governing-law" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                8. Governing Law
              </h3>
              <p className="text-slate-600 leading-relaxed">
                These terms shall be governed by and defined in accordance with the laws of India. Any disputes arising out of or related to these terms, the website, or services provided by us shall be subject to the exclusive jurisdiction of the competent courts located in Ghaziabad, Uttar Pradesh, India.
              </p>
            </div>

            {/* Contact */}
            <div id="contact" className="scroll-mt-32">
              <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                9. Contact Information
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                If you have any questions, feedback, or complaints regarding these Terms & Conditions, please connect with us:
              </p>
              <div className="bg-slate-50 p-6 rounded-xl space-y-2 text-slate-700">
                <p><strong>Entity Name:</strong> 18 Homes</p>
                <p><strong>Office Address:</strong> Kanak Farm House, GovindPuram, Ghaziabad, Uttar Pradesh, 201013</p>
                <p><strong>Email Address:</strong> 18homes.website@gmail.com</p>
                <p><strong>Phone Number:</strong> +91 7827602246</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
