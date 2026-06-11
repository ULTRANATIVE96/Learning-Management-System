package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "live_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String time;
    private String status; // Live, Upcoming, Scheduled
    private String module; // Module code, e.g. MATH101
    private Integer studentCount;
}
