package com.mytutor.controller;

import com.mytutor.model.Classmate;
import com.mytutor.repository.ClassmateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classlist")
public class ClassListController {

    @Autowired private ClassmateRepository classmateRepository;

    @GetMapping
    public List<Classmate> getClassList() {
        return classmateRepository.findAll();
    }

    @PostMapping("/communicate")
    public ResponseEntity<Map<String, String>> sendMessage(@RequestBody Map<String, Object> body) {
        String studentName = (String) body.get("studentName");
        String channel = (String) body.get("channel"); // email or chat
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Simulated " + channel + " sent to " + studentName + " successfully!");
        return ResponseEntity.ok(response);
    }
}
