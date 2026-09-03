package com.mytutor.repository;

import com.mytutor.model.StudentApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentApplicationRepository extends JpaRepository<StudentApplication, Long> {
    List<StudentApplication> findByStudentId(Long studentId);
    List<StudentApplication> findByCourseId(Long courseId);
}
