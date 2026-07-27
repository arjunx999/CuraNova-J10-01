import { useState, useEffect } from "react";
import { CalendarDays, CheckCircle, Users, Wallet, Star, BadgeCheck, Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import axios from "../../api/axios";
import EditProfileModal from "../../components/doctor/EditProfileModal";
import AvailabilityCard from "../../components/doctor/AvailabilityCard";
import { useUser } from "../../../context/userContext";
import DoctorAvailabilityCalendar from "../../components/doctor/DoctorAvailabilityCalendar";

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
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

const formatDate = (date) => {
  if (!date) return "";

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

const AppointmentCard = ({ appointment, onViewSymptoms, now }) => {
  const patientName = appointment?.patient?.name || "Patient";

  const time = formatTime(appointment?.slot?.start_time);
  const date = formatDate(appointment?.slot?.date);
  const live = isSlotLive(appointment?.slot, now);

  return (
    <div className={`flex flex-col justify-between gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:p-5 ${live ? "blink-live border-red-200 bg-red-50" : "border-[#ede9fe] bg-[#faf9ff]"} `}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">{patientName}</h3>

          {live && <span className="blink-live rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">Live now</span>}
        </div>

        <p className="mt-1 text-xs text-gray-400">
          {date} · {time}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button onClick={() => onViewSymptoms(appointment, "raw")} className="w-full cursor-pointer rounded-xl border border-[#ddd6fe] bg-white px-4 py-2.5 text-xs font-medium text-[#7c5ce8] transition hover:bg-[#f5f3ff] sm:w-auto">
          View symptoms
        </button>

        <button onClick={() => onViewSymptoms(appointment, "summary")} className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#ddd6fe] bg-white px-4 py-2.5 text-xs font-medium transition hover:bg-[#faf9ff] sm:w-auto">
          <Sparkles size={14} className="text-[#9b87f5]" />

          <span className="bg-gradient-to-r from-[#7c5ce8] via-[#9b87f5] to-[#c084fc] bg-clip-text font-semibold text-transparent">AI Summary</span>
        </button>

        <button className={`w-full cursor-pointer rounded-xl px-5 py-2.5 text-xs font-semibold transition sm:w-auto ${live ? "blink-live bg-red-500 text-white hover:bg-red-600" : "bg-[#7c5ce8] text-white hover:bg-[#6d4bd8]"} `}>Start</button>
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

const SkeletonBlock = ({ className = "" }) => <div className={`animate-pulse rounded-xl bg-[#ede9fe] ${className}`} />;

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);

  const [showEditProfile, setShowEditProfile] = useState(false);

  const [activeTab, setActiveTab] = useState("Today");
  const { user } = useUser();

  const [slots, setSlots] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [viewSymptomSection, setViewSymptomSection] = useState(false);
  const [symptomData, setSymptomData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date());

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

  const fetchDoctor = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/doctor/dashboard`);
      const { doctor, appointment_data, totalEarnings } = res.data;

      setDoctor(doctor);
      setSlots(appointment_data?.slots || []);
      setTodayAppointments(appointment_data?.todayAppointments || []);
      setUpcomingAppointments(appointment_data?.upcomingAppointments || []);
      setCompletedAppointments(appointment_data?.completedAppointments || []);
      setTotalEarnings(totalEarnings || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    fetchDoctor();
  }, [user]);

  const initials = doctor?.name
    ?.replace("Dr. ", "")
    ?.split(" ")
    ?.map((n) => n[0])
    ?.join("");

  const tabData = {
    Today: todayAppointments,
    Upcoming: upcomingAppointments,
    Completed: completedAppointments,
  };

  const activeAppointments = tabData[activeTab] || [];
  const tabs = ["Today", "Upcoming", "Completed", "Calendar"];

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

      {/* Background */}

      <div className="blob1 absolute inset-0 opacity-50" />

      <div className="blob2 absolute top-20 right-0 h-[50%] w-[50%] opacity-40" />

      <Navbar />

      <main className="relative z-10 mx-auto max-w-[2000px] px-6 py-8 lg:px-12">
        {/* Doctor Header */}

        <section className="mb-6 flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-5 md:flex-row md:items-center md:justify-between">
          {isLoading ? (
            <div className="flex w-full items-center gap-4">
              <SkeletonBlock className="hidden h-20 w-20 rounded-2xl sm:block" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-6 w-48" />
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-5 w-24" />
              </div>
              <SkeletonBlock className="h-8 w-20" />
            </div>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-4">
                <div className="hidden h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#ede9fe] text-2xl font-semibold text-[#7c5ce8] sm:flex">
                  {doctor?.profilePicture ? <img src={doctor.profilePicture} alt="" className="h-full w-full object-cover" /> : <span>{initials}</span>}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-xl font-semibold text-gray-900 sm:text-2xl">Dr. {doctor?.name}</h1>

                    <BadgeCheck size={18} className="fill-[#ede9fe] text-[#7c5ce8]" />
                  </div>

                  <p className="mt-1 text-sm text-gray-400">
                    {doctor?.department || "Department"} • {doctor?.hospital_name || "Hospital"}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-full bg-[#ede9fe] px-3 py-1 text-xs text-[#7c5ce8]">🟢 Verified</span>

                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Star size={12} className="fill-[#9b87f5] text-[#9b87f5]" />

                      {doctor?.rating || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mr-4 flex items-center gap-5">
                <div className="text-right">
                  <p className="text-2xl font-semibold">₹{doctor?.consultation_fee || 0}</p>

                  <p className="text-xs text-gray-400">per consult</p>
                </div>

                {/* <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2 rounded-xl border border-[#9b87f5] text-[#7c5ce8] text-sm hover:bg-[#ede9fe] transition cursor-pointer"
            >
              Edit profile
            </button> */}
              </div>
            </>
          )}
        </section>

        {/* Stats */}

        <section className="xs:grid-cols-2 mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
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
              <StatCard icon={Wallet} value={`₹${totalEarnings}`} label="Total earnings" />

              <StatCard icon={Users} value={todayAppointments.length} label="Today's appointments" />

              <StatCard icon={CalendarDays} value={upcomingAppointments.length} label="Upcoming appointments" />

              <StatCard icon={CheckCircle} value={completedAppointments.length} label="Completed" />
            </>
          )}
        </section>

        {/* Main Grid */}

        <section className="grid grid-cols-12 gap-6">
          {/* Appointments / Calendar */}

          <div className="col-span-12 min-w-0 lg:col-span-8">
            <div className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm transition ${activeTab === tab ? "bg-[#7c5ce8] text-white" : "bg-white text-gray-500"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Calendar" ? (
              <DoctorAvailabilityCalendar slots={slots} />
            ) : (
              <div className="min-h-[260px] rounded-3xl border border-gray-100 bg-white p-6">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonBlock key={i} className="h-20 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : activeAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {activeAppointments.map((appt) => (
                      <AppointmentCard key={appt._id} appointment={appt} onViewSymptoms={fetchSymptoms} now={now} />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">{activeTab === "Today" ? "No appointments today" : `No ${activeTab.toLowerCase()} appointments`}</div>
                )}
              </div>
            )}
          </div>

          {/* Availability */}

          <div className="col-span-12 min-w-0 lg:col-span-4">
            <AvailabilityCard slots={slots} onSlotCreated={fetchDoctor} />
          </div>
        </section>
      </main>

      {/* {showEditProfile && (
        <EditProfileModal
          doctor={doctor}
          close={() => setShowEditProfile(false)}
          updateDoctor={setDoctor}
        />
      )} */}

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
    </div>
  );
};

export default DoctorDashboard;
