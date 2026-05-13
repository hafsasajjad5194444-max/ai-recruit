// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// ===================================
// Global Variables
// ===================================
let currentJobsDisplayed = 9;
const jobsPerPage = 9;
let filteredJobs = [...jobsData];
let bookmarkedJobs = JSON.parse(localStorage.getItem('bookmarkedJobs')) || [];

function formatFilterLabel(value) {
    return value
        .split(/[-_\s]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

const chatState = {
    stage: 'location',
    location: null,
    category: null,
    type: null
};

function getUniqueLocations() {
    return [...new Set(jobsData.map(job => job.location.replace(/,.*$/, '').trim()))].sort();
}

function getUniqueCategories() {
    return [...new Set(jobsData.map(job => job.category))].sort();
}

function getUniqueTypes() {
    return [...new Set(jobsData.map(job => job.type))].sort();
}

// Populate the select filter controls (if present) with values from jobsData
function populateFilterOptions() {
    const locationSelect = document.getElementById('locationFilter');
    const categorySelect = document.getElementById('categoryFilter');
    const typeSelect = document.getElementById('typeFilter');

    if (locationSelect) {
        const locations = getUniqueLocations();
        locationSelect.innerHTML = '<option value="all">All Locations</option>' + locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
    }

    if (categorySelect) {
        const categories = getUniqueCategories();
        categorySelect.innerHTML = '<option value="all">All Categories</option>' + categories.map(cat => `<option value="${cat}">${formatFilterLabel(cat)}</option>`).join('');
    }

    if (typeSelect) {
        const types = getUniqueTypes();
        typeSelect.innerHTML = '<option value="all">All Types</option>' + types.map(t => `<option value="${t}">${formatFilterLabel(t)}</option>`).join('');
    }

    // Wire change events
    [locationSelect, categorySelect, typeSelect].forEach(el => {
        if (!el) return;
        el.addEventListener('change', () => {
            applyFiltersFromControls();
        });
    });

    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (locationSelect) locationSelect.value = 'all';
            if (categorySelect) categorySelect.value = 'all';
            if (typeSelect) typeSelect.value = 'all';
            applyFiltersFromControls();
        });
    }
}

function applyFiltersFromControls() {
    const locationSelect = document.getElementById('locationFilter');
    const categorySelect = document.getElementById('categoryFilter');
    const typeSelect = document.getElementById('typeFilter');

    const locationValue = locationSelect && locationSelect.value !== 'all' ? locationSelect.value.toLowerCase() : '';
    const categoryValue = categorySelect && categorySelect.value !== 'all' ? categorySelect.value.toLowerCase() : '';
    const typeValue = typeSelect && typeSelect.value !== 'all' ? typeSelect.value.toLowerCase() : '';

    filteredJobs = jobsData.filter(job => {
        const jobLocation = job.location.replace(/,.*$/, '').trim().toLowerCase();
        const matchesLocation = !locationValue || jobLocation.includes(locationValue);
        const matchesCategory = !categoryValue || job.category.toLowerCase().includes(categoryValue);
        const matchesType = !typeValue || job.type.toLowerCase().includes(typeValue);
        return matchesLocation && matchesCategory && matchesType;
    });

    currentJobsDisplayed = jobsPerPage;
    renderJobs(filteredJobs, currentJobsDisplayed);
}

function startChatBot() {
    chatState.stage = 'location';
    chatState.location = null;
    chatState.category = null;
    chatState.type = null;
    const messages = document.getElementById('chatMessages');
    const options = document.getElementById('chatOptions');
    if (!messages || !options) return;
    messages.innerHTML = '';
    options.innerHTML = '';
    addChatMessage('Hello! I am your Job Finder Bot. Let me ask a few questions to recommend the best jobs for you.', 'bot');
    askNextQuestion();
}

function addChatMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;
    const message = document.createElement('div');
    message.className = `chat-message ${sender}`;
    message.innerHTML = `<p>${text}</p>`;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

