// Upload Page JavaScript
const backendBaseUrls = [
    'https://zarmeena-arif5-resume-matcher-api2.hf.space',
];

let currentStep = 1;
let uploadedFile = null;
let uploadedFileText = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }
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
    fileInput.addEventListener('change', async (e) => {
        await handleFile(e.target.files[0]);
    });

    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        await handleFile(e.dataTransfer.files[0]);
    });
}

// Handle file selection
async function handleFile(file) {
    if (!file) return;

    // Validate file
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'text/plain'];
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
    uploadedFileText = '';
    console.log('Processing file:', file.name, 'Type:', file.type);
    
    if (file.type === 'application/pdf') {
        uploadedFileText = await extractTextFromPdf(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        uploadedFileText = await extractTextFromDocx(file);
    } else if (file.type === 'application/msword') {
        uploadedFileText = await extractTextFromDocx(file);
    } else if (file.type === 'text/plain') {
        uploadedFileText = await extractTextFromTxt(file);
    }

    console.log('Extracted text length:', uploadedFileText.length);
    if (uploadedFileText.length > 0) {
        console.log('✓ Text extracted successfully');
    } else {
        console.warn('⚠ Warning: No text extracted from file');
    }

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
    
    // Use ACTUAL resume text, not fake calculations
    let resumeText = uploadedFileText;
    
    if (!resumeText || resumeText.trim() === '') {
        console.error('ERROR: Resume text extraction failed! uploadedFileText is empty');
        return {
            error: 'Failed to extract text from your resume. Please ensure the file is a valid PDF or Word document.',
        };
    }

    // Create a hash of the resume text for consistency
    const resumeHash = await hashString(resumeText);
    console.log('Resume hash:', resumeHash.substring(0, 16) + '...');
    console.log('Resume text length:', resumeText.length);
    console.log('Resume text preview:', resumeText.substring(0, 200) + '...');

    const formData = new FormData();
    formData.append('resume_file', uploadedFile);
    formData.append('full_name', fullName);
    formData.append('email', document.getElementById('email').value.trim());
    formData.append('phone', document.getElementById('phone').value.trim());
    formData.append('desired_role', desiredRole);
    formData.append('cover_letter', coverLetter);
    formData.append('job_description', desiredRole ? desiredRole.replace(/-/g, ' ') : 'general job application');
    formData.append('resume_text', resumeText);

    // Try to get analysis from REAL backend
    console.log('Sending to backend for analysis...');
    let apiResult = await uploadResumeFile(formData);
    
    if (!apiResult) {
        console.log('uploadResumeFile failed, trying predictResumeMatch...');
        const apiPayload = {
            resume_text: resumeText,
            job_description: desiredRole ? desiredRole.replace(/-/g, ' ') : 'general job application'
        };
        apiResult = await predictResumeMatch(apiPayload);
    }

    if (!apiResult || apiResult.error) {
        console.error('BACKEND ERROR:', apiResult);
        return {
            error: '❌ Backend is unavailable. Make sure the backend server is running on http://127.0.0.1:7860',
        };
    }

    console.log('✓ Backend analysis successful');
    console.log('Backend result:', apiResult);

    const resultScore = Math.min(100, Math.round(apiResult.confidence * 100));
    const matchCount = apiResult.match ? 1 : 0;
    const backendInferenceMs = apiResult.inference_ms || 0;

    // Detect actual skills from resume
    const detectedSkills = extractSkillsFromText(resumeText);
    const profileStrength = evaluateProfileStrength(resumeText, detectedSkills);
    
    // Fetch job recommendations using REAL resume analysis
    let recommendedJobs = [];
    let bestRole = null;
    if (typeof jobsData !== 'undefined' && jobsData.length > 0) {
        console.log('Fetching job recommendations...');
        const recommendations = await getJobRecommendations(resumeText, jobsData);
        if (recommendations && recommendations.recommended_jobs) {
            recommendedJobs = recommendations.recommended_jobs;
            bestRole = recommendations.top_match;
            console.log('✓ Job recommendations fetched:', recommendedJobs.length, 'jobs found');
        }
    }

    await simulateProgress(resultScore, backendInferenceMs);

    return {
        fullName,
        desiredRole,
        score: resultScore,
        matchCount,
        skills: detectedSkills.slice(0, 8),
        profileStrength,
        apiResult,
        recommendedJobs,
        bestRole,
    };
}

