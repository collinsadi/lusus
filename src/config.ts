/**
 * App download links.
 * Leave a value as empty string to hide that button.
 * If android is empty, the Android button will link to the APK at ANDROID_APK_PATH (if set).
 */
export const STORE_LINKS = {
  ios: 'https://apps.apple.com/ng/app/lusus-reverse-memory/id6759148970',       // e.g. 'https://apps.apple.com/app/lusus/id123456789' or a TestFlight link
  android: '',   // e.g. 'https://play.google.com/store/apps/details?id=com.lusus'
};

/** Path to the APK file in public/ (e.g. /app/lusus.apk). Used when no Play Store link is set. */
export const ANDROID_APK_PATH = 'https://drive.google.com/uc?export=download&id=1wPiWhPtcuKsMzqGyjuY-3jlwDRzJzImS';
