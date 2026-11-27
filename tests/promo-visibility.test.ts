import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node's TypeScript test runner requires the explicit extension.
import { isPublicPromoOnDate } from "../lib/promo-visibility.ts";

const today = "2026-11-27";

test("active current promotions are visible", () => {
  assert.equal(isPublicPromoOnDate({ isActive: true, publishedAt: "2026-11-01", validUntil: "2026-12-31" }, today), true);
});
test("inactive promotions are hidden", () => {
  assert.equal(isPublicPromoOnDate({ isActive: false, publishedAt: "2026-11-01" }, today), false);
});

test("expired promotions are hidden", () => {
  assert.equal(isPublicPromoOnDate({ isActive: true, validUntil: "2026-11-26" }, today), false);
});

test("future-dated promotions are not exposed as active", () => {
  assert.equal(isPublicPromoOnDate({ isActive: true, publishedAt: "2026-12-01" }, today), false);
});

