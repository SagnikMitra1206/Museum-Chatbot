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
      console.error("❌ Ticket not found:", err);
      return res.json({ reply: "Ticket not found or not yours." });
    }

    const ticket = results[0];

    // Restore tickets in shows table
    db.query(
      "UPDATE shows SET available_tickets = available_tickets + ? WHERE id = ?",
      [ticket.quantity, ticket.show_id],
      (restoreErr) => {
        if (restoreErr) {
          console.error("⚠️ Error restoring tickets:", restoreErr);
          return res.json({ reply: "Cancellation failed." });
        }

        // Delete the ticket
        db.query("DELETE FROM tickets WHERE id = ?", [ticketId], (deleteErr) => {
          if (deleteErr) {
            console.error("⚠️ Error deleting ticket:", deleteErr);
            return res.json({ reply: "Failed to cancel the booking." });
          }

          return res.json({
            reply: `❌ Your booking (Ticket ID: ${ticketId}) has been cancelled.`,
          });
        });
      }
    );
  });
};
