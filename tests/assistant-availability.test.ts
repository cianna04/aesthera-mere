import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node's TypeScript runner requires the explicit extension.
import { asksAvailabilityQuestion, asksDoctorAvailability, doctorAvailabilityContext, doctorAvailabilityMessage, doctorFromQuestion, doctorReferenceFromQuestion, requestedWeekdays, unknownDoctorAvailabilityMessage } from "../lib/assistant-availability.ts";
import type { DoctorProfile } from "../types/doctor.ts";

const doctor = (id: string, name: string, shortName: string): DoctorProfile => ({
  id, slug: id, name, shortName, title: "Aesthetic Physician", tagline: "", image: "",
  biography: [], expertise: [], credentials: [], affiliations: [], leaveStartDate: null, leaveEndDate: null,
  weeklySchedule: [{ day: "Friday", enabled: true, startTime: "09:00", endTime: "17:00" }],
  scheduleVerified: false, sortOrder: 1, createdAt: "", updatedAt: "",
});

const doctors = [
  doctor("dr-ian", "Dr. Ian Roces", "Dr. Ian"),
  doctor("dr-raine", "Dr. Raine", "Dr. Raine"),
  doctor("dr-dan", "Dr. John Daniel Co", "Dr. Dan"),
];
const clinicHours = "Monday–Tuesday and Thursday–Sunday: 10:00 AM–8:00 PM\nWednesday: Closed";

test("doctor availability takes priority over clinic-hour day keywords", () => {
  const question = "Is Doc Ian available on Monday or Wednesday?";
  const matched = doctorFromQuestion(question, doctors);
  assert.equal(matched?.id, "dr-ian");
  assert.equal(asksDoctorAvailability(question, matched), true);
  const answer = doctorAvailabilityMessage("en", matched!, requestedWeekdays(question), clinicHours);
  assert.match(answer.text, /Monday[\s\S]*not confirmed/i);
  assert.match(answer.text, /Wednesday:[*]* The clinic is closed/i);
});

test("Taglish and aliases work for all doctors", () => {
  for (const [question, id] of [["Available ba si Doc Raine ng Friday?", "dr-raine"], ["Sched ni Doc Dan sa Monday?", "dr-dan"]]) {
    const matched = doctorFromQuestion(question, doctors);
    assert.equal(matched?.id, id);
    assert.equal(asksDoctorAvailability(question, matched), true);
  }
});

test("follow-up context retains the selected doctor", () => {
  assert.equal(doctorAvailabilityContext("doctor-availability-dr-ian", doctors)?.id, "dr-ian");
  assert.deepEqual(requestedWeekdays("How about Friday?"), ["Friday"]);
});

test("an explicit unknown doctor never inherits the previous doctor's context", () => {
  const question = "Is Doc Sam available on Monday or Wednesday?";
  assert.equal(doctorFromQuestion(question, doctors), undefined);
  assert.equal(doctorReferenceFromQuestion(question), "Doc Sam");
  assert.equal(asksAvailabilityQuestion(question), true);
  const answer = unknownDoctorAvailabilityMessage("en", "Doc Sam", requestedWeekdays(question), clinicHours);
  assert.match(answer, /Doc Sam/);
  assert.match(answer, /not in the current verified/i);
  assert.doesNotMatch(answer, /Ian|Raine|Daniel/);
  assert.match(answer, /Wednesday:[*]* The clinic is closed/i);
});

test("a day-only follow-up has no false explicit doctor reference", () => {
  assert.equal(doctorReferenceFromQuestion("How about Friday?"), undefined);
  assert.equal(doctorAvailabilityContext("doctor-availability-dr-ian", doctors)?.id, "dr-ian");
});

test("unknown names without a Doc prefix also override stale context", () => {
  assert.equal(doctorReferenceFromQuestion("Is Sam available on Monday?"), "Sam");
  assert.equal(doctorReferenceFromQuestion("Available ba si Alex ng Friday?"), "Alex");
  assert.equal(doctorFromQuestion("Is Sam available on Monday?", doctors), undefined);
  assert.equal(doctorFromQuestion("Available ba si Alex ng Friday?", doctors), undefined);
});

test("generic availability wording does not invent a doctor name", () => {
  assert.equal(doctorReferenceFromQuestion("Is the doctor available on Monday?"), undefined);
  assert.equal(doctorReferenceFromQuestion("Is the clinic open on Monday?"), undefined);
});

test("unverified placeholder schedules are never presented as availability", () => {
  const answer = doctorAvailabilityMessage("en", doctors[0], ["Friday"], clinicHours);
  assert.match(answer.text, /availability is not confirmed/i);
  assert.doesNotMatch(answer.text, /listed for/);
});

test("future verified schedules are used with confirmation wording", () => {
  const answer = doctorAvailabilityMessage("en", { ...doctors[0], scheduleVerified: true }, ["Friday"], clinicHours);
  assert.match(answer.text, /9:00 AM–5:00 PM/);
  assert.match(answer.text, /still needs to confirm final availability/i);
});
