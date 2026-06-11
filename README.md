# YouTube Queue (web + extension)

Files added:
- `app/` — static web app (index.html, styles.css, app.js)
- `extension/` — Edge/Chrome extension (manifest + background worker)

Quick setup:

1. Replace `APP_URL` in `extension/background.js` with your hosted GitHub Pages URL (e.g. `https://username.github.io/repo/`).
2. Host the `app/` folder on GitHub Pages (or any static host).
3. Load the extension in Edge/Chrome as an unpacked extension (point to the `extension/` folder).

How it works:
- Right-click anywhere (or on a video) and choose "Queue video to My Queue". The extension opens the app URL with `videoId` and `title` params.
- The web app reads URL params and adds the item to localStorage. New items appear at the top.
