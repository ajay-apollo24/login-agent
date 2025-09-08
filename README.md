# Adrenalin Automation Agent 🤖

A robust, intelligent automation system for Adrenalin attendance management with scheduled clock-in/clock-out at 9 AM and 7 PM daily. Now with **GitHub Actions support** for fully automated cloud execution!

## ✨ Features

- 🤖 **GitHub Actions Integration**: Fully automated cloud execution - no local setup required!
- 🌅 **Smart Morning Clock-in**: Automatically handles first-time and subsequent logins at 9:00 AM
- 🌆 **Intelligent Evening Clock-out**: Manages evening dialogs and clock-out process at 7:00 PM  
- ⏰ **Time-based Automation**: Automatically determines correct action based on current time
- 🎯 **Manual Override**: Run specific actions manually via GitHub interface
- 🔄 **Multi-tier Fallback**: Multiple strategies ensure reliability across different UI states
- 🚪 **Auto-exit**: Cleanly exits application after attendance marking
- 🛡️ **Error Resilience**: Robust error handling and graceful degradation
- 📱 **Dialog Handling**: Intelligently manages "I'll do this later" and confirmation prompts
- 🔒 **Secure**: Credentials stored as encrypted GitHub secrets
- 📸 **Debug Support**: Screenshots and logs on failures

## 🚀 Quick Start (GitHub Actions - Recommended)

### 1. Deploy to GitHub Actions

1. **Fork/Clone** this repository to your GitHub account
2. **Set up secrets** in your repository:
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `TARGET_URL`: Your Adrenaline URL (e.g., `https://ahl247.myadrenalin.com/AdrenalinMax/#/`)
     - `LOGIN_USERNAME`: Your Adrenaline username
     - `LOGIN_PASSWORD`: Your Adrenaline password

3. **Enable Actions**: Go to Actions tab and enable workflows

That's it! Your automation will run automatically on weekdays at 9 AM and 7 PM IST. 🎉

### 2. Manual Controls via GitHub

- Go to **Actions** tab → **"Manual Adrenaline Trigger"**
- Click **"Run workflow"** to trigger manually
- Choose action: `auto`, `clockin`, `clockout`, or `test`
- Enable debug mode for troubleshooting

## 🖥️ Local Setup (Optional)

For local testing and development:

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   Copy env_template as `.env` file with your credentials:

   ```env
   TARGET_URL=https://your-adrenalin-url.com
   LOGIN_USERNAME=your_username
   LOGIN_PASSWORD=your_password
   HEADLESS=false  # Set to true for headless mode
   ```

## Usage

### Automated Scheduling

Run the scheduler to automatically handle clock-in/clock-out:

```bash
npm run schedule
```

This will:

- Schedule clock-in for 9:00 AM daily
- Schedule clock-out for 7:00 PM daily
- Keep running until stopped (Ctrl+C)

### Manual Execution

**Clock-in only**:

```bash
npm run clockin
```

**Clock-out only**:

```bash
npm run clockout
```

**Auto-detect based on time**:

```bash
npm run agent
```

## How It Works

### 🌅 Morning Clock-in (9 AM)

1. **Login**: Securely logs into Adrenalin with robust field detection
2. **Clock-in Popup Detection**: 
   - **First attempt**: Looks for automatic clock-in popup after login
   - **If popup appears**: Clicks clock-in button to mark attendance
