package com.bank.onlinebanking.service;

import com.bank.onlinebanking.entity.Customer;
import com.bank.onlinebanking.entity.Notification;
import com.bank.onlinebanking.entity.enums.NotificationType;
import com.bank.onlinebanking.exception.ResourceNotFoundException;
import com.bank.onlinebanking.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(Customer customer, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .customer(customer)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getCustomerNotifications(String username) {
        return notificationRepository.findAllByCustomer_User_UsernameOrderByCreatedAtDesc(username);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        return notificationRepository.countByCustomer_User_UsernameAndIsReadFalse(username);
    }

    @Transactional
    public void markAsRead(Long notificationId, String username) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getCustomer().getUser().getUsername().equals(username)) {
            throw new ResourceNotFoundException("Notification does not belong to user: " + username);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String username) {
        List<Notification> list = notificationRepository.findAllByCustomer_User_UsernameOrderByCreatedAtDesc(username);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
