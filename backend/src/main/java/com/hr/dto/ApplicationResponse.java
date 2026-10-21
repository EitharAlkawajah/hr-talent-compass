package com.hr.dto;

import com.hr.model.Application;
import java.time.LocalDateTime;

public class ApplicationResponse {
    private String id;
    private String jobId;
    private String jobTitle;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String resumeFilePath;
    private String coverLetter;
    private LocalDateTime appliedDate;
    private String status;
    private String statusArabic;
    private String extractedSkills;
    private Double matchScore;
    private Integer yearsOfExperience;
    private String education;
    private String currentCompany;
    private String candidateDegree;
    private String candidateMajor;
    private String summary;

    public ApplicationResponse() {}

    public static ApplicationResponse from(Application app) {
        ApplicationResponse r = new ApplicationResponse();
        r.id = app.getId();
        r.jobId = app.getJob().getId();
        r.jobTitle = app.getJob().getTitle();
        r.candidateName = app.getCandidateName();
        r.candidateEmail = app.getCandidateEmail();
        r.candidatePhone = app.getCandidatePhone();
        r.resumeFilePath = app.getResumeFilePath();
        r.coverLetter = app.getCoverLetter();
        r.appliedDate = app.getAppliedDate();
        r.status = app.getStatus().name();
        r.statusArabic = app.getStatus().getArabicName();
        r.extractedSkills = app.getExtractedSkills();
        r.matchScore = app.getMatchScore();
        r.yearsOfExperience = app.getYearsOfExperience();
        r.education = app.getEducation();
        r.currentCompany = app.getCurrentCompany();
        r.candidateDegree = app.getCandidateDegree();
        r.candidateMajor = app.getCandidateMajor();
        r.summary = app.getSummary();
        return r;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getStatusArabic() { return statusArabic; }
    public void setStatusArabic(String statusArabic) { this.statusArabic = statusArabic; }
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