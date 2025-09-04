package com.example.queue.dto;

public class QueueCreateRequest {
    private String name;
    private String description;
    private Boolean askVisitorDetails;

    // Constructors
    public QueueCreateRequest() {}

    public QueueCreateRequest(String name, String description, Boolean askVisitorDetails) {
        this.name = name;
        this.description = description;
        this.askVisitorDetails = askVisitorDetails;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getAskVisitorDetails() { return askVisitorDetails; }
    public void setAskVisitorDetails(Boolean askVisitorDetails) { this.askVisitorDetails = askVisitorDetails; }
}