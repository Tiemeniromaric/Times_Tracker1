import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// Attach all jest-dom matchers to Vitest's expect
expect.extend(matchers);
