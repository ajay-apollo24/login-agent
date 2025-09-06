# Adrenalin Automation Agent

An automated clock-in/clock-out system for Adrenalin that runs at 9 AM and 7 PM daily.

## Features

- 🌅 **Morning Clock-in**: Automatically clocks in at 9:00 AM
- 🌆 **Evening Clock-out**: Automatically clocks out at 7:00 PM
- ⏰ **Smart Scheduling**: Automatically determines the correct action based on time
- 🎯 **Manual Override**: Run specific actions manually when needed

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   Create a `.env` file with your Adrenalin credentials:

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

### Morning Clock-in (9 AM)

1. Logs into Adrenalin
2. **First login of the day**: Finds and clicks the "Clock-in" button if it appears
3. **Subsequent logins**: Clock-in dialog may not appear (already clocked in) - this is normal
4. Confirms successful clock-in when applicable

### Evening Clock-out (7 PM)

1. Logs into Adrenalin
2. **If Clock-in dialog appears**: Clicks "I'll do this later" to dismiss it
3. **Primary attempt**: Looks for direct "Clock-out" button on landing page
4. **Fallback 1**: Tries Attendance menu for clock-out options
5. **Fallback 2**: Uses user icon → "Exit application" → confirms "Yes" to clockout prompt
6. **Last resort**: Scans all elements for "Exit application" or "Sign out"

## Time-based Logic

- **6 AM - 12 PM**: Clock-in mode
- **5 PM - 10 PM**: Clock-out mode
- **Other times**: No action taken

## Troubleshooting

If the automation fails:

1. Check your internet connection
2. Verify your credentials in the `.env` file
3. Ensure the Adrenalin website is accessible
4. Run with `HEADLESS=false` to see the browser in action

## Scripts

- `npm run agent` - Auto-detect and run appropriate action
- `npm run clockin` - Force clock-in
- `npm run clockout` - Force clock-out
- `npm run schedule` - Start automated scheduler
