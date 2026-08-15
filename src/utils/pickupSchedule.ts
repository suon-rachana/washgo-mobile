// Converts the pickup flow's coarse date/time-window selection (see
// src/data/mock/pickupOptions.ts) into a real timestamp for the
// create_order() RPC's pickup_scheduled_at. Start-of-window times match the
// detail text shown on each PickupTimeOption ("8:00 AM – 11:00 AM", etc).
const TIME_WINDOW_START_HOUR: Record<string, number> = {
  morning: 8,
  afternoon: 13,
  evening: 17,
};

export function resolvePickupScheduledAt(
  dateId: string | null | undefined,
  timeId: string | null | undefined
): string | null {
  if (!dateId || !timeId) return null;

  const startHour = TIME_WINDOW_START_HOUR[timeId];
  if (startHour === undefined) return null;
  if (dateId !== 'today' && dateId !== 'tomorrow') return null;

  const scheduled = new Date();
  if (dateId === 'tomorrow') scheduled.setDate(scheduled.getDate() + 1);
  scheduled.setHours(startHour, 0, 0, 0);

  return scheduled.toISOString();
}
