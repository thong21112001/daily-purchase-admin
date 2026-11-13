import { test, describe, before } from "node:test";
import assert from "node:assert/strict";

import {
  signOwnerToken,
  verifyOwnerToken,
  verifyOwnerCredentials,
  AUTH_COOKIE_NAME,
} from "../../src/lib/auth.ts";

describe("Single-Owner Authentication Tests", () => {
  before(() => {
    // Sử dụng chuỗi mock placeholder an toàn
    process.env.JWT_SECRET = "replace_with_mock_jwt_secret_32_chars_long";
    process.env.OWNER_PASSWORD = "change_this_mock_test_password";
  });

  test("signOwnerToken & verifyOwnerToken works correctly with valid secret", () => {
    const token = signOwnerToken("admin_owner");
    assert.ok(token);

    const payload = verifyOwnerToken(token);
    assert.ok(payload);
    assert.equal(payload.username, "admin_owner");
    assert.equal(payload.role, "OWNER");
  });

  test("verifyOwnerToken rejects invalid or tampered tokens", () => {
    const invalidToken = "invalid.token.string";
    const payload = verifyOwnerToken(invalidToken);
    assert.equal(payload, null);
  });

  test("verifyOwnerCredentials correctly validates password", async () => {
    const isValid = await verifyOwnerCredentials("change_this_mock_test_password");
    assert.equal(isValid, true);

    const isWrong = await verifyOwnerCredentials("wrong_password");
    assert.equal(isWrong, false);
  });

  test("AUTH_COOKIE_NAME is defined", () => {
    assert.equal(AUTH_COOKIE_NAME, "daily_purchase_auth_session");
  });
});
