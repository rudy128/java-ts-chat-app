package com.messaging.backend.service;

import com.messaging.backend.dto.MessageDto;
import com.messaging.backend.model.Message;
import com.messaging.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Mono<Message> sendMessage(String senderId, MessageDto messageDto) {
        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(messageDto.getReceiverId());
        message.setContent(messageDto.getContent());
        message.setType(Message.MessageType.valueOf(messageDto.getType()));
        
        // Generate chat ID based on user IDs (consistent regardless of who sends first)
        String chatId = generateChatId(senderId, messageDto.getReceiverId());
        message.setChatId(chatId);
        
        return messageRepository.save(message);
    }

    public Flux<Message> getChatMessages(String userId1, String userId2) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                userId1, userId2, userId1, userId2);
    }

    public Mono<Long> getUnreadMessageCount(String userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    public Mono<Message> markMessageAsRead(String messageId) {
        return messageRepository.findById(messageId)
                .flatMap(message -> {
                    message.setRead(true);
                    return messageRepository.save(message);
                });
    }

    public Flux<Message> markMessagesAsRead(String receiverId, String senderId) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                        senderId, receiverId, receiverId, senderId)
                .filter(message -> message.getReceiverId().equals(receiverId) && !message.isRead())
                .flatMap(message -> {
                    message.setRead(true);
                    return messageRepository.save(message);
                });
    }

    private String generateChatId(String userId1, String userId2) {
        // Create consistent chat ID regardless of order
        return userId1.compareTo(userId2) < 0 ? 
                userId1 + "_" + userId2 : userId2 + "_" + userId1;
    }
}