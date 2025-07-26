package com.messaging.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "messages")
public class Message {
    
    @Id
    private String id;
    
    private String senderId;
    private String receiverId;
    private String chatId;
    private String content;
    private MessageType type;
    private LocalDateTime timestamp;
    private boolean isRead;
    private boolean isDelivered;
    
    public enum MessageType {
        TEXT, IMAGE, VIDEO, AUDIO, FILE, SYSTEM
    }
    
    public Message() {
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
        this.isDelivered = false;
        this.type = MessageType.TEXT;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    
    public String getReceiverId() { return receiverId; }
    public void setReceiverId(String receiverId) { this.receiverId = receiverId; }
    
    public String getChatId() { return chatId; }
    public void setChatId(String chatId) { this.chatId = chatId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    
    public boolean isDelivered() { return isDelivered; }
    public void setDelivered(boolean delivered) { isDelivered = delivered; }
}