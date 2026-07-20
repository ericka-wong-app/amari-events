import { test, expect } from "vitest";
import { render } from "@testing-library/react";
import Home from "../page";

test("invitation shows the essential facts", () => {
  render(<Home />);
  const text = document.body.textContent ?? "";
  for (const fact of [
    "Amari",
    "July 26, 2026",
    "St. Benedict Parish",
    "Okairi",
    "2:00 PM",
    "4:00 PM",
  ]) {
    expect(text).toContain(fact);
  }
});
