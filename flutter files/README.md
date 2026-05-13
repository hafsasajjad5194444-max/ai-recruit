# AI Resume Shortlisting Flutter App

This folder contains a Flutter app version of the AI resume shortlisting website.

## Open the app in VS Code
1. Open VS Code.
2. Choose `File > Open Folder...` and select:
   `c:\Users\Talha\Desktop\ai short listing resume\flutter_app`
3. Open `lib\main.dart` to see the Dart app code.

## Run the app
1. Make sure Flutter is installed in your Documents folder.
2. If Flutter is not on PATH, use the full path to the executable.
3. Open a terminal in this folder:
   ```powershell
   cd "c:\Users\Talha\Desktop\ai short listing resume\flutter_app"
   "C:\Users\Talha\Documents\flutter 1\flutter\bin\flutter.bat" pub get
   "C:\Users\Talha\Documents\flutter 1\flutter\bin\flutter.bat" run
   ```

If you do not yet have Flutter platform folders, run this first:
```powershell
"C:\Users\Talha\Documents\flutter 1\flutter\bin\flutter.bat" create .
```

## What is included
- `lib/main.dart` — Flutter UI with home, jobs, and resume upload screens
- `pubspec.yaml` — Flutter project configuration

## Notes
- The app is a UI prototype and does not include backend resume processing.
- You can extend it later with file upload, AI matching, and real job data.
