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
            userRepository.save(new User(null, "TeachAndie", "TAndie@123", "Dr. Andrea Vine", "LECTURER", "andrea.vine@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Andie"));
            userRepository.save(new User(null, "TeachVine", "TVine@123", "Prof. Vincent Taylor", "LECTURER", "vincent.taylor@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Vine"));
            userRepository.save(new User(null, "TeachMya", "TZya@123", "Dr. Mya Zya", "LECTURER", "mya.zya@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Mya"));

            // Students
            userRepository.save(new User(null, "11101", "STVine@123", "Jonathan Doe", "STUDENT", "11101@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=John"));
            userRepository.save(new User(null, "11201", "STAndie@123", "Sarah Connor", "STUDENT", "11201@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"));
            userRepository.save(new User(null, "11301", "STZya@123", "Marcus Wright", "STUDENT", "11301@divine.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"));
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
            profile1.setModulesEnrolled(5);
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
            profile2.setModulesEnrolled(4);
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
            profile3.setModulesEnrolled(5);
            profile3.setCreditsEarned(60);
            profile3.setAssignmentsDone(30);
            profileRepository.save(profile3);
        }

        // 3. Seed Modules
        if (moduleRepository.count() == 0) {
            moduleRepository.save(new Module(null, "Mathematics 101", "MATH101", "Dr. Andrea Vine", 75, "text-blue-600", "bg-blue-600", "Σ", "Mon, Wed • 10:00 AM"));
            moduleRepository.save(new Module(null, "Computer Science 201", "CSC201", "Prof. Vincent Taylor", 45, "text-indigo-600", "bg-indigo-600", "💻", "Tue, Thu • 02:00 PM"));
            moduleRepository.save(new Module(null, "Physics 101", "PHY101", "Dr. Mya Zya", 90, "text-purple-600", "bg-purple-600", "⚛️", "Fri • 09:00 AM"));
            moduleRepository.save(new Module(null, "Statistics 101", "STATS101", "Prof. Emily Davis", 30, "text-green-600", "bg-green-600", "📊", "Mon, Wed • 11:30 AM"));
            moduleRepository.save(new Module(null, "Academic Writing", "ENG101", "Ms. Lisa Miller", 60, "text-orange-600", "bg-orange-600", "✍️", "Thu • 10:00 AM"));
        }

        // 4. Seed Assignments
        if (assignmentRepository.count() == 0) {
            assignmentRepository.save(new Assignment(null, "Calculus Assignment 2", "MATH101", "Oct 25, 2026", "Pending", "high", "15%", null, null, null));
            assignmentRepository.save(new Assignment(null, "Data Structures Lab 4", "CSC201", "Oct 28, 2026", "Submitted", "medium", "10%", null, null, null));
            assignmentRepository.save(new Assignment(null, "Quantum Physics Report", "PHY101", "Nov 02, 2026", "Pending", "medium", "20%", null, null, null));
            assignmentRepository.save(new Assignment(null, "Statistical Analysis Project", "STATS101", "Nov 10, 2026", "Late", "high", "25%", null, null, null));
            assignmentRepository.save(new Assignment(null, "Technical Writing Essay", "ENG101", "Oct 20, 2026", "Graded", "low", "10%", "85%", null, null));
        }

        // 5. Seed Assessments (Marks details)
        if (assessmentRepository.count() == 0) {
            assessmentRepository.save(new Assessment(null, "Assignment 1", "Mathematics 101", "2026-03-15", 88, "15%", "Graded", "up"));
            assessmentRepository.save(new Assessment(null, "Test 1", "Computer Science 201", "2026-03-20", 75, "20%", "Graded", "up"));
            assessmentRepository.save(new Assessment(null, "Lab Report", "Physics 101", "2026-03-25", 62, "10%", "Graded", "down"));
            assessmentRepository.save(new Assessment(null, "Assignment 2", "Statistics 101", "2026-04-01", 45, "15%", "Attention", "down"));
            assessmentRepository.save(new Assessment(null, "Midterm Exam", "Mathematics 101", "2026-04-10", null, "30%", "Pending", "none"));
        }

        // 6. Seed Content Folders
        if (folderRepository.count() == 0) {
            folderRepository.save(new ContentFolder(null, "Lecture Notes", 4));
            folderRepository.save(new ContentFolder(null, "Past Papers", 0));
            folderRepository.save(new ContentFolder(null, "Assignments", 0));
            folderRepository.save(new ContentFolder(null, "Readings", 0));
            folderRepository.save(new ContentFolder(null, "Video Recordings", 0));
        }

        // 7. Seed Content Files
        if (fileRepository.count() == 0) {
            fileRepository.save(new ContentFile(null, "Calculus_Week1_Intro.pdf", "2.4 MB", "Oct 12, 2026", "pdf", "Lecture Notes", "Mock PDF file content".getBytes()));
            fileRepository.save(new ContentFile(null, "Linear_Algebra_Notes.pdf", "1.8 MB", "Oct 15, 2026", "pdf", "Lecture Notes", "Mock PDF file content".getBytes()));
            fileRepository.save(new ContentFile(null, "Practice_Problems_Set1.docx", "450 KB", "Oct 18, 2026", "doc", "Lecture Notes", "Mock Word file content".getBytes()));
            fileRepository.save(new ContentFile(null, "Formula_Sheet_Final.pdf", "890 KB", "Oct 20, 2026", "pdf", "Lecture Notes", "Mock PDF file content".getBytes()));
        }

        // 8. Seed Classmates
        if (classmateRepository.count() == 0) {
            classmateRepository.save(new Classmate(null, "Alice Thompson", "alice.t@student.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice", "Student"));
            classmateRepository.save(new Classmate(null, "Bob Wilson", "bob.w@student.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", "Student"));
            classmateRepository.save(new Classmate(null, "Charlie Davis", "charlie.d@student.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie", "Class Rep"));
            classmateRepository.save(new Classmate(null, "Diana Miller", "diana.m@student.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana", "Student"));
            classmateRepository.save(new Classmate(null, "Edward Brown", "edward.b@student.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Edward", "Student"));
            classmateRepository.save(new Classmate(null, "Fiona Garcia", "fiona.g@student.edu", "https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona", "Student"));
        }

        // 9. Seed Live Sessions (Starting with no active lives to prevent stale streams)
        liveSessionRepository.deleteAll();
        liveSessionRepository.save(new LiveSession(null, "Calculus: Integration by Parts", "10:00 AM - 11:30 AM", "Upcoming", "MATH101", 45));
        liveSessionRepository.save(new LiveSession(null, "Data Structures: Trees", "02:00 PM - 03:30 PM", "Upcoming", "CSC201", 38));
        liveSessionRepository.save(new LiveSession(null, "Physics: Thermodynamics", "Tomorrow, 09:00 AM", "Scheduled", "PHY101", 120));

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

        // 10. Seed Notifications
        if (notificationRepository.count() == 0) {
            notificationRepository.save(new Notification(null, "mark", "New Mark Released", "Your mark for Mathematics Assignment 2 has been released. You scored 88%.", "2 hours ago", true, "emerald"));
            notificationRepository.save(new Notification(null, "content", "New Study Material", "Dr. Andrea Vine uploaded \"Week 8: Vector Calculus\" to Mathematics 101.", "5 hours ago", true, "indigo"));
            notificationRepository.save(new Notification(null, "deadline", "Approaching Deadline", "Computer Science Lab 4 is due in 24 hours. Don't forget to submit!", "1 day ago", false, "rose"));
            notificationRepository.save(new Notification(null, "ai", "Smart Insight", "Your performance in Physics 101 has increased by 15% this month. Great job!", "2 days ago", false, "amber"));
            notificationRepository.save(new Notification(null, "system", "System Maintenance", "DacBoard will be offline for maintenance on Saturday from 02:00 to 04:00 AM.", "3 days ago", false, "slate"));
        }

        // 11. Seed Announcements
        if (announcementRepository.count() == 0) {
            announcementRepository.save(new Announcement(null, "Welcome to Divine University!", "Welcome to the new academic term on DacBoard. Please review your module syllabus documents in the Content section. Contact your course lecturer if you have any questions.", "Oct 10, 2026", "MATH101", "Dr. Andrea Vine"));
            announcementRepository.save(new Announcement(null, "Upcoming Integration Quiz", "We will have a quiz on Integration by Parts next Monday. Preparation materials have been uploaded to the Lecture Notes folder.", "2 hours ago", "MATH101", "Dr. Andrea Vine"));
            announcementRepository.save(new Announcement(null, "Lab 4 Extension", "Due to power outages, the deadline for Data Structures Lab 4 has been extended by 48 hours.", "5 hours ago", "CSC201", "Prof. Vincent Taylor"));
        }
    }
}
