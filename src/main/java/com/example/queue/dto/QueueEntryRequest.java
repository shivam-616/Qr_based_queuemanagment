package com.example.queue.dto;

public class QueueEntryRequest {
    private String name;
    private String phone;
    private String email;

    // Constructors
    public QueueEntryRequest() {}

    public QueueEntryRequest(String name, String phone, String email) {
        this.name = name;
        this.phone = phone;
        this.email = email;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}