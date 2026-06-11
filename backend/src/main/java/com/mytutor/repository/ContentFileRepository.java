package com.mytutor.repository;

import com.mytutor.model.ContentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentFileRepository extends JpaRepository<ContentFile, Long> {
    List<ContentFile> findByFolderName(String folderName);
}
