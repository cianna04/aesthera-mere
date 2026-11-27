export const APPOINTMENTS_STORAGE_KEY = "aesthera-admin-overview-appointments-v1";

export type PatientLinkedBooking = {
  id: string;
  client: string;
  patientId?: string;
  email?: string;
  phone?: string;
};

const samplePatientIds: Record<string, string> = {
  "sofia reyes": "PAT-1001",
  "bianca lim": "PAT-1002",
  "mika santos": "PAT-1003",
  "claire yu": "PAT-1004",
  "andrea cruz": "PAT-1005",
  "lara tan": "PAT-1006",
};

function normalizedName(value: string) { return value.trim().replace(/\s+/g, " ").toLowerCase(); }
function normalizedPhone(value?: string) { return (value ?? "").replace(/\D/g, ""); }

export function linkPatientBookings<T extends PatientLinkedBooking>(bookings: T[]): T[] {
  const linked: T[] = [];
  for (const booking of bookings) {
    const email = booking.email?.trim().toLowerCase();
    const phone = normalizedPhone(booking.phone);
    const name = normalizedName(booking.client);
    const match = linked.find((previous) =>
      (email && previous.email?.trim().toLowerCase() === email) ||
      (phone && normalizedPhone(previous.phone) === phone) ||
      (name && normalizedName(previous.client) === name),
    );
    const patientId = booking.patientId || match?.patientId || samplePatientIds[name] || `PAT-${booking.id.replace(/^APT-/, "")}`;
    linked.push({ ...booking, patientId });
  }
  return linked;
}
