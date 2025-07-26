package com.messaging.backend.repository;

import com.messaging.backend.model.Message;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface MessageRepository extends ReactiveMongoRepository<Message, String> {
    
    Flux<Message> findByChatIdOrderByTimestampAsc(String chatId);
    
    Flux<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
            String senderId1, String receiverId1, String receiverId2, String senderId2);
    
    Mono<Long> countByReceiverIdAndIsReadFalse(String receiverId);
    
    Flux<Message> findByReceiverIdAndIsReadFalse(String receiverId);
}