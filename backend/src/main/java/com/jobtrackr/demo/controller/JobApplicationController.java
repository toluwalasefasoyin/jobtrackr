package com.jobtrackr.demo.controller;

import com.jobtrackr.demo.dto.JobApplicationRequest;
import com.jobtrackr.demo.model.JobApplication;
import com.jobtrackr.demo.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @GetMapping
    public ResponseEntity<List<JobApplication>> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobApplicationService.getAllApplications(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<JobApplication> create(@AuthenticationPrincipal UserDetails userDetails,
                                                  @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(jobApplicationService.createApplication(userDetails.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> update(@AuthenticationPrincipal UserDetails userDetails,
                                                  @PathVariable Long id,
                                                  @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(jobApplicationService.updateApplication(userDetails.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal UserDetails userDetails,
                                     @PathVariable Long id) {
        jobApplicationService.deleteApplication(userDetails.getUsername(), id);
        return ResponseEntity.ok().build();
    }
}