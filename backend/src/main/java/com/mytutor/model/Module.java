package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "modules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String code; // e.g. CSC201
    private String lecturer;
    private Integer progress; // 0-100
    private String color; // Lucide / CSS color utility class
    private String bgColor; // Background color utility class
    private String icon; // Text character or emoji representation
    private String schedule; // e.g. "Mon, Wed • 10:00 AM"
}
