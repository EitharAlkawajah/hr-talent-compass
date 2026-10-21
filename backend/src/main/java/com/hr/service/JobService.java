package com.hr.service;

import com.hr.model.Job;
import com.hr.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class JobService {

    private static final Logger log = LoggerFactory.getLogger(JobService.class);
    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Job createJob(Job job) {
        // Set required fields before saving
        job.setPostedDate(LocalDateTime.now());
        job.setActive(true);
        // 🔥 FIX: Set a default value for posted_by (required by database)
        job.setPostedBy("admin");   // <-- This fixes the "null value in column" error

        try {
            return jobRepository.save(job);
        } catch (Exception e) {
            log.error("Failed to create job: {}", e.getMessage(), e);
            throw new RuntimeException("Error saving job: " + e.getMessage(), e);
        }
    }

    public Page<Job> getAllJobs(Pageable pageable) {
        return jobRepository.findAll(pageable);
    }

    public Job getJobById(String id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    @Transactional
    public Job updateJob(String id, Job jobDetails) {
        Job existing = getJobById(id);
        existing.setTitle(jobDetails.getTitle());
        existing.setDescription(jobDetails.getDescription());
        existing.setDepartment(jobDetails.getDepartment());
        existing.setLocation(jobDetails.getLocation());
        existing.setEmploymentType(jobDetails.getEmploymentType());
        existing.setRequiredSkills(jobDetails.getRequiredSkills());
        existing.setExperienceLevel(jobDetails.getExperienceLevel());
        existing.setMinSalary(jobDetails.getMinSalary());
        existing.setMaxSalary(jobDetails.getMaxSalary());
        existing.setActive(jobDetails.getActive() != null ? jobDetails.getActive() : true);
        // We do NOT update postedBy here – it remains the original value

        try {
            return jobRepository.save(existing);
        } catch (Exception e) {
            log.error("Failed to update job {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error updating job: " + e.getMessage(), e);
        }
    }

    public void deleteJob(String id) {
        Job job = getJobById(id);
        try {
            jobRepository.delete(job);
            log.info("Deleted job with id: {}", id);
        } catch (Exception e) {
            log.error("Failed to delete job {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error deleting job: " + e.getMessage(), e);
        }
    }
}