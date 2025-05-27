/**
 * Example usage of JWT Token Generator
 * Simple example showing how to generate a JWT token
 */
load.initialize(async function () {
  try {
    // Import JWT Token Generator
    const JWTTokenGenerator = require("./jwt_token_generator.js");
    const tokenGenerator = new JWTTokenGenerator();

    // Generate JWT token with required components
    const token = await tokenGenerator.generateToken(
      { alg: "PS256", kid: "your_signing_key_id" }, // headers
      {
        sub: "your_subject",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }, // payload
      "your_signing_key", // signing key
      "your_private_key" // private key
    );

    load.log(`Generated JWT Token: ${token}`, load.LogLevel.info);
  } catch (error) {
    load.log(`Error in example script: ${error.message}`, load.LogLevel.error);
  }
});