async function getJobRecommendations(resumeText, jobs) {
    console.log(`Fetching recommendations for ${jobs.length} jobs...`);
    for (const baseUrl of backendBaseUrls) {
        const apiUrl = `${baseUrl}/recommend_jobs`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resume_text: resumeText,
                    jobs: jobs
                })
            });
            if (!response.ok) {
                console.warn(`Recommendations returned ${response.status} at ${apiUrl}`);
                continue;
            }
            const result = await response.json();
            console.log('✓ Recommendations successful:', result.recommended_jobs.length, 'jobs');
            return result;
        } catch (error) {
            console.warn(`Recommendations failed at ${apiUrl}:`, error.message);
            continue;
        }
    }
    console.error('All recommendations URLs failed');
    return null;
}

async function uploadResumeFile(formData) {
    for (const baseUrl of backendBaseUrls) {
        const apiUrl = `${baseUrl}/upload_resume`;
        try {
            console.log(`Trying backend: ${apiUrl}`);
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                console.warn(`Backend returned ${response.status} at ${apiUrl}`);
                continue;
            }
            const result = await response.json();
            console.log('✓ Backend upload successful:', result);
            return result;
        } catch (error) {
            console.warn(`Backend failed at ${apiUrl}:`, error.message);
            continue;
        }
    }
    console.error('All backend URLs failed');
    return null;
}

async function predictResumeMatch(payload) {
    for (const baseUrl of backendBaseUrls) {
        const apiUrl = `${baseUrl}/predict`;
        try {
            console.log(`Trying predict endpoint: ${apiUrl}`);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                console.warn(`Predict returned ${response.status} at ${apiUrl}`);
                continue;
            }
            const result = await response.json();
            console.log('✓ Backend predict successful:', result);
            return result;
        } catch (error) {
            console.warn(`Predict failed at ${apiUrl}:`, error.message);
            continue;
        }
    }
    console.error('All predict URLs failed');
    return null;
}


async function extractTextFromPdf(file) {
    if (!window.pdfjsLib) {
        console.error('PDF.js library not loaded');
        return '';
    }
    try {
        const data = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + ' ';
        }
        const extracted = text.trim();
        console.log('✓ PDF extracted, pages:', pdf.numPages);
        return extracted;
    } catch (error) {
        console.error('Error extracting PDF:', error);
        return '';
    }
}

async function extractTextFromDocx(file) {
    if (!window.mammoth) return '';
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        return result.value || '';
    } catch (error) {
        console.error('Error extracting DOCX:', error);
        return '';
    }
}

