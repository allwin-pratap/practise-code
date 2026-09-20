export function formatLocalTime(value) {
  const [datePart, timePart] = value.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(year, month - 1, day, hour, minute))
    .replace(" at ", " · ");
}

export function getDayName(date) {
  return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
}
