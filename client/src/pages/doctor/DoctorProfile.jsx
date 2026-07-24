import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Star,
  MapPin,
  Clock,
  Languages,
  Stethoscope,
  CalendarDays,
  Users,
  Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { useRazorpay } from "react-razorpay";
import Navbar from "../../components/Navbar";
import { useUser } from "../../../context/userContext";

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const getNextDays = (count = 6) => {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);

    return {
      label: i === 0 ? "Today" : `${names[date.getDay()]} ${date.getDate()}`,
      fullDate: formatDate(date),
    };
  });
};

const formatTime = (time) => {
  const [hour, minute] = time.split(":").map(Number);

  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;

  return `${h}:${minute.toString().padStart(2, "0")} ${suffix}`;
};

const isPresent = (value) =>
  value !== null && value !== undefined && value !== "";

const StarRating = ({ rating, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={
          star <= Math.round(rating)
            ? "text-[#9b87f5] fill-[#9b87f5]"
            : "text-gray-200 fill-gray-200"
        }
      />
    ))}
  </div>
);

const StatBox = ({ value, label, sub }) => (
  <div className="bg-[#faf9ff] border border-[#ede9fe] rounded-xl p-3.5 text-center flex flex-col items-center gap-1.5">
    <span className="text-xl font-semibold text-[#7c5ce8] leading-none">
      {value}
    </span>

    {sub}

    <span className="text-[10px] text-gray-400">{label}</span>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
    <div className="flex items-center gap-2 text-gray-400">
      <Icon size={13} />
      <span className="text-xs">{label}</span>
    </div>

    <span className="text-xs font-medium text-gray-700 text-right max-w-[60%]">
      {value}
    </span>
  </div>
);

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const days = useMemo(() => getNextDays(6), []);

  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedDay, setSelectedDay] = useState(days[0].fullDate);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { Razorpay } = useRazorpay();
  const { user } = useUser();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await axios.get(`/doctor/get-doctor-info/${id}`);

        setDoctor(data.doctor);

        setSlots(
          (data.slots || []).map((slot) => ({
            ...slot,
            formattedDate: slot.date.split("T")[0],
          })),
        );
      } catch (err) {
        console.log(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (!slots.length) return;

    const firstAvailable = days.find((day) =>
      slots.some((slot) => slot.formattedDate === day.fullDate),
    );

    if (firstAvailable) {
      setSelectedDay(firstAvailable.fullDate);
    }
  }, [slots, days]);

  const slotsForDay = useMemo(() => {
    return slots
      .filter((slot) => slot.formattedDate === selectedDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [slots, selectedDay]);

  const availableDays = useMemo(() => {
    return days.filter((day) =>
      slots.some((slot) => slot.formattedDate === day.fullDate),
    );
  }, [days, slots]);
  const initials = useMemo(() => {
    if (!doctor?.name) return "";

    return doctor.name
      .replace("Dr. ", "")
      .split(" ")
      .map((n) => n[0])
      .join("");
  }, [doctor]);

  const statFields = useMemo(() => {
    if (!doctor) return [];

    return [
      {
        key: "rating",
        value: doctor.rating,
        label: "Rating",
        sub: <StarRating rating={doctor.rating} />,
      },
      {
        key: "experience",
        value: isPresent(doctor.experience) ? `${doctor.experience} yrs` : null,
        label: "Experience",
        sub: <Briefcase size={14} className="text-[#9b87f5]" />,
      },
      {
        key: "fee",
        value: isPresent(doctor.consultation_fee)
          ? `₹${doctor.consultation_fee}`
          : null,
        label: "Consultation fee",
        sub: <span className="text-[10px] text-gray-400">per visit</span>,
      },
      {
        key: "patients",
        value: isPresent(doctor.patients_count)
          ? `${doctor.patients_count}+`
          : null,
        label: "Patients seen",
        sub: <Users size={14} className="text-[#9b87f5]" />,
      },
      {
        key: "memberSince",
        value: isPresent(doctor.createdAt)
          ? new Date(doctor.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : null,
        label: "Member since",
        sub: <CalendarDays size={14} className="text-[#9b87f5]" />,
      },
    ].filter((item) => isPresent(item.value));
  }, [doctor]);

  const infoFields = useMemo(() => {
    if (!doctor) return [];

    return [
      {
        key: "hospital",
        icon: MapPin,
        label: "Hospital",
        value: doctor.hospital_name,
      },
      {
        key: "department",
        icon: Stethoscope,
        label: "Department",
        value: doctor.department,
      },
      {
        key: "available",
        icon: Clock,
        label: "Available",
        value: doctor.available_days,
      },
      {
        key: "languages",
        icon: Languages,
        label: "Languages",
        value: doctor.languages?.length ? doctor.languages.join(", ") : null,
      },
      {
        key: "patientsSeen",
        icon: Users,
        label: "Patients seen",
        value: isPresent(doctor.patients_count)
          ? `${doctor.patients_count}+`
          : null,
      },
    ].filter((item) => isPresent(item.value));
  }, [doctor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0]">
        <p className="text-gray-400 text-sm">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0]">
        <p className="text-gray-400 text-sm">
          Couldn't load this doctor's profile.
        </p>
      </div>
    );
  }

  const initiateAppointmentHandler = async () => {
    try {
      const slotId = selectedSlot._id;
      const dr_id = selectedSlot.doctor;
      const res = await axios.post(
        `/appointment/initiate-appointment/${slotId}`,
        {
          dr_id,
        },
      );
      console.log(res);
      initiatePaymentHandler();
    } catch (error) {
      console.log("error initiating appointment", error);
      toast.error(
        error.response?.data?.message || "Unable to initiate appointment",
      );
    }
  };

  const initiatePaymentHandler = async () => {
    try {
      const slotId = selectedSlot._id;
      const dr_id = selectedSlot.doctor;
      const res = await axios.post(`/appointment/initiate-payment/${slotId}`, {
        dr_id,
      });

      if (res.data.success) {
        const { order, appointment } = res.data;
        openRazorpay(order, appointment._id);
      }
    } catch (error) {
      console.log("error initiating payment", error);
      toast.error(
        error.response?.data?.message || "Unable to initiate payment",
      );
    }
  };

  const openRazorpay = (order, appointmentId) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_8aUEbFky0uBSqT",
      amount: order.amount,
      currency: order.currency,
      name: "CuraNova",
      description: "Doctor Consultation",
      order_id: order.id,

      handler: async function (response) {
        const paymentData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          appointmentId,
        };

        await verifyPayment(paymentData);
      },

      prefill: {
        name: user.name,
        email: user.email,
      },

      theme: {
        color: "#9300ec",
      },
    };

    const razor = new window.Razorpay(options);

    razor.open();
  };

  const verifyPayment = async (paymentData) => {
    try {
      const res = await axios.post("/appointment/verify-payment", paymentData);

      if (res.data.success) {
        toast.success("Payment successful! Appointment confirmed");

        // navigate("/patient/home");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to verify payment");
      console.log("error during payment verification", error);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f4f0] relative flex flex-col">
      <div className="w-full h-full absolute top-0 left-0 blob1 z-0 opacity-50" />

      <div className="w-[50%] h-[50%] absolute top-25 -left-35 blob2 z-0 opacity-40" />

      <Navbar />

      <main className="relative z-10 flex-1 w-full px-6 lg:px-12 py-8">
        <div className="max-w-[2000px] mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 mb-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#7c5ce8] hover:bg-purple-50 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <section className="bg-white rounded-3xl py-6 pl-6 pr-8 shadow-sm border border-gray-100 flex items-center justify-between gap-5 mb-6">
            <div className="flex gap-5">
              <div className="w-24 h-24 rounded-2xl bg-[#ede9fe] flex items-center justify-center text-[#7c5ce8] text-3xl font-semibold overflow-hidden">
                {doctor.profilePicture ? (
                  <img
                    src={doctor.profilePicture}
                    alt={doctor.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {doctor.name}
                  </h1>

                  {doctor.isVerified && (
                    <BadgeCheck
                      size={18}
                      className="text-[#9b87f5] fill-[#ede9fe]"
                    />
                  )}
                </div>

                {doctor.degrees?.length > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    {doctor.degrees.join(", ")}
                  </p>
                )}

                <div className="flex gap-3 mt-3">
                  {doctor.department && (
                    <span className="px-3 py-1 rounded-full bg-[#f3edff] text-[#7c5ce8] text-xs">
                      {doctor.department}
                    </span>
                  )}

                  {doctor.hospital_name && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={12} />
                      {doctor.hospital_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {doctor.consultation_fee != null && (
              <div className="text-right">
                <p className="text-3xl font-semibold">
                  ₹{doctor.consultation_fee}
                </p>

                <p className="text-xs text-gray-400">per consult</p>
              </div>
            )}
          </section>

          <div className="grid grid-cols-12 gap-6">
            {/* LEFT CONTENT */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {statFields.length > 0 && (
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-medium text-gray-700 mb-5">
                    At a glance
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statFields.map((field) => (
                      <StatBox
                        key={field.key}
                        value={field.value}
                        label={field.label}
                        sub={field.sub}
                      />
                    ))}
                  </div>
                </section>
              )}

              {doctor.bio && (
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-medium text-gray-800 mb-3">About</h2>

                  <p className="text-sm text-gray-500 leading-relaxed">
                    {doctor.bio}
                  </p>
                </section>
              )}

              {infoFields.length > 0 && (
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-medium text-gray-800 mb-3">Details</h2>

                  {infoFields.map((field) => (
                    <InfoRow
                      key={field.key}
                      icon={field.icon}
                      label={field.label}
                      value={field.value}
                    />
                  ))}
                </section>
              )}
            </div>

            {/* BOOKING PANEL */}

            <aside className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Book your Slot
                </h1>

                <div className="flex items-center gap-2 text-sm mb-4 mt-3 text-gray-600">
                  <CalendarDays size={15} className="text-[#9b87f5]" />
                  Select date
                </div>

                {availableDays.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center mb-6">
                    No upcoming dates with slots.
                  </p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
                    {availableDays.map((day) => {
                      const today = day.fullDate === formatDate(new Date());

                      const active = selectedDay === day.fullDate;

                      return (
                        <button
                          key={day.fullDate}
                          onClick={() => {
                            setSelectedDay(day.fullDate);
                            setSelectedSlot(null);
                          }}
                          className={`min-w-[68px] h-[68px] cursor-pointer rounded-xl border flex flex-col items-center justify-center transition-all ${
                            active
                              ? "bg-[#7c5ce8] border-[#7c5ce8] text-white shadow-md shadow-purple-200"
                              : "bg-white border-purple-100 text-gray-500 hover:border-purple-300"
                          }`}
                        >
                          <span className="text-[10px] opacity-80">
                            {today ? "Today" : day.label.split(" ")[0]}
                          </span>

                          <span className="text-sm font-medium">
                            {day.label.split(" ")[1] ||
                              new Date(day.fullDate).getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Clock size={14} className="text-[#9b87f5]" />
                  Available slots
                </div>

                {slotsForDay.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">
                    No slots available on this day.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {slotsForDay.map((slot) => {
                      const disabled =
                        !slot.isAvailable ||
                        slot.is_booked ||
                        slot.status === "booked";

                      const selected = selectedSlot?._id === slot._id;

                      return (
                        <button
                          key={slot._id}
                          disabled={disabled}
                          onClick={() => setSelectedSlot(slot)}
                          className={`h-[38px] rounded-xl border text-xs transition-all ${
                            !slot.isAvailable
                              ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed"
                              : disabled
                                ? "bg-gray-50 text-gray-300 border-gray-100 line-through cursor-not-allowed"
                                : selected
                                  ? "bg-[#7c5ce8] text-white border-[#7c5ce8]"
                                  : "bg-white border-purple-100 text-[#7c5ce8] hover:bg-purple-50 cursor-pointer"
                          }`}
                        >
                          {formatTime(slot.start_time)}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-5 mt-5 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-100" />
                    Available
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7c5ce8]" />
                    Selected
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-200" />
                    Taken
                  </div>
                </div>

                <button
                  disabled={!selectedSlot}
                  onClick={initiateAppointmentHandler}
                  className="w-full mt-6 py-4 rounded-xl bg-[#7c5ce8] text-white disabled:bg-gray-200 cursor-pointer"
                >
                  {selectedSlot
                    ? `Continue - ${formatTime(selectedSlot.start_time)}`
                    : "Select a slot to continue"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;
