# YouTube Ad Muter & Skipper — Chrome Extension

Automatically mutes YouTube ads the instant they start, clicks Skip as soon as
the button appears, and restores your original volume when the ad ends.

---

## Files

```
youtube-ad-muter/
├── manifest.json   ← extension config (Manifest V3)
├── content.js      ← core logic (injected into youtube.com)
├── popup.html      ← status popup when you click the toolbar icon
├── icon16.png      ← (you supply) 16×16 icon  [optional for local use]
├── icon48.png      ← (you supply) 48×48 icon  [optional for local use]
└── icon128.png     ← (you supply) 128×128 icon [optional for local use]
```

> Icons are optional for local/personal use — Chrome uses a default if missing.

---

## How it works

1. A `MutationObserver` watches the `.html5-video-player` element for the
   `.ad-showing` class that YouTube adds whenever an ad plays.
2. The moment that class appears, the `<video>` element is muted instantly.
3. A 100ms interval starts polling for the Skip button
   (`.ytp-skip-ad-button`, `.ytp-ad-skip-button-modern`) and clicks it
   the moment it becomes available.
4. When `.ad-showing` disappears, the interval is cleared and your original
   mute state is restored.
5. The observer re-attaches on every YouTube SPA navigation so it works
   across all videos without a page reload.

---

## Installation (personal / developer mode)

1. Put all files into a folder, e.g. `youtube-ad-muter/`
2. Open Chrome → go to `chrome://extensions`
3. Toggle **Developer mode** ON (top-right switch)
4. Click **Load unpacked** → select your `youtube-ad-muter/` folder
5. Open YouTube — it's live immediately and persists across Chrome restarts

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Extension won't load | Check `manifest.json` for syntax errors (paste into jsonlint.com) |
| Ads not muting | Open DevTools console on YouTube, look for `[Ad Muter]` logs |
| Skip button not clicking | YouTube may have changed the button class — see below |
| Mute not restored after ad | Rare race condition — reload the page |

### Checking / updating the skip button class

1. Start playing a video and wait for a skippable ad
2. Open DevTools (`F12`) → Elements tab
3. Find the Skip button in the DOM and copy its class name
4. Update the selector in `content.js` inside `trySkipAd()`:
   ```js
   const skipBtn = document.querySelector('.your-new-class-here');
   ```

---

## What changed in v1.1

- Added `trySkipAd()` — polls for the skip button every 100ms once an ad starts
- Supports multiple skip button class names YouTube has used:
  `.ytp-skip-ad-button`, `.ytp-ad-skip-button`, `.ytp-ad-skip-button-modern`
- Skip poller cleans up automatically when the ad ends
- Updated popup to reflect new features
