# Update Amplify Build Settings via AWS CLI

## Step 1: Get Your Amplify App ID

You can find your Amplify App ID from:

1. **AWS Console:**
   - Go to https://console.aws.amazon.com/amplify/
   - Click on your app
   - The App ID is shown at the top or in the URL

2. **From the App URL:**
   - Your Amplify app URL looks like: `https://main.d1234567890.amplifyapp.com`
   - Or: `https://console.aws.amazon.com/amplify/home?region=us-east-1#/d1234567890`
   - The App ID is `d1234567890` (the string of letters/numbers)

## Step 2: Update Build Settings

Run this command with your App ID:

```powershell
# Replace YOUR_APP_ID with your actual App ID
aws amplify update-branch `
    --app-id YOUR_APP_ID `
    --branch-name main `
    --build-spec file://amplify.yml
```

Or use the PowerShell script:

```powershell
.\update-amplify-buildspec-simple.ps1 -AppId "YOUR_APP_ID" -BranchName "main"
```

## Alternative: Direct Command

If you know your App ID, replace `YOUR_APP_ID` and run:

```powershell
$appId = "YOUR_APP_ID"
$buildSpec = Get-Content "amplify.yml" -Raw
aws amplify update-branch --app-id $appId --branch-name main --build-spec $buildSpec
```

## Verify Success

After running the command, you should see a JSON response with branch configuration.

Then:
1. Go to Amplify Console → Your App → Your Branch
2. Check **App settings** → **Build settings**
3. It should now show it's using `amplify.yml` from the repository

## Troubleshooting

If you get permission errors:
- Check that your AWS user has `amplify:UpdateBranch` permission
- Or update manually in Amplify Console (App Settings > Build settings > Edit)


