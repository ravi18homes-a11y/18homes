
"use client";
import Image from "next/image";
import "./contactpop.css"
import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { toast } from "react-hot-toast";

export default function ContactSection({ data }) {
  const title = data?.title || "Please tell us your requirements";
  const image = data?.image || "https://res.cloudinary.com/dxlykgx6w/image/upload/v1765125152/WhatsApp_Image_2025-12-07_at_9.01.16_PM_fuflru.jpg";

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
        setShowPopup(true); // ✅ Show popup on success
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
    <section className="w-full max-w-[1720px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT SECTION */}
       <div className="px-8 md:px-20 py-8 flex flex-col justify-center" style={{ backgroundColor: "#1D1D1D", ...customBgStyle }}>
          <h2 className="text-[48px] font-light mb-2" style={{ color: "white", ...customTextStyle }}>{title}</h2>
          <div className="w-[120px] h-[4px] bg-[#28E7F7] mb-6"></div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
              placeholder="Enter Name*"
              required
              autoComplete="off"
              className="w-full border-2 border-white bg-transparent px-5 py-3 rounded-md text-lg outline-none "
            />

            <input
              type="email"
              name="email"
              value={form?.email}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder="Enter your email"
              className="w-full border-2 border-white bg-transparent px-5 py-3 rounded-md text-lg outline-none "
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
              className="w-full border-2 border-white bg-transparent px-5 py-3 rounded-md text-lg outline-none "
            />

            <div className="relative">
              <select
                name="website"
                value={form?.website}
                onChange={handleChange}
                className="w-full border-2 border-white bg-transparent px-5 py-3 rounded-md text-lg outline-none appearance-none text-[gray]"
              >
                <option value="" disabled className="text-[gray]">
                  Select Room or Flat 1BHK/2BHK/3BHK*
                </option>
                <option value="1RK Flat" className="text-black">
                  1RK Flat
                </option>
                <option value="1BHK Flat" className="text-black">
                  1BHK Flat
                </option>
                <option value="2BHK Flat" className="text-black">
                  2BHK Flat
                </option>
              </select>

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">
                <IoIosArrowDown />
              </span>
            </div>

            <textarea
              placeholder="Write your message"
              id="discussion"
              name="discussion"
              value={form?.discussion}
              onChange={handleChange}
              rows="4"
              className="w-full border-2 border-white bg-transparent px-5 py-4 rounded-md text-lg outline-none resize-none "
            />
            <div>
              <label className="flex items-center" style={{ fontSize: "14px" }}>
                <input
                  className="!w-[20px]"
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                I accept the {" "}
                <a href="/" target="_blank" rel="noopener noreferrer">
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
            <button
              type="submit"
              className="bg-[#28E7F7] text-black px-10 py-2.5 rounded-full text-xl font-semibold hover:opacity-90 transition w-fit"
            >
              {loading ? "Sending..." : "SUBMIT"}
            </button>
          </form>
        </div>

        {/* RIGHT IMAGE SECTION */}
        <div className="bg-[#14253e] relative hidden lg:block overflow-hidden">

          {/* <div className="absolute top-0 left-0 w-full h-[5px] z-30"></div> */}

          <div className="absolute inset-0 origin-top-left ">
            <Image
              src={image}
              alt="Contact Image"
              fill
              className="object-contain"
            />
          </div>

          <div className="absolute inset-0 backdrop-blur-[1px] z-20"></div>
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
      </div>
    </section>
  );
}
