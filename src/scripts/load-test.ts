import axios from "axios";

const API_URL = "http://localhost:8080/payments/charge";
const TOTAL_REQUESTS = 100;
const CONCURRENCY = 10;

async function runTest() {
  console.log(`🚀 Starting load test: ${TOTAL_REQUESTS} requests...`);
  const start = performance.now();

  const requests = Array.from({ length: TOTAL_REQUESTS }).map((_, i) => {
    // Generate a mix of unique and duplicate keys
    const isDuplicate = i % 10 === 0;
    const key = isDuplicate
      ? "duplicate-key-static"
      : `unique-key-${Math.random().toString(36).substring(7)}`;

    return axios.post(
      API_URL,
      { amount: 1000, currency: "USD" },
      { headers: { "x-idempotency-key": key }, validateStatus: () => true },
    );
  });

  const results = await Promise.all(requests);

  const success = results.filter((r) => r.status === 200).length;
  const duplicates = results.filter(
    (r) => r.status === 425 || (r.status === 200 && r.data.isCached),
  ).length; // Adjust based on your logic
  const errors = results.filter((r) => r.status >= 500).length;

  const end = performance.now();
  console.log(`
  🏁 Test Finished in ${((end - start) / 1000).toFixed(2)}s
  ✅ Success (Unique): ${success}
  ♻️  Blocked/Cached (Idempotency): ${duplicates}
  ❌ Errors: ${errors}
  `);
}

runTest().catch(console.error);
