# Flutter Mobile App Index

This file is a quick entry point for the Flutter mobile app code in this workspace.

## Main Flutter Files

- `flutter files/lib/main.dart` - Main Flutter app entry and mobile WebView app logic
- `flutter files/pubspec.yaml` - Flutter dependencies and asset declarations

## Web App Assets Used by Flutter

- `flutter files/assets/www/index.html` - Main website page loaded in the app
- `flutter files/assets/www/upload.html` - Resume upload page loaded in the app
- `flutter files/assets/www/css/styles.css` - Main app/site styling
- `flutter files/assets/www/css/upload.css` - Upload page styling
- `flutter files/assets/www/js/main.js` - Core website behavior and job filter logic for the app
- `flutter files/assets/www/js/jobs.js` - Job page script for the website/app
- `flutter files/assets/www/js/jobs-data.js` - Job listings data used by the app
- `flutter files/assets/www/js/upload.js` - Upload page script

## Build & Output

- For Android: `flutter files/build/app/outputs/flutter-apk/app-release.apk` - Built Android APK
- For iOS: `flutter files/build/ios/iphoneos/Runner.app` - Built iOS app

## Notes

- The app uses local file loading to load `assets/www/*` files inside `webview_flutter`.
- If you want to make UI or filter changes, edit the files under `flutter files/assets/www/` and then rebuild the Flutter app.
- If you want to change app behavior or build settings, edit `flutter files/lib/main.dart` and `flutter files/pubspec.yaml`.

## Useful Commands

From `flutter files/` folder:

- `flutter clean`
- `flutter pub get`
- `flutter build apk` (for Android)
- `flutter build ios` (for iOS)
- `flutter run` (to run on connected device/emulator)

## Recommended Next Steps

1. Open `FLUTTER_INDEX.md` from the workspace root.
2. Edit the files in `flutter files/assets/www/` for the website UI.
3. Rebuild using `flutter build apk` or `flutter build ios` after making changes.
