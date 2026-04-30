package com.cyber.cyberbullying.service;

import com.cyber.cyberbullying.model.Report;
import com.cyber.cyberbullying.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class CaseManager {

    @Autowired
    private ReportRepository reportRepository;

    private PriorityQueue<Report> priorityQueue = new PriorityQueue<>((a, b) -> {
        // Critical cases have higher priority
        if (a.getSeverity().equalsIgnoreCase("CRITICAL") && !b.getSeverity().equalsIgnoreCase("CRITICAL")) {
            return -1;
        }
        if (!a.getSeverity().equalsIgnoreCase("CRITICAL") && b.getSeverity().equalsIgnoreCase("CRITICAL")) {
            return 1;
        }
        return Integer.compare(a.getCaseId(), b.getCaseId());
    });
    private Queue<Report> normalQueue = new LinkedList<>();

    // USER form se yahan aata hai
    public void addReport(String name, String platform,
                          String severity, String description) {

        Report r = new Report();
        r.setName(name);
        r.setPlatform(platform);
        r.setSeverity(severity);
        r.setDescription(description);

        // Save to database
        Report savedReport = reportRepository.save(r);

        if (severity.equalsIgnoreCase("CRITICAL")) {
            priorityQueue.add(savedReport);
        } else {
            normalQueue.add(savedReport);
        }
    }

    // ADMIN ke liye
    public Report getNextCase() {
        if (!priorityQueue.isEmpty())
            return priorityQueue.poll();

        if (!normalQueue.isEmpty())
            return normalQueue.poll();

        return null;
    }

    // Get all reports
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    // Get report by ID
    public Report getReportById(int id) {
        return reportRepository.findById(id).orElse(null);
    }

    // Delete report
    public void deleteReport(int id) {
        reportRepository.deleteById(id);
    }
}
