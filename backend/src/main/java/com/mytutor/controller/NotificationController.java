package com.mytutor.controller;

import com.mytutor.model.Notification;
import com.mytutor.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getAllNotifications() {
        // Return sorted such that new ones are shown first
        return notificationRepository.findAll();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> readAll() {
        List<Notification> all = notificationRepository.findAll();
        for (Notification n : all) {
            n.setIsNew(false);
        }
        notificationRepository.saveAll(all);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> readOne(@PathVariable Long id) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setIsNew(false);
                    return ResponseEntity.ok(notificationRepository.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOne(@PathVariable Long id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAll() {
        notificationRepository.deleteAll();
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        if (notification.getIsNew() == null) {
            notification.setIsNew(true);
        }
        return notificationRepository.save(notification);
    }
}
