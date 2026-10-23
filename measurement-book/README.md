# Tailor's Measurement Book

React Native (Expo) app for tailors to record customer measurements.

- Sign in with Google; data is stored on the phone and works offline.
- **Automatic backup** to the user's own Google Drive (private app data folder) after every change. If the phone is offline, the backup waits and uploads when the internet returns.
- **On sign-in**, the latest Drive backup is loaded. Signing in with a different Google account clears the previous account's local data first.
- Men's and ladies' sheets, each split into Top and Down. Fields are chosen in Settings (switch on/off, add your own).
- **Unit setting** (inches / centimetres): every record keeps the numbers as entered and is converted for display when you change the unit.
- Light, dark or system theme.

## Setup

```bash
npm install --legacy-peer-deps
cp .env.example .env     # then fill in the Google client IDs
```

### Google Cloud (one time)

1. Create a project in Google Cloud Console and enable the **Google Drive API**.
2. Configure the OAuth consent screen and add the scope `https://www.googleapis.com/auth/drive.appdata`.
3. Create OAuth client IDs: a **Web** client (put its ID in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`), an **Android** client (package `com.tailorsrule.measurementbook` plus your signing SHA-1), and an **iOS** client (bundle ID `com.tailorsrule.measurementbook`).
4. For iOS, set `iosUrlScheme` in `app.json` (the plugin entry for `@react-native-google-signin/google-signin`) to the reversed iOS client ID.

### Run

Google Sign-In uses native code, so **Expo Go cannot run this app**. Use a development build:

```bash
npx expo run:android      # or: npx expo run:ios, or an EAS development build
npx expo start --dev-client
```

## Checks

```bash
npm run typecheck
npm test            # unit conversion tests
npx expo lint
```

## Layout

- `src/app` – screens (Expo Router): login, customers, customer profile, measure, record, settings
- `src/lib` – store, units, Google Drive backup, auth, theme
- `src/components` – UI kit and icons
