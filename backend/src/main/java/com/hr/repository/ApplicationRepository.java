package com.hr.repository;

import com.hr.model.Application;
import com.hr.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {
    List<Application> findByJobOrderByAppliedDateDesc(Job job);
    Page<Application> findAll(Pageable pageable);
    List<Application> findByStatus(Application.ApplicationStatus status);
}