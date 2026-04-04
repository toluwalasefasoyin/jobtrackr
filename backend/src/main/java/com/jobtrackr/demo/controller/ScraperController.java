package com.jobtrackr.demo.controller;

import com.jobtrackr.demo.service.ScraperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class ScraperController {

    private final ScraperService scraperService;

    @GetMapping("/scrape")
    public ResponseEntity<List<Map<String, String>>> scrapeJobs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String role,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String workType) {
        
        List<Map<String, String>> jobs = scraperService.scrapeJobs(role, location, workType);
        return ResponseEntity.ok(jobs);
    }
}
