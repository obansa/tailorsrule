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

## Build with EAS

`eas.json` has three profiles: `development` (dev client APK / iOS simulator build), `preview` (installable APK for testers) and `production` (store build, version auto-incremented).

One-time setup (needs your Expo account, so run it on your computer):

```bash
npm install -g eas-cli      # or prefix commands with npx eas-cli@latest
eas login
eas init                    # links the project and writes the project ID into app.json
```

Add the Google client IDs as EAS environment variables so cloud builds can read them:

```bash
eas env:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value <web-client-id> --environment development --environment preview --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value <ios-client-id> --environment development --environment preview --environment production --visibility plaintext
```

Build:

```bash
npm run build:dev:android       # development build for testing (run with: npx expo start --dev-client)
npm run build:preview:android   # APK to share with testers
npm run build:prod:android      # .aab for Google Play
eas submit --platform android   # after a production build
```

For Google Sign-In on Android, add the SHA-1 of the EAS keystore (`eas credentials`) to the Android OAuth client in Google Cloud.
