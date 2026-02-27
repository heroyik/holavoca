/**
 * Browser Utilities for handling In-App Browsers (IAB)
 */

export const isUnsupportedIAB = (): boolean => {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent.toLowerCase();

    // Check for common in-app browsers that block or have issues with Google OAuth popup
    const isKakaotalk = ua.includes('kakaotalk');
    const isInstagram = ua.includes('instagram');
    const isFacebook = ua.includes('fbav') || ua.includes('fb_iab');
    const isLine = ua.includes('line');

    return isKakaotalk || isInstagram || isFacebook || isLine;
};

export const redirectToExternalBrowser = () => {
    if (typeof window === 'undefined') return;

    const currentUrl = window.location.href;
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    if (isAndroid) {
        // Android Intent scheme to force Chrome
        // intent://<url>#Intent;scheme=https;package=com.android.chrome;end
        const noProtocolUrl = currentUrl.replace(/^https?:\/\//, '');
        const intentUrl = `intent://${noProtocolUrl}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
    } else if (isIOS) {
        if (ua.includes('kakaotalk')) {
            // iOS KakaoTalk specific external browser scheme
            const targetUrl = `kakaotalk://web/openExternal?url=${encodeURIComponent(currentUrl)}`;
            window.location.href = targetUrl;
        } else {
            // General iOS IAB (Instagram/Facebook)
            // Note: Apple doesn't allow forcing Safari from these apps easily.
            // We'll show an alert or just let the user know they should open in Safari.
            alert("Google Login is not supported in this in-app browser. Please tap the '...' menu and select 'Open in Safari'.");
        }
    }
};
