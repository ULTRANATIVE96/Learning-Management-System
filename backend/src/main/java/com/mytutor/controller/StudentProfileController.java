package com.mytutor.controller;

import com.mytutor.model.StudentProfile;
import com.mytutor.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class StudentProfileController {

    @Autowired
    private StudentProfileRepository profileRepository;

    @GetMapping
    public ResponseEntity<StudentProfile> getProfile(@RequestParam(required = false) String username) {
        if (username != null && !username.trim().isEmpty()) {
            return profileRepository.findByUsername(username)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> {
                        StudentProfile profile = new StudentProfile();
                        profile.setUsername(username);
                        profile.setName(username);
                        profile.setEmail(username + "@divine.edu");
                        profile.setPhone("+1 (555) 000-0000");
                        profile.setLocation("Not Set");
                        profile.setBio("A new student at Divine University.");
                        profile.setModulesEnrolled(0);
                        profile.setCreditsEarned(0);
                        profile.setAssignmentsDone(0);
                        return ResponseEntity.ok(profileRepository.save(profile));
                    });
        }
        return profileRepository.findById(1L)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<StudentProfile> updateProfile(@RequestParam(required = false) String username, @RequestBody StudentProfile updatedProfile) {
        java.util.Optional<StudentProfile> profileOpt = (username != null && !username.trim().isEmpty())
                ? profileRepository.findByUsername(username)
                : profileRepository.findById(1L);

        return profileOpt.map(profile -> {
                    profile.setName(updatedProfile.getName());
                    profile.setEmail(updatedProfile.getEmail());
                    profile.setPhone(updatedProfile.getPhone());
                    profile.setLocation(updatedProfile.getLocation());
                    profile.setBio(updatedProfile.getBio());
                    if (updatedProfile.getTags() != null) {
                        profile.setTags(updatedProfile.getTags());
                    }
                    if (updatedProfile.getModulesEnrolled() != null) {
                        profile.setModulesEnrolled(updatedProfile.getModulesEnrolled());
                    }
                    if (updatedProfile.getCreditsEarned() != null) {
                        profile.setCreditsEarned(updatedProfile.getCreditsEarned());
                    }
                    if (updatedProfile.getAssignmentsDone() != null) {
                        profile.setAssignmentsDone(updatedProfile.getAssignmentsDone());
                    }
                    return ResponseEntity.ok(profileRepository.save(profile));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
