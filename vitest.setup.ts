import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom does not implement matchMedia; provide a stable stub so components
// that read prefers-reduced-motion can render under test.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: true, // treat tests as reduced-motion: keeps animated overlays inert
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
