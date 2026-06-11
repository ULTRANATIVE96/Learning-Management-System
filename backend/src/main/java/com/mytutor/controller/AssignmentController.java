package com.mytutor.controller;

import com.mytutor.model.Assignment;
import com.mytutor.model.Notification;
import com.mytutor.repository.AssignmentRepository;
import com.mytutor.repository.NotificationRepository;
import com.mytutor.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private StudentProfileRepository profileRepository;
    @Autowired private NotificationRepository notificationRepository;

    @GetMapping
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadBrief(@PathVariable Long id) {
        return assignmentRepository.findById(id)
                .map(assignment -> {
                    byte[] briefContent = ("Assignment brief for " + assignment.getTitle() + "\nModule: " + assignment.getModule()).getBytes();
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + assignment.getTitle().replace(" ", "_") + "_brief.txt\"")
                            .contentType(MediaType.TEXT_PLAIN)
                            .body(briefContent);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<Assignment> uploadSubmission(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        return assignmentRepository.findById(id)
                .map(assignment -> {
                    try {
                        String oldStatus = assignment.getStatus();
                        
                        assignment.setSubmissionFileName(file.getOriginalFilename());
                        assignment.setSubmissionFileData(file.getBytes());
                        assignment.setStatus("Submitted");
                        Assignment saved = assignmentRepository.save(assignment);

                        // If it wasn't already submitted/graded, increment the profile count
                        if (!"Submitted".equals(oldStatus) && !"Graded".equals(oldStatus)) {
                            profileRepository.findById(1L).ifPresent(profile -> {
                                profile.setAssignmentsDone(profile.getAssignmentsDone() + 1);
                                profileRepository.save(profile);
                            });
                        }

                        // Create a notification
                        Notification notif = new Notification();
                        notif.setType("system");
                        notif.setTitle("Submission Successful");
                        notif.setDesc("Your file '" + file.getOriginalFilename() + "' was uploaded for " + assignment.getTitle() + ".");
                        notif.setTime("Just now");
                        notif.setIsNew(true);
                        notif.setColor("indigo");
                        notificationRepository.save(notif);

                        return ResponseEntity.ok(saved);
                    } catch (IOException e) {
                        return ResponseEntity.internalServerError().<Assignment>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
