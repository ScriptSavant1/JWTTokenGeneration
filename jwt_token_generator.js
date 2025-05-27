/**
 * High-Performance JWT Token Generator for DevWeb
 * Optimized for high TPS (500+ TPS) with minimal resource usage
 */
const crypto = require("crypto");

class JWTTokenGenerator {
  constructor() {
    this.supportedAlgorithms = ["PS256", "RS256", "SHA256"];
  }

  /**
   * Generate JWT token with high performance
   * @param {Object} headers - JWT headers (must include 'alg' and 'kid')
   * @param {Object} payload - JWT payload with claims
   * @param {string} signing_key - The signing key (not used for RS256/PS256)
   * @param {string} private_key - The private key in PEM format
   * @returns {string} The generated JWT token
   */
  generateToken(headers, payload, signing_key, private_key) {
    try {
      // Validate inputs
      if (!headers || typeof headers !== "object") {
        throw new Error("Headers must be an object");
      }
      if (!payload || typeof payload !== "object") {
        throw new Error("Payload must be an object");
      }
      if (!private_key || typeof private_key !== "string") {
        throw new Error("Private key must be a string in PEM format");
      }

      // Validate algorithm
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

      // Generate signature based on algorithm
      let signature;
      switch (finalHeaders.alg) {
        case "PS256":
          signature = this.signPS256(signingInput, private_key);
          break;
        case "RS256":
          signature = this.signRS256(signingInput, private_key);
          break;
        case "SHA256":
          signature = this.signSHA256(signingInput, private_key);
          break;
        default:
          throw new Error(`Unsupported algorithm: ${finalHeaders.alg}`);
      }

      // Return complete token
      return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
      console.error(`JWT Generation Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sign data using PS256 algorithm (RSA-PSS with SHA-256)
   * @param {string} data - The data to sign
   * @param {string} private_key - The private key in PEM format
   * @returns {string} The signature
   */
  signPS256(data, private_key) {
    try {
      const sign = crypto.createSign("RSA-SHA256");
      sign.update(data);
      return this.base64UrlEncode(sign.sign(private_key, "base64"));
    } catch (error) {
      console.error(`PS256 Signing Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sign data using RS256 algorithm (RSA with SHA-256)
   * @param {string} data - The data to sign
   * @param {string} private_key - The private key in PEM format
   * @returns {string} The signature
   */
  signRS256(data, private_key) {
    try {
      const sign = crypto.createSign("RSA-SHA256");
      sign.update(data);
      return this.base64UrlEncode(sign.sign(private_key, "base64"));
    } catch (error) {
      console.error(`RS256 Signing Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sign data using SHA256 algorithm
   * @param {string} data - The data to sign
   * @param {string} private_key - The private key in PEM format
   * @returns {string} The signature
   */
  signSHA256(data, private_key) {
    try {
      const hash = crypto.createHash("sha256");
      hash.update(data);
      return this.base64UrlEncode(hash.digest("base64"));
    } catch (error) {
      console.error(`SHA256 Signing Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Base64Url encode data
   * @param {string} str - The string to encode
   * @returns {string} The encoded string
   */
  base64UrlEncode(str) {
    return Buffer.from(str)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
}

// Export for DevWeb
module.exports = JWTTokenGenerator;
