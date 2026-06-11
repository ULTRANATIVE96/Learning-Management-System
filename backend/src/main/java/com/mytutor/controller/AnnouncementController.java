package com.mytutor.controller;

import com.mytutor.model.Announcement;
import com.mytutor.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findByOrderByIdDesc();
    }

    @GetMapping("/module/{moduleCode}")
    public List<Announcement> getAnnouncementsByModule(@PathVariable String moduleCode) {
        return announcementRepository.findByModuleCodeOrderByIdDesc(moduleCode);
    }

    @PostMapping
    public Announcement createAnnouncement(@RequestBody Announcement announcement) {
        if (announcement.getDate() == null || announcement.getDate().trim().isEmpty()) {
            announcement.setDate("Just now");
        }
        return announcementRepository.save(announcement);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        return announcementRepository.findById(id)
                .map(announcement -> {
                    announcementRepository.delete(announcement);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
