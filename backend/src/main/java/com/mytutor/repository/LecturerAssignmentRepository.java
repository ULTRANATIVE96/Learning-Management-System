package com.mytutor.repository;

import com.mytutor.model.LecturerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LecturerAssignmentRepository extends JpaRepository<LecturerAssignment, Long> {
    List<LecturerAssignment> findByLecturerId(Long lecturerId);
    List<LecturerAssignment> findByModuleId(Long moduleId);
}
