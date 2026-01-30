import sgMail from "@sendgrid/mail";
import { Slot } from "../models/Slot.js";

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

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const dr_msg = {
      to: slot.doctor.email,
      from: "arjun.ver2520@gmail.com",
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
      <div style="font-family: Arial; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:8px;">
          
          <h2>New Appointment Scheduled</h2>

          <p>Hello Dr. ${slot.doctor.name},</p>
          <p>A patient has booked a consultation with you.</p>

          <div style="background:#f9fafb; padding:15px; border-radius:6px;">
            <p><b>Patient:</b> ${slot.bookedBy.name}</p>
            <p><b>Date:</b> ${formattedDate}</p>
            <p><b>Time:</b> ${slot.start_time}</p>
            <p><b>Consultation Fee:</b> ₹${slot.doctor.consultation_fee}</p>
          </div>

          <p style="margin-top:20px;">
            The payment has been received. Please check your dashboard.
          </p>

          <hr/>
          <p style="font-size:12px; color:#888;">
            CuraNova Doctor Support
          </p>
        </div>
      </div>
      `,
    };

    const user_msg = {
      to: slot.bookedBy.email,
      from: "arjun.ver2520@gmail.com",
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
      <div style="font-family: Arial; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:8px;">
          
          <h2>Appointment Confirmed</h2>

          <p>Hi ${slot.bookedBy.name},</p>
          <p>Your payment has been received and your appointment is confirmed.</p>

          <div style="background:#f9fafb; padding:15px; border-radius:6px;">
            <p><b>Doctor:</b> Dr. ${slot.doctor.name}</p>
            <p><b>Date:</b> ${formattedDate}</p>
            <p><b>Time:</b> ${slot.start_time}</p>
            <p><b>Amount Paid:</b> ₹${slot.doctor.consultation_fee}</p>
          </div>

          <p style="margin-top:20px;">
            Please join 5 minutes early from your dashboard.
          </p>

          <hr/>
          <p style="font-size:12px; color:#888;">
            CuraNova - Smart Healthcare Simplified
          </p>
        </div>
      </div>
      `,
    };

    await Promise.all([sgMail.send(user_msg), sgMail.send(dr_msg)]);

    console.log("Confirmation emails sent");
  } catch (error) {
    console.error("Email error:", error.message);
  }
};
