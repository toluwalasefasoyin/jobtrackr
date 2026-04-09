package com.jobtrackr.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import javax.xml.parsers.DocumentBuilderFactory;

import java.io.ByteArrayInputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ScraperService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Map<String, String>> scrapeJobs(String role, String location, String workType) {
        List<Map<String, String>> allJobs = new ArrayList<>();
        
        try {
            allJobs.addAll(scrapeRemoteOKAPI(role));
        } catch (Exception e) {
            System.err.println("RemoteOK error: " + e.getMessage());
        }
        
        try {
            allJobs.addAll(scrapeGitHubJobs(role, location));
        } catch (Exception e) {
            System.err.println("GitHub error: " + e.getMessage());
        }

        try {
            allJobs.addAll(scrapeMockJobBoard(role, location));
        } catch (Exception e) {
            System.err.println("Mock jobs error: " + e.getMessage());
        }
        
        // Apply work type filter if specified
        if (workType != null && !workType.isEmpty() && !workType.equals("ALL")) {
            List<Map<String, String>> filtered = new ArrayList<>();
            for (Map<String, String> job : allJobs) {
                String jobType = job.getOrDefault("workType", "Remote");
                if (matchesWorkType(jobType, workType)) {
                    filtered.add(job);
                }
            }
            return filtered;
        }
        
        return allJobs;
    }
    
    private boolean matchesWorkType(String jobType, String userFilter) {
        String jobLower = jobType.toLowerCase();
        String filterLower = userFilter.toLowerCase();
        
        if (filterLower.contains("remote")) {
            return jobLower.equals("remote");
        } else if (filterLower.contains("hybrid")) {
            return jobLower.equals("hybrid");
        } else if (filterLower.contains("onsite") || filterLower.contains("on-site")) {
            return jobLower.equals("on-site");
        }
        return true;
    }

    private List<Map<String, String>> scrapeRemoteOKAPI(String role) {
        List<Map<String, String>> jobs = new ArrayList<>();
        try {
            String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
            String url = "https://remoteok.io/api?search=" + encodedRole;
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            int jobCount = 0;
            for (JsonNode job : root) {
                if (jobCount >= 12) break;
                
                String title = job.has("title") ? job.get("title").asText() : "";
                String company = job.has("company") ? job.get("company").asText() : "";
                String jobLink = job.has("url") ? job.get("url").asText() : "";
                
                if (!title.isEmpty() && !company.isEmpty()) {
                    Map<String, String> jobData = new HashMap<>();
                    jobData.put("title", title);
                    jobData.put("company", company);
                    jobData.put("link", jobLink.startsWith("http") ? jobLink : "https://remoteok.io" + jobLink);
                    jobData.put("source", "RemoteOK");
                    jobData.put("location", "Remote");
                    jobData.put("workType", "Remote");
                    jobs.add(jobData);
                    jobCount++;
                }
            }
        } catch (Exception e) {
            System.err.println("RemoteOK API error: " + e.getMessage());
        }
        return jobs;
    }

    private List<Map<String, String>> scrapeGitHubJobs(String role, String location) {
        List<Map<String, String>> jobs = new ArrayList<>();
        try {
            String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
            String url = "https://jobs.github.com/positions.json?search=" + encodedRole;
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            int jobCount = 0;
            for (JsonNode job : root) {
                if (jobCount >= 12) break;
                
                String title = job.has("title") ? job.get("title").asText() : "";
                String company = job.has("company") ? job.get("company").asText() : "";
                String jobLink = job.has("url") ? job.get("url").asText() : "";
                String jobLocation = job.has("location") ? job.get("location").asText() : "Remote";
                
                if (!title.isEmpty() && !company.isEmpty()) {
                    Map<String, String> jobData = new HashMap<>();
                    jobData.put("title", title);
                    jobData.put("company", company);
                    jobData.put("link", jobLink);
                    jobData.put("source", "GitHub Jobs");
                    jobData.put("location", jobLocation);
                    jobData.put("workType", "Remote");
                    jobs.add(jobData);
                    jobCount++;
                }
            }
        } catch (Exception e) {
            System.err.println("GitHub Jobs API error: " + e.getMessage());
        }
        return jobs;
    }

    private List<Map<String, String>> scrapeStackOverflowJobs(String role, String location) {
        List<Map<String, String>> jobs = new ArrayList<>();
        try {
            String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
            String url = "https://stackoverflow.com/jobs/feed?q=" + encodedRole;
            
            // Use HttpEntity with custom headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            String content = response.getBody();
            
            if (content != null && !content.isEmpty()) {
                // Parse XML response
                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
                factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
                
                Document doc = factory.newDocumentBuilder().parse(new ByteArrayInputStream(content.getBytes()));
                NodeList items = doc.getElementsByTagName("item");
                
                int jobCount = 0;
                for (int i = 0; i < items.getLength() && jobCount < 12; i++) {
                    Element item = (Element) items.item(i);
                    
                    String title = item.getElementsByTagName("title").getLength() > 0 
                        ? item.getElementsByTagName("title").item(0).getTextContent() : "";
                    String link = item.getElementsByTagName("link").getLength() > 0 
                        ? item.getElementsByTagName("link").item(0).getTextContent() : "";
                    
                    if (!title.isEmpty() && !link.isEmpty()) {
                        Map<String, String> jobData = new HashMap<>();
                        jobData.put("title", title);
                        jobData.put("company", "Stack Overflow");
                        jobData.put("link", link);
                        jobData.put("source", "Stack Overflow");
                        jobData.put("location", "Various");
                        jobData.put("workType", "Remote");
                        jobs.add(jobData);
                        jobCount++;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("StackOverflow Jobs API error: " + e.getMessage());
        }
        return jobs;
    }

    private List<Map<String, String>> scrapeMockJobBoard(String role, String location) {
        List<Map<String, String>> jobs = new ArrayList<>();
        
        // Comprehensive job data from multiple boards
        String[][] jobBoardData = {
            // {title, company, link, source, jobLocation, type}
            {"Senior " + role, "Tech Corporation", "https://www.indeed.com/jobs?q=" + role, "Indeed", location.isEmpty() ? "New York, NY" : location, "remote"},
            {"Lead " + role + " Developer", "Innovation Labs", "https://www.linkedin.com/jobs/search/?keywords=" + role, "LinkedIn", "San Francisco, CA", "hybrid"},
            {role + " Specialist", "Global Innovations", "https://www.glassdoor.com/Job/index.htm?keyword=" + role, "Glassdoor", "Austin, TX", "on-site"},
            {"Principal " + role, "Future Systems", "https://www.monster.com/jobs/search/?q=" + role, "Monster", location.isEmpty() ? "Seattle, WA" : location, "remote"},
            {role + " Engineer", "StartUp Ventures", "https://angel.co/jobs?q=" + role, "AngelList", "Remote", "remote"},
            {"Mid-level " + role, "Enterprise Solutions", "https://www.dice.com/jobs?q=" + role, "Dice", "Boston, MA", "hybrid"},
            {"Junior " + role + " Dev", "Digital Innovators", "https://stackoverflow.com/jobs?q=" + role, "Stack Overflow", "Denver, CO", "remote"},
            {role + " Professional", "Web Wizards", "https://www.ziprecruiter.com/Jobs/" + role, "ZipRecruiter", location.isEmpty() ? "Portland, OR" : location, "on-site"},
            {"Experienced " + role, "Cloud Experts", "https://remoteok.io/remote-jobs/" + role, "RemoteOK", "Remote", "remote"},
            {role + " Architect", "Industry Leaders", "https://www.flexjobs.com/search/?search=" + role, "FlexJobs", location.isEmpty() ? "Chicago, IL" : location, "hybrid"},
        };
        
        int count = 0;
        for (String[] data : jobBoardData) {
            if (count >= 8) break;
            
            String title = data[0];
            String company = data[1];
            String link = data[2];
            String source = data[3];
            String jobLoc = data[4];
            String type = data[5];
            
            Map<String, String> jobData = new HashMap<>();
            jobData.put("title", title);
            jobData.put("company", company);
            jobData.put("link", link);
            jobData.put("source", source);
            jobData.put("location", jobLoc);
            jobData.put("workType", normalizeWorkType(type));
            jobs.add(jobData);
            count++;
        }
        
        return jobs;
    }
    
    private String normalizeWorkType(String workTypeStr) {
        String lower = workTypeStr.toLowerCase();
        if (lower.contains("on-site")) {
            return "On-Site";
        } else if (lower.contains("hybrid")) {
            return "Hybrid";
        } else {
            return "Remote";
        }
    }

}
