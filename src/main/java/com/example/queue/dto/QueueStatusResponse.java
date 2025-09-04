package com.example.queue.dto;

import com.example.queue.entity.QueueEntry;
import java.util.List;

public class QueueStatusResponse {
    private Long queueId;
    private String queueName;
    private String currentServing;
    private String nextVisitor;
    private int waitingCount;
    private int calledCount;
    private int completedCount;
    private List<QueueEntry> waitingEntries;
    private double averageWaitTime;

    // Constructors
    public QueueStatusResponse() {}

    // Getters and Setters
    public Long getQueueId() { return queueId; }
    public void setQueueId(Long queueId) { this.queueId = queueId; }

    public String getQueueName() { return queueName; }
    public void setQueueName(String queueName) { this.queueName = queueName; }

    public String getCurrentServing() { return currentServing; }
    public void setCurrentServing(String currentServing) { this.currentServing = currentServing; }

    public String getNextVisitor() { return nextVisitor; }
    public void setNextVisitor(String nextVisitor) { this.nextVisitor = nextVisitor; }

    public int getWaitingCount() { return waitingCount; }
    public void setWaitingCount(int waitingCount) { this.waitingCount = waitingCount; }

    public int getCalledCount() { return calledCount; }
    public void setCalledCount(int calledCount) { this.calledCount = calledCount; }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }

    public List<QueueEntry> getWaitingEntries() { return waitingEntries; }
    public void setWaitingEntries(List<QueueEntry> waitingEntries) { this.waitingEntries = waitingEntries; }

    public double getAverageWaitTime() { return averageWaitTime; }
    public void setAverageWaitTime(double averageWaitTime) { this.averageWaitTime = averageWaitTime; }
}