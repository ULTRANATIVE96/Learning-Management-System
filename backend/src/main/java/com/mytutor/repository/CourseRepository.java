package com.mytutor.repository;

import com.mytutor.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByOwnerId(Long ownerId);
    List<Course> findByOwnerUsername(String username);
}