function askNextQuestion() {
    const options = document.getElementById('chatOptions');
    if (!options) return;

    options.innerHTML = '';

    if (chatState.stage === 'location') {
        addChatMessage('Where would you like to work? Choose a location from the options below.', 'bot');
        const locations = getUniqueLocations();
        locations.forEach(location => {
            addChatOption(location);
        });
        addChatOption('Remote');
    } else if (chatState.stage === 'category') {
        addChatMessage('Which job category do you prefer?', 'bot');
        getUniqueCategories().forEach(category => addChatOption(formatFilterLabel(category)));
    } else if (chatState.stage === 'type') {
        addChatMessage('What type of employment are you looking for?', 'bot');
        ['Full Time', 'Part Time', 'Contract', 'Internship'].forEach(type => addChatOption(type));
    } else {
        addChatMessage('Thanks! Here are the best matching jobs for you.', 'bot');
        applyChatFilters();
        addChatOption('Start Over', 'reset');
    }
}

function addChatOption(label, action = 'select') {
    const options = document.getElementById('chatOptions');
    if (!options) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chat-button';
    button.textContent = label;
    button.onclick = () => {
        if (action === 'reset') {
            startChatBot();
            filteredJobs = [...jobsData];
            renderJobs(filteredJobs, currentJobsDisplayed);
        } else {
            selectChatOption(label);
        }
    };
    options.appendChild(button);
}

function selectChatOption(value) {
    addChatMessage(value, 'user');

    if (chatState.stage === 'location') {
        chatState.location = value;
        chatState.stage = 'category';
        askNextQuestion();
    } else if (chatState.stage === 'category') {
        chatState.category = value.toLowerCase().replace(/\s+/g, '-');
        chatState.stage = 'type';
        askNextQuestion();
    } else if (chatState.stage === 'type') {
        chatState.type = value.toLowerCase().replace(/\s+/g, '-');
        chatState.stage = 'done';
        askNextQuestion();
    }
}

function applyChatFilters() {
    filteredJobs = jobsData.filter(job => {
        const locationMatch = chatState.location === 'Remote'
            ? job.remote
            : job.location.toLowerCase().includes(chatState.location.toLowerCase());
        const categoryMatch = chatState.category ? job.category.toLowerCase() === chatState.category : true;
        const typeMatch = chatState.type ? job.type.toLowerCase() === chatState.type : true;
        return locationMatch && categoryMatch && typeMatch;
    });

    if (filteredJobs.length === 0) {
        addChatMessage('I could not find matching jobs for that combination. Please try again.', 'bot');
        addChatOption('Start Over', 'reset');
    }

    currentJobsDisplayed = jobsPerPage;
    renderJobs(filteredJobs, currentJobsDisplayed);
}

// ===================================
// Header Scroll Effect
// ===================================
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        backToTop.classList.add('visible');
    } else {
        header.classList.remove('scrolled');
        backToTop.classList.remove('visible');
    }
});

// ===================================
// Mobile Navigation Toggle
// ===================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===================================
// Smooth Scrolling for Navigation
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// Active Navigation Link
// ===================================
const sections = document.querySelectorAll('section[id]');

function setActiveNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', setActiveNavLink);

// ===================================
// Back to Top Button
// ===================================
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===================================
// Hero Stats Counter Animation
// ===================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = Math.floor(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Trigger counter animation when hero section is in view
const observerOptions = {
    threshold: 0.5
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-number').forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateCounter(stat, target);
            });
            counterObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const heroSection = document.querySelector('.hero');
if (heroSection) {
    counterObserver.observe(heroSection);
}

// ===================================
// Background Audio Control
// ===================================

const audioToggle = document.getElementById('audioToggle');
const bgAudio = document.getElementById('bgAudio');
const shutterAudio = document.getElementById('shutterAudio');
const clickAudio = document.getElementById('clickAudio');
let isAudioPlaying = false;

