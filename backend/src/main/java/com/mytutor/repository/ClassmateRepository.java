package com.mytutor.repository;

import com.mytutor.model.Classmate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassmateRepository extends JpaRepository<Classmate, Long> {
}
