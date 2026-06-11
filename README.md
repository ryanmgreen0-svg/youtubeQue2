# YouTube Queue (web + extension)

Files added:

Quick setup:

1. This repository: https://github.com/ryanmgreen0-svg/youtubeQue2
2. The GitHub Pages URL will be: https://ryanmgreen0-svg.github.io/youtubeQue2/
3. `APP_URL` in `extension/background.js` is already set to the Pages URL.
4. Host the `app/` folder on GitHub Pages (or any static host). To publish with GitHub Pages, push this repo to GitHub and enable Pages from the repository settings, serving from the `main` branch (or `gh-pages` branch) root.
5. Load the extension in Edge/Chrome as an unpacked extension (point to the `extension/` folder).
Files present at repository root:
 - `index.html`, `styles.css`, `app.js` — static web app
 - `manifest.json`, `background.js`, `contentScript.js` — Edge/Chrome extension files

Quick setup:

1. This repository: https://github.com/ryanmgreen0-svg/youtubeQue2
2. The GitHub Pages URL will be: https://ryanmgreen0-svg.github.io/youtubeQue2/
3. `APP_URL` in `background.js` is already set to the Pages URL.
4. Publish the site with GitHub Pages: in repository Settings → Pages, set Source to `main` branch / Root and save. After a few minutes the `https://ryanmgreen0-svg.github.io/youtubeQue2/` site will serve `index.html`.

5. Load the extension in Edge/Chrome as an unpacked extension: open `edge://extensions/`, enable Developer mode, click `Load unpacked` and select the repository root directory.

- Right-click anywhere (or on a video) and choose "Queue video to My Queue". The extension opens the app URL with `videoId` and `title` params.
- The web app reads URL params and adds the item to localStorage. New items appear at the top.