3. **Adrenalin Quirk Handling**: 
   - **If no popup**: Exits application and logs in again (Adrenalin sometimes doesn't show popup on first login)
   - **Second attempt**: Looks for clock-in popup again after re-login
4. **Exit Process**: 
   - **User menu**: Clicks user icon → "Exit application"
   - **Clock out prompt**: If "Do you want to clock out?" appears, clicks **"Exit"** (morning behavior)
5. **Clean Session**: Ensures proper logout after attendance marking

### 🌆 Evening Clock-out (7 PM)

1. **Login**: Securely logs into Adrenalin with enhanced verification
2. **Dialog Management**: 
   - **Clock-in dialog**: If appears, clicks "I'll do this later" to dismiss
   - **Fallback**: Uses close button if "later" option not found
3. **Clock-out Strategy**: 
   - **Direct approach**: Goes straight to exit application process
   - **Clock-out via exit**: Uses the exit process to trigger clock out
4. **Exit Process**:
   - **User menu**: Clicks user icon → "Exit application"  
   - **Clock out prompt**: When "Do you want to clock out?" appears, clicks **"Yes"** (evening behavior)
5. **Attendance Completion**: Clock-out is completed through the exit confirmation process

## ⏰ Time-based Logic

- **6 AM - 12 PM**: Clock-in mode (morning attendance)
- **5 PM - 10 PM**: Clock-out mode (evening attendance)  
- **Other times**: No action taken (outside working hours)

## 🔧 Technical Features

### Robust Element Detection

- **Multi-selector Strategy**: Uses role-based, text-based, and CSS selectors
- **Tenant Flexibility**: Works across different Adrenalin UI configurations
- **Race Condition Handling**: `waitForAnyVisible()` utility for efficient element detection

### Error Resilience  

- **Network Timeouts**: 10-second limits prevent hanging on slow responses
- **Graceful Degradation**: Continues operation even if some steps fail
- **Assumption Logging**: Clear messages about system assumptions and fallbacks

### Security & Cleanup

- **Secure Login**: Robust credential handling with multiple field detection strategies
- **Session Management**: Proper logout and application exit after each run
- **Browser Cleanup**: Ensures no lingering browser processes

## 🚨 Troubleshooting

### Common Issues

**Automation fails to start:**

1. Check your internet connection
2. Verify credentials in `.env` file are correct
3. Ensure Adrenalin website is accessible
4. Run with `HEADLESS=false` to see browser in action

**Clock-in/Clock-out not working:**

1. Check if you're already clocked in/out (system handles this gracefully)
2. Verify the time-based logic matches your requirements
3. Look at console output for detailed step-by-step logging

**Browser issues:**

1. Update Playwright browsers: `npx playwright install`
2. Clear browser cache if needed
3. Check for system updates

### Debug Mode

Run with visible browser to see what's happening:

```bash
HEADLESS=false npm run clockin
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run agent` | Auto-detect time and run appropriate action |
| `npm run clockin` | Force morning clock-in process |
| `npm run clockout` | Force evening clock-out process |
| `npm run schedule` | Start automated scheduler (runs continuously) |

## 🏗️ Architecture

### Core Components

- **`agent.ts`**: Main entry point with command-line argument handling
- **`adrenalin.ts`**: Core automation logic with login, clock-in/out, and exit functions
- **`scheduler.ts`**: Automated scheduling system for 9 AM and 7 PM execution

### Utility Functions

- **`waitForAnyVisible()`**: Efficiently waits for any of multiple elements
- **`clickIfVisible()`**: Safe clicking with visibility checks
- **`exitApplication()`**: Robust application exit with multiple fallback strategies

## 🔒 Security Notes

- Environment variables are used for credentials (never hardcoded)
- GitHub secrets are encrypted and secure
- `.gitignore` prevents accidental credential commits
- Browser sessions are properly cleaned up after each run
- No persistent storage of sensitive information
- Headless browser execution in production

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Comprehensive GitHub Actions setup guide
- **GitHub Actions**: Built-in workflow documentation and troubleshooting
- **Code Comments**: Detailed inline documentation

## 🎯 Why GitHub Actions?

- ☁️ **No Local Setup**: Runs entirely in the cloud
- 🔄 **Reliable Scheduling**: Never miss clock-in/clock-out
- 🔒 **Secure**: Encrypted secrets, no local credential storage
- 📊 **Monitoring**: Built-in logs and failure notifications
- 🆓 **Free**: GitHub Actions free tier is sufficient for daily automation
- 🌍 **Always Available**: Runs regardless of your computer status

---

**Ready to automate your attendance?** Follow the Quick Start guide above! 🚀

For detailed setup and troubleshooting, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.
# Force workflow recognition - Mon Sep  8 09:07:55 IST 2025
