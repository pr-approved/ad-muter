#Ad Muter & Skipper — Chrome Extension

Automatically mutes YT ads the instant they start, skips them by seeking
to the end of the ad video, and restores your original volume when the ad ends.

---

## Files

```
youtube-ad-muter/
├── manifest.json        ← extension config (Manifest V3)
├── content.js           ← core logic (injected into youtube.com)
├── popup.html           ← status popup when you click the toolbar icon
├── PROJECT_SUMMARY.html ← how it works + lessons learned
└── README.md            ← this file
```

---

## How it works

1. Chrome injects `content.js` into every youtube.com tab
2. A `MutationObserver` watches the video player for the `.ad-showing` class that YouTube adds the moment an ad starts
3. The `<video>` element is muted instantly
4. A 100ms interval starts polling to skip the ad
5. The ad is skipped by seeking `video.currentTime` to `video.duration - 1` — YouTube sees the ad is almost done and transitions out naturally
6. When `.ad-showing` disappears, the interval clears and your original mute state is restored
7. The observer re-attaches on every YouTube SPA navigation so it works across all videos

---

## Why seek instead of clicking the skip button?

Two approaches were tried and failed before landing on the seek solution:

- **Plain `.click()`** — YouTube's newer buttons ignore synthetic clicks entirely
- **Simulated mouse events** (mousedown → mouseup → click) — YouTube blocks these with a "Must be handling a user gesture" browser security policy

Seeking `video.currentTime = video.duration - 1` bypasses all of this — no button click needed, no user gesture required. Landing 1 second before the end keeps playback inside already-buffered territory, so there's no extra network request and no buffer stall.

---

## Installation (personal / developer mode)

1. Put all files into a folder, e.g. `youtube-ad-muter/`
2. Open Chrome → go to `chrome://extensions`
3. Toggle **Developer mode** ON (top-right switch)
4. Click **Load unpacked** → select your folder
5. Open YouTube — active immediately, persists across Chrome restarts

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Extension won't load | Check `manifest.json` for syntax errors |
| Ads not muting | Open DevTools console (`Cmd+Option+I` on Mac), look for `[Ad Muter]` logs |
| Ads not skipping | YouTube may have changed `.ad-showing` — right-click the player during an ad → Inspect, check the class name |
| Mute not restored after ad | Rare race condition — reload the page |

---

## GitHub

[github.com/pr-approved/repo-v1](https://github.com/pr-approved/repo-v1)

Built May 2026
