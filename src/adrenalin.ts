import { Page, expect } from '@playwright/test';

type MaybeLocator = import('@playwright/test').Locator;

async function waitForAnyVisible(page: Page, locators: MaybeLocator[], timeout = 15000): Promise<MaybeLocator | null> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const l of locators) {
      try { if (await l.isVisible({ timeout: 250 })) return l; } catch {}
    }
    await page.waitForTimeout(200);
  }
  return null;
}

async function clickIfVisible(locator: MaybeLocator, options: { timeout?: number; force?: boolean } = {}) {
  try {
    if (await locator.isVisible({ timeout: options.timeout ?? 1000 })) {
      await locator.click({ force: options.force ?? true });
      return true;
    }
  } catch {}
  return false;
}

export async function loginAdrenalin(page: Page, url: string, username: string, password: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  
    // Locate fields robustly (tenant UIs vary)
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
  
    // Submit
    const loginBtn = page.getByRole('button', { name: /sign ?in|log ?in|submit/i }).first()
      .or(page.locator('button[type="submit"]').first());
  
    await Promise.all([
      page.waitForLoadState('networkidle'),
      loginBtn.click()
    ]);
  
    // Post-login verification: accept any of several markers as success
    const marker = await waitForAnyVisible(page, [
      page.getByText(/dashboard|home|my tasks/i).first(),
      page.getByText(/attendance/i).first(),
      page.getByRole('button', { name: /logout/i }).first(),
      page.locator('[aria-label*="profile"], [title*="profile"], [data-testid*="profile"]').first()
    ], 20000);
  
    if (!marker) {
      throw new Error('Login likely failed: no post-login marker found within 20s');
    }
  
    await page.waitForLoadState('networkidle');
    console.log('Login completed successfully');
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
    console.log('Attempting clock-in...');
  
    // Primary attempt: look for a visible "Clock-in" / "Punch in" control on the landing page
    const clockInBtn = page.getByRole('button', { name: /clock-?in|mark in|punch in/i }).first()
      .or(page.locator('button').filter({ hasText: /clock-?in|mark in|punch in/i }).first());
  
    if (await clockInBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      try {
        await Promise.all([
          page.waitForResponse(r => r.ok() && /clock|punch|attendance/i.test(r.url()), { timeout: 10000 }),
          clockInBtn.click({ force: true })
        ]);
        console.log('Clock-in triggered successfully from landing page.');
      } catch (error) {
        console.log('Clock-in button clicked, but no response detected (may still be successful)');
      }
      return;
    }
  
    // Fallback: navigate into Attendance module and retry
    console.log('Clock-in button not found on landing; trying Attendance menu...');
    const attendanceMenu = page.getByRole('link', { name: /attendance/i }).first()
      .or(page.getByText(/attendance/i).first());
  
    if (await attendanceMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
      await attendanceMenu.click({ force: true });
      await page.waitForLoadState('networkidle');
  
      const menuClockIn = page.getByRole('button', { name: /clock-?in|mark in|punch in/i }).first()
        .or(page.locator('button').filter({ hasText: /clock-?in|mark in|punch in/i }).first());
  
      if (await menuClockIn.isVisible({ timeout: 3000 }).catch(() => false)) {
        try {
          await Promise.all([
            page.waitForResponse(r => r.ok() && /clock|punch|attendance/i.test(r.url()), { timeout: 10000 }),
            menuClockIn.click({ force: true })
          ]);
          console.log('Clock-in via Attendance menu triggered.');
        } catch (error) {
          console.log('Clock-in button clicked via Attendance menu, but no response detected (may still be successful)');
        }
      } else {
        console.log('No Clock-in control under Attendance. Assuming already clocked-in.');
      }
    } else {
      console.log('Attendance menu not visible. Assuming already clocked-in.');
    }
  }

  export async function performClockOut(page: Page) {
    console.log('Attempting clock-out...');
  
    // Step 0: Handle Clock-in dialog if it appears (common in evening)
    console.log('Checking if Clock-in dialog appears...');
    const clockInDialog = await waitForAnyVisible(page, [
      page.getByRole('button', { name: /clock-?in|mark in|punch in/i }).first(),
      page.locator('button').filter({ hasText: /clock-?in|mark in|punch in/i }).first()
    ], 3000);
  
    if (clockInDialog) {
      console.log('Clock-in dialog found in evening - looking for "I\'ll do this later" button...');
      
      const laterButton = await waitForAnyVisible(page, [
        page.getByRole('button', { name: /i\'ll do this later|later|skip/i }).first(),
        page.getByText(/i\'ll do this later|later|skip/i).first(),
        page.locator('button').filter({ hasText: /i\'ll do this later|later|skip/i }).first()
      ], 2000);
  
      if (laterButton) {
        console.log('Found "I\'ll do this later" button, clicking...');
        await laterButton.click({ force: true });
        await page.waitForTimeout(1000);
      } else {
        console.log('Could not find "I\'ll do this later" button, trying to close dialog...');
        // Try to find close button
        const closeButton = await waitForAnyVisible(page, [
          page.getByRole('button', { name: /close|cancel|x/i }).first(),
          page.locator('button').filter({ hasText: /close|cancel|x/i }).first(),
          page.locator('[aria-label*="close"], [title*="close"]').first()
        ], 2000);
        
        if (closeButton) {
          await closeButton.click({ force: true });
          await page.waitForTimeout(1000);
        }
      }
    }
  
    // Step 1: Primary attempt - look for a "Clock-out / Punch out" control on the landing page
    const clockOutBtn = page.getByRole('button', { name: /clock-?out|mark out|punch out/i }).first()
      .or(page.locator('button').filter({ hasText: /clock-?out|mark out|punch out/i }).first());
  
    if (await clockOutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      try {
        await Promise.all([
          page.waitForResponse(r => r.ok() && /clock|punch|attendance|logout/i.test(r.url()), { timeout: 10000 }),
          clockOutBtn.click({ force: true })
        ]);
        console.log('Clock-out triggered successfully from landing page.');
      } catch (error) {
        console.log('Clock-out button clicked, but no response detected (may still be successful)');
      }
      return;
    }
  
    // Step 2: Fallback - try Attendance menu
    console.log('Clock-out button not found on landing; trying Attendance menu...');
    const attendanceMenu = page.getByRole('link', { name: /attendance/i }).first()
      .or(page.getByText(/attendance/i).first());
  
    if (await attendanceMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
      await attendanceMenu.click({ force: true });
      await page.waitForLoadState('networkidle');
  
      const menuClockOut = page.getByRole('button', { name: /clock-?out|mark out|punch out/i }).first()
        .or(page.locator('button').filter({ hasText: /clock-?out|mark out|punch out/i }).first());
  
      if (await menuClockOut.isVisible({ timeout: 3000 }).catch(() => false)) {
        try {
          await Promise.all([
            page.waitForResponse(r => r.ok() && /clock|punch|attendance|logout/i.test(r.url()), { timeout: 10000 }),
            menuClockOut.click({ force: true })
          ]);
          console.log('Clock-out via Attendance menu triggered.');
        } catch (error) {
          console.log('Clock-out button clicked via Attendance menu, but no response detected (may still be successful)');
        }
        return;
      }
    }
  
    // Step 3: User icon and Exit application approach
    console.log('No direct clock-out control found; trying user menu approach...');
    
    // Look for user icon/profile
    const userIcon = await waitForAnyVisible(page, [
      page.locator('[data-testid*="user"], [aria-label*="user"], [title*="user"]').first(),
      page.locator('img[alt*="user"], img[alt*="profile"]').first(),
      page.locator('button').filter({ hasText: /user|profile|account/i }).first(),
      page.locator('[class*="user"], [class*="profile"]').first()
    ], 5000);
  
    if (userIcon) {
      console.log('Found user icon, clicking...');
      await userIcon.click({ force: true });
      await page.waitForTimeout(1000); // Wait for dropdown/menu to appear
  
      // Look for Exit application
      const exitOption = await waitForAnyVisible(page, [
        page.getByText('Exit application', { exact: true }).first(),
        page.locator('*').filter({ hasText: /^Exit application$/ }).first(),
        page.getByRole('menuitem', { name: /exit application/i }).first(),
        page.locator('a, button, div, span').filter({ hasText: /^Exit application$/ }).first()
      ], 3000);
  
      if (exitOption) {
        console.log('Found Exit application option, clicking...');
        await exitOption.click({ force: true });
        await page.waitForTimeout(1000);
  
        // Handle confirmation prompt "Do you want to clockout ?"
        const confirmButton = await waitForAnyVisible(page, [
          page.getByRole('button', { name: /yes|confirm|ok/i }).first(),
          page.getByText('Yes').first(),
          page.locator('button').filter({ hasText: /yes|confirm|ok/i }).first()
        ], 5000);
  
        if (confirmButton) {
          console.log('Found confirmation prompt, clicking Yes...');
          await confirmButton.click({ force: true });
          console.log('Clock-out via Exit application completed.');
          return;
        }
      }
    }
  
    // Step 4: Last fallback - scan for Exit application in all elements
    console.log('User menu approach failed; scanning all elements for Exit application...');
    const allElements = await page.locator('a, button, div, span').all();
    for (const el of allElements) {
      const text = (await el.textContent())?.toLowerCase() || '';
      if (text.includes('exit application') || text.includes('sign out')) {
        await el.click({ force: true });
        console.log('Clicked Exit application as clock-out.');
        return;
      }
    }
  
    console.log('No clock-out control found. Assuming already clocked-out.');
  }

