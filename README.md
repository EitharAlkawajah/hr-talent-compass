# 🧭 HR Talent Compass

**HR Talent Compass** is a full-stack, AI-powered Applicant Tracking System (ATS) designed to automate the hiring pipeline. It features a bilingual (English & Arabic) AI resume parser, a drag-and-drop Kanban board, and a modern, responsive dashboard.

## 🔗 Live Demo

🚀 **Website:** [https://hr-compass.netlify.app](https://hr-compass.netlify.app)
*(Note: Because this is hosted on free tiers, the backend and AI services may take up to 50 seconds to "wake up" on the first request. Subsequent requests are instant.)*

## ✨ Key Features

*   **🤖 AI-Powered Resume Parsing:** Automatically extracts skills, experience, degree, and major from uploaded PDF/DOCX resumes.
*   **🌍 Bilingual NLP Engine:** The AI scoring algorithm understands both English and Arabic resumes and job descriptions.
*   **📊 Smart Match Scoring:** Uses TF-IDF Vectorization and Cosine Similarity to score candidates against job requirements based on a weighted algorithm (Skills, Experience, Degree, Major).
*   **📌 Visual Kanban Board:** A drag-and-drop pipeline to move candidates seamlessly through stages (Applied, Screening, Interview, Hired, etc.).
*   **📱 Modern UI:** A responsive, glassmorphism design with Dark/Light mode toggling.

## 🏗️ Architecture

This project uses a **Microservices Architecture** split into three core services:

1.  **Frontend (React.js):** Deployed on **Netlify**. Handles the UI, state management, and API calls.
2.  **Backend API (Java Spring Boot):** Deployed on **Render**. Manages business logic, database transactions, and file uploads.
3.  **AI Microservice (Python/Flask):** Containerized with **Docker**, deployed on **Render**. Handles NLP processing using `spaCy` and `scikit-learn`.
4.  **Database (PostgreSQL):** Hosted on **Neon**. Stores jobs, candidates, and application records.

## 💻 Tech Stack

**Frontend:**
*   React.js
*   Material-UI (MUI)
*   Axios
*   React Router

**Backend:**
*   Java 17
*   Spring Boot (Web, Data JPA, Security)
*   Hibernate
*   Maven

**AI Microservice:**
*   Python 3.11
*   Flask
*   spaCy (NLP)
*   Scikit-learn (Machine Learning)
*   pdfplumber & python-docx (File Parsing)
*   Docker

**Database & DevOps:**
*   PostgreSQL (Neon)
*   Docker / Docker Hub
*   Render (Cloud Hosting)
*   Netlify (CDN)
*   Cron-job.org (Keep-alive pings)

## 🚀 How to Run Locally

To run this project on your own machine, you will need Java 17, Node.js, Python 3.11, and PostgreSQL installed.

**1. Start the Database (PostgreSQL):**
*   Create a database named `hr_talent`.
*   Update the `backend/src/main/resources/application.yml` with your DB credentials.

**2. Start the AI Service:**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python -m spacy download en_core_web_md
python app.py
