# AI Resume Shortlisting Project Documentation

## Author
- Hafssa

## 1. Project Purpose
This project started as a website and was later converted into a Flutter desktop app. The main reason is that the teacher wanted an app version, not only a website. The project now shows both the original website work and the final app work.

## 2. Why I chose this project
- I chose this project because it matches a real job application idea: AI resume shortlisting.
- It is useful for both candidates and recruiters.
- It also demonstrates my skills in web development and app development.
- I chose Flutter because it can create a desktop app that runs on Windows and it uses Dart, which is easy to write and maintain.

## 3. Website Development from Scratch
### 3.1 Tools used
- Visual Studio Code (VSC)
- HTML, CSS, JavaScript
- A folder structure with separate files for code, styles, and scripts

### 3.2 Files created for the website
- `index.html`: the main page of the website with hero section, features, and jobs.
- `upload.html`: a separate upload page where users can upload their resume.
- `css/styles.css`: all the design and layout for the website.
- `js/main.js`: code for the header, menu, animations, audio control, and page scrolling.
- `js/jobs.js`: code for showing jobs, filtering jobs, and applying for jobs.
- `js/jobs-data.js`: details of every job like title, company, location, salary, and tags.
- `js/upload.js`: resume upload validation, file preview, and form behavior.
- `audio/`: sound files used for background music and click effects.

### 3.3 What the website did
The original website included these sections:
- Header with menu links to different parts of the page.
- Hero section with title, description, buttons, and animated images.
- Features section showing AI matching, instant screening, smart analytics, bias-free hiring, and time saving.
- How It Works section showing steps: upload resume, AI analysis, get matched, and apply.
- Jobs section with category and location filters, a list of available job cards, and apply buttons.
- Upload page with a drag-and-drop resume upload area and form fields.

## 4. Why I changed it to Flutter
### 4.1 Teacher requirement
The teacher wanted an app form of the project. A website alone is not enough for an app assignment.

### 4.2 Why Flutter is a good choice
- Flutter can build apps from one codebase.
- It supports desktop applications on Windows.
- It uses Dart, which is easy to learn and work with.
- It allows the app to look professional and behave like a real program.

### 4.3 Why not other options
- I did not choose only HTML because the requirement was an app.
- I did not choose React Native or other mobile frameworks because Flutter can already support desktop and is popular.
- I did not choose plain Python or desktop-only frameworks because Flutter matches the same app idea and is easier to connect with the website concept.

## 5. How I created the Flutter app
### 5.1 Install Flutter SDK
- Installed Flutter SDK in the folder: `C:\Users\Talha\Documents\flutter 1\flutter`
- This folder contains the Flutter tools needed to build and run the app.

### 5.2 Create the Flutter project
- Created a new Flutter project in a new folder named `flutter files`.
- This keeps the Flutter app separate from the website files.
- Used the command `flutter create .` inside the `flutter files` folder.

### 5.3 App files and structure
- `flutter files/lib/main.dart`: the main Dart file with the app code.
- `flutter files/pubspec.yaml`: project settings and dependencies.
- `flutter files/windows/`: files that allow the app to run on Windows.
- `flutter files/android/`, `ios/`, `web/`: other platform folders created by Flutter.

## 6. What is in the Flutter app
### 6.1 Screens in the app
- Home screen: includes the app title, description, buttons, and summary cards.
- Jobs screen: allows the user to search jobs and filter by category and location.
- Upload screen: allows the user to enter name, email, phone, and desired role.

### 6.2 Features in the app
- App navigation between screens.
- Search and filter options for jobs.
- Job cards that display job title, company, location, salary, and apply button.
- A simple upload form to show how a user can submit resume details.

## 7. What changed from website to app
### 7.1 Website vs app
- Website used HTML, CSS, and JavaScript.
- App uses Dart and Flutter widgets.
- Website design was based on web pages and styles.
- App design is based on Flutter layout and Themes.

### 7.2 Same concept, different technology
- Both the website and app follow the same idea of AI resume shortlisting.
- The app keeps the job data and matching idea from the website.
- The app shows the same features in a desktop application form.

## 8. How to open the Flutter app
### 8.1 In Visual Studio Code
- Open Visual Studio Code.
- Choose `File > Open Folder...`.
- Select the folder: `C:\Users\Talha\Desktop\ai short listing resume\flutter files`.
- Open the file `lib/main.dart` to see the Dart code.

## 9. How to run the Flutter app
### 9.1 Use PowerShell
- Open PowerShell in the `flutter files` folder.
- Run: `"C:\Users\Talha\Documents\flutter 1\flutter\bin\flutter.bat" pub get`
- Then run: `"C:\Users\Talha\Documents\flutter 1\flutter\bin\flutter.bat" run -d windows`

### 9.2 What this does
- `pub get` downloads project packages.
- `flutter run -d windows` starts the app on Windows.

## 10. How to make a Windows app file
### 10.1 Required tool
- Install Visual Studio Community.
- In Visual Studio Installer, choose `Desktop development with C++`.

### 10.2 Build command
- Run: `"C:\Users\Talha\Documents\flutter 1\flutter\bin\flutter.bat" build windows`
- The compiled app file will appear in the `build/windows/runner/Release` folder.

## 11. Advantages of this project
- It shows a website and a desktop app version.
- It meets the teacher's requirement for an app.
- It uses modern app technology (Flutter and Dart).
- It keeps the project files organized.
- It is easy to explain in a presentation.

## 12. Final summary
Hafssa built this project from scratch. First, she created a website using Visual Studio Code, HTML, CSS, and JavaScript. Then she converted the project into a Flutter desktop app using Dart. The app is now in the `flutter files` folder and can run on Windows. This completed project proves her ability to work with both web development and app development.
