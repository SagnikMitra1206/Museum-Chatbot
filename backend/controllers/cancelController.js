// controllers/cancelController.js
import { db } from "../config/db.js";

export const cancelTicket = (req, res) => {
  const { ticketId, userId = "guest_user" } = req.body;

  if (!ticketId) {
    return res.json({ reply: "Please provide a valid ticket ID to cancel." });
  }

  const sql = "SELECT * FROM tickets WHERE id = ? AND user_id = ?";
  db.query(sql, [ticketId, userId], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ reply: "Ticket not found or not yours." });
    }

    const ticket = results[0];

    // 🔥 Only restore seats if booking was confirmed
    const restoreSeats = ticket.status === "confirmed";

    const restoreQuery = restoreSeats
      ? "UPDATE shows SET available_tickets = available_tickets + ? WHERE id = ?"
      : null;

    const proceedDelete = () => {
      db.query("DELETE FROM tickets WHERE id = ?", [ticketId], (deleteErr) => {
        if (deleteErr) {
          return res.json({ reply: "Failed to cancel the booking." });
        }

        return res.json({
          reply: `❌ Booking (Ticket ID: ${ticketId}) cancelled.`,
        });
      });
    };

    if (restoreSeats) {
      db.query(
        restoreQuery,
        [ticket.quantity, ticket.show_id],
        (restoreErr) => {
          if (restoreErr) {
            return res.json({ reply: "Cancellation failed." });
          }
          proceedDelete();
        }
      );
    } else {
      // pending booking → no seat restoration
      proceedDelete();
    }
  });
};