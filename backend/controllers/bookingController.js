// bookingController.js
import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import { createTicketPdf } from "./ticketController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function bookTicket(req, res) {
  const { showId, quantity, userId = "guest_user", purchaserName, purchaserEmail } = req.body;

  if (!showId || !quantity) {
    return res.json({ success: false, message: "Show ID & quantity are required" });
  }

  db.query("SELECT * FROM shows WHERE id = ?", [showId], async (err, results) => {
    if (err || !results.length) return res.json({ success: false, message: "Show not found" });

    const show = results[0];
    if (show.available_tickets < quantity) return res.json({ success: false, message: "Not enough tickets available" });

    const bookingCode = `BKG-${uuidv4().slice(0, 6).toUpperCase()}`;
    const totalPrice = show.price * quantity;

    // Insert ticket
    db.query(
      `INSERT INTO tickets (user_id, show_id, quantity, booking_date, purchaser_name, purchaser_email)
       VALUES (?,?,?,?,?,?)`,
      [userId, showId, quantity, new Date(), purchaserName || userId, purchaserEmail || "guest@example.com"],
      async (insertErr, insertResult) => {
        if (insertErr) return res.json({ success: false, message: "Failed to book ticket" });

        const ticketId = insertResult.insertId;

        // Decrement tickets
        db.query("UPDATE shows SET available_tickets = available_tickets - ? WHERE id = ?", [quantity, showId]);

        const bookingInfo = {
          bookingId: bookingCode,
          showName: show.name,
          date: show.day_of_week,
          time: show.start_time ? show.start_time.slice(0, 5) : "",
          purchaserName: purchaserName || userId,
          purchaserEmail: purchaserEmail || "guest@example.com",
          quantity,
          pricePerTicket: show.price,
          totalPrice,
        };

        try {
          const { webPath } = await createTicketPdf(bookingInfo);

          db.query("UPDATE tickets SET booking_code = ?, pdf_path = ? WHERE id = ?", [bookingCode, webPath, ticketId]);

          return res.json({
            success: true,
            ticketId,
            bookingCode,
            pdfUrl: `${process.env.BASE_URL || "http://localhost:5000"}${webPath}`,
            showName: show.name,
            quantity,
            totalPrice,
          });
        } catch (pdfErr) {
          console.error("PDF generation failed:", pdfErr);
          return res.json({ success: true, ticketId, bookingCode, message: "Ticket booked but PDF generation failed" });
        }
      }
    );
  });
}
