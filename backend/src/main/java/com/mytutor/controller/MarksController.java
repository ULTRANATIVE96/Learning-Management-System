package com.mytutor.controller;

import com.mytutor.model.Assessment;
import com.mytutor.model.Notification;
import com.mytutor.repository.AssessmentRepository;
import com.mytutor.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
public class MarksController {

    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private NotificationRepository notificationRepository;

    @GetMapping("/distribution")
    public List<Map<String, Object>> getGradeDistribution() {
        // Mocked or calculated distribution for modules
        // Math101: 85, Csc201: 72, Phy101: 64, Stats101: 48, Eng101: 92
        return List.of(
            createModuleMark("MATH101", 85, "Distinction"),
            createModuleMark("CSC201", 72, "Pass"),
            createModuleMark("PHY101", 64, "Pass"),
            createModuleMark("STATS101", 48, "Fail"),
            createModuleMark("ENG101", 92, "Distinction")
        );
    }

    private Map<String, Object> createModuleMark(String module, int mark, String status) {
        Map<String, Object> map = new HashMap<>();
        map.put("module", module);
        map.put("mark", mark);
        map.put("status", status);
        return map;
    }

    @GetMapping("/assessments")
    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    @PostMapping("/remark")
    public ResponseEntity<Map<String, String>> requestRemark(@RequestBody Map<String, Object> request) {
        String module = (String) request.get("module");
        String assessmentType = (String) request.get("assessmentType");
        
        if (module == null || assessmentType == null) {
            return ResponseEntity.badRequest().build();
        }

        // Add a notification for the requested remark
        Notification notif = new Notification();
        notif.setType("system");
        notif.setTitle("Remark Requested");
        notif.setDesc("You requested a remark for " + assessmentType + " in " + module + ". The lecturer will be notified.");
        notif.setTime("Just now");
        notif.setIsNew(true);
        notif.setColor("slate");
        notificationRepository.save(notif);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Remark request submitted successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/assessments/{id}")
    public ResponseEntity<Assessment> updateAssessment(@PathVariable Long id, @RequestBody Assessment updated) {
        return assessmentRepository.findById(id)
                .map(assessment -> {
                    assessment.setType(updated.getType());
                    assessment.setModule(updated.getModule());
                    assessment.setDate(updated.getDate());
                    assessment.setMark(updated.getMark());
                    assessment.setWeight(updated.getWeight());
                    
                    // Automatically determine status if not provided or to be consistent
                    if (updated.getMark() == null) {
                        assessment.setStatus("Pending");
                    } else if (updated.getMark() < 50) {
                        assessment.setStatus("Attention");
                    } else {
                        assessment.setStatus("Graded");
                    }
                    
                    if (updated.getTrend() != null) {
                        assessment.setTrend(updated.getTrend());
                    }
                    return ResponseEntity.ok(assessmentRepository.save(assessment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/assessments")
    public Assessment createAssessment(@RequestBody Assessment assessment) {
        if (assessment.getTrend() == null) {
            assessment.setTrend("none");
        }
        if (assessment.getMark() == null) {
            assessment.setStatus("Pending");
        } else if (assessment.getMark() < 50) {
            assessment.setStatus("Attention");
        } else {
            assessment.setStatus("Graded");
        }
        return assessmentRepository.save(assessment);
    }

    @DeleteMapping("/assessments/{id}")
    public ResponseEntity<?> deleteAssessment(@PathVariable Long id) {
        return assessmentRepository.findById(id)
                .map(assessment -> {
                    assessmentRepository.delete(assessment);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
