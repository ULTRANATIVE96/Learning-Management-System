package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "student_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String name;
    private String email;
    private String phone;
    private String location;
    
    @Column(length = 1000)
    private String bio;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "profile_tags", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "tag")
    private List<String> tags;

    // Performance statistics
    private Integer modulesEnrolled;
    private Integer creditsEarned;
    private Integer assignmentsDone;
}
