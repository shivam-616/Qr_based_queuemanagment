package com.example.queue.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @MessageMapping("/queue.update")
    @SendTo("/topic/queue.update")
    public String updateQueue(String message) {
        return message;
    }
}