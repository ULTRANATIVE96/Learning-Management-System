package com.mytutor.controller;

import com.mytutor.model.Course;
import com.mytutor.model.User;
import com.mytutor.repository.CourseRepository;
import com.mytutor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired private CourseRepository courseRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @GetMapping("/owner/{ownerUsername}")
    public List<Course> getCoursesByOwner(@PathVariable String ownerUsername) {
        return courseRepository.findByOwnerUsername(ownerUsername);
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        if (course.getOwner() == null || (course.getOwner().getId() == null && course.getOwner().getUsername() == null)) {
            return ResponseEntity.badRequest().build();
        }
        User owner = null;
        if (course.getOwner().getId() != null) {
            owner = userRepository.findById(course.getOwner().getId()).orElse(null);
        } else if (course.getOwner().getUsername() != null) {
            owner = userRepository.findByUsername(course.getOwner().getUsername()).orElse(null);
        }
        if (owner == null) return ResponseEntity.badRequest().build();
        
        course.setOwner(owner);
        return ResponseEntity.ok(courseRepository.save(course));
    }
}
