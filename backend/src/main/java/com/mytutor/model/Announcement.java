package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    @Column(length = 2000)
    private String content;
    private String date; // formatted date (e.g., "2 hours ago" or "Oct 25, 2024")
    private String moduleCode; // e.g. "MATH101"
    private String createdBy; // e.g. "Dr. Robert Smith"
}
