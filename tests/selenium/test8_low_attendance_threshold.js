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

export async function runTest8() {
  const testName =
    "Test 8 — Students below configured attendance threshold are identified and highlighted";
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

    // Select AIML, November, 2026 (Emma has 71.43%)
    console.log("[Step 3] Loading November 2026 for AIML...");
    await selectOption(driver, '[data-testid="report-dept-select"]', "AIML");
    await driver.sleep(300);
    await selectOption(driver, '[data-testid="report-month-select"]', "11");
    await driver.sleep(300);
    await fillInput(driver, '[data-testid="report-year-select"]', "2026");
    await driver.sleep(1200);

    // 1. With default threshold = 75%: Emma (71.43%) is BELOW threshold
    console.log("[Step 4] Checking threshold = 75% identifies Emma as Shortage...");
    await fillInput(driver, '[data-testid="report-threshold-input"]', "75");
    await driver.sleep(800);

    const badgeElem = await driver.wait(
      until.elementLocated(By.css('[data-testid="report-badge-23AI006"]')),
      CONFIG.timeoutMs,
    );
    const badgeText = (await badgeElem.getText()).trim();
    console.log(`  Badge with threshold 75%: '${badgeText}'`);
    if (!badgeText.toLowerCase().includes("shortage")) {
      throw new Error(
        `Expected 'Shortage' badge for 71.43% with threshold 75%, found '${badgeText}'`,
      );
    }
    console.log("  ✓ Shortage badge correctly displayed for 71.43% < 75%.");

    // 2. Change threshold to 70%: Emma (71.43%) is now ABOVE threshold -> Normal
    console.log("[Step 5] Changing threshold to 70% and verifying badge updates to Normal...");
    await fillInput(driver, '[data-testid="report-threshold-input"]', "70");
    await driver.sleep(800);

    const updatedBadgeElem = await driver.findElement(
      By.css('[data-testid="report-badge-23AI006"]'),
    );
    const updatedBadgeText = (await updatedBadgeElem.getText()).trim();
    console.log(`  Badge with threshold 70%: '${updatedBadgeText}'`);
    if (!updatedBadgeText.toLowerCase().includes("normal")) {
      throw new Error(
        `Expected 'Normal' badge for 71.43% with threshold 70%, found '${updatedBadgeText}'`,
      );
    }
    console.log("  ✓ Dynamic threshold change correctly updated badge to Normal.");

    // 3. Reset threshold to 75% and test "Show Low Attendance Only" filter
    console.log('[Step 6] Testing "Show Low Attendance Only" toggle with threshold 75%...');
    await fillInput(driver, '[data-testid="report-threshold-input"]', "75");
    await driver.sleep(600);

    const lowToggle = await driver.findElement(By.css('[data-testid="report-low-toggle"]'));
    await lowToggle.click();
    await driver.sleep(600);

    // Row for 23AI006 must be visible because it is in shortage
    const shortageRow = await driver.findElement(By.css('[data-testid="report-row-23AI006"]'));
    if (!(await shortageRow.isDisplayed())) {
      throw new Error("Shortage student 23AI006 was hidden when filtering by low attendance!");
    }
    console.log("  ✓ Low attendance filter correctly kept shortage students displayed.");

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test8_low_threshold_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    await driver.quit();
  }
}
