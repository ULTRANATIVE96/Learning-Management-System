package com.mytutor.controller;

import com.mytutor.model.VideoRecording;
import com.mytutor.repository.VideoRecordingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/recordings")
public class VideoRecordingController {

    @Autowired
    private VideoRecordingRepository videoRecordingRepository;

    @Autowired
    private com.mytutor.service.RecordingCleanUpScheduler cleanUpScheduler;

    @GetMapping
    public List<VideoRecording> getAllRecordings() {
        return videoRecordingRepository.findAll();
    }

    @GetMapping("/module/{moduleCode}")
    public List<VideoRecording> getRecordingsByModule(@PathVariable String moduleCode) {
        return videoRecordingRepository.findByModuleCode(moduleCode);
    }

    @PostMapping
    public ResponseEntity<?> createRecording(@RequestBody VideoRecording recording) {
        if (recording.getUploadDate() == null) {
            recording.setUploadDate(LocalDate.now());
        }
        if (recording.getVideoUrl() == null || recording.getVideoUrl().trim().isEmpty()) {
            java.util.Map<String, String> errorMap = new java.util.HashMap<>();
            errorMap.put("error", "Video URL is required");
            return ResponseEntity.badRequest().body(errorMap);
        }
        VideoRecording saved = videoRecordingRepository.save(recording);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecording(@PathVariable Long id) {
        return videoRecordingRepository.findById(id)
                .map(recording -> {
                    videoRecordingRepository.delete(recording);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<VideoRecording> updateRecording(@PathVariable Long id, @RequestBody VideoRecording updatedRecording) {
        return videoRecordingRepository.findById(id)
                .map(recording -> {
                    recording.setTitle(updatedRecording.getTitle());
                    if (updatedRecording.getModuleCode() != null) {
                        recording.setModuleCode(updatedRecording.getModuleCode());
                    }
                    return ResponseEntity.ok(videoRecordingRepository.save(recording));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cleanup")
    public ResponseEntity<?> triggerCleanup() {
        cleanUpScheduler.cleanUpOldRecordings();
        return ResponseEntity.ok().body("{\"message\": \"Cleanup triggered successfully\"}");
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            java.util.Map<String, String> errorMap = new java.util.HashMap<>();
            errorMap.put("error", "File is empty");
            return ResponseEntity.badRequest().body(errorMap);
        }
        try {
            String uploadsDir = "uploads/";
            File dir = new File(uploadsDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = ".mp4";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(uploadsDir + filename);

            Files.write(filePath, file.getBytes());

            // Return the access URL path
            String videoUrl = "/uploads/" + filename;
            java.util.Map<String, String> responseMap = new java.util.HashMap<>();
            responseMap.put("videoUrl", videoUrl);
            return ResponseEntity.ok().body(responseMap);
        } catch (IOException e) {
            java.util.Map<String, String> errorMap = new java.util.HashMap<>();
            errorMap.put("error", "Failed to upload video: " + e.getMessage());
            return ResponseEntity.status(500).body(errorMap);
        }
    }
}
