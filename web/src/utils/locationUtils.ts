import { Market } from '../types/Market';
import { parseISO } from 'date-fns';

/**
 * Calculate the distance between two coordinates using the Haversine formula
 */
export function calculateDistance(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number {
  // Haversine formula for calculating distance between two points
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Extract coordinates from a market object
 */
export function getCoordinates(market: Market): [number, number] | null {
  if (typeof market.location === 'string') {
    const matches = market.location.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
    return matches ? [parseFloat(matches[1]), parseFloat(matches[2])] : null;
  }
  return market.location?.coordinates || null;
}
