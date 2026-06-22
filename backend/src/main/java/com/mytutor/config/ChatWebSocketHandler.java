package com.mytutor.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mytutor.model.Message;
import com.mytutor.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private MessageRepository messageRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map to keep track of active sessions grouped by room (session/module code)
    private final Map<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String room = getRoomFromSession(session);
        if (room != null) {
            roomSessions.computeIfAbsent(room, k -> Collections.synchronizedSet(new HashSet<>())).add(session);
            System.out.println("WebSocket connection established for room: " + room + ", session: " + session.getId());
        } else {
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("Received message: " + payload);

        try {
            // Parse message
            Message chatMessage = objectMapper.readValue(payload, Message.class);
            
            // Set timestamp if not set
            if (chatMessage.getTimestamp() == null || chatMessage.getTimestamp().isEmpty()) {
                chatMessage.setTimestamp(LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a")));
            }

            // Save to database
            Message savedMessage = messageRepository.save(chatMessage);
            String jsonResponse = objectMapper.writeValueAsString(savedMessage);

            // Broadcast to all sessions in the same room
            String room = savedMessage.getSessionCode();
            if (room != null && roomSessions.containsKey(room)) {
                TextMessage textMessage = new TextMessage(jsonResponse);
                synchronized (roomSessions.get(room)) {
                    for (WebSocketSession s : roomSessions.get(room)) {
                        if (s.isOpen()) {
                            s.sendMessage(textMessage);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing or sending message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String room = getRoomFromSession(session);
        if (room != null && roomSessions.containsKey(room)) {
            roomSessions.get(room).remove(session);
            System.out.println("WebSocket connection closed for room: " + room + ", session: " + session.getId());
        }
    }

    private String getRoomFromSession(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri != null && uri.getQuery() != null) {
            String query = uri.getQuery();
            String[] params = query.split("&");
            for (String param : params) {
                String[] keyValue = param.split("=");
                if (keyValue.length == 2 && "room".equals(keyValue[0])) {
                    return keyValue[1];
                }
            }
        }
        return null;
    }
}
