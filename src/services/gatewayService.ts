import CircuitBreaker from "opossum";

// Mock function representing a real API call
const callExternalGateway = async (_payload: any) => {
  // Simulate a potential 5% failure rate for testing
  if (Math.random() < 0.05) throw new Error("Gateway Timeout");

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    id: `gw_${Math.random().toString(36).substring(2, 11)}`,
    success: true,
  };
};

const options = {
  timeout: 3000, // If gateway takes > 3s, fail
  errorThresholdPercentage: 50, // If 50% of requests fail, open circuit
  resetTimeout: 30000, // Wait 30s before trying again
};

export const gatewayBreaker = new CircuitBreaker(callExternalGateway, options);

gatewayBreaker.on("open", () => console.warn("⚠️ Gateway Circuit Opened!"));
gatewayBreaker.on("halfOpen", () =>
  console.log("🔍 Testing Gateway health..."),
);
gatewayBreaker.on("close", () => console.log("✅ Gateway Circuit Closed."));
