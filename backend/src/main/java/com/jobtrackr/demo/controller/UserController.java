package com.jobtrackr.demo.controller;

import com.jobtrackr.demo.dto.PreferencesUpdateRequest;
import com.jobtrackr.demo.dto.ProfileUpdateRequest;
import com.jobtrackr.demo.model.User;
import com.jobtrackr.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://jobtrackr-theta.vercel.app", "https://jobtrackr-fffq.onrender.com"})
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public User getProfile(Authentication authentication) {
        return userService.getUserProfile(authentication.getName());
    }

    @PutMapping("/profile")
    public User updateProfile(Authentication authentication, @RequestBody ProfileUpdateRequest request) {
        return userService.updateProfile(authentication.getName(), request);
    }

    @PutMapping("/preferences")
    public User updatePreferences(Authentication authentication, @RequestBody PreferencesUpdateRequest request) {
        return userService.updatePreferences(authentication.getName(), request);
    }
}
