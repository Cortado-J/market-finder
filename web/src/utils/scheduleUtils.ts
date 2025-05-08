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

// Month abbreviation mapping
const monthMap: Record<string, string> = {
  Jan: 'January',
  Feb: 'February',
  Mar: 'March',
  Apr: 'April',
  May: 'May',
  Jun: 'June',
  Jul: 'July',
  Aug: 'August',
  Sep: 'September',
  Oct: 'October',
  Nov: 'November',
  Dec: 'December'
};

/**
 * Convert a number to its ordinal text representation
 */
function ordinalText(n: number): string {
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
  return ordinals[n - 1] || `${n}th`;
}

/**
 * Format ordinals like [1,3] into human-readable text
 */
function formatOrdinals(ordinals: string[], dow: string, includeOfMonth: boolean = true): string {
  if (ordinals.length === 1) {
    // Single ordinal case
    const num = parseInt(ordinals[0], 10);
    const monthSuffix = includeOfMonth ? ' of the month' : '';
    
    if (num === -1) {
      return `Last ${dow}${monthSuffix}`;
    }
    if (num === -2) {
      return `Penultimate ${dow}${monthSuffix}`;
    }
    return `${ordinalText(num)} ${dow}${monthSuffix}`;
  } else {
    // Multiple ordinals case
    const lastOrdinal = ordinals.pop();
    const formattedOrdinals = ordinals.map(n => {
      const num = parseInt(n, 10);
      if (num === -1) return "Last";
      if (num === -2) return "Penultimate";
      return ordinalText(num);
    }).join(", ");
    
    const lastNum = parseInt(lastOrdinal!, 10);
    const lastOrdinalText = lastNum === -1 ? "Last" : 
                         lastNum === -2 ? "Penultimate" : 
                         ordinalText(lastNum);
    
    const monthSuffix = includeOfMonth ? ' of the month' : '';
    return `${formattedOrdinals} and ${lastOrdinalText} ${dow}${monthSuffix}`;
  }
}

/**
 * Format month ranges like "Mar-Dec" into human-readable text
 */
function formatMonthRange(monthRange: string): string {
  if (!monthRange) return '';
  
  if (monthRange.includes('-')) {
    const [start, end] = monthRange.split('-').map(m => m.trim());
    const startMonth = monthMap[start] || start;
    const endMonth = monthMap[end] || end;
    return `${startMonth} to ${endMonth}`;
  }
  
  return monthMap[monthRange] || monthRange;
}

/**
 * Format time strings like "09:00-16:00" to "09:00 to 16:00"
 */
function formatTimeString(timeStr: string): string {
  return timeStr.replace('-', ' to ').replace(/\b0(\d:)/g, '$1');
}

export function humanizeOpeningHours(schedule: string): string {
  if (!schedule) return '';
  
  // Handle special patterns like Th[1,3] directly
  const ordinalPattern = /([A-Za-z]{2})\[([\d,\s-]+)\]\s+(\d{1,2}:\d{2}-\d{1,2}:\d{2})/;
  const ordinalMatch = schedule.match(ordinalPattern);
  
  if (ordinalMatch) {
    const dayCode = ordinalMatch[1];
    const ordinalStr = ordinalMatch[2];
    const timeStr = ordinalMatch[3];
    
    const dow = dayMap[dayCode] || dayCode;
    const ordinals = ordinalStr.split(',').map(n => n.trim()).filter(Boolean);
    const formattedDay = formatOrdinals(ordinals, dow, true);
    const formattedTime = formatTimeString(timeStr);
    
    return `${formattedDay} ${formattedTime}`;
  }
  
  // Handle month ranges (e.g., "Mar-Dec Sa 09:00-16:00" or "Nov 7-Dec 23 Mo-Su 10:00-19:00")
  const monthPattern = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{1,2})?(?:-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{1,2})?)?\ +([A-Za-z]{2}(?:[-,](?:[A-Za-z]{2}))*)\ +(\d{1,2}:\d{2}-\d{1,2}:\d{2})/;
  const monthMatch = schedule.match(monthPattern);

  if (monthMatch) {
    // Extract the full month range part (including potential date numbers)
    const fullMatch = monthMatch[0];
    const daysPart = monthMatch[3];
    const timeStr = monthMatch[4];
    
    // Extract the month range part by removing the day and time parts
    const monthRangePart = fullMatch
      .replace(new RegExp(`\\s+${daysPart}\\s+${timeStr.replace(/[-:]/g, '\\$&')}$`), '')
      .trim();
    
    // Format the month range text
    let monthRangeText = monthRangePart;
    
    // Handle special formatting for month-to-month periods
    const monthDatePattern = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+(\d{1,2}))?(?:-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+(\d{1,2}))?)?/;
    const mdMatch = monthRangePart.match(monthDatePattern);
    
    if (mdMatch) {
      const startMonth = mdMatch[1];
      const startDate = mdMatch[2] || '';
      const endMonth = mdMatch[3] || startMonth;
      const endDate = mdMatch[4] || '';
      
      const startText = startDate ? `${monthMap[startMonth] || startMonth} ${startDate}` : monthMap[startMonth] || startMonth;
      const endText = endDate ? `${monthMap[endMonth] || endMonth} ${endDate}` : monthMap[endMonth] || endMonth;
      
      if (startMonth === endMonth && !startDate && !endDate) {
        monthRangeText = startText;
      } else {
        monthRangeText = `${startText} to ${endText}`;
      }
    }
    
    let daysText = '';
    if (daysPart.includes(',')) {
      daysText = daysPart.split(',').map(dp => humanizeDays(dp.trim())).join(', ');
    } else if (daysPart.includes('-')) {
      daysText = humanizeDays(daysPart.trim());
    } else {
      daysText = dayMap[daysPart] || daysPart;
    }

    const formattedTime = formatTimeString(timeStr);
    
    return `${monthRangeText}: ${daysText} ${formattedTime}`;
  }
  
  // Use the normal processing for other patterns
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
      ? timesPart.split(',').map(t => formatTimeString(t)).join(', ')
      : '';

    return timesText ? `${daysText} ${timesText}` : daysText;
  }).join(', ');
}

function humanizeDays(dp: string): string {
  // Check if this is a month range that wasn't caught by the main pattern
  const monthRangePattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))?$/;
  const monthMatch = dp.match(monthRangePattern);
  if (monthMatch) {
    const startMonth = monthMatch[1];
    const endMonth = monthMatch[2] || startMonth;
    return formatMonthRange(`${startMonth}-${endMonth}`);
  }

  // Handle multiple ordinals like Th[1,3] (first and third Thursday)
  const multiOrdinalMatch = dp.match(/^([A-Za-z]{2})\[([\d,\s-]+)\]$/);
  if (multiOrdinalMatch) {
    const dow = dayMap[multiOrdinalMatch[1]] || multiOrdinalMatch[1];
    const ordinals = multiOrdinalMatch[2].split(',').map(n => n.trim()).filter(Boolean);
    return formatOrdinals(ordinals, dow, true);
  }
  
  if (dp.includes('-')) {
    const [start, end] = dp.split('-');
    
    // Check if this is a day range (both start and end are in dayMap)
    if (dayMap[start] && dayMap[end]) {
      const startDay = dayMap[start];
      const endDay = dayMap[end];
      return `${startDay} to ${endDay}`;
    }
    
    // For other types of ranges, just format generically
    return `${start} to ${end}`;
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
    const timesText = times.split(',').map(t => formatTimeString(t)).join(', ');
    // Add "Open on" prefix for consistent UI
    return `Open on ${dayName} ${timesText}`;
  }
  return '';
}
