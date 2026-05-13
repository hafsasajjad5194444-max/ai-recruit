import os
import re
import time
import json
import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
import docx

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ANALYSIS_DB = os.path.join(os.path.dirname(__file__), 'analysis_results.json')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize analysis database
if not os.path.exists(ANALYSIS_DB):
    with open(ANALYSIS_DB, 'w') as f:
        json.dump({}, f)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "matcher": "rule-based"})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file):
    try:
        file.seek(0)
        reader = PdfReader(file)
        text = ''
        for page in reader.pages:
            page_text = page.extract_text() or ''
            text += page_text + '\n'
        return text.strip()
    except Exception:
        return ''

def extract_text_from_docx(file):
    try:
        file.seek(0)
        document = docx.Document(file)
        return '\n'.join([para.text for para in document.paragraphs]).strip()
    except Exception:
        return ''

def extract_text_from_file(file):
    filename = file.filename.lower()
    if filename.endswith('.pdf'):
        return extract_text_from_pdf(file)
    if filename.endswith('.docx') or filename.endswith('.doc'):
        return extract_text_from_docx(file)
    return ''

def normalize_text(text):
    return re.sub(r'[^a-z0-9\s]', ' ', text.lower())

def extract_keywords(text, min_len=3):
    return {word for word in normalize_text(text).split() if len(word) >= min_len}

def get_analysis_hash(resume_text, job_description):
    """Generate consistent hash for caching analysis results"""
    content = f"{resume_text.strip()}|{job_description.strip()}"
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def load_analysis_db():
    """Load analysis results from JSON file"""
    try:
        with open(ANALYSIS_DB, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_analysis_db(db):
    """Save analysis results to JSON file"""
    try:
        with open(ANALYSIS_DB, 'w') as f:
            json.dump(db, f, indent=2)
    except Exception as e:
        print(f"Error saving analysis DB: {e}")

def get_cached_analysis(resume_text, job_description):
    """Check if analysis result is cached"""
    analysis_hash = get_analysis_hash(resume_text, job_description)
    db = load_analysis_db()
    return db.get(analysis_hash)

def get_recommendation_hash(resume_text, jobs):
    """Generate hash for job recommendations caching"""
    jobs_str = json.dumps(jobs, sort_keys=True)
    content = f"{resume_text.strip()}|{jobs_str}"
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def get_cached_recommendations(resume_text, jobs):
    """Check if recommendations are cached"""
    rec_hash = get_recommendation_hash(resume_text, jobs)
    db = load_analysis_db()
    return db.get(f"rec_{rec_hash}")

def cache_analysis_result(resume_text, job_description, result):
    """Cache analysis result"""
    analysis_hash = get_analysis_hash(resume_text, job_description)
    db = load_analysis_db()
    db[analysis_hash] = {
        'resume_text': resume_text,
        'job_description': job_description,
        'result': result,
        'timestamp': time.time()
    }
    save_analysis_db(db)

def cache_recommendations(resume_text, jobs, result):
    """Cache recommendations result"""
    rec_hash = get_recommendation_hash(resume_text, jobs)
    db = load_analysis_db()
    db[f"rec_{rec_hash}"] = {
        'resume_text': resume_text,
        'jobs': jobs,
        'result': result,
        'timestamp': time.time()
    }
    save_analysis_db(db)

ROLE_KEYWORDS = {
    'Data Analyst': ['data', 'analysis', 'sql', 'excel', 'reporting', 'tableau', 'dashboard', 'analytics'],
    'Software Engineer': ['software', 'engineer', 'developer', 'javascript', 'python', 'java', 'c++', 'react', 'node', 'backend', 'frontend', 'api', 'django', 'flask', 'git'],
    'HR Manager': ['hr', 'recruitment', 'talent', 'employee', 'relations', 'policy', 'training', 'hiring'],
    'Marketing Manager': ['marketing', 'seo', 'campaign', 'brand', 'content', 'social', 'advertising', 'growth'],
    'Product Manager': ['product', 'roadmap', 'stakeholder', 'strategy', 'launch', 'requirements', 'metrics'],
    'Designer': ['design', 'ux', 'ui', 'figma', 'adobe', 'sketch', 'prototype', 'wireframe'],
    'DevOps Engineer': ['devops', 'aws', 'azure', 'docker', 'kubernetes', 'ci', 'cd', 'cloud', 'infrastructure', 'terraform']
}

def infer_role(text):
    resume_keywords = extract_keywords(text)
    best_role = 'General'
    best_score = 0
    for role, keywords in ROLE_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in resume_keywords)
        if score > best_score:
            best_score = score
            best_role = role
    return best_role

