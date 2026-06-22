package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "classmates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Classmate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String avatar;
    private String role; // Student, Class Rep
}
