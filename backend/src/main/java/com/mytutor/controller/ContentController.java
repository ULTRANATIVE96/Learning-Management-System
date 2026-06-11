package com.mytutor.controller;

import com.mytutor.model.ContentFile;
import com.mytutor.model.ContentFolder;
import com.mytutor.model.Notification;
import com.mytutor.repository.ContentFileRepository;
import com.mytutor.repository.ContentFolderRepository;
import com.mytutor.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    @Autowired private ContentFolderRepository folderRepository;
    @Autowired private ContentFileRepository fileRepository;
    @Autowired private NotificationRepository notificationRepository;

    @GetMapping("/folders")
    public List<ContentFolder> getAllFolders() {
        return folderRepository.findAll();
    }

    @GetMapping("/folders/{folderName}/files")
    public List<ContentFile> getFilesByFolder(@PathVariable String folderName) {
        return fileRepository.findByFolderName(folderName);
    }

    @GetMapping("/files/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        return fileRepository.findById(id)
                .map(file -> {
                    byte[] data = file.getFileData() != null ? file.getFileData() : ("Content of " + file.getName()).getBytes();
                    
                    MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
                    if ("pdf".equalsIgnoreCase(file.getType())) {
                        mediaType = MediaType.APPLICATION_PDF;
                    }
                    
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                            .contentType(mediaType)
                            .body(data);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/folders/{folderName}/upload")
    public ResponseEntity<ContentFile> uploadFile(
            @PathVariable String folderName,
            @RequestParam("file") MultipartFile file) throws IOException {

        ContentFolder folder = folderRepository.findByName(folderName)
                .orElseGet(() -> folderRepository.save(new ContentFolder(null, folderName, 0)));

        ContentFile newFile = new ContentFile();
        newFile.setName(file.getOriginalFilename());
        newFile.setSize(formatFileSize(file.getSize()));
        newFile.setDate(LocalDate.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
        
        String ext = "";
        int i = file.getOriginalFilename().lastIndexOf('.');
        if (i > 0) {
            ext = file.getOriginalFilename().substring(i + 1);
        }
        newFile.setType(ext.isEmpty() ? "dat" : ext.toLowerCase());
        newFile.setFolderName(folderName);
        newFile.setFileData(file.getBytes());

        ContentFile savedFile = fileRepository.save(newFile);

        // Update folder file count
        folder.setCount(folder.getCount() + 1);
        folderRepository.save(folder);

        // Create a notification for upload
        Notification notif = new Notification();
        notif.setType("content");
        notif.setTitle("New Study Material");
        notif.setDesc("A new file '" + file.getOriginalFilename() + "' was uploaded to " + folderName + ".");
        notif.setTime("Just now");
        notif.setIsNew(true);
        notif.setColor("indigo");
        notificationRepository.save(notif);

        return ResponseEntity.ok(savedFile);
    }

    private String formatFileSize(long size) {
        if (size <= 0) return "0 B";
        final String[] units = new String[] { "B", "KB", "MB", "GB", "TB" };
        int digitGroups = (int) (Math.log10(size)/Math.log10(1024));
        return new DecimalFormat("#,##0.#").format(size/Math.pow(1024, digitGroups)) + " " + units[digitGroups];
    }
}
