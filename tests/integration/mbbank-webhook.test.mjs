import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("MB Bank Webhook Secret & Payload Routing Tests", () => {
  const EXPECTED_KEY = "replace_with_mock_webhook_key";

  function verifyMockSecret(headers, query) {
    const authHeader = headers["authorization"] || "";
    if (authHeader.startsWith("Bearer ") && authHeader.slice(7).trim() === EXPECTED_KEY) {
      return true;
    }
    const xSecret = headers["x-secret"] || headers["x-api-key"];
    if (xSecret && xSecret.trim() === EXPECTED_KEY) {
      return true;
    }
    if (query && query.secret === EXPECTED_KEY) {
      return true;
    }
    return false;
  }

  test("1. Webhook correctly authenticates via Bearer header, X-Secret and query parameter", () => {
    // 1. Bearer Header
    assert.ok(verifyMockSecret({ authorization: `Bearer ${EXPECTED_KEY}` }, {}));
    assert.ok(!verifyMockSecret({ authorization: "Bearer wrong_secret" }, {}));

    // 2. X-Secret Header
    assert.ok(verifyMockSecret({ "x-secret": EXPECTED_KEY }, {}));
    assert.ok(!verifyMockSecret({ "x-secret": "invalid" }, {}));

    // 3. Query Parameter
    assert.ok(verifyMockSecret({}, { secret: EXPECTED_KEY }));
    assert.ok(!verifyMockSecret({}, { secret: "wrong" }));

    // 4. Missing everything
    assert.ok(!verifyMockSecret({}, {}));
  });

  test("2. Payload discriminator accurately distinguishes SePay JSON from Android Forwarder text", () => {
    function routePayloadType(contentType, body) {
      if (contentType.includes("application/json")) {
        const json = typeof body === "string" ? JSON.parse(body) : body;
        if (
          json.transferAmount !== undefined ||
          json.referenceCode !== undefined ||
          json.accumulated !== undefined ||
          (json.gateway && String(json.gateway).toLowerCase().includes("mb"))
        ) {
          return "SEPAY_WEBHOOK";
        }
        return "ANDROID_FORWARDER";
      }
      return "ANDROID_FORWARDER";
    }

    // SePay Payload
    const sepayJSON = {
      referenceCode: "FT12345",
      transferAmount: 35000,
      accumulated: 1000000,
    };
    assert.equal(routePayloadType("application/json", sepayJSON), "SEPAY_WEBHOOK");

    // Android Forwarder JSON
    const forwarderJSON = {
      title: "MB Bank",
      text: "TK 0905123456|GD: +35,000VND 16/11/26 09:30|SD: 1,000,000VND|ND: CA PHE",
    };
    assert.equal(routePayloadType("application/json", forwarderJSON), "ANDROID_FORWARDER");

    // Raw plain text
    assert.equal(
      routePayloadType("text/plain", "TK 0905123456|GD: +35,000VND..."),
      "ANDROID_FORWARDER"
    );
  });
});
