"use client";
import React, { useState } from 'react';
import { Eye, EyeOff, Home, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';


export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });


  const API_BASE_URL =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    "/api/auth";
  console.log("API_BASE_URL (LoginSignComp):", API_BASE_URL);



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
        toast.error("All fields are required");
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

      console.log("Attempting register to:", `${API_BASE_URL}/register`);
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
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { success: false, message: text || response.statusText };
      }

      if (!response.ok) {
        console.error("Registration failed:", response.status, data);
        toast.error(data.message || `Request failed: ${response.status}`);
        setMessage({
          type: "error",
          text: data.message || `Request failed: ${response.status}`,
        });
        return;
      }

      if (data.success) {
        toast.success("Registration successful! Please login.");
        setMessage({
          type: "success",
          text: data.message || "Registration successful! Please login.",
        });
        // Clear form and switch to login after 2 seconds
        setTimeout(() => {
          setFormData({
            name: "",
            email: formData.email, // Keep email for login
            phone: "",
            password: "",
            confirmPassword: "",
          });
          setIsLogin(true);
          setMessage({ type: "", text: "" });
        }, 2000);
      } else {
        toast.error(data.message || "Registration failed");
        setMessage({
          type: "error",
          text: data.message || "Registration failed",
        });
      }
    } catch (error) {
      console.error("Registration/network error:", error);
      toast.error("Network error. Please try again.");
      setMessage({
        type: "error",
        text: "Network error. " + (error.message || "Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      console.log("Attempting login to:", `${API_BASE_URL}/login`);
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

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { success: false, message: text || response.statusText };
      }

      if (!response.ok) {
        // Response HTTP error (4xx/5xx) — show server message if available
        console.error("Login failed:", response.status, data);
        toast.error(data.message || `Request failed: ${response.status}`);
        setMessage({
          type: "error",
          text: data.message || `Request failed: ${response.status}`,
        });
        return;
      }

      if (data.success && data.data?.token) {
        toast.success("Login successful!");
        setMessage({
          type: "success",
          text: data.message || "Login successful!",
        });
        // Store token in localStorage
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("userData", JSON.stringify(data.data.user));
        // Redirect to dashboard or home page after 1.5 seconds
        setTimeout(() => {
          window.location.href = "/"; // Change this to your dashboard route
        }, 1500);
      } else {
        toast.error(data.message || "Login failed");
        setMessage({ type: "error", text: data.message || "Login failed" });
      }
    } catch (error) {
      // Network or parsing error
      console.error("Network/login error:", error);
      toast.error("Network error. Please try again.");
      setMessage({
        type: "error",
        text: "Network error. " + (error.message || "Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Left Side - Branding */}
        <div className="bg-gradient-to-br from-green-600 gap-[20px] to-green-800 p-12 text-white flex flex-col justify-around relative overflow-hidden">
          <button
            className="bg-[#f3bdf3] text-black p-2 cursor-pointer"
            onClick={() => router.back()}
          >
            Back
          </button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white p-2 rounded-lg">
                <Home className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold">18Homes</h1>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight">
                Your Dream
                <br />
                Home is Here
              </h2>
              <p className="text-green-100 text-lg">
                Ghaziabad | Noida Special
              </p>
              <div className="flex gap-2 mt-6">
                <div className="bg-black bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <p className="text-sm">Rent / Buy / Sell</p>
                </div>
                <div className="bg-black bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <p className="text-sm">Without Broker</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div
              className="backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20"
              style={{
                backgroundImage: `
      linear-gradient(
        rgba(0,0,0,0.6),
        rgba(0,0,0,0.6)
      ),
      url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200')
    `,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <p className="text-sm mb-2 text-green-100">
                What Our Clients Say
              </p>
              <p className="text-white italic">
                "18Homes helped us a lot in finding our dream home. It was very easy to talk directly to the landlord without a broker."
              </p>
              <p className="text-green-200 mt-3 font-semibold">Ravi Sharma</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h2>
            <p className="text-gray-600">
              {isLogin ? "Login to your account" : "Create a new account"}
            </p>
          </div>

          {/* Alert Messages */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <div className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="example@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <button
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                  // disabled={loading}
                  onClick={() => router.push("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:from-green-700 hover:to-green-800"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isLogin ? "Logging in..." : "Signing up..."}
                </span>
              ) : isLogin ? (
                "Login"
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    confirmPassword: "",
                  });
                  setMessage({ type: "", text: "" });
                }}
                className="ml-2 text-green-600 hover:text-green-700 font-semibold"
                disabled={loading}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>

          {/* <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4">
              <button 
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
