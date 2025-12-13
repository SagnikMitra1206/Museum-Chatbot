import { db } from "../config/db.js";

export const getAllShows = (req, res) => {
  const sql = `
    SELECT id, name, day_of_week, start_time, available_tickets, price
    FROM shows
    ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), start_time
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ DB error:", err);
      return res.status(500).json({ success: false, shows: [] });
    }

    const shows = results.map(show => ({
      id: show.id,
      name: show.name,
      day_of_week: show.day_of_week,
      start_time: show.start_time,
      available_tickets: show.available_tickets ?? 0,
      price: show.price ?? 0,
      selectedTickets: 1, // default for input
    }));

    res.json({ success: true, shows });
  });
};
