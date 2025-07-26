package com.messaging.backend.security;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.context.request.async.WebAsyncUtils;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Skip filtering for async dispatches - the authentication should already be preserved
        boolean isAsync = request.getDispatcherType() == DispatcherType.ASYNC;
        System.out.println("=== JWT Filter shouldNotFilter check ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Dispatcher Type: " + request.getDispatcherType());
        System.out.println("Is Async: " + isAsync);
        
        if (isAsync) {
            System.out.println("Skipping JWT filter for async dispatch");
            // For async dispatches, try to restore authentication from request attributes
            Object auth = request.getAttribute("PRESERVED_AUTHENTICATION");
            if (auth instanceof UsernamePasswordAuthenticationToken) {
                SecurityContextHolder.getContext().setAuthentication((UsernamePasswordAuthenticationToken) auth);
                System.out.println("Restored authentication from request attributes for async dispatch");
            }
        }
        return isAsync;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        System.out.println("=== JWT Filter doFilterInternal ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Dispatcher Type: " + request.getDispatcherType());
        
        String jwt = getJwtFromRequest(request);
        System.out.println("JWT token present: " + (jwt != null));

        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            String username = tokenProvider.getUsernameFromToken(jwt);
            String userId = tokenProvider.getUserIdFromToken(jwt);
            
            System.out.println("JWT valid - Username: " + username + ", UserId: " + userId);

            // Create a simple authentication token with username and userId
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
            
            // Add userId as details
            authentication.setDetails(userId);
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Store authentication in request attributes for async processing
            request.setAttribute("PRESERVED_AUTHENTICATION", authentication);
            
            System.out.println("Authentication set in SecurityContext and preserved for async");
        } else {
            System.out.println("JWT validation failed or token missing");
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}