package com.example.queue.repository;

import com.example.queue.entity.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {
    List<QueueEntry> findByQueueIdAndStatusOrderByPositionAsc(Long queueId, QueueEntry.EntryStatus status);
    List<QueueEntry> findByQueueIdAndStatusOrderByJoinedAtAsc(Long queueId, QueueEntry.EntryStatus status);
    int countByQueueIdAndStatus(Long queueId, QueueEntry.EntryStatus status);
    Optional<QueueEntry> findByTokenNumber(String tokenNumber);
    Optional<QueueEntry> findFirstByQueueIdAndStatusOrderByPositionAsc(Long queueId, QueueEntry.EntryStatus status);
}