package com.messaging.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class MessageDto {
    
    @NotBlank(message = "Receiver ID is required")
    private String receiverId;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private String type = "TEXT";
    
    // Getters and Setters
    public String getReceiverId() { return receiverId; }
    public void setReceiverId(String receiverId) { this.receiverId = receiverId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}