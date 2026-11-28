import type { DoctorProfile } from "../types/doctor";

export const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type Weekday = (typeof weekdays)[number];
export type AssistantAvailabilityLanguage = "en" | "fil";

const weekdayAliases: Record<Weekday, RegExp> = {
  Monday: /\b(?:monday|mon|lunes)\b/,
  Tuesday: /\b(?:tuesday|tue|tues|martes)\b/,
  Wednesday: /\b(?:wednesday|wed|miyerkules|mierkules)\b/,
  Thursday: /\b(?:thursday|thu|thur|thurs|huwebes)\b/,
  Friday: /\b(?:friday|fri|biyernes)\b/,
  Saturday: /\b(?:saturday|sat|sabado)\b/,
  Sunday: /\b(?:sunday|sun|linggo)\b/,
};

const filipinoWeekday: Record<Weekday, string> = {
  Monday: "Lunes", Tuesday: "Martes", Wednesday: "Miyerkules", Thursday: "Huwebes",
  Friday: "Biyernes", Saturday: "Sabado", Sunday: "Linggo",
};

const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const doctorReferenceStopWords = new Set([
  "available", "availability", "schedule", "scheduled", "sched", "duty", "working", "on", "ng", "sa", "ba",
  "this", "next", "every", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "lunes", "martes", "miyerkules", "huwebes", "biyernes", "sabado", "linggo", "or", "and", "o", "at",
]);

