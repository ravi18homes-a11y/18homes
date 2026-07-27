"use client";

import Image from "next/image";
import "./contactpop.css";
import { useState } from "react";
import { FiCheckCircle, FiSend, FiPhoneCall, FiMail, FiMapPin, FiShield, FiUser, FiSmartphone } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function ContactSection({ data }) {
  const title = data?.title || "Please tell us your requirements";
  const image =
    data?.image ||
    "https://res.cloudinary.com/dxlykgx6w/image/upload/v1765125152/WhatsApp_Image_2025-12-07_at_9.01.16_PM_fuflru.jpg";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    discussion: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false); // ✅ New state for popup
  const [checked, setChecked] = useState(false); // ✅ Privacy policy checkbox state

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
    // Phone validation: only digits, exactly 10 digits
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
      const resData = await res.json();
      if (resData.success) {
        toast.success("Thank you! Message sent successfully.");
        setForm({
          name: "",
          email: "",
          phone: "",
          website: "",
          discussion: "",
        });
        setChecked(false);
        setShowPopup(true); // ✅ Show popup on success
      } else {
        toast.error(resData.error || "Failed to submit form.");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      toast.error("Something went wrong. Please try again.");
      setMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const customBgStyle = data?.bgColor ? { backgroundColor: data.bgColor } : {};
  const customTextStyle = data?.textColor ? { color: data.textColor } : {};

  return (
    <section id="contact-form-section" className="w-full max-w-[1720px] mx-auto scroll-mt-24 py-8 px-4 sm:px-6">
      <div
        className="rounded-3xl overflow-hidden shadow-xl bg-white border border-slate-100 relative grid grid-cols-1 lg:grid-cols-12"
        style={customBgStyle}
      >
        {/* LEFT FORM SECTION (CLEAN BLUE & WHITE THEME) */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center relative z-10 space-y-6 bg-white">
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold w-fit">
            <FiShield className="text-blue-600" />
            <span>Quick Inquiry · 24/7 Verified Support</span>
          </div>

          {/* HEADING */}
          <div className="space-y-2">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight"
              style={customTextStyle}
            >
              {title}
            </h2>
            <div className="w-24 h-1.5 bg-blue-600 rounded-full" />
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Fill in your details below and our property specialist will reach out to you within minutes.
          </p>

          {/* FORM */}
          <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
            {/* NAME */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 text-lg">
                <FiUser />
              </div>
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
                placeholder="Enter Your Full Name *"
                required
                autoComplete="off"
                className="w-full bg-slate-50/80 border border-blue-600 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 pl-12 pr-5 py-3.5 rounded-xl text-sm sm:text-base outline-none transition duration-200"
              />
            </div>

            {/* EMAIL & PHONE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* EMAIL */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 text-lg">
                  <FiMail />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form?.email}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  placeholder="Your Email Address *"
                  className="w-full bg-slate-50/80 border border-blue-600 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 pl-12 pr-5 py-3.5 rounded-xl text-sm sm:text-base outline-none transition duration-200"
                />
              </div>

              {/* PHONE */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 text-lg">
                  <FiSmartphone />
                </div>
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
                  placeholder="10-Digit Phone Number *"
                  className="w-full bg-slate-50/80 border border-blue-600 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 pl-12 pr-5 py-3.5 rounded-xl text-sm sm:text-base outline-none transition duration-200"
                />
              </div>
            </div>

            {/* MESSAGE TEXTAREA */}
            <div>
              <textarea
                placeholder="Tell us what you are looking for (e.g. 2BHK flat in Govindpuram)..."
                id="discussion"
                name="discussion"
                value={form?.discussion}
                onChange={handleChange}
                rows="4"
                className="w-full bg-slate-50/80 border border-blue-600 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 p-4 rounded-xl text-sm sm:text-base outline-none transition duration-200 resize-none"
              />
            </div>

            {/* PRIVACY POLICY CHECKBOX */}
            <div className="pt-1">
              <label className="flex items-center gap-3 text-slate-600 text-xs sm:text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-medium hover:text-blue-700 transition"
                  >
                    Privacy Policy
                  </a>{" "}
                  and consent to be contacted.
                </span>
              </label>
            </div>

            {/* MESSAGE ERROR/SUCCESS FEEDBACK */}
            {message && (
              <div
                className={`text-xs font-semibold p-3 rounded-xl border ${message.includes("Thank")
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
              >
                {message}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg px-8 py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <span>SUBMIT INQUIRY</span>
                  <FiSend className="text-lg" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT SIDEBAR / VISUAL IMAGE & BRAND CONTACT INFO */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0a2342] via-[#12345e] to-[#0a2342] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-800 text-white">
          {/* IMAGE BOX */}
          <div className="relative w-full h-64 sm:h-80 lg:h-72 rounded-2xl overflow-hidden border border-white/20 shadow-xl group">
            <Image
              src={image}
              alt="Contact 18 Homes"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a2342] via-[#0a2342]/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs uppercase tracking-wider font-semibold text-blue-300">18 Homes Real Estate</p>
              <h3 className="text-lg font-bold">Your Trusted Property Partner in NCR</h3>
            </div>
          </div>

          {/* CONTACT QUICK INFO CARDS */}
          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 text-lg flex-shrink-0">
                <FiPhoneCall />
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium">Direct Call / WhatsApp</p>
                <a href="tel:+917827602246" className="text-white font-bold text-sm hover:text-blue-300 transition">
                  +91 7827602246
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 text-lg flex-shrink-0">
                <FiMail />
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium">Email Support</p>
                <a href="mailto:18homes.website@gmail.com" className="text-white font-bold text-sm hover:text-blue-300 transition">
                  18homes.website@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 text-lg flex-shrink-0">
                <FiMapPin />
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium">Head Office Location</p>
                <p className="text-slate-100 font-semibold text-xs leading-snug">
                  Kanak Farm House, GovindPuram, Ghaziabad (U.P.)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SUCCESS POPUP MODAL */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                <FiCheckCircle />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Thank You!</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your message has been received successfully. Our real estate specialist will contact you shortly.
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
