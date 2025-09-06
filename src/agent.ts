import 'dotenv/config';
import { chromium } from '@playwright/test';
import { loginAdrenalin, doDailyActions, performClockIn, performClockOut } from './adrenalin.ts';

async function main() {
  const required = ['TARGET_URL', 'LOGIN_USERNAME', 'LOGIN_PASSWORD'];
  for (const k of required) if (!process.env[k]) throw new Error(`Missing env: ${k}`);

  // Check for command line arguments
  const args = process.argv.slice(2);
  const mode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1];

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
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Agent failed:', err);
  process.exit(1);
});