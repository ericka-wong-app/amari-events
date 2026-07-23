import { test, expect } from "vitest";
import content from "../content";

test("the essential event facts are correct", () => {
  expect(content.celebrant).toContain("Amari");
  expect(content.dateLong).toContain("July 26, 2026");
  expect(content.ceremony.venue).toContain("St. Benedict Parish");
  expect(content.reception.venue).toContain("Okairi");
  expect(content.ceremony.time).toBe("2:00 PM");
  expect(content.reception.time).toBe("4:00 PM");
});
