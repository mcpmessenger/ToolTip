# Amplify Build Configuration Fix

## Current Issue
Amplify is using default build settings instead of the custom `amplify.yml` file, causing `npm ci` to fail because it expects a `package-lock.json` that matches the default `package.json`.

## Solution 1: Configure Amplify Console (Recommended)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your Amplify app
3. Click on your branch (usually `main`)
4. Go to **App settings** → **Build settings**
5. Click **Edit** in the build specification section
6. Select **Use a buildspec file** and ensure it points to `amplify.yml`
7. Click **Save**
8. Go back and click **Redeploy this version** or wait for the next automatic build

## Solution 2: Update Build Settings via AWS CLI (If you have permissions)

```bash
aws amplify update-branch \
  --app-id YOUR_APP_ID \
  --branch-name main \
  --build-spec file://amplify.yml
```

## Why This Happens
Amplify Console allows you to set build settings manually, and when you do, it ignores the `amplify.yml` file in the repository. You need to explicitly tell Amplify to use the file from the repository.

## Verification
After updating, you should see these messages in the build log:
- "🚀 Starting ToolTip Companion Chrome Extension build..."
- "📦 Installing frontend dependencies..."
- "✅ Frontend dependencies installed"

Instead of:
- "Installing dependencies..."
- "npm ci"

## Current amplify.yml Configuration

The `amplify.yml` file:
- Copies `package-amplify.json` to `package.json`
- Removes any conflicting `package-lock.json`
- Uses `npm install --legacy-peer-deps` instead of `npm ci`
- Builds both frontend and backend

This configuration is correct and will work once Amplify is set to use it.


