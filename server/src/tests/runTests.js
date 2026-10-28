import { runAllTests } from './testSuite.js';

console.log("=================================================");
console.log(" PathScope DSA Verification & Acceptance Tests   ");
console.log("=================================================\n");

const { allPassed, passedCount, totalCount, results } = runAllTests();

for (const test of results) {
  const icon = test.passed ? "✔ PASS" : "✖ FAIL";
  console.log(`[${icon}] [${test.id}] ${test.description}`);
  if (test.details) {
    console.log(`       Details: ${test.details}`);
  }
}

console.log("\n-------------------------------------------------");
console.log(`Summary: ${passedCount}/${totalCount} tests passed (${Math.round((passedCount/totalCount)*100)}%)`);
console.log("-------------------------------------------------");

if (!allPassed) {
  console.error("\n❌ Some tests failed!");
  process.exit(1);
} else {
  console.log("\n✅ All unit and real-map benchmark tests passed successfully!");
}

