package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String module; // Module code, e.g. MATH101
    private String dueDate;
    private String status; // Pending, Submitted, Late, Graded
    private String priority; // high, medium, low
    private String weight; // e.g. "15%"
    private String mark; // e.g. "85%" or null if ungraded

    // Uploaded submission details
    private String submissionFileName;
    
    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "submission_file_data", length = 10485760) // Up to 10MB
    private byte[] submissionFileData;
}
