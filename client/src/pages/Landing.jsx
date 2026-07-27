import React from "react";
import logo from "../assets/logo.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const patientSteps = [
  {
    num: "01",
    title: "Find your doctor",
    desc: "Search by specialty or name. Filter by availability and rating.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="22" y2="22" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Book & pay",
    desc: "Pick a slot and pay instantly. Your spot is locked in real-time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Describe symptoms",
    desc: "Type your symptoms. AI summarizes them for your doctor before the call.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <line x1="4" y1="8" x2="20" y2="8" />
        <line x1="4" y1="12" x2="16" y2="12" />
        <line x1="4" y1="16" x2="12" y2="16" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Join your consult",
    desc: "Video call launches directly from your dashboard at appointment time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M3 18s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
  },
];

const doctorSteps = [
  {
    num: "01",
    title: "Create your profile",
    desc: "Get verified, set specialties, and define your availability.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Open your slots",
    desc: "List available times. Patients book and pay directly — no admin work.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Review AI brief",
    desc: "See the patient's symptom summary before the call starts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <line x1="4" y1="8" x2="20" y2="8" />
        <line x1="4" y1="12" x2="16" y2="12" />
        <line x1="4" y1="16" x2="12" y2="16" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Join session",
    desc: "Video call launches directly from your dashboard at appointment time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <polyline points="16 2 12 7 8 2" />
      </svg>
    ),
  },
];

