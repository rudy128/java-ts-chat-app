package com.messaging.backend.repository;

import com.messaging.backend.model.User;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface UserRepository extends ReactiveMongoRepository<User, String> {
    
    Mono<User> findByUsername(String username);
    
    Mono<Boolean> existsByUsername(String username);
    
    Mono<Boolean> existsByEmail(String email);
    
    Flux<User> findByUsernameContainingIgnoreCase(String username);
    
    Flux<User> findByIsOnline(boolean isOnline);
}