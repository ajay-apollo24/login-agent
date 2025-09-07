# Adrenaline Automation Deployment Guide

This guide will help you set up automated daily clock-in/clock-out for your Adrenaline system using GitHub Actions.

## 🚀 Quick Setup

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `TARGET_URL` | Your Adrenaline login URL | `https://ahl247.myadrenalin.com/AdrenalinMax/#/` |
| `LOGIN_USERNAME` | Your Adrenaline username | `your.username` |
| `LOGIN_PASSWORD` | Your Adrenaline password | `your-secure-password` |

### 2. Enable GitHub Actions

1. Go to your repository → Actions tab
2. If prompted, click "I understand my workflows, go ahead and enable them"
3. The workflows will now be active

## 📅 Automation Schedule

The automation runs automatically on weekdays (Monday-Friday):

- **Clock-in**: 9:00 AM IST (3:30 AM UTC)
- **Clock-out**: 7:00 PM IST (1:30 PM UTC)

## 🎮 Manual Controls

### Manual Trigger Options

You can manually trigger the automation anytime:

1. Go to Actions → "Manual Adrenaline Trigger"
2. Click "Run workflow"
3. Choose your action:
   - **auto**: Automatic time-based decision
   - **clockin**: Force clock-in
   - **clockout**: Force clock-out
   - **test**: Test login only
4. Enable debug mode for troubleshooting (non-headless browser)

### Local Testing

Test locally before deploying:

```bash
# Copy environment template
cp env_template .env

# Edit .env with your credentials
nano .env

# Test clock-in
npm run clockin

# Test clock-out  
npm run clockout

# Test automatic mode
npm run agent
```

## 🔧 Workflow Details

### Daily Automation (`daily-adrenaline.yml`)

- Runs on Ubuntu latest
- Uses Node.js 20
- Installs Playwright with Chromium
- Automatically determines action based on IST time
- Uploads failure screenshots for debugging

### Manual Trigger (`manual-trigger.yml`)

- Same setup as daily automation
- Allows manual control over actions
- Optional debug mode for troubleshooting
- Uploads execution artifacts

## 🛠️ Troubleshooting

### Common Issues

1. **Login Failed**
   - Verify `TARGET_URL`, `LOGIN_USERNAME`, `LOGIN_PASSWORD` secrets
   - Check if your Adrenaline site is accessible
   - Run manual trigger with debug mode

2. **Clock-in/Clock-out Not Working**
   - Adrenaline UI might have changed
   - Check failure screenshots in Actions artifacts
   - Run manual trigger to test specific actions

3. **Timezone Issues**
   - Workflows use IST (Asia/Kolkata) timezone
   - Adjust cron schedules in workflow files if needed

### Debug Steps

1. **Enable Debug Mode**:
   - Use manual trigger with debug mode enabled
   - Check execution artifacts for screenshots

2. **Check Logs**:
   - Go to Actions → Recent workflow run
   - Expand each step to see detailed logs

3. **Test Locally**:
   - Set `HEADLESS=false` in `.env`
   - Run commands locally to see browser actions

## 📊 Monitoring

### Success Indicators

- ✅ Green checkmark in Actions tab
- No error messages in workflow logs
- Expected behavior in Adrenaline system

### Failure Handling

- 📸 Screenshots uploaded on failure
- 📋 Detailed error logs in Actions
- 🔄 Can retry manually if needed

## 🔒 Security Notes

- Secrets are encrypted in GitHub
- Browser runs in headless mode in production
- No credentials stored in code or logs
- Artifacts auto-expire after 7 days

## 📈 Customization

### Changing Schedule
Edit `.github/workflows/daily-adrenaline.yml`:

```yaml
schedule:
  # Clock-in at 8:30 AM IST (3:00 AM UTC)
  - cron: '0 3 * * 1-5'
  # Clock-out at 6:30 PM IST (1:00 PM UTC)  
  - cron: '0 13 * * 1-5'
```

### Adding Holidays

You can disable automation for specific dates by:

1. Adding date checks in the workflow
2. Using manual triggers only on those days
3. Temporarily disabling the workflow

### Multiple Users

For multiple users:

1. Fork the repository for each user
2. Set up separate secrets for each fork
3. Each fork runs independently

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review workflow logs in GitHub Actions
3. Test locally with debug mode
4. Check if Adrenaline UI has changed

## 🎯 Next Steps

1. ✅ Set up GitHub secrets
2. ✅ Test manual trigger
3. ✅ Wait for first scheduled run
4. ✅ Monitor and adjust as needed

Your Adrenaline automation is now ready to run! 🚀
