"use client";
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Home,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Building2,
  Briefcase,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // OTP Verification States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Selected Role for Registration (Default: 'user')
  const [selectedRole, setSelectedRole] = useState("user");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Resend OTP Countdown Timer Effect
  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);


  const API_BASE_URL =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    "/api/auth";

  const rolesConfig = [
    {
      id: "user",
      title: "Normal User",
      subtitle: "Buy & View Properties",
      icon: User,
      color: "from-blue-500 to-indigo-600",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Search homes, save wishlists, contact sellers directly.",
    },
    {
      id: "owner",
      title: "Property Owner",
      subtitle: "Buy & Sell Home",
      icon: Home,
      color: "from-emerald-500 to-teal-600",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "List properties directly, manage leads & edit profile.",
    },
    {
      id: "builder",
      title: "Builder / Developer",
      subtitle: "Projects & Commercial",
      icon: Building2,
      color: "from-purple-500 to-pink-600",
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
      description: "Showcase housing projects, RERA details & get verified.",
    },
    {
      id: "dealer",
      title: "Dealer / Agent",
      subtitle: "Agent & Broker Services",
      icon: Briefcase,
      color: "from-amber-500 to-orange-600",
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Manage client portfolios, post listings & request leads.",
    },
  ];


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage({ type: "", text: "" });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error("Email and Password are required");
      setMessage({ type: "error", text: "Email and Password are required" });
      return false;
    }

    if (!isLogin) {
      if (!formData.name || !formData.phone) {
        toast.error("All fields are required for Sign Up");
        setMessage({ type: "error", text: "All fields are required" });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        setMessage({ type: "error", text: "Passwords do not match" });
        return false;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setMessage({
          type: "error",
          text: "Password must be at least 6 characters long",
        });
        return false;
      }
    }
    return true;
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Registration failed");
        setMessage({
          type: "error",
          text: data.message || "Registration failed",
        });
        return;
      }

      if (data.data?.requiresVerification) {
        toast.success("OTP sent to your email! Please enter it to verify your account.");
        setOtpEmail(formData.email);
        setOtpCode("");
        setIsOtpStep(true);
        setResendCooldown(60);
        setMessage({
          type: "success",
          text: `An OTP has been sent to ${formData.email}. Please enter the 6-digit OTP code below to verify your account.`,
        });
        return;
      }

      toast.success(
        selectedRole === "builder" || selectedRole === "dealer"
          ? "Account registered! Pending admin verification."
          : "Registration successful! Please login."
      );
      setMessage({
        type: "success",
        text: data.message || "Registration successful! Please login.",
      });

      setTimeout(() => {
        setIsLogin(true);
        setMessage({ type: "", text: "" });
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please try again.");
      setMessage({
        type: "error",
        text: "Network error. " + (error.message || "Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      setMessage({ type: "error", text: "Please enter a valid 6-digit OTP code" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: otpEmail,
          otp: otpCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "OTP verification failed");
        setMessage({
          type: "error",
          text: data.message || "OTP verification failed",
        });
        return;
      }

      toast.success("Email verified successfully!");
      setMessage({
        type: "success",
        text: "Email verified successfully! Please sign in with your password.",
      });

      setTimeout(() => {
        setIsOtpStep(false);
        setIsLogin(true);
        setFormData((prev) => ({ ...prev, email: otpEmail }));
        setMessage({
          type: "success",
          text: "Email verified successfully! Please enter your password to sign in.",
        });
      }, 1200);
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Network error. Please try again.");
      setMessage({
        type: "error",
        text: "Network error. " + (error.message || "Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      setResendLoading(true);
      setMessage({ type: "", text: "" });

      const response = await fetch(`${API_BASE_URL}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: otpEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to resend OTP");
        setMessage({ type: "error", text: data.message || "Failed to resend OTP" });
        return;
      }

      toast.success("A new OTP has been sent to your email!");
      setMessage({
        type: "success",
        text: `A new 6-digit OTP has been sent to ${otpEmail}.`,
      });
      setResendCooldown(60);
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.data?.token) {
        if (
          data.data?.requiresVerification ||
          (data.message && data.message.toLowerCase().includes("not verified"))
        ) {
          toast.error("Email not verified! Please enter the OTP sent to your email.");
          setOtpEmail(data.data?.email || formData.email);
          setOtpCode("");
          setIsOtpStep(true);
          setResendCooldown(60);
          setMessage({
            type: "error",
            text: "Your email is not verified yet. Please enter the OTP sent to your email.",
          });
          return;
        }

        toast.error(data.message || "Login failed");
        setMessage({ type: "error", text: data.message || "Login failed" });
        return;
      }

      toast.success("Login successful!");
      setMessage({
        type: "success",
        text: data.message || "Login successful!",
      });

      const loggedUser = data.data.user;
      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("userData", JSON.stringify(loggedUser));

      // Fetch fresh profile with planRules to see if they are dealer/builder on Free tier
      const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";
      let planName = "Free";
      try {
        const profileRes = await fetch(`${databaseUrl}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${data.data.token}` }
        });
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          if (profileJson.success && profileJson.data) {
            localStorage.setItem("userData", JSON.stringify(profileJson.data));
            planName = profileJson.data.planName || "Free";
          }
        }
      } catch (err) {
        console.error("Failed to query user profile details on login:", err);
      }

      // Dispatch storage event so navbar updates
      window.dispatchEvent(new Event("storage"));

      setTimeout(() => {
        const freshUserStr = localStorage.getItem("userData");
        let freshUser = loggedUser;
        if (freshUserStr) {
          try { freshUser = JSON.parse(freshUserStr); } catch (e) {}
        }
        
        const isDealerOrBuilder = ["dealer", "builder"].includes(freshUser.role);
        const hasNoPaidPlan = isDealerOrBuilder && (freshUser.planName === "Free" || !freshUser.subscription);

        if (freshUser.role === "admin") {
          window.location.href = "/admin";
        } else {
          let targetUrl = "/";
          if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const redirectParam = searchParams.get("redirect");
            if (redirectParam) {
              targetUrl = redirectParam;
            } else if (localStorage.getItem("pendingSellFormData")) {
              targetUrl = "/sell";
            }
          }
          window.location.href = targetUrl;
        }
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.");
      setMessage({
        type: "error",
        text: "Network error. " + (error.message || "Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 relative overflow-hidden">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 grid lg:grid-cols-12 relative z-10">
        
        {/* Left Side Banner (5 cols) */}
        <div className="lg:col-span-5 order-1 bg-gradient-to-br from-[#8c4bdc] via-[#7b3ac5] to-[#c04b7e] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <button
            onClick={() => router.back()}
            className="self-start bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full transition backdrop-blur-md flex items-center gap-2 cursor-pointer mb-6"
          >
            ← Back to Site
          </button>

          <div className="my-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 shadow-lg">
                <Home className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight">18Homes</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                Find & Manage <br />
                <span className="text-pink-200">Your Perfect Property</span>
              </h1>
              <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                Delhi NCR & Noida's premier verified real estate portal for Buyers, Owners, Builders, & Agents.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-sm bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <ShieldCheck className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span>Verified Builder & Dealer Accounts</span>
              </div>
              <div className="flex items-center gap-3 text-sm bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <UserCheck className="w-5 h-5 text-purple-200 flex-shrink-0" />
                <span>Role-Based Dashboards & Access</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 text-xs text-purple-200 flex items-center justify-between">
            <span>© 2026 18Homes.in</span>
            <span>Trusted Real Estate Portal</span>
          </div>
        </div>

        {/* Right Side Form (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white">
          
          {isOtpStep ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsOtpStep(false);
                  setMessage({ type: "", text: "" });
                }}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-6 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {isLogin ? "Sign In" : "Sign Up"}
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 bg-purple-100 text-[#8c4bdc] rounded-2xl flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Verify Email OTP
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter the 6-digit OTP code sent to{" "}
                  <span className="font-semibold text-slate-900">{otpEmail}</span>
                </p>
              </div>

              {/* Alert Message Banner */}
              {message.text && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-start gap-3 border text-sm ${
                    message.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    6-Digit One-Time Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 123456"
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-center tracking-[8px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-gradient-to-r from-[#8c4bdc] to-[#c04b7e] hover:from-[#7b3ac5] hover:to-[#ae3a6d] text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg hover:shadow-xl transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying OTP...</span>
                  ) : (
                    <>
                      <span>Verify Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="font-bold text-[#8c4bdc] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : resendLoading
                    ? "Resending..."
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Login / Signup Toggle Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setMessage({ type: "", text: "" });
                  }}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition duration-200 cursor-pointer ${
                    isLogin
                      ? "bg-white text-[#8c4bdc] shadow-md"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setMessage({ type: "", text: "" });
                  }}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition duration-200 cursor-pointer ${
                    !isLogin
                      ? "bg-[#8c4bdc] text-white shadow-md"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {isLogin ? "Welcome Back!" : "Register on 18Homes"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {isLogin
                    ? "Enter your credentials to access your account dashboard."
                    : "Select your role and create a new account."}
                </p>
              </div>

              {/* Alert Message Banner */}
              {message.text && (
                <div
                  className={`mb-6 p-4 rounded-xl flex items-start gap-3 border text-sm ${
                    message.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* ROLE SELECTION GRID (Visible on Sign Up) */}
              {!isLogin && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Select Your Account Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {rolesConfig.map((r) => {
                      const IconComp = r.icon;
                      const isSelected = selectedRole === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setSelectedRole(r.id)}
                          className={`p-3.5 rounded-2xl border-2 transition duration-200 cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-[#8c4bdc] bg-purple-50/50 shadow-md ring-2 ring-[#8c4bdc]/20"
                              : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${r.color}`}
                            >
                              <IconComp className="w-5 h-5" />
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-[#8c4bdc]" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {r.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {r.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FORM INPUTS */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#8c4bdc] border-slate-300 rounded focus:ring-[#8c4bdc]"
                      />
                      <span className="ml-2 text-xs text-slate-600">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => router.push("/forgot-password")}
                      className="text-xs text-[#8c4bdc] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-[#8c4bdc] to-[#c04b7e] hover:from-[#7b3ac5] hover:to-[#ae3a6d] text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg hover:shadow-xl transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : isLogin ? (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Complete Sign Up ({rolesConfig.find(r => r.id === selectedRole)?.title})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

