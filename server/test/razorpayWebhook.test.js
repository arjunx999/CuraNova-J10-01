import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  parseRazorpayPaymentEvent,
  reconcileRazorpayPayment,
  verifyRazorpayWebhookSignature,
} from "../services/razorpayWebhook.js";

const secret = "webhook-test-secret";

const makePayload = (event, orderId = "order_123") =>
  Buffer.from(JSON.stringify({
    event,
    payload: { payment: { entity: { order_id: orderId } } },
  }));

const sign = (body) =>
  crypto.createHmac("sha256", secret).update(body).digest("hex");

test("verifies webhook signatures against the raw request body", () => {
  const body = makePayload("payment.captured");
  assert.equal(verifyRazorpayWebhookSignature(body, sign(body), secret), true);
  assert.equal(verifyRazorpayWebhookSignature(body, sign(Buffer.from("different")), secret), false);
  assert.equal(verifyRazorpayWebhookSignature(body, "bad-signature", secret), false);
});

test("parses supported events and requires their order ID", () => {
  assert.deepEqual(parseRazorpayPaymentEvent(makePayload("payment.captured")), {
    eventName: "payment.captured",
    orderId: "order_123",
  });
  assert.equal(parseRazorpayPaymentEvent(Buffer.from("{")), null);
  assert.equal(parseRazorpayPaymentEvent(makePayload("payment.failed", "")), null);
});

test("reconciliation is order-scoped, idempotent, and does not downgrade confirmed payments", async () => {
  const appointment = {
    razorpayOrderId: "order_123",
    payment_status: "pending",
    status: "pending",
    expiresAt: new Date(),
    processedRazorpayWebhookEventIds: [],
  };
  const Appointment = {
    async findOneAndUpdate(filter, update) {
      if (appointment.razorpayOrderId !== filter.razorpayOrderId) return null;
      if (filter.payment_status.$ne === appointment.payment_status) return null;
      if (appointment.processedRazorpayWebhookEventIds.includes(filter.processedRazorpayWebhookEventIds.$ne)) return null;
      Object.assign(appointment, update.$set);
      appointment.processedRazorpayWebhookEventIds.push(
        update.$addToSet.processedRazorpayWebhookEventIds,
      );
      return appointment;
    },
  };

  await reconcileRazorpayPayment({
    Appointment,
    eventName: "payment.captured",
    eventId: "evt_capture",
    orderId: "another_order",
  });
  assert.equal(appointment.payment_status, "pending");

  await reconcileRazorpayPayment({
    Appointment,
    eventName: "payment.captured",
    eventId: "evt_capture",
    orderId: "order_123",
  });
  assert.equal(appointment.payment_status, "confirmed");
  assert.equal(appointment.status, "confirmed");
  assert.equal(appointment.expiresAt, null);

  await reconcileRazorpayPayment({
    Appointment,
    eventName: "payment.failed",
    eventId: "evt_late_failure",
    orderId: "order_123",
  });
  assert.equal(appointment.payment_status, "confirmed");
});

test("a failed event is recorded once and a later capture can confirm that order", async () => {
  const appointment = {
    razorpayOrderId: "order_456",
    payment_status: "pending",
    status: "pending",
    processedRazorpayWebhookEventIds: [],
  };
  let updates = 0;
  const Appointment = {
    async findOneAndUpdate(filter, update) {
      if (appointment.razorpayOrderId !== filter.razorpayOrderId) return null;
      if (appointment.payment_status === filter.payment_status.$ne) return null;
      if (appointment.processedRazorpayWebhookEventIds.includes(filter.processedRazorpayWebhookEventIds.$ne)) return null;
      Object.assign(appointment, update.$set);
      appointment.processedRazorpayWebhookEventIds.push(update.$addToSet.processedRazorpayWebhookEventIds);
      updates += 1;
      return appointment;
    },
  };

  const failure = {
    Appointment,
    eventName: "payment.failed",
    eventId: "evt_failed",
    orderId: "order_456",
  };
  await reconcileRazorpayPayment(failure);
  await reconcileRazorpayPayment(failure);
  assert.equal(appointment.payment_status, "failed");
  assert.equal(updates, 1);

  await reconcileRazorpayPayment({
    Appointment,
    eventName: "payment.captured",
    eventId: "evt_captured",
    orderId: "order_456",
  });
  assert.equal(appointment.payment_status, "confirmed");
  assert.equal(updates, 2);
});
