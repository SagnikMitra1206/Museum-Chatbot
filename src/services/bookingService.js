export async function bookTickets(showId, showName, qty, userId) {
  const res = await fetch("http://localhost:5000/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ showId, quantity: qty, userId }),
  });
  const data = await res.json();
  return data.reply;
}
