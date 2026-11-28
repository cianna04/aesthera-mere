import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node's TypeScript test runner requires the explicit extension.
import { buildTreatmentAliases, buildTreatmentAnswer, buildTreatmentPriceBlock, treatmentMatchScore } from "../lib/assistant-content.ts";

const sample = {
  slug: "aqua-reset-facial",
  name: "Aqua Reset Facial",
  description: "Verified description.",
  price: "₱1,280",
  priceLabel: "Per session",
  packagePrice: "5+1 package: ₱6,400",
  sessions: "Personalized after assessment",
  duration: "Confirmed during consultation",
  downtime: "Usually minimal",
  benefits: ["Hydration", "Surface cleansing"],
};

test("treatment answer reads the current object instead of copied chatbot prices", () => {
  assert.match(buildTreatmentAnswer(sample), /\*\*Per session\*\*\n- ₱1,280/);
  assert.match(buildTreatmentAnswer({ ...sample, price: "₱1,380" }), /\*\*Per session\*\*\n- ₱1,380/);
});
test("package and per-session prices remain separately labeled", () => {
  const answer = buildTreatmentAnswer(sample);
  assert.match(answer, /\*\*Per session\*\*\n- ₱1,280/);
  assert.match(answer, /\*\*Package 5\+1\*\*\n- ₱6,400/);
});

test("multi-dose and package prices render as readable lines", () => {
  const block = buildTreatmentPriceBlock({
    priceLabel: "Per session",
    price: "2.5 mg: ₱2,490; 5 mg: ₱3,490; 7.5 mg: ₱4,490",
    packagePrice: "3+1 — 2.5 mg: ₱7,968; 5 mg: ₱11,168; 7.5 mg: ₱14,368",
  });
  assert.match(block, /\*\*Per session\*\*\n- 2\.5 mg: ₱2,490\n- 5 mg: ₱3,490\n- 7\.5 mg: ₱4,490/);
  assert.match(block, /\*\*Package 3\+1\*\*\n- 2\.5 mg: ₱7,968\n- 5 mg: ₱11,168\n- 7\.5 mg: ₱14,368/);
});

test("package notation is preserved exactly", () => {
  const answer = buildTreatmentAnswer({ ...sample, packagePrice: "10+1: ₱19,900" });
  assert.match(answer, /\*\*Package 10\+1\*\*\n- ₱19,900/);
  assert.doesNotMatch(answer, /11 sessions/);
});

test("optional fields appear only when approved data supplies them", () => {
  const answer = buildTreatmentAnswer({ ...sample, packagePrice: undefined, priceNote: undefined });
  assert.doesNotMatch(answer, /Package:/);
  assert.doesNotMatch(answer, /Price details:/);
});

test("description, sessions, duration, recovery, and approved purposes are retained", () => {
  const answer = buildTreatmentAnswer(sample);
  for (const expected of ["Verified description.", "Sessions:", "Duration:", "Preparation/recovery note:", "Designed for:"]) assert.match(answer, new RegExp(expected));
});

test("new treatment aliases are derived automatically", () => {
  const added = { slug: "new-glow-treatment", name: "Thera New Glow Treatment" };
  assert.ok(buildTreatmentAliases(added).includes("new glow"));
  assert.ok(treatmentMatchScore("new glow price", added.name, buildTreatmentAliases(added)) > 0);
});

test("acronyms and distinctive names work as short aliases", () => {
  assert.ok(buildTreatmentAliases({ slug: "ipl-hair-removal", name: "IPL Hair Removal" }).includes("ipl"));
  assert.ok(buildTreatmentAliases({ slug: "diode-hair-removal", name: "Diode Hair Removal" }).includes("diode"));
});

test("renamed treatment aliases follow the new approved name", () => {
  const renamed = { slug: "aqua-reset-facial", name: "Aqua Renewal Facial" };
  const aliases = buildTreatmentAliases(renamed);
  assert.ok(treatmentMatchScore("aqua renewal price", renamed.name, aliases) > treatmentMatchScore("old unrelated name", renamed.name, aliases));
});

test("removed treatment is not discoverable when absent from the supplied catalog", () => {
  const catalog = [sample].filter((item) => item.slug !== "removed-treatment");
  const found = catalog.filter((item) => treatmentMatchScore("removed treatment", item.name, buildTreatmentAliases(item)) > 0);
  assert.equal(found.length, 0);
});

test("one-character spelling errors still match meaningful treatment words", () => {
  const score = treatmentMatchScore("aqua reset facail", "Aqua Reset Facial", buildTreatmentAliases(sample));
  assert.ok(score >= 2.5);
});

test("generic price words alone do not select an arbitrary treatment", () => {
  assert.equal(treatmentMatchScore("magkano price", "Aqua Reset Facial treatment price magkano", buildTreatmentAliases(sample)), 0);
});

