import 'dotenv/config';
import { chromium } from '@playwright/test';
import { loginAdrenalin, doDailyActions, performClockIn, performClockOut } from './adrenalin.ts';

async function main() {
  const required = ['TARGET_URL', 'LOGIN_USERNAME', 'LOGIN_PASSWORD'];
  for (const k of required) if (!process.env[k]) throw new Error(`Missing env: ${k}`);

  // Check for command line arguments
  const args = process.argv.slice(2);
  const mode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1];

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🚀 Attempt ${attempt}/${maxRetries}`);
    
    const browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
    const context = await browser.newContext({
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata'
    });
    const page = await context.newPage();

    try {
      await loginAdrenalin(page, process.env.TARGET_URL!, process.env.LOGIN_USERNAME!, process.env.LOGIN_PASSWORD!);
      
      if (mode === 'clockin') {
        await performClockIn(page);
      } else if (mode === 'clockout') {
        await performClockOut(page);
      } else {
        await doDailyActions(page);
      }
      
      console.log(`✅ Success on attempt ${attempt}`);
      await browser.close();
      return; // Success - exit the retry loop
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Attempt ${attempt} failed:`, error);
      
      await browser.close();
      
      if (attempt < maxRetries) {
        const waitTime = attempt * 10; // 10s, 20s, 30s delays
        console.log(`⏳ Waiting ${waitTime}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error(`💥 All ${maxRetries} attempts failed. Last error:`);
  throw lastError;
}

main().catch((err) => {
  console.error('Agent failed:', err);
  process.exit(1);
});