package com.messaging.backend.controller;

import com.messaging.backend.model.User;
import com.messaging.backend.security.JwtTokenProvider;
import com.messaging.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        System.out.println("=== UserController.getAllUsers() called ===");
        
        String token = authHeader.replace("Bearer ", "");
        System.out.println("JWT token extracted: " + token.substring(0, 20) + "...");
        
        try {
            String currentUserId = tokenProvider.getUserIdFromToken(token);
            System.out.println("Token validated. Current user ID: " + currentUserId);
            
            // Use synchronous approach with block() to avoid async issues
            System.out.println("=== Starting synchronous processing ===");
            List<User> userList = userService.getAllUsers().collectList().block();
            
            System.out.println("=== Synchronous response received in controller ===");
            System.out.println("Users received from service: " + (userList != null ? userList.size() : 0));
            if (userList != null) {
                for (User user : userList) {
                    System.out.println("  Response user: " + user.getUsername() + " (" + user.getId() + ")");
                }
            }
            
            System.out.println("Returning ResponseEntity with OK response");
            return ResponseEntity.ok(userList != null ? userList : Collections.emptyList());
            
        } catch (Exception e) {
            System.out.println("=== Exception in controller ===");
            System.out.println("Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/search")
    public Flux<User> searchUsers(@RequestParam String query,
                                  @RequestHeader("Authorization") String token) {
        // Extract token and validate
        String jwt = token.substring(7); // Remove "Bearer " prefix
        if (tokenProvider.validateToken(jwt)) {
            return userService.searchUsers(query);
        }
        return Flux.empty();
    }

    @GetMapping("/{userId}")
    public Mono<ResponseEntity<User>> getUserById(@PathVariable String userId,
                                                  @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        if (tokenProvider.validateToken(jwt)) {
            return userService.getUserById(userId)
                    .map(ResponseEntity::ok)
                    .defaultIfEmpty(ResponseEntity.notFound().build());
        }
        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PutMapping("/{userId}/online")
    public Mono<ResponseEntity<User>> updateOnlineStatus(@PathVariable String userId,
                                                         @RequestParam boolean isOnline,
                                                         @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        if (tokenProvider.validateToken(jwt)) {
            String tokenUserId = tokenProvider.getUserIdFromToken(jwt);
            if (tokenUserId.equals(userId)) {
                return userService.updateUserOnlineStatus(userId, isOnline)
                        .map(ResponseEntity::ok);
            }
        }
        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}