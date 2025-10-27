import React, { useState, useEffect } from "react";

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [form, setForm] = useState({
    name: "",
    day_of_week: "",
    start_time: "",
    available_tickets: 0,
    price: 0
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch shows
  const fetchShows = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/shows");
      const data = await res.json();
      setShows(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  // Add or update show
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        await fetch(`http://localhost:5000/api/admin/update-show/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      } else {
        // Add
        await fetch("http://localhost:5000/api/admin/add-show", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      }
      setForm({ name: "", day_of_week: "", start_time: "", available_tickets: 0, price: 0 });
      setEditingId(null);
      fetchShows();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete show
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/delete-show/${id}`, { method: "DELETE" });
      fetchShows();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit show
  const handleEdit = (show) => {
    setForm({
      name: show.name,
      day_of_week: show.day_of_week,
      start_time: show.start_time.slice(0, 5),
      available_tickets: show.available_tickets,
      price: show.price
    });
    setEditingId(show.id);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{editingId ? "Edit Show" : "Add Show"}</h2>
      <form className="space-y-2 mb-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Day of Week"
          value={form.day_of_week}
          onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="time"
          value={form.start_time}
          onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="number"
          placeholder="Available Tickets"
          value={form.available_tickets}
          onChange={(e) => setForm({ ...form, available_tickets: Number(e.target.value) })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className="border p-2 rounded w-full"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {editingId ? "Update Show" : "Add Show"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setForm({ name: "", day_of_week: "", start_time: "", available_tickets: 0, price: 0 }); }}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      <h2 className="text-xl font-semibold mb-2">Current Shows</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Day</th>
            <th className="border p-2">Time</th>
            <th className="border p-2">Tickets</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {shows.map(show => (
            <tr key={show.id}>
              <td className="border p-2">{show.name}</td>
              <td className="border p-2">{show.day_of_week}</td>
              <td className="border p-2">{show.start_time.slice(0,5)}</td>
              <td className="border p-2">{show.available_tickets}</td>
              <td className="border p-2">₹{show.price}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(show)} className="bg-blue-600 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(show.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
