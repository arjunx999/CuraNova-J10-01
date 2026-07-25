import { sendMail } from "../utils/mailer.js";
import { Slot } from "../models/Slot.js";

const createGoogleCalendarLink = (slot, doctorName) => {
  const startDate = new Date(
    `${slot.date.toISOString().split("T")[0]}T${slot.start_time}`,
  );

  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

  const formatGoogleDate = (date) =>
    date.toISOString().replace(/-|:|\.\d{3}/g, "");

  return (
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(`Appointment with Dr. ${doctorName}`)}` +
    `&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}` +
    `&details=${encodeURIComponent(
      "CuraNova online consultation appointment.",
    )}` +
    `&location=${encodeURIComponent("CuraNova Online Consultation")}`
  );
};

export const sendConfirmation = async (slot_id) => {
  try {
    const slot = await Slot.findById(slot_id)
      .populate("doctor", "email name consultation_fee")
      .populate("bookedBy", "email name");

    if (!slot || !slot.doctor || !slot.bookedBy) {
      throw new Error("Missing slot/doctor/patient data");
    }

    const formattedDate = slot.date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const googleCalendarLink = createGoogleCalendarLink(slot, slot.doctor.name);

    const doctorMail = {
      to: slot.doctor.email,
      subject: "New Appointment Scheduled - CuraNova",

      text: `
Hello Dr. ${slot.doctor.name},

A new appointment has been booked.

Patient: ${slot.bookedBy.name}
Date: ${formattedDate}
Time: ${slot.start_time}
Fee: ₹${slot.doctor.consultation_fee}

Payment received successfully.
`,

      html: `
      <div style="font-family:Arial;background:#f4f6f8;padding:20px;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px;">

          <h2>New Appointment Scheduled</h2>

          <p>Hello Dr. ${slot.doctor.name},</p>

          <p>
            A patient has booked a consultation with you.
          </p>


          <div style="background:#f9fafb;padding:15px;border-radius:6px;">

            <p>
              <b>Patient:</b> ${slot.bookedBy.name}
            </p>

            <p>
              <b>Date:</b> ${formattedDate}
            </p>

            <p>
              <b>Time:</b> ${slot.start_time}
            </p>

            <p>
              <b>Consultation Fee:</b> ₹${slot.doctor.consultation_fee}
            </p>

          </div>


          <a href="${googleCalendarLink}"
          style="
          display:inline-block;
          margin-top:20px;
          padding:12px 18px;
          background:#4285F4;
          color:white;
          text-decoration:none;
          border-radius:5px;
          font-weight:600;
          ">
          Add to Google Calendar
          </a>


          <p style="margin-top:20px;">
            The payment has been received. Please check your dashboard.
          </p>


          <hr/>

          <p style="font-size:12px;color:#888;">
            CuraNova Doctor Support
          </p>

        </div>
      </div>
      `,
    };

    const userMail = {
      to: slot.bookedBy.email,
      subject: "Appointment Confirmed - CuraNova",

      text: `
Hello ${slot.bookedBy.name},

Your appointment is confirmed.

Doctor: Dr. ${slot.doctor.name}
Date: ${formattedDate}
Time: ${slot.start_time}
Amount Paid: ₹${slot.doctor.consultation_fee}

Thank you for choosing CuraNova.
`,

      html: `
      <div style="font-family:Arial;background:#f4f6f8;padding:20px;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px;">

          <h2>Appointment Confirmed</h2>


          <p>
            Hi ${slot.bookedBy.name},
          </p>


          <p>
            Your payment has been received and your appointment is confirmed.
          </p>



          <div style="background:#f9fafb;padding:15px;border-radius:6px;">

            <p>
              <b>Doctor:</b> Dr. ${slot.doctor.name}
            </p>

            <p>
              <b>Date:</b> ${formattedDate}
            </p>

            <p>
              <b>Time:</b> ${slot.start_time}
            </p>

            <p>
              <b>Amount Paid:</b> ₹${slot.doctor.consultation_fee}
            </p>

          </div>



          <a href="${googleCalendarLink}"
          style="
          display:inline-block;
          margin-top:20px;
          padding:12px18px;
          background:#4285F4;
          color:white;
          text-decoration:none;
          border-radius:5px;
          font-weight:600;
          ">
          Add to Google Calendar
          </a>



          <p style="margin-top:20px;">
            Please join 5 minutes early from your dashboard.
          </p>


          <hr/>


          <p style="font-size:12px;color:#888;">
            CuraNova - Smart Healthcare Simplified
          </p>


        </div>
      </div>
      `,
    };

    await Promise.all([sendMail(userMail), sendMail(doctorMail)]);

    // console.log("Confirmation emails sent");
  } catch (error) {
    console.error("Email error:", error.message);
  }
};
