// Utility to convert OSM opening_hours strings to human-readable text
const dayMap: Record<string, string> = {
  Mo: 'Mon',
  Tu: 'Tue',
  We: 'Wed',
  Th: 'Thu',
  Fr: 'Fri',
  Sa: 'Sat',
  Su: 'Sun'
};

function ordinalText(n: number): string {
  const ordinals = ['first', 'second', 'third', 'fourth', 'fifth'];
  return ordinals[n - 1] || `${n}th`;
}

export function humanizeOpeningHours(schedule: string): string {
  if (!schedule) return '';
  // Split into segments (e.g. multiple rules separated by ';')
  return schedule.split(';').map(segment => {
    const part = segment.trim();
    // Extract time intervals (e.g. "09:00-16:00,17:00-20:00")
    const timePattern = /\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})(?:,\d{1,2}:\d{2}-\d{1,2}:\d{2})*/;
    const match = part.match(timePattern);
    let daysPart = part;
    let timesPart = '';
    if (match) {
      timesPart = match[0];
      daysPart = part.replace(match[0], '').trim();
    }

    let daysText = '';

    if (daysPart.includes(',')) {
      daysText = daysPart.split(',').map(dp => humanizeDays(dp.trim())).join(', ');
    } else {
      daysText = humanizeDays(daysPart.trim());
    }

    const timesText = timesPart
      ? timesPart.split(',')
          .map(t => t.replace('-', ' to ').replace(/\b0(\d:)/g, '$1'))
          .join(', ')
      : '';

    return timesText ? `${daysText} ${timesText}` : daysText;
  }).join(', ');
}

function humanizeDays(dp: string): string {
  const repeatMatch = dp.match(/^([A-Za-z]{2})\[(\-?\d+)\]$/);
  if (repeatMatch) {
    const dow = dayMap[repeatMatch[1]] || repeatMatch[1];
    const num = parseInt(repeatMatch[2], 10);
    if (num === -1) {
      return `Last ${dow} of the month`;
    }
    if (num === -2) {
      return `Penultimate ${dow} of the month`;
    }
    return `${ordinalText(num)} ${dow} of the month`;
  }
  if (dp.includes('-')) {
    const [start, end] = dp.split('-');
    const startDay = dayMap[start] || start;
    const endDay = dayMap[end] || end;
    return `${startDay} to ${endDay}`;
  }
  return dayMap[dp] || dp;
}
