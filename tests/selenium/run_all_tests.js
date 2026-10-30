import { runTest1 } from "./test1_display_students.js";
import { runTest2 } from "./test2_mark_seven_periods.js";
import { runTest3 } from "./test3_save_and_retrieve_date.js";
import { runTest4 } from "./test4_invalid_student_info.js";
import { runTest5 } from "./test5_duplicate_prevention.js";
import { runTest6 } from "./test6_monthly_attendance_totals.js";
import { runTest7 } from "./test7_attendance_percentage.js";
import { runTest8 } from "./test8_low_attendance_threshold.js";
import { runTest9 } from "./test9_monthly_report_export.js";
import { runTest10 } from "./test10_persistence_after_restart.js";

async function main() {
  console.log(`\n================================================================================`);
  console.log(`PULSE ATTENDANCE MANAGEMENT SYSTEM — AUTOMATED SELENIUM TEST SUITE`);
  console.log(`Specification: docs/Student Attendance Management System Using DevOps Tools.pdf`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`================================================================================\n`);

  const tests = [
    { id: 1, fn: runTest1 },
    { id: 2, fn: runTest2 },
    { id: 3, fn: runTest3 },
    { id: 4, fn: runTest4 },
    { id: 5, fn: runTest5 },
    { id: 6, fn: runTest6 },
    { id: 7, fn: runTest7 },
    { id: 8, fn: runTest8 },
    { id: 9, fn: runTest9 },
    { id: 10, fn: runTest10 },
  ];

  const results = [];
  const startTime = Date.now();

  for (const test of tests) {
    const t0 = Date.now();
    try {
      const res = await test.fn();
      const durationMs = Date.now() - t0;
      results.push({ ...res, durationMs, id: test.id });
    } catch (err) {
      const durationMs = Date.now() - t0;
      results.push({
        id: test.id,
        name: `Test ${test.id}`,
        success: false,
        error: err.message,
        durationMs,
      });
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const passedCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;

  console.log(
    `\n\n================================================================================`,
  );
  console.log(`AUTOMATED TEST EXECUTION SUMMARY`);
  console.log(`================================================================================`);
  console.log(`Total Tests Executed: ${results.length}`);
  console.log(`Passed:               ${passedCount}`);
  console.log(`Failed:               ${failedCount}`);
  console.log(`Execution Time:       ${totalDuration} seconds\n`);

  console.log(`Detailed Results:`);
  results.forEach((r) => {
    const status = r.success ? "✅ PASS" : "❌ FAIL";
    const duration = `(${(r.durationMs / 1000).toFixed(2)}s)`;
    console.log(`  [${status}] Test ${r.id}: ${r.name} ${duration}`);
    if (!r.success && r.error) {
      console.log(`         Error: ${r.error}`);
    }
  });
  console.log(`================================================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal Test Suite Error:", err);
  process.exit(1);
});
