package com.mytutor.repository;

import com.mytutor.model.LiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiveSessionRepository extends JpaRepository<LiveSession, Long> {
}
