import { test } from "node:test";
import assert from "node:assert/strict";
import { numberReading } from "../src/lib/numberReadings";

test("mobile reading includes all digits, including country code", () => {
  const r = numberReading("+91 98765 43210", "mobile");
  assert.equal(r?.sum, 55); assert.equal(r?.number, 1);
});
test("vehicle reading counts digits, not letters", () => {
  const r = numberReading("KA 01 AB 1234", "vehicle");
  assert.equal(r?.sum, 11); assert.equal(r?.number, 2);
});
test("bad inputs rejected and zero is valid", () => {
  assert.equal(numberReading("123", "mobile"), null);
  assert.equal(numberReading("abc1234567890", "mobile"), null);
  assert.equal(numberReading("KA ABC", "vehicle"), null);
  assert.equal(numberReading("KA@123", "vehicle"), null);
  assert.equal(numberReading("0000", "vehicle")?.number, 0);
});
