// bookingController.js
import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { createTicketPdf } from "./ticketController.js";

// ===============================
// 🟡 STEP 1: CREATE PENDING BOOKING
// ===============================
export function createPendingBooking(req, res) {
  const {
    showId,
    quantity,
    userId = "guest_user",
    purchaserName,
    purchaserEmail,
  } = req.body;

  if (!showId || !quantity) {
    return res.json({
      success: false,
      message: "Show ID & quantity required",
    });
  }

  db.query("SELECT * FROM shows WHERE id = ?", [showId], (err, results) => {
    if (err || !results.length) {
      return res.json({ success: false, message: "Show not found" });
    }

    const show = results[0];

    if (show.available_tickets < quantity) {
      return res.json({
        success: false,
        message: "Not enough tickets available",
      });
    }

    const bookingCode = `BKG-${uuidv4().slice(0, 6).toUpperCase()}`;
    const totalPrice = show.price * quantity;

    db.query(
      `INSERT INTO tickets 
       (user_id, show_id, quantity, booking_date, purchaser_name, purchaser_email, booking_code, status)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        userId,
        showId,
        quantity,
        new Date(),
        purchaserName || userId,
        purchaserEmail || "guest@example.com",
        bookingCode,
        "pending", // 🔥 KEY CHANGE
      ],
      (insertErr, result) => {
        if (insertErr) {
          return res.json({
            success: false,
            message: insertErr.message,
          });
        }

        return res.json({
          success: true,
          ticketId: result.insertId,
          bookingCode,
          showName: show.name,
          quantity,
          totalPrice,
          message: "Proceed to payment",
        });
      }
    );
  });
}

// ===============================
// 🟢 STEP 2: CONFIRM BOOKING
// ===============================
export function confirmBooking(req, res) {
  const { ticketId, paymentStatus } = req.body;

  if (!ticketId) {
    return res.json({
      success: false,
      message: "Missing ticketId",
    });
  }

  if (paymentStatus !== "success") {
    db.query("UPDATE tickets SET status='failed' WHERE id=?", [ticketId]);

    return res.json({
      success: false,
      message: "Payment failed",
    });
  }

  db.query(
    `SELECT t.*, s.name, s.day_of_week, s.start_time, s.price, s.available_tickets
     FROM tickets t
     JOIN shows s ON t.show_id = s.id
     WHERE t.id=?`,
    [ticketId],
    async (err, results) => {
      if (err || !results.length) {
        return res.json({
          success: false,
          message: "Booking not found",
        });
      }

      const booking = results[0];

      if (booking.available_tickets < booking.quantity) {
        return res.json({
          success: false,
          message: "Tickets sold out",
        });
      }

      // 🔥 Reduce seats NOW (not before)
      db.query(
        "UPDATE shows SET available_tickets = available_tickets - ? WHERE id=?",
        [booking.quantity, booking.show_id]
      );

      const totalPrice = booking.price * booking.quantity;

      const bookingInfo = {
        bookingId: booking.booking_code,
        showName: booking.name,
        date: booking.day_of_week,
        time: booking.start_time ? booking.start_time.slice(0, 5) : "",
        purchaserName: booking.purchaser_name,
        purchaserEmail: booking.purchaser_email,
        quantity: booking.quantity,
        pricePerTicket: booking.price,
        totalPrice,
      };

      try {
        const { webPath } = await createTicketPdf(bookingInfo);

        db.query(
          "UPDATE tickets SET status='confirmed', pdf_path=? WHERE id=?",
          [webPath, ticketId]
        );

        return res.json({
          success: true,
          message: "Booking confirmed",
          pdfUrl: `${process.env.BASE_URL || "http://localhost:5000"}${webPath}`,
        });
      } catch (err) {
        console.error(err);
        return res.json({
          success: true,
          message: "Confirmed but PDF failed",
        });
      }
    }
  );
}