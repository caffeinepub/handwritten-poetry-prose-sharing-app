# Publishing Your Poetry & Prose App

This guide explains how to deploy your app as a website on the Internet Computer and how users can install it as a Progressive Web App (PWA).

## Deploying to the Internet Computer

### Prerequisites
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) installed
- Internet Computer wallet with cycles

### Deployment Steps

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to the Internet Computer:**
   ```bash
   dfx deploy --network ic
   ```

3. **Get your canister URL:**
   After deployment, you'll receive a URL like:
   ```
   https://<canister-id>.ic0.app
   ```

4. **Custom Domain (Optional):**
   You can configure a custom domain by following the [Internet Computer custom domain guide](https://internetcomputer.org/docs/current/developer-docs/production/custom-domain/).

### Asset Canister Configuration

The app includes `.ic-assets.json5` configuration that:
- Enables proper routing for single-page application (SPA) navigation
- Allows direct navigation to any route (e.g., `/post/123`)
- Supports page refresh on non-root routes
- Sets appropriate cache headers for optimal performance

## Regenerating Preview Builds

If you need to regenerate a fresh preview build without making code changes:

### When to Regenerate
- Preview link is not updating
- Testing deployment pipeline
- Verifying build configuration
- Refreshing cached assets

### How to Regenerate
1. Request a fresh build through your development interface
2. Wait for the build process to complete
3. Verify the Preview button/link updates to the new build
4. Test that the preview loads correctly

### What to Verify After Regeneration
- Preview link is accessible and loads the app
- All routes work correctly (home, post detail, new post, pricing)
- Authentication flow works (login/logout)
- Images and assets load properly
- Service worker registers successfully
- PWA installation prompt appears (if applicable)

**Note:** Regenerating a preview does not affect your production deployment or backend state. It only creates a new frontend build for testing purposes.

## Installing as a PWA

Your app is now installable as a Progressive Web App on various platforms:

### Android (Chrome)

1. Open the app URL in Chrome
2. Tap the menu (three dots) in the top-right corner
3. Select **"Add to Home screen"** or **"Install app"**
4. Confirm the installation
5. The app icon will appear on your home screen

**Features:**
- Launches in full-screen mode (no browser UI)
- Works offline with cached content
- Appears in your app drawer

### iOS (Safari)

1. Open the app URL in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Edit the name if desired and tap **"Add"**
5. The app icon will appear on your home screen

**Note:** iOS has limited PWA support compared to Android. Some features like service workers have restrictions.

### Desktop (Chrome/Edge)

1. Open the app URL in Chrome or Edge
2. Look for the install icon in the address bar (⊕ or computer icon)
3. Click the icon and select **"Install"**
4. The app will open in its own window

**Alternative method:**
- Click the menu (three dots)
- Select **"Install [App Name]"** or **"Apps" → "Install this site as an app"**

**Features:**
- Runs in a standalone window (no browser tabs)
- Appears in your applications menu
- Can be pinned to taskbar/dock

## Offline Functionality

The PWA includes a service worker that provides:

- **Offline Shell:** The app frame loads even without internet
- **Cached Assets:** Images, fonts, and core files are cached
- **Offline Notice:** Clear message when network is unavailable
- **Graceful Degradation:** Content that requires network shows appropriate loading states

### What Works Offline:
- App shell and navigation
- Previously viewed content (if cached)
- UI and layout

### What Requires Internet:
- Loading new posts
- Creating posts
- Authentication
- Uploading images

## Updating the App

When you deploy a new version:

1. Users will automatically receive updates when they reload the app
2. The service worker checks for updates every minute
3. A new version is installed in the background
4. Users see the new version on their next visit

## Troubleshooting

### PWA Not Installing
- Ensure you're using HTTPS (Internet Computer provides this automatically)
- Check that `manifest.webmanifest` is accessible
- Verify icons are loading correctly
- Try clearing browser cache and reloading

### Routes Not Working After Refresh
- Verify `.ic-assets.json5` is deployed with your frontend
- Check that the asset canister is configured correctly
- Ensure `404.html` is present in the public directory

### Service Worker Issues
- Check browser console for service worker errors
- Unregister old service workers in DevTools → Application → Service Workers
- Clear all site data and reload

### Preview Build Issues
- If preview link doesn't update, request a regeneration
- Clear browser cache before testing new preview
- Check browser console for any loading errors
- Verify all assets are accessible (check Network tab in DevTools)

## Testing PWA Features

Use Chrome DevTools to test PWA functionality:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check:
   - **Manifest:** Verify all fields are correct
   - **Service Workers:** Ensure it's registered and active
   - **Cache Storage:** Verify assets are cached
   - **Lighthouse:** Run PWA audit for installability score

## Best Practices

- **Regular Updates:** Deploy updates regularly to keep content fresh
- **Monitor Performance:** Use Lighthouse to track PWA scores
- **Test Offline:** Verify offline functionality works as expected
- **Cross-Platform Testing:** Test installation on different devices and browsers
- **User Communication:** Inform users about PWA installation benefits
- **Preview Testing:** Always test preview builds before production deployment

## Support

For issues related to:
- **Internet Computer deployment:** [IC Developer Docs](https://internetcomputer.org/docs)
- **PWA features:** [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- **App-specific issues:** Check your canister logs with `dfx canister logs <canister-name>`

---

**Your app is now ready to be shared with the world! 🎉**

Share your canister URL with users, and they can access it as a website or install it as an app on their devices.
