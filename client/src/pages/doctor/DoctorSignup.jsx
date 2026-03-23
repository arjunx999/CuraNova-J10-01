import React, { useRef, useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const DoctorSignup = () => {
  const Navigate = useNavigate();
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
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

  const departments = [
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Gynecology",
    "ENT",
    "Ophthalmology",
    "Urology",
    "Oncology",
    "Radiology",
    "Anesthesiology",
    "Emergency Medicine",
  ];

  return (
    <div className="min-h-screen w-screen bg-[#f5f4f0] flex items-center justify-center relative overflow-hidden py-4 px-4">
      {/* gradient blobs */}
      <div className="blob1 absolute w-full h-full top-0 left-0 opacity-100 z-0"></div>
      <div className="blob2 absolute w-full h-full top-20 right-70 opacity-100 z-0"></div>

      {/* main container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg flex flex-col md:flex-row relative z-10 overflow-hidden min-h-0 md:h-[90vh] md:max-h-185">
        {/* ── LEFT PANEL ── */}
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
              Care delivered{" "}
              <span className="text-purple-600">by the best.</span>
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Join a network of verified doctors offering short, focused
              consultations. Set your schedule, consult remotely, get paid —
              done.
            </p>

            <div className="flex flex-col items-start gap-3">
              {[
                "Zero platform fee",
                "Flexible consultation slots",
                "Instant secure payouts",
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
              <form className="space-y-3">
                {/* ── Basic Info ── */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Dr. John Doe"
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      />
                    </div>
                    <div className="relative">
                      <label className="text-xs text-gray-500 block mb-1">
                        Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2 pr-9 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      />
                      <span
                        className="absolute right-3 top-[68%] -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition"
                        onClick={() => setShowPassword((prev) => !prev)}
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                    />
                  </div>
                </div>

                {/* ── Professional Details ── */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Degrees
                      </label>
                      <input
                        type="text"
                        name="degrees"
                        placeholder="MBBS, MD"
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Department
                      </label>
                      <select
                        name="department"
                        required
                        defaultValue=""
                        className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition text-gray-500"
                      >
                        <option value="" disabled>
                          Select dept.
                        </option>
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Hospital Name
                      </label>
                      <input
                        type="text"
                        name="hospital_name"
                        placeholder="City Hospital"
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Consultation Fee (₹)
                      </label>
                      <input
                        type="number"
                        name="consultation_fee"
                        placeholder="500"
                        min={1}
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      About
                    </label>
                    <textarea
                      name="about"
                      placeholder="Brief bio — specialization, experience, approach..."
                      required
                      rows={2}
                      className="w-full px-3 py-3 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition resize-none"
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
                >
                  Register as Doctor →
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

export default DoctorSignup;
