import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import dialogflow from "@google-cloud/dialogflow";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

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

// ====== ROUTE 2: DIALOGFLOW HANDLER ======
app.post("/api/dialogflow", async (req, res) => {
  let { message, sessionId, userId } = req.body;

  // ✅ Always provide fallback sessionId if missing
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

// ====== ROUTE: BOOK TICKETS ======
app.post("/api/book", (req, res) => {
  const { showId, quantity, userId = "guest_user" } = req.body;

  if (!showId || !quantity) {
    return res.json({ reply: "Please specify a show and ticket quantity." });
  }

  db.query("SELECT * FROM shows WHERE id = ?", [showId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error fetching show:", err);
      return res.json({ reply: "❌ Show not found." });
    }

    const show = results[0];
    if (show.available_tickets < quantity) {
      return res.json({
        reply: `⚠️ Only ${show.available_tickets} tickets left for "${show.name}".`,
      });
    }

    const insertSql = `
      INSERT INTO tickets (user_id, show_id, quantity, booking_date)
      VALUES (?, ?, ?, NOW())
    `;
    db.query(insertSql, [userId, showId, quantity], (insertErr) => {
      if (insertErr) {
        console.error("Error inserting ticket:", insertErr);
        return res.json({ reply: "⚠️ Failed to book ticket. Please try again." });
      }

      db.query(
        "UPDATE shows SET available_tickets = available_tickets - ? WHERE id = ?",
        [quantity, showId],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating tickets:", updateErr);
            return res.json({ reply: "Booking saved but ticket count update failed." });
          }

          return res.json({
            reply: `🎟️ Successfully booked ${quantity} ticket(s) for "${show.name}". Enjoy your visit!`,
          });
        }
      );
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

// ====== ROUTE: CHAT (SAVE/LOAD/CLEAR CHAT) ======
app.use("/api/chat", chatRoutes);
console.log("💬 Chat routes loaded successfully");

// ====== ROUTE: ADMIN PANEL ======
app.use("/api/admin", adminRoutes);

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