const Landing = () => {
  const [tab, setTab] = useState("patients");
  const [animKey, setAnimKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const pillRef = useRef(null);
  const btnP = useRef(null);
  const btnD = useRef(null);
  const Navigate = useNavigate();

  const movePill = (t) => {
    const btn = t === "patients" ? btnP.current : btnD.current;
    if (!btn || !pillRef.current) return;
    pillRef.current.style.width = btn.offsetWidth + "px";
    pillRef.current.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
  };

  useEffect(() => {
    movePill("patients");
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const steps = tab === "patients" ? patientSteps : doctorSteps;

  return (
    <div className="relative flex min-h-screen w-screen flex-col overflow-x-hidden bg-[#f5f4f0]">
      {/* blobs */}
      <div className="blob1 absolute top-0 left-0 z-0 h-full w-full opacity-50"></div>
      <div className="blob2 absolute top-25 -left-35 z-0 h-[50%] w-[50%] opacity-40"></div>

      {/* navbar */}
      <div className="z-50 flex h-[9vh] w-full items-center justify-between px-[4vw] md:px-[3vw]">
        {/* logo */}
        <div className="h-full w-[32vw] sm:w-[22vw] md:w-[13vw]">
          <img src={logo} alt="" className="h-full w-full scale-95 object-contain" />
        </div>

        {/* desktop nav links */}
        <div className="hidden h-full items-center justify-between pt-2 text-sm text-[#646464] md:flex">
          <button onClick={() => scrollTo("how-it-works")} className="cursor-pointer rounded-full px-4 py-2 transition-all duration-300 hover:bg-white hover:text-black">
            How it works
          </button>
          <button onClick={() => scrollTo("benefits")} className="cursor-pointer rounded-full px-4 py-2 transition-all duration-300 hover:bg-white hover:text-black">
            Benefits
          </button>
          <button onClick={() => scrollTo("features")} className="cursor-pointer rounded-full px-4 py-2 transition-all duration-300 hover:bg-white hover:text-black">
            Features
          </button>
          <button onClick={() => scrollTo("use-cases")} className="cursor-pointer rounded-full px-4 py-2 transition-all duration-300 hover:bg-white hover:text-black">
            Use cases
          </button>
        </div>

        {/* desktop cta */}
        <div className="hidden h-full items-center justify-center gap-x-2 pt-2 md:flex">
          <button onClick={() => Navigate("/auth/login")} className="cursor-pointer rounded-full px-4 py-2 text-sm text-[#515151] transition-all duration-300 hover:text-black">
            Login
          </button>
          <button onClick={() => Navigate("/auth/patient/signup")} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-4.5 py-2 text-sm text-white transition-all duration-300 hover:bg-zinc-700">
            Find a doctor<span>→</span>
          </button>
        </div>

        {/* mobile hamburger */}
        <button className="z-50 flex cursor-pointer flex-col gap-1.5 p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}></span>
          <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`block h-0.5 w-5 bg-gray-700 transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}></span>
        </button>
      </div>

      {/* mobile menu dropdown */}
      {menuOpen && (
        <div className="z-40 flex w-full flex-col gap-2 border-b border-gray-100 bg-white px-6 py-4 text-sm text-[#646464] md:hidden">
          <button onClick={() => scrollTo("how-it-works")} className="py-2 text-left hover:text-black">
            How it works
          </button>
          <button onClick={() => scrollTo("benefits")} className="py-2 text-left hover:text-black">
            Benefits
          </button>
          <button onClick={() => scrollTo("features")} className="py-2 text-left hover:text-black">
            Features
          </button>
          <button onClick={() => scrollTo("use-cases")} className="py-2 text-left hover:text-black">
            Use cases
          </button>
          <div className="mt-1 flex gap-3 border-t border-gray-100 pt-2">
            <button onClick={() => Navigate("/auth/login")} className="text-sm text-[#515151]">
              Login
            </button>
            <button onClick={() => Navigate("/auth/patient/signup")} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white">
              Find a doctor<span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* hero section */}
      <div className="z-10 flex min-h-[88vh] w-full items-center justify-start">
        <div className="flex h-[80%] w-full flex-col items-start justify-center gap-y-[3vh] px-[6vw] md:w-[70%] md:gap-y-[4vh] md:pr-0 md:pl-[8vw]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#9b87f53e] bg-[#F5F4F0] px-4 py-2 text-xs font-medium tracking-wide text-[#444]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b87f5] opacity-75" style={{ animationDuration: "2s" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
            </span>
            Book a consultation today
          </div>

          <h1 className="text-4xl leading-tight font-bold sm:text-5xl md:text-6xl">
            Healthcare that <br />
            moves at <span className="text-[#7c5ce8]">your pace</span>
          </h1>

          <p className="text-sm text-zinc-700 md:text-base">Short, focused consultations with verified doctors. Book a slot, describe your symptoms, join the call — done.</p>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8">
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

          <div className="flex items-center gap-x-3">
            <button onClick={() => Navigate("/auth/patient/signup")} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-4.5 py-2 text-sm text-white transition-all duration-300 hover:bg-zinc-700">
              Find a doctor<span>→</span>
            </button>
            <button onClick={() => Navigate("/auth/doctor/signup")} className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-zinc-200 bg-white px-4.5 py-2 text-sm text-[#515151] transition-all duration-300 hover:border-[#9b87f53e] hover:text-[#7c5ce8]">
              Are you a doctor<span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* bento grid */}
      <div className="w-full px-4 sm:px-8 md:px-26">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {/* Big card */}
          <div className="z-10 flex transform-gpu flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 ease-in hover:scale-[1.003] hover:shadow-[0_10px_60px_rgba(0,0,0,0.07)] sm:col-span-2">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-widest text-[#9b87f5] uppercase">Why Curanova</p>
              <h2 className="mb-3 font-serif text-2xl leading-tight font-bold text-gray-900 md:text-3xl">
                Less waiting.
                <br />
                More living.
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-gray-400">The average clinic visit takes 2 hours for a 10-minute consult. We fixed that.</p>
            </div>
            <div>
              <hr className="mt-4 mb-4 border-gray-300" />
              <div className="flex flex-wrap items-end gap-6 md:gap-10">
                <div>
                  <p className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">10min</p>
                  <p className="mt-1 text-[10px] tracking-widest text-gray-400 uppercase">Avg Consult</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">&lt; 3min</p>
                  <p className="mt-1 text-[10px] tracking-widest text-gray-400 uppercase">To Book</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">100%</p>
                  <p className="mt-1 text-[10px] tracking-widest text-gray-400 uppercase">Verified Doctors</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI triage */}
          <div className="z-10 flex transform-gpu flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 ease-in hover:scale-[1.003] hover:shadow-[0_10px_60px_rgba(0,0,0,0.07)]">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#ede9fe]">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#9b87f5] opacity-20" style={{ animationDuration: "2.5s" }} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="mt-6">
              <h3 className="mb-2 font-serif text-xl font-bold text-gray-900 md:text-2xl">
                AI triage,
                <br />
                before you arrive
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">Symptoms summarized by AI, shared with your doctor before the call.</p>
            </div>
          </div>

          {/* Patients & Doctors */}
          <div className="z-10 transform-gpu rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 ease-in hover:scale-[1.003] hover:shadow-[0_10px_60px_rgba(0,0,0,0.07)]">
            <p className="mb-2 text-xs font-semibold tracking-widest text-[#9b87f5] uppercase">Works For</p>
            <h3 className="mb-4 font-serif text-lg font-bold text-gray-900 md:text-xl">
              Patients &<br />
              Doctors
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Quick consults", active: true },
                { label: "Prescriptions", active: true },
                { label: "Follow-ups", active: false },
                { label: "Slot earnings", active: false },
              ].map(({ label, active }) => (
                <span key={label} className={`rounded-full border px-3 py-1 text-xs ${active ? "border-[#9b87f5] text-[#9b87f5]" : "border-gray-200 text-gray-400"}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Chat & video */}
          <div className="z-10 flex transform-gpu flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 ease-in hover:scale-[1.003] hover:shadow-[0_10px_60px_rgba(0,0,0,0.07)]">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-widest text-[#9b87f5] uppercase">Real-Time</p>
              <h3 className="mb-2 font-serif text-lg font-bold text-gray-900 md:text-xl">
                Chat & video
                <br />
                built in
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">Text before, video during. No third-party apps.</p>
            </div>
          </div>

          {/* Payments */}
          <div className="z-10 transform-gpu rounded-2xl border border-[#d4c9fb] bg-[#ede9fe] p-6 transition-all duration-200 ease-in hover:scale-[1.003] hover:shadow-[0_10px_60px_rgba(0,0,0,0.07)]">
            <p className="mb-2 text-xs font-semibold tracking-widest text-[#9b87f5] uppercase">Secure</p>
            <h3 className="mb-2 font-serif text-lg font-bold text-gray-900 md:text-xl">
              Payments
              <br />
              handled
            </h3>
            <p className="text-sm leading-relaxed text-[#6d4fc9]">Pay per consult. Doctors get paid instantly after booking.</p>
          </div>
        </div>
      </div>

      {/* divider1 */}
      <div className="mx-auto my-15 h-[0.5px] w-[85%] bg-[#6d4fc9] shadow-[0_10px_60px_rgba(0,0,0,0.07)]"></div>

      {/* how it works */}
      <div id="how-it-works" className="z-10 flex min-h-[88vh] w-full flex-col items-start justify-start px-4 sm:px-8 md:px-26">
        <div className="flex w-full flex-col items-start justify-center gap-y-[1.5vh] md:w-[70%]">
          <p className="mb-2 text-xs font-semibold tracking-widest text-[#9b87f5] uppercase">HOW IT WORKS?</p>
          <h1 className="text-2xl font-bold md:text-3xl">
            Simple for <span className="text-[#7c5ce8]">everyone</span>
          </h1>
          <p className="text-sm text-zinc-500 md:text-base">Two sides, one seamless experience. See how it works for you.</p>
        </div>

        <div className="hiw-toggle mt-[5vh]">
          <div className="hiw-pill" ref={pillRef} />
          <button
            ref={btnP}
            className={`hiw-btn ${tab === "patients" ? "hiw-btn--on" : ""}`}
            onClick={() => {
              setTab("patients");
              setAnimKey((k) => k + 1);
              movePill("patients");
            }}
          >
            For Patients
          </button>
          <button
            ref={btnD}
            className={`hiw-btn ${tab === "doctors" ? "hiw-btn--on" : ""}`}
            onClick={() => {
              setTab("doctors");
              setAnimKey((k) => k + 1);
              movePill("doctors");
            }}
          >
            For Doctors
          </button>
        </div>

        <div key={animKey} className="hiw-grid mt-[3vh] grid grid-cols-1 divide-y md:grid-cols-2 md:gap-4 md:divide-y-0 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="hiw-card border-l-2 border-[#9b87f5] py-6 pl-4 md:border-0 md:py-0 md:pl-0" style={{ "--i": i }}>
              <span className="hiw-num">{s.num}</span>
              <div className="hiw-icon">{s.icon}</div>
              <p className="hiw-title">{s.title}</p>
              <p className="hiw-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* divider2 */}
      <div className="mx-auto my-15 h-[0.5px] w-[85%] bg-[#6d4fc9] shadow-[0_10px_60px_rgba(0,0,0,0.07)]"></div>

      {/* benefits */}
      <div id="benefits" className="z-10 flex min-h-[88vh] w-full flex-col items-start justify-start px-4 sm:px-8 md:px-26">
        <div className="flex w-full flex-col items-start justify-center gap-y-[1.5vh] md:w-[70%]">
          <p className="mb-2 text-xs font-semibold tracking-widest text-[#9b87f5] uppercase">Benefits</p>
          <h1 className="text-2xl font-bold md:text-3xl">
            Good for <span className="text-[#7c5ce8]">everyone</span> <br />
            in the room
          </h1>
          <p className="text-sm text-zinc-500 md:text-base">Whether you're the patient or the doctor, CuraNova gives you more of what matters.</p>
        </div>

        <div className="wcu-grid mt-[5vh]">
          <div className="wcu-card border">
            <span className="wcu-tag">FOR PATIENTS</span>
            <p className="wcu-title">Save hours, not minutes</p>
            <p className="wcu-desc">No commute, no waiting room, no wasted afternoon. A 15-minute consult takes 15 minutes.</p>
          </div>
          <div className="wcu-card border">
            <span className="wcu-tag">FOR DOCTORS</span>
            <p className="wcu-title">Monetize your free time</p>
            <p className="wcu-desc">Open slots you already have. Earn from consultations you'd otherwise miss.</p>
          </div>
          <div className="wcu-card border">
            <span className="wcu-tag">FOR PATIENTS</span>
            <p className="wcu-title">Always know what to expect</p>
            <p className="wcu-desc">Fixed, transparent pricing. No surprise bills. Pay once, consult confidently.</p>
          </div>
          <div className="wcu-card wcu-card--purple border">
            <span className="wcu-tag">FOR DOCTORS</span>
            <p className="wcu-title">Walk in prepared</p>
            <p className="wcu-desc">AI-generated symptom summaries mean you know what the consult is about before it starts.</p>
          </div>
          <div className="wcu-card border">
            <span className="wcu-tag">FOR EVERYONE</span>
            <p className="wcu-title">Real-time communication</p>
            <p className="wcu-desc">Text before and after. Video during. Everything in one place, no app switching.</p>
          </div>
          <div className="wcu-card border">
            <span className="wcu-tag">FOR EVERYONE</span>
            <p className="wcu-title">Zero admin overhead</p>
            <p className="wcu-desc">Scheduling, payments, and records handled automatically. Focus on the consultation.</p>
          </div>
        </div>
      </div>

      {/* divider3 */}
      <div className="mx-auto my-15 h-[0.5px] w-[85%] bg-[#6d4fc9] shadow-[0_10px_60px_rgba(0,0,0,0.07)]"></div>

      {/* features */}
      <div id="features" className="z-10 flex min-h-[88vh] w-full flex-col items-start justify-start px-4 sm:px-8 md:px-26">
        <div className="flex w-full flex-col items-start justify-center gap-y-[1.5vh] md:w-[70%]">
          <p className="mb-2 text-xs font-semibold tracking-widest text-[#9b87f5] uppercase">FEATURES</p>
          <h1 className="text-2xl font-bold md:text-3xl">
            Everything the <span className="text-[#7c5ce8]">consult needs</span>
          </h1>
          <p className="text-sm text-zinc-500 md:text-base">Built for the full flow — from booking to billing, nothing bolted on.</p>
        </div>

        <div className="mt-[5vh] grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              title: "AI symptom triage",
              desc: "Patient inputs symptoms, AI creates a structured summary the doctor sees before joining.",
              icon: (
                <>
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="16" x2="12" y2="16" />
                </>
              ),
            },
            {
              title: "Real-time chat",
              desc: "Message your doctor before and after consultations.",
              icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
            },
            {
              title: "Video consultations",
              desc: "WebRTC-powered calls that launch directly from your dashboard at appointment time.",
              icon: (
                <>
                  <rect x="2" y="7" width="15" height="10" rx="2" />
                  <polyline points="17 9 22 6 22 18 17 15" />
                </>
              ),
            },
            {
              title: "Prescriptions",
              desc: "Doctors issue digital prescriptions post-consult, delivered directly to the patient.",
              icon: (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </>
              ),
            },
            {
              title: "Instant payments",
              desc: "Razorpay-powered checkout with real-time slot locking. Doctors paid immediately after.",
              icon: (
                <>
                  <polyline points="17 11 12 6 7 11" />
                  <line x1="12" y1="6" x2="12" y2="18" />
                </>
              ),
            },
            {
              title: "Smart scheduling",
              desc: "Slot availability managed in real-time. No double bookings, no manual calendars.",
              icon: (
                <>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </>
              ),
            },
          ].map((f) => (
            <div key={f.title} className="transform-gpu rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-200 ease-in hover:scale-[1.003] hover:shadow-[0_10px_60px_rgba(0,0,0,0.07)]">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#ede9fe]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9b87f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  {f.icon}
                </svg>
              </div>
              <p className="mb-2 text-base font-semibold text-gray-900">{f.title}</p>
              <p className="text-sm leading-relaxed text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* divider4 */}
      <div className="mx-auto mt-15 mb-15 h-[0.5px] w-[85%] bg-[#6d4fc9] shadow-[0_10px_60px_rgba(0,0,0,0.07)] lg:mt-0"></div>

      {/* use cases */}
      <div id="use-cases" className="z-10 flex min-h-[88vh] w-full flex-col items-start justify-start px-4 sm:px-8 md:px-26">
        <div className="flex w-full flex-col items-start justify-center gap-y-[1.5vh] md:w-[70%]">
          <p className="mb-2 text-xs font-semibold tracking-widest text-[#9b87f5] uppercase">USE CASES</p>
          <h1 className="text-2xl font-bold md:text-3xl">
            Real situations, <br />
            <span className="text-[#7c5ce8]">real value</span>
          </h1>
          <p className="text-sm text-zinc-500 md:text-base">Not hypothetical. These are the exact moments CuraNova was built for.</p>
        </div>

        <div className="mt-[5vh] grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              num: "01",
              tag: "Patient",
              title: "Quick fever check",
              desc: "Woke up with a fever at 8am. Booked a slot, joined a call by 8:20, had a prescription by 8:35.",
              accent: false,
            },
            {
              num: "02",
              tag: "Patient",
              title: "Prescription refill",
              desc: "Ran out of a regular medication. Quick consult, same prescription, no clinic visit needed.",
              accent: false,
            },
            {
              num: "03",
              tag: "Patient",
              title: "Post-treatment follow-up",
              desc: "Recovery check-in with the same doctor, without commuting back to the clinic.",
              accent: false,
            },
            {
              num: "04",
              tag: "Doctor",
              title: "Earning from free slots",
              desc: "3 free slots between rounds. Opened them on CuraNova — all three filled by noon.",
              accent: false,
            },
            {
              num: "05",
              tag: "Doctor",
              title: "Remote consulting",
              desc: "Consulting patients from home on off days. Full platform, no extra setup required.",
              accent: false,
            },
            {
              num: "06",
              tag: "Both",
              title: "Second opinions",
              desc: "Patient wants clarity on a diagnosis. Doctor gets a structured brief before the 15-minute call.",
              accent: true,
            },
          ].map((c) => (
            <div key={c.num} className={`relative transform-gpu overflow-hidden rounded-2xl border p-8 transition-all duration-200 ease-in hover:scale-[1.003] hover:shadow-[0_10px_60px_rgba(0,0,0,0.07)] ${c.accent ? "border-[#d4c9fb] bg-[#ede9fe]" : "border-gray-200 bg-white"}`}>
              <span className={`pointer-events-none absolute top-3 right-5 text-[64px] leading-none font-bold select-none ${c.accent ? "text-[#d4c9fb]" : "text-gray-100"}`} style={{ zIndex: 10 }}>
                {c.num}
              </span>
              <div style={{ position: "relative", zIndex: 20 }}>
                <p className="mb-2 text-xs font-semibold tracking-widest text-[#9b87f5] uppercase">{c.tag}</p>
                <p className="mb-2 text-base font-semibold text-gray-900">{c.title}</p>
                <p className={`text-sm leading-relaxed ${c.accent ? "text-[#7c5ce8]" : "text-gray-400"}`}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* divider5 */}
      <div className="mx-auto my-15 h-[0.5px] w-[85%] bg-[#6d4fc9] shadow-[0_10px_60px_rgba(0,0,0,0.07)]"></div>

      {/* promo card */}
      <div className="w-full px-4 sm:px-8 md:px-26">
        <div
          className="flex w-full flex-col items-start justify-between gap-6 rounded-2xl px-6 py-10 md:flex-row md:items-center md:gap-0 md:px-14 md:py-12"
          style={{
            background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 50%, #e9e4fd 100%)",
            border: "1px solid #d4c9fb",
          }}
        >
          <div className="flex flex-col gap-y-2">
            <div>
              <p className="text-2xl font-bold text-gray-900 md:text-3xl">Ready to try it?</p>
              <p className="text-2xl font-bold text-[#7c5ce8] md:text-3xl">Your first consult awaits.</p>
            </div>
            <p className="mt-1 text-sm text-gray-400">Quick signup, faster care. Find a doctor in under a minute.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => Navigate("/auth/patient/signup")} style={{ cursor: "pointer" }} className="z-20 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-800">
              Find a doctor <span>→</span>
            </button>
            <button onClick={() => Navigate("/auth/doctor/signup")} style={{ cursor: "pointer" }} className="z-20 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-[#9b87f5] hover:text-[#7c5ce8]">
              Join as a doctor
            </button>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="my-10 flex w-full items-center justify-between px-4 sm:px-8 md:px-26">
        <h1 className="text-sm text-gray-400">CuraNova@2025</h1>
        <div className="flex items-center gap-4">
          <a target="blank" href="https://github.com/arjunx999/" className="z-20 cursor-pointer text-gray-400 transition-colors duration-200 hover:text-gray-700">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
          <a target="blank" href="https://www.linkedin.com/in/arjun-verma-5b4326292/" className="z-20 cursor-pointer text-gray-400 transition-colors duration-200 hover:text-[#0077b5]">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Landing;
