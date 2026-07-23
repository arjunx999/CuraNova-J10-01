import { useState, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle,
  Users,
  Wallet,
  Star,
  BadgeCheck,
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

const AppointmentCard = ({ appointment }) => {
  const patientName =
    appointment?.patientName ||
    appointment?.patient?.name ||
    appointment?.bookedBy?.name ||
    "Patient";

  const time = appointment?.start_time || appointment?.time || "--:--";

  const type =
    appointment?.type || appointment?.consultationType || "Consultation";

  return (
    <div className="bg-[#faf9ff] border border-[#ede9fe] rounded-xl p-4 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-900">{patientName}</h3>

        <p className="text-xs text-gray-400 mt-1">
          {time} • {type}
        </p>
      </div>

      <button
        className="
          px-4 py-2
          rounded-lg
          bg-[#7c5ce8]
          text-white
          text-xs
          hover:bg-[#9b87f5]
          transition
        "
      >
        Start
      </button>
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

  useEffect(() => {
    if (!user?._id) return;

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

        <section className="bg-white rounded-3xl border border-gray-100 p-6 flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#ede9fe] text-[#7c5ce8] flex items-center justify-center font-semibold text-2xl overflow-hidden">
              {doctor?.profilePicture ? (
                <img src={doctor.profilePicture} alt="" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">
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

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-2xl font-semibold">
                ₹{doctor?.consultation_fee || 0}
              </p>

              <p className="text-xs text-gray-400">per consult</p>
            </div>

            <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2 rounded-xl border border-[#9b87f5] text-[#7c5ce8] text-sm hover:bg-[#ede9fe] transition cursor-pointer"
            >
              Edit profile
            </button>
          </div>
        </section>

        {/* Stats */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

          <div className="col-span-12 lg:col-span-8">
            <div className="flex gap-2 mb-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full cursor-pointer text-sm transition ${
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
                      <AppointmentCard key={appt._id} appointment={appt} />
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

          <div className="col-span-12 lg:col-span-4">
            <AvailabilityCard slots={slots} />
          </div>
        </section>
      </main>

      {showEditProfile && (
        <EditProfileModal
          doctor={doctor}
          close={() => setShowEditProfile(false)}
          updateDoctor={setDoctor}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