async function extractTextFromTxt(file) {
    try {
        const text = await file.text();
        console.log('✓ TXT file extracted');
        return text.trim();
    } catch (error) {
        console.error('Error extracting TXT:', error);
        return '';
    }
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

function evaluateProfileStrength(resumeText, skills) {
    const text = resumeText.toLowerCase();
    let score = 0;
    let factors = [];

    // Length factor (resume should be substantial)
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 200) {
        score += 20;
        factors.push("Good resume length");
    } else if (wordCount > 100) {
        score += 10;
        factors.push("Resume could be more detailed");
    } else {
        factors.push("Resume is too brief");
    }

    // Skills factor
    if (skills.length >= 8) {
        score += 25;
        factors.push("Excellent skills diversity");
    } else if (skills.length >= 5) {
        score += 15;
        factors.push("Good skills coverage");
    } else if (skills.length >= 3) {
        score += 8;
        factors.push("Basic skills mentioned");
    } else {
        factors.push("Limited skills listed");
    }

    // Experience keywords
    const experienceKeywords = ['experience', 'years', 'worked', 'developed', 'managed', 'led', 'project'];
    const experienceMatches = experienceKeywords.filter(keyword => text.includes(keyword)).length;
    if (experienceMatches >= 4) {
        score += 20;
        factors.push("Strong experience indicators");
    } else if (experienceMatches >= 2) {
        score += 10;
        factors.push("Some experience mentioned");
    } else {
        factors.push("Experience details could be expanded");
    }

    // Education keywords
    const educationKeywords = ['bachelor', 'master', 'degree', 'university', 'college', 'certification', 'diploma'];
    const educationMatches = educationKeywords.filter(keyword => text.includes(keyword)).length;
    if (educationMatches >= 2) {
        score += 15;
        factors.push("Good education background");
    } else if (educationMatches >= 1) {
        score += 8;
        factors.push("Education mentioned");
    } else {
        factors.push("Consider adding education details");
    }

    // Technical skills
    const technicalSkills = ['python', 'java', 'javascript', 'sql', 'react', 'node', 'aws', 'docker', 'git', 'api', 'database'];
    const technicalMatches = technicalSkills.filter(skill => text.includes(skill)).length;
    if (technicalMatches >= 5) {
        score += 20;
        factors.push("Strong technical expertise");
    } else if (technicalMatches >= 3) {
        score += 12;
        factors.push("Good technical skills");
    } else if (technicalMatches >= 1) {
        score += 5;
        factors.push("Some technical skills");
    }

    // Contact information
    const hasContact = /[\w\.-]+@[\w\.-]+\.\w+|(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
    if (hasContact) {
        score += 5;
        factors.push("Contact information provided");
    } else {
        factors.push("Consider adding contact details");
    }

    // Achievements/Projects
    const achievementKeywords = ['achieved', 'improved', 'increased', 'developed', 'created', 'built', 'designed'];
    const achievementMatches = achievementKeywords.filter(keyword => text.includes(keyword)).length;
    if (achievementMatches >= 3) {
        score += 15;
        factors.push("Strong achievement focus");
    } else if (achievementMatches >= 1) {
        score += 8;
        factors.push("Some achievements mentioned");
    }

    return {
        score: Math.min(100, score),
        level: score >= 80 ? 'Excellent' : score >= 60 ? 'Strong' : score >= 40 ? 'Good' : score >= 20 ? 'Fair' : 'Needs Improvement',
        factors: factors
    };
}

async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function simulateProgress(finalScore, backendMs) {
    return new Promise((resolve) => {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        let percent = 0;
        // Backend now takes 500-1500ms, so scale frontend accordingly
        const totalDuration = Math.min(4000, Math.max(2000, 1500 + backendMs * 1.5));
        const intervalCount = 16;
        const intervalTime = Math.max(100, Math.floor(totalDuration / intervalCount));
        const increment = 100 / intervalCount;

        const interval = setInterval(() => {
            percent += increment;
            if (percent > 95) percent = 95;
            progressFill.style.width = `${percent}%`;
            progressText.textContent = `Running AI analysis... ${Math.round(percent)}%`;
            if (percent >= 95) {
                clearInterval(interval);
                setTimeout(() => {
                    progressFill.style.width = `${finalScore}%`;
                    progressText.textContent = `Analysis complete! Score ${finalScore}%`;
                    resolve();
                }, 800);
            }
        }, intervalTime);
    });
}

function showResults(analysis) {
    const resultsSection = document.getElementById('resultsSection');
    const matchCount = document.getElementById('matchCount');
    const detectedSkills = document.getElementById('detectedSkills');
    const scoreValue = document.querySelector('.score-value');

    if (analysis.error) {
        alert(analysis.error);
        return;
    }

    if (matchCount) matchCount.textContent = Math.round(analysis.apiResult.confidence * 100);
    if (scoreValue) scoreValue.textContent = `${analysis.score}%`;

    if (detectedSkills) {
        detectedSkills.innerHTML = analysis.skills
            .map(skill => `<span class="skill-chip">${skill}</span>`)
            .join('');
    }

    const apiResultMessage = document.getElementById('apiResultMessage');
    const analysisSummary = document.getElementById('analysisSummary');
    const rolePrediction = document.getElementById('rolePrediction');
    const analysisDuration = document.getElementById('analysisDuration');
    if (analysis.apiResult) {
        const resultText = analysis.apiResult.match
            ? 'The AI matcher predicts a strong fit for your selected role.'
            : 'The AI matcher recommends improving skills for a better fit.';
        if (apiResultMessage) apiResultMessage.textContent = `${resultText} Confidence: ${Math.round(analysis.apiResult.confidence * 100)}%`;
        
        // Show profile strength instead of generic message
        if (analysisSummary && analysis.profileStrength) {
            const strength = analysis.profileStrength;
            analysisSummary.innerHTML = `
                <strong>Profile Strength: ${strength.level} (${strength.score}%)</strong><br>
                <small style="color: #6b7280;">${strength.factors.slice(0, 2).join(' • ')}</small>
            `;
        }
        
        if (analysisDuration) {
            const runtimeMs = typeof analysis.apiResult.inference_ms === 'number' ? Math.max(1, analysis.apiResult.inference_ms) : 0;
            analysisDuration.textContent = `Backend runtime: ${runtimeMs} ms`;
        }
        
        // Display scoring breakdown
        const scoringBreakdownContainer = document.getElementById('scoringBreakdownContainer');
        const scoringBars = document.getElementById('scoringBars');
        if (scoringBreakdownContainer && scoringBars && analysis.apiResult.scoring_breakdown) {
            const breakdown = analysis.apiResult.scoring_breakdown;
            scoringBars.innerHTML = `
                <div class="scoring-item">
                    <div class="scoring-label">Keyword Match</div>
                    <div class="scoring-bar">
                        <div class="scoring-fill" style="width: ${breakdown.keyword_match * 100}%"></div>
                    </div>
                    <div class="scoring-value">${(breakdown.keyword_match * 100).toFixed(1)}%</div>
                </div>
                <div class="scoring-item">
                    <div class="scoring-label">Length Bonus</div>
                    <div class="scoring-bar">
                        <div class="scoring-fill" style="width: ${breakdown.length_bonus * 100}%"></div>
                    </div>
                    <div class="scoring-value">${(breakdown.length_bonus * 100).toFixed(1)}%</div>
                </div>
                <div class="scoring-item">
                    <div class="scoring-label">Skills Bonus</div>
                    <div class="scoring-bar">
                        <div class="scoring-fill" style="width: ${breakdown.skills_bonus * 100}%"></div>
                    </div>
                    <div class="scoring-value">${(breakdown.skills_bonus * 100).toFixed(1)}%</div>
                </div>
                <div class="scoring-item">
                    <div class="scoring-label">Experience Bonus</div>
                    <div class="scoring-bar">
                        <div class="scoring-fill" style="width: ${breakdown.experience_bonus * 100}%"></div>
                    </div>
                    <div class="scoring-value">${(breakdown.experience_bonus * 100).toFixed(1)}%</div>
                </div>
            `;
            scoringBreakdownContainer.style.display = 'block';
        }
        
        if (rolePrediction && analysis.apiResult.predicted_role) {
            rolePrediction.textContent = `Detected role: ${analysis.apiResult.predicted_role}`;
        } else if (rolePrediction && analysis.bestRole) {
            rolePrediction.textContent = `Best matched job: ${analysis.bestRole.title}`;
        }
    }

    // Display recommended jobs
    const recommendedJobsContainer = document.getElementById('recommendedJobsContainer');
    if (recommendedJobsContainer && analysis.recommendedJobs && analysis.recommendedJobs.length > 0) {
        const topJobs = analysis.recommendedJobs.slice(0, 3);
        let bestRoleText = '';
        if (analysis.bestRole) {
            bestRoleText = `<div style="text-align: center; margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; color: white;">
                <h4 style="margin: 0 0 0.5rem 0;"><i class="fas fa-star"></i> AI Recommendation</h4>
                <p style="margin: 0; font-size: 1.1rem; font-weight: 600;">${analysis.bestRole.title}</p>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">at ${analysis.bestRole.company}</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Match: ${Math.round(analysis.bestRole.confidence * 100)}%</p>
            </div>`;
        }

        const jobsHTML = bestRoleText + 
            topJobs.map(job => `
                <div class="recommended-job-card">
                    <div class="job-header">
                        <div class="job-title-info">
                            <h4>${job.title}</h4>
                            <p class="job-company">${job.company}</p>
                        </div>
                        <div class="job-match-badge">
                            <div class="match-percentage">${Math.round(job.confidence * 100)}%</div>
                            <div class="match-label">Match</div>
                        </div>
                    </div>
                    <div class="job-details">
                        <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                        <p><i class="fas fa-briefcase"></i> ${job.type}</p>
                        <p><i class="fas fa-money-bill-wave"></i> ${job.salary}</p>
                    </div>
                    <div class="job-tags">
                        ${job.tags.slice(0, 3).map(tag => `<span class="job-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        
        recommendedJobsContainer.innerHTML = jobsHTML;
        recommendedJobsContainer.style.display = 'block';
    } else if (recommendedJobsContainer) {
        // Show "no jobs available" message
        const noJobsMessage = `
            <div style="text-align: center; padding: 2rem; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; margin: 1rem 0;">
                <i class="fas fa-search" style="font-size: 3rem; color: #94a3b8; margin-bottom: 1rem;"></i>
                <h4 style="color: #475569; margin: 0 0 0.5rem 0;">No Matching Jobs Found</h4>
                <p style="color: #64748b; margin: 0; font-size: 0.95rem;">Sorry, we currently don't have job openings that match your profile. Try updating your resume or checking back later for new opportunities.</p>
            </div>
        `;
        recommendedJobsContainer.innerHTML = noJobsMessage;
        recommendedJobsContainer.style.display = 'block';
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
