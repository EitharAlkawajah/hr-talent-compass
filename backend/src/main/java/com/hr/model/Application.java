package com.hr.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false)
    private String candidateName;

    @Column(nullable = false)
    private String candidateEmail;

    private String candidatePhone;

    @Column(nullable = false, length = 500)
    private String resumeFilePath;

    @Column(length = 500)
    private String coverLetter;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime appliedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(columnDefinition = "TEXT")
    private String extractedSkills;

    private Double matchScore;

    private Integer yearsOfExperience;

    @Column(length = 500)
    private String education;

    private String currentCompany;

    @Column(length = 200)
    private String candidateDegree;

    @Column(length = 200)
    private String candidateMajor;

    @Column(columnDefinition = "TEXT")
    private String summary;

    public Application() {}

    public enum ApplicationStatus {
        APPLIED("قيد الانتظار"),
        SCREENING("مراجعة"),
        INTERVIEW_SCHEDULED("مقابلة"),
        INTERVIEWED("تمت المقابلة"),
        OFFER_EXTENDED("تم إرسال العرض"),
        OFFER_ACCEPTED("تم القبول"),
        OFFER_DECLINED("تم الرفض"),
        REJECTED("مرفوض"),
        WITHDRAWN("انسحب");

        private final String arabicName;
        ApplicationStatus(String arabicName) { this.arabicName = arabicName; }
        public String getArabicName() { return arabicName; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getCandidatePhone() { return candidatePhone; }
    public void setCandidatePhone(String candidatePhone) { this.candidatePhone = candidatePhone; }

    public String getResumeFilePath() { return resumeFilePath; }
    public void setResumeFilePath(String resumeFilePath) { this.resumeFilePath = resumeFilePath; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public LocalDateTime getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDateTime appliedDate) { this.appliedDate = appliedDate; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(String extractedSkills) { this.extractedSkills = extractedSkills; }

    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }

    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }

    public String getCandidateDegree() { return candidateDegree; }
    public void setCandidateDegree(String candidateDegree) { this.candidateDegree = candidateDegree; }

    public String getCandidateMajor() { return candidateMajor; }
    public void setCandidateMajor(String candidateMajor) { this.candidateMajor = candidateMajor; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}