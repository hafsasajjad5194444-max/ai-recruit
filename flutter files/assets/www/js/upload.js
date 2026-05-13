// Upload Page JavaScript
const PREDICTION_API_BASE_URL = 'https://YOUR_USERNAME-resume-matcher-api.hf.space';
const PREDICTION_API_PREDICT = `${PREDICTION_API_BASE_URL}/predict`;

let currentStep = 1;
let uploadedFile = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupUploadArea();
    setupFormValidation();
    
    // Check if applying to specific job
    const jobInfo = sessionStorage.getItem('applyingToJob');
    if (jobInfo) {
        const job = JSON.parse(jobInfo);
        showJobApplicationBanner(job);
    }
});

// Setup drag and drop upload area
function setupUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('resumeFile');

    if (!uploadArea || !fileInput) return;

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });
}

// Handle file selection
function handleFile(file) {
    if (!file) return;

    // Validate file
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document');
        return;
    }

    if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
    }

    uploadedFile = file;
    showFilePreview(file);
}

// Show file preview
function showFilePreview(file) {
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');

    uploadArea.style.display = 'none';
    filePreview.style.display = 'flex';
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
}

// Remove file
function removeFile() {
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const fileInput = document.getElementById('resumeFile');

    uploadedFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    filePreview.style.display = 'none';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Step navigation
function nextStep() {
    // Validate current step
    if (!validateStep(currentStep)) return;

    // Hide current step
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.querySelector(`.progress-steps .step:nth-child(${currentStep * 2 - 1})`).classList.remove('active');

    // Show next step
    currentStep++;
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.querySelector(`.progress-steps .step:nth-child(${currentStep * 2 - 1})`).classList.add('active');
}

function prevStep() {
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.querySelector(`.progress-steps .step:nth-child(${currentStep * 2 - 1})`).classList.remove('active');

    // Show previous step
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.add('active');
    document.querySelector(`.progress-steps .step:nth-child(${currentStep * 2 - 1})`).classList.add('active');
}

// Validate step
function validateStep(step) {
    if (step === 1) {
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!fullName) {
            alert('Please enter your full name');
            return false;
        }

        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            alert('Please enter a valid email address');
            return false;
        }

        if (!phone) {
            alert('Please enter your phone number');
            return false;
        }

        return true;
    }

    return true;
}

// Form submission
function setupFormValidation() {
    const form = document.getElementById('uploadForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate file upload
        if (!uploadedFile) {
            alert('Please upload your resume');
            return;
        }

        if (!validateStep(currentStep)) return;

        // Show processing step and run analysis
        showProcessingStep();
        const analysis = await analyzeResume();
        showResults(analysis);
    });
}

async function analyzeResume() {
    const fullName = document.getElementById('fullName').value.trim();
    const desiredRole = document.getElementById('desiredRole').value;
    const coverLetter = document.getElementById('coverLetter').value.trim();
    const fileName = uploadedFile ? uploadedFile.name.toLowerCase() : '';
    const resumeText = `${fullName}\n${fileName}\n${coverLetter}`.trim();
    const jobDescription = getJobDescription(desiredRole);

    const roleSkills = {
        'data-analyst': ['Data Analysis', 'SQL', 'Python', 'Reporting', 'Excel'],
        'hr-manager': ['Recruitment', 'Employee Relations', 'Policy', 'Training', 'Communication'],
        'software-engineer': ['JavaScript', 'Flutter', 'Dart', 'React', 'Problem Solving'],
        'marketing-manager': ['Marketing', 'SEO', 'Campaigns', 'Branding', 'Copywriting'],
        'product-manager': ['Product Strategy', 'Roadmap', 'Analytics', 'Leadership', 'Stakeholders'],
        'designer': ['UI/UX', 'Adobe XD', 'Figma', 'Creativity', 'Visual Design'],
        'other': ['Communication', 'Teamwork', 'Adaptability', 'Problem Solving', 'Attention to Detail'],
    };

    const selectedSkills = roleSkills[desiredRole] || roleSkills['other'];
    const extraSkills = extractSkillsFromText(`${fileName} ${coverLetter}`);
    const activeSkills = [...new Set([...selectedSkills, ...extraSkills])].slice(0, 8);

    let score = 55;
    if (selectedSkills.length > 0) score += 10;
    if (coverLetter.length > 80) score += 8;
    if (uploadedFile.size > 60 * 1024) score += 7;
    if (coverLetter.toLowerCase().includes('ai') || coverLetter.toLowerCase().includes('machine learning')) score += 5;
    if (fileName.includes('data') || fileName.includes('analysis')) score += 5;
    score = Math.min(100, score);

    const prediction = await getPredictionData(resumeText, jobDescription);
    const finalScore = prediction ? Math.round(prediction.confidence * 100) : score;
    const matchCount = prediction
        ? prediction.match ? 10 : 3
        : Math.max(2, Math.min(12, Math.floor(finalScore / 10) + 3));

    await simulateProgress(finalScore);

    return {
        fullName,
        desiredRole,
        score: finalScore,
        matchCount,
        skills: activeSkills,
    };
}

async function getPredictionData(resumeText, jobDescription) {
    if (PREDICTION_API_BASE_URL.includes('YOUR_USERNAME')) {
        return null; // Replace with your Hugging Face Space URL before using the backend.
    }

    try {
        const response = await fetch(PREDICTION_API_PREDICT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resume_text: resumeText,
                job_description: jobDescription,
            }),
        });

        if (!response.ok) {
            console.warn('Prediction API failed:', response.status, response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.warn('Prediction API error:', error);
        return null;
    }
}

function getJobDescription(role) {
    const descriptions = {
        'data-analyst': 'Analyze large datasets, build dashboards, and create reports to improve business decisions.',
        'hr-manager': 'Manage recruitment, employee relations, training, and compliance to build a high-performing team.',
        'software-engineer': 'Design and build scalable applications using modern languages and frameworks.',
        'marketing-manager': 'Develop marketing campaigns, measure performance, and grow brand awareness.',
        'product-manager': 'Lead product strategy, define roadmaps, and coordinate with engineering teams.',
        'designer': 'Craft user interfaces, prototypes, and visual designs that improve usability.',
        'other': 'Prepare for a flexible role focused on communication, problem solving, and teamwork.',
    };

    return descriptions[role] || descriptions['other'];
}

function extractSkillsFromText(text) {
    const keywords = [
        'data', 'sql', 'python', 'excel', 'reporting',
        'ai', 'machine learning', 'recruitment', 'hr', 'training',
        'javascript', 'flutter', 'dart', 'react', 'ux',
        'marketing', 'seo', 'brand', 'design', 'product',
        'communication', 'leadership', 'teamwork', 'analysis',
        'cloud', 'aws', 'azure', 'testing', 'automation'
    ];

    const found = [];
    const lower = text.toLowerCase();
    keywords.forEach(keyword => {
        if (lower.includes(keyword) && !found.includes(keyword)) {
            found.push(formatSkillName(keyword));
        }
    });
    return found;
}

function formatSkillName(keyword) {
    const mapping = {
        'ai': 'AI',
        'sql': 'SQL',
        'ux': 'UI/UX',
        'hr': 'HR',
        'aws': 'AWS',
        'azure': 'Azure',
        'seo': 'SEO',
    };
    return mapping[keyword] || keyword.charAt(0).toUpperCase() + keyword.slice(1);
}

function showProcessingStep() {
    const form = document.getElementById('uploadForm');
    if (form) {
        form.style.display = 'block';
    }

    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step3').classList.add('active');

    document.querySelectorAll('.progress-steps .step').forEach((step, index) => {
        step.classList.toggle('active', index < 3);
    });
}

function simulateProgress(finalScore) {
    return new Promise((resolve) => {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        let percent = 0;

        const interval = setInterval(() => {
            percent += 6;
            if (percent > 90) percent = 90;
            progressFill.style.width = `${percent}%`;
            progressText.textContent = `Analyzing resume... ${percent}%`;
            if (percent >= 90) {
                clearInterval(interval);
                setTimeout(() => {
                    progressFill.style.width = `${finalScore}%`;
                    progressText.textContent = `Analysis complete! Score ${finalScore}%`;
                    resolve();
                }, 500);
            }
        }, 120);
    });
}

function showResults(analysis) {
    const resultsSection = document.getElementById('resultsSection');
    const matchCount = document.getElementById('matchCount');
    const detectedSkills = document.getElementById('detectedSkills');
    const scoreValue = document.querySelector('.score-value');

    if (matchCount) matchCount.textContent = analysis.matchCount;
    if (scoreValue) scoreValue.textContent = `${analysis.score}%`;

    if (detectedSkills) {
        detectedSkills.innerHTML = analysis.skills
            .map(skill => `<span class="skill-chip">${skill}</span>`)
            .join('');
    }

    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
}

// Reset form
function resetForm() {
    // Reset all form fields
    document.getElementById('uploadForm').reset();
    removeFile();
    
    // Hide results
    document.getElementById('resultsSection').style.display = 'none';
    
    // Show form
    document.getElementById('uploadForm').style.display = 'block';
    
    // Reset to step 1
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelectorAll('.progress-steps .step').forEach(step => {
        step.classList.remove('active');
    });
    
    currentStep = 1;
    document.getElementById('step1').classList.add('active');
    document.querySelector('.progress-steps .step:first-child').classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show job application banner
function showJobApplicationBanner(job) {
    const uploadHeader = document.querySelector('.upload-header');
    const banner = document.createElement('div');
    banner.className = 'job-application-banner';
    banner.innerHTML = `
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                    color: white; padding: 1rem 2rem; border-radius: 10px; 
                    margin-bottom: 2rem; text-align: center;">
            <p style="margin-bottom: 0.5rem;">
                <i class="fas fa-briefcase"></i> Applying for: <strong>${job.title}</strong>
            </p>
            <p style="font-size: 0.9rem; opacity: 0.9; margin: 0;">
                at ${job.company}
            </p>
        </div>
    `;
    uploadHeader.appendChild(banner);
    
    // Pre-fill desired role
    const desiredRoleSelect = document.getElementById('desiredRole');
    if (desiredRoleSelect && job.category) {
        // Try to match category to role options
        const categoryMap = {
            'technology': 'software-engineer',
            'management': 'hr-manager',
            'marketing': 'marketing-manager',
            'finance': 'other',
            'design': 'designer'
        };
        const roleValue = categoryMap[job.category] || 'other';
        desiredRoleSelect.value = roleValue;
    }
}

// Mobile menu toggle (reused from main.js)
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
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    });
});
