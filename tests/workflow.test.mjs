// Node >=22: node --experimental-strip-types --test tests/workflow.test.mjs
import assert from "node:assert/strict"
import { test } from "node:test"
import { canTransition } from "../lib/draftien/workflow.ts"

for (const [from, to] of [["planned", "in_review"], ["in_review", "approved"], ["in_review", "rejected"]]) {
  test(`allows ${from} -> ${to}`, () => assert.equal(canTransition(from, to), true))
}
for (const [from, to] of [["planned", "approved"], ["planned", "rejected"], ["approved", "in_review"], ["rejected", "approved"], ["in_review", "planned"]]) {
  test(`blocks ${from} -> ${to}`, () => assert.equal(canTransition(from, to), false))
}
