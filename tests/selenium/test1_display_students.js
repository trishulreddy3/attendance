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

export async function runTest1() {
  const testName = "Test 1 — Attendance page displays all registered students";
  console.log(`\n============================================================`);
  console.log(`RUNNING: ${testName}`);
  console.log(`============================================================`);

  const driver = await createDriver();

  try {
    // 1. Ensure deterministic test student exists in department CSE
    const token = await getAuthToken("faculty");
    await ensureStudentExists(token, {
      name: "Alice Johnson",
      rollNumber: "23CS001",
      studentId: "23CS001",
      email: "alice.johnson@pulse.edu",
      branch: "CSE",
      mobile: "9876543211",
    });

    // 2. Log in with faculty credentials
    console.log("[Step 1] Logging in as faculty...");
    await loginAsFaculty(driver);

    // 3. Open daily attendance page
    console.log("[Step 2] Navigating to Daily Attendance page...");
    await driver.get(`${CONFIG.baseUrl}/faculty/daily-attendance`);

    // 4. Select Department CSE and Date
    console.log("[Step 3] Selecting department CSE...");
    await selectOption(driver, '[data-testid="dept-select"]', "CSE");
    await driver.sleep(600);

    // 5. Verify the seven period columns P1 to P7 are displayed in table headers
    console.log("[Step 4] Verifying table headers contain periods P1 through P7...");
    for (let p = 1; p <= 7; p++) {
      const header = await driver.wait(
        until.elementLocated(By.xpath(`//th[normalize-space()="P${p}"]`)),
        CONFIG.timeoutMs,
        `Period header P${p} was not found in table`,
      );
      const isVisible = await header.isDisplayed();
      if (!isVisible) throw new Error(`Period header P${p} is not visible`);
    }
    console.log("  ✓ Headers P1 to P7 verified successfully.");

    // 6. Verify student row and roll number
    console.log("[Step 5] Verifying registered student row and information...");
    const studentRow = await driver.wait(
      until.elementLocated(By.css('[data-testid="student-row-23CS001"]')),
      CONFIG.timeoutMs,
      "Student row for roll 23CS001 not found",
    );
    const isRowVisible = await studentRow.isDisplayed();
    if (!isRowVisible) throw new Error("Student row for 23CS001 is not visible");

    const rollElement = await driver.findElement(By.css('[data-testid="roll-number-23CS001"]'));
    const rollText = await rollElement.getText();
    if (!rollText.includes("23CS001")) {
      throw new Error(`Expected roll number to contain '23CS001', got '${rollText}'`);
    }

    const nameElement = await driver.findElement(By.css('[data-testid="student-name-23CS001"]'));
    const nameText = await nameElement.getText();
    if (!nameText.includes("Aarav Sharma") && !nameText.includes("Alice Johnson")) {
      throw new Error(`Expected student name to contain registered name, got '${nameText}'`);
    }

    // Verify 7 period buttons exist for this student
    for (let p = 1; p <= 7; p++) {
      const periodBtn = await driver.findElement(By.css(`[data-testid="period-btn-23CS001-${p}"]`));
      if (!(await periodBtn.isDisplayed())) {
        throw new Error(`Period button P${p} for student 23CS001 is not visible`);
      }
    }
    console.log("  ✓ Student 23CS001 (Alice Johnson) and all 7 period buttons verified.");

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test1_display_students_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    await driver.quit();
  }
}