export const doctorReferenceFromQuestion = (question: string) => {
  const words = normalize(question).split(" ");
  const prefixIndex = words.findIndex((word) => ["dr", "doc", "doctor", "doktor"].includes(word));
  const collectName = (startIndex: number, prefix = "") => {
    const nameWords: string[] = [];
    for (const word of words.slice(startIndex)) {
      if (["dr", "doc", "doctor", "doktor"].includes(word) && !nameWords.length) continue;
      if (doctorReferenceStopWords.has(word) || nameWords.length === 4) break;
      nameWords.push(word);
    }
    if (!nameWords.length || nameWords.every((word) => ["the", "any", "clinic", "doctor", "doktor"].includes(word))) return undefined;
    const name = nameWords.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return `${prefix}${name}`;
  };
  if (prefixIndex >= 0) return collectName(prefixIndex + 1, "Doc ");

  if (!asksAvailabilityQuestion(question)) return undefined;
  const siIndex = words.indexOf("si");
  if (siIndex >= 0) return collectName(siIndex + 1);
  const normalizedQuestion = normalize(question);
  const englishName = normalizedQuestion.match(/\bis\s+(.+?)\s+(?:available|scheduled|working|on duty)\b/)?.[1];
  if (!englishName) return undefined;
  const nameWords = englishName.split(" ").filter(Boolean);
  if (!nameWords.length || nameWords.some((word) => ["the", "a", "any", "clinic", "doctor", "doktor"].includes(word))) return undefined;
  return nameWords.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

export const requestedWeekdays = (question: string) => weekdays.filter((day) => weekdayAliases[day].test(normalize(question)));

export const doctorFromQuestion = (question: string, doctors: DoctorProfile[]) => {
  const normalizedQuestion = normalize(question);
  return doctors.find((doctor) => {
    const normalizedName = normalize(doctor.name);
    const normalizedShortName = normalize(doctor.shortName);
    const nameParts = [...new Set(`${normalizedName} ${normalizedShortName}`.split(" "))]
      .filter((part) => part.length >= 3 && !["doctor", "dr", "doc"].includes(part));
    const aliases = [normalizedName, normalizedShortName, normalizedName.replace(/^dr /, "doc "), normalizedShortName.replace(/^dr /, "doc "), ...nameParts];
    return aliases.some((alias) => new RegExp(`\\b${escapePattern(alias)}\\b`).test(normalizedQuestion));
  });
};

export const doctorAvailabilityContext = (contextId: string | undefined, doctors: DoctorProfile[]) => {
  const doctorId = contextId?.match(/^doctor-availability-(.+)$/)?.[1];
  return doctorId ? doctors.find((doctor) => doctor.id === doctorId) : undefined;
};

export const asksDoctorAvailability = (question: string, doctor?: DoctorProfile) => Boolean(doctor) && (
  asksAvailabilityQuestion(question)
);

export const asksAvailabilityQuestion = (question: string) => (
  /\b(?:available|availability|schedule|scheduled|sched|duty|working|clinic day|in clinic|nandoon|nandun|pasok)\b/.test(normalize(question))
  || requestedWeekdays(question).length > 0
);

const clinicStatusForDay = (day: Weekday, clinicHours: string) => {
  if (new RegExp(`${day}\\s*:\\s*Closed`, "i").test(clinicHours)) return { closed: true, hours: "" };
  const hours = clinicHours.match(/Monday[^:\n]*Tuesday[^:\n]*Thursday[^:\n]*Sunday\s*:\s*([^\n]+)/i)?.[1]?.trim();
  return { closed: false, hours: hours ?? "" };
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

export function doctorAvailabilityMessage(language: AssistantAvailabilityLanguage, doctor: DoctorProfile, days: Weekday[], clinicHours: string) {
  const contextId = `doctor-availability-${doctor.id}`;
  if (!days.length) return {
    contextId,
    text: language === "fil"
      ? `Anong araw mo gustong i-check para kay **${doctor.name}**? Hindi guaranteed ang doctor schedule hangga't hindi kino-confirm ng clinic.`
      : `Which day would you like to check for **${doctor.name}**? The doctor's schedule is not guaranteed until the clinic confirms it.`,
  };
  const lines = days.map((day) => {
    const label = language === "fil" ? filipinoWeekday[day] : day;
    const clinic = clinicStatusForDay(day, clinicHours);
    if (clinic.closed) return language === "fil" ? `- **${label}:** Sarado ang clinic.` : `- **${label}:** The clinic is closed.`;
    const workingDay = doctor.scheduleVerified ? doctor.weeklySchedule.find((item) => item.day.toLowerCase() === day.toLowerCase()) : undefined;
    if (workingDay?.enabled) {
      const schedule = `${formatTime(workingDay.startTime)}–${formatTime(workingDay.endTime)}`;
      return language === "fil"
        ? `- **${label}:** Naka-list si **${doctor.name}** nang **${schedule}**. Iko-confirm pa rin ng clinic ang final availability.`
        : `- **${label}:** **${doctor.name}** is listed for **${schedule}**. The clinic still needs to confirm final availability.`;
    }
    if (workingDay) return language === "fil"
      ? `- **${label}:** Walang verified schedule si **${doctor.name}** sa araw na ito.`
      : `- **${label}:** **${doctor.name}** has no verified schedule listed for this day.`;
    const openHours = clinic.hours ? ` (**${clinic.hours}**)` : "";
    return language === "fil"
      ? `- **${label}:** Bukas ang clinic${openHours}, pero hindi pa confirmed ang availability ni **${doctor.name}**.`
      : `- **${label}:** The clinic is open${openHours}, but **${doctor.name}**'s availability is not confirmed.`;
  });
  const closing = language === "fil"
    ? "Gamitin ang **Book Now** para mag-request ng schedule. Clinic staff pa rin ang magko-confirm ng doctor, date, at oras."
    : "Use **Book Now** to request a schedule. Clinic staff will still confirm the doctor, date, and time.";
  return { contextId, text: `${lines.join("\n")}\n\n${closing}` };
}

export function unknownDoctorAvailabilityMessage(
  language: AssistantAvailabilityLanguage,
  doctorReference: string,
  days: Weekday[],
  clinicHours: string,
) {
  const intro = language === "fil"
    ? `Wala si **${doctorReference}** sa current verified Aesthera Mère doctor profiles, kaya hindi ko ma-confirm ang schedule niya o kung affiliated siya sa clinic.`
    : `**${doctorReference}** is not in the current verified Aesthera Mère doctor profiles, so I cannot confirm their schedule or whether they are affiliated with the clinic.`;
  const dayLines = days.map((day) => {
    const label = language === "fil" ? filipinoWeekday[day] : day;
    const clinic = clinicStatusForDay(day, clinicHours);
    if (clinic.closed) return language === "fil" ? `- **${label}:** Sarado ang clinic.` : `- **${label}:** The clinic is closed.`;
    const hours = clinic.hours ? ` **${clinic.hours}**` : "";
    return language === "fil" ? `- **${label}:** Bukas ang clinic${hours}.` : `- **${label}:** The clinic is open${hours}.`;
  });
  const closing = language === "fil"
    ? "Gamitin ang **Book Now** para direktang itanong sa clinic. Hindi nito ginagarantiya ang doctor o appointment schedule."
    : "Use **Book Now** to ask the clinic directly. This does not guarantee the doctor or appointment schedule.";
  return `${intro}${dayLines.length ? `\n\n${dayLines.join("\n")}` : ""}\n\n${closing}`;
}

export function unknownDoctorMessage(
  language: AssistantAvailabilityLanguage,
  doctorReference: string,
  doctors: DoctorProfile[],
  bookingRequested = false,
) {
  const verifiedDoctors = doctors.map((doctor) => `**${doctor.shortName}**`).join(", ");
  if (language === "fil") {
    const intro = `Wala si **${doctorReference}** sa current verified Aesthera Mère doctor profiles, kaya hindi ko siya maipapakilala o maituturing na clinic doctor.`;
    const verified = `Ang currently listed doctors ay ${verifiedDoctors}.`;
    const booking = bookingRequested
      ? "Maaari mo pa ring gamitin ang **Book Now** para direktang magtanong sa clinic, pero hindi nito kino-confirm ang doctor o appointment."
      : "Kung ibang pangalan o spelling ang tinutukoy mo, sabihin mo lang at iche-check ko ulit sa verified profiles.";
    return `${intro}\n\n${verified}\n\n${booking}`;
  }
  const intro = `**${doctorReference}** is not in the current verified Aesthera Mère doctor profiles, so I cannot present or treat them as a clinic doctor.`;
  const verified = `The currently listed doctors are ${verifiedDoctors}.`;
  const booking = bookingRequested
    ? "You can still use **Book Now** to ask the clinic directly, but this does not confirm the doctor or appointment."
    : "If you meant another name or spelling, tell me and I’ll check the verified profiles again.";
  return `${intro}\n\n${verified}\n\n${booking}`;
}
