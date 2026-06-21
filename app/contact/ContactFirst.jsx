"use client";
import React, { useState } from "react";
import "./contact.css";
import { FaMapMarked, FaMapMarkedAlt } from "react-icons/fa";
import { FiCheckCircle, FiPhoneCall } from "react-icons/fi";
import { IoMdMailOpen } from "react-icons/io";

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
      setMessage("Please accept the privacy policy to submit the form.");
      return;
    }
    if (!form?.name || !form?.email || !form?.phone) {
      setMessage("Please fill all required fields.");
      return;
    }
    // Basic email validation
    const emailRegex =
      /^(?!.*\.\.)(?!.*[_.-]{2})[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(form?.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    // Phone validation: only digits, exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form?.phone)) {
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
        setForm({
          name: "",
          email: "",
          phone: "",
          website: "",
          discussion: "",
        });
        setChecked(false);
        setShowPopup(true); // ✅ Show popup on success
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };



  return (
    <>
      <section className="contact-wrapper">
        <div className="contact-container">
          <p className="contact-heading-top">Contact Us</p>

          <h2 className="contact-main-heading">
            <span className="pink-text">18homes</span>{" "}
             Support
          </h2>

          <div className="contact-grid">
            {/* LEFT SIDE */}
            <div className="left-info">
              <div className="info-block">
                <div className="icon-wrap">
                  <FiPhoneCall size={30} />
                </div>

                <div>
                  <p className="info-title">Call Us</p>

                 <p class="info-value">
  <a href="tel:+917827602246" class="call-to-action">+91 7827602246</a>
</p>

                </div>
              </div>

              <hr />

              <div className="info-block">
                <div className="icon-wrap">
                  <IoMdMailOpen size={30} />
                </div>

                <div>
                  <p className="info-title">Send us a message</p>

                  <p class="info-value">
  <a href="mailto:18homes.website@gmail.com" class="call-to-action">
     18homes.website@gmail.com
  </a>
</p>

                </div>
              </div>

              {/* <hr /> */}

              {/* <div className="info-block">
                <div className="icon-wrap">
                  <FaMapMarkedAlt size={30} />
                </div>

                <div>
                  <p className="info-title">Visit Our Location</p>
                  <p className="info-value">
                    MB-27 Basement, Regalia Heights, Shipra Suncity, Ghaziabad.
                  </p>
                </div>
              </div> */}
              <hr />
              {/* BOTTOM SOCIAL ICONS */}
              <div className="bottom-row">
                <div className="bottom-socials">
                  <div className="social-circle">
                    <div className="square"></div>
                  </div>

                  <div className="social-circle">
                    <div className="square"></div>
                  </div>

                  <div className="social-circle">
                    <div className="square"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT FORM */}
            <form className="right-form" onSubmit={handleSubmit}>
              <div className="input-row">
                <input
                  type="text"
                  name="name"
                  value={form?.name}
                  onChange={(e) => {
                    // Allow alphabets and spaces, but not only spaces
                    let val = e.target.value.replace(/[^A-Za-z ]/g, "");
                    // Prevent leading/trailing multiple spaces
                    val = val.replace(/\s{2,}/g, " ");
                    // Prevent only spaces
                    if (val.length > 0 && val.trim() === "") return;
                    setForm((prev) => ({ ...prev, name: val }));
                  }}
                  placeholder="Enter your name"
                  required
                  autoComplete="off"
                />
                <input
                  type="text"
                  name="phone"
                  value={form?.phone}
                  onChange={(e) => {
                    // Only allow digits
                    setMessage("");
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setForm((prev) => ({ ...prev, phone: val }));
                  }}
                  maxLength={10}
                  required
                  autoComplete="off"
                  placeholder="Enter mobile number*"
                />
              </div>

              <div className="input-row">
                <input
                  type="email"
                  name="email"
                  value={form?.email}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  placeholder="Email Address"
                />
                <input
                  type="text"
                  name="website"
                  value={form?.website}
                  onChange={handleChange}
                  placeholder="Room or Flat 1BHK/2BHK/3BHK*"
                />
              </div>

              <textarea
                rows={2}
                id="discussion"
                name="discussion"
                value={form?.discussion}
                onChange={handleChange}
                placeholder="Your message"
              ></textarea>
              {/* Privacy Policy Checkbox */}
              <div>
                <label
                  className="flex items-center"
                  style={{ fontSize: "14px" }}
                >
                  <input
                    className="!w-[20px]"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  I accept the{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    privacy policy
                  </a>
                  .
                </label>
              </div>
              {message && (
                <div
                  style={{
                    marginTop: 8,
                    color: message.includes("Thank") ? "green" : "red",
                  }}
                >
                  {message}
                </div>
              )}
              {/* BUTTON */}
              <button type="submit" className="submit-message-btn relative">
                <span className="submit-circle"></span>
                <span className=" z-50 absolute left-[32px]  ">
                  {loading ? "Sending..." : "SUBMIT MESSAGE"}
                </span>
              </button>
            </form>
          </div>
        </div>
         {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <div className="popup-icon">
                            <FiCheckCircle size={60} color="green" />
                        </div>
                        <h2>Thank You!</h2>
                        <p>Your message has been sent successfully. Our team will contact you soon.</p>
                        <button
                            className="popup-btn"
                            onClick={() => setShowPopup(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
      </section>

      {/* ================= MAP SECTION ================= */}
      {/* <section className="map-section">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28000.172833179113!2d77.47271883869992!3d28.689000340540407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cf230c51204b1%3A0xd053494ad5b99485!2sGovindpuram%2C%20Ghaziabad%2C%20Uttar%20Pradesh%20201013!5e0!3m2!1sen!2sin!4v1765114558215!5m2!1sen!2sin"
          width="100%"
          height="450"
          style={{ border: "0" }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section> */}
    </>
  );
}
