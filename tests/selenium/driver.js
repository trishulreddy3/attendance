import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import fs from "fs";
import path from "path";
import { CONFIG } from "./config.js";

export async function createDriver() {
  const options = new chrome.Options();
  if (CONFIG.headless) {
    options.addArguments("--headless=new");
  }
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");
  options.addArguments("--window-size=1440,900");

  const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();

  await driver.manage().setTimeouts({ implicit: 5000 });
  return driver;
}

export async function fillInput(driver, selector, value) {
  await driver.wait(until.elementLocated(By.css(selector)), CONFIG.timeoutMs);
  await driver.executeScript(`
    const el = document.querySelector('${selector}');
    if (el) {
      el.focus();
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(el, '${value}');
      } else {
        el.value = '${value}';
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  `);
}

export async function selectOption(driver, selector, value) {
  await driver.wait(until.elementLocated(By.css(selector)), CONFIG.timeoutMs);
  await driver.executeScript(`
    const select = document.querySelector('${selector}');
    if (select) {
      select.value = '${value}';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  `);
}

export async function loginAsFaculty(driver) {
  await driver.get(`${CONFIG.baseUrl}/login`);
  await driver.sleep(600); // allow hydration

  await fillInput(driver, '[data-testid="login-email"]', CONFIG.facultyEmail);
  await fillInput(driver, '[data-testid="login-password"]', CONFIG.facultyPassword);

  const submitBtn = await driver.wait(
    until.elementLocated(By.css('[data-testid="login-submit"]')),
    CONFIG.timeoutMs,
    "Login submit button not found",
  );
  await driver.executeScript("arguments[0].click();", submitBtn);

  // Wait for URL redirect to faculty area
  await driver.wait(
    until.urlContains("/faculty/"),
    CONFIG.timeoutMs,
    "Faculty dashboard did not load after login",
  );
}

export async function takeScreenshot(driver, testName) {
  try {
    const screenshotDir = path.resolve("screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const filename = `${testName.replace(/[^a-z0-9_-]/gi, "_")}_${Date.now()}.png`;
    const image = await driver.takeScreenshot();
    fs.writeFileSync(path.join(screenshotDir, filename), image, "base64");
    console.log(`[Diagnostic] Screenshot saved to: ${path.join(screenshotDir, filename)}`);
  } catch (err) {
    console.error("Failed to capture screenshot:", err.message);
  }
}

export async function waitForElement(driver, locator, timeout = CONFIG.timeoutMs) {
  return await driver.wait(until.elementLocated(locator), timeout);
}

export async function waitForVisible(driver, locator, timeout = CONFIG.timeoutMs) {
  const el = await waitForElement(driver, locator, timeout);
  return await driver.wait(until.elementIsVisible(el), timeout);
}

export async function getAuthToken(role = "faculty") {
  const isFaculty = role === "faculty";
  const username = isFaculty ? CONFIG.facultyEmail : CONFIG.adminEmail;
  const password = isFaculty ? CONFIG.facultyPassword : CONFIG.adminPassword;

  const res = await fetch(`${CONFIG.apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, kind: role }),
  });
  if (!res.ok) {
    throw new Error(`Failed to authenticate as ${role}: ${res.statusText}`);
  }
  const data = await res.json();
  return data.token;
}

export async function ensureStudentExists(token, studentData) {
  const res = await fetch(`${CONFIG.apiUrl}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(studentData),
  });
  if (res.ok) {
    return await res.json();
  }
  return null;
}
