import { expect, test } from "vitest";
import { isOperator, signInError } from "./policy";

test("sign-in requires a real email and the age confirmation", () => {
  expect(signInError({ email: "  ", over13: true })).toBe("Enter an email.");
  expect(signInError({ email: "not-an-email", over13: true })).toBe("That email does not look right.");
  expect(signInError({ email: "ada@example.com", over13: false })).toBe("Confirm you are 13 or older.");
  expect(signInError({ email: "ada@example.com", over13: true })).toBeNull();
});

test("operator access is an allowlist", () => {
  const previous = process.env.OPERATOR_EMAILS;
  process.env.OPERATOR_EMAILS = "Ada@Example.com";
  expect(isOperator("ada@example.com")).toBe(true);
  expect(isOperator("other@example.com")).toBe(false);
  process.env.OPERATOR_EMAILS = previous;
});
