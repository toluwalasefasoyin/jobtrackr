package com.jobtrackr.demo.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ScraperService {

    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    public List<Map<String, String>> scrapeJobs(String role, String location, String workType) {
        List<Map<String, String>> jobList = new ArrayList<>();
        
        // Scrape from multiple job boards
        jobList.addAll(scrapeRemoteOK(role, workType));
        jobList.addAll(scrapeWeWorkRemotely(role, workType));
        jobList.addAll(scrapeStackOverflow(role, workType));
        jobList.addAll(scrapeIndeed(role, location, workType));
        jobList.addAll(scrapeLinkedIn(role, location, workType));
        jobList.addAll(scrapeZipRecruiter(role, location, workType));

        return jobList;
    }

    private boolean matchesWorkType(String workType, String jobWorkType) {
        if (workType == null || workType.equalsIgnoreCase("ALL")) {
            return true;
        }
        return jobWorkType.replace(" ", "").equalsIgnoreCase(workType.replace(" ", ""));
    }

    private List<Map<String, String>> scrapeRemoteOK(String role, String workType) {
        List<Map<String, String>> jobList = new ArrayList<>();
        String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
        try {
            String url = "https://remoteok.com/remote-" + encodedRole + "-jobs";
            Document doc = Jsoup.connect(url).userAgent(USER_AGENT).get();
            Elements jobs = doc.select("tr.job");
            for (Element job : jobs) {
                String title = job.select("h2[itemprop=title]").text();
                String company = job.select("h3[itemprop=name]").text();
                String link = "https://remoteok.com" + job.attr("data-url");
                if (!title.isEmpty() && !company.isEmpty() && matchesWorkType(workType, "Remote")) {
                    jobList.add(createJobMap(title, company, link, "RemoteOK", "Remote", "Remote"));
                }
            }
        } catch (IOException e) {
            // Log issue
        }
        return jobList;
    }

    private List<Map<String, String>> scrapeWeWorkRemotely(String role, String workType) {
        List<Map<String, String>> jobList = new ArrayList<>();
        String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
        try {
            String url = "https://weworkremotely.com/search?term=" + encodedRole;
            Document doc = Jsoup.connect(url).userAgent(USER_AGENT).get();
            Elements jobs = doc.select("li.feature");
            for (Element job : jobs) {
                String title = job.select("a.listing-title").text();
                String company = job.select("span.company").text();
                String link = job.select("a.listing-title").attr("href");
                if (!title.isEmpty() && !company.isEmpty() && matchesWorkType(workType, "Remote")) {
                    jobList.add(createJobMap(title, company, link, "WeWorkRemotely", "Worldwide", "Remote"));
                }
            }
        } catch (IOException e) {
            // Log issue
        }
        return jobList;
    }

    private List<Map<String, String>> scrapeStackOverflow(String role, String workType) {
        List<Map<String, String>> jobList = new ArrayList<>();
        String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
        try {
            String url = "https://stackoverflow.com/jobs?q=" + encodedRole + "&r=true";
            Document doc = Jsoup.connect(url).userAgent(USER_AGENT).get();
            Elements jobs = doc.select("div.s-result-card");
            for (Element job : jobs) {
                String title = job.select("h2 a").text();
                String company = job.select("h3").text();
                String link = job.select("h2 a").attr("href");
                String jobType = job.select("span").text();
                String detectedType = jobType.contains("remote") ? "Remote" : jobType.contains("hybrid") ? "Hybrid" : "On-Site";
                if (!title.isEmpty() && !company.isEmpty() && matchesWorkType(workType, detectedType)) {
                    jobList.add(createJobMap(title, company, link, "Stack Overflow", detectedType, detectedType));
                }
            }
        } catch (IOException e) {
            // Log issue
        }
        return jobList;
    }

    private List<Map<String, String>> scrapeIndeed(String role, String location, String workType) {
        List<Map<String, String>> jobList = new ArrayList<>();
        String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
        String encodedLocation = URLEncoder.encode(location != null ? location : "", StandardCharsets.UTF_8);
        try {
            String url = "https://www.indeed.com/jobs?q=" + encodedRole + "&l=" + encodedLocation;
            Document doc = Jsoup.connect(url).userAgent(USER_AGENT).get();
            Elements jobs = doc.select("div.job_seen_beacon");
            for (Element job : jobs) {
                String title = job.select("h2 a").text();
                String company = job.select("span[data-testid=company-name]").text();
                String link = job.select("h2 a").attr("href");
                String detectedType = extractWorkTypeFromIndeed(job);
                if (!title.isEmpty() && !company.isEmpty() && matchesWorkType(workType, detectedType)) {
                    jobList.add(createJobMap(title, company, link, "Indeed", detectedType, detectedType));
                }
            }
        } catch (IOException e) {
            // Log issue
        }
        return jobList;
    }

    private String extractWorkTypeFromIndeed(Element job) {
        String jobText = job.text().toLowerCase();
        if (jobText.contains("remote")) return "Remote";
        if (jobText.contains("hybrid")) return "Hybrid";
        if (jobText.contains("on-site") || jobText.contains("on site")) return "On-Site";
        return "On-Site";
    }

    private List<Map<String, String>> scrapeLinkedIn(String role, String location, String workType) {
        List<Map<String, String>> jobList = new ArrayList<>();
        String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
        String encodedLocation = URLEncoder.encode(location != null ? location : "Worldwide", StandardCharsets.UTF_8);
        try {
            String url = "https://www.linkedin.com/jobs/search?keywords=" + encodedRole + "&location=" + encodedLocation;
            Document doc = Jsoup.connect(url).userAgent(USER_AGENT).get();
            Elements jobs = doc.select("ul.jobs-search__results-list li");
            for (Element job : jobs) {
                String title = job.select("h3.base-search-card__title").text();
                String company = job.select("h4.base-search-card__subtitle").text();
                String link = job.select("a.base-card__full-link").attr("href");
                String jobLocation = job.select("span.job-search-card__location").text();
                String detectedType = extractWorkTypeFromLinkedIn(job);
                if (!title.isEmpty() && !company.isEmpty() && matchesWorkType(workType, detectedType)) {
                    jobList.add(createJobMap(title, company, link, "LinkedIn", jobLocation, detectedType));
                }
            }
        } catch (IOException e) {
            // Log issue
        }
        return jobList;
    }

    private String extractWorkTypeFromLinkedIn(Element job) {
        String jobText = job.text().toLowerCase();
        if (jobText.contains("remote")) return "Remote";
        if (jobText.contains("hybrid")) return "Hybrid";
        if (jobText.contains("on-site") || jobText.contains("on site")) return "On-Site";
        return "On-Site";
    }

    private List<Map<String, String>> scrapeZipRecruiter(String role, String location, String workType) {
        List<Map<String, String>> jobList = new ArrayList<>();
        String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
        String encodedLocation = URLEncoder.encode(location != null ? location : "", StandardCharsets.UTF_8);
        try {
            String url = "https://www.ziprecruiter.com/Jobs/Search?search=" + encodedRole + "&location=" + encodedLocation;
            Document doc = Jsoup.connect(url).userAgent(USER_AGENT).get();
            Elements jobs = doc.select("article.job_result");
            for (Element job : jobs) {
                String title = job.select("h2.title").text();
                String company = job.select("a.company_name").text();
                String link = job.select("a.job_link").attr("href");
                String jobLocation = job.select("span.location").text();
                String detectedType = extractWorkTypeFromZipRecruiter(job);
                if (!title.isEmpty() && !company.isEmpty() && matchesWorkType(workType, detectedType)) {
                    jobList.add(createJobMap(title, company, link, "ZipRecruiter", jobLocation, detectedType));
                }
            }
        } catch (IOException e) {
            // Log issue
        }
        return jobList;
    }

    private String extractWorkTypeFromZipRecruiter(Element job) {
        String jobText = job.text().toLowerCase();
        if (jobText.contains("remote")) return "Remote";
        if (jobText.contains("hybrid")) return "Hybrid";
        if (jobText.contains("on-site") || jobText.contains("on site")) return "On-Site";
        return "On-Site";
    }

    private Map<String, String> createJobMap(String title, String company, String link, String source, String location, String workType) {
        Map<String, String> jobData = new HashMap<>();
        jobData.put("title", title.trim());
        jobData.put("company", company.trim());
        jobData.put("link", link.trim());
        jobData.put("source", source);
        jobData.put("location", location.trim());
        jobData.put("workType", workType);
        return jobData;
    }
}
