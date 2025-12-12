const API_BOOK = "http://localhost:5000/api/book";
const API_CANCEL_TICKET = "http://localhost:5000/api/cancel";
const API_MY_TICKETS = "http://localhost:5000/api/my-tickets";

async function downloadPdfBlob(resp, filename = `ticket_${Date.now()}.pdf`) {
  try {
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.warn("downloadPdfBlob error:", e);
    return false;
  }
}

export async function bookTickets(showId, showName, qty = 1, userId = "guest_user") {
  try {
    const resp = await fetch(API_BOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showId, quantity: qty, userId }),
    });

    const contentType = resp.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      const data = await resp.json();
      const message = data.reply ?? data.message ?? "Booking completed.";
      return {
        success: !!data.success ?? true,
        message,
        booking: data.booking ?? null,
        raw: data,
      };
    }

    if (resp.ok && contentType.includes("application/pdf")) {
      await downloadPdfBlob(resp);
      return { success: true, message: "Ticket downloaded (PDF).", booking: null };
    }

    const text = await resp.text().catch(() => null);
    return { success: resp.ok, message: text ?? "Unknown response from booking service." };
  } catch (err) {
    console.error("bookTickets network error:", err);
    return { success: false, message: "Network error while booking. Please try again." };
  }
}

export async function cancelTicket(ticketId, userId = "guest_user") {
  if (!ticketId) throw new Error("ticketId is required");

  try {
    const resp = await fetch(API_CANCEL_TICKET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, userId }),
    });

    const data = await resp.json();
    return {
      success: !!data.success,
      message: data.message ?? "Ticket cancelled successfully.",
      raw: data,
    };
  } catch (err) {
    console.error("cancelTicket network error:", err);
    return { success: false, message: "Network error while cancelling ticket." };
  }
}

// ====== NEW FUNCTION: fetch tickets for a user ======
export async function getMyTickets(userId) {
  if (!userId) return [];
  try {
    const resp = await fetch(`${API_MY_TICKETS}?userId=${userId}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.success ? data.tickets : [];
  } catch (err) {
    console.error("getMyTickets error:", err);
    return [];
  }
}

export default bookTickets;
