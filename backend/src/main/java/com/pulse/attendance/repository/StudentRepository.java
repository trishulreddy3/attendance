package com.pulse.attendance.repository;

import com.pulse.attendance.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByEmail(String email);
    Optional<Student> findByStudentId(String studentId);
    boolean existsByEmail(String email);
    boolean existsByStudentId(String studentId);
    boolean existsByRollNumber(String rollNumber);

    List<Student> findByBranch(String branch);
    List<Student> findByCreatedById(String facultyId);
    List<Student> findByBatchId(String batchId);

    List<Student> findByNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(String name, String studentId);
}

