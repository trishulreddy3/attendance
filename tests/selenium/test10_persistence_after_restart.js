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

export async function runTest10() {
  const testName =
    "Test 10 — Saved records remain available across sessions and application restarts";
  console.log(`\n============================================================`);
  console.log(`RUNNING: ${testName}`);
  console.log(`============================================================`);

  let driver = await createDriver();

  try {
    const token = await getAuthToken("faculty");
    await ensureStudentExists(token, {
      name: "Frank Miller",
      rollNumber: "23CS010",
      studentId: "23CS010",
      email: "frank.miller@pulse.edu",
      branch: "CSE",
      mobile: "9876543220",
    });

    console.log("[Step 1] Logging in as faculty in initial session...");
    await loginAsFaculty(driver);

    console.log("[Step 2] Navigating to Daily Attendance page...");
    await driver.get(`${CONFIG.baseUrl}/faculty/daily-attendance`);

    await selectOption(driver, '[data-testid="dept-select"]', "CSE");

    const testDate = "2026-10-25";
    await fillInput(driver, '[data-testid="date-picker"]', testDate);
    await driver.sleep(600);

    // Set a signature pattern:
    // P1=P, P2=A, P3=P, P4=P, P5=A, P6=A, P7=P
    console.log(`[Step 3] Saving signature attendance record for 23CS010 on ${testDate}...`);
    const targetStates = {
      1: "P",
      2: "A",
      3: "P",
      4: "P",
      5: "A",
      6: "A",
      7: "P",
    };

    for (const [period, target] of Object.entries(targetStates)) {
      const btn = await driver.findElement(By.css(`[data-testid="period-btn-23CS010-${period}"]`));
      let text = (await btn.getText()).trim();
      let attempts = 0;
      while (text !== target && attempts < 4) {
        await driver.executeScript("arguments[0].click();", btn);
        await driver.sleep(150);
        text = (await btn.getText()).trim();
        attempts++;
      }
      if (text !== target) {
        throw new Error(
          `Failed to set period ${period} for 23CS010 to '${target}', reached '${text}'`,
        );
      }
    }

    const saveBtn = await driver.findElement(By.css('[data-testid="save-attendance"]'));
    await driver.executeScript("arguments[0].click();", saveBtn);
    await driver.wait(until.elementIsDisabled(saveBtn), CONFIG.timeoutMs);
    console.log("  ✓ Initial record saved.");

    // Step 4: Close current browser session completely
    console.log("[Step 4] Terminating browser instance to verify independent cold persistence...");
    await driver.quit();

    // Step 5: Boot completely new browser instance (Cold session)
    console.log("[Step 5] Launching new cold browser session and re-logging in...");
    driver = await createDriver();
    await loginAsFaculty(driver);

    // Step 6: Navigate to daily attendance on test date
    console.log(`[Step 6] Navigating back to ${testDate} in cold session...`);
    await driver.get(`${CONFIG.baseUrl}/faculty/daily-attendance`);

    await selectOption(driver, '[data-testid="dept-select"]', "CSE");
    await fillInput(driver, '[data-testid="date-picker"]', testDate);
    await driver.sleep(800);

    // Step 7: Verify all 7 periods persisted in MongoDB Atlas and were restored
    console.log("[Step 7] Verifying all 7 periods persisted across restarts and cold sessions...");
    await driver.wait(
      until.elementLocated(By.css('[data-testid="student-row-23CS010"]')),
      CONFIG.timeoutMs,
    );

    for (const [period, expected] of Object.entries(targetStates)) {
      await driver.wait(
        async () => {
          try {
            const btn = await driver.findElement(
              By.css(`[data-testid="period-btn-23CS010-${period}"]`),
            );
            const actual = (await btn.getText()).trim();
            return actual === expected;
          } catch {
            return false;
          }
        },
        CONFIG.timeoutMs,
        `Period P${period} failed persistence test! Expected '${expected}'`,
      );
    }
    console.log("  ✓ All 7 period states persisted across sessions and were restored accurately.");

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test10_persistence_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}
