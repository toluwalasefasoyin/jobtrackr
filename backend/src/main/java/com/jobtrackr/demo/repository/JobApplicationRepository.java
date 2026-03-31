package com.jobtrackr.demo.repository;

import com.jobtrackr.demo.model.JobApplication;
import com.jobtrackr.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUser(User user);
    Optional<JobApplication> findByIdAndUser(Long id, User user);
}