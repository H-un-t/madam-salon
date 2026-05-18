function toValidDate(value, fallbackDate = new Date()) {
  const date = new Date(value || fallbackDate);
  return Number.isNaN(date.getTime()) ? new Date(fallbackDate) : date;
}

function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

export function getScheduleEndDate(startDate, weeks, fallbackDate) {
  const start = toValidDate(startDate, fallbackDate);
  const end = new Date(start);
  end.setDate(end.getDate() + weeks * 7 - 1);
  return formatDateISO(end);
}

export function buildScheduleDates(startDate, weeks, fallbackDate) {
  const dates = [];
  const start = toValidDate(startDate, fallbackDate);
  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(formatDateISO(date));
  }
  return dates;
}
