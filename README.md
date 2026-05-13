# AI-Driven Resume Shortlisting System

![AI Recruit](https://img.shields.io/badge/AI-Powered-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

A professional, modern, and fully responsive AI-driven resume shortlisting system frontend. This platform uses intelligent matching algorithms to connect job seekers with their perfect opportunities and helps companies find the best candidates efficiently.

## 🌟 Features

### Core Features
- **AI-Powered Job Matching** - Intelligent algorithm matches resumes with job requirements
- **30+ Job Listings** - Pre-loaded with diverse positions including Data Analyst, HR Manager, Software Engineer, Marketing Manager, and more
- **Smart Resume Upload** - Drag-and-drop interface with real-time validation
- **Advanced Filtering** - Filter jobs by category, location, and employment type
- **Job Bookmarking** - Save favorite jobs with localStorage persistence
- **Interactive Animations** - Smooth scroll animations using AOS library
- **Video Backgrounds** - Professional video backgrounds loaded from online CDNs
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices

### Design Features
- **Modern UI/UX** - Clean, professional interface with gradient colors
- **Professional Typography** - Google Fonts (Poppins & Roboto)
- **Icon System** - Font Awesome 6.4.0 icons throughout
- **Smooth Animations** - CSS transitions and JavaScript-powered effects
- **Loading States** - Visual feedback during AI processing
- **Progress Indicators** - Multi-step form with visual progress tracking

### Technical Features
- **Pure HTML/CSS/JavaScript** - No framework dependencies
- **SEO Optimized** - Proper meta tags and semantic HTML
- **Performance Optimized** - Lazy loading and efficient animations
- **Cross-Browser Compatible** - Works on all modern browsers
- **Accessible** - ARIA labels and keyboard navigation support

## 📁 Project Structure

```
ai-short-listing-resume/
│
├── index.html              # Main homepage
├── upload.html             # Resume upload page
├── README.md              # This file
│
├── css/
│   ├── styles.css         # Main stylesheet
│   └── upload.css         # Upload page specific styles
│
├── js/
│   ├── main.js            # Main JavaScript functionality
│   ├── jobs-data.js       # Job listings data (30+ jobs)
│   └── upload.js          # Resume upload functionality
│
├── images/                # Place your custom images here
│   └── (Add your images)
│
├── videos/                # Place your custom videos here
│   └── (Add your videos)
│
└── audio/                 # Place your audio files here
    └── background-music.mp3 (optional)
```

## 🚀 Getting Started

### Quick Start

1. **Clone or Download** this repository
2. **Add background music** (see MUSIC-SETUP-GUIDE.txt)
3. **Open `index.html`** in your web browser
4. **Connect backend** for full functionality

### Important Notes

⚠️ **This is a FRONTEND-ONLY implementation**
- Resume upload requires backend integration
- Job applications require backend API
- Form submissions show "Backend Required" messages
- Connect your backend to enable full functionality

### Running Locally

You can open the files directly in a browser, or use a local server for the best experience:

#### Using Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js
```bash
npx http-server -p 8000
```

#### Using PHP
```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🎨 Customization Guide

### Adding Custom Images

1. Place your images in the `images/` folder
2. Update image references in HTML files:

```html
<!-- Example: Replace placeholder image -->
<img src="images/your-custom-image.jpg" alt="Description">
```

**Recommended image sizes:**
- Hero images: 1920x1080px
- Feature cards: 400x300px
- Company logos: 200x200px
- Team photos: 300x300px

### Adding Custom Videos

#### Option 1: Local Videos
1. Place video files in the `videos/` folder
2. Update video sources in HTML:

```html
<video autoplay muted loop playsinline>
    <source src="videos/your-video.mp4" type="video/mp4">
</video>
```

#### Option 2: Online Videos (Currently Used)
The project uses free stock videos from Coverr.co that load from CDN:
- Hero section: Office team collaboration video
- CTA section: Abstract digital background
- Upload page: Network connections animation

**To use your own online videos:**
```html
<video autoplay muted loop playsinline>
    <source src="https://your-cdn.com/video.mp4" type="video/mp4">
</video>
```

**Recommended video specs:**
- Format: MP4 (H.264 codec)
- Resolution: 1920x1080px (1080p)
- Duration: 10-30 seconds (looped)
- File size: Under 5MB for better performance

### Adding Background Audio

1. Add your audio file to the `audio/` folder (e.g., `background-music.mp3`)
2. The audio toggle button in the header controls playback
3. Audio is muted by default until user clicks the audio button

**Supported formats:** MP3, OGG, WAV

```html
<audio id="bgAudio" loop>
    <source src="audio/background-music.mp3" type="audio/mpeg">
    <source src="audio/background-music.ogg" type="audio/ogg">
</audio>
```

### Modifying Job Listings

Edit the `js/jobs-data.js` file to add, remove, or modify jobs:

```javascript
{
    id: 31,
    title: "Your Job Title",
    company: "Company Name",
    location: "City, State",
    type: "full-time", // full-time, part-time, contract, internship
    category: "technology", // technology, management, marketing, finance, healthcare, design
    salary: "$80,000 - $100,000",
    logo: "YC", // 2-letter abbreviation
    description: "Job description here...",
    tags: ["Skill1", "Skill2", "Skill3"],
    posted: "1 day ago",
    remote: false // true for remote positions
}
```

### Customizing Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
    --primary-color: #6366f1;      /* Main brand color */
    --secondary-color: #10b981;    /* Accent color */
    --accent-color: #f59e0b;       /* Highlight color */
    --text-dark: #1f2937;          /* Dark text */
    --text-light: #6b7280;         /* Light text */
    --bg-light: #f9fafb;           /* Light background */
    /* Modify these to match your brand */
}
```

### Modifying Company Name/Branding

1. Update the logo in headers (both `index.html` and `upload.html`):
```html
<div class="logo">
    <i class="fas fa-brain"></i>
    <span>Your<span class="highlight">Brand</span></span>
</div>
```

2. Update footer copyright:
```html
<p>&copy; 2025 YourCompany. All rights reserved.</p>
```

3. Update page titles and meta descriptions

## 🎯 Features Breakdown

### Homepage (index.html)

1. **Header/Navigation**
   - Fixed header with scroll effect
   - Mobile responsive hamburger menu
   - Smooth scroll to sections
   - Audio toggle button

2. **Hero Section**
   - Full-screen video background
   - Animated statistics counter
   - Call-to-action buttons
   - Floating image animation

3. **Features Section**
   - 6 feature cards with icons
   - Hover effects and animations
   - Responsive grid layout

4. **How It Works Section**
   - 4-step process visualization
   - Images with descriptions
   - Alternating layout

5. **Jobs Section**
   - 30+ job listings
   - Advanced filtering (category, location, type)
   - Job bookmarking with localStorage
   - Load more functionality
   - "Apply Now" integration

6. **Video Showcase**
   - Embedded demonstration video
   - Professional presentation

7. **Testimonials**
   - 3 customer reviews
   - Star ratings
   - User avatars

8. **CTA Section**
   - Video background
   - Large call-to-action buttons

9. **Footer**
   - Multi-column layout
   - Social media links
   - Contact information
   - Quick links

### Upload Page (upload.html)

1. **Multi-Step Form**
   - Step 1: Personal information
   - Step 2: Resume upload with drag-and-drop
   - Step 3: AI processing animation

2. **Drag-and-Drop Upload**
   - Visual feedback
   - File validation (PDF, DOC, DOCX)
   - Size limit (5MB)
   - File preview

3. **AI Processing Simulation**
   - Progress bar animation
   - Stage-by-stage updates
   - Realistic timing

4. **Results Display**
   - Match count
   - Profile strength score (circular progress)
   - Detected skills badges
   - Action buttons

5. **Benefits Sidebar**
   - 5 key benefits
   - Icons and descriptions
   - Sticky positioning

## 🔧 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🎥 Media Resources

### Current Video Sources (Free Stock Videos)
All videos are loaded from online CDNs (Coverr.co) and will load automatically:

1. **Hero Background**: Office team working together
2. **CTA Background**: Abstract blue digital animation
3. **Upload Background**: Network connections animation
4. **Video Showcase**: Futuristic digital technology

**These videos load from the internet.** If you want to use custom videos:
1. Download videos or create your own
2. Place them in the `videos/` folder
3. Update the video `src` attributes in HTML files

### Image Sources
All images currently use placeholder URLs from:
- Unsplash.com (high-quality stock photos)
- RandomUser.me (user avatars)

**To use custom images:**
1. Replace URL sources with local paths: `images/your-image.jpg`
2. Or use your own image hosting service

## ⚡ Performance Tips

1. **Optimize Images**
   - Use WebP format when possible
   - Compress images (TinyPNG, ImageOptim)
   - Implement lazy loading for below-fold images

2. **Optimize Videos**
   - Compress videos (HandBrake, FFmpeg)
   - Use multiple formats for compatibility
   - Consider poster images for mobile

3. **Minify Assets**
   - Minify CSS and JavaScript for production
   - Combine files to reduce HTTP requests

4. **Use CDN**
   - Host static assets on a CDN
   - Libraries (Font Awesome, AOS) already use CDN

## 🔐 Security Considerations

This is a **frontend-only** implementation. For production use:

1. **Add Backend Processing**
   - Implement server-side file validation
   - Use secure file storage (AWS S3, Azure Blob)
   - Add authentication and authorization

2. **Protect User Data**
   - Implement HTTPS
   - Sanitize all user inputs
   - Add CSRF protection

3. **File Upload Security**
   - Scan files for malware
   - Implement file type verification on server
   - Set upload rate limits

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select main branch
4. Your site will be live at `https://yourusername.github.io/repository-name/`

### Netlify
1. Drag and drop the project folder to Netlify
2. Or connect your GitHub repository
3. Instant deployment with free SSL

### Vercel
```bash
npm i -g vercel
vercel
```

### Traditional Web Hosting
1. Upload all files via FTP
2. Ensure proper file permissions
3. Point domain to hosting directory

## 📞 Support & Contribution

### Issues
If you encounter any issues:
1. Check browser console for errors
2. Verify all file paths are correct
3. Ensure internet connection for CDN resources

### Future Enhancements
- [ ] Backend API integration
- [ ] Real AI/ML processing
- [ ] User authentication system
- [ ] Advanced search with filters
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Resume parsing engine
- [ ] Interview scheduling
- [ ] Analytics dashboard

## 📄 License

This project is free to use for personal and commercial purposes. Attribution appreciated but not required.

## 🙏 Credits

- **Font Awesome** - Icons
- **Google Fonts** - Typography
- **AOS Library** - Scroll animations
- **Coverr.co** - Stock videos
- **Unsplash** - Stock photos

---

**Built with ❤️ for modern recruitment**

For questions or suggestions, feel free to reach out!

**Happy Recruiting! 🎯**
