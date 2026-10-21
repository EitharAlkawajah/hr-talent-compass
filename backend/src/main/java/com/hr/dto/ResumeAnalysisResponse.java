package com.hr.dto;

public class ResumeAnalysisResponse {
    private String extractedSkills;
    private Double matchScore;
    private Integer yearsOfExperience;
    private String education;
    private String currentCompany;
    private String candidateDegree;
    private String candidateMajor;
    private String summary;

    public ResumeAnalysisResponse() {}

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