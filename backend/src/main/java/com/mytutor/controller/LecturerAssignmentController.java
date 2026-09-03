package com.mytutor.controller;

import com.mytutor.model.LecturerAssignment;
import com.mytutor.model.Module;
import com.mytutor.model.User;
import com.mytutor.repository.LecturerAssignmentRepository;
import com.mytutor.repository.ModuleRepository;
import com.mytutor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lecturer-assignments")
public class LecturerAssignmentController {

    @Autowired private LecturerAssignmentRepository assignmentRepository;
    @Autowired private ModuleRepository moduleRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping("/lecturer/{lecturerId}")
    public List<LecturerAssignment> getByLecturer(@PathVariable Long lecturerId) {
        return assignmentRepository.findByLecturerId(lecturerId);
    }

    @GetMapping("/module/{moduleId}")
    public List<LecturerAssignment> getByModule(@PathVariable Long moduleId) {
        return assignmentRepository.findByModuleId(moduleId);
    }

    @PostMapping
    public ResponseEntity<LecturerAssignment> createAssignment(@RequestBody LecturerAssignment assignment) {
        if (assignment.getLecturer() == null || assignment.getModule() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Find lecturer by unique identifier if passed as lecturerId
        User lecturer = null;
        if (assignment.getLecturer().getLecturerId() != null) {
            lecturer = userRepository.findByLecturerId(assignment.getLecturer().getLecturerId()).orElse(null);
        } else if (assignment.getLecturer().getId() != null) {
            lecturer = userRepository.findById(assignment.getLecturer().getId()).orElse(null);
        }

        Module module = moduleRepository.findById(assignment.getModule().getId()).orElse(null);

        if (lecturer == null || module == null) {
            return ResponseEntity.badRequest().build();
        }

        assignment.setLecturer(lecturer);
        assignment.setModule(module);
        assignment.setStatus("PENDING");
        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LecturerAssignment> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        if (status == null) return ResponseEntity.badRequest().build();

        return assignmentRepository.findById(id).map(assignment -> {
            assignment.setStatus(status);
            return ResponseEntity.ok(assignmentRepository.save(assignment));
        }).orElse(ResponseEntity.notFound().build());
    }
}
