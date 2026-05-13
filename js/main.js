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
    jobsGrid.innerHTML = jobsToShow.map(job => createJobCard(job)).join('');

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

// ===================================
// Job Filtering
// ===================================
function normalizeCategoryOrType(value) {
    return value.toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function normalizeLocation(value) {
    return value.toString().replace(/,.*$/, '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function populateFilterSelects() {
    const categorySelect = document.getElementById('categoryFilter');
    const locationSelect = document.getElementById('locationFilter');
    const typeSelect = document.getElementById('typeFilter');

    if (!categorySelect || !locationSelect || !typeSelect) return;

    const categories = [...new Set(jobsData.map(job => normalizeCategoryOrType(job.category)))].sort();
    const locations = [...new Set(jobsData.map(job => normalizeLocation(job.location)))].sort();
    const types = [...new Set(jobsData.map(job => normalizeCategoryOrType(job.type)))].sort();

    if (!locations.includes('remote')) {
        locations.unshift('remote');
    }

    categorySelect.innerHTML = `<option value="all">All Categories</option>` +
        categories.map(category => `<option value="${category}">${category.replace(/-/g, ' ')}</option>`).join('');

    locationSelect.innerHTML = `<option value="all">All Locations</option>` +
        locations.map(location => `<option value="${location}">${location.replace(/-/g, ' ')}</option>`).join('');

    typeSelect.innerHTML = `<option value="all">All Types</option>` +
        types.map(type => `<option value="${type}">${type.replace(/-/g, ' ')}</option>`).join('');
}

function setupFilterListeners() {
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const typeFilter = document.getElementById('typeFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');

    if (categoryFilter) categoryFilter.addEventListener('change', filterJobs);
    if (locationFilter) locationFilter.addEventListener('change', filterJobs);
    if (typeFilter) typeFilter.addEventListener('change', filterJobs);

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (categoryFilter) categoryFilter.value = 'all';
            if (locationFilter) locationFilter.value = 'all';
            if (typeFilter) typeFilter.value = 'all';
            filterJobs();
        });
    }
}

function filterJobs() {
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');
    const typeFilter = document.getElementById('typeFilter');

    const category = categoryFilter?.value || 'all';
    const location = locationFilter?.value || 'all';
    const type = typeFilter?.value || 'all';

    filteredJobs = jobsData.filter(job => {
        const normalizedCategory = normalizeCategoryOrType(job.category);
        const normalizedLocation = normalizeLocation(job.location);
        const normalizedType = normalizeCategoryOrType(job.type);

        const categoryMatch = category === 'all' || normalizedCategory === category;
        const locationMatch = location === 'all' ||
            (location === 'remote' && job.remote) ||
            normalizedLocation === location;
        const typeMatch = type === 'all' || normalizedType === type;

        return categoryMatch && locationMatch && typeMatch;
    });

    currentJobsDisplayed = jobsPerPage;
    renderJobs(filteredJobs, currentJobsDisplayed);
}

const chatState = {
    mode: 'assistant',
    location: 'all',
    category: 'all',
    type: 'all'
};

let chatSpeechEnabled = false;

function formatChatLabel(value) {
    return value.toString().replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function getUniqueLocations() {
    return [...new Set(jobsData.map(job => normalizeLocation(job.location)))].sort();
}

function getUniqueCategories() {
    return [...new Set(jobsData.map(job => normalizeCategoryOrType(job.category)))].sort();
}

function getUniqueTypes() {
    return [...new Set(jobsData.map(job => normalizeCategoryOrType(job.type)))].sort();
}

function startChatBot() {
    chatState.mode = 'assistant';
    chatState.location = 'all';
    chatState.category = 'all';
    chatState.type = 'all';

    const messages = document.getElementById('chatMessages');
    const options = document.getElementById('chatOptions');
    if (!messages || !options) return;

    messages.innerHTML = '';
    options.innerHTML = '';

    addChatMessage('Hi! I am your career assistant. I can help with job recommendations, skills matching, interview prep, FAQs, and salary guidance. Type a request or choose one of the options below.', 'bot');
    setChatOptions([
        {label: 'Find Jobs', value: 'find jobs'},
        {label: 'Match my skills', value: 'match skills'},
        {label: 'Interview prep', value: 'interview prep'},
        {label: 'Ask FAQ', value: 'faq'},
        {label: 'Salary guide', value: 'salary guide'}
    ]);
}

function setChatOptions(optionsList) {
    const options = document.getElementById('chatOptions');
    if (!options) return;
    options.innerHTML = '';
    optionsList.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chat-button';
        button.textContent = option.label;
        button.onclick = () => handleChatInput(option.value);
        options.appendChild(button);
    });
}

function addChatMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;
    const message = document.createElement('div');
    message.className = `chat-message ${sender}`;
    message.innerHTML = `<p>${text}</p>`;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    if (sender === 'bot' && chatSpeechEnabled) {
        speakText(text);
    }
}

function applyChatFilters() {
    const locationFilter = document.getElementById('locationFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');

    if (locationFilter) {
        locationFilter.value = chatState.location || 'all';
    }
    if (categoryFilter) {
        categoryFilter.value = chatState.category || 'all';
    }
    if (typeFilter) {
        typeFilter.value = chatState.type || 'all';
    }

    filterJobs();
}

function speakText(text) {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

function normalizeTerm(text) {
    return text.toString().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
    const stopWords = new Set(['the', 'a', 'an', 'to', 'for', 'and', 'or', 'in', 'on', 'with', 'my', 'me', 'i', 'want', 'looking', 'find', 'show', 'jobs', 'job', 'role', 'roles', 'opportunities', 'openings', 'apply', 'please', 'can', 'could', 'help']);
    return normalizeTerm(text).split(' ').filter(word => word && !stopWords.has(word));
}

function computeEditDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
}

function isSimilarWord(a, b) {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 2) return false;
    return computeEditDistance(a, b) <= 1;
}

function fuzzyMatchToken(token, text) {
    const normalizedText = normalizeTerm(text);
    if (!token) return false;
    if (normalizedText.includes(token)) return true;
    const words = normalizedText.split(' ');
    return words.some(word => word.includes(token) || token.includes(word) || isSimilarWord(token, word));
}

function anyTokenMatches(tokens, text) {
    return tokens.some(token => fuzzyMatchToken(token, text));
}

function getChatIntent(text) {
    const normalized = text.toLowerCase();
    if (/\b(start over|restart|reset|clear)\b/.test(normalized)) {
        return {type: 'reset'};
    }
    if (/\b(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/.test(normalized)) {
        return {type: 'greeting'};
    }
    if (/\b(name|who are you|what are you|your name|are you a bot|how are you|how's it going|how is it going)\b/.test(normalized)) {
        return {type: 'personal'};
    }
    if (/\b(interview|questions|prep|prepare|panel)\b/.test(normalized)) {
        return {type: 'interview_prep'};
    }
    if (/\b(faq|how do i|how to|what documents|apply|application|can i|should i|where do i|where can i|when should i|why should i)\b/.test(normalized)) {
        return {type: 'faq'};
    }
    if (/\b(salary|pay|benefit|package|compensation|ctc|offer|salary range|pay scale|paycheck)\b/.test(normalized)) {
        return {type: 'salary'};
    }
    if (/\b(skill|skills|experience|expertise|know|familiar|proficient|learned)\b/.test(normalized)) {
        return {type: 'match_skills'};
    }
    return {type: 'general'};
}

function parseJobRequest(message) {
    const normalized = normalizeTerm(message);
    const request = {
        location: 'all',
        category: 'all',
        type: 'all',
        keywords: []
    };

    const words = tokenize(message);
    const locationSynonyms = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'gujranwala', 'sialkot', 'remote', 'work from home', 'office', 'onsite', 'on-site'];
    const typeSynonyms = {
        'full-time': ['full-time', 'full time', 'permanent', 'regular', 'fulltime'],
        'part-time': ['part-time', 'part time', 'parttime', 'half time'],
        'contract': ['contract', 'freelance', 'temporary'],
        'internship': ['internship', 'intern', 'intern role']
    };
    const categorySynonyms = {
        technology: ['technology', 'tech', 'software', 'it', 'developer', 'engineer', 'programmer', 'dev'],
        management: ['management', 'manager', 'lead', 'leadership', 'operations'],
        marketing: ['marketing', 'seo', 'social media', 'content', 'digital marketing'],
        finance: ['finance', 'accounting', 'cpa', 'audit', 'budget', 'financial'],
        healthcare: ['healthcare', 'medical', 'nurse', 'doctor', 'health'],
        design: ['design', 'ux', 'ui', 'graphic', 'illustrator', 'creative'],
        'customer-service': ['customer service', 'support', 'csr', 'client support'],
        sales: ['sales', 'business development', 'bdm'],
        'data-analytics': ['data', 'analytics', 'analyst', 'business intelligence', 'bi']
    };

    if (fuzzyMatchToken('remote', normalized) || fuzzyMatchToken('work from home', normalized) || fuzzyMatchToken('wfh', normalized)) {
        request.location = 'remote';
    }

    getUniqueLocations().forEach(location => {
        const phrase = location.replace(/-/g, ' ');
        if (fuzzyMatchToken(phrase, normalized) || words.some(word => isSimilarWord(word, phrase))) {
            request.location = location;
        }
    });

    getUniqueCategories().forEach(category => {
        const phrase = category.replace(/-/g, ' ');
        if (fuzzyMatchToken(phrase, normalized) || words.some(word => isSimilarWord(word, phrase))) {
            request.category = category;
        }
    });

    Object.entries(categorySynonyms).forEach(([category, synonyms]) => {
        if (synonyms.some(syn => fuzzyMatchToken(syn, normalized))) {
            request.category = category;
        }
    });

    Object.entries(typeSynonyms).forEach(([typeKey, synonyms]) => {
        if (synonyms.some(syn => fuzzyMatchToken(syn, normalized))) {
            request.type = typeKey;
        }
    });

    if (request.type === 'all') {
        if (words.some(word => ['fulltime', 'full-time', 'full', 'permanent'].some(token => isSimilarWord(token, word)))) {
            request.type = 'full-time';
        } else if (words.some(word => ['parttime', 'part-time', 'part', 'half'].some(token => isSimilarWord(token, word)))) {
            request.type = 'part-time';
        } else if (words.some(word => ['contract', 'freelance', 'temporary'].some(token => isSimilarWord(token, word)))) {
            request.type = 'contract';
        } else if (words.some(word => ['intern', 'internship'].some(token => isSimilarWord(token, word)))) {
            request.type = 'internship';
        }
    }

    request.keywords = words.filter(word => !Object.values(typeSynonyms).flat().some(syn => isSimilarWord(word, syn)) && !Object.values(categorySynonyms).flat().some(syn => isSimilarWord(word, syn)) && !locationSynonyms.some(loc => isSimilarWord(word, loc))).join(' ');
    return request;
}

function searchJobs(criteria) {
    const tokens = tokenize(criteria.keywords || '');
    return jobsData.filter(job => {
        const normalizedCategory = normalizeCategoryOrType(job.category);
        const normalizedLocation = normalizeLocation(job.location);
        const normalizedType = normalizeCategoryOrType(job.type);
        const normalizedTitle = job.title.toLowerCase();
        const normalizedCompany = job.company.toLowerCase();
        const normalizedDescription = job.description.toLowerCase();
        const normalizedTags = job.tags.join(' ').toLowerCase();

        const categoryMatch = criteria.category === 'all' || normalizedCategory === criteria.category;
        const locationMatch = criteria.location === 'all' || (criteria.location === 'remote' && job.remote) || normalizedLocation === criteria.location;
        const typeMatch = criteria.type === 'all' || normalizedType === criteria.type;

        const keywordMatch = tokens.length === 0 || tokens.some(token => {
            return [normalizedTitle, normalizedCompany, normalizedDescription, normalizedTags].some(text => fuzzyMatchToken(token, text));
        });

        return categoryMatch && locationMatch && typeMatch && keywordMatch;
    });
}

function renderChatJobResults(jobs, summary) {
    if (jobs.length === 0) {
        addChatMessage('I could not find matching jobs for that request. Try changing the location, category, or type.', 'bot');
        setChatOptions([
            {label: 'Find jobs', value: 'find jobs'},
            {label: 'Match my skills', value: 'match skills'},
            {label: 'Interview prep', value: 'interview prep'}
        ]);
        return;
    }

    addChatMessage(`${summary} Showing the top matches below.`, 'bot');
    const topJobs = jobs.slice(0, 3).map(job => `• ${job.title} at ${job.company} (${job.location}, ${job.type.replace('-', ' ')})`).join('<br>');
    addChatMessage(topJobs, 'bot');

    filteredJobs = jobs;
    currentJobsDisplayed = jobsPerPage;
    renderJobs(filteredJobs, currentJobsDisplayed);
    setChatOptions([
        {label: 'Show more jobs', value: 'find jobs'},
        {label: 'Interview prep', value: 'interview prep'},
        {label: 'Salary guide', value: 'salary guide'}
    ]);
}

function answerGreeting() {
    addChatMessage('Hello! How may I assist you today? You can ask me to find jobs, match your skills, prepare for interviews, or get salary guidance.', 'bot');
    setChatOptions([
        {label: 'Find jobs', value: 'find jobs'},
        {label: 'Match my skills', value: 'match skills'},
        {label: 'Interview prep', value: 'interview prep'},
        {label: 'Salary guide', value: 'salary guide'},
        {label: 'Ask FAQ', value: 'faq'}
    ]);
}

function answerPersonalQuestion() {
    addChatMessage('I am a career assistant focused on job search, skills matching, interview prep, salary guidance, and career advice. Ask me about jobs or how to improve your job search.', 'bot');
    setChatOptions([
        {label: 'Find jobs', value: 'find jobs'},
        {label: 'Match my skills', value: 'match skills'},
        {label: 'Ask FAQ', value: 'faq'}
    ]);
}

function answerGeneralJobAssistant(message) {
    const criteria = parseJobRequest(message);
    const jobs = searchJobs(criteria);
    if (jobs.length > 0) {
        const summary = criteria.location === 'all' && criteria.category === 'all' && criteria.type === 'all' && !criteria.keywords
            ? 'Here are some open roles to explore.'
            : `I found ${jobs.length} jobs related to your request.`;
        renderChatJobResults(jobs, summary);
        return;
    }

    addChatMessage('I may not have an exact match, but I can still help with job search, interview tips, salary expectations, and resume advice. Try a request like “remote developer jobs in Lahore” or “interview prep for marketing roles.”', 'bot');
    setChatOptions([
        {label: 'Find jobs', value: 'find jobs'},
        {label: 'Match my skills', value: 'match skills'},
        {label: 'Interview prep', value: 'interview prep'},
        {label: 'Salary guide', value: 'salary guide'}
    ]);
}

function answerInterviewPrep(message) {
    const normalized = message.toLowerCase();
    if (/\b(why do you want|tell me about yourself|strength|weakness)\b/.test(normalized)) {
        addChatMessage('Interview tip: Keep your answer short, connect your skills to the job, and show enthusiasm for growth. Example: “I have strong experience in X, and I am excited to bring that to a role where I can help achieve Y.”', 'bot');
    } else {
        addChatMessage('Interview prep: Focus on the job requirements, highlight your skills clearly, and use examples from your past work. Practice answers for common questions like “Tell me about yourself” and “Why should we hire you?”.', 'bot');
    }
    setChatOptions([
        {label: 'Match my skills', value: 'match skills'},
        {label: 'Find jobs', value: 'find jobs'},
        {label: 'Ask FAQ', value: 'faq'}
    ]);
}

function answerFAQ(message) {
    const normalized = message.toLowerCase();
    if (/\b(apply|application|upload|resume)\b/.test(normalized)) {
        addChatMessage('To apply, use the job cards on the page and follow the apply instructions. If resume upload is not configured, contact the platform owner to add backend application support.', 'bot');
    } else if (/\b(document|documents|resume|cv)\b/.test(normalized)) {
        addChatMessage('Most employers want a resume and cover letter. Highlight your key skills, experience, and relevant projects for the role.', 'bot');
    } else if (/\b(remote|work from home|wfh)\b/.test(normalized)) {
        addChatMessage('Remote jobs are shown with the remote option. Use the chat or filters to find work-from-home roles.', 'bot');
    } else {
        addChatMessage('I can answer questions about applying, required documents, remote work, and how the job matching works. Ask me anything.', 'bot');
    }
    setChatOptions([
        {label: 'Find jobs', value: 'find jobs'},
        {label: 'Salary guide', value: 'salary guide'},
        {label: 'Interview prep', value: 'interview prep'}
    ]);
}

function salaryGuide(message) {
    const normalized = message.toLowerCase();
    if (/\b(what|how much|salary range|package)\b/.test(normalized)) {
        addChatMessage('Salary guide: Choose jobs that match your experience and market rates. In Pakistan, technology and management roles usually offer higher pay. Highlight your strongest skills to improve your offer.', 'bot');
    } else {
        addChatMessage('I can help with salary expectations, benefits comparison, and compensation advice. Ask for salary guidance for a role or location.', 'bot');
    }
    setChatOptions([
        {label: 'Match my skills', value: 'match skills'},
        {label: 'Find jobs', value: 'find jobs'},
        {label: 'Interview prep', value: 'interview prep'}
    ]);
}

function extractSkills(message) {
    const normalized = message.toLowerCase();
    const skillKeywords = ['python', 'sql', 'excel', 'figma', 'javascript', 'react', 'node', 'aws', 'marketing', 'seo', 'sales', 'finance', 'accounting', 'design', 'ux', 'ui', 'project', 'management', 'hr', 'customer service'];
    return skillKeywords.filter(skill => normalized.includes(skill));
}

function matchSkillsToJobs(message) {
    const skills = extractSkills(message);
    if (skills.length === 0) {
        addChatMessage('Please tell me your main skills or experience, for example: “I know Python, SQL, and Excel” or “I have marketing and sales experience.”', 'bot');
        return;
    }

    const categories = [];
    const categoryMap = {
        technology: ['python', 'java', 'javascript', 'react', 'node', 'sql', 'aws', 'cloud', 'devops', 'docker', 'kubernetes'],
        marketing: ['marketing', 'seo', 'content', 'social media', 'brand', 'campaign'],
        finance: ['finance', 'accounting', 'cpa', 'audit', 'budget'],
        design: ['design', 'ux', 'ui', 'figma', 'photoshop', 'illustrator'],
        management: ['management', 'hr', 'human resources', 'project', 'product', 'business']
    };

    skills.forEach(skill => {
        Object.entries(categoryMap).forEach(([category, keywords]) => {
            if (keywords.some(keyword => skill.includes(keyword))) {
                if (!categories.includes(category)) categories.push(category);
            }
        });
    });

    const recommendedCategory = categories[0] || 'technology';
    const criteria = parseJobRequest(message);
    if (criteria.category === 'all') {
        criteria.category = recommendedCategory;
    }

    const jobs = searchJobs(criteria);
    addChatMessage(`Based on your skills (${skills.join(', ')}), I recommend ${formatChatLabel(recommendedCategory)} roles.`, 'bot');
    renderChatJobResults(jobs, `I found ${jobs.length} jobs matching your skills.`);
}

function handleChatInput(text) {
    const value = text.trim();
    if (!value) return;

    const intent = getChatIntent(value);
    if (intent.type === 'reset') {
        startChatBot();
        return;
    }

    addChatMessage(value, 'user');

    if (intent.type === 'greeting') {
        answerGreeting();
        return;
    }
    if (intent.type === 'personal') {
        answerPersonalQuestion();
        return;
    }
    if (intent.type === 'find_jobs') {
        const criteria = parseJobRequest(value);
        const jobs = searchJobs(criteria);
        if (jobs.length > 0) {
            renderChatJobResults(jobs, `I found ${jobs.length} jobs matching your request.`);
        } else {
            addChatMessage('I did not find specific matches, but I can still help with jobs, skills, interview prep, or salary guidance. Try asking for a location or role you want.', 'bot');
            setChatOptions([
                {label: 'Find jobs', value: 'find jobs'},
                {label: 'Match my skills', value: 'match skills'},
                {label: 'Interview prep', value: 'interview prep'}
            ]);
        }
        return;
    }
    if (intent.type === 'match_skills') {
        matchSkillsToJobs(value);
        return;
    }
    if (intent.type === 'interview_prep') {
        answerInterviewPrep(value);
        return;
    }
    if (intent.type === 'faq') {
        answerFAQ(value);
        return;
    }
    if (intent.type === 'salary') {
        salaryGuide(value);
        return;
    }

    answerGeneralJobAssistant(value);
}

function processChatInput(message) {
    if (!message || !message.trim()) return;
    handleChatInput(message);
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
document.addEventListener('DOMContentLoaded', () => {
    populateFilterSelects();
    setupFilterListeners();
    renderJobs();
    startChatBot();

    const chatInput = document.getElementById('chatInput');
    const chatSendButton = document.getElementById('chatSendButton');

    if (chatSendButton && chatInput) {
        chatSendButton.addEventListener('click', () => {
            chatSpeechEnabled = true;
            processChatInput(chatInput.value);
            chatInput.value = '';
        });

        chatInput.addEventListener('focus', () => {
            chatSpeechEnabled = true;
        });

        chatInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                chatSendButton.click();
            }
        });
    }

    document.querySelectorAll('.chat-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            if (!chatInput) return;
            chatSpeechEnabled = true;
            chatInput.value = pill.textContent.trim();
            processChatInput(chatInput.value);
            chatInput.value = '';
        });
    });
});

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
function searchJobsQuery(query) {
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
