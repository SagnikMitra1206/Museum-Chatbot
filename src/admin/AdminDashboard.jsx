import React from "react";
import ManageShows from "./ManageShows";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">🛠️ Admin Dashboard</h1>
      <ManageShows />
    </div>
  );
}
