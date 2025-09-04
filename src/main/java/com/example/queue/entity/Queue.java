package com.example.queue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "queues")
public class Queue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Column(name = "qr_code", columnDefinition = "TEXT")
    private String qrCode;
    
    @Column(name = "ask_visitor_details")
    private Boolean askVisitorDetails = false;
    
    @Enumerated(EnumType.STRING)
    private QueueStatus status = QueueStatus.ACTIVE;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "current_serving")
    private String currentServing = "000";
    
    @OneToMany(mappedBy = "queue", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QueueEntry> entries;

    // Constructors
    public Queue() {}

    public Queue(String name, String description, Boolean askVisitorDetails) {
        this.name = name;
        this.description = description;
        this.askVisitorDetails = askVisitorDetails;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public Boolean getAskVisitorDetails() { return askVisitorDetails; }
    public void setAskVisitorDetails(Boolean askVisitorDetails) { this.askVisitorDetails = askVisitorDetails; }

    public QueueStatus getStatus() { return status; }
    public void setStatus(QueueStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getCurrentServing() { return currentServing; }
    public void setCurrentServing(String currentServing) { this.currentServing = currentServing; }

    public List<QueueEntry> getEntries() { return entries; }
    public void setEntries(List<QueueEntry> entries) { this.entries = entries; }

    public enum QueueStatus {
        ACTIVE, INACTIVE, PAUSED
    }
}