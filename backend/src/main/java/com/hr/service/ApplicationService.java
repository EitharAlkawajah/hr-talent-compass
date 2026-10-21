package com.hr.service;

import com.hr.dto.ResumeAnalysisResponse;
import com.hr.model.Application;
import com.hr.model.Job;
import com.hr.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final AIServiceClient aiServiceClient;
    private final JobService jobService;
    private final String uploadDir;

    public ApplicationService(ApplicationRepository applicationRepository,
                              AIServiceClient aiServiceClient,
                              JobService jobService,
                              @Value("${file.upload.dir}") String uploadDir) {
        this.applicationRepository = applicationRepository;
        this.aiServiceClient = aiServiceClient;
        this.jobService = jobService;
        this.uploadDir = uploadDir;
        try {
            Path dir = Paths.get(uploadDir);
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
                System.out.println("✅ Created upload directory: " + dir.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("❌ Failed to create upload directory: " + e.getMessage());
        }
    }

    @Transactional
    public Application submitApplication(Application application, MultipartFile resume) {
        try {
            // 🔥 FIX: Force the path to be an absolute path on the server
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = UUID.randomUUID() + "_" + resume.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            
            // Save the file
            resume.transferTo(filePath.toFile());
            application.setResumeFilePath(filePath.toString());

            Job job = application.getJob();
            String jobDescription = job.getDescription();
            String requiredSkills = String.join(", ", job.getRequiredSkills());
            String requiredDegree = job.getRequiredDegree();
            String requiredMajor = job.getRequiredMajor();

            System.out.println("📄 Sending resume to AI: job=" + job.getTitle() +
                    ", skills=" + requiredSkills +
                    ", degree=" + requiredDegree +
                    ", major=" + requiredMajor);

            ResumeAnalysisResponse analysis = aiServiceClient.analyzeResume(
                    resume, jobDescription, requiredSkills, requiredDegree, requiredMajor
            );

            System.out.println("✅ AI response: score=" + analysis.getMatchScore() +
                    ", skills=" + analysis.getExtractedSkills());

            application.setExtractedSkills(analysis.getExtractedSkills());
            application.setMatchScore(analysis.getMatchScore());
            application.setYearsOfExperience(analysis.getYearsOfExperience());
            application.setEducation(analysis.getEducation());
            application.setCurrentCompany(analysis.getCurrentCompany());
            application.setCandidateDegree(analysis.getCandidateDegree());
            application.setCandidateMajor(analysis.getCandidateMajor());
            application.setSummary(analysis.getSummary());

            if (analysis.getMatchScore() != null && analysis.getMatchScore() >= 80) {
                application.setStatus(Application.ApplicationStatus.SCREENING);
            }

            return applicationRepository.save(application);

        } catch (IOException e) {
            System.err.println("❌ Error saving resume file: " + e.getMessage());
            throw new RuntimeException("Failed to upload resume: " + e.getMessage(), e);
        }
    }

    public List<Application> getApplicationsByJob(String jobId) {
        Job job = jobService.getJobById(jobId);
        return applicationRepository.findByJobOrderByAppliedDateDesc(job);
    }

    public Page<Application> getAllApplications(Pageable pageable) {
        return applicationRepository.findAll(pageable);
    }

    @Transactional
    public Application updateStatus(String applicationId, Application.ApplicationStatus status) {
        Application app = getApplication(applicationId);
        app.setStatus(status);
        return applicationRepository.save(app);
    }

    public Application getApplication(String id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    @Transactional
    public void deleteApplication(String id) {
        Application app = getApplication(id);
        try {
            Files.deleteIfExists(Paths.get(app.getResumeFilePath()));
        } catch (IOException e) {
            System.err.println("Could not delete resume file: " + e.getMessage());
        }
        applicationRepository.delete(app);
    }
}