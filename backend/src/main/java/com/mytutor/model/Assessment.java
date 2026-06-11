package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // e.g. "Assignment 1", "Test 1"
    private String module; // e.g. "Mathematics 101"
    private String date; // ISO date or formatted string
    private Integer mark; // e.g. 88 (null if pending)
    private String weight; // e.g. "15%"
    private String status; // Graded, Attention, Pending
    private String trend; // up, down, none
}
