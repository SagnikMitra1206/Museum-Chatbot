// index.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import dialogflow from "@google-cloud/dialogflow";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { promisify } from "util";

// ====== IMPORT MYSQL CONNECTION AND ADMIN ROUTES ======
import { db } from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";

// ====== DIALOGFLOW SETUP ======
const dialogflowServiceAccount = JSON.parse(
  fs.readFileSync("./dialogflow-service-account.json", "utf-8")
);
const projectId = dialogflowServiceAccount.project_id;

// ✅ Verify project ID before starting
if (!projectId) {
  console.error("❌ Missing 'project_id' in dialogflow-service-account.json");
  process.exit(1);
} else {
  console.log("✅ Dialogflow Project ID:", projectId);
}

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: dialogflowServiceAccount.client_email,
    private_key: dialogflowServiceAccount.private_key,
  },
});

// ====== EXPRESS SERVER ======
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ====== Setup file/dir helpers ======
const writeFile = promisify(fs.writeFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TICKETS_DIR = path.join(__dirname, "tickets");
if (!fs.existsSync(TICKETS_DIR)) fs.mkdirSync(TICKETS_DIR, { recursive: true });

// Serve saved PDFs at /tickets/<filename>
app.use("/tickets", express.static(TICKETS_DIR, { maxAge: "7d" }));

// ====== ROUTE 1: GET SHOWS ======
app.get("/api/shows", (req, res) => {
  const sql = `
    SELECT * FROM shows 
    ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), start_time
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching shows:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ====== DIALOGFLOW HANDLER ======
app.post("/api/dialogflow", async (req, res) => {
  let { message, sessionId, userId } = req.body;

  // fallback sessionId
  if (!sessionId) {
    sessionId = uuidv4();
    console.warn("⚠️ No sessionId provided, generated new:", sessionId);
  }

  try {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "en-US",
        },
      },
    };

    const [response] = await sessionClient.detectIntent(request);
    const intentName = response.queryResult.intent?.displayName;
    console.log("🧠 Intent Name:", intentName);
    console.log("📦 Parameters:", response.queryResult.parameters);

    // ======= INTENT: Book Tickets by Date =======
    if (intentName === "Book Tickets by Date") {
      const dateParam =
        response.queryResult.parameters?.fields?.date?.stringValue || null;

      if (!dateParam) {
        return res.json({
          reply: "Please tell me which date you'd like to book tickets for.",
        });
      }

      const parsedDate = new Date(dateParam);
      if (isNaN(parsedDate)) {
        return res.json({
          reply: "That doesn't look like a valid date. Could you please repeat it?",
        });
      }

      const dayOfWeek = parsedDate.toLocaleString("en-US", { weekday: "long" });
      console.log("🗓️ Date:", dateParam, "→", dayOfWeek);

      const sql = `
        SELECT id, name, day_of_week, start_time, available_tickets, price 
        FROM shows 
        WHERE TRIM(LOWER(day_of_week)) = LOWER(?)
        ORDER BY start_time
      `;

      db.query(sql, [dayOfWeek], (err, results) => {
        if (err) {
          console.error("❌ Error fetching shows:", err);
          return res.json({ reply: "Sorry, could not fetch shows right now." });
        }

        if (results.length === 0) {
          return res.json({ reply: `No shows available on ${dayOfWeek}.` });
        }

        const options = results.map((show) => ({
          id: show.id,
          name: show.name,
          day: show.day_of_week,
          time: show.start_time.slice(0, 5),
          available_tickets: show.available_tickets,
          price: show.price,
          ticket_selection: {
            min: 1,
            max: show.available_tickets,
            selected: 1,
          },
        }));

        return res.json({
          reply: `Shows available on ${dayOfWeek}. Please select one and choose how many tickets you want to book:`,
          options,
        });
      });

      return;
    }

    // ======= INTENT: Show_List =======
    if (intentName === "Show_List") {
      const sql = `
        SELECT id, name, day_of_week, start_time, available_tickets, price 
        FROM shows 
        ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), start_time
      `;
      db.query(sql, (err, results) => {
        if (err) {
          console.error("Error fetching shows:", err);
          return res.json({ reply: "Sorry, could not fetch shows." });
        }
        if (results.length === 0)
          return res.json({ reply: "No shows available right now." });

        const options = results.map((show) => ({
          id: show.id,
          name: show.name,
          day: show.day_of_week,
          time: show.start_time.slice(0, 5),
          available_tickets: show.available_tickets,
          price: show.price,
        }));

        return res.json({
          reply: "Here are the available shows. Please select one to book:",
          options,
        });
      });

      return;
    }

    // ======= INTENT: Cancel_Ticket =======
    if (intentName === "Cancel_Ticket") {
      const user = userId || "guest_user";

      const sql = `
        SELECT t.id AS ticket_id, s.name AS show_name, s.day_of_week, s.start_time, t.quantity
        FROM tickets t
        JOIN shows s ON t.show_id = s.id
        WHERE t.user_id = ?
      `;

      db.query(sql, [user], (err, results) => {
        if (err) {
          console.error("❌ Error fetching tickets:", err);
          return res.json({ reply: "Sorry, I couldn’t retrieve your bookings." });
        }

        if (results.length === 0) {
          return res.json({
            reply: "You don’t have any active bookings to cancel.",
          });
        }

        const options = results.map((ticket) => ({
          id: ticket.ticket_id,
          name: ticket.show_name,
          day: ticket.day_of_week,
          time: ticket.start_time.slice(0, 5),
          quantity: ticket.quantity,
          cancel_option: true,
        }));

        return res.json({
          reply: "Here are your booked tickets. Select one to cancel:",
          options,
        });
      });

      return;
    }

    // ======= DEFAULT RESPONSE =======
    res.json({ reply: response.queryResult.fulfillmentText });
  } catch (error) {
    console.error("Dialogflow Error:", error);
    res.status(500).json({ reply: "Sorry, something went wrong with Dialogflow." });
  }
});

//
// ===== Helper: createTicketPdfFile (uses pdf-lib + qrcode) =====
//
async function createTicketPdfFile(booking) {
  const {
    bookingCode,
    showName,
    date,
    time,
    purchaserName,
    purchaserEmail,
    quantity,
    pricePerTicket,
    totalPrice,
    venue = "City Museum",
    seatInfo = "General Admission",
  } = booking;

  // verification URL encoded in QR
  const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const verifyUrl = `${BASE_URL.replace(/\/$/, "")}/verify?bookingId=${encodeURIComponent(bookingCode)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 300 });

  // create PDF doc
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([540, 780]);
  const { width, height } = page.getSize();

  const fontRegularBytes = fs.readFileSync(path.join(__dirname, "fonts/NotoSans-Regular.ttf"));
const fontBoldBytes = fs.readFileSync(path.join(__dirname, "fonts/NotoSans-Bold.ttf"));

const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
const fontBold = await pdfDoc.embedFont(fontBoldBytes);

  const dark = rgb(0.07, 0.09, 0.11);
  const accent = rgb(0.02, 0.58, 0.54);

  // background card
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.9, 0.92, 0.94),
    borderWidth: 1,
  });

  // header and metadata
  page.drawText(venue, { x: 40, y: height - 70, size: 20, font: fontBold, color: dark });
  page.drawText("Admission Ticket", { x: 40, y: height - 92, size: 10, font: fontRegular, color: rgb(0.45,0.47,0.5) });
  page.drawText(showName, { x: 40, y: height - 130, size: 16, font: fontBold, color: dark, maxWidth: width - 220 });

  let metaY = height - 160;
  const gap = 16;
  page.drawText(`Date: ${date}`, { x: 40, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= gap;
  page.drawText(`Time: ${time}`, { x: 40, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= gap;
  page.drawText(`Seat: ${seatInfo}`, { x: 40, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= gap;
  page.drawText(`Quantity: ${quantity}`, { x: 40, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= gap;
  page.drawText(`Price (each): ₹${pricePerTicket}`, { x: 40, y: metaY, size: 11, font: fontRegular, color: dark }); metaY -= gap;
  page.drawText(`Total: ₹${totalPrice}`, { x: 40, y: metaY, size: 12, font: fontBold, color: accent });

  page.drawText("Purchaser:", { x: 40, y: metaY - 36, size: 10, font: fontBold, color: rgb(0.35,0.38,0.42) });
  page.drawText(`${purchaserName} (${purchaserEmail})`, { x: 40, y: metaY - 52, size: 10, font: fontRegular, color: dark });

  page.drawText(`Booking ID: ${bookingCode}`, { x: 40, y: 110, size: 9, font: fontRegular, color: rgb(0.45,0.48,0.5) });
  page.drawText("Please present this ticket (printed or on your phone).", { x: 40, y: 96, size: 9, font: fontRegular, color: rgb(0.45,0.48,0.5) });

  // embed QR image (convert dataURL -> buffer)
  const base64 = qrDataUrl.split(",")[1];
  const qrBuffer = Buffer.from(base64, "base64");
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  const qrDims = qrImage.scale(0.75);
  const qrX = width - 40 - qrDims.width;
  const qrY = height - 270;
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrDims.width, height: qrDims.height });
  page.drawText("Scan to verify", { x: qrX - 6, y: qrY - 12, size: 8, font: fontRegular, color: rgb(0.45,0.48,0.5) });

  const pdfBytes = await pdfDoc.save();

  // write file
  const filename = `ticket_${bookingCode}.pdf`;
  const filepath = path.join(TICKETS_DIR, filename);
  await writeFile(filepath, Buffer.from(pdfBytes));

  // webPath for serving
  const webPath = `/tickets/${filename}`;
  return { filename, filepath, webPath };
}

// ====== ROUTE: BOOK TICKETS (updated) ======
app.post("/api/book", (req, res) => {
  const { showId, quantity, userId = "guest_user", purchaserName = null, purchaserEmail = null } = req.body;

  if (!showId || !quantity) {
    return res.status(400).json({ success: false, message: "Please specify a show and ticket quantity." });
  }

  // fetch the show
  db.query("SELECT * FROM shows WHERE id = ?", [showId], async (err, results) => {
    if (err || results.length === 0) {
      console.error("Error fetching show:", err);
      return res.status(404).json({ success: false, message: "Show not found." });
    }

    const show = results[0];
    if (show.available_tickets < quantity) {
      return res.json({
        success: false,
        message: `Only ${show.available_tickets} tickets left for "${show.name}".`,
      });
    }

    // insert ticket row
    const insertSql = `INSERT INTO tickets (user_id, show_id, quantity, booking_date, purchaser_name, purchaser_email) VALUES (?, ?, ?, NOW(), ?, ?)`;
    db.query(insertSql, [userId, showId, quantity, purchaserName || null, purchaserEmail || null], async (insertErr, insertResult) => {
      if (insertErr) {
        console.error("Error inserting ticket:", insertErr);
        return res.status(500).json({ success: false, message: "Failed to book ticket. Please try again." });
      }

      const ticketDbId = insertResult.insertId;
      const bookingCode = `BKG-${ticketDbId}-${uuidv4().slice(0,6).toUpperCase()}`;

      // decrement available tickets
      db.query("UPDATE shows SET available_tickets = available_tickets - ? WHERE id = ?", [quantity, showId], async (updateErr) => {
        if (updateErr) {
          console.error("Error updating tickets:", updateErr);
          return res.status(500).json({ success: false, message: "Booking saved but ticket count update failed." });
        }

        // build booking object
        const pricePerTicket = show.price || 0;
        const totalPrice = pricePerTicket * quantity;
        const bookingObj = {
          bookingCode,
          showId,
          showName: show.name,
          date: show.day_of_week || show.date || "",
          time: (show.start_time ? show.start_time.slice(0,5) : ""),
          purchaserName: purchaserName || (userId === "guest_user" ? "Guest" : String(userId)),
          purchaserEmail: purchaserEmail || (userId === "guest_user" ? "guest@example.com" : String(userId)),
          quantity,
          pricePerTicket,
          totalPrice,
          venue: "City Museum",
        };

        try {
          const { filename, webPath } = await createTicketPdfFile(bookingObj);

          // update ticket row with booking_code and pdf_path
          const updateTicketSql = `UPDATE tickets SET booking_code = ?, pdf_path = ? WHERE id = ?`;
          db.query(updateTicketSql, [bookingCode, webPath, ticketDbId], (updErr) => {
            if (updErr) {
              console.warn("Failed to update ticket with code/pdf path:", updErr);
              // not fatal; continue
            }

            // success response (backwards compatible: include reply)
            const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
            return res.json({
              success: true,
              reply: `🎟️ Successfully booked ${quantity} ticket(s) for "${show.name}".`,
              message: `🎟️ Successfully booked ${quantity} ticket(s) for "${show.name}".`,
              booking: {
                id: ticketDbId,
                bookingCode,
                showId,
                showName: show.name,
                date: bookingObj.date,
                time: bookingObj.time,
                quantity,
                totalPrice,
                pdfUrl: webPath ? `${baseUrl}${webPath}` : null,
              },
            });
          });
        } catch (pdfErr) {
          console.error("PDF generation error:", pdfErr);
          // respond success but mention pdf failure
          return res.json({
            success: true,
            reply: `🎟️ Booked ${quantity} ticket(s) for "${show.name}". (Ticket PDF failed to generate.)`,
            message: `🎟️ Booked ${quantity} ticket(s) for "${show.name}". (Ticket PDF failed to generate.)`,
            booking: {
              id: ticketDbId,
              bookingCode,
              showId,
              showName: show.name,
              quantity,
              totalPrice,
              pdfUrl: null,
            },
          });
        }
      });
    });
  });
});

// ====== ROUTE: CANCEL TICKET ======
app.post("/api/cancel", (req, res) => {
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

    db.query(
      "UPDATE shows SET available_tickets = available_tickets + ? WHERE id = ?",
      [ticket.quantity, ticket.show_id],
      (restoreErr) => {
        if (restoreErr) {
          console.error("⚠️ Error restoring:", restoreErr);
          return res.json({ reply: "Cancellation failed." });
        }

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
});

// ====== GET /api/my-tickets ======
app.get("/api/my-tickets", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });

  const sql = `
  SELECT t.id, t.booking_code, t.pdf_path, t.quantity, t.booking_date,
         s.id AS show_id, s.name AS show_name, s.day_of_week, s.start_time, s.price
  FROM tickets t
  LEFT JOIN shows s ON t.show_id = s.id
  WHERE t.user_id = ?
  ORDER BY t.booking_date DESC
`;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("my-tickets error:", err);
      return res.status(500).json({ success: false, message: "DB error" });
    }
    const tickets = results.map((r) => {
  const pricePerTicket = r.price || 0; // get from shows table
  const totalPrice = pricePerTicket * r.quantity;
  return {
    id: r.id,
    bookingCode: r.booking_code,
    pdfUrl: r.pdf_path ? `${(process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "")}${r.pdf_path}` : null,
    quantity: r.quantity,
    bookingDate: r.booking_date,
    showId: r.show_id,
    showName: r.show_name,
    day: r.day_of_week,
    time: r.start_time ? r.start_time.slice(0,5) : null,
    pricePerTicket,
    totalPrice,
  };
});
    res.json({ success: true, tickets });
  });
});

// ====== VERIFY ENDPOINT ======
app.get("/verify", (req, res) => {
  const bookingId = req.query.bookingId;
  if (!bookingId) return res.status(400).send("Missing bookingId");

  const sql = `SELECT t.id, t.booking_code, t.pdf_path, t.quantity, t.booking_date, t.user_id, s.name AS show_name, s.day_of_week, s.start_time FROM tickets t LEFT JOIN shows s ON t.show_id = s.id WHERE t.booking_code = ? LIMIT 1`;
  db.query(sql, [bookingId], (err, results) => {
    if (err) {
      console.error("verify error:", err);
      return res.status(500).send("Server error");
    }
    if (!results || results.length === 0) {
      return res.status(404).send("Booking not found");
    }
    const r = results[0];
    return res.json({
      success: true,
      booking: {
        id: r.id,
        bookingCode: r.booking_code,
        showName: r.show_name,
        date: r.day_of_week,
        time: r.start_time ? r.start_time.slice(0,5) : null,
        quantity: r.quantity,
        userId: r.user_id,
      },
    });
  });
});

// ====== ROUTE: CHAT (SAVE/LOAD/CLEAR CHAT) ======
app.use("/api/chat", chatRoutes);
console.log("💬 Chat routes loaded successfully");

// ====== ROUTE: ADMIN PANEL ======
app.use("/api/admin", adminRoutes);

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
