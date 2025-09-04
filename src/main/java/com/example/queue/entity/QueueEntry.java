package com.example.queue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_entries")
public class QueueEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "queue_id", nullable = false)
    private Queue queue;

    @Column(name = "visitor_name")
    private String visitorName;

    @Column(name = "visitor_phone")
    private String visitorPhone;

    @Column(name = "visitor_email")
    private String visitorEmail;

    @Column(name = "token_number", nullable = false)
    private String tokenNumber;

    @Enumerated(EnumType.STRING)
    private EntryStatus status = EntryStatus.WAITING;

    private Integer position;

    @Column(name = "estimated_wait_time")
    private Integer estimatedWaitTime;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Constructors
    public QueueEntry() {}

    public QueueEntry(Queue queue, String visitorName, String tokenNumber, Integer position) {
        this.queue = queue;
        this.visitorName = visitorName;
        this.tokenNumber = tokenNumber;
        this.position = position;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Queue getQueue() { return queue; }
    public void setQueue(Queue queue) { this.queue = queue; }

    public String getVisitorName() { return visitorName; }
    public void setVisitorName(String visitorName) { this.visitorName = visitorName; }

    public String getVisitorPhone() { return visitorPhone; }
    public void setVisitorPhone(String visitorPhone) { this.visitorPhone = visitorPhone; }

    public String getVisitorEmail() { return visitorEmail; }
    public void setVisitorEmail(String visitorEmail) { this.visitorEmail = visitorEmail; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public EntryStatus getStatus() { return status; }
    public void setStatus(EntryStatus status) { this.status = status; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public Integer getEstimatedWaitTime() { return estimatedWaitTime; }
    public void setEstimatedWaitTime(Integer estimatedWaitTime) { this.estimatedWaitTime = estimatedWaitTime; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getCalledAt() { return calledAt; }
    public void setCalledAt(LocalDateTime calledAt) { this.calledAt = calledAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public enum EntryStatus {
        WAITING, CALLED, IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED
    }
}