"""
Job Scorer - Match resumes against job descriptions
Supports English + Arabic + Degree/Major matching
"""

import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class JobScorer:

    DEGREE_LEVELS = {
        'high school': 1, 'ثانوية': 1,
        'diploma': 2, 'دبلوم': 2,
        'bachelor': 3, 'بكالوريوس': 3, 'بكلوريوس': 3,
        'master': 4, 'ماجستير': 4,
        'doctorate': 5, 'phd': 5, 'دكتوراه': 5,
    }

    def __init__(self, nlp):
        self.nlp = nlp
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=1000,
            ngram_range=(1, 2)
        )

    def score(self, resume_text, job_description, required_skills,
              required_degree='', required_major=''):
        resume_clean = self._clean_text(resume_text)
        job_clean = self._clean_text(job_description)

        content_score = self._calculate_content_similarity(resume_clean, job_clean)
        skill_score = self._calculate_skill_match(resume_text, required_skills)
        experience_score = self._calculate_experience_match(resume_text, job_description)
        degree_score = self._calculate_degree_match(resume_text, required_degree)
        major_score = self._calculate_major_match(resume_text, required_major)

        weights = {
            'content': 0.25,
            'skills': 0.35,
            'experience': 0.15,
            'degree': 0.15,
            'major': 0.10,
        }

        match_score = (
            weights['content'] * content_score +
            weights['skills'] * skill_score +
            weights['experience'] * experience_score +
            weights['degree'] * degree_score +
            weights['major'] * major_score
        ) * 100

        return {
            'match_score': round(match_score, 1),
            'content_similarity': round(content_score * 100, 1),
            'skill_match': round(skill_score * 100, 1),
            'experience_match': round(experience_score * 100, 1),
            'degree_match': round(degree_score * 100, 1),
            'major_match': round(major_score * 100, 1),
        }

    def _clean_text(self, text):
        text = text.lower()
        text = re.sub(r'[^\w\s\u0600-\u06FF]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def _calculate_content_similarity(self, text1, text2):
        if not text1 or not text2:
            return 0.0
        try:
            vectors = self.vectorizer.fit_transform([text1, text2])
            similarity = cosine_similarity(vectors[0:1], vectors[1:2])
            return float(similarity[0][0])
        except Exception:
            return 0.0

    def _calculate_skill_match(self, resume_text, required_skills):
        if not required_skills:
            return 1.0
        resume_lower = resume_text.lower()
        matched = 0
        for skill in required_skills:
            skill_clean = skill.strip().lower()
            if skill_clean and skill_clean in resume_lower:
                matched += 1
        return matched / len(required_skills) if required_skills else 1.0

    def _calculate_experience_match(self, resume_text, job_description):
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience',
            r'experience\s*(?:of)?\s*(\d+)\+?\s*(?:years?|yrs?)',
            r'(\d+)\+?\s*(?:سنوات|سنة)\s*(?:من)?\s*(?:الخبرة|خبرة)',
        ]
        job_exp = self._extract_exp(job_description, patterns)
        resume_exp = self._extract_exp(resume_text, patterns)

        if job_exp is None or resume_exp is None:
            return 0.8
        if resume_exp >= job_exp:
            return 1.0
        return max(0.3, resume_exp / job_exp)

    def _extract_exp(self, text, patterns):
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except ValueError:
                    continue
        return None

    def _calculate_degree_match(self, resume_text, required_degree):
        if not required_degree:
            return 1.0
        req_level = self.DEGREE_LEVELS.get(required_degree.lower().strip())
        if req_level is None:
            # Maybe stored as HIGH_SCHOOL etc.
            normalized = required_degree.lower().replace('_', ' ')
            req_level = self.DEGREE_LEVELS.get(normalized)
            if req_level is None:
                return 1.0

        resume_lower = resume_text.lower()
        candidate_level = 0
        for name, lvl in self.DEGREE_LEVELS.items():
            if name in resume_lower and lvl > candidate_level:
                candidate_level = lvl

        if candidate_level == 0:
            return 0.4
        if candidate_level >= req_level:
            return 1.0
        return max(0.2, candidate_level / req_level)

    def _calculate_major_match(self, resume_text, required_major):
        if not required_major:
            return 1.0
        major_clean = required_major.lower().strip()
        resume_lower = resume_text.lower()
        if major_clean in resume_lower:
            return 1.0

        words = [w for w in major_clean.split() if len(w) > 3]
        if not words:
            return 0.5
        matches = sum(1 for w in words if w in resume_lower)
        return max(0.3, matches / len(words))