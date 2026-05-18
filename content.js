/**
 * YouTube Ad Muter & Skipper - content.js
 * - Mutes the video instantly when an ad starts
 * - Seeks to end of ad to skip it (no user gesture needed)
 * - Restores your original mute state when the ad ends
 */

let wasMutedBeforeAd = false;
let adActive = false;
let skipInterval = null;

function getVideoPlayer() {
  return document.querySelector('video.html5-main-video') || document.querySelector('video');
}

function isAdPlaying() {
  const player = document.querySelector('.html5-video-player');
  return player && player.classList.contains('ad-showing');
}

function trySkipAd() {
  const video = getVideoPlayer();

  // Approach 1: seek to just before the end of the ad (cleanest, no user gesture needed)
  if (video && video.duration && video.duration !== Infinity) {
    video.currentTime = video.duration - 1;
    console.log('[Ad Muter] Seeked to end of ad');
    return;
  }

  // Approach 2: try clicking skip button as fallback
  const skipBtn = document.querySelector(
    '.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytSpecButtonShapeNextHost'
  );
  if (skipBtn) {
    skipBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    skipBtn.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true }));
    skipBtn.dispatchEvent(new MouseEvent('click',     { bubbles: true }));
    console.log('[Ad Muter] Skip button clicked');
  }
}

function startSkipPoller() {
  if (skipInterval) return;
  skipInterval = setInterval(() => {
    if (!isAdPlaying()) {
      stopSkipPoller();
      return;
    }
    trySkipAd();
  }, 100); // poll every 100ms for fast response
}

function stopSkipPoller() {
  if (skipInterval) {
    clearInterval(skipInterval);
    skipInterval = null;
  }
}

function handleAdState() {
  const video = getVideoPlayer();
  if (!video) return;

  const nowAd = isAdPlaying();

  if (nowAd && !adActive) {
    // Ad just started — mute immediately and start skip poller
    adActive = true;
    wasMutedBeforeAd = video.muted;
    video.muted = true;
    console.log('[Ad Muter] Ad started → muted, polling for skip');
    startSkipPoller();

  } else if (!nowAd && adActive) {
    // Ad just ended — restore mute state and stop polling
    adActive = false;
    stopSkipPoller();
    video.muted = wasMutedBeforeAd;
    console.log('[Ad Muter] Ad ended → restored mute:', wasMutedBeforeAd);
  }
}

// Watch for class changes on the player element
const observer = new MutationObserver(() => {
  handleAdState();
});

function attachObserver() {
  const player = document.querySelector('.html5-video-player');
  if (player) {
    observer.observe(player, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false,
    });
    handleAdState();
    return true;
  }
  return false;
}

// YouTube is a SPA — poll until the player appears then attach
function waitForPlayer() {
  if (!attachObserver()) {
    const retryObserver = new MutationObserver(() => {
      if (attachObserver()) {
        retryObserver.disconnect();
      }
    });
    retryObserver.observe(document.body, { childList: true, subtree: true });
  }
}

// Re-attach on every YouTube SPA navigation
document.addEventListener('yt-navigate-finish', () => {
  observer.disconnect();
  stopSkipPoller();
  adActive = false;
  waitForPlayer();
});

waitForPlayer();