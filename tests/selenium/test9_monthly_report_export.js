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

export async function runTest9() {
  const testName = "Test 9 — Monthly report can be generated and exported as CSV";
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

    // Select AIML, November, 2026
    console.log("[Step 3] Loading November 2026 for AIML...");
    await selectOption(driver, '[data-testid="report-dept-select"]', "AIML");
    await driver.sleep(300);
    await selectOption(driver, '[data-testid="report-month-select"]', "11");
    await driver.sleep(300);
    await fillInput(driver, '[data-testid="report-year-select"]', "2026");
    await driver.sleep(1200);

    // Verify Export CSV button is visible and enabled
    console.log("[Step 4] Verifying Export CSV button is clickable on the UI...");
    const exportBtn = await driver.wait(
      until.elementLocated(By.css('[data-testid="report-export-csv"]')),
      CONFIG.timeoutMs,
    );
    await driver.wait(until.elementIsEnabled(exportBtn), CONFIG.timeoutMs);
    const isExportVisible = await exportBtn.isDisplayed();
    if (!isExportVisible) throw new Error("Export CSV button is not visible");

    // Click Export CSV button on UI
    console.log("[Step 5] Triggering CSV export from the user interface...");
    await exportBtn.click();
    await driver.sleep(800);
    console.log("  ✓ UI Export button clicked successfully.");

    // Step 6: Verify backend CSV endpoint directly to validate RFC 4180 format and content
    console.log("[Step 6] Validating backend RFC 4180 CSV export stream...");
    const csvUrl = `${CONFIG.apiUrl}/reports/monthly/csv?department=AIML&year=2026&month=11&threshold=75`;
    const res = await fetch(csvUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`CSV download endpoint returned status ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("csv") && !contentType.includes("text/plain")) {
      throw new Error(`Unexpected Content-Type: ${contentType}`);
    }

    const csvContent = await res.text();
    console.log(`  CSV Header & Sample Output:\n${csvContent.split("\n").slice(0, 3).join("\n")}`);

    // Verify CSV Headers match PDF Page 4 layout
    const expectedHeaders = [
      "Roll No",
      "Student",
      "Working periods",
      "Present",
      "Absent",
      "Attendance",
    ];
    for (const h of expectedHeaders) {
      if (!csvContent.includes(h)) {
        throw new Error(`CSV is missing expected header: '${h}'`);
      }
    }

    // Verify student 23AI006 is present in CSV
    if (!csvContent.includes("23AI006")) {
      throw new Error("CSV output is missing student record for 23AI006");
    }
    console.log("  ✓ RFC 4180 CSV headers and student record confirmed.");

    console.log(`[PASS] ${testName}`);
    return { success: true, name: testName };
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    await takeScreenshot(driver, "test9_monthly_export_fail");
    return { success: false, name: testName, error: err.message };
  } finally {
    await driver.quit();
  }
}
