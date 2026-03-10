function formatDateInTimeZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shiftDate(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function calculateCurrentStreak(reviewDates: string[], timeZone: string, now = new Date()) {
  if (reviewDates.length === 0) {
    return 0;
  }

  const uniqueSortedDates = [...new Set(reviewDates)].sort().reverse();
  const today = formatDateInTimeZone(now, timeZone);
  const yesterday = shiftDate(today, -1);
  const latest = uniqueSortedDates[0];

  if (latest !== today && latest !== yesterday) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < uniqueSortedDates.length; index += 1) {
    const expectedPreviousDate = shiftDate(uniqueSortedDates[index - 1], -1);

    if (uniqueSortedDates[index] !== expectedPreviousDate) {
      break;
    }

    streak += 1;
  }

  return streak;
}
