"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../COMMON/Navbar";
import Footer from "../COMMON/Footer";
import PageHeader from "../COMMON/PageHeader";

const SECTIONS = [
    { id: "intro", title: "1. Introduction" },
    { id: "info-collect", title: "2. Information We Collect" },
    { id: "info-use", title: "3. How We Use Information" },
    { id: "info-share", title: "4. Sharing & Disclosure" },
    { id: "cookies", title: "5. Cookies & Tracking" },
    { id: "security", title: "6. Data Security" },
    { id: "rights", title: "7. Your Rights" },
    { id: "changes", title: "8. Changes to Policy" },
    { id: "contact", title: "9. Contact Us" },
];

export default function PrivacyPolicy() {
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
            <PageHeader title="Privacy Policy" />

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
                                        className={`w-full text-left py-2 px-3 rounded-lg text-[15px] font-medium transition-all duration-200 ${activeSection === section.id
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
                                Privacy Policy
                            </h2>
                            <p className="text-slate-600 mt-4 leading-relaxed">
                                At 18 Homes, accessible from 18homes.in, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document outlines the types of information we collect, record, and how we use it to provide better property search and listing services.
                            </p>
                        </div>

                        {/* Intro */}
                        <div id="intro" className="scroll-mt-32">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                1. Introduction
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                This Privacy Policy applies to our online platform operations and is valid for visitors to our website with regards to the information they share or collect on 18 Homes. This policy is not applicable to any information collected offline or via channels other than this website.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                By using our website, you hereby consent to our Privacy Policy and agree to its terms.
                            </p>
                        </div>

                        {/* Information We Collect */}
                        <div id="info-collect" className="scroll-mt-32">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                2. Information We Collect
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide it.
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-slate-600">
                                <li>
                                    <strong>Direct Account Info:</strong> When you register for an account or sign up on 18 Homes, we may ask for your contact details, including items such as name, email address, and telephone number.
                                </li>
                                <li>
                                    <strong>Property Listings:</strong> If you post a property (flat, room, commercial space) for sale or rent, we collect property addresses, descriptions, pricing, sizes, photos, and owner/agent details.
                                </li>
                                <li>
                                    <strong>User Communications:</strong> If you contact us directly or inquire about a property via contact forms, we may receive additional information such as your message, attachments, or any other details you choose to share.
                                </li>
                                <li>
                                    <strong>Technical Data:</strong> When you browse our site, we automatically receive log files, IP addresses, browser types, Internet Service Providers (ISP), referring/exit pages, and click paths.
                                </li>
                            </ul>
                        </div>

                        {/* How We Use Information */}
                        <div id="info-use" className="scroll-mt-32">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                3. How We Use Information
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                We use the information we collect in various ways to support and improve your property search experience, including to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                <li>Provide, operate, and maintain our website.</li>
                                <li>Improve, personalize, and expand our website user interface.</li>
                                <li>Understand and analyze how you use our website (e.g., popular property locations, filters used).</li>
                                <li>Develop new features, property verification tools, and service updates.</li>
                                <li>Communicate with you, either directly or through one of our partners, for customer support, service updates, and marketing offers.</li>
                                <li>Send you text alerts, PWA notifications, or emails relating to listings you have shown interest in.</li>
                                <li>Detect and prevent fraudulent activities or fake listings.</li>
                            </ul>
                        </div>

                        {/* Sharing & Disclosure */}
                        <div id="info-share" className="scroll-mt-32">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                4. Sharing & Disclosure
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                We do not sell, rent, or trade your personal identity data to third parties. However, in order to facilitate real estate matches, we share information in the following situations:
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-slate-600">
                                <li>
                                    <strong>With Agents and Owners:</strong> When you request information or express interest in a listed property, your contact details (name and phone number) may be shared with the relevant agent or owner listing that property to assist in communication.
                                </li>
                                <li>
                                    <strong>Service Providers:</strong> We may share data with service providers (like Cloudinary for hosting images, database hosts, analytics tracking like Microsoft Clarity and Google Analytics, and payment processors like Razorpay) to operate our platform services.
                                </li>
                                <li>
                                    <strong>Legal Requirements:</strong> We may disclose information if required to do so by Indian law or in response to valid requests by public authorities (e.g., a court or government agency).
                                </li>
                            </ul>
                        </div>

                        {/* Cookies & Tracking */}
                        <div id="cookies" className="scroll-mt-32">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                5. Cookies & Tracking
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Like any other website, 18 Homes uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                We also use third-party analytics services (Google Analytics and Microsoft Clarity) which set cookies to help us track usage patterns, page engagement, and device resolutions. You can choose to disable cookies through your individual browser options.
                            </p>
                        </div>

                        {/* Data Security */}
                        <div id="security" className="scroll-mt-32">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                6. Data Security
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                The security of your data is important to us. We employ standard technical and administrative security measures (such as SSL encryption, firewalls, and secure database protocols) to protect your personal information against unauthorized access, loss, misuse, or alteration. However, please remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.
                            </p>
                        </div>

                        {/* Your Rights */}
                        <div id="rights" className="scroll-mt-32">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                7. Your Rights
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                <li><strong>The right to access:</strong> You have the right to request copies of your personal data held by us.</li>
                                <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or incomplete.</li>
                                <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                                <li><strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data under certain conditions.</li>
                            </ul>
                        </div>

                        {/* Changes to Policy */}
                        <div id="changes" className="scroll-mt-32">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                8. Changes to Policy
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this policy. These changes are effective immediately after they are posted on this page.
                            </p>
                        </div>

                        {/* Contact Us */}
                        <div id="contact" className="scroll-mt-32">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                                9. Contact Us
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us:
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
