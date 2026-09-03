package com.mytutor.service;

import com.mytutor.model.*;
import com.mytutor.model.Module;
import com.mytutor.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;

@Service
public class DataSeeder implements CommandLineRunner {

    @Autowired private StudentProfileRepository profileRepository;
    @Autowired private ModuleRepository moduleRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AssessmentRepository assessmentRepository;
    @Autowired private ContentFolderRepository folderRepository;
    @Autowired private ContentFileRepository fileRepository;
    @Autowired private ClassmateRepository classmateRepository;
    @Autowired private LiveSessionRepository liveSessionRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private VideoRecordingRepository videoRecordingRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users
        if (userRepository.count() == 0) {
            // Lecturers
            userRepository.save(new User(null, "TeachAndie", "TAndie@123", "Dr. Andrea Vine", "LECTURER", "andrea.vine@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Andie", "dav-234"));
            userRepository.save(new User(null, "TeachVine", "TVine@123", "Prof. Vincent Taylor", "LECTURER", "vincent.taylor@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Vine", "pvt-567"));
            userRepository.save(new User(null, "TeachMya", "TZya@123", "Dr. Mya Zya", "LECTURER", "mya.zya@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Mya", "dmz-890"));

            // Students
            userRepository.save(new User(null, "11101", "STVine@123", "Jonathan Doe", "STUDENT", "11101@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=John", null));
            userRepository.save(new User(null, "11201", "STAndie@123", "Sarah Connor", "STUDENT", "11201@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", null));
            userRepository.save(new User(null, "11301", "STZya@123", "Marcus Wright", "STUDENT", "11301@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus", null));
        }

        // 2. Seed Student Profiles
        if (profileRepository.count() == 0) {
            StudentProfile profile1 = new StudentProfile();
            profile1.setUsername("11101");
            profile1.setName("Jonathan Doe");
            profile1.setEmail("11101@divine.edu");
            profile1.setPhone("+1 (555) 111-2222");
            profile1.setLocation("Pretoria, South Africa");
            profile1.setBio("Third-year Computer Science student passionate about distributed systems and AI. Currently maintaining a 3.8 GPA while working as a teaching assistant for Mathematics 101. I love solving complex algorithmic problems and building tools that make academic life easier.");
            profile1.setTags(Arrays.asList("Computer Science", "Data Analytics", "Mathematics", "Python", "React"));
            profile1.setModulesEnrolled(0);
            profile1.setCreditsEarned(48);
            profile1.setAssignmentsDone(24);
            profileRepository.save(profile1);

            StudentProfile profile2 = new StudentProfile();
            profile2.setUsername("11201");
            profile2.setName("Sarah Connor");
            profile2.setEmail("11201@divine.edu");
            profile2.setPhone("+1 (555) 333-4444");
            profile2.setLocation("Cape Town, South Africa");
            profile2.setBio("Second-year Physics and Mathematics student. Interested in quantum mechanics and numerical computing.");
            profile2.setTags(Arrays.asList("Physics", "Mathematics", "C++", "LaTeX"));
            profile2.setModulesEnrolled(0);
            profile2.setCreditsEarned(36);
            profile2.setAssignmentsDone(18);
            profileRepository.save(profile2);

            StudentProfile profile3 = new StudentProfile();
            profile3.setUsername("11301");
            profile3.setName("Marcus Wright");
            profile3.setEmail("11301@divine.edu");
            profile3.setPhone("+1 (555) 555-6666");
            profile3.setLocation("Johannesburg, South Africa");
            profile3.setBio("Final-year Computer Science student focusing on cybersecurity and database administration.");
            profile3.setTags(Arrays.asList("Computer Science", "Security", "SQL", "Java"));
            profile3.setModulesEnrolled(0);
            profile3.setCreditsEarned(60);
            profile3.setAssignmentsDone(30);
            profileRepository.save(profile3);
        }
        
        // Clean up any old seeded mock recordings from persistent storage
        for (VideoRecording rec : videoRecordingRepository.findAll()) {
            if (rec.getVideoUrl() != null && (
                rec.getVideoUrl().contains("w3schools.com") || 
                rec.getVideoUrl().contains("commondatastorage.googleapis.com") ||
                rec.getTitle().contains("Calculus:") ||
                rec.getTitle().contains("Linear Algebra:") ||
                rec.getTitle().contains("Computer Science:") ||
                rec.getTitle().contains("Expired Lecture")
            )) {
                videoRecordingRepository.delete(rec);
            }
        }
    }
}
