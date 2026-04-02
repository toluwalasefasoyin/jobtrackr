package com.jobtrackr.demo.service;

import com.jobtrackr.demo.dto.PreferencesUpdateRequest;
import com.jobtrackr.demo.dto.ProfileUpdateRequest;
import com.jobtrackr.demo.model.User;
import com.jobtrackr.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User updateProfile(String username, ProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        return userRepository.save(user);
    }

    public User updatePreferences(String username, PreferencesUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getEmailOnNewJob() != null) {
            user.setEmailOnNewJob(request.getEmailOnNewJob());
        }
        if (request.getEmailOnUpdate() != null) {
            user.setEmailOnUpdate(request.getEmailOnUpdate());
        }
        if (request.getEmailOnOffer() != null) {
            user.setEmailOnOffer(request.getEmailOnOffer());
        }
        if (request.getPushNotifications() != null) {
            user.setPushNotifications(request.getPushNotifications());
        }

        return userRepository.save(user);
    }

    public User getUserProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
