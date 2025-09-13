import 'dotenv/config';
import { spawn } from 'child_process';
import { chromium } from '@playwright/test';
import { loginAdrenalin, performClockIn, performClockOut } from './adrenalin.ts';

class AdrenalinScheduler {
  private isRunning = false;
  private isExecuting = false; // Prevent simultaneous execution

  async start() {
    console.log('🕐 Adrenalin Scheduler started');
    console.log('📅 Schedule:');
    console.log('  - Clock-in: 9:00 AM');
    console.log('  - Clock-out: 7:00 PM');
    console.log('⏰ Current time:', new Date().toLocaleString());
    console.log('');

    this.isRunning = true;
    this.scheduleClockIn();
    this.scheduleClockOut();
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n🛑 Scheduler stopped');
      this.isRunning = false;
      process.exit(0);
    });
  }

  private scheduleClockIn() {
    const now = new Date();
    const clockInTime = new Date();
    clockInTime.setHours(9, 0, 0, 0); // 9:00 AM

    // If it's already past 9 AM today, schedule for tomorrow
    if (now >= clockInTime) {
      clockInTime.setDate(clockInTime.getDate() + 1);
    }

    const msUntilClockIn = clockInTime.getTime() - now.getTime();
    const hoursUntilClockIn = Math.floor(msUntilClockIn / (1000 * 60 * 60));
    const minutesUntilClockIn = Math.floor((msUntilClockIn % (1000 * 60 * 60)) / (1000 * 60));

    console.log(`⏰ Clock-in scheduled for: ${clockInTime.toLocaleString()}`);
    console.log(`⏳ Time until clock-in: ${hoursUntilClockIn}h ${minutesUntilClockIn}m`);

    // Add a small delay to prevent race conditions
    const safeDelay = Math.max(msUntilClockIn, 1000); // Minimum 1 second delay

    setTimeout(async () => {
      if (this.isRunning) {
        console.log('\n🌅 Time for clock-in!');
        await this.executeClockIn();
        // Schedule next day's clock-in after a small delay to prevent overlap
        setTimeout(() => {
          if (this.isRunning) {
            this.scheduleClockIn();
          }
        }, 2000);
      }
    }, safeDelay);
  }

  private scheduleClockOut() {
    const now = new Date();
    const clockOutTime = new Date();
    clockOutTime.setHours(19, 0, 0, 0); // 7:00 PM

    // If it's already past 7 PM today, schedule for tomorrow
    if (now >= clockOutTime) {
      clockOutTime.setDate(clockOutTime.getDate() + 1);
    }

    const msUntilClockOut = clockOutTime.getTime() - now.getTime();
    const hoursUntilClockOut = Math.floor(msUntilClockOut / (1000 * 60 * 60));
    const minutesUntilClockOut = Math.floor((msUntilClockOut % (1000 * 60 * 60)) / (1000 * 60));

    console.log(`⏰ Clock-out scheduled for: ${clockOutTime.toLocaleString()}`);
    console.log(`⏳ Time until clock-out: ${hoursUntilClockOut}h ${minutesUntilClockOut}m`);

    // Add a small delay to prevent race conditions
    const safeDelay = Math.max(msUntilClockOut, 1000); // Minimum 1 second delay

    setTimeout(async () => {
      if (this.isRunning) {
        console.log('\n🌆 Time for clock-out!');
        await this.executeClockOut();
        // Schedule next day's clock-out after a small delay to prevent overlap
        setTimeout(() => {
          if (this.isRunning) {
            this.scheduleClockOut();
          }
        }, 2000);
      }
    }, safeDelay);
  }

  private async executeClockIn() {
    if (this.isExecuting) {
      console.log('⚠️ Another operation is already running, skipping clock-in');
      return;
    }

    this.isExecuting = true;
    try {
      console.log('🚀 Starting clock-in process...');
      const browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
      const context = await browser.newContext({
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata'
      });
      const page = await context.newPage();

      await loginAdrenalin(page, process.env.TARGET_URL!, process.env.LOGIN_USERNAME!, process.env.LOGIN_PASSWORD!);
      await performClockIn(page);
      
      await browser.close();
      console.log('✅ Clock-in completed successfully!');
    } catch (error) {
      console.error('❌ Clock-in failed:', error);
    } finally {
      this.isExecuting = false;
    }
  }

  private async executeClockOut() {
    if (this.isExecuting) {
      console.log('⚠️ Another operation is already running, skipping clock-out');
      return;
    }

    this.isExecuting = true;
    try {
      console.log('🚀 Starting clock-out process...');
      const browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
      const context = await browser.newContext({
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata'
      });
      const page = await context.newPage();

      await loginAdrenalin(page, process.env.TARGET_URL!, process.env.LOGIN_USERNAME!, process.env.LOGIN_PASSWORD!);
      await performClockOut(page);
      
      await browser.close();
      console.log('✅ Clock-out completed successfully!');
    } catch (error) {
      console.error('❌ Clock-out failed:', error);
    } finally {
      this.isExecuting = false;
    }
  }
}

// Start the scheduler
const scheduler = new AdrenalinScheduler();
scheduler.start().catch(console.error);
