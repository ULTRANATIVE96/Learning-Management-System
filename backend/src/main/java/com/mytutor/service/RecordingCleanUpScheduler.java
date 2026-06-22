package com.mytutor.service;

import com.mytutor.model.VideoRecording;
import com.mytutor.repository.VideoRecordingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.logging.Logger;

@Service
public class RecordingCleanUpScheduler {

    private static final Logger LOGGER = Logger.getLogger(RecordingCleanUpScheduler.class.getName());

    @Autowired
    private VideoRecordingRepository videoRecordingRepository;

    // Run every day at midnight: "0 0 0 * * ?"
    @Scheduled(cron = "0 0 0 * * ?")
    public void cleanUpOldRecordings() {
        LocalDate thresholdDate = LocalDate.now().minusMonths(6);
        LOGGER.info("Starting daily cleanup scheduler for video recordings. Threshold date (6 months ago): " + thresholdDate);

        List<VideoRecording> oldRecordings = videoRecordingRepository.findByUploadDateBefore(thresholdDate);
        if (!oldRecordings.isEmpty()) {
            LOGGER.info("Found " + oldRecordings.size() + " recordings older than 6 months. Proceeding with deletion.");
            for (VideoRecording recording : oldRecordings) {
                LOGGER.info("Deleting expired video recording: ID=" + recording.getId() + ", Title='" + recording.getTitle() + "', UploadDate=" + recording.getUploadDate());
            }
            videoRecordingRepository.deleteAll(oldRecordings);
            LOGGER.info("Expired video recordings successfully deleted.");
        } else {
            LOGGER.info("No expired video recordings found.");
        }
    }
}
