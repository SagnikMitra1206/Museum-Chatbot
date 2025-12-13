import { db } from "../config/db.js";

export function verifyTicket(req, res) {
  const { bookingId } = req.query;

  db.query(
    `SELECT * FROM tickets WHERE booking_code=?`,
    [bookingId],
    (err, results) => {
      if (err || !results.length)
        return res.status(404).send("Booking not found");

      res.json({ success: true, booking: results[0] });
    }
  );
}
