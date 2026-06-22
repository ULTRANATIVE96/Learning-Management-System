package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "video_recordings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoRecording {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String videoUrl;
    private LocalDate uploadDate;
    private String moduleCode; // e.g. "MATH101"
    private String duration; // e.g. "1 hr 15 mins"
    private String size; // e.g. "124 MB"
}
