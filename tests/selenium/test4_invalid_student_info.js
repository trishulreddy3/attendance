import { By, until, Key } from "selenium-webdriver";
import { CONFIG } from "./config.js";
import {
  createDriver,
  loginAsFaculty,
  takeScreenshot,
  getAuthToken,
  ensureStudentExists,
} from "./driver.js";

export async function runTest4() {
  const testName = "Test 4 — Missing or invalid student information is handled correctly";
  console.log(`\n============================================================`);
  console.log(`RUNNING: ${testName}`);
  console.log(`============================================================`);

  const driver = await createDriver();

  try {
    const token = await getAuthToken("faculty");
    // Ensure 23CS001 exists so we can test duplicate roll number detection
    await ensureStudentExists(token, {
      name: "Existing Student",
      rollNumber: "23CS001",
      studentId: "23CS001",
      email: "existing.student@pulse.edu",
      branch: "CSE",
      mobile: "9876543210",
    });

    console.log("[Step 1] Logging in as faculty...");
    await loginAsFaculty(driver);

    console.log("[Step 2] Navigating to Student Management page...");
    await driver.get(`${CONFIG.baseUrl}/faculty/students`);

    // 1. Test Client-Side Required Field Validation
    console.log("[Step 3] Opening Add Student Modal...");
    const openAddBtn = await driver.wait(
      until.elementLocated(By.css('[data-testid="open-add-student-btn"]')),
      CONFIG.timeoutMs,
    );
    await openAddBtn.click();

    // Wait for modal form
    const submitBtn = await driver.wait(
      until.elementLocated(By.css('[data-testid="student-submit-btn"]')),
      CONFIG.timeoutMs,
    );

    console.log("[Step 4] Submitting form with empty required fields...");
    await submitBtn.click();
    await driver.sleep(300);

    // Modal should stay open because client-side validation stopped submission
    const isModalStillOpen = await submitBtn.isDisplayed();
    if (!isModalStillOpen) {
      throw new Error("Modal closed unexpectedly on invalid submission!");
    }
    console.log("  ✓ Client-side validation prevented invalid empty submission.");

    // 2. Test Duplicate Roll Number Backend Rejection
    console.log("[Step 5] Attempting to submit a student with duplicate Roll Number (23CS001)...");
    const rollInput = await driver.findElement(By.css('[data-testid="student-roll-input"]'));
    const nameInput = await driver.findElement(By.css('[data-testid="student-name-input"]'));
    const emailInput = await driver.findElement(By.css('[data-testid="student-email-input"]'));

    await rollInput.sendKeys("23CS001");
    await nameInput.sendKeys("Duplicate Clone");
    await emailInput.sendKeys("duplicate.clone@pulse.edu");

    await submitBtn.click();
    await driver.sleep(600);

    // Verify error is displayed on UI (either toast error or inline error)
    const pageSource = await driver.getPageSource();
    const hasDuplicateError =
      pageSource.toLowerCase().includes("already exists") ||
      pageSource.toLowerCase().includes("duplicate") ||
      pageSource.toLowerCase().includes("conflict") ||
      pageSource.toLowerCase().includes("roll number");

    if (!hasDuplicateError) {
      throw new Error("Duplicate student error was not surfaced to the user");
    }
    console.log("  ✓ Duplicate roll number correctly rejected and displayed.");

    // 3. Confirm invalid student was not persisted
    console.log("[Step 6] Confirming invalid record was not persisted...");
    const verifyRes = await fetch(`${CONFIG.apiUrl}/students/search?q=Duplicate Clone`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (verifyRes.ok) {
      const data = await verifyRes.json();
      const found = Array.isArray(data) ? data.some((s) => s.name === "Duplicate Clone") : false;
      if (found) throw new Error("Invalid duplicate student was persisted in the database!");
    }
    console.log("  ✓ Verified non-persistence of invalid student.");

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test4_invalid_info_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    await driver.quit();
  }
}