// Auto-play background music when page loads
window.addEventListener('DOMContentLoaded', () => {
    if (bgAudio) {
        bgAudio.volume = 0.5;
        bgAudio.play().then(() => {
            isAudioPlaying = true;
            audioToggle.classList.remove('muted');
            audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        }).catch(() => {
            isAudioPlaying = false;
            audioToggle.classList.add('muted');
            audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        });
    }
});

if (audioToggle && bgAudio) {
    audioToggle.addEventListener('click', () => {
        // Always play click sound
        if (clickAudio) {
            clickAudio.currentTime = 0;
            clickAudio.play().catch(() => {});
        }
        if (!bgAudio.paused) {
            bgAudio.pause();
            isAudioPlaying = false;
            audioToggle.classList.add('muted');
            audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            bgAudio.play().then(() => {
                isAudioPlaying = true;
                audioToggle.classList.remove('muted');
                audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            }).catch(() => {
                isAudioPlaying = false;
                audioToggle.classList.add('muted');
                audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            });
        }
    });
}

// Play shutter sound on tab change
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (shutterAudio) {
            shutterAudio.currentTime = 0;
            shutterAudio.play().catch(() => {});
        }
    });
});

// Play click sound on clickable elements
function addClickSoundToElements(selector) {
    document.querySelectorAll(selector).forEach(el => {
        // Prevent double sound on audioToggle
        if (el === audioToggle) return;
        el.addEventListener('click', () => {
            if (clickAudio) {
                clickAudio.currentTime = 0;
                clickAudio.play().catch(() => {});
            }
        });
    });
}

addClickSoundToElements('button, a.btn, .feature-card, .job-card, .testimonial-card, .about-list li, .filter-select');

// ===================================
// Job Listings Functions
// ===================================
function createJobCard(job) {
    const isBookmarked = bookmarkedJobs.includes(job.id);
    return `
        <div class="job-card" data-category="${job.category}" data-location="${job.remote ? 'remote' : job.location.toLowerCase().replace(/,.*/, '').replace(/\s/g, '-')}" data-type="${job.type}">
            <div class="job-header">
                <div class="job-company-logo">${job.logo}</div>
                <button class="job-bookmark ${isBookmarked ? 'active' : ''}" data-job-id="${job.id}">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
            <h3 class="job-title">${job.title}</h3>
            <div class="job-company">
                <i class="fas fa-building"></i>
                ${job.company}
            </div>
            <div class="job-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                <span><i class="fas fa-clock"></i> ${job.type.replace('-', ' ')}</span>
                <span><i class="fas fa-calendar"></i> ${job.posted}</span>
            </div>
            <p class="job-description">${job.description}</p>
            <div class="job-tags">
                ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
            </div>
            <div class="job-footer">
                <div class="job-salary">${job.salary}</div>
                <button class="job-apply-btn" onclick="applyToJob(${job.id})">Apply Now</button>
            </div>
        </div>
    `;
}

function renderJobs(jobs = filteredJobs, limit = currentJobsDisplayed) {
    const jobsGrid = document.getElementById('jobsGrid');
    if (!jobsGrid) return;

    const jobsToShow = jobs.slice(0, limit);
    if (jobsToShow.length === 0) {
        jobsGrid.innerHTML = '<div class="no-jobs-message">No jobs found for the selected filters.</div>';
    } else {
        jobsGrid.innerHTML = jobsToShow.map(job => createJobCard(job)).join('');
    }

    // Add bookmark event listeners
    document.querySelectorAll('.job-bookmark').forEach(btn => {
        btn.addEventListener('click', toggleBookmark);
    });

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMoreJobs');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = jobs.length > limit ? 'inline-flex' : 'none';
    }
}

