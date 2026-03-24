import React, { useRef, useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "../../api/axios.js";

const PatientSignup = () => {
  const Navigate = useNavigate();
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [file, setFile] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
    weight: "",
    age: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a Profile Picture");
    }

    const formData = new FormData();
    formData.append("name", signupInfo.name);
    formData.append("email", signupInfo.email);
    formData.append("password", signupInfo.password);
    formData.append("weight", signupInfo.weight);
    formData.append("age", signupInfo.age);
    formData.append("image", file);

    try {
      const res = await axios.post("/auth/user/register", formData);
      // console.log(res);
      // alert("Check your email for verification!");
      setEmailSent(true);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400) {
        toast.error(
          "An account with this email already exists. Login instead.",
        );
      } else if (status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (error.request) {
        toast.error("Server unreachable. Check your connection.");
      } else {
        toast.error(message || "Something went wrong. Please try again.");
      }
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen w-screen bg-[#f5f4f0] flex items-center justify-center relative overflow-hidden py-4 px-4">
        <div className="blob1 absolute w-full h-full top-0 left-0 opacity-100 z-0"></div>
        <div className="blob2 absolute w-full h-full top-20 right-70 opacity-100 z-0"></div>

        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg flex flex-col md:flex-row relative z-10 overflow-hidden min-h-0 md:h-[90vh] md:max-h-185">
          <div className="hidden md:flex md:w-[42%] h-full bg-[#f4f3f1] p-10 flex-col justify-between relative shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-10">
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9b87f5] opacity-75"
                    style={{ animationDuration: "2s" }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
                </span>
                <div className="w-32 h-full">
                  <img
                    onClick={() => Navigate("/")}
                    src={logo}
                    alt=""
                    className="h-5 object-contain cursor-pointer"
                  />
                </div>
              </div>

              <h1 className="text-2xl xl:text-3xl font-semibold leading-snug text-gray-900 mb-4">
                Healthcare at{" "}
                <span className="text-purple-600">your pace.</span>
              </h1>

              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Short, focused consultations with verified doctors. Book a slot,
                describe your symptoms, join the call — done.
              </p>

              <div className="flex flex-col items-start gap-3">
                {[
                  "Verified doctors only",
                  "Secure payments",
                  "No platform fee",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-[#707070]"
                  >
                    <span className="flex items-center justify-center w-4 h-4 rounded-full border border-[#9b87f5]">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2.5 2.5L8 3"
                          stroke="#9b87f5"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400">CuraNova © 2025</p>
          </div>

          {/* ── RIGHT PANEL — email confirmation content ── */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Mobile-only top bar */}
            <div className="flex md:hidden items-center gap-2 px-6 pt-6 pb-2">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9b87f5] opacity-75"
                  style={{ animationDuration: "2s" }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
              </span>
              <img
                onClick={() => Navigate("/")}
                src={logo}
                alt=""
                className="h-5 object-contain cursor-pointer"
              />
            </div>

            {/* Centered confirmation content */}
            <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-6">
              <div className="w-full max-w-md">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#ede9fe] flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-[#9b87f5]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75"
                    />
                  </svg>
                </div>

                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Check your inbox
                </h2>
                <p className="text-xs text-gray-400 mb-6">
                  We've sent a verification link to your email
                </p>

                {/* Email pill */}
                <div className="flex items-center gap-2 bg-[#f8f8f8] border border-[#e6e6e6] rounded-lg px-3 py-2.5 mb-6">
                  <svg
                    className="w-3.5 h-3.5 text-[#9b87f5] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {signupInfo.email}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-8">
                  Click the link in the email to activate your account. If you
                  don't see it, check your spam folder.
                </p>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Wrong email?{" "}
                  <span
                    onClick={() => setEmailSent(false)}
                    className="text-purple-600 cursor-pointer hover:underline"
                  >
                    Go back
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#f5f4f0] flex items-center justify-center relative overflow-hidden py-4 px-4">
      {/* gradient blobs */}
      <div className="blob1 absolute w-full h-full top-0 left-0 opacity-100 z-0"></div>
      <div className="blob2 absolute w-full h-full top-20 right-70 opacity-100 z-0"></div>

      {/* main container */}
      <div
        className="w-full max-w-5xl bg-white rounded-2xl shadow-lg flex flex-col md:flex-row relative z-10 overflow-hidden
                      min-h-0 md:h-[90vh] md:max-h-185"
      >
        {/* ── LEFT PANEL — hidden on mobile, shown md+ ── */}
        <div className="hidden md:flex md:w-[42%] h-full bg-[#f4f3f1] p-10 flex-col justify-between relative shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-10">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9b87f5] opacity-75"
                  style={{ animationDuration: "2s" }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
              </span>
              <div className="w-32 h-full">
                <img
                  onClick={() => Navigate("/")}
                  src={logo}
                  alt=""
                  className="h-5 object-contain cursor-pointer"
                />
              </div>
            </div>

            <h1 className="text-2xl xl:text-3xl font-semibold leading-snug text-gray-900 mb-4">
              Healthcare at <span className="text-purple-600">your pace.</span>
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Short, focused consultations with verified doctors. Book a slot,
              describe your symptoms, join the call — done.
            </p>

            <div className="flex flex-col items-start gap-3">
              {[
                "Verified doctors only",
                "Secure payments",
                "No platform fee",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-[#707070]"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full border border-[#9b87f5]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="#9b87f5"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">CuraNova © 2025</p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Mobile-only top bar */}
          <div className="flex md:hidden items-center gap-2 px-6 pt-6 pb-2">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9b87f5] opacity-75"
                style={{ animationDuration: "2s" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
            </span>
            <img
              onClick={() => Navigate("/")}
              src={logo}
              alt=""
              className="h-5 object-contain cursor-pointer"
            />
          </div>

          {/* Form wrapper */}
          <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-6">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-0.5">
                  Create your account
                </h2>
                <p className="text-xs text-gray-400">
                  Fill in your details to get started
                </p>
              </div>

              <form className="space-y-4">
                {/* ── Personal Info ── */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-1">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                        name="name"
                        value={signupInfo.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      name="email"
                      value={signupInfo.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2 pr-9 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      name="password"
                      value={signupInfo.password}
                      onChange={handleInputChange}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition"
                      onClick={() => setShowPassword((prev) => !prev)}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </span>
                  </div>
                </div>

                {/* Weight + Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      placeholder="70"
                      min={1}
                      max={300}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      name="weight"
                      value={signupInfo.weight}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Age (years)
                    </label>
                    <input
                      type="number"
                      placeholder="22"
                      min={1}
                      max={120}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      name="age"
                      value={signupInfo.age}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* ── Profile Picture ── */}
                <div>
                  <p className="text-[10px] font-medium tracking-widest text-gray-300 uppercase mb-2">
                    Profile Picture
                  </p>
                  <div className="flex gap-3 items-stretch">
                    {/* avatar preview */}
                    <div
                      onClick={() => fileRef.current.click()}
                      className="w-14 h-14 shrink-0 rounded-xl border border-[#e6e6e6] bg-[#f8f8f8] overflow-hidden flex items-center justify-center cursor-pointer hover:border-purple-400 transition"
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* drop zone */}
                    <label
                      className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#d6d6d6] rounded-xl cursor-pointer bg-[#fafafa] hover:bg-[#f4f4f4] hover:border-purple-400 transition py-2"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                          />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">
                          {fileName || "Drag & drop or click"}
                        </p>
                      </div>
                      {!fileName && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          PNG, JPG up to 5MB
                        </p>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        required
                        className="hidden"
                        onChange={handleFile}
                      />
                    </label>
                  </div>
                </div>

                {/* ── Submit ── */}
                <button
                  type="submit"
                  className="w-full cursor-pointer bg-black text-white py-3 rounded-lg hover:bg-[#1a1a1a] transition font-medium text-sm"
                  onClick={handleSignup}
                >
                  Create Account →
                </button>

                <p className="text-center text-sm text-gray-500 pb-2">
                  Already have an account?{" "}
                  <span
                    onClick={() => Navigate("/auth/login")}
                    className="text-purple-600 cursor-pointer hover:underline"
                  >
                    Login
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;
