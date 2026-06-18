export interface FeaturedCollectionSchedule {
  categoryId: string;
  startDate: string;
  endDate: string;
}

export const MAX_FEATURED_COLLECTION_DAYS = 40;

export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isFeaturedCollectionScheduleActive(
  schedule: FeaturedCollectionSchedule,
  now = new Date()
): boolean {
  const start = parseDateOnly(schedule.startDate);
  const end = parseDateOnly(schedule.endDate);
  end.setHours(23, 59, 59, 999);
  const t = now.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function resolveActiveFeaturedCollectionIds(
  schedules: FeaturedCollectionSchedule[] | undefined,
  legacyIds: string[] | undefined,
  now = new Date()
): string[] {
  if (schedules?.length) {
    return schedules
      .filter((s) => isFeaturedCollectionScheduleActive(s, now))
      .map((s) => s.categoryId);
  }
  return legacyIds ?? [];
}
