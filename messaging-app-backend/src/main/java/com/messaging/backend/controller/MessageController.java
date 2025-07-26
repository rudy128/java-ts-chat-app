package com.messaging.backend.controller;

import com.messaging.backend.dto.MessageDto;
import com.messaging.backend.model.Message;
import com.messaging.backend.security.JwtTokenProvider;
import com.messaging.backend.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@Valid @RequestBody MessageDto messageDto,
                                               @RequestHeader("Authorization") String token) {
        System.out.println("=== MessageController.sendMessage() called ===");
        String jwt = token.substring(7);
        if (tokenProvider.validateToken(jwt)) {
            String senderId = tokenProvider.getUserIdFromToken(jwt);
            System.out.println("Sending message from " + senderId + " to " + messageDto.getReceiverId());
            System.out.println("Message content: " + messageDto.getContent());

            // Convert reactive to synchronous
            Message savedMessage = messageService.sendMessage(senderId, messageDto).block();
            System.out.println("Message saved successfully: " + savedMessage.getId());
            return ResponseEntity.ok(savedMessage);
        }
        System.out.println("Unauthorized access attempt");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/chat/{otherUserId}")
    public ResponseEntity<List<Message>> getChatMessages(@PathVariable String otherUserId,
                                                         @RequestHeader("Authorization") String token) {
        System.out.println("=== MessageController.getChatMessages() called ===");
        String jwt = token.substring(7);
        if (tokenProvider.validateToken(jwt)) {
            String userId = tokenProvider.getUserIdFromToken(jwt);
            System.out.println("Getting chat messages between " + userId + " and " + otherUserId);

            // Convert reactive to synchronous
            List<Message> messages = messageService.getChatMessages(userId, otherUserId)
                    .collectList()
                    .block();
            System.out.println("Retrieved " + messages.size() + " messages");
            return ResponseEntity.ok(messages);
        }
        System.out.println("Unauthorized access attempt");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(@RequestHeader("Authorization") String token) {
        System.out.println("=== MessageController.getUnreadCount() called ===");
        String jwt = token.substring(7);
        if (tokenProvider.validateToken(jwt)) {
            String userId = tokenProvider.getUserIdFromToken(jwt);

            // Convert reactive to synchronous
            Long count = messageService.getUnreadMessageCount(userId).block();
            System.out.println("Unread message count for " + userId + ": " + count);
            return ResponseEntity.ok(count);
        }
        System.out.println("Unauthorized access attempt");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Message> markAsRead(@PathVariable String messageId,
                                              @RequestHeader("Authorization") String token) {
        System.out.println("=== MessageController.markAsRead() called ===");
        String jwt = token.substring(7);
        if (tokenProvider.validateToken(jwt)) {
            System.out.println("Marking message as read: " + messageId);

            // Convert reactive to synchronous
            Message updatedMessage = messageService.markMessageAsRead(messageId).block();
            System.out.println("Message marked as read successfully");
            return ResponseEntity.ok(updatedMessage);
        }
        System.out.println("Unauthorized access attempt");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/read/{senderId}")
    public ResponseEntity<List<Message>> markMessagesAsRead(@PathVariable String senderId,
                                                            @RequestHeader("Authorization") String token) {
        System.out.println("=== MessageController.markMessagesAsRead() called ===");
        String jwt = token.substring(7);
        if (tokenProvider.validateToken(jwt)) {
            String receiverId = tokenProvider.getUserIdFromToken(jwt);
            System.out.println("Marking messages as read from " + senderId + " to " + receiverId);

            // Convert reactive to synchronous
            List<Message> updatedMessages = messageService.markMessagesAsRead(receiverId, senderId)
                    .collectList()
                    .block();
            System.out.println("Marked " + updatedMessages.size() + " messages as read");
            return ResponseEntity.ok(updatedMessages);
        }
        System.out.println("Unauthorized access attempt");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}