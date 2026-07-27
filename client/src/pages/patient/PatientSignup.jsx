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
        toast.error("An account with this email already exists. Login instead.");
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
      <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-[#f5f4f0] px-4 py-4">
        <div className="blob1 absolute top-0 left-0 z-0 h-full w-full opacity-100"></div>
        <div className="blob2 absolute top-20 right-70 z-0 h-full w-full opacity-100"></div>

        <div className="relative z-10 flex min-h-0 w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-lg md:h-[90vh] md:max-h-185 md:flex-row">
          <div className="relative hidden h-full shrink-0 flex-col justify-between bg-[#f4f3f1] p-10 md:flex md:w-[42%]">
            <div>
              <div className="mb-10 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b87f5] opacity-75" style={{ animationDuration: "2s" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
                </span>
                <div className="h-full w-32">
                  <img onClick={() => Navigate("/")} src={logo} alt="" className="h-5 cursor-pointer object-contain" />
                </div>
              </div>

              <h1 className="mb-4 text-2xl leading-snug font-semibold text-gray-900 xl:text-3xl">
                Healthcare at <span className="text-purple-600">your pace.</span>
              </h1>

              <p className="mb-8 text-sm leading-relaxed text-gray-500">Short, focused consultations with verified doctors. Book a slot, describe your symptoms, join the call — done.</p>

              <div className="flex flex-col items-start gap-3">
                {["Verified doctors only", "Secure payments", "No platform fee"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#707070]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#9b87f5]">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#9b87f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Mobile-only top bar */}
            <div className="flex items-center gap-2 px-6 pt-6 pb-2 md:hidden">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b87f5] opacity-75" style={{ animationDuration: "2s" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
              </span>
              <img onClick={() => Navigate("/")} src={logo} alt="" className="h-5 cursor-pointer object-contain" />
            </div>

            {/* Centered confirmation content */}
            <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10">
              <div className="w-full max-w-md">
                {/* Icon */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ede9fe]">
                  <svg className="h-6 w-6 text-[#9b87f5]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                  </svg>
                </div>

                <h2 className="mb-1 text-lg font-semibold text-gray-800">Check your inbox</h2>
                <p className="mb-6 text-xs text-gray-400">We've sent a verification link to your email</p>

                {/* Email pill */}
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2.5">
                  <svg className="h-3.5 w-3.5 shrink-0 text-[#9b87f5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span className="truncate text-sm font-medium text-gray-700">{signupInfo.email}</span>
                </div>

                <p className="mb-8 text-xs leading-relaxed text-gray-400">Click the link in the email to activate your account. If you don't see it, check your spam folder.</p>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Wrong email?{" "}
                  <span onClick={() => setEmailSent(false)} className="cursor-pointer text-purple-600 hover:underline">
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
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-[#f5f4f0] px-4 py-4">
      {/* gradient blobs */}
      <div className="blob1 absolute top-0 left-0 z-0 h-full w-full opacity-100"></div>
      <div className="blob2 absolute top-20 right-70 z-0 h-full w-full opacity-100"></div>

      {/* main container */}
      <div className="relative z-10 flex min-h-0 w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-lg md:h-[90vh] md:max-h-185 md:flex-row">
        {/* ── LEFT PANEL — hidden on mobile, shown md+ ── */}
        <div className="relative hidden h-full shrink-0 flex-col justify-between bg-[#f4f3f1] p-10 md:flex md:w-[42%]">
          <div>
            <div className="mb-10 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b87f5] opacity-75" style={{ animationDuration: "2s" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
              </span>
              <div className="h-full w-32">
                <img onClick={() => Navigate("/")} src={logo} alt="" className="h-5 cursor-pointer object-contain" />
              </div>
            </div>

            <h1 className="mb-4 text-2xl leading-snug font-semibold text-gray-900 xl:text-3xl">
              Healthcare at <span className="text-purple-600">your pace.</span>
            </h1>

            <p className="mb-8 text-sm leading-relaxed text-gray-500">Short, focused consultations with verified doctors. Book a slot, describe your symptoms, join the call — done.</p>

            <div className="flex flex-col items-start gap-3">
              {["Verified doctors only", "Secure payments", "No platform fee"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[#707070]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#9b87f5]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#9b87f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Mobile-only top bar */}
          <div className="flex items-center gap-2 px-6 pt-6 pb-2 md:hidden">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b87f5] opacity-75" style={{ animationDuration: "2s" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
            </span>
            <img onClick={() => Navigate("/")} src={logo} alt="" className="h-5 cursor-pointer object-contain" />
          </div>

          {/* Form wrapper */}
          <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="mb-4">
                <h2 className="mb-0.5 text-lg font-semibold text-gray-800">Create your account</h2>
                <p className="text-xs text-gray-400">Fill in your details to get started</p>
              </div>

              <form className="space-y-4">
                {/* ── Personal Info ── */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-1">
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        required
                        className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        name="name"
                        value={signupInfo.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      name="email"
                      value={signupInfo.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 pr-9 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      name="password"
                      value={signupInfo.password}
                      onChange={handleInputChange}
                    />
                    <span className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 transition hover:text-gray-600" onClick={() => setShowPassword((prev) => !prev)} title={showPassword ? "Hide Password" : "Show Password"}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </span>
                  </div>
                </div>

                {/* Weight + Age */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="70"
                      min={1}
                      max={300}
                      required
                      className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      name="weight"
                      value={signupInfo.weight}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Age (years)</label>
                    <input
                      type="number"
                      placeholder="22"
                      min={1}
                      max={120}
                      required
                      className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      name="age"
                      value={signupInfo.age}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* ── Profile Picture ── */}
                <div>
                  <p className="mb-2 text-[10px] font-medium tracking-widest text-gray-300 uppercase">Profile Picture</p>
                  <div className="flex items-stretch gap-3">
                    {/* avatar preview */}
                    <div onClick={() => fileRef.current.click()} className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-[#e6e6e6] bg-[#f8f8f8] transition hover:border-purple-400">
                      {preview ? (
                        <img src={preview} alt="preview" className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>

                    {/* drop zone */}
                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d6d6d6] bg-[#fafafa] py-2 transition hover:border-purple-400 hover:bg-[#f4f4f4]" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">{fileName || "Drag & drop or click"}</p>
                      </div>
                      {!fileName && <p className="mt-0.5 text-xs text-gray-400">PNG, JPG up to 5MB</p>}
                      <input ref={fileRef} type="file" accept="image/*" required className="hidden" onChange={handleFile} />
                    </label>
                  </div>
                </div>

                {/* ── Submit ── */}
                <button type="submit" className="w-full cursor-pointer rounded-lg bg-black py-3 text-sm font-medium text-white transition hover:bg-[#1a1a1a]" onClick={handleSignup}>
                  Create Account →
                </button>

                <p className="pb-2 text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <span onClick={() => Navigate("/auth/login")} className="cursor-pointer text-purple-600 hover:underline">
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
