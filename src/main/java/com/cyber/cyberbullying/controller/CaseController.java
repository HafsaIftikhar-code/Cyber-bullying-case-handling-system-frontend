package com.cyber.cyberbullying.controller;

import com.cyber.cyberbullying.model.Report;
import com.cyber.cyberbullying.service.CaseManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class CaseController {

    @Autowired
    private CaseManager manager;

    // ✅ BACKEND TEST API
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend is running!");
    }

    // USER submit kare
    @PostMapping("/add")
    public ResponseEntity<String> add(@RequestBody Map<String, String> data) {
        try {
            manager.addReport(
                    data.get("name"),
                    data.get("platform"),
                    data.get("severity"),
                    data.get("description")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body("Report Added Successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error adding report: " + e.getMessage());
        }
    }

    // ADMIN Pull Next
    @GetMapping("/next")
    public ResponseEntity<?> next() {
        Report report = manager.getNextCase();
        if (report == null) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No reports available");
        }
        return ResponseEntity.ok(report);
    }

    // Get all reports
    @GetMapping("/reports")
    public ResponseEntity<List<Report>> getAllReports() {
        List<Report> reports = manager.getAllReports();
        return ResponseEntity.ok(reports);
    }

    // Get report by ID
    @GetMapping("/reports/{id}")
    public ResponseEntity<?> getReportById(@PathVariable int id) {
        Report report = manager.getReportById(id);
        if (report == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Report not found");
        }
        return ResponseEntity.ok(report);
    }

    // Delete report
    @DeleteMapping("/reports/{id}")
    public ResponseEntity<String> deleteReport(@PathVariable int id) {
        try {
            manager.deleteReport(id);
            return ResponseEntity.ok("Report deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error deleting report: " + e.getMessage());
        }
    }
}
