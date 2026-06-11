package com.mytutor.repository;

import com.mytutor.model.VideoRecording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface VideoRecordingRepository extends JpaRepository<VideoRecording, Long> {
    List<VideoRecording> findByModuleCode(String moduleCode);
    List<VideoRecording> findByUploadDateBefore(LocalDate date);
}
