package com.mytutor.controller;

import com.mytutor.model.StudentApplication;
import com.mytutor.repository.StudentApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student-applications")
public class StudentApplicationController {

    @Autowired private StudentApplicationRepository applicationRepository;

    @GetMapping("/student/{studentId}")
    public List<StudentApplication> getByStudent(@PathVariable Long studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    @GetMapping("/course/{courseId}")
    public List<StudentApplication> getByCourse(@PathVariable Long courseId) {
        return applicationRepository.findByCourseId(courseId);
    }

    @PostMapping
    public ResponseEntity<StudentApplication> createApplication(@RequestBody StudentApplication application) {
        application.setStatus("PENDING");
        return ResponseEntity.ok(applicationRepository.save(application));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<StudentApplication> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        String feedback = body.get("feedback");
        
        return applicationRepository.findById(id).map(app -> {
            if (status != null) app.setStatus(status);
            if (feedback != null) app.setFeedback(feedback);
            return ResponseEntity.ok(applicationRepository.save(app));
        }).orElse(ResponseEntity.notFound().build());
    }
}
