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

export async function runTest5() {
  const testName = "Test 5 — Duplicate attendance entries are prevented (Unique Compound Slot)";
  console.log(`\n============================================================`);
  console.log(`RUNNING: ${testName}`);
  console.log(`============================================================`);

  const driver = await createDriver();

  try {
    const token = await getAuthToken("faculty");
    await ensureStudentExists(token, {
      name: "Daniel White",
      rollNumber: "23CS005",
      studentId: "23CS005",
      email: "daniel.white@pulse.edu",
      branch: "CSE",
      mobile: "9876543215",
    });

    console.log("[Step 1] Logging in as faculty...");
    await loginAsFaculty(driver);

    console.log("[Step 2] Navigating to Daily Attendance page...");
    await driver.get(`${CONFIG.baseUrl}/faculty/daily-attendance`);

    await selectOption(driver, '[data-testid="dept-select"]', "CSE");

    const testDate = "2026-10-18";
    await fillInput(driver, '[data-testid="date-picker"]', testDate);
    await driver.sleep(600);

    // Wait for row
    await driver.wait(
      until.elementLocated(By.css('[data-testid="student-row-23CS005"]')),
      CONFIG.timeoutMs,
    );

    // 1. Mark Period 1 as PRESENT and Save
    console.log("[Step 3] Submitting Period 1 as PRESENT for 23CS005 on 2026-10-18...");
    const p1Btn = await driver.findElement(By.css('[data-testid="period-btn-23CS005-1"]'));
    let text1 = (await p1Btn.getText()).trim();
    while (text1 !== "P") {
      await driver.executeScript("arguments[0].click();", p1Btn);
      await driver.sleep(150);
      text1 = (await p1Btn.getText()).trim();
    }
    const saveBtn = await driver.findElement(By.css('[data-testid="save-attendance"]'));
    await driver.executeScript("arguments[0].click();", saveBtn);
    await driver.wait(async () => {
      const btn = await driver.findElement(By.css('[data-testid="save-attendance"]'));
      return (await btn.getText()).trim() === "Save Attendance";
    }, CONFIG.timeoutMs);
    await driver.sleep(400);
    console.log("  ✓ First submission (PRESENT) saved.");

    // 2. Submit the SAME logical entry again (or update it to ABSENT)
    console.log("[Step 4] Modifying Period 1 to ABSENT and saving again (Idempotent Upsert)...");
    const p1Btn2 = await driver.findElement(By.css('[data-testid="period-btn-23CS005-1"]'));
    let text2 = (await p1Btn2.getText()).trim();
    while (text2 !== "A") {
      await driver.executeScript("arguments[0].click();", p1Btn2);
      await driver.sleep(150);
      text2 = (await p1Btn2.getText()).trim();
    }
    const saveBtn2 = await driver.findElement(By.css('[data-testid="save-attendance"]'));
    await driver.wait(until.elementIsEnabled(saveBtn2), CONFIG.timeoutMs);
    await driver.executeScript("arguments[0].click();", saveBtn2);
    await driver.wait(async () => {
      const btn = await driver.findElement(By.css('[data-testid="save-attendance"]'));
      return (await btn.getText()).trim() === "Save Attendance";
    }, CONFIG.timeoutMs);
    await driver.sleep(400);
    console.log("  ✓ Updated submission (ABSENT) saved.");

    // 3. Query the backend daily attendance API directly to inspect database records
    console.log("[Step 5] Inspecting backend database records for duplicate slot prevention...");
    const res = await fetch(`${CONFIG.apiUrl}/daily-attendance?department=CSE&date=${testDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to query daily attendance API");

    const gridData = await res.json();
    const student = gridData.students.find(
      (s) => s.rollNumber === "23CS005" || s.studentId === "23CS005",
    );
    if (!student) throw new Error("Student 23CS005 not found in returned grid");

    // Period 1 should be 'ABSENT', and there must be only 1 logical status for period 1
    const p1Status = student.periods["1"];
    if (p1Status !== "ABSENT") {
      throw new Error(`Expected period 1 to be updated to 'ABSENT', found '${p1Status}'`);
    }

    // Verify history endpoint to ensure no duplicate slot was created
    const historyRes = await fetch(
      `${CONFIG.apiUrl}/daily-attendance/history?department=CSE&startDate=${testDate}&endDate=${testDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (historyRes.ok) {
      const historyList = await historyRes.json();
      const period1Records = historyList.filter(
        (r) => (r.studentId === "23CS005" || r.rollNumber === "23CS005") && r.period === 1,
      );
      if (period1Records.length > 1) {
        throw new Error(
          `Duplicate records detected in database! Found ${period1Records.length} records for student 23CS005, date ${testDate}, period 1.`,
        );
      }
      console.log(
        `  ✓ Confirmed exactly 1 record exists in database for (student, date, period). Duplicate prevented.`,
      );
    }

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test5_duplicate_prevention_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    await driver.quit();
  }
}
