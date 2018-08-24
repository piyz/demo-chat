package by.matrosov.springchat.controller;

import by.matrosov.springchat.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Random;

@Controller
public class WebSocketController {

    private static final String[] abc = {"banana", "apple", "dog", "pit", "home", "wow"};

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/publicChatRoom")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/publicChatRoom")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }

    @MessageMapping("/field.change")
    @SendTo("/topic/publicCurrentWordField")
    public ChatMessage changeCurrentWord(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor){
        Random random = new Random();
        chatMessage.setContent(abc[random.nextInt(abc.length)]);
        return chatMessage;
    }
}