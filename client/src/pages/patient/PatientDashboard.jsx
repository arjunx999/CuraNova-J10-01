import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle, Stethoscope, FileText, BadgeCheck, Sparkles, Star } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import axios from "../../api/axios";
import VideoCall from "../../components/VideoCall";
import { socket } from "../../socket";

const StatCard = ({ icon: Icon, value, label }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ede9fe] text-[#7c5ce8]">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">{value}</h2>

        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
};

const formatTime = (time24) => {
  if (!time24) return "";

  const [h, m] = time24.split(":").map(Number);

  const period = h >= 12 ? "PM" : "AM";

  const hour = h % 12 === 0 ? 12 : h % 12;

  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
};

const isSlotLive = (slot, now) => {
  if (!slot?.date || !slot?.start_time || !slot?.end_time) return false;

  const slotDate = new Date(slot.date);
  const isSameDay = slotDate.getFullYear() === now.getFullYear() && slotDate.getMonth() === now.getMonth() && slotDate.getDate() === now.getDate();

  if (!isSameDay) return false;

  const [sh, sm] = slot.start_time.split(":").map(Number);
  const [eh, em] = slot.end_time.split(":").map(Number);

  const start = new Date(slotDate);
  start.setHours(sh, sm, 0, 0);

  const end = new Date(slotDate);
  end.setHours(eh, em, 0, 0);

  return now >= start && now <= end;
};

const SkeletonBlock = ({ className = "" }) => <div className={`animate-pulse rounded-xl bg-[#ede9fe] ${className}`} />;

const AppointmentCard = ({ appointment, onViewSymptoms, now, onSubmitSymptoms, onStartCall, onRate }) => {
  const live = isSlotLive(appointment.slot, now);

  return (
    <div className={`flex flex-col justify-between gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:p-5 ${live ? "blink-live border-red-200 bg-red-50" : "border-[#ede9fe] bg-[#faf9ff]"} `}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">Dr. {appointment.doctor?.name}</h3>

          {live && <span className="blink-live rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">Live now</span>}
        </div>

        <p className="mt-1 text-xs text-gray-400">{appointment.slot ? `${formatDate(appointment.slot.date)} · ${formatTime(appointment.slot.start_time)}` : "Slot unavailable"}</p>

        <span className="mt-3 inline-block rounded-full bg-[#ede9fe] px-3 py-1 text-xs text-[#7c5ce8]">{appointment.status}</span>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {!appointment.patientSymptoms ? (
          <button onClick={() => onSubmitSymptoms(appointment._id)} className="w-full cursor-pointer rounded-xl border border-[#ddd6fe] bg-white px-4 py-2.5 text-xs font-medium text-[#7c5ce8] transition hover:bg-[#f5f3ff] sm:w-auto">
            Submit symptoms
          </button>
        ) : (
          <>
            <button onClick={() => onViewSymptoms(appointment, "raw")} className="w-full cursor-pointer rounded-xl border border-[#ddd6fe] bg-white px-4 py-2.5 text-xs font-medium text-[#7c5ce8] transition hover:bg-[#f5f3ff] sm:w-auto">
              View symptoms
            </button>

            <button onClick={() => onViewSymptoms(appointment, "summary")} className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#ddd6fe] bg-white px-4 py-2.5 text-xs font-medium transition hover:bg-[#faf9ff] sm:w-auto">
              <Sparkles size={14} className="text-[#9b87f5]" />

              <span className="bg-gradient-to-r from-[#7c5ce8] via-[#9b87f5] to-[#c084fc] bg-clip-text font-semibold text-transparent">AI Summary</span>
            </button>
          </>
        )}

        {live && appointment.status === "confirmed" && appointment.payment_status === "confirmed" && (
          <button onClick={() => onStartCall(appointment)} className="w-full cursor-pointer rounded-xl bg-red-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-red-600 sm:w-auto">
            Start
          </button>
        )}
        {appointment.status === "completed" && (
          <div onClick={() => onRate(appointment)} className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs">
            <span className="flex items-center gap-1 text-amber-600">
              <Star size={13} className="cursor-pointer fill-amber-400 text-amber-400" />
              {appointment.doctor?.rating ?? 0} ({appointment.doctor?.rating_count ?? 0})
            </span>
            {appointment.rating != null ? <span className="text-gray-500">Your rating: {appointment.rating}/5</span> : appointment.payment_status === "confirmed" ? <button className="font-semibold text-[#7c5ce8] hover:underline">Rate doctor</button> : null}
          </div>
        )}
      </div>
    </div>
  );
};

const SummarySection = ({ title, icon, items = [] }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-2">
        {items?.length ? (
          items.map((item, i) => (
            <div key={i} className="flex gap-2 rounded-xl bg-[#faf9ff] px-3 py-2 text-sm text-gray-600">
              <span className="text-[#7c5ce8]">•</span>

              {item}
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400">No information available</p>
        )}
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [viewSymptomSection, setViewSymptomSection] = useState(false);
  const [symptomData, setSymptomData] = useState();
  const [now, setNow] = useState(new Date());
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [ratingAppointment, setRatingAppointment] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSymptoms = (appointment, type) => {
    if (type === "raw") {
      setSymptomData({
        title: "Patient Symptoms",
        content: appointment?.patientSymptoms,
      });
    } else {
      setSymptomData({
        title: "AI Summary",
        content: appointment?.summary,
      });
    }

    setViewSymptomSection(true);
  };

  const getUserDashboard = useCallback(async ({ quiet = false } = {}) => {
    try {
      if (!quiet) setIsLoading(true);

      const res = await axios.get("/patient/dashboard");
      //   console.log(res);
      const { user, upcomingAppointments, completedAppointments } = res.data;

      setPatient(user);
      setUpcoming(upcomingAppointments || []);
      setCompleted(completedAppointments || []);
    } catch (error) {
      console.log(error);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getUserDashboard();
  }, [getUserDashboard]);

  useEffect(() => {
    const handleAppointmentFinished = ({ message } = {}) => {
      toast.success(message || "Appointment finished. Please rate your consultation from your dashboard.");
      getUserDashboard({ quiet: true });
    };

    socket.on("appointment-finished", handleAppointmentFinished);
    if (!socket.connected) socket.connect();

    return () => socket.off("appointment-finished", handleAppointmentFinished);
  }, [getUserDashboard]);

  useEffect(() => {
    const refreshDashboard = () => getUserDashboard({ quiet: true });
    const interval = setInterval(refreshDashboard, 60000);
    window.addEventListener("focus", refreshDashboard);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshDashboard);
    };
  }, [getUserDashboard]);

  const submitSymptoms = async () => {
    try {
      if (!symptoms.trim()) {
        toast.error("Please describe your symptoms");
        return;
      }

      const res = await axios.post(`/appointment/summarize-symptoms/${selectedAppointmentId}`, {
        patient_text: symptoms,
      });

      if (res.data.success) {
        toast.success("Symptoms submitted. AI Summary will be ready shortly");

        setShowSymptomForm(false);
        setSymptoms("");

        getUserDashboard();
      }
    } catch (error) {
      console.log("error submitting symptoms", error);

      toast.error(error.response?.data?.message || "Unable to submit symptoms");
    }
  };

  const openSymptomForm = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setShowSymptomForm(true);
  };

  const openRatingForm = (appointment) => {
    setRatingAppointment(appointment);
    setRatingValue(appointment.rating || 0);
  };

  const submitRating = async () => {
    if (!ratingAppointment || !ratingValue) {
      toast.error("Choose a rating from 1 to 5 stars.");
      return;
    }

    setRatingSubmitting(true);
    try {
      await axios.post(`/appointment/rate/${ratingAppointment._id}`, { rating: ratingValue });
      toast.success("Thank you for rating your consultation.");
      setRatingAppointment(null);
      await getUserDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit your rating.");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const initials = patient?.name
    ?.split(" ")
    ?.map((n) => n[0])
    ?.join("");

  const doctorsVisited = new Set(completed.map((item) => item.doctor?._id)).size;

  const tabData = {
    Upcoming: upcoming,
    Completed: completed,
  };

  const activeAppointments = tabData[activeTab] || [];

  const tabs = ["Upcoming", "Completed"];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f4f0]">
      <style>{`
        @keyframes blink-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        .blink-live {
          animation: blink-red 1.2s ease-in-out infinite;
        }
      `}</style>

      <div className="blob1 absolute inset-0 opacity-50" />

      <div className="blob2 absolute top-20 right-0 h-[50%] w-[50%] opacity-40" />

      <Navbar isDash={true} />

      <main className="relative z-10 mx-auto w-full max-w-[2000px] px-6 py-8 lg:px-12">
        {/* Profile Header */}

        <section className="mb-6 flex items-center justify-between gap-5 rounded-3xl border border-gray-100 bg-white p-5">
          {isLoading ? (
            <div className="flex w-full items-center gap-4">
              <SkeletonBlock className="hidden h-20 w-20 rounded-2xl sm:block" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-6 w-48" />
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-5 w-24" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#ede9fe] text-2xl font-semibold text-[#7c5ce8] sm:flex">{patient?.profilePicture ? <img src={patient.profilePicture} className="h-full w-full object-cover" /> : initials}</div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">{patient?.name}</h1>

                  {patient?.isVerified && <BadgeCheck size={18} className="fill-[#ede9fe] text-[#7c5ce8]" />}
                </div>

                <p className="mt-1 text-sm text-gray-400">{patient?.email}</p>

                <div className="mt-3 flex gap-3">
                  <span className="rounded-full bg-[#ede9fe] px-3 py-1 text-xs text-[#7c5ce8]">🟢 Verified</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Stats */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
                <SkeletonBlock className="h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-5 w-16" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : (
            <>
              <StatCard icon={CalendarDays} value={upcoming.length} label="Upcoming appointments" />

              <StatCard icon={CheckCircle} value={completed.length} label="Completed visits" />

              <StatCard icon={Stethoscope} value={doctorsVisited} label="Doctors consulted" />

              <StatCard icon={FileText} value={[...upcoming, ...completed].filter((a) => a.summary).length} label="AI health summaries" />
            </>
          )}
        </section>

        <section className="grid grid-cols-12 gap-6">
          {/* Appointments */}

          <div className="col-span-12 lg:col-span-8">
            <div className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm transition ${activeTab === tab ? "bg-[#7c5ce8] text-white" : "bg-white text-gray-500"} `}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="space-y-3 rounded-3xl border border-gray-100 bg-white p-6">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => <SkeletonBlock key={i} className="h-20 w-full rounded-2xl" />)
              ) : activeAppointments.length ? (
                activeAppointments.map((appt) => <AppointmentCard key={appt._id} appointment={appt} onViewSymptoms={fetchSymptoms} now={now} onSubmitSymptoms={openSymptomForm} onStartCall={setActiveCall} onRate={openRatingForm} />)
              ) : (
                <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">No {activeTab.toLowerCase()} appointments</div>
              )}
            </div>
          </div>

          {/* Health Profile */}

          <div className="col-span-12 lg:col-span-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-6">
              <h2 className="mb-5 font-semibold text-gray-900">Health Profile</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Age</span>

                  <span className="font-medium">{patient?.age || "-"} yrs</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Weight</span>

                  <span className="font-medium">{patient?.weight || "-"} kg</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {viewSymptomSection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
          <div className="w-full max-w-[600px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#7c5ce8] to-[#9b87f5] p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="mt-3 text-2xl font-semibold">{symptomData?.title}</h2>
                </div>

                <button onClick={() => setViewSymptomSection(false)} className="h-8 w-8 cursor-pointer rounded-full bg-white/20 transition hover:bg-white/30">
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[75vh] overflow-y-auto p-6 sm:max-h-[70vh]">
              {typeof symptomData?.content === "string" ? (
                <div className="rounded-2xl border border-[#ede9fe] bg-[#faf9ff] p-5">
                  <p className="text-sm leading-relaxed text-gray-700">{symptomData.content}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <SummarySection title="Reported Symptoms" items={symptomData?.content?.symptoms} />

                  <SummarySection title="Notable Points" items={symptomData?.content?.notablePoints} />

                  <SummarySection title="Possible Concerns" items={symptomData?.content?.possibleConcerns} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button onClick={() => setViewSymptomSection(false)} className="w-full cursor-pointer rounded-xl bg-[#7c5ce8] py-3 text-sm font-medium text-white transition hover:bg-[#6d4bd8]">
                Close summary
              </button>
            </div>
          </div>
        </div>
      )}

      {showSymptomForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-3xl bg-white p-8 shadow-xl">
            <span className="mb-3 inline-block rounded-full bg-[#f3edff] px-3 py-1 text-[11px] font-medium text-[#7c5ce8]">AI-powered visit prep</span>

            <h2 className="text-2xl font-semibold text-gray-900">Help your doctor walk in prepared</h2>

            <p className="mt-2 text-sm text-gray-400">Describe what you're experiencing and we'll create a clean clinical summary.</p>

            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Example: Fever since 3 days, headache..." className="mt-6 h-64 w-full resize-none rounded-xl border border-gray-200 p-4 text-sm focus:border-[#9b87f5] focus:outline-none" />

            <button onClick={submitSymptoms} className="mt-5 w-full cursor-pointer rounded-xl bg-[#7c5ce8] py-3.5 font-medium text-white transition hover:bg-[#6d4bd8]">
              Generate my summary
            </button>

            <button onClick={() => setShowSymptomForm(false)} className="mt-2.5 w-full rounded-xl py-3 text-sm font-medium text-[#7c5ce8] hover:bg-[#faf9ff]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {ratingAppointment && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Rate your consultation</h2>
            <p className="mt-1 text-sm text-gray-500">How was your appointment with {ratingAppointment.doctor?.name || "your doctor"}?</p>
            <div className="my-6 flex justify-center gap-2" role="group" aria-label="Choose a rating from 1 to 5 stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} onClick={() => setRatingValue(value)} aria-label={`${value} star${value > 1 ? "s" : ""}`}>
                  <Star size={30} className={value <= ratingValue ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
            <button onClick={submitRating} disabled={ratingSubmitting || !ratingValue} className="w-full cursor-pointer rounded-xl bg-[#7c5ce8] py-3 text-sm font-semibold text-white disabled:opacity-50">
              {ratingSubmitting ? "Submitting…" : "Submit rating"}
            </button>
            <button onClick={() => setRatingAppointment(null)} disabled={ratingSubmitting} className="mt-2 w-full rounded-xl py-3 text-sm text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeCall && (
        <VideoCall
          appointmentId={activeCall._id}
          role="patient"
          participantName={activeCall.doctor?.name}
          onClose={() => {
            setActiveCall(null);
            getUserDashboard();
          }}
          onCallEnded={getUserDashboard}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
