package com.jobtrackr.demo.service;

import com.jobtrackr.demo.model.Notification;
import com.jobtrackr.demo.model.User;
import com.jobtrackr.demo.repository.NotificationRepository;
import com.jobtrackr.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public void sendNotification(String username, String message, String type) {
        User user = getUser(username);

        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setType(type);
        notification.setUser(user);
        notificationRepository.save(notification);

        long unreadCount = notificationRepository.countByUserAndReadFalse(user);

        messagingTemplate.convertAndSendToUser(
                username,
                "/queue/notifications",
                Map.of(
                        "id", notification.getId(),
                        "message", message,
                        "type", type,
                        "createdAt", notification.getCreatedAt().toString(),
                        "unreadCount", unreadCount
                )
        );
    }

    public List<Notification> getNotifications(String username) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(getUser(username));
    }

    public long getUnreadCount(String username) {
        return notificationRepository.countByUserAndReadFalse(getUser(username));
    }

    public void markAllAsRead(String username) {
        notificationRepository.markAllAsReadByUser(getUser(username));
    }
}