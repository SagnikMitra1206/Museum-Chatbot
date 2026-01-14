import React, { useEffect, useState } from "react";
import { getMyTickets } from "../services/bookingService";

export default function TicketsSection({ userId }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function fetchTickets() {
      const data = await getMyTickets(userId);
      setTickets(data);
    }
    if (userId) fetchTickets();
  }, [userId]);

  if (!tickets.length) return <p>No tickets booked yet.</p>;

  return (
    <div className="tickets-container">
      <h2>My Tickets</h2>
      <div className="tickets-grid">
        {tickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <h3>{ticket.showName}</h3>
            <p>Date: {ticket.day}</p>
            <p>Time: {ticket.time}</p>
            <p>Quantity: {ticket.quantity}</p>
            <p>Booking ID: {ticket.bookingCode}</p>
            {ticket.pdfUrl && (
              <a href={ticket.pdfUrl} target="_blank" rel="noopener noreferrer">
                Download Ticket PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
