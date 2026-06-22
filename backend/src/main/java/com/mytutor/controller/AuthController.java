package com.mytutor.controller;

import com.mytutor.model.User;
import com.mytutor.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(loginRequest.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                // Simulated JWT token
                response.put("token", "simulated-jwt-token-for-" + user.getUsername());
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("name", user.getName());
                response.put("role", user.getRole());
                response.put("email", user.getEmail());
                response.put("avatar", user.getAvatar());
                return ResponseEntity.ok(response);
            }
        }

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Invalid username or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
}
