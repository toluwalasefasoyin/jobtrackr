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

    public List<Map<String, String>> scrapeRemoteJobs(String role) {
        List<Map<String, String>> jobList = new ArrayList<>();
        try {
            String encodedRole = URLEncoder.encode(role, StandardCharsets.UTF_8);
            String url = "https://remoteok.com/remote-" + encodedRole + "-jobs";
            
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .get();

            Elements jobs = doc.select("tr.job");

            int count = 0;
            for (Element job : jobs) {
                if (count >= 15) break; // Limit results
                
                String title = job.select("h2[itemprop=title]").text();
                String company = job.select("h3[itemprop=name]").text();
                String link = "https://remoteok.com" + job.attr("data-url");
                
                if (!title.isEmpty() && !company.isEmpty()) {
                    Map<String, String> jobData = new HashMap<>();
                    jobData.put("title", title);
                    jobData.put("company", company);
                    jobData.put("link", link);
                    jobList.add(jobData);
                    count++;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            // Fallback mock data if scraping fails or is blocked
            Map<String, String> mock = new HashMap<>();
            mock.put("title", "Senior " + role + " Developer");
            mock.put("company", "Tech Flow Inc");
            mock.put("link", "#");
            jobList.add(mock);
        }
        return jobList;
    }
}
