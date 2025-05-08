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
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
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

/**
 * Returns human-readable opening times for a specific day and notes other open days.
 * Handles both two-letter codes and common abbreviations.
 */
export function humanizeOpeningForDay(schedule: string, targetCode: string): string {
  if (!schedule || !targetCode) return '';
  // Normalize targetCode to two-letter code
  let target = targetCode;
  if (!dayMap[target]) {
    const foundTarget = (Object.entries(dayMap) as [string,string][]).find(([,v]) => v === targetCode);
    if (foundTarget) target = foundTarget[0];
  }
  // Group days by identical time intervals
  const timeGroups: Record<string, string[]> = {};
  const segments = schedule.split(';').map(s => s.trim());
  const timePattern = /\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})*/;
  for (const segment of segments) {
    const match = segment.match(timePattern);
    if (!match) continue;
    const times = match[0];
    const daysPart = segment.replace(times, '').trim();
    // Normalize day tokens to codes and expand day ranges
    const dayTokens = daysPart.split(',').map(d => d.trim());
    const expandedCodes: string[] = [];
    
    // Process each token in day part
    for (const token of dayTokens) {
      // Handle day ranges (Mo-Sa)
      if (token.includes('-')) {
        const [startDay, endDay] = token.split('-');
        // Get all days in order Mo, Tu, We, Th, Fr, Sa, Su
        const allDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        const startIndex = allDays.indexOf(startDay);
        const endIndex = allDays.indexOf(endDay);
        
        if (startIndex >= 0 && endIndex >= 0) {
          // Include all days in the range, inclusive
          for (let i = startIndex; i <= endIndex; i++) {
            expandedCodes.push(allDays[i]);
          }
        } else {
          // Just add the original token if we couldn't understand the range
          expandedCodes.push(token);
        }
      } else {
        // Single day - normalize to code if it's a full name
        if (dayMap[token]) {
          expandedCodes.push(token);
        } else {
          const found = (Object.entries(dayMap) as [string,string][]).find(([,v]) => v === token);
          if (found) expandedCodes.push(found[0]);
          else expandedCodes.push(token);
        }
      }
    }
    
    // Add to time groups
    if (!timeGroups[times]) timeGroups[times] = [];
    for (const code of expandedCodes) {
      if (!timeGroups[times].includes(code)) timeGroups[times].push(code);
    }
  }
  // Find the group matching the selected day code
  for (const times in timeGroups) {
    const codes = timeGroups[times];
    if (!codes.includes(target)) continue;
    const dayName = dayMap[target] || target;
    const timesText = times.split(',')
      .map(t => t.replace('-', ' to ').replace(/\b0(\d:)/g, '$1'))
      .join(', ');
    // Add "Open on" prefix for consistent UI
    return `Open on ${dayName} ${timesText}`;
  }
  return '';
}
