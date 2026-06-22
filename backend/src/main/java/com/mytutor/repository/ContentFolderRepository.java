package com.mytutor.repository;

import com.mytutor.model.ContentFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentFolderRepository extends JpaRepository<ContentFolder, Long> {
    Optional<ContentFolder> findByName(String name);
}
