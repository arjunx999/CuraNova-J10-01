import {
  parseRazorpayPaymentEvent,
  reconcileRazorpayPayment,
  verifyRazorpayWebhookSignature,
} from "../services/razorpayWebhook.js";
import { Appointment } from "../models/Appointment.js";

export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.get("x-razorpay-signature");
  const eventId = req.get("x-razorpay-event-id");

  if (!secret) {
    return res.status(503).json({ success: false, message: "Webhook is not configured" });
  }
  if (!verifyRazorpayWebhookSignature(req.body, signature, secret)) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }
  if (!eventId || eventId.length > 255) {
    return res.status(400).json({ success: false, message: "Missing or invalid webhook event ID" });
  }

  const event = parseRazorpayPaymentEvent(req.body);
  if (!event) {
    return res.status(400).json({ success: false, message: "Invalid webhook payload" });
  }
  if (!['payment.captured', 'payment.failed'].includes(event.eventName)) {
    return res.status(200).json({ success: true, ignored: true });
  }

  try {
    await reconcileRazorpayPayment({
      Appointment,
      eventName: event.eventName,
      eventId,
      orderId: event.orderId,
    });
    // Unknown orders, duplicate events, and already-confirmed records are no-op acknowledgements.
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook reconciliation failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to reconcile payment" });
  }
};
