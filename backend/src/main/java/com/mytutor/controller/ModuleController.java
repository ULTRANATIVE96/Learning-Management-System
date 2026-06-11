package com.mytutor.controller;

import com.mytutor.model.Module;
import com.mytutor.model.StudentProfile;
import com.mytutor.repository.ModuleRepository;
import com.mytutor.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    @Autowired private ModuleRepository moduleRepository;
    @Autowired private StudentProfileRepository profileRepository;

    @GetMapping
    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Module> enrollModule(@RequestBody Module module) {
        if (module.getCode() == null || module.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Set default values if not provided
        if (module.getProgress() == null) module.setProgress(0);
        if (module.getLecturer() == null) module.setLecturer("TBD Lecturer");
        if (module.getColor() == null) module.setColor("text-indigo-600");
        if (module.getBgColor() == null) module.setBgColor("bg-indigo-600");
        if (module.getIcon() == null) module.setIcon("📚");
        if (module.getSchedule() == null) module.setSchedule("TBD Schedule");

        Module savedModule = moduleRepository.save(module);

        // Update profile enrolled modules count
        profileRepository.findById(1L).ifPresent(profile -> {
            profile.setModulesEnrolled(profile.getModulesEnrolled() + 1);
            profileRepository.save(profile);
        });

        return ResponseEntity.ok(savedModule);
    }
}
