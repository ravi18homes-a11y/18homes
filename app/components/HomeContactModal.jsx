"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  FiX,
  FiUser,
  FiMail,
  FiSmartphone,
  FiHome,
  FiSend,
  FiCheckCircle,
  FiShield,
  FiPhoneCall,
  FiClock,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { tracker } from "@/lib/tracker";

export default function HomeContactModal({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checked, setChecked] = useState(true); // Default consented for convenience
  const formStartedRef = useRef(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "", // Flat type / property type
    discussion: "",
  });

  // Automatically trigger popup after ~3.5 seconds on the homepage
  useEffect(() => {
    // Check if dismissed or already submitted in this session
    try {
      const dismissed = sessionStorage.getItem("home_contact_popup_dismissed");
      const alreadySubmitted = localStorage.getItem("home_contact_popup_submitted");
      if (dismissed || alreadySubmitted) {
        return;
      }
    } catch (e) {
      // Ignore storage errors in private browsing
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      tracker.trackEvent("popup_impression", {
        metadata: { popupName: "home_inquiry_popup" },
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Listen for global custom event to open popup programmatically
  useEffect(() => {
    const handleOpen = () => {
      setSubmitted(false);
      setIsOpen(true);
    };
    window.addEventListener("open-inquiry-modal", handleOpen);
    return () => window.removeEventListener("open-inquiry-modal", handleOpen);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("home_contact_popup_dismissed", "true");
    } catch (e) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMessage("");

    if (!formStartedRef.current) {
      formStartedRef.current = true;
      tracker.trackEvent("lead_form_start", {
        metadata: { formName: "homepage_popup" },
      });
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!checked) {
      const msg = "Please accept the privacy policy to submit your inquiry.";
      toast.error(msg);
      setErrorMessage(msg);
      return;
    }

    if (!form.name.trim() || !form.phone.trim()) {
      const msg = "Please fill in all required fields (Name and Phone).";
      toast.error(msg);
      setErrorMessage(msg);
      return;
    }

    // Basic email validation (only if provided)
    if (form.email.trim()) {
      const emailRegex =
        /^(?!.*\.\.)(?!.*[_.-]{2})[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(form.email.trim())) {
        const msg = "Please enter a valid email address.";
        toast.error(msg);
        setErrorMessage(msg);
        return;
      }
    }

    // Phone validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      const msg = "Please enter a valid 10-digit mobile number.";
      toast.error(msg);
      setErrorMessage(msg);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          website: form.website || "General Inquiry",
          discussion: form.discussion.trim() || `Inquiry for ${form.website || "Property"} via Homepage Popup`,
        }),
      });

      const resData = await res.json();

      if (resData.success) {
        tracker.trackEvent("lead_submit", {
          metadata: {
            formName: "homepage_popup",
            flatType: form.website || "N/A",
          },
        });
        tracker.identify(form.email || form.phone, {
          name: form.name,
          email: form.email,
          phone: form.phone,
        });

        toast.success("Thank you! Your requirement has been sent.");
        setSubmitted(true);
        try {
          localStorage.setItem("home_contact_popup_submitted", "true");
        } catch (e) {}
      } else {
        const errorText = resData.error || "Failed to submit inquiry. Please try again.";
        toast.error(errorText);
        setErrorMessage(errorText);
      }
    } catch (err) {
      console.error("Popup contact submission error:", err);
      const errMsg = "Network error. Please check your connection and try again.";
      toast.error(errMsg);
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-auto animate-in zoom-in-95 fade-in duration-300">
        {/* HEADER BANNER */}
        <div className="relative bg-gradient-to-r from-[#0a2342] via-[#0f3460] to-[#1d4ed8] text-white p-5 sm:p-6 pb-6">
          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 border border-white/15 cursor-pointer hover:rotate-90"
          >
            <FiX className="text-xl" />
          </button>

          {/* Top Trust Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-2.5">
            <FiShield className="text-blue-300" />
            <span>18 Homes Verified Support · 0% Brokerage Assistance</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white pr-8">
            Looking for Your Dream Property?
          </h3>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Fill your details below & our dedicated property expert will call you with verified deals.
          </p>

          {/* Highlights Row */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] sm:text-xs text-blue-200">
            <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <FiClock className="text-amber-300" /> 15-Min Quick Callback
            </span>
            <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <FiPhoneCall className="text-emerald-300" /> Free Site Visits
            </span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 md:p-7 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            /* SUCCESS STATE */
            <div className="py-6 sm:py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-inner animate-in zoom-in-75 duration-300">
                <FiCheckCircle />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-extrabold text-slate-900">Inquiry Received!</h4>
                <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900">{form.name}</strong>. Our real estate specialist has received your requirements and will reach out shortly.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-1.5 text-slate-700">
                <p><strong>Mobile:</strong> +91 {form.phone}</p>
                {form.email && <p><strong>Email:</strong> {form.email}</p>}
                {form.website && <p><strong>Requirement:</strong> {form.website}</p>}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href="tel:+918796763688"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
                >
                  <FiPhoneCall />
                  <span>Call Directly Now</span>
                </a>
                <button
                  onClick={handleClose}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer"
                >
                  Done & Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* FULL NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 text-base">
                    <FiUser />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^A-Za-z ]/g, "");
                      val = val.replace(/\s{2,}/g, " ");
                      if (val.length > 0 && val.trim() === "") return;
                      setErrorMessage("");
                      setForm((prev) => ({ ...prev, name: val }));
                    }}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition duration-200"
                  />
                </div>
              </div>

              {/* PHONE & EMAIL GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* PHONE */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 text-base">
                      <FiSmartphone />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(e) => {
                        setErrorMessage("");
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setForm((prev) => ({ ...prev, phone: val }));
                      }}
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      required
                      autoComplete="tel"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition duration-200"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 text-base">
                      <FiMail />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com (optional)"
                      autoComplete="email"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* PROPERTY TYPE / REQUIREMENT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Looking For / Property Type
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 text-base pointer-events-none">
                    <FiHome />
                  </div>
                  <select
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">Select Property Type (Optional)</option>
                    <option value="1 BHK Apartment">1 BHK Apartment</option>
                    <option value="2 BHK Apartment">2 BHK Apartment</option>
                    <option value="3 BHK Apartment">3 BHK Apartment</option>
                    <option value="4+ BHK Luxury Flat">4+ BHK Luxury Flat</option>
                    <option value="Independent House / Villa">Independent House / Villa</option>
                    <option value="Commercial Shop / Office">Commercial Shop / Office</option>
                    <option value="Residential Plot / Land">Residential Plot / Land</option>
                  </select>
                </div>
              </div>

              {/* MESSAGE / DISCUSSION */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requirement Details (Budget, Location, etc.)
                </label>
                <textarea
                  name="discussion"
                  value={form.discussion}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g. Looking for a ready-to-move 2BHK flat in Govindpuram under 40 Lacs..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 text-slate-900 placeholder-slate-400 p-3 rounded-xl text-sm outline-none transition duration-200 resize-none"
                />
              </div>

              {/* PRIVACY POLICY CHECKBOX */}
              <div className="pt-0.5">
                <label className="flex items-start gap-2.5 text-slate-600 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <span>
                    I agree to the{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold underline hover:text-blue-700"
                    >
                      Privacy Policy
                    </a>{" "}
                    and consent to receive calls & messages regarding property options.
                  </span>
                </label>
              </div>

              {/* ERROR ALERT */}
              {errorMessage && (
                <div className="text-xs font-semibold p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                  {errorMessage}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition duration-300 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Inquiry...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT INQUIRY</span>
                    <FiSend className="text-base" />
                  </>
                )}
              </button>

              {/* DIRECT CALL OPTION */}
              <div className="text-center pt-1 text-xs text-slate-500">
                Prefer immediate assistance?{" "}
                <a
                  href="tel:+918796763688"
                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <FiPhoneCall className="text-xs" /> +91 8796763688
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
