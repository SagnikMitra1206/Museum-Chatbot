import { db } from "../config/db.js";

// Fetch all shows
export const getShows = (req, res) => {
  const sql = `
    SELECT * FROM shows 
    ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), start_time
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Add a new show
export const addShow = (req, res) => {
  const { name, day_of_week, start_time, available_tickets, price } = req.body;
  const sql = "INSERT INTO shows (name, day_of_week, start_time, available_tickets, price) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, day_of_week, start_time, available_tickets, price], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Show added successfully!", id: result.insertId });
  });
};

// Update a show
export const updateShow = (req, res) => {
  const { id } = req.params;
  const { name, day_of_week, start_time, available_tickets, price } = req.body;
  const sql = "UPDATE shows SET name=?, day_of_week=?, start_time=?, available_tickets=?, price=? WHERE id=?";
  db.query(sql, [name, day_of_week, start_time, available_tickets, price, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Show updated successfully!" });
  });
};

// Delete a show
export const deleteShow = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM shows WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Show deleted successfully!" });
  });
};
