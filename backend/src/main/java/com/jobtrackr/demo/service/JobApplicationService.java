package com.jobtrackr.demo.service;

import com.jobtrackr.demo.dto.JobApplicationRequest;
import com.jobtrackr.demo.model.JobApplication;
import com.jobtrackr.demo.model.User;
import com.jobtrackr.demo.repository.JobApplicationRepository;
import com.jobtrackr.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public List<JobApplication> getAllApplications(String username) {
        return jobApplicationRepository.findByUser(getUser(username));
    }

    public JobApplication createApplication(String username, JobApplicationRequest request) {
        User user = getUser(username);
        JobApplication app = new JobApplication();
        app.setCompany(request.getCompany());
        app.setRole(request.getRole());
        app.setStatus(JobApplication.Status.valueOf(request.getStatus()));
        app.setDateApplied(request.getDateApplied());
        app.setNotes(request.getNotes());
        app.setJobLink(request.getJobLink());
        app.setUser(user);
        return jobApplicationRepository.save(app);
    }

    public JobApplication updateApplication(String username, Long id, JobApplicationRequest request) {
        User user = getUser(username);
        JobApplication app = jobApplicationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setCompany(request.getCompany());
        app.setRole(request.getRole());
        app.setStatus(JobApplication.Status.valueOf(request.getStatus()));
        app.setDateApplied(request.getDateApplied());
        app.setNotes(request.getNotes());
        app.setJobLink(request.getJobLink());
        return jobApplicationRepository.save(app);
    }

    public void deleteApplication(String username, Long id) {
        User user = getUser(username);
        JobApplication app = jobApplicationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        jobApplicationRepository.delete(app);
    }
}