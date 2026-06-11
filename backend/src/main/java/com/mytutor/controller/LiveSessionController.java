package com.mytutor.controller;

import com.mytutor.model.LiveSession;
import com.mytutor.model.Message;
import com.mytutor.repository.LiveSessionRepository;
import com.mytutor.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/live-classes")
public class LiveSessionController {

    @Autowired private LiveSessionRepository liveSessionRepository;
    @Autowired private MessageRepository messageRepository;

    @GetMapping
    public List<LiveSession> getAllSessions() {
        return liveSessionRepository.findAll();
    }

    @GetMapping("/{id}/chat-history")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable Long id) {
        return liveSessionRepository.findById(id)
                .map(session -> {
                    List<Message> history = messageRepository.findBySessionCodeOrderByTimestampAsc(session.getModule());
                    return ResponseEntity.ok(history);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<LiveSession> joinSession(@PathVariable Long id) {
        return liveSessionRepository.findById(id)
                .map(session -> {
                    session.setStudentCount(session.getStudentCount() + 1);
                    return ResponseEntity.ok(liveSessionRepository.save(session));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LiveSession createSession(@RequestBody LiveSession session) {
        if (session.getStudentCount() == null) {
            session.setStudentCount(0);
        }
        if (session.getStatus() == null) {
            session.setStatus("Live");
        }
        if (session.getTime() == null) {
            session.setTime("Now");
        }
        return liveSessionRepository.save(session);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable Long id) {
        return liveSessionRepository.findById(id)
                .map(session -> {
                    liveSessionRepository.delete(session);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
