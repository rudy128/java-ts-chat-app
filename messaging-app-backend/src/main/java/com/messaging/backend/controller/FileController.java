package com.messaging.backend.controller;

import com.messaging.backend.security.JwtTokenProvider;
import com.messaging.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    private final String uploadDir = "media/";
    private final long maxFileSize = 65 * 1024 * 1024; // 65MB like WhatsApp
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestHeader("Authorization") String token) {
        
        try {
            String jwt = token.substring(7);
            if (!tokenProvider.validateToken(jwt)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
            }

            String userId = tokenProvider.getUserIdFromToken(jwt);
            String username = tokenProvider.getUsernameFromToken(jwt);
            
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
            }
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));
            }

            if (file.getSize() > maxFileSize) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "File size exceeds 65MB limit"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (!isValidFileType(contentType, type)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid file type for " + type));
            }

            // Create media directory structure: media/images/, media/videos/, etc.
            String typeFolder = getTypeFolderName(type);
            Path uploadPath = Paths.get(uploadDir, typeFolder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate filename with username-datetime format
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String timestamp = LocalDateTime.now().format(dateFormatter);
            String filename = String.format("%s_%s%s", username, timestamp, fileExtension);
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return file info
            Map<String, Object> response = new HashMap<>();
            response.put("filename", filename);
            response.put("originalName", originalFilename);
            response.put("url", "/api/files/" + typeFolder + "/" + filename);
            response.put("size", file.getSize());
            response.put("type", contentType);
            response.put("uploadedBy", userId);
            response.put("username", username);
            response.put("uploadedAt", LocalDateTime.now().toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unexpected error: " + e.getMessage()));
        }
    }

    @GetMapping("/{folder}/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String folder, 
            @PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir, folder, filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000") // Cache for 1 year
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Backward compatibility for old URLs without folders
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> downloadFileOld(@PathVariable String filename) {
        try {
            // Try to find the file in any subfolder
            String[] folders = {"images", "videos", "audio", "documents"};
            
            for (String folder : folders) {
                Path filePath = Paths.get(uploadDir, folder, filename).normalize();
                Resource resource = new UrlResource(filePath.toUri());
                
                if (resource.exists() && resource.isReadable()) {
                    String contentType = Files.probeContentType(filePath);
                    if (contentType == null) {
                        contentType = "application/octet-stream";
                    }

                    return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                        .body(resource);
                }
            }
            
            // If not found in subfolders, try root media directory
            Path filePath = Paths.get(uploadDir, filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
            }
            
            return ResponseEntity.notFound().build();
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String getTypeFolderName(String type) {
        switch (type.toUpperCase()) {
            case "IMAGE":
                return "images";
            case "VIDEO":
                return "videos";
            case "AUDIO":
            case "VOICE":
                return "audio";
            case "FILE":
            default:
                return "documents";
        }
    }

    private boolean isValidFileType(String contentType, String type) {
        if (contentType == null) return false;

        switch (type.toUpperCase()) {
            case "IMAGE":
                return contentType.startsWith("image/");
            case "VIDEO":
                // Allow all video formats - our frontend player can handle them with fallbacks
                return contentType.startsWith("video/");
            case "AUDIO":
            case "VOICE":
                // Allow all audio formats
                return contentType.startsWith("audio/");
            case "FILE":
                return true; // Allow any file type for general files
            default:
                return false;
        }
    }
}