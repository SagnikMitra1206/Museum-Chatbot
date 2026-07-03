// controllers/paymentController.js

export function createPayment(req, res) {
  const { amount, ticketId } = req.body;

  if (!ticketId) {
    return res.json({
      success: false,
      message: "ticketId required"
    });
  }

  const paymentId = "PAY_" + Math.random().toString(36).substring(7);

  return res.json({
    success: true,
    paymentId,
    ticketId,   // 🔥 link to booking
    amount,
    status: "created"
  });
}

export function verifyPayment(req, res) {
  const { paymentId, ticketId, mode } = req.body;

  let status = "success";

  if (mode === "failed") status = "failed";
  if (mode === "pending") status = "pending";

  return res.json({
    success: true,
    paymentId,
    ticketId,   // 🔥 keep link
    status
  });
}