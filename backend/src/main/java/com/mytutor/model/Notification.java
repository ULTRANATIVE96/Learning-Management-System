package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // mark, content, deadline, ai, system
    private String title;
    
    @Column(length = 2000)
    private String desc;
    
    private String time;
    private Boolean isNew;
    private String color; // emerald, indigo, rose, amber, slate
}
