"""
Bilingual (English + Arabic) Resume Parser
"""

import re
import os
import spacy
import pdfplumber
from docx import Document

ARABIC_RANGE = re.compile(r'[\u0600-\u06FF]')


def is_arabic(text):
    return bool(ARABIC_RANGE.search(text))


class ResumeParser:

    # Bilingual skills dictionary: canonical -> list of aliases (EN + AR)
    SKILL_KEYWORDS = {
        'Python': ['python', 'بايثون'],
        'Java': ['java', 'جافا'],
        'JavaScript': ['javascript', 'js ', ' جافاسكريبت'],
        'TypeScript': ['typescript'],
        'C++': ['c++'],
        'C#': ['c#', 'c sharp', 'سي شارب'],
        'PHP': ['php'],
        'Ruby': ['ruby'],
        'Go': ['golang', ' go '],
        'Kotlin': ['kotlin'],
        'Swift': ['swift'],
        'SQL': ['sql', 'mysql', 'postgresql', 'oracle', 'sql server'],
        'HTML': ['html', 'html5'],
        'CSS': ['css', 'css3'],
        'React': ['react', 'رياكت'],
        'Angular': ['angular'],
        'Vue': ['vue'],
        'Django': ['django'],
        'Flask': ['flask'],
        'Spring Boot': ['spring boot', 'spring'],
        'ASP.NET': ['asp.net', '.net'],
        'Laravel': ['laravel'],
        'Node.js': ['node.js', 'nodejs'],
        'Express': ['express'],
        'Bootstrap': ['bootstrap'],
        'Tailwind': ['tailwind'],
        'AWS': ['aws', 'amazon web services'],
        'Azure': ['azure'],
        'GCP': ['gcp', 'google cloud'],
        'Docker': ['docker'],
        'Kubernetes': ['kubernetes', 'k8s'],
        'Jenkins': ['jenkins'],
        'Git': ['git', 'github', 'gitlab'],
        'Linux': ['linux', 'ubuntu'],
        'Machine Learning': ['machine learning', 'تعلم الآلة'],
        'Deep Learning': ['deep learning', 'تعلم عميق'],
        'NLP': ['nlp', 'natural language processing', 'معالجة اللغة'],
        'TensorFlow': ['tensorflow'],
        'PyTorch': ['pytorch'],
        'Pandas': ['pandas'],
        'NumPy': ['numpy'],
        'Data Analysis': ['data analysis', 'تحليل البيانات'],
        'Project Management': ['project management', 'إدارة المشاريع'],
        'Communication': ['communication', 'التواصل'],
        'Leadership': ['leadership', 'القيادة'],
        'Teamwork': ['teamwork', 'العمل الجماعي'],
        'Time Management': ['time management', 'إدارة الوقت'],
        'Microsoft Office': ['microsoft office', 'ms office'],
        'Excel': ['excel', 'إكسل'],
        'Word': ['word', 'وورد'],
    }

    DEGREE_KEYWORDS = {
        'doctorate': ['phd', 'ph.d', 'doctorate', 'doctor', 'دكتوراه', 'دكتور'],
        'master': ['master', 'masters', 'm.sc', 'msc', 'mba', 'ماجستير'],
        'bachelor': ['bachelor', 'b.sc', 'bsc', 'b.a', 'ba', 'بكالوريوس', 'بكلوريوس'],
        'diploma': ['diploma', 'دبلوم'],
        'high school': ['high school', 'secondary', 'ثانوية', 'ثانوي', 'الثانوية العامة'],
    }

    DEGREE_LEVELS = {
        'high school': 1,
        'diploma': 2,
        'bachelor': 3,
        'master': 4,
        'doctorate': 5,
    }

    MAJOR_KEYWORDS = {
        'Computer Science': ['computer science', 'علوم الحاسب', 'علوم الحاسوب'],
        'Information Technology': ['information technology', ' تقنية المعلومات', 'تكنولوجيا المعلومات'],
        'Software Engineering': ['software engineering', 'هندسة البرمجيات'],
        'Information Systems': ['information systems', 'نظم المعلومات'],
        'Business Administration': ['business administration', 'إدارة الأعمال'],
        'Accounting': ['accounting', 'محاسبة'],
        'Marketing': ['marketing', 'تسويق'],
        'Finance': ['finance', 'مالية', 'تمويل'],
        'Engineering': ['engineering', 'هندسة'],
        'Medicine': ['medicine', 'طب'],
        'Law': ['law', 'قانون'],
        'Education': ['education', 'تربية', 'تعليم'],
        'Graphic Design': ['graphic design', 'تصميم جرافيك', 'تصميم'],
        'English': ['english literature', 'english', 'الأدب الإنجليزي'],
        'Arabic': ['arabic', 'اللغة العربية'],
        'Mathematics': ['mathematics', 'math', 'رياضيات'],
        'Physics': ['physics', 'فيزياء'],
        'Chemistry': ['chemistry', 'كيمياء'],
        'Biology': ['biology', 'أحياء'],
    }

    def __init__(self, nlp):
        self.nlp = nlp

    def parse(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            text = self._extract_text_from_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            text = self._extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
        return self.parse_text(text)

    def _extract_text_from_pdf(self, file_path):
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
                text += "\n"
        return text

    def _extract_text_from_docx(self, file_path):
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])

    def parse_text(self, text):
        arabic = is_arabic(text)
        text_lower = text.lower()

        doc = None
        if not arabic and len(text) < 1000000:
            try:
                doc = self.nlp(text)
            except Exception as e:
                print(f"⚠️ spaCy failed: {e}")

        skills = self._extract_skills(text_lower)
        years_experience = self._extract_years_experience(text)
        education, degree, major = self._extract_education_and_degree(text_lower)
        current_company = self._extract_current_company(text, doc)
        summary = self._generate_summary(text)

        return {
            'text': text,
            'skills': skills,
            'years_experience': years_experience,
            'education': education,
            'degree': degree,
            'major': major,
            'current_company': current_company,
            'summary': summary,
        }

    def _extract_skills(self, text_lower):
        found = set()
        for canonical, aliases in self.SKILL_KEYWORDS.items():
            for alias in aliases:
                if alias.lower() in text_lower:
                    found.add(canonical)
                    break
        return sorted(found)

    def _extract_years_experience(self, text):
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)',
            r'(?:experience|exp)\s*(?:of)?\s*(\d+)\+?\s*(?:years?|yrs?)',
            r'(\d+)\+?\s*(?:سنوات|سنة)\s*(?:من)?\s*(?:الخبرة|خبرة)',
            r'(?:خبرة|الخبرة)\s*(?:من)?\s*(\d+)\+?\s*(?:سنوات|سنة)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except ValueError:
                    continue
        return None

    def _extract_education_and_degree(self, text_lower):
        # Find degree
        degree = None
        for level, keywords in self.DEGREE_KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    if degree is None or self.DEGREE_LEVELS[level] > self.DEGREE_LEVELS[degree]:
                        degree = level
                    break

        # Find major
        major = None
        for canonical, keywords in self.MAJOR_KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    major = canonical
                    break
            if major:
                break

        parts = []
        if degree:
            parts.append(degree.title())
        if major:
            parts.append(major)

        return (", ".join(parts) if parts else "Not specified", degree, major)

    def _extract_current_company(self, text, doc):
        patterns = [
            r'currently\s+working\s+(?:at|for)\s+([A-Z][a-zA-Z0-9\s&.]+)',
            r'experience\s+(?:at|for)\s+([A-Z][a-zA-Z0-9\s&.]+)',
            r'أعمل\s+حالياً\s+في\s+([^\n,،]+)',
            r'أعمل\s+في\s+([^\n,،]+)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                company = match.group(1).strip()
                if 2 < len(company) < 100:
                    return company

        if doc:
            for ent in doc.ents:
                if ent.label_ == "ORG":
                    context = text[max(0, ent.start_char - 30):min(len(text), ent.end_char + 30)]
                    if any(w in context.lower() for w in ['at', 'for', 'working', 'experience']):
                        return ent.text
        return None

    def _generate_summary(self, text):
        sentences = re.split(r'(?<=[.!?۔])\s+', text.strip())
        summary = " ".join(sentences[:4])
        return summary[:500] + "..." if len(summary) > 500 else summary