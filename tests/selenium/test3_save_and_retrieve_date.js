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

export async function runTest3() {
  const testName = "Test 3 — Attendance is saved for a selected date and persists on retrieval";
  console.log(`\n============================================================`);
  console.log(`RUNNING: ${testName}`);
  console.log(`============================================================`);

  const driver = await createDriver();

  try {
    const token = await getAuthToken("faculty");
    await ensureStudentExists(token, {
      name: "Charlie Davis",
      rollNumber: "23CS003",
      studentId: "23CS003",
      email: "charlie.davis@pulse.edu",
      branch: "CSE",
      mobile: "9876543213",
    });

    console.log("[Step 1] Logging in as faculty...");
    await loginAsFaculty(driver);

    console.log("[Step 2] Navigating to Daily Attendance page...");
    await driver.get(`${CONFIG.baseUrl}/faculty/daily-attendance`);

    // Ensure department is CSE
    await selectOption(driver, '[data-testid="dept-select"]', "CSE");

    // Pick a dedicated distinct test date (e.g. 2026-10-14)
    const testDate = "2026-10-14";
    console.log(`[Step 3] Selecting dedicated test date: ${testDate}...`);
    await fillInput(driver, '[data-testid="date-picker"]', testDate);
    await driver.sleep(600); // Allow grid fetch

    // Wait for student row
    await driver.wait(
      until.elementLocated(By.css('[data-testid="student-row-23CS003"]')),
      CONFIG.timeoutMs,
      "Student 23CS003 not found on test date",
    );

    // Set specific pattern:
    // P1: P, P2: P, P3: A, P4: A, P5: P
    console.log("[Step 4] Marking specific period statuses for 23CS003...");
    const pattern = {
      1: "P",
      2: "P",
      3: "A",
      4: "A",
      5: "P",
    };

    for (const [period, target] of Object.entries(pattern)) {
      const btn = await driver.findElement(By.css(`[data-testid="period-btn-23CS003-${period}"]`));
      let text = (await btn.getText()).trim();
      let attempts = 0;
      while (text !== target && attempts < 4) {
        await btn.click();
        await driver.sleep(150);
        text = (await btn.getText()).trim();
        attempts++;
      }
      if (text !== target) throw new Error(`Could not set P${period} to ${target}`);
    }

    // Save attendance
    console.log("[Step 5] Saving attendance for test date...");
    const saveBtn = await driver.findElement(By.css('[data-testid="save-attendance"]'));
    await saveBtn.click();
    await driver.sleep(1000);

    // Refresh the browser page completely to ensure we retrieve from database
    console.log("[Step 6] Refreshing browser and reloading test date...");
    await driver.navigate().refresh();
    await driver.sleep(1000);

    // Re-select CSE and the test date if necessary
    await selectOption(driver, '[data-testid="dept-select"]', "CSE");
    await fillInput(driver, '[data-testid="date-picker"]', testDate);
    await driver.sleep(800);

    // Wait for row
    await driver.wait(
      until.elementLocated(By.css('[data-testid="student-row-23CS003"]')),
      CONFIG.timeoutMs,
    );

    // Verify all saved statuses persisted correctly
    console.log("[Step 7] Verifying persisted statuses after reload...");
    for (const [period, expected] of Object.entries(pattern)) {
      const btn = await driver.findElement(By.css(`[data-testid="period-btn-23CS003-${period}"]`));
      const actual = (await btn.getText()).trim();
      if (actual !== expected) {
        throw new Error(
          `Period P${period} did not persist correctly! Expected '${expected}', got '${actual}'`,
        );
      }
    }
    console.log("  ✓ Persisted statuses verified correctly after full browser reload.");

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test3_save_date_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    await driver.quit();
  }
}
