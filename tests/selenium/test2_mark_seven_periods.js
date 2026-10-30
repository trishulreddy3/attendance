import { By, until } from "selenium-webdriver";
import { CONFIG } from "./config.js";
import {
  createDriver,
  loginAsFaculty,
  takeScreenshot,
  getAuthToken,
  ensureStudentExists,
  selectOption,
} from "./driver.js";

export async function runTest2() {
  const testName = "Test 2 — Attendance can be marked for all seven periods";
  console.log(`\n============================================================`);
  console.log(`RUNNING: ${testName}`);
  console.log(`============================================================`);

  const driver = await createDriver();

  try {
    const token = await getAuthToken("faculty");
    await ensureStudentExists(token, {
      name: "Bob Miller",
      rollNumber: "23CS002",
      studentId: "23CS002",
      email: "bob.miller@pulse.edu",
      branch: "CSE",
      mobile: "9876543212",
    });

    console.log("[Step 1] Logging in as faculty...");
    await loginAsFaculty(driver);

    console.log("[Step 2] Navigating to Daily Attendance page...");
    await driver.get(`${CONFIG.baseUrl}/faculty/daily-attendance`);

    // Ensure department is CSE
    await selectOption(driver, '[data-testid="dept-select"]', "CSE");
    await driver.sleep(600);

    // Wait for student row
    console.log("[Step 3] Locating test student 23CS002...");
    await driver.wait(
      until.elementLocated(By.css('[data-testid="student-row-23CS002"]')),
      CONFIG.timeoutMs,
      "Student 23CS002 not found",
    );

    // Test cycling periods:
    // Cycle: NOT_MARKED ('—') -> PRESENT ('P') -> ABSENT ('A') -> NOT_MARKED ('—')
    console.log("[Step 4] Cycling P1 to test PRESENT, ABSENT, NOT_MARKED transitions...");
    const p1Btn = await driver.findElement(By.css('[data-testid="period-btn-23CS002-1"]'));

    // Initial state might be NOT_MARKED or previously saved. Let's click once:
    const initialText = (await p1Btn.getText()).trim();
    await p1Btn.click();
    await driver.sleep(200);

    const firstClickText = (await p1Btn.getText()).trim();
    if (firstClickText === initialText) {
      throw new Error(
        `Period state did not change after click: was '${initialText}', still '${firstClickText}'`,
      );
    }

    // Now mark all 7 periods with a distinct desired pattern:
    // P1: PRESENT, P2: ABSENT, P3: PRESENT, P4: ABSENT, P5: PRESENT, P6: ABSENT, P7: PRESENT
    console.log("[Step 5] Setting alternating statuses across all seven periods (P1 to P7)...");
    const targetPattern = {
      1: "P",
      2: "A",
      3: "P",
      4: "A",
      5: "P",
      6: "A",
      7: "P",
    };

    for (let p = 1; p <= 7; p++) {
      const btn = await driver.findElement(By.css(`[data-testid="period-btn-23CS002-${p}"]`));
      let currentText = (await btn.getText()).trim();
      const targetText = targetPattern[p];

      let attempts = 0;
      while (currentText !== targetText && attempts < 4) {
        await btn.click();
        await driver.sleep(150);
        currentText = (await btn.getText()).trim();
        attempts++;
      }

      if (currentText !== targetText) {
        throw new Error(
          `Failed to set period ${p} to '${targetText}', current is '${currentText}'`,
        );
      }
    }
    console.log("  ✓ Set P1..P7: P, A, P, A, P, A, P successfully.");

    // Save changes
    console.log("[Step 6] Clicking Save Attendance button...");
    const saveBtn = await driver.findElement(By.css('[data-testid="save-attendance"]'));
    await saveBtn.click();

    // Wait for save button to re-disable (meaning unsaved changes are saved)
    await driver.wait(
      until.elementIsDisabled(saveBtn),
      CONFIG.timeoutMs,
      "Save button remained enabled after save",
    );
    console.log("  ✓ Attendance saved successfully.");

    // Verify all 7 buttons still reflect the submitted pattern
    console.log("[Step 7] Verifying saved statuses match the submitted values...");
    for (let p = 1; p <= 7; p++) {
      const btn = await driver.findElement(By.css(`[data-testid="period-btn-23CS002-${p}"]`));
      const text = (await btn.getText()).trim();
      if (text !== targetPattern[p]) {
        throw new Error(`Period P${p} mismatch: expected '${targetPattern[p]}', got '${text}'`);
      }
    }
    console.log("  ✓ All seven period values matched submitted states.");

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test2_mark_seven_periods_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    await driver.quit();
  }
}
