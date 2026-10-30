import { By, until, Key } from "selenium-webdriver";
import { CONFIG } from "./config.js";
import {
  createDriver,
  loginAsFaculty,
  takeScreenshot,
  getAuthToken,
  ensureStudentExists,
  selectOption,
  fillInput,
} from "./driver.js";

export async function runTest6() {
  const testName = "Test 6 — Monthly attendance totals are calculated correctly";
  console.log(`\n============================================================`);
  console.log(`RUNNING: ${testName}`);
  console.log(`============================================================`);

  const driver = await createDriver();

  try {
    const token = await getAuthToken("faculty");
    // Seed student in AIML department for dedicated isolation
    const student = await ensureStudentExists(token, {
      name: "Emma Watson",
      rollNumber: "23AI006",
      studentId: "23AI006",
      email: "emma.watson@pulse.edu",
      branch: "AIML",
      mobile: "9876543216",
    });

    // Seed controlled attendance records via API for Emma in November 2026:
    // Day 1: 2026-11-02 -> P1..P7 all PRESENT (7 present)
    // Day 2: 2026-11-03 -> P1..P3 PRESENT (3 present), P4..P7 ABSENT (4 absent)
    // Total working periods for class: 14.
    // Emma: Present: 10, Absent: 4.
    console.log("[Step 1] Seeding deterministic attendance records for November 2026 in AIML...");
    const day1Entries = [1, 2, 3, 4, 5, 6, 7].map((p) => ({
      studentId: "23AI006",
      period: p,
      status: "PRESENT",
    }));
    const day2Entries = [
      { studentId: "23AI006", period: 1, status: "PRESENT" },
      { studentId: "23AI006", period: 2, status: "PRESENT" },
      { studentId: "23AI006", period: 3, status: "PRESENT" },
      { studentId: "23AI006", period: 4, status: "ABSENT" },
      { studentId: "23AI006", period: 5, status: "ABSENT" },
      { studentId: "23AI006", period: 6, status: "ABSENT" },
      { studentId: "23AI006", period: 7, status: "ABSENT" },
    ];

    await fetch(`${CONFIG.apiUrl}/daily-attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ department: "AIML", date: "2026-11-02", entries: day1Entries }),
    });
    await fetch(`${CONFIG.apiUrl}/daily-attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ department: "AIML", date: "2026-11-03", entries: day2Entries }),
    });
    console.log("  ✓ Seeded 10 Present, 4 Absent across 14 working periods.");

    console.log("[Step 2] Logging in as faculty...");
    await loginAsFaculty(driver);

    console.log("[Step 3] Navigating to Monthly Reports page...");
    await driver.get(`${CONFIG.baseUrl}/faculty/monthly-reports`);

    // Select AIML department
    console.log("[Step 4] Selecting department AIML, month November, year 2026...");
    await selectOption(driver, '[data-testid="report-dept-select"]', "AIML");
    await driver.sleep(300);
    await selectOption(driver, '[data-testid="report-month-select"]', "11");
    await driver.sleep(300);
    await fillInput(driver, '[data-testid="report-year-select"]', "2026");
    await driver.sleep(1200);

    // Locate row for 23AI006
    console.log("[Step 5] Verifying calculated monthly totals in table...");
    const row = await driver.wait(
      until.elementLocated(By.css('[data-testid="report-row-23AI006"]')),
      CONFIG.timeoutMs,
      "Report row for 23AI006 not found",
    );
    await driver.wait(until.elementIsVisible(row), CONFIG.timeoutMs);

    const workingElem = await driver.findElement(By.css('[data-testid="report-working-23AI006"]'));
    const presentElem = await driver.findElement(By.css('[data-testid="report-present-23AI006"]'));
    const absentElem = await driver.findElement(By.css('[data-testid="report-absent-23AI006"]'));

    const workingVal = (await workingElem.getText()).trim();
    const presentVal = (await presentElem.getText()).trim();
    const absentVal = (await absentElem.getText()).trim();

    console.log(
      `  Report values: Working=${workingVal}, Present=${presentVal}, Absent=${absentVal}`,
    );

    if (workingVal !== "14") {
      throw new Error(`Expected working periods to be '14', got '${workingVal}'`);
    }
    if (presentVal !== "10") {
      throw new Error(`Expected present periods to be '10', got '${presentVal}'`);
    }
    if (absentVal !== "4") {
      throw new Error(`Expected absent periods to be '4', got '${absentVal}'`);
    }

    console.log("  ✓ Verified exact match for Working (14), Present (10), and Absent (4).");

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test6_monthly_totals_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    await driver.quit();
  }
}
