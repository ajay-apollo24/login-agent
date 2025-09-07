#!/bin/bash

# Adrenaline GitHub Actions Deployment Script

echo "🚀 Deploying Adrenaline Automation to GitHub Actions..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "feat: Add GitHub Actions automation for daily Adrenaline clock-in/clock-out

- Add daily scheduled workflows for 9 AM clock-in and 7 PM clock-out
- Add manual trigger workflow for testing and manual control
- Update documentation with GitHub Actions setup guide
- Add comprehensive deployment guide
- Configure proper .gitignore for security"

# Check if origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "⚠️  No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/adrenaline.git"
    echo ""
    echo "Then run: git push -u origin main"
    exit 1
fi

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Go to your GitHub repository"
echo "2. Navigate to Settings → Secrets and variables → Actions"
echo "3. Add these secrets:"
echo "   - TARGET_URL: Your Adrenaline URL"
echo "   - LOGIN_USERNAME: Your username"
echo "   - LOGIN_PASSWORD: Your password"
echo "4. Go to Actions tab and enable workflows"
echo "5. Test with Manual Adrenaline Trigger"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🤖 Your automation will run automatically at:"
echo "   - 9:00 AM IST (Clock-in)"
echo "   - 7:00 PM IST (Clock-out)"
echo "   - Monday to Friday only"
echo ""
echo "Happy automating! 🎉"
