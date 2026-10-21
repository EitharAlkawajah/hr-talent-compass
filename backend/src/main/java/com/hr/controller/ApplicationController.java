package com.hr.controller;

import com.hr.dto.ApplicationResponse;
import com.hr.model.Application;
import com.hr.model.Job;
import com.hr.service.ApplicationService;
import com.hr.service.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private static final Logger log = LoggerFactory.getLogger(ApplicationController.class);
    private final ApplicationService applicationService;
    private final JobService jobService;

    public ApplicationController(ApplicationService applicationService, JobService jobService) {
        this.applicationService = applicationService;
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> submitApplication(
            @RequestParam("jobId") String jobId,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam("resume") MultipartFile resume,
            @RequestParam(value = "coverLetter", required = false) String coverLetter) {

        log.info("Received application submission for jobId: {}, name: {}, email: {}", jobId, name, email);

        try {
            // Find the job
            Job job = jobService.getJobById(jobId);
            log.info("Found job: {}", job.getTitle());

            // Create application object
            Application application = new Application();
            application.setJob(job);
            application.setCandidateName(name);
            application.setCandidateEmail(email);
            application.setCandidatePhone(phone);
            application.setCoverLetter(coverLetter);

            // Submit (process resume, AI, save)
            Application saved = applicationService.submitApplication(application, resume);
            log.info("Application saved with id: {}", saved.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(ApplicationResponse.from(saved));

        } catch (Exception e) {
            log.error("Error submitting application: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to submit application: " + e.getMessage(), e);
        }
    }

    // … other methods remain the same (getApplicationsByJob, getAllApplications, updateStatus, getApplication, deleteApplication)
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJob(@PathVariable String jobId) {
        return ResponseEntity.ok(
                applicationService.getApplicationsByJob(jobId)
                        .stream()
                        .map(ApplicationResponse::from)
                        .toList()
        );
    }

    @GetMapping
    public ResponseEntity<Page<ApplicationResponse>> getAllApplications(Pageable pageable) {
        return ResponseEntity.ok(
                applicationService.getAllApplications(pageable)
                        .map(ApplicationResponse::from)
        );
    }

    @PatchMapping("/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable String applicationId,
            @RequestParam Application.ApplicationStatus status) {
        Application updated = applicationService.updateStatus(applicationId, status);
        return ResponseEntity.ok(ApplicationResponse.from(updated));
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplication(@PathVariable String applicationId) {
        return ResponseEntity.ok(ApplicationResponse.from(applicationService.getApplication(applicationId)));
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Void> deleteApplication(@PathVariable String applicationId) {
        applicationService.deleteApplication(applicationId);
        return ResponseEntity.noContent().build();
    }
}