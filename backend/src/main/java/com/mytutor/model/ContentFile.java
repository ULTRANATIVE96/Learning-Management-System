package com.mytutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "content_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String size;
    private String date;
    private String type; // e.g. "pdf", "docx"
    private String folderName; // Folder it belongs to, e.g. "Lecture Notes"

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "file_data", length = 10485760) // up to 10MB
    private byte[] fileData;
}