function toggleBookmark(e) {
    const jobId = parseInt(e.currentTarget.getAttribute('data-job-id'));
    const index = bookmarkedJobs.indexOf(jobId);

    if (index > -1) {
        bookmarkedJobs.splice(index, 1);
        e.currentTarget.classList.remove('active');
    } else {
        bookmarkedJobs.push(jobId);
        e.currentTarget.classList.add('active');
    }

    localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarkedJobs));
}

function applyToJob(jobId) {
    const job = jobsData.find(j => j.id === jobId);
    if (job) {
        alert('⚠️ Backend Integration Required\n\nJob application requires backend functionality.\n\nPlease connect the backend API to enable:\n• Resume submission\n• Application tracking\n• Email notifications\n• Database storage\n\nContact the backend developer to complete integration.');
    }
}



// Load more jobs
const loadMoreBtn = document.getElementById('loadMoreJobs');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        currentJobsDisplayed += jobsPerPage;
        renderJobs(filteredJobs, currentJobsDisplayed);
    });
}

// ===================================
// Initialize Jobs on Page Load
// ===================================
function initializeJobPage() {
    filteredJobs = [...jobsData];
    // Populate filter controls and apply initial filters so selects are usable
    if (typeof populateFilterOptions === 'function') {
        populateFilterOptions();
    }

    applyFiltersFromControls();
    renderJobs(filteredJobs, currentJobsDisplayed);
    startChatBot();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeJobPage);
} else {
    initializeJobPage();
}

// ===================================
// Form Validation (for upload page)
// ===================================
function validateResumeUpload(form) {
    const fileInput = form.querySelector('input[type="file"]');
    const email = form.querySelector('input[type="email"]');
    const name = form.querySelector('input[name="name"]');

    let isValid = true;
    let errors = [];

    if (!name || name.value.trim() === '') {
        errors.push('Please enter your name');
        isValid = false;
    }

    if (!email || !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.push('Please enter a valid email address');
        isValid = false;
    }

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        errors.push('Please select a resume file');
        isValid = false;
    } else {
        const file = fileInput.files[0];
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            errors.push('Please upload a PDF or Word document');
            isValid = false;
        }

        if (file.size > maxSize) {
            errors.push('File size must be less than 5MB');
            isValid = false;
        }
    }

    if (!isValid) {
        alert(errors.join('\n'));
    }

    return isValid;
}

// ===================================
// Video Controls
// ===================================
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
    // Ensure video plays on mobile
    heroVideo.addEventListener('loadeddata', () => {
        heroVideo.play().catch(e => console.log('Video autoplay prevented:', e));
    });
}

// ===================================
// Lazy Loading for Images
// ===================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================================
// Floating Image Animation
// ===================================
const floatingImages = document.querySelectorAll('.floating-image');
floatingImages.forEach(img => {
    img.style.animation = 'float 6s ease-in-out infinite';
});

// ===================================
// Search Functionality (for future enhancement)
// ===================================
function searchJobs(query) {
    if (!query || query.trim() === '') {
        filteredJobs = [...jobsData];
    } else {
        const searchTerm = query.toLowerCase();
        filteredJobs = jobsData.filter(job => {
            return job.title.toLowerCase().includes(searchTerm) ||
                   job.company.toLowerCase().includes(searchTerm) ||
                   job.description.toLowerCase().includes(searchTerm) ||
                   job.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        });
    }
    currentJobsDisplayed = jobsPerPage;
    renderJobs(filteredJobs, currentJobsDisplayed);
}

// ===================================
// Console Welcome Message
// ===================================
console.log('%c👋 Welcome to AIRecruit!', 'color: #6366f1; font-size: 24px; font-weight: bold;');
console.log('%cWe are revolutionizing recruitment with AI', 'color: #10b981; font-size: 14px;');

// ===================================
// Performance Monitoring
// ===================================
window.addEventListener('load', () => {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page loaded in ${pageLoadTime}ms`);
    }
});
