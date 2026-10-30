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

export async function runTest7() {
  const testName = "Test 7 — Attendance percentage is displayed and formatted correctly";
  console.log(`\n============================================================`);
  console.log(`RUNNING: ${testName}`);
  console.log(`============================================================`);

  const driver = await createDriver();

  try {
    const token = await getAuthToken("faculty");
    await ensureStudentExists(token, {
      name: "Emma Watson",
      rollNumber: "23AI006",
      studentId: "23AI006",
      email: "emma.watson@pulse.edu",
      branch: "AIML",
      mobile: "9876543216",
    });

    console.log("[Step 1] Logging in as faculty...");
    await loginAsFaculty(driver);

    console.log("[Step 2] Navigating to Monthly Reports page...");
    await driver.get(`${CONFIG.baseUrl}/faculty/monthly-reports`);

    // Select AIML, November, 2026 (Where Emma has 10 present / 14 working)
    // Mathematical expectation: (10 / 14) * 100 = 71.42857% -> 71.43%
    console.log("[Step 3] Loading November 2026 for AIML...");
    await selectOption(driver, '[data-testid="report-dept-select"]', "AIML");
    await driver.sleep(300);
    await selectOption(driver, '[data-testid="report-month-select"]', "11");
    await driver.sleep(300);
    await fillInput(driver, '[data-testid="report-year-select"]', "2026");
    await driver.sleep(1200);

    // Locate percentage element
    console.log("[Step 4] Checking fractional percentage calculation and rounding...");
    await driver.wait(
      until.elementLocated(By.css('[data-testid="report-row-23AI006"]')),
      CONFIG.timeoutMs,
    );

    const percentageElem = await driver.findElement(
      By.css('[data-testid="report-percentage-23AI006"]'),
    );
    const percentageText = (await percentageElem.getText()).trim();
    console.log(`  Report percentage for 10/14 periods: '${percentageText}'`);

    if (!percentageText.includes("71.43%")) {
      throw new Error(`Expected attendance percentage to be '71.43%', got '${percentageText}'`);
    }
    console.log("  ✓ Fractional rounding correctly verified as 71.43%.");

    // Step 5: Test edge case — zero working periods (e.g. December 2026 with no marked attendance)
    console.log("[Step 5] Testing zero denominator boundary case (empty month)...");
    await selectOption(driver, '[data-testid="report-month-select"]', "12");
    await driver.sleep(1200);

    // Either displays empty message or 0.00% without division-by-zero crash
    const pageText = await driver.getPageSource();
    if (pageText.includes("NaN") || pageText.includes("Infinity")) {
      throw new Error("Detected NaN or Infinity in percentage rendering for zero working periods!");
    }
    console.log("  ✓ Zero working periods handled safely without NaN or division by zero.");

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test7_attendance_percentage_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    await driver.quit();
  }
}
