/**
 * Simple test script for JWT Token Generator
 * Run this to test token generation with dummy data
 */
const crypto = require("crypto");

class JWTTokenGenerator {
  constructor() {
    this.supportedAlgorithms = ["PS256", "SHA256"];
  }

  async generateToken(headers, payload, signing_key, private_key) {
    try {
      // Quick validation
      if (!headers.alg || !this.supportedAlgorithms.includes(headers.alg)) {
        throw new Error(
          `Invalid algorithm. Supported: ${this.supportedAlgorithms.join(", ")}`
        );
      }
      if (!headers.kid) throw new Error("Missing 'kid' in headers");

      // Create final header with required fields
      const finalHeaders = { ...headers, typ: "JWT" };

      // Encode header and payload
      const encodedHeader = this.base64UrlEncode(JSON.stringify(finalHeaders));
      const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
      const signingInput = `${encodedHeader}.${encodedPayload}`;

      // Generate signature
      const signature = this.sign(signingInput, private_key, headers.alg);

      // Return complete token
      return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
      console.error(`JWT Generation Error: ${error.message}`);
      throw error;
    }
  }

  sign(data, privateKey, algorithm) {
    try {
      const sign = crypto.createSign("RSA-SHA256");
      sign.update(data);
      return this.base64UrlEncode(sign.sign(privateKey, "base64"));
    } catch (error) {
      console.error(`Signing Error: ${error.message}`);
      throw error;
    }
  }

  base64UrlEncode(str) {
    return Buffer.from(str)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
}

async function testJWTGeneration() {
  try {
    // Create instance of JWT Token Generator
    const tokenGenerator = new JWTTokenGenerator();

    // Dummy data for testing
    const headers = {
      alg: "PS256",
      kid: "test_key_123",
      typ: "JWT",
    };

    const payload = {
      sub: "test_user",
      iss: "test_issuer",
      aud: "test_audience",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "test_" + Date.now(),
    };

    // Generate a test RSA key pair
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    // Generate token
    console.log("Generating JWT token...");
    const token = await tokenGenerator.generateToken(
      headers,
      payload,
      "test_signing_key",
      privateKey
    );

    // Print results
    console.log("\nGenerated JWT Token:");
    console.log(token);
    console.log("\nToken Components:");
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Payload:", JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the test
testJWTGeneration();
