package com.example.queue.repository;

import com.example.queue.entity.Queue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueRepository extends JpaRepository<Queue, Long> {
    List<Queue> findByStatusOrderByCreatedAtDesc(Queue.QueueStatus status);
    Optional<Queue> findByIdAndStatus(Long id, Queue.QueueStatus status);
}