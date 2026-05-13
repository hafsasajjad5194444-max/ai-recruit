// Jobs Page Script
const hasBackend = true; // Local job list enabled for app usage
const jobsApiUrl = '/api/jobs'; // Update to your real backend endpoint if attached
let filteredJobs = [];

function jobsAreNotAvailable() {
    return false;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeJobsPage();
});

function initializeJobsPage() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const jobId = urlParams.get('job');

    // Initialize audio
    setupAudioControl();

    if (jobsAreNotAvailable()) {
        renderBackendNotConnected();
        return;
    }

    // Initialize filters
    initializeFilters();

    // Load initial jobs
    if (searchQuery) {
        // Filter by search query
        filteredJobs = jobsData.filter(job =>
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            job.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    } else if (jobId) {
        // Show all jobs but highlight specific job
        filteredJobs = [...jobsData];
    } else {
        filteredJobs = [...jobsData];
    }

    renderJobs(filteredJobs);

    // Highlight specific job if jobId is provided
    if (jobId) {
        setTimeout(() => {
            highlightJob(parseInt(jobId));
        }, 500);
    }

    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function renderBackendNotConnected() {
    const jobsGrid = document.getElementById('jobsGrid');
    const filterSection = document.querySelector('.job-filters');
    const loadMoreContainer = document.querySelector('.load-more-container');

    if (filterSection) {
        filterSection.style.display = 'none';
    }

    if (loadMoreContainer) {
        loadMoreContainer.style.display = 'none';
    }

    if (jobsGrid) {
        jobsGrid.innerHTML = `
            <div class="no-jobs">
                <h3>Backend not connected</h3>
                <p>Job data will be loaded here once the backend service is attached.</p>
            </div>
        `;
    }
}

function initializeFilters() {
    const categoryInput = document.getElementById('categoryFilter');
    const locationInput = document.getElementById('locationFilter');
    const typeInput = document.getElementById('typeFilter');

    if (categoryInput && locationInput && typeInput) {
        // Populate datalist options for text-based filters
        populateFilterOptions();

        // Add event listeners for real-time filtering
        categoryInput.addEventListener('change', applyFilters);
        locationInput.addEventListener('change', applyFilters);
        typeInput.addEventListener('change', applyFilters);
        categoryInput.addEventListener('input', applyFilters);
        locationInput.addEventListener('input', applyFilters);
        typeInput.addEventListener('input', applyFilters);

        // Add click sounds
        categoryInput.addEventListener('click', () => playSound('click'));
        locationInput.addEventListener('click', () => playSound('click'));
        typeInput.addEventListener('click', () => playSound('click'));

        // Add reset filters functionality
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                playSound('buttonClick');
                categoryInput.value = '';
                locationInput.value = '';
                typeInput.value = '';
                applyFilters();
            });
        }
    }
}

function populateFilterOptions() {
    const categoryDatalist = document.getElementById('categoryOptions');
    const locationDatalist = document.getElementById('locationOptions');
    const typeDatalist = document.getElementById('typeOptions');

    if (!categoryDatalist || !locationDatalist || !typeDatalist) return;

    // Get unique values
    const categories = [...new Set(jobsData.map(job => job.category))].sort();
    const locations = [...new Set(jobsData.map(job => job.location))].sort();
    const types = [...new Set(jobsData.map(job => job.type))].sort();

    categoryDatalist.innerHTML = categories.map(cat => `<option value="${formatLabel(cat)}"></option>`).join('');
    locationDatalist.innerHTML = locations.map(loc => `<option value="${loc}"></option>`).join('');
    typeDatalist.innerHTML = types.map(type => `<option value="${formatLabel(type)}"></option>`).join('');
}

