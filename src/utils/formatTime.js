export const formatTime = (time) => {
  const [hour, minute] = time.split(":");
  const h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};
