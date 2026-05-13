# AI Resume Shortlisting Project Documentation

## 1. Project Goal
This document explains how the website was created, what files were used, why it was
converted into a Flutter desktop app, and how the app works.
It is written in easy words so your teacher can understand the project from start to
finish.

## 2. Website files at the start
At the beginning, the project was a website made in Visual Studio Code. The main files
were:
- `index.html` — the home page of the website.
- `upload.html` — the resume upload page.
- `css/styles.css` — the styles and design for the website.
- `js/main.js` — general JavaScript for animations, menu, and page behavior.
- `js/jobs.js` — job search and job card rendering logic.
- `js/jobs-data.js` — the list of all job data used in the app.
- `js/upload.js` — logic for the resume upload form and validation.
- `audio/` files — background music and sound effects for the website.

## 3. What the website did
The website included many features:
- A header with navigation links for Home, Jobs, Features, About, and Contact.
- A hero section with animated background, title, description, and buttons.
- Feature cards showing AI matching, instant screening, smart analytics, and bias-free hiring.
- A how-it-works section with four steps explaining upload, analysis, matching, and applying.
- A jobs section with filters for category, location, and type.
- A resume upload page with drag-and-drop file upload and validation.

## 4. Why I changed the website to Flutter
I changed it to Flutter for these reasons:
- The teacher asked for an app, not just a website.
- A Flutter app can run on Windows like a real desktop program.
- The project becomes stronger because it is now a software application, not only a web page.
- Flutter uses Dart, which is a language for building apps on many platforms.

## 5. Why I chose this Flutter app structure
This app structure was chosen because it keeps the website and the app separate, and it
uses the same ideas in a new form.
- The website stays in the original folder with HTML, CSS, JS, and audio.
- The Flutter app is in a new folder named `flutter files`.
- This separation makes it easy to show the website and the app separately.

## 6. How the Flutter app was created
These are the steps followed to make the app:
1. Installed Flutter SDK in Documents at `C:\Users\Talha\Documents\flutter 1\flutter`.
2. Created a new Flutter project inside `flutter files` using `flutter create .`.
3. Wrote the Dart code in `lib/main.dart` to build the app screens and logic.
4. Used Flutter widgets like `Scaffold`, `AppBar`, `TextField`, `Card`, `ListView`, and
`ElevatedButton`.
5. Kept the job list data inside the Dart file so the app can show jobs without website
JavaScript.

## 7. What changed from website to app
The website used HTML, CSS, and JavaScript. The app uses Dart and Flutter widgets.
Instead of HTML sections, the app has Flutter screens and layout widgets. Instead of CSS
styles, the app uses Flutter themes and container styling.
The app also uses Dart lists and data classes to show job cards, search, and filters.

## 8. What is inside the Flutter app
The app currently includes these screens and features:
- **Home screen**: title, description, buttons to browse jobs and upload resume, and summary cards.
- **Jobs screen**: search box, category filter, location filter, and a list of job cards.
- **Upload screen**: form fields for name, email, phone, desired role, and submit button.
- **Navigation**: buttons to move between screens in the app.

## 9. Why this app is good
- It is now a desktop program that can run on Windows.
- It looks like a real software application and not just a web page.
- Your teacher can open and run it using Flutter and show a working app.
- It is easier to present as a project because it has a separate app folder.

## 10. What is still the same
The app keeps the same main idea as the website: AI resume shortlisting and job matching.
It still has the same purpose: help candidates upload resumes and match them to jobs.

## 11. What is different now
- The app does not use HTML pages or CSS files for the main screens.
- The work is now done in Dart code, inside `lib/main.dart`.
- The app is a prototype, so some advanced backend features are not yet built.

## 12. How to open the Flutter app project
1. Open Visual Studio Code.
2. Choose `File > Open Folder...`.
3. Open the folder `c:\Users\Talha\Desktop\ai short listing resume\flutter files`.
4. Open `lib/main.dart` to see the Dart code.

## 13. How to run the app on Windows
1. Open a terminal or PowerShell in the `flutter files` folder.
2. Run: `"C:\Users\Talha\Documents\flutter 1\flutter\bin\flutter.bat" pub get`.
3. Then run: `"C:\Users\Talha\Documents\flutter 1\flutter\bin\flutter.bat" run -d windows`.

## 14. How to make a Windows app file
After Visual Studio Community is installed with Desktop development with C++:
Run: `"C:\Users\Talha\Documents\flutter 1\flutter\bin\flutter.bat" build windows`.
This creates a compiled Windows app in the `build\windows unner\Release` folder.

## 15. What the teacher will see
The teacher can see the app run on Windows and can also check the code in VS Code.
The teacher will also see that the website files are still there and the app has been
created separately.

## 16. Advantages of writing this document
- It explains the project clearly and helps the teacher understand your work.
- It shows the reason for changing the website into a Flutter app.
- It gives step-by-step details from the original site to the final app.

## 17. Final summary
This project started as a website made in HTML, CSS, and JavaScript. It was converted into
a Flutter desktop app so it can run on Windows. The app is now in the `flutter files`
folder. Keep the website files separate and use the Flutter commands to run the app. The
app is a better presentation for a project because it behaves like a software application.