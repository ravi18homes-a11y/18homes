"use client";
import React, { useState, useEffect } from "react";
import "./contact.css";
import { FiPhoneCall, FiMail, FiCheckCircle, FiSend, FiMessageSquare, FiShield } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function ContactFirst() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    discussion: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [checked, setChecked] = useState(false);
  const [footerData, setFooterData] = useState(null);

  // Fetch phone numbers from the homepage/footer API
  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.footer) setFooterData(json.footer);
      })
      .catch((err) => console.error("Error fetching contact info:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessage("");
    // Prevent only spaces
    if (value.trim() === "" && value.length > 0) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!checked) {
      toast.error("Please accept the privacy policy to submit the form.");
      setMessage("Please accept the privacy policy to submit the form.");
      return;
    }
    if (!form?.name || !form?.email || !form?.phone) {
      toast.error("Please fill all required fields.");
      setMessage("Please fill all required fields.");
      return;
    }
    // Basic email validation
    const emailRegex =
      /^(?!.*\.\.)(?!.*[_.-]{2})[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(form?.email)) {
      toast.error("Please enter a valid email address.");
      setMessage("Please enter a valid email address.");
      return;
    }
    // Phone validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form?.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      setMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Thank you! Message sent successfully.");
        setForm({
          name: "",
          email: "",
          phone: "",
          website: "",
          discussion: "",
        });
        setChecked(false);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      toast.error("Something went wrong. Please try again.");
      setMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <section className="bg-[#f4f7fc] py-16 px-4 sm:px-8 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* HEADER SECTION */}
          <div className="text-center sm:text-left space-y-3">
            <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full text-[#1818cc] text-xs font-extrabold uppercase tracking-wider">
              <FiMessageSquare className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              <span className="text-[#1818cc]">18homes</span> Support
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl font-normal">
              Have questions about buying, selling, or renting properties? Get in touch with our team for prompt assistance.
            </p>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT CONTACT CARDS */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* PHONE CARD */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/40 hover:border-blue-300 transition duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1818cc] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                    <FiPhoneCall className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <h3 className="text-xs font-extrabold text-[#1818cc] uppercase tracking-wider">
                      Call Us
                    </h3>

                    {(() => {
                      const phone = footerData?.phone || "+91 7827602246";
                      const phone2 = footerData?.phone2 || "";
                      const phone3 = footerData?.phone3 || "";
                      return (
                        <div className="space-y-1 pt-1">
                          {phone && (
                            <p className="text-base font-bold text-slate-900">
                              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-[#1818cc] transition-colors">
                                {phone}
                              </a>
                            </p>
                          )}
                          {phone2 && (
                            <p className="text-base font-bold text-slate-900">
                              <a href={`tel:${phone2.replace(/\s/g, "")}`} className="hover:text-[#1818cc] transition-colors">
                                {phone2}
                              </a>
                            </p>
                          )}
                          {phone3 && (
                            <p className="text-base font-bold text-slate-900">
                              <a href={`tel:${phone3.replace(/\s/g, "")}`} className="hover:text-[#1818cc] transition-colors">
                                {phone3}
                              </a>
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* EMAIL CARD */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/40 hover:border-blue-300 transition duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1818cc] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                    <FiMail className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <h3 className="text-xs font-extrabold text-[#1818cc] uppercase tracking-wider">
                      Send us a message
                    </h3>
                    <p className="text-base font-bold text-slate-900 pt-1">
                      <a href="mailto:18homes.website@gmail.com" className="hover:text-[#1818cc] transition-colors break-all">
                        18homes.website@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* PRIVACY ASSURANCE CARD */}
              <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1818cc] flex items-center justify-center shrink-0">
                  <FiShield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">100% Secure & Confidential</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Your contact information is strictly confidential and protected.</p>
                </div>
              </div>

            </div>

            {/* RIGHT FORM CONTAINER */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-blue-900/5">
              
              <form className="space-y-5" onSubmit={handleSubmit}>
                
                {/* NAME & PHONE ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form?.name}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^A-Za-z ]/g, "");
                        val = val.replace(/\s{2,}/g, " ");
                        if (val.length > 0 && val.trim() === "") return;
                        setForm((prev) => ({ ...prev, name: val }));
                      }}
                      placeholder="Enter your name"
                      required
                      autoComplete="off"
                      className="w-full bg-slate-50 border border-[blue] focus:bg-white focus:border-[#1818cc] focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 rounded-xl p-3.5 text-sm outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form?.phone}
                      onChange={(e) => {
                        setMessage("");
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setForm((prev) => ({ ...prev, phone: val }));
                      }}
                      maxLength={10}
                      required
                      autoComplete="off"
                      placeholder="Enter 10-digit number"
                      className="w-full bg-slate-50 border border-[blue] focus:bg-white focus:border-[#1818cc] focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 rounded-xl p-3.5 text-sm outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* EMAIL & REQUIREMENT ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form?.email}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-[blue] focus:bg-white focus:border-[#1818cc] focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 rounded-xl p-3.5 text-sm outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Requirement Type
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={form?.website}
                      onChange={handleChange}
                      placeholder="e.g. 2BHK Flat / Villa / Shop"
                      className="w-full bg-slate-50 border border-[blue] focus:bg-white focus:border-[#1818cc] focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 rounded-xl p-3.5 text-sm outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* MESSAGE TEXTAREA */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    id="discussion"
                    name="discussion"
                    value={form?.discussion}
                    onChange={handleChange}
                    placeholder="Tell us more about what property you are looking for..."
                    className="w-full bg-slate-50 border border-[blue] focus:bg-white focus:border-[#1818cc] focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 rounded-xl p-3.5 text-sm outline-none transition-all font-medium resize-none"
                  ></textarea>
                </div>

                {/* PRIVACY POLICY CHECKBOX */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#1818cc] focus:ring-[#1818cc] cursor-pointer"
                    />
                    <span>
                      I accept the{" "}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1818cc] hover:underline font-bold"
                      >
                        privacy policy
                      </a>
                      .
                    </span>
                  </label>
                </div>

                {message && (
                  <p className={`text-xs font-bold ${message.includes("Thank") ? "text-emerald-600" : "text-rose-600"}`}>
                    {message}
                  </p>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1818cc] hover:bg-[#1212b3] text-white font-extrabold py-4 px-8 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wider uppercase disabled:opacity-50"
                >
                  <FiSend className="w-4 h-4" />
                  <span>{loading ? "Sending..." : "Submit Message"}</span>
                </button>

              </form>

            </div>

          </div>

        </div>

        {/* POPUP MODAL ON SUCCESS */}
        {showPopup && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1818cc] flex items-center justify-center mx-auto">
                <FiCheckCircle size={38} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Thank You!</h2>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Your message has been sent successfully. Our team will get back to you shortly.
              </p>
              <button
                className="w-full bg-[#1818cc] hover:bg-[#1212b3] text-white font-bold py-3 px-6 rounded-xl transition shadow-md cursor-pointer text-sm uppercase tracking-wider"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </section>
    </>
  );
}
