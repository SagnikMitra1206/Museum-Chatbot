import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// ✅ Save a message with session_id
router.post("/save-message", (req, res) => {
  const { userId, sender, message, sessionId } = req.body;
  if (!userId || !sender || !message) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  const sql = `
    INSERT INTO chat_history (user_id, sender, message, session_id)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [userId, sender, message, sessionId || "default"], (err) => {
    if (err) {
      console.error("❌ Error saving message:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// ✅ Fetch all chat sessions for a user (for “Previous Chats”)
router.get("/sessions/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT session_id, MIN(timestamp) AS started_at
    FROM chat_history
    WHERE user_id = ?
    GROUP BY session_id
    ORDER BY started_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching sessions:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, sessions: results });
  });
});

// ✅ Fetch messages for a specific session
router.get("/history/:userId/:sessionId", (req, res) => {
  const { userId, sessionId } = req.params;
  const sql = `
    SELECT sender, message, timestamp
    FROM chat_history
    WHERE user_id = ? AND session_id = ?
    ORDER BY timestamp ASC
  `;
  db.query(sql, [userId, sessionId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching session history:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, messages: results });
  });
});
// ✅ Delete a specific chat session and its messages
router.delete("/clear/:userId/:sid", (req, res) => {
  const { userId, sid } = req.params;

  const sql = `
    DELETE FROM chat_history
    WHERE user_id = ? AND session_id = ?
  `;

  db.query(sql, [userId, sid], (err, result) => {
    if (err) {
      console.error("❌ Error deleting session:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "No session found" });
    }

    res.json({ success: true, message: "Session deleted successfully" });
  });
});


export default router;
