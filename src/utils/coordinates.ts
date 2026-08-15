export interface Coordinates {
  latitude: number;
  longitude: number;
}

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

/**
 * Parses a route-param string (or undefined/malformed value) into a finite
 * number within valid coordinate bounds, or null if it can't be trusted.
 */
export function parseCoordinateParam(value: string | undefined, bounds: [number, number]): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const [min, max] = bounds;
  if (parsed < min || parsed > max) return null;
  return parsed;
}

export function parseLatitudeParam(value: string | undefined): number | null {
  return parseCoordinateParam(value, [MIN_LATITUDE, MAX_LATITUDE]);
}

export function parseLongitudeParam(value: string | undefined): number | null {
  return parseCoordinateParam(value, [MIN_LONGITUDE, MAX_LONGITUDE]);
}

export function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export function formatCoordinates(coordinates: Coordinates): string {
  return `${formatCoordinate(coordinates.latitude)}, ${formatCoordinate(coordinates.longitude)}`;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance between two coordinates via the haversine formula.
 * Used to derive a laundry's "distance away" from a reference point until
 * the app requests the customer's live location on these screens — see
 * laundryService.ts.
 */
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}