function formatLabel(value) {
    return value
        .split(/[-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function applyFilters() {
    const categoryInput = document.getElementById('categoryFilter');
    const locationInput = document.getElementById('locationFilter');
    const typeInput = document.getElementById('typeFilter');

    const categoryValueRaw = categoryInput ? categoryInput.value.toLowerCase().trim() : '';
    const locationValueRaw = locationInput ? locationInput.value.toLowerCase().trim() : '';
    const typeValueRaw = typeInput ? typeInput.value.toLowerCase().trim() : '';

    const categoryValue = categoryValueRaw === 'all' ? '' : categoryValueRaw;
    const locationValue = locationValueRaw === 'all' ? '' : locationValueRaw;
    const typeValue = typeValueRaw === 'all' ? '' : typeValueRaw;

    // Filter jobs based on inputs
    filteredJobs = jobsData.filter(job => {
        const matchesCategory = !categoryValue || job.category.toLowerCase().includes(categoryValue);
        const matchesLocation = !locationValue || job.location.toLowerCase().includes(locationValue);
        const matchesType = !typeValue || job.type.toLowerCase().includes(typeValue);

        return matchesCategory && matchesLocation && matchesType;
    });

    renderJobs(filteredJobs);
}

function initializeSearch() {
    // Removed - no search in jobs page
}

function renderJobs(jobs) {
    const jobsGrid = document.getElementById('jobsGrid');

    if (!jobsGrid) return;

    jobsGrid.innerHTML = '';

    if (jobs.length === 0) {
        jobsGrid.innerHTML = '<div class="no-jobs">No jobs found matching your criteria.</div>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsGrid.appendChild(jobCard);
    });
}

function createJobCard(job) {
    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';
    jobCard.setAttribute('data-job-id', job.id);

    jobCard.innerHTML = `
        <div class="job-header">
            <div class="job-logo" style="background: ${getLogoColor(job.logo)}">
                ${job.logo}
            </div>
            <div class="job-info">
                <h3 class="job-title">${job.title}</h3>
                <p class="job-company">${job.company}</p>
                <div class="job-meta">
                    <span class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                    <span class="job-type"><i class="fas fa-clock"></i> ${job.type}</span>
                    <span class="job-salary"><i class="fas fa-dollar-sign"></i> ${job.salary}</span>
                </div>
            </div>
        </div>
        <div class="job-description">
            <p>${job.description}</p>
        </div>
        <div class="job-tags">
            ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
        </div>
        <div class="job-footer">
            <span class="job-posted">${job.posted}</span>
            <button class="btn btn-primary apply-btn" onclick="applyForJob(${job.id})">Apply Now</button>
        </div>
    `;

    return jobCard;
}

function highlightJob(jobId) {
    const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
    if (jobCard) {
        jobCard.style.transform = 'scale(1.02)';
        jobCard.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.3)';
        jobCard.style.border = '2px solid #6366f1';

        setTimeout(() => {
            jobCard.style.transform = '';
            jobCard.style.boxShadow = '';
            jobCard.style.border = '';
        }, 3000);
    }
}

function applyForJob(jobId) {
    // Redirect to upload page with job ID
    window.location.href = `upload.html?job=${jobId}`;
}

// Utility functions
function getLogoColor(logo) {
    const colors = [
        '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
        '#ef4444', '#ec4899', '#84cc16', '#f97316', '#6b7280'
    ];
    return colors[logo.charCodeAt(0) % colors.length];
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Audio functions
function setupAudioControl() {
    const audioToggle = document.getElementById('audioToggle');
    const bgAudio = document.getElementById('bgAudio');

    if (audioToggle && bgAudio) {
        // Check session storage for mute state
        const isMuted = sessionStorage.getItem('audioMuted') === 'true';
        bgAudio.muted = isMuted;
        updateAudioIcon(audioToggle, isMuted);

        audioToggle.addEventListener('click', () => {
            const currentlyMuted = bgAudio.muted;
            bgAudio.muted = !currentlyMuted;
            sessionStorage.setItem('audioMuted', !currentlyMuted);
            updateAudioIcon(audioToggle, !currentlyMuted);
            playSound('click');
        });
    }
}

function updateAudioIcon(button, isMuted) {
    const icon = button.querySelector('i');
    if (icon) {
        icon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }
}

function playSound(soundType) {
    const isMuted = sessionStorage.getItem('audioMuted') === 'true';
    if (isMuted) return;

    let soundFile = '';
    switch (soundType) {
        case 'click':
            soundFile = 'audio/click.mp3';
            break;
        case 'buttonClick':
            soundFile = 'audio/button-click.mp3';
            break;
        case 'shutter':
            soundFile = 'audio/shutter.mp3';
            break;
        case 'pop':
            soundFile = 'audio/pop.mp3';
            break;
        default:
            return;
    }

    const audio = new Audio(soundFile);
    audio.volume = 0.3; // Normal volume
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});