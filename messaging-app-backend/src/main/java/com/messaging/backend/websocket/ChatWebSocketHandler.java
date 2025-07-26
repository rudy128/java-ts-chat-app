package com.messaging.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messaging.backend.dto.MessageDto;
import com.messaging.backend.model.Message;
import com.messaging.backend.security.JwtTokenProvider;
import com.messaging.backend.service.MessageService;
import com.messaging.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private ObjectMapper objectMapper; // Use the configured ObjectMapper instead of creating new one
    
    // Store active sessions by user ID
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String token = getTokenFromSession(session);
        if (token != null && tokenProvider.validateToken(token)) {
            String userId = tokenProvider.getUserIdFromToken(token);
            userSessions.put(userId, session);
            
            // Update user online status
            userService.updateUserOnlineStatus(userId, true).subscribe();
            
            System.out.println("User " + userId + " connected via WebSocket");
            
            // Send connection confirmation
            Map<String, Object> response = new HashMap<>();
            response.put("type", "CONNECTION_ESTABLISHED");
            response.put("userId", userId);
            
            String responseJson = objectMapper.writeValueAsString(response);
            session.sendMessage(new TextMessage(responseJson));
            
        } else {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid token"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.remove(userId);
            // Update user offline status
            userService.updateUserOnlineStatus(userId, false).subscribe();
            System.out.println("User " + userId + " disconnected from WebSocket");
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String token = getTokenFromSession(session);
        if (token == null || !tokenProvider.validateToken(token)) {
            System.out.println("Invalid token in WebSocket message");
            return;
        }

        String senderId = tokenProvider.getUserIdFromToken(token);
        System.out.println("Received WebSocket message from user: " + senderId);
        System.out.println("Message payload: " + message.getPayload());
        
        try {
            // Parse incoming message
            Map<String, Object> messageData = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) messageData.get("type");
            System.out.println("Message type: " + type);
            
            if ("SEND_MESSAGE".equals(type)) {
                MessageDto messageDto = new MessageDto();
                messageDto.setReceiverId((String) messageData.get("receiverId"));
                messageDto.setContent((String) messageData.get("content"));
                messageDto.setType((String) messageData.getOrDefault("messageType", "TEXT"));
                
                System.out.println("Sending message from " + senderId + " to " + messageDto.getReceiverId());
                System.out.println("Message content: " + messageDto.getContent());
                
                // Save message to database
                messageService.sendMessage(senderId, messageDto)
                    .subscribe(savedMessage -> {
                        try {
                            System.out.println("Message saved to database: " + savedMessage.getId());
                            
                            // Send to receiver if online
                            WebSocketSession receiverSession = userSessions.get(messageDto.getReceiverId());
                            if (receiverSession != null && receiverSession.isOpen()) {
                                Map<String, Object> response = new HashMap<>();
                                response.put("type", "NEW_MESSAGE");
                                response.put("message", savedMessage);
                                
                                String responseJson = objectMapper.writeValueAsString(response);
                                receiverSession.sendMessage(new TextMessage(responseJson));
                                System.out.println("Message sent to receiver: " + messageDto.getReceiverId());
                            } else {
                                System.out.println("Receiver not online: " + messageDto.getReceiverId());
                            }
                            
                            // Send confirmation back to sender
                            Map<String, Object> confirmation = new HashMap<>();
                            confirmation.put("type", "MESSAGE_SENT");
                            confirmation.put("message", savedMessage);
                            
                            String confirmationJson = objectMapper.writeValueAsString(confirmation);
                            session.sendMessage(new TextMessage(confirmationJson));
                            System.out.println("Confirmation sent to sender: " + senderId);
                            
                        } catch (IOException e) {
                            System.err.println("Error sending WebSocket message: " + e.getMessage());
                            e.printStackTrace();
                        }
                    }, error -> {
                        System.err.println("Error saving message: " + error.getMessage());
                        error.printStackTrace();
                        
                        try {
                            Map<String, Object> errorResponse = new HashMap<>();
                            errorResponse.put("type", "ERROR");
                            errorResponse.put("message", "Failed to send message");
                            
                            String errorJson = objectMapper.writeValueAsString(errorResponse);
                            session.sendMessage(new TextMessage(errorJson));
                        } catch (IOException ioError) {
                            System.err.println("Error sending error response: " + ioError.getMessage());
                        }
                    });
            }
        } catch (Exception e) {
            System.err.println("Error handling WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String getTokenFromSession(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri != null && uri.getQuery() != null) {
            String[] params = uri.getQuery().split("&");
            for (String param : params) {
                if (param.startsWith("token=")) {
                    return param.substring(6);
                }
            }
        }
        return null;
    }

    private String getUserIdFromSession(WebSocketSession session) {
        String token = getTokenFromSession(session);
        if (token != null && tokenProvider.validateToken(token)) {
            return tokenProvider.getUserIdFromToken(token);
        }
        return null;
    }
}