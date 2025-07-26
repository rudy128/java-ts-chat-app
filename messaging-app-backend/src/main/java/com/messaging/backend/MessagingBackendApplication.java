package com.messaging.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableReactiveMongoRepositories
@EnableKafka
public class MessagingBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MessagingBackendApplication.class, args);
    }
}