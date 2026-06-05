package com.pulse.attendance.repository;

import com.pulse.attendance.entity.Batch;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends MongoRepository<Batch, String> {
    List<Batch> findByFacultyIdOrderByCreatedAtDesc(String facultyId);
    boolean existsByBatchName(String batchName);
    Optional<Batch> findByBatchName(String batchName);
}
