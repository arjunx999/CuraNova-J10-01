import crypto from "crypto";

export const verifyRazorpayWebhookSignature = (rawBody, signature, secret) => {
  if (!Buffer.isBuffer(rawBody) || typeof signature !== "string" || !secret) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  let received;
  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
};

export const parseRazorpayPaymentEvent = (rawBody) => {
  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return null;
  }

  const eventName = payload?.event;
  if (!['payment.captured', 'payment.failed'].includes(eventName)) {
    return { eventName, orderId: null };
  }

  const orderId = payload?.payload?.payment?.entity?.order_id;
  if (typeof orderId !== "string" || !orderId) return null;
  return { eventName, orderId };
};

export const reconcileRazorpayPayment = ({
  Appointment,
  eventName,
  eventId,
  orderId,
}) => {
  const filter = {
    razorpayOrderId: orderId,
    payment_status: { $ne: "confirmed" },
    processedRazorpayWebhookEventIds: { $ne: eventId },
  };
  const update = {
    $set: eventName === "payment.captured"
      ? { payment_status: "confirmed", status: "confirmed", expiresAt: null }
      : { payment_status: "failed" },
    $addToSet: { processedRazorpayWebhookEventIds: eventId },
  };

  return Appointment.findOneAndUpdate(filter, update, { new: true });
};
