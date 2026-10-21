package com.hr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hr.dto.ResumeAnalysisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AIServiceClient {

    private final String aiServiceUrl;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIServiceClient(@Value("${spring.ai.service.url}") String aiServiceUrl,
                           RestTemplate restTemplate) {
        this.aiServiceUrl = aiServiceUrl;
        this.restTemplate = restTemplate;
    }

    public ResumeAnalysisResponse analyzeResume(MultipartFile file, String jobDescription,
                                                 String requiredSkills, String requiredDegree,
                                                 String requiredMajor) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("resume", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            body.add("job_description", jobDescription);
            body.add("required_skills", requiredSkills != null ? requiredSkills : "");
            body.add("required_degree", requiredDegree != null ? requiredDegree : "");
            body.add("required_major", requiredMajor != null ? requiredMajor : "");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceUrl + "/analyze",
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                ResumeAnalysisResponse result = new ResumeAnalysisResponse();
                result.setExtractedSkills(json.has("extracted_skills") && !json.get("extracted_skills").isNull()
                        ? json.get("extracted_skills").asText() : "");
                result.setMatchScore(json.has("match_score") && !json.get("match_score").isNull()
                        ? json.get("match_score").asDouble() : 0.0);
                result.setYearsOfExperience(json.has("years_of_experience") && !json.get("years_of_experience").isNull()
                        ? json.get("years_of_experience").asInt() : null);
                result.setEducation(json.has("education") && !json.get("education").isNull()
                        ? json.get("education").asText() : null);
                result.setCurrentCompany(json.has("current_company") && !json.get("current_company").isNull()
                        ? json.get("current_company").asText() : null);
                result.setCandidateDegree(json.has("candidate_degree") && !json.get("candidate_degree").isNull()
                        ? json.get("candidate_degree").asText() : null);
                result.setCandidateMajor(json.has("candidate_major") && !json.get("candidate_major").isNull()
                        ? json.get("candidate_major").asText() : null);
                result.setSummary(json.has("summary") && !json.get("summary").isNull()
                        ? json.get("summary").asText() : null);
                return result;
            }
        } catch (Exception e) {
            System.err.println("❌ Error calling AI service: " + e.getMessage());
            e.printStackTrace();
        }
        ResumeAnalysisResponse fallback = new ResumeAnalysisResponse();
        fallback.setExtractedSkills("");
        fallback.setMatchScore(0.0);
        return fallback;
    }
}