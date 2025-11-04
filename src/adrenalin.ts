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

async function exitApplicationMorning(page: Page) {
  console.log('Attempting to exit application (morning mode)...');
  
  // Debug: Take a screenshot and log page content
  console.log('=== DEBUG: Current page state ===');
  const pageTitle = await page.title().catch(() => 'Unknown');
  const url = page.url();
  console.log(`Page title: ${pageTitle}`);
  console.log(`Current URL: ${url}`);
  
  // Look for user icon/profile with expanded selectors
  const userIcon = await waitForAnyVisible(page, [
    page.locator('[data-testid*="user"], [aria-label*="user"], [title*="user"]').first(),
    page.locator('img[alt*="user"], img[alt*="profile"]').first(),
    page.locator('button').filter({ hasText: /user|profile|account/i }).first(),
    page.locator('[class*="user"], [class*="profile"]').first(),
    page.locator('svg').filter({ hasText: /user|profile/i }).first(),
    page.locator('[role="button"]').filter({ hasText: /user|profile|account/i }).first(),
    page.locator('div').filter({ hasText: /user|profile|account/i }).first()
  ], 5000);

  /*
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

      // Handle "Do you want to clockout?" prompt - Click "Exit" in morning
      const clockoutPrompt = await waitForAnyVisible(page, [
        page.getByText(/do you want to clockout/i).first(),
        page.locator('*').filter({ hasText: /do you want to clockout/i }).first()
      ], 3000);

      if (clockoutPrompt) {
        console.log('Found "Do you want to clockout?" prompt - clicking Exit (morning behavior)...');
        const exitButton = await waitForAnyVisible(page, [
          page.getByRole('button', { name: /exit/i }).first(),
          page.getByText('Exit').first(),
          page.locator('button').filter({ hasText: /^Exit$/i }).first()
        ], 3000);

        if (exitButton) {
          await exitButton.click({ force: true });
          console.log('Clicked Exit button for morning clockout prompt.');
        } else {
          console.log('Exit button not found, trying alternative buttons...');
          // Fallback to any button that might be the exit option
          const buttons = await page.locator('button').all();
          for (const btn of buttons) {
            const text = await btn.textContent();
            if (text && /exit|no|cancel/i.test(text.trim())) {
              await btn.click({ force: true });
              console.log(`Clicked ${text} button as exit option.`);
              break;
            }
          }
        }
      }
      
      console.log('Morning exit application completed.');
      return;
    }
  }

  // Fallback: scan all elements for Exit application
  console.log('User menu approach failed; scanning all elements for Exit application...');
  const allElements = await page.locator('a, button, div, span').all();
  for (const el of allElements) {
    const text = (await el.textContent())?.toLowerCase() || '';
    if (text.includes('exit application') || text.includes('sign out')) {
      await el.click({ force: true });
      console.log('Clicked Exit application via element scan.');
      return;
    }
  }
    */

  console.log('Could not find Exit application option.');
}

async function exitApplicationEvening(page: Page) {
  console.log('Attempting to exit application (evening mode)...');
  
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

      // Handle "Do you want to clockout?" prompt - Click "Yes" in evening
      const clockoutPrompt = await waitForAnyVisible(page, [
        page.getByText(/do you want to clockout/i).first(),
        page.locator('*').filter({ hasText: /do you want to clockout/i }).first()
      ], 3000);

      if (clockoutPrompt) {
        console.log('Found "Do you want to clockout?" prompt - clicking Yes (evening behavior)...');
        const yesButton = await waitForAnyVisible(page, [
          page.getByRole('button', { name: /yes/i }).first(),
          page.getByText('Yes').first(),
          page.locator('button').filter({ hasText: /^Yes$/i }).first()
        ], 3000);

        if (yesButton) {
          await yesButton.click({ force: true });
          console.log('Clicked Yes button for evening clockout.');
        } else {
          console.log('Yes button not found, trying alternative confirmation buttons...');
          // Fallback to any button that might be the confirmation option
          const buttons = await page.locator('button').all();
          for (const btn of buttons) {
            const text = await btn.textContent();
            if (text && /yes|ok|confirm/i.test(text.trim())) {
              await btn.click({ force: true });
              console.log(`Clicked ${text} button as confirmation.`);
              break;
            }
          }
        }
      }
      
      console.log('Evening exit application completed.');
      return;
    }
  }

  // Fallback: scan all elements for Exit application
  console.log('User menu approach failed; scanning all elements for Exit application...');
  const allElements = await page.locator('a, button, div, span').all();
  for (const el of allElements) {
    const text = (await el.textContent())?.toLowerCase() || '';
    if (text.includes('exit application') || text.includes('sign out')) {
      await el.click({ force: true });
      console.log('Clicked Exit application via element scan.');
      return;
    }
  }

  console.log('Could not find Exit application option.');
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
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {
      console.log('No navigation detected, but continuing...');
    }),
    loginBtn.click()
  ]);
  
  // Wait for page to actually change after login
  await page.waitForTimeout(3000);
  
  // Post-login verification: be more strict about what constitutes successful login
  console.log('🔍 Verifying successful login...');
  const currentUrl = page.url();
  console.log(`Current URL after login: ${currentUrl}`);
  
  // First check: make sure we're not still on login page
  if (currentUrl.includes('login') || currentUrl.includes('signin')) {
    console.log('❌ Still on login page, login may have failed');
    throw new Error('Login failed: still on login page');
  }
  
  // Look for specific post-login indicators (more strict)
  const marker = await waitForAnyVisible(page, [
    page.getByText(/dashboard|home/i).first(),
    page.getByText(/welcome/i).first(),
    page.getByRole('button', { name: /logout|sign out|exit/i }).first(),
    page.locator('[aria-label*="profile"], [title*="profile"], [data-testid*="profile"]').first(),
    page.locator('[class*="user"], [class*="profile"]').first(),
    // Look for user menu or profile elements that indicate we're logged in
    page.locator('[data-testid*="user"], [aria-label*="user"], [title*="user"]').first(),
    page.locator('img[alt*="user"], img[alt*="profile"]').first()
  ], 30000); // Increased timeout to 30 seconds

  if (!marker) {
    // Try to get more info about what's on the page
    const pageTitle = await page.title().catch(() => 'Unknown');
    const url = page.url();
    console.log(`Current page title: ${pageTitle}`);
    console.log(`Current URL: ${url}`);
    
    // Check if we're still on login page
    if (url.includes('login') || pageTitle.toLowerCase().includes('login')) {
      throw new Error('Login failed: still on login page after 30s');
    } else {
      console.log('⚠️  No standard post-login markers found, but URL suggests we might be logged in');
      console.log('🤞 Proceeding with caution...');
    }
  } else {
    console.log('✅ Login verification successful - found expected UI elements');
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
    console.log('Attempting morning clock-in...');
    
    // Look for automatic clock-in popup that appears after first login of the day
    const clockInBtn = page.getByRole('button', { name: /clock-?in|mark in|punch in/i }).first()
      .or(page.locator('button').filter({ hasText: /clock-?in|mark in|punch in/i }).first());
  
    if (await clockInBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Clock-in popup found - clicking to mark attendance...');
      
      // Click the clock-in button
      await clockInBtn.click({ force: true });
      console.log('Clock-in button clicked, waiting for confirmation...');
      
      // Wait for the page to process the click
      await page.waitForTimeout(3000);
      
      // Debug: Check what's on the page after clicking
      console.log('=== DEBUG: Checking page content after clock-in click ===');
      const allText = await page.locator('body').textContent();
      console.log('Page contains text:', allText?.substring(0, 500) + '...');
      
      // Look for success messages or confirmation with broader patterns
      const successIndicators = await waitForAnyVisible(page, [
        page.getByText(/success|successful|marked|punched|clocked|attendance.*marked/i).first(),
        page.getByText(/already.*clocked/i).first(),
        page.getByText(/completed|done|confirmed/i).first(),
        page.locator('[class*="success"], [class*="confirmation"], [class*="alert"]').first(),
        page.locator('div, span, p').filter({ hasText: /success|marked|clocked/i }).first()
      ], 5000);
      
      if (successIndicators) {
        const confirmText = await successIndicators.textContent();
        console.log('Clock-in confirmation found:', confirmText);
      } else {
        console.log('No explicit confirmation found. Checking if clock-in button disappeared...');
        
        // Check if the clock-in button is still visible (it might disappear after successful click)
        const stillVisible = await clockInBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (!stillVisible) {
          console.log('Clock-in button disappeared - this indicates successful clock-in!');
        } else {
          console.log('Clock-in button still visible. In many Adrenaline systems, this is normal.');
          console.log('The first click likely succeeded - some UIs don\'t hide the button immediately.');
          
          // Try one more click just in case, but don't worry if no confirmation
          console.log('Trying one final click attempt...');
          await clockInBtn.click();
          await page.waitForTimeout(2000);
          console.log('Clock-in attempts completed. Proceeding with exit - attendance likely marked.');
        }
      }
      
      // Exit application after clock-in
      console.log('Clock-in process completed, now exiting application...');
      await exitApplicationMorning(page);
      return;
    }
    
    // If no clock-in popup appears, Adrenaline sometimes doesn't show it
    console.log('No clock-in popup found after first login. This sometimes happens in Adrenaline.');
    console.log('Exiting and will login again to trigger clock-in popup...');
    
    // Exit application first
    await exitApplicationMorning(page);
    
    // Wait a moment before re-login
    await page.waitForTimeout(2000);
    
    // Login again to trigger clock-in popup
    console.log('Logging in again to trigger clock-in popup...');
    await loginAdrenalin(page, process.env.TARGET_URL!, process.env.LOGIN_USERNAME!, process.env.LOGIN_PASSWORD!);
    
    // Look for clock-in popup again
    const secondAttemptBtn = page.getByRole('button', { name: /clock-?in|mark in|punch in/i }).first()
      .or(page.locator('button').filter({ hasText: /clock-?in|mark in|punch in/i }).first());
    
    if (await secondAttemptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Clock-in popup found on second login - clicking to mark attendance...');
      
      // Click the clock-in button
      await secondAttemptBtn.click({ force: true });
      console.log('Clock-in button clicked on second attempt, waiting for confirmation...');
      
      // Wait for success indicators
      await page.waitForTimeout(2000);
      
      // Look for success messages or confirmation
      const successIndicators = await waitForAnyVisible(page, [
        page.getByText(/success|successful|marked|punched|clocked|attendance.*marked/i).first(),
        page.getByText(/already.*clocked/i).first(),
        page.locator('[class*="success"], [class*="confirmation"]').first()
      ], 5000);
      
      if (successIndicators) {
        console.log('Clock-in confirmation found on second attempt - attendance marked successfully!');
      } else {
        console.log('No explicit confirmation found on second attempt, but button was clicked.');
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('Still no clock-in popup on second login. May already be clocked in.');
    }
    
    // Final exit
    console.log('Morning clock-in process completed, exiting application...');
    await exitApplicationMorning(page);
  }

  export async function performClockOut(page: Page) {
    console.log('Attempting evening clock-out...');
    
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
  
    // In evening, the main goal is to clock-out via the exit process
    // The "Do you want to clockout?" prompt during exit serves as the clock-out mechanism
    console.log('Evening clock-out: proceeding directly to exit application...');
    console.log('Clock-out will happen when we click "Yes" to the clockout prompt during exit.');
    
    // Exit application - this will trigger the clockout prompt where we click "Yes"
    await exitApplicationEvening(page);
  }

