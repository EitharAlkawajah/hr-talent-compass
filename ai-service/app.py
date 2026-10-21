"""
HR Talent Compass - AI Microservice
Bilingual (English + Arabic) Resume Parser & Scoring Engine
"""

import os
import traceback
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from resume_parser import ResumeParser
from scorer import JobScorer

app = Flask(__name__)
CORS(app)

# Load English spaCy model
try:
    nlp = spacy.load("en_core_web_md")
except OSError:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_md"])
    nlp = spacy.load("en_core_web_md")

resume_parser = ResumeParser(nlp)
job_scorer = JobScorer(nlp)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "resume-analyzer"})


@app.route("/analyze", methods=["POST"])
def analyze_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({"error": "No resume file provided"}), 400

        file = request.files['resume']
        job_description = request.form.get('job_description', '')
        required_skills = request.form.get('required_skills', '')
        required_degree = request.form.get('required_degree', '')
        required_major = request.form.get('required_major', '')

        print(f"📄 Received file: {file.filename}")
        print(f"🎯 Required degree: {required_degree}, major: {required_major}")

        if not job_description:
            return jsonify({"error": "Job description is required"}), 400

        with tempfile.NamedTemporaryFile(delete=False,
                                         suffix=os.path.splitext(file.filename)[1]) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name

        try:
            # Parse resume (auto-detects Arabic vs English)
            parsed_data = resume_parser.parse(tmp_path)
            print(f"✅ Parsed: degree={parsed_data.get('degree')}, major={parsed_data.get('major')}")
            print(f"   skills={parsed_data['skills'][:5]}...")

            # Score against job
            score_result = job_scorer.score(
                parsed_data['text'],
                job_description,
                [s.strip() for s in required_skills.split(',') if s.strip()],
                required_degree,
                required_major
            )

            print(f"🎯 Score: {score_result['match_score']}%")

            response = {
                "extracted_skills": ", ".join(parsed_data['skills']),
                "match_score": score_result['match_score'],
                "years_of_experience": parsed_data['years_experience'],
                "education": parsed_data['education'],
                "current_company": parsed_data['current_company'],
                "candidate_degree": parsed_data.get('degree'),
                "candidate_major": parsed_data.get('major'),
                "summary": parsed_data['summary']
            }
            return jsonify(response)

        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)