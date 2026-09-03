package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lecturer_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LecturerAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "module_id")
    private Module module;

    @ManyToOne
    @JoinColumn(name = "lecturer_id")
    private User lecturer;

    private String groupName; // The group list (e.g. Group 1)
    private String status; // PENDING, ACCEPTED, REJECTED
}
