package com.example.queue.service;

//import com.example.dto.QueueCreateRequest;
//import com.queuemanagement.dto.QueueEntryRequest;
//import com.queuemanagement.dto.QueueStatusResponse;
//import com.queuemanagement.entity.Queue;
//import com.queuemanagement.entity.QueueEntry;
//import com.queuemanagement.repository.QueueEntryRepository;
//import com.queuemanagement.repository.QueueRepository;
import com.example.queue.dto.QueueCreateRequest;
import com.example.queue.dto.QueueEntryRequest;
import com.example.queue.dto.QueueStatusResponse;
import com.example.queue.entity.Queue;
import com.example.queue.entity.QueueEntry;
import com.example.queue.repository.QueueEntryRepository;
import com.example.queue.repository.QueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class QueueService {

    @Autowired
    private QueueRepository queueRepository;

    @Autowired
    private QueueEntryRepository queueEntryRepository;

    @Autowired
    private QRCodeService qrCodeService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Queue createQueue(QueueCreateRequest request) {
        try {
            Queue queue = new Queue();
            queue.setName(request.getName());
            queue.setDescription(request.getDescription());
            queue.setAskVisitorDetails(request.getAskVisitorDetails());
            queue.setStatus(Queue.QueueStatus.ACTIVE);

            Queue savedQueue = queueRepository.save(queue);

            // Generate QR code
            String qrCodeBase64 = qrCodeService.generateQRCodeForQueue(savedQueue.getId());
            savedQueue.setQrCode(qrCodeBase64);
            
            return queueRepository.save(savedQueue);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create queue: " + e.getMessage());
        }
    }

    public QueueEntry joinQueue(Long queueId, QueueEntryRequest request) {
        Optional<Queue> queueOpt = queueRepository.findById(queueId);
        if (!queueOpt.isPresent()) {
            throw new RuntimeException("Queue not found");
        }

        Queue queue = queueOpt.get();
        if (queue.getStatus() != Queue.QueueStatus.ACTIVE) {
            throw new RuntimeException("Queue is not active");
        }

        // Get current position in queue
        int currentPosition = queueEntryRepository.countByQueueIdAndStatus(queueId, QueueEntry.EntryStatus.WAITING) + 1;

        // Generate token number
        String tokenNumber = String.format("%03d", currentPosition);

        // Create queue entry
        QueueEntry entry = new QueueEntry();
        entry.setQueue(queue);
        entry.setVisitorName(request.getName());
        entry.setVisitorPhone(request.getPhone());
        entry.setVisitorEmail(request.getEmail());
        entry.setTokenNumber(tokenNumber);
        entry.setPosition(currentPosition);
        entry.setStatus(QueueEntry.EntryStatus.WAITING);
        entry.setEstimatedWaitTime(calculateEstimatedWaitTime(currentPosition));

        QueueEntry savedEntry = queueEntryRepository.save(entry);

        // Broadcast update
        broadcastQueueUpdate(queueId);

        return savedEntry;
    }

    public QueueEntry callNextVisitor(Long queueId) {
        List<QueueEntry> waitingEntries = queueEntryRepository
            .findByQueueIdAndStatusOrderByPositionAsc(queueId, QueueEntry.EntryStatus.WAITING);

        if (waitingEntries.isEmpty()) {
            throw new RuntimeException("No visitors waiting in queue");
        }

        QueueEntry nextEntry = waitingEntries.get(0);
        nextEntry.setStatus(QueueEntry.EntryStatus.CALLED);
        nextEntry.setCalledAt(LocalDateTime.now());

        // Update queue's current serving
        Optional<Queue> queueOpt = queueRepository.findById(queueId);
        if (queueOpt.isPresent()) {
            Queue queue = queueOpt.get();
            queue.setCurrentServing(nextEntry.getTokenNumber());
            queueRepository.save(queue);
        }

        QueueEntry savedEntry = queueEntryRepository.save(nextEntry);

        // Update positions for remaining entries
        updateQueuePositions(queueId);

        // Broadcast update
        broadcastQueueUpdate(queueId);

        return savedEntry;
    }

    public QueueEntry completeService(Long entryId) {
        Optional<QueueEntry> entryOpt = queueEntryRepository.findById(entryId);
        if (!entryOpt.isPresent()) {
            throw new RuntimeException("Queue entry not found");
        }

        QueueEntry entry = entryOpt.get();
        entry.setStatus(QueueEntry.EntryStatus.COMPLETED);
        entry.setCompletedAt(LocalDateTime.now());

        QueueEntry savedEntry = queueEntryRepository.save(entry);

        // Update queue positions
        updateQueuePositions(entry.getQueue().getId());
        
        // Broadcast update
        broadcastQueueUpdate(entry.getQueue().getId());

        return savedEntry;
    }

    public QueueStatusResponse getQueueStatus(Long queueId) {
        Optional<Queue> queueOpt = queueRepository.findById(queueId);
        if (!queueOpt.isPresent()) {
            throw new RuntimeException("Queue not found");
        }

        Queue queue = queueOpt.get();
        
        int waitingCount = queueEntryRepository.countByQueueIdAndStatus(queueId, QueueEntry.EntryStatus.WAITING);
        int calledCount = queueEntryRepository.countByQueueIdAndStatus(queueId, QueueEntry.EntryStatus.CALLED);
        int completedCount = queueEntryRepository.countByQueueIdAndStatus(queueId, QueueEntry.EntryStatus.COMPLETED);

        List<QueueEntry> waitingEntries = queueEntryRepository
            .findByQueueIdAndStatusOrderByPositionAsc(queueId, QueueEntry.EntryStatus.WAITING);

        // Get next visitor
        String nextVisitor = "000";
        if (!waitingEntries.isEmpty()) {
            nextVisitor = waitingEntries.get(0).getTokenNumber();
        }

        QueueStatusResponse response = new QueueStatusResponse();
        response.setQueueId(queueId);
        response.setQueueName(queue.getName());
        response.setCurrentServing(queue.getCurrentServing());
        response.setNextVisitor(nextVisitor);
        response.setWaitingCount(waitingCount);
        response.setCalledCount(calledCount);
        response.setCompletedCount(completedCount);
        response.setWaitingEntries(waitingEntries);
        response.setAverageWaitTime(calculateAverageWaitTime(queueId));

        return response;
    }

    public QueueEntry getEntryByToken(String tokenNumber) {
        Optional<QueueEntry> entryOpt = queueEntryRepository.findByTokenNumber(tokenNumber);
        if (!entryOpt.isPresent()) {
            throw new RuntimeException("Invalid token number");
        }
        return entryOpt.get();
    }

    public Queue getQueueById(Long queueId) {
        return queueRepository.findById(queueId).orElse(null);
    }

    // Private helper methods
    private int calculateEstimatedWaitTime(int position) {
        int averageServiceTime = 5; // minutes
        return position * averageServiceTime;
    }

    private double calculateAverageWaitTime(Long queueId) {
        List<QueueEntry> completedEntries = queueEntryRepository
            .findByQueueIdAndStatusOrderByJoinedAtAsc(queueId, QueueEntry.EntryStatus.COMPLETED);

        if (completedEntries.isEmpty()) {
            return 0.0;
        }

        double totalWaitTime = completedEntries.stream()
            .filter(entry -> entry.getCalledAt() != null && entry.getJoinedAt() != null)
            .mapToLong(entry -> 
                java.time.Duration.between(entry.getJoinedAt(), entry.getCalledAt()).toMinutes())
            .average()
            .orElse(0.0);

        return totalWaitTime;
    }

    private void updateQueuePositions(Long queueId) {
        List<QueueEntry> waitingEntries = queueEntryRepository
            .findByQueueIdAndStatusOrderByJoinedAtAsc(queueId, QueueEntry.EntryStatus.WAITING);

        for (int i = 0; i < waitingEntries.size(); i++) {
            waitingEntries.get(i).setPosition(i + 1);
            waitingEntries.get(i).setEstimatedWaitTime(calculateEstimatedWaitTime(i + 1));
        }

        queueEntryRepository.saveAll(waitingEntries);
    }

    private void broadcastQueueUpdate(Long queueId) {
        try {
            QueueStatusResponse status = getQueueStatus(queueId);
            messagingTemplate.convertAndSend("/topic/queue/" + queueId, status);
        } catch (Exception e) {
            System.err.println("Failed to broadcast queue update: " + e.getMessage());
        }
    }
}