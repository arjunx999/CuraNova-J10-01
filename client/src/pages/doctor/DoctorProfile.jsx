import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Star, MapPin, Clock, Languages, Stethoscope, CalendarDays, Users, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../api/axios";
import { useRazorpay } from "react-razorpay";
import Navbar from "../../components/Navbar";
import { useUser } from "../../../context/userContext";

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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

const isPresent = (value) => value !== null && value !== undefined && value !== "";

const StarRating = ({ rating, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={size} className={star <= Math.round(rating) ? "fill-[#9b87f5] text-[#9b87f5]" : "fill-gray-200 text-gray-200"} />
    ))}
  </div>
);

const StatBox = ({ value, label, sub }) => (
  <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[#ede9fe] bg-[#faf9ff] p-3.5 text-center">
    <span className="text-xl leading-none font-semibold text-[#7c5ce8]">{value}</span>

    {sub}

    <span className="text-[10px] text-gray-400">{label}</span>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-b-0">
    <div className="flex items-center gap-2 text-gray-400">
      <Icon size={13} />
      <span className="text-xs">{label}</span>
    </div>

    <span className="max-w-[60%] text-right text-xs font-medium text-gray-700">{value}</span>
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

  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [appointmentId, setAppointmentId] = useState(null);
  const skipSymptomsHandler = () => {
    setShowSymptomForm(false);
    navigate("/patient/home");
  };

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

    const firstAvailable = days.find((day) => slots.some((slot) => slot.formattedDate === day.fullDate));

    if (firstAvailable) {
      setSelectedDay(firstAvailable.fullDate);
    }
  }, [slots, days]);

  const slotsForDay = useMemo(() => {
    return slots.filter((slot) => slot.formattedDate === selectedDay).sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [slots, selectedDay]);

  const availableDays = useMemo(() => {
    return days.filter((day) => slots.some((slot) => slot.formattedDate === day.fullDate));
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
        value: isPresent(doctor.consultation_fee) ? `₹${doctor.consultation_fee}` : null,
        label: "Consultation fee",
        sub: <span className="text-[10px] text-gray-400">per visit</span>,
      },
      {
        key: "patients",
        value: isPresent(doctor.patients_count) ? `${doctor.patients_count}+` : null,
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
        value: isPresent(doctor.patients_count) ? `${doctor.patients_count}+` : null,
      },
    ].filter((item) => isPresent(item.value));
  }, [doctor]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f4f0]">
        <p className="text-sm text-gray-400">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f4f0]">
        <p className="text-sm text-gray-400">Couldn't load this doctor's profile.</p>
      </div>
    );
  }

  const initiateAppointmentHandler = async () => {
    try {
      const slotId = selectedSlot._id;
      const dr_id = selectedSlot.doctor;
      const res = await axios.post(`/appointment/initiate-appointment/${slotId}`, {
        dr_id,
      });
      console.log(res);
      initiatePaymentHandler();
    } catch (error) {
      console.log("error initiating appointment", error);
      toast.error(error.response?.data?.message || "Unable to initiate appointment");
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
      toast.error(error.response?.data?.message || "Unable to initiate payment");
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
        toast.success("Payment successful!");

        setAppointmentId(paymentData.appointmentId);
        setShowSymptomForm(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to verify payment");
      console.log("error during payment verification", error);
    }
  };

  const submitSymptoms = async () => {
    try {
      if (!symptoms.trim()) {
        toast.error("Please describe your symptoms");
        return;
      }

      const res = await axios.post(`/appointment/summarize-symptoms/${appointmentId}`, {
        patient_text: symptoms,
      });

      if (res.data.success) {
        toast.success("Symptoms submitted");

        setShowSymptomForm(false);
        navigate("/patient/home");
      }
    } catch (error) {
      console.log("error submitting symptoms", error);

      toast.error(error.response?.data?.message || "Unable to submit symptoms");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f5f4f0]">
      <div className="blob1 absolute top-0 left-0 z-0 h-full w-full opacity-50" />

      <div className="blob2 absolute top-25 -left-35 z-0 h-[50%] w-[50%] opacity-40" />

      <Navbar />

      <main className="relative z-10 w-full flex-1 px-6 py-8 lg:px-12">
        <div className="mx-auto max-w-[2000px]">
          <button onClick={() => navigate(-1)} className="mb-8 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-[#7c5ce8] shadow-sm transition-all hover:bg-purple-50">
            <ArrowLeft size={18} />
          </button>

          <section className="sm:pr-8shadow-sm mb-6 flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-5 sm:py-6 sm:pl-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="hidden h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#ede9fe] text-2xl font-semibold text-[#7c5ce8] sm:flex">
                {doctor?.profilePicture ? <img src={doctor.profilePicture} alt="" className="h-full w-full object-cover" /> : <span>{initials}</span>}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-xl font-semibold text-gray-900 sm:text-2xl">Dr. {doctor.name}</h1>

                  {doctor.isVerified && <BadgeCheck size={18} className="shrink-0 fill-[#ede9fe] text-[#9b87f5]" />}
                </div>

                <p className="mt-1 truncate text-sm text-gray-400">{doctor.degrees.join(", ")}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                  {doctor.department && <span className="rounded-full bg-[#f3edff] px-3 py-1 text-xs text-[#7c5ce8]">{doctor.department}</span>}

                  {doctor.hospital_name && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} />
                      {doctor.hospital_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {doctor.consultation_fee != null && (
              <div className="shrink-0 text-left md:text-right">
                <p className="text-3xl font-semibold">₹{doctor.consultation_fee}</p>

                <p className="text-xs text-gray-400">per consult</p>
              </div>
            )}
          </section>

          <div className="grid grid-cols-12 gap-6">
            {/* LEFT CONTENT */}
            <div className="col-span-12 space-y-6 lg:col-span-8">
              {statFields.length > 0 && (
                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-sm font-medium text-gray-700">At a glance</h2>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {statFields.map((field) => (
                      <StatBox key={field.key} value={field.value} label={field.label} sub={field.sub} />
                    ))}
                  </div>
                </section>
              )}

              {doctor.bio && (
                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 font-medium text-gray-800">About</h2>

                  <p className="text-sm leading-relaxed text-gray-500">{doctor.bio}</p>
                </section>
              )}

              {infoFields.length > 0 && (
                <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 font-medium text-gray-800">Details</h2>

                  {infoFields.map((field) => (
                    <InfoRow key={field.key} icon={field.icon} label={field.label} value={field.value} />
                  ))}
                </section>
              )}
            </div>

            {/* BOOKING PANEL */}

            <aside className="col-span-12 lg:col-span-4">
              <div className="sticky top-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-gray-900">Book your Slot</h1>

                <div className="mt-3 mb-4 flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays size={15} className="text-[#9b87f5]" />
                  Select date
                </div>

                {availableDays.length === 0 ? (
                  <p className="mb-6 py-4 text-center text-xs text-gray-400">No upcoming dates with slots.</p>
                ) : (
                  <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto pb-2">
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
                          className={`flex h-[68px] min-w-[68px] cursor-pointer flex-col items-center justify-center rounded-xl border transition-all ${
                            active ? "border-[#7c5ce8] bg-[#7c5ce8] text-white shadow-md shadow-purple-200" : "border-purple-100 bg-white text-gray-500 hover:border-purple-300"
                          }`}
                        >
                          <span className="text-[10px] opacity-80">{today ? "Today" : day.label.split(" ")[0]}</span>

                          <span className="text-sm font-medium">{day.label.split(" ")[1] || new Date(day.fullDate).getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} className="text-[#9b87f5]" />
                  Available slots
                </div>

                {slotsForDay.length === 0 ? (
                  <p className="py-4 text-center text-xs text-gray-400">No slots available on this day.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {slotsForDay.map((slot) => {
                      const disabled = !slot.isAvailable || slot.is_booked || slot.status === "booked";

                      const selected = selectedSlot?._id === slot._id;

                      return (
                        <button
                          key={slot._id}
                          disabled={disabled}
                          onClick={() => setSelectedSlot(slot)}
                          className={`h-[38px] rounded-xl border text-xs transition-all ${
                            !slot.isAvailable
                              ? "cursor-not-allowed border-red-200 bg-red-50 text-red-400"
                              : disabled
                                ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through"
                                : selected
                                  ? "border-[#7c5ce8] bg-[#7c5ce8] text-white"
                                  : "cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {formatTime(slot.start_time)}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-5 flex items-center gap-5 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-100" />
                    Available
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#7c5ce8]" />
                    Selected
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-200" />
                    Taken
                  </div>
                </div>

                <button disabled={!selectedSlot} onClick={initiateAppointmentHandler} className="mt-6 w-full cursor-pointer rounded-xl bg-[#7c5ce8] py-4 text-white disabled:bg-gray-200">
                  {selectedSlot ? `Continue - ${formatTime(selectedSlot.start_time)}` : "Select a slot to continue"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {showSymptomForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-3xl bg-white p-8 shadow-xl">
            <span className="mb-3 inline-block rounded-full bg-[#f3edff] px-3 py-1 text-[11px] font-medium text-[#7c5ce8]">AI-powered visit prep</span>

            <h2 className="text-2xl leading-tight font-semibold text-gray-900">Help your doctor walk in prepared</h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-400">Describe what you're experiencing and we'll turn it into a clean clinical summary — so your appointment starts with answers, not small talk.</p>

            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Example: Fever since 3 days, headache, body pain, worse at night..." className="mt-6 h-64 w-full resize-none rounded-xl border border-gray-200 p-4 text-sm focus:border-[#9b87f5] focus:outline-none" />

            <button onClick={submitSymptoms} className="mt-5 w-full cursor-pointer rounded-xl bg-[#7c5ce8] py-3.5 font-medium text-white transition-colors hover:bg-[#6d4fd8]">
              Generate my summary
            </button>

            <button onClick={skipSymptomsHandler} className="mt-2.5 w-full cursor-pointer rounded-xl py-3 text-sm font-medium text-[#7c5ce8] transition-colors hover:bg-[#faf9ff]">
              I'll do this later from my dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
