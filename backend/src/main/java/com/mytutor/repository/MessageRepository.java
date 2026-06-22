package com.mytutor.repository;

import com.mytutor.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySessionCodeOrderByTimestampAsc(String sessionCode);
}
