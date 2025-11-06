# 🔐 GitHub Authentication Setup

## Issue: Authentication Failed

GitHub no longer allows password authentication via HTTPS. You need to use a Personal Access Token (PAT).

## Solution: Create Personal Access Token

### Step 1: Generate Token on GitHub
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Fill in:
   - **Note**: `Wonderland Deployment` (or any description)
   - **Expiration**: 90 days (or No expiration for permanent)
   - **Scopes**: Check ✓
     - `repo` (full access to private/public repos)
     - `workflow` (for GitHub Actions)
4. Click "Generate token"
5. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Use Token for Authentication

Option A: Store token in Git credentials (Recommended)
```bash
git config --global credential.helper wincred
# Then when prompted, use:
# Username: ibraheemYG
# Password: YOUR_PERSONAL_ACCESS_TOKEN
```

Option B: Use token in URL directly
```bash
git remote set-url origin https://ibraheemYG:YOUR_PERSONAL_ACCESS_TOKEN@github.com/ibraheemYG/wonderland.git
git push -u origin main
```

Option C: Use SSH (Advanced)
1. Generate SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
2. Add to GitHub: https://github.com/settings/keys
3. Update remote:
```bash
git remote set-url origin git@github.com:ibraheemYG/wonderland.git
git push -u origin main
```

## After Pushing Successfully

Your code will be available at:
```
https://github.com/ibraheemYG/wonderland
```

## Next: Deploy to Render

1. Go to https://render.com
2. Sign in with GitHub
3. Create new Web Service
4. Connect your `wonderland` repository
5. Set deployment settings and deploy!

---

**Which option do you prefer for authentication?**
