// Device fingerprinting utility
export const getDeviceInfo = () => {
  const FINGERPRINT_STORAGE_KEY = 'device_fingerprint';
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;

  // Use a stable fingerprint across viewport changes and sessions
  let deviceFingerprint = null;
  try {
    deviceFingerprint = localStorage.getItem(FINGERPRINT_STORAGE_KEY);
  } catch (_) {}

  if (!deviceFingerprint) {
    // Only include stable attributes; exclude screen resolution and color depth
    const payload = { userAgent, platform, timezone, language };
    deviceFingerprint = btoa(JSON.stringify(payload));
    try {
      localStorage.setItem(FINGERPRINT_STORAGE_KEY, deviceFingerprint);
    } catch (_) {}
  }

  return {
    deviceFingerprint,
    deviceType: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent) ? 'mobile' : 'desktop',
    browser: getBrowserInfo(userAgent),
    platform,
  };
};

const getBrowserInfo = (userAgent) => {
  const browsers = {
    chrome: /chrome|chromium|crios/i,
    firefox: /firefox|fxios/i,
    safari: /safari/i,
    edge: /edge/i,
    opera: /opera|opr/i,
    ie: /msie|trident/i
  };

  for (const [browser, regex] of Object.entries(browsers)) {
    if (regex.test(userAgent)) {
      return browser;
    }
  }
  return 'unknown';
};