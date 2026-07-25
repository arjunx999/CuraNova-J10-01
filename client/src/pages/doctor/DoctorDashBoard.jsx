import { useState, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle,
  Users,
  Wallet,
  Star,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import axios from "../../api/axios";
import EditProfileModal from "../../components/doctor/EditProfileModal";
import AvailabilityCard from "../../components/doctor/AvailabilityCard";
import { useUser } from "../../../context/userContext";
import DoctorAvailabilityCalendar from "../../components/doctor/DoctorAvailabilityCalendar";

const StatCard = ({ icon: Icon, value, label }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#ede9fe] flex items-center justify-center text-[#7c5ce8]">
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

const AppointmentCard = ({ appointment, onViewSymptoms }) => {
  const patientName = appointment?.patient?.name || "Patient";

  const time = formatTime(appointment?.slot?.start_time);
  const date = formatDate(appointment?.slot?.date);

  return (
    <div className="bg-[#faf9ff] border border-[#ede9fe] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {patientName}
        </h3>

        <p className="text-xs text-gray-400 mt-1">
          {date} · {time}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          onClick={() => onViewSymptoms(appointment, "raw")}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-[#ddd6fe] text-[#7c5ce8] text-xs font-medium hover:bg-[#f5f3ff] transition cursor-pointer"
        >
          View symptoms
        </button>

        <button
          onClick={() => onViewSymptoms(appointment, "summary")}
          className="
    w-full sm:w-auto
    px-4 py-2.5
    rounded-xl
    bg-white
    border border-[#ddd6fe]
    text-xs font-medium
    hover:bg-[#faf9ff]
    transition
    cursor-pointer
    flex items-center justify-center gap-1.5
  "
        >
          <Sparkles size={14} className="text-[#9b87f5]" />

          <span
            className="
      bg-gradient-to-r
      from-[#7c5ce8]
      via-[#9b87f5]
      to-[#c084fc]
      bg-clip-text
      text-transparent
      font-semibold
    "
          >
            AI Summary
          </span>
        </button>

        <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7c5ce8] text-white text-xs font-semibold hover:bg-[#6d4bd8] transition cursor-pointer">
          Start
        </button>
      </div>
    </div>
  );
};

const SummarySection = ({ title, icon, items = [] }) => {
  return (
    <div
      className="
      bg-white
      border border-gray-100
      rounded-2xl
      p-4
      shadow-sm
    "
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-2">
        {items?.length ? (
          items.map((item, i) => (
            <div
              key={i}
              className="
                flex gap-2
                text-sm
                text-gray-600
                bg-[#faf9ff]
                rounded-xl
                px-3
                py-2
              "
            >
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
    <div className="min-h-screen bg-[#f5f4f0] relative overflow-hidden">
      {/* Background */}

      <div className="absolute inset-0 blob1 opacity-50" />

      <div className="absolute w-[50%] h-[50%] top-20 right-0 blob2 opacity-40" />

      <Navbar />

      <main className="relative z-10 px-6 lg:px-12 py-8 max-w-[2000px] mx-auto">
        {/* Doctor Header */}

        <section className="bg-white rounded-3xl border border-gray-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden sm:flex w-20 h-20 rounded-2xl bg-[#ede9fe] text-[#7c5ce8] items-center justify-center font-semibold text-2xl overflow-hidden">
              {doctor?.profilePicture ? (
                <img
                  src={doctor.profilePicture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                  Dr. {doctor?.name}
                </h1>

                <BadgeCheck
                  size={18}
                  className="text-[#7c5ce8] fill-[#ede9fe]"
                />
              </div>

              <p className="text-sm text-gray-400 mt-1">
                {doctor?.department || "Department"} •{" "}
                {doctor?.hospital_name || "Hospital"}
              </p>

              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 rounded-full bg-[#ede9fe] text-[#7c5ce8] text-xs">
                  🟢 Available today
                </span>

                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Star size={12} className="fill-[#9b87f5] text-[#9b87f5]" />

                  {doctor?.rating || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 mr-4">
            <div className="text-right">
              <p className="text-2xl font-semibold">
                ₹{doctor?.consultation_fee || 0}
              </p>

              <p className="text-xs text-gray-400">per consult</p>
            </div>

            {/* <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2 rounded-xl border border-[#9b87f5] text-[#7c5ce8] text-sm hover:bg-[#ede9fe] transition cursor-pointer"
            >
              Edit profile
            </button> */}
          </div>
        </section>

        {/* Stats */}

        <section className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Wallet}
            value={`₹${totalEarnings}`}
            label="Total earnings"
          />

          <StatCard
            icon={Users}
            value={todayAppointments.length}
            label="Today's appointments"
          />

          <StatCard
            icon={CalendarDays}
            value={upcomingAppointments.length}
            label="Upcoming appointments"
          />

          <StatCard
            icon={CheckCircle}
            value={completedAppointments.length}
            label="Completed"
          />
        </section>

        {/* Main Grid */}

        <section className="grid grid-cols-12 gap-6">
          {/* Appointments / Calendar */}

          <div className="col-span-12 lg:col-span-8 min-w-0">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full shrink-0 cursor-pointer text-sm transition ${
                    activeTab === tab
                      ? "bg-[#7c5ce8] text-white"
                      : "bg-white text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Calendar" ? (
              <DoctorAvailabilityCalendar slots={slots} />
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 min-h-[260px]">
                {activeAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {activeAppointments.map((appt) => (
                      <AppointmentCard
                        key={appt._id}
                        appointment={appt}
                        onViewSymptoms={fetchSymptoms}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-sm text-gray-400">
                    {activeTab === "Today"
                      ? "No appointments today"
                      : `No ${activeTab.toLowerCase()} appointments`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Availability */}

          <div className="col-span-12 lg:col-span-4 min-w-0">
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-[600px] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#7c5ce8] to-[#9b87f5] p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mt-3">
                    {symptomData?.title}
                  </h2>
                </div>

                <button
                  onClick={() => setViewSymptomSection(false)}
                  className="
              w-8 h-8
              rounded-full
              bg-white/20
              hover:bg-white/30
              transition
              cursor-pointer
            "
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[75vh] sm:max-h-[70vh] overflow-y-auto">
              {typeof symptomData?.content === "string" ? (
                <div
                  className="
            bg-[#faf9ff]
            border border-[#ede9fe]
            rounded-2xl
            p-5
          "
                >
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {symptomData.content}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <SummarySection
                    title="Reported Symptoms"
                    items={symptomData?.content?.symptoms}
                  />

                  <SummarySection
                    title="Notable Points"
                    items={symptomData?.content?.notablePoints}
                  />

                  <SummarySection
                    title="Possible Concerns"
                    items={symptomData?.content?.possibleConcerns}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setViewSymptomSection(false)}
                className="
            w-full
            py-3
            rounded-xl
            bg-[#7c5ce8]
            text-white
            text-sm
            font-medium
            hover:bg-[#6d4bd8]
            transition
            cursor-pointer
          "
              >
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
