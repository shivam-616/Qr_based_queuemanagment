package com.example.queue.controller;

//import com.queuemanagement.dto.QueueCreateRequest;
//import com.queuemanagement.dto.QueueEntryRequest;
//import com.queuemanagement.dto.QueueStatusResponse;
//import com.queuemanagement.entity.Queue;
//import com.queuemanagement.entity.QueueEntry;
//import com.queuemanagement.service.QueueService;
import com.example.queue.dto.QueueCreateRequest;
import com.example.queue.dto.QueueEntryRequest;
import com.example.queue.dto.QueueStatusResponse;
import com.example.queue.entity.Queue;
import com.example.queue.entity.QueueEntry;
import com.example.queue.service.QueueService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/queues")
@CrossOrigin(origins = "*")
public class QueueController {

    @Autowired
    private QueueService queueService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createQueue(@RequestBody QueueCreateRequest request) {
        try {
            Queue queue = queueService.createQueue(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", queue.getId());
            response.put("name", queue.getName());
            response.put("description", queue.getDescription());
            response.put("askVisitorDetails", queue.getAskVisitorDetails());
            response.put("visitorLink", "http://localhost:3000/visitor/" + queue.getId());
            response.put("adminLink", "http://localhost:3000/admin/" + queue.getId());
            response.put("qrCode", "data:image/png;base64," + queue.getQrCode());
            response.put("statusDisplayLink", "http://localhost:3000/status/" + queue.getId());
            response.put("posterLink", "http://localhost:3000/poster/" + queue.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{queueId}")
    public ResponseEntity<Queue> getQueue(@PathVariable Long queueId) {
        Queue queue = queueService.getQueueById(queueId);
        if (queue == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(queue);
    }

    @PostMapping("/{queueId}/join")
    public ResponseEntity<Map<String, Object>> joinQueue(
            @PathVariable Long queueId,
            @RequestBody QueueEntryRequest request) {
        try {
            QueueEntry entry = queueService.joinQueue(queueId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", entry.getId());
            response.put("tokenNumber", entry.getTokenNumber());
            response.put("position", entry.getPosition());
            response.put("estimatedWaitTime", entry.getEstimatedWaitTime());
            response.put("queueName", entry.getQueue().getName());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{queueId}/status")
    public ResponseEntity<QueueStatusResponse> getQueueStatus(@PathVariable Long queueId) {
        try {
            QueueStatusResponse status = queueService.getQueueStatus(queueId);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{queueId}/call-next")
    public ResponseEntity<Map<String, Object>> callNextVisitor(@PathVariable Long queueId) {
        try {
            QueueEntry entry = queueService.callNextVisitor(queueId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", entry.getId());
            response.put("tokenNumber", entry.getTokenNumber());
            response.put("visitorName", entry.getVisitorName());
            response.put("status", entry.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/entry/{tokenNumber}")
    public ResponseEntity<QueueEntry> getEntryByToken(@PathVariable String tokenNumber) {
        try {
            QueueEntry entry = queueService.getEntryByToken(tokenNumber);
            return ResponseEntity.ok(entry);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/entry/{entryId}/complete")
    public ResponseEntity<Map<String, Object>> completeService(@PathVariable Long entryId) {
        try {
            QueueEntry entry = queueService.completeService(entryId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", entry.getId());
            response.put("tokenNumber", entry.getTokenNumber());
            response.put("status", entry.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}