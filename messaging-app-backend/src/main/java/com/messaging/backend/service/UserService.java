package com.messaging.backend.service;

import com.messaging.backend.dto.LoginDto;
import com.messaging.backend.dto.UserRegistrationDto;
import com.messaging.backend.model.User;
import com.messaging.backend.repository.UserRepository;
import com.messaging.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public Mono<Map<String, Object>> registerUser(UserRegistrationDto registrationDto) {
        return userRepository.existsByUsername(registrationDto.getUsername())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new RuntimeException("Username already exists"));
                    }
                    
                    User user = new User();
                    user.setUsername(registrationDto.getUsername());
                    user.setEmail(registrationDto.getEmail());
                    user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
                    user.setDisplayName(registrationDto.getDisplayName() != null ? 
                            registrationDto.getDisplayName() : registrationDto.getUsername());
                    user.setContacts(new HashSet<>());
                    
                    return userRepository.save(user);
                })
                .map(user -> {
                    String token = tokenProvider.generateToken(user.getUsername(), user.getId());
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("user", sanitizeUser(user));
                    return response;
                });
    }

    public Mono<Map<String, Object>> loginUser(LoginDto loginDto) {
        return userRepository.findByUsername(loginDto.getUsername())
                .filter(user -> passwordEncoder.matches(loginDto.getPassword(), user.getPassword()))
                .switchIfEmpty(Mono.error(new RuntimeException("Invalid credentials")))
                .flatMap(user -> {
                    user.setOnline(true);
                    user.setLastSeen(LocalDateTime.now());
                    return userRepository.save(user);
                })
                .map(user -> {
                    String token = tokenProvider.generateToken(user.getUsername(), user.getId());
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("user", sanitizeUser(user));
                    return response;
                });
    }

    public Flux<User> getAllUsers() {
        System.out.println("=== UserService.getAllUsers() called ===");
        
        return userRepository.findAll()
                .doOnSubscribe(subscription -> System.out.println("Starting database query for all users"))
                .doOnNext(user -> System.out.println("Raw user from DB: " + user.getUsername() + " (ID: " + user.getId() + ")"))
                .doOnComplete(() -> System.out.println("Database query completed"))
                .doOnError(error -> System.out.println("ERROR in database query: " + error.getMessage()))
                .map(user -> {
                    System.out.println("Sanitizing user: " + user.getUsername());
                    User sanitized = this.sanitizeUser(user);
                    System.out.println("Sanitized user: " + sanitized.getUsername() + " (ID: " + sanitized.getId() + ")");
                    return sanitized;
                });
    }

    public Flux<User> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query)
                .map(this::sanitizeUser);
    }

    public Mono<User> getUserById(String userId) {
        return userRepository.findById(userId)
                .map(this::sanitizeUser);
    }

    public Mono<User> updateUserOnlineStatus(String userId, boolean isOnline) {
        return userRepository.findById(userId)
                .flatMap(user -> {
                    user.setOnline(isOnline);
                    user.setLastSeen(LocalDateTime.now());
                    return userRepository.save(user);
                });
    }

    private User sanitizeUser(User user) {
        User sanitized = new User();
        sanitized.setId(user.getId());
        sanitized.setUsername(user.getUsername());
        sanitized.setDisplayName(user.getDisplayName());
        sanitized.setAvatarUrl(user.getAvatarUrl()); // Keep as avatarUrl in backend
        sanitized.setOnline(user.isOnline());
        sanitized.setLastSeen(user.getLastSeen());
        sanitized.setCreatedAt(user.getCreatedAt());
        // Don't include password, email, or contacts in response
        return sanitized;
    }
}