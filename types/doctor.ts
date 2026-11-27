export interface DoctorWorkingDay {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface DoctorProfile {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  title: string;
  tagline: string;
  image: string;
  biography: string[];
  expertise: string[];
  credentials: string[];
  affiliations: string[];
  leaveStartDate: string | null;
  leaveEndDate: string | null;
  weeklySchedule: DoctorWorkingDay[];
  /** Only true when weeklySchedule is approved for public availability answers. */
  scheduleVerified?: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type DoctorProfileInput = Omit<
  DoctorProfile,
  "id" | "createdAt" | "updatedAt"
>;
