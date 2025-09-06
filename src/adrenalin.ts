import { Page, expect } from '@playwright/test';

export async function loginAdrenalin(page: Page, url: string, username: string, password: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // The app mounts a SPA; ensure main frame loaded
  await page.waitForLoadState('networkidle');

  // Try common patterns first (labels/placeholders vary by tenant)
  const userField =
    page.getByPlaceholder(/user(|name)?/i).first()
      .or(page.getByLabel(/user(|name| id)/i).first())
      .or(page.locator('input[type="text"]').first());

  const passField =
    page.getByPlaceholder(/pass(word)?/i).first()
      .or(page.getByLabel(/pass(word)?/i).first())
      .or(page.locator('input[type="password"]').first());

  await userField.fill(username);
  await passField.fill(password);

  // Submit: look for a button with accessible name "Login / Sign in"
  const loginBtn = page.getByRole('button', { name: /sign ?in|log ?in|submit/i }).first()
    .or(page.locator('button[type="submit"]').first());
  await Promise.all([
    page.waitForLoadState('networkidle'),
    loginBtn.click()
  ]);

  // Verify post-login by typical markers (dashboard, logout, profile image)
  await expect(
    page.getByText(/dashboard|home|my tasks|logout|attendance/i).or(page.locator('[title*="Logout"], [aria-label*="Logout"]'))
  ).toBeVisible({ timeout: 30000 });
}

export async function doDailyActions(page: Page) {
  // Determine if this is morning (clock-in) or evening (clock-out) based on current time
  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 6 && currentHour < 12; // 6 AM to 12 PM for clock-in
  const isEvening = currentHour >= 17 && currentHour < 22; // 5 PM to 10 PM for clock-out

  console.log(`Current time: ${new Date().toLocaleTimeString()}`);
  console.log(`Action: ${isMorning ? 'Clock-in' : isEvening ? 'Clock-out' : 'Unknown time'}`);

  if (isMorning) {
    await performClockIn(page);
  } else if (isEvening) {
    await performClockOut(page);
  } else {
    console.log('Outside of working hours. No action taken.');
  }
}

export async function performClockIn(page: Page) {
  console.log('=== Performing Clock-in ===');
  
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');

  // Look for Clock-in button with exact text match
  const clockInButton = page.getByRole('button', { name: 'Clock-in' }).first()
    .or(page.getByText('Clock-in').locator('..').getByRole('button').first())
    .or(page.locator('button').filter({ hasText: 'Clock-in' }).first());

  console.log('Looking for Clock-in button...');
  
  if (await clockInButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Found Clock-in button, attempting to click...');
    
    try {
      await clockInButton.click({ force: true });
      console.log('Clock-in button clicked successfully!');
      
      // Wait for any success message or response
      try {
        await expect(page.getByText(/success|marked|punched|clocked|attendance|clocked in/i)).toBeVisible({ timeout: 10000 });
        console.log('Clock-in confirmation received!');
      } catch (e) {
        console.log('No confirmation message found, but click was successful');
      }
    } catch (error) {
      console.log('Error clicking Clock-in button:', error);
      
      // Try alternative approach - click on the text element
      const clockInText = page.getByText('Clock-in');
      if (await clockInText.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('Trying to click on Clock-in text element...');
        await clockInText.click({ force: true });
      }
    }
  } else {
    console.log('Clock-in button not found or not visible');
    const allButtons = await page.locator('button').all();
    console.log('Available buttons:', await Promise.all(allButtons.map(btn => btn.textContent())));
  }
}

export async function performClockOut(page: Page) {
  console.log('=== Performing Clock-out ===');
  
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');

  // Step 1: Click on user icon on top
  console.log('Looking for user icon...');
  const userIcon = page.locator('[data-testid*="user"], [aria-label*="user"], [title*="user"]').first()
    .or(page.locator('img[alt*="user"], img[alt*="profile"]').first())
    .or(page.locator('button').filter({ hasText: /user|profile|account/i }).first())
    .or(page.locator('[class*="user"], [class*="profile"]').first());

  if (await userIcon.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Found user icon, clicking...');
    await userIcon.click({ force: true });
    await page.waitForTimeout(1000); // Wait for dropdown/menu to appear
  } else {
    console.log('User icon not found, trying alternative selectors...');
    // Try to find any clickable element that might be the user menu
    const possibleUserElements = await page.locator('button, a, div[role="button"]').all();
    for (const element of possibleUserElements) {
      const text = await element.textContent();
      if (text && /user|profile|account|avatar/i.test(text)) {
        console.log(`Found potential user element: ${text}`);
        await element.click({ force: true });
        await page.waitForTimeout(1000);
        break;
      }
    }
  }

  // Step 2: Click on "Exit application"
  console.log('Looking for Exit application option...');
  const exitOption = page.getByText('Exit application').first()
    .or(page.getByRole('menuitem', { name: /exit|logout|sign out/i }).first())
    .or(page.locator('a, button').filter({ hasText: /exit|logout|sign out/i }).first());

  if (await exitOption.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Found Exit application option, clicking...');
    await exitOption.click({ force: true });
    await page.waitForTimeout(1000);
  } else {
    console.log('Exit application option not found');
    const allMenuItems = await page.locator('a, button, [role="menuitem"]').all();
    console.log('Available menu items:', await Promise.all(allMenuItems.map(item => item.textContent())));
  }

  // Step 3: Handle the confirmation prompt "Do you want to clockout ?"
  console.log('Looking for clockout confirmation prompt...');
  const confirmButton = page.getByRole('button', { name: /yes|confirm|ok/i }).first()
    .or(page.getByText('Yes').first())
    .or(page.locator('button').filter({ hasText: /yes|confirm|ok/i }).first());

  if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Found confirmation prompt, clicking Yes...');
    await confirmButton.click({ force: true });
    
    // Wait for confirmation
    try {
      await expect(page.getByText(/success|clocked out|logged out|exit/i)).toBeVisible({ timeout: 10000 });
      console.log('Clock-out confirmation received!');
    } catch (e) {
      console.log('Clock-out completed (no confirmation message found)');
    }
  } else {
    console.log('Clock-out confirmation prompt not found');
  }
}

  // === Example: optional report refresh ===
  // const reports = page.getByRole('link', { name: /reports/i });
  // if (await reports.isVisible().catch(() => false)) {
  //   await reports.click();
  //   await page.waitForLoadState('networkidle');
  //   const runBtn = page.getByRole('button', { name: /run|refresh/i });
  //   if (await runBtn.isVisible().catch(() => false)) {
  //     await Promise.all([
  //       page.waitForResponse(r => r.ok() && /report|export/i.test(r.url())),
  //       runBtn.click()
  //     ]);
  //     await expect(page.getByText(/completed|generated/i)).toBeVisible({ timeout: 30000 });
  //   }
  // }