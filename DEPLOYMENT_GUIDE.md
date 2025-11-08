# Moto-Rush Deployment Guide

## GitHub Pages Deployment

This guide explains how to deploy Moto-Rush to GitHub Pages for public hosting.

## Prerequisites

1. **GitHub Repository**: Create a new repository or use existing one
2. **GitHub Actions**: Enabled for automatic deployments
3. **Node.js**: Version 16 or higher

## Quick Deployment Steps

### 1. Setup GitHub Repository
```bash
# Clone your repository
git clone <your-repo-url>
cd <your-repo-name>

# Copy the moto-rush files to the repository root
# (The game is already built and ready)
```

### 2. Configure GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### 3. Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 4. Deploy

```bash
# Add and commit files
git add .
git commit -m "Add Moto-Rush game"
git push origin main
```

GitHub Actions will automatically build and deploy your game to `https://<username>.github.io/<repository-name>/moto-rush/`

## Manual Deployment (Alternative)

If you prefer manual deployment:

### 1. Build the Project
```bash
npm run build
```

### 2. Deploy to GitHub Pages
```bash
# Install gh-pages package
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

## Configuration Notes

### Vite Configuration
The `vite.config.ts` is already configured with:
- **Base path**: `/moto-rush/` (adjust if your repository name is different)
- **Build optimization**: Code splitting for better performance
- **Asset handling**: Proper file organization

### Repository Structure
```
your-repository/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
├── public/
├── dist/              # Auto-generated
├── package.json
├── vite.config.ts
└── README.md
```

### Custom Domain (Optional)

If you have a custom domain:

1. Create `public/CNAME` file with your domain:
   ```
   yourdomain.com
   ```

2. Configure DNS settings:
   - Add CNAME record: `www.yourdomain.com` → `<username>.github.io`
   - Add A records for apex domain

## Testing Your Deployment

### Local Testing
```bash
# Build and preview locally
npm run build
npm run preview
```

### Browser Testing
Test in multiple browsers:
- Chrome/Chromium
- Firefox  
- Safari
- Edge

### Camera Feature Testing
For AI Camera controls:
1. **HTTPS Required**: GitHub Pages provides this automatically
2. **Browser Permissions**: Test camera permission flow
3. **Fallback**: Verify keyboard controls work if camera fails

## Troubleshooting

### Common Issues

1. **404 Errors on Page Refresh**
   - Ensure `vite.config.ts` has correct base path
   - Check GitHub Pages source is set to GitHub Actions

2. **Camera Not Working**
   - Verify HTTPS (GitHub Pages provides this)
   - Check browser console for errors
   - Test with different browsers

3. **Build Failures**
   - Check Node.js version (use Node 16+)
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

4. **Performance Issues**
   - Check browser dev tools for warnings
   - Verify Three.js assets are loading correctly
   - Test on mobile devices

### Getting Help

If you encounter issues:

1. Check browser console for errors
2. Verify all files are committed to repository
3. Check GitHub Actions logs for build errors
4. Test locally first before deploying

## Security Notes

- **Camera Access**: Requires HTTPS (provided by GitHub Pages)
- **No Server-Side Code**: Pure client-side game, secure by design
- **External Dependencies**: TensorFlow.js loads from CDN

## Performance Optimization

The game includes:
- **Code Splitting**: Separate chunks for vendor libraries
- **Asset Optimization**: Compressed Three.js models
- **Responsive Design**: Optimized for all screen sizes
- **Efficient Rendering**: Optimized Three.js usage

## Next Steps

After successful deployment:

1. **Customize**: Modify colors, textures, or game mechanics
2. **Add Features**: Implement power-ups, additional levels, etc.
3. **Analytics**: Add tracking for player engagement
4. **Social**: Add sharing features
5. **Mobile App**: Consider wrapping in Capacitor for app stores

## Success!

Once deployed, your game will be accessible at:
`https://<username>.github.io/<repository-name>/moto-rush/`

Share the link and enjoy your fast-paced motorcycle racing game! 🏍️