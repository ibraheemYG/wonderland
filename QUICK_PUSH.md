# ⚡ Quick Push Instructions

## What You Need To Do:

### 1. Generate GitHub Personal Access Token
Go to: https://github.com/settings/tokens/new

Fill in:
- **Note**: Wonderland Deployment
- **Expiration**: 90 days
- **Scopes**: Check `repo` and `workflow`

Click "Generate token" and **COPY IT**

### 2. Configure Git to Store Token

Run this command:
```bash
git config --global credential.helper wincred
```

### 3. Push Your Code

Run:
```bash
cd c:\Users\bmw\Desktop\wonderland
git push -u origin main
```

When prompted:
- **Username**: ibraheemYG
- **Password**: PASTE_YOUR_TOKEN_HERE (not your password!)

### 4. Verify Success

Visit: https://github.com/ibraheemYG/wonderland

You should see all your code there! ✅

## Then Deploy to Render

1. Go to https://render.com
2. Sign in with GitHub
3. Select "New +" → "Web Service"
4. Connect your "wonderland" repo
5. Deploy settings:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
6. Create and wait 5-10 minutes

Your live site: https://wonderland.onrender.com

---

**Ready? Let me know when you get your token!**