def run_prediction(resume_text, job_description):
    start = time.perf_counter()
    resume_text = resume_text or ''
    job_description = job_description or ''

    # Check cache first
    cached_result = get_cached_analysis(resume_text, job_description)
    if cached_result:
        # Return cached result but update inference time
        result = cached_result['result'].copy()
        result['inference_ms'] = max(5, int((time.perf_counter() - start) * 1000))
        # Ensure scoring_breakdown is included in cached results
        if 'scoring_breakdown' not in result:
            result['scoring_breakdown'] = {
                'keyword_match': round(result.get('confidence', 0) * 0.6, 3),
                'length_bonus': 0.0,
                'skills_bonus': 0.0,
                'experience_bonus': 0.0
            }
        return result

    predicted_role = infer_role(resume_text)
    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description)

    if not job_keywords:
        job_keywords = {'general', 'job', 'application'}

    matched_keywords = {word for word in job_keywords if word in resume_keywords}
    match_ratio = len(matched_keywords) / max(len(job_keywords), 1)

    # Enhanced scoring algorithm
    base_score = match_ratio * 0.6  # Keyword matching (60% weight)

    # Length bonus (resume should be substantial)
    resume_length = len(resume_text.split())
    length_bonus = min(0.15, (resume_length / 300) * 0.15)  # Up to 15% for detailed resumes

    # Skills diversity bonus
    technical_skills = ['python', 'java', 'javascript', 'sql', 'react', 'node', 'aws', 'docker', 'git', 'api', 'database', 'html', 'css', 'php', 'c++', 'c#', 'ruby', 'go', 'kubernetes', 'terraform']
    soft_skills = ['communication', 'leadership', 'teamwork', 'problem', 'solving', 'management', 'agile', 'scrum']
    experience_keywords = ['experience', 'years', 'developed', 'managed', 'led', 'created', 'built', 'designed']

    technical_count = sum(1 for skill in technical_skills if skill in resume_keywords)
    soft_count = sum(1 for skill in soft_skills if skill in resume_keywords)
    experience_count = sum(1 for exp in experience_keywords if exp in resume_keywords)

    skills_bonus = min(0.15, (technical_count * 0.02) + (soft_count * 0.01))  # Up to 15% for skills
    experience_bonus = min(0.1, experience_count * 0.02)  # Up to 10% for experience indicators

    confidence = round(base_score + length_bonus + skills_bonus + experience_bonus, 4)
    confidence = max(0.05, min(confidence, 1.0))  # Allow up to 100% confidence
    label = 1 if confidence >= 0.5 else 0

    # Add artificial processing time to make it feel more realistic (500-1500ms)
    processing_time = 0.5 + (len(resume_text) / 10000) + (len(job_description) / 5000)
    time.sleep(min(1.5, processing_time))

    inference_ms = max(5, int((time.perf_counter() - start) * 1000))

    result = {
        "match": label == 1,
        "label": label,
        "confidence": confidence,
        "matched_keywords": sorted(list(matched_keywords)),
        "job_keywords": sorted(list(job_keywords)),
        "predicted_role": predicted_role,
        "inference_ms": inference_ms,
        "scoring_breakdown": {
            "keyword_match": round(base_score, 3),
            "length_bonus": round(length_bonus, 3),
            "skills_bonus": round(skills_bonus, 3),
            "experience_bonus": round(experience_bonus, 3)
        }
    }

    # Cache the result
    cache_analysis_result(resume_text, job_description, result)

    return result

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    resume_text = data.get("resume_text", "").strip()
    job_description = data.get("job_description", "").strip()

    if not resume_text or not job_description:
        return jsonify({"error": "Both resume_text and job_description are required"}), 400

    return jsonify(run_prediction(resume_text, job_description))

@app.route("/upload_resume", methods=["POST"])
def upload_resume():
    if 'resume_file' not in request.files:
        return jsonify({"error": "No resume_file provided"}), 400

    resume_file = request.files['resume_file']
    if resume_file.filename == '' or not allowed_file(resume_file.filename):
        return jsonify({"error": "Invalid resume file"}), 400

    full_name = request.form.get('full_name', '').strip()
    email = request.form.get('email', '').strip()
    phone = request.form.get('phone', '').strip()
    desired_role = request.form.get('desired_role', '').strip()
    cover_letter = request.form.get('cover_letter', '').strip()
    job_description = request.form.get('job_description', '').strip() or 'general job application'

    resume_text = extract_text_from_file(resume_file)
    if not resume_text:
        resume_text = f"{full_name} {cover_letter} {resume_file.filename}"

    resume_file.seek(0)
    filename = secure_filename(resume_file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    resume_file.save(save_path)

    prediction = run_prediction(resume_text, job_description)
    return jsonify({
        "match": prediction["match"],
        "label": prediction["label"],
        "confidence": prediction["confidence"],
        "matched_keywords": prediction["matched_keywords"],
        "predicted_role": prediction["predicted_role"],
        "job_description": job_description,
        "inference_ms": prediction["inference_ms"],
        "saved_file": filename,
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "desired_role": desired_role
    })

@app.route("/recommend_jobs", methods=["POST"])
def recommend_jobs():
    """
    Recommend jobs based on resume text.
    Expected JSON: {
        "resume_text": "...",
        "jobs": [
            {"id": 1, "title": "...", "description": "...", "tags": [...]},
            ...
        ]
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    resume_text = data.get("resume_text", "").strip()
    jobs = data.get("jobs", [])

    if not resume_text or not jobs:
        return jsonify({"error": "Both resume_text and jobs array are required"}), 400

    # Check cache first
    cached_result = get_cached_recommendations(resume_text, jobs)
    if cached_result:
        return jsonify(cached_result['result'])

    # Score each job
    job_scores = []
    for job in jobs:
        job_desc = f"{job.get('title', '')} {job.get('description', '')} {' '.join(job.get('tags', []))}"
        prediction = run_prediction(resume_text, job_desc)
        
        job_scores.append({
            "id": job.get("id"),
            "title": job.get("title"),
            "company": job.get("company"),
            "location": job.get("location"),
            "salary": job.get("salary"),
            "type": job.get("type"),
            "category": job.get("category"),
            "description": job.get("description"),
            "tags": job.get("tags", []),
            "confidence": prediction["confidence"],
            "match": prediction["match"],
            "matched_keywords": prediction["matched_keywords"],
        })

    # Sort by confidence score (descending)
    job_scores.sort(key=lambda x: x["confidence"], reverse=True)

    result = {
        "recommended_jobs": job_scores,
        "total_jobs": len(job_scores),
        "top_match": job_scores[0] if job_scores else None,
        "predicted_role": infer_role(resume_text)
    }

    # Cache the result
    cache_recommendations(resume_text, jobs, result)

    return jsonify(result)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
