package com.pulse.attendance.repository;

import com.pulse.attendance.entity.DeviceBinding;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceBindingRepository extends MongoRepository<DeviceBinding, String> {
    Optional<DeviceBinding> findByStudentId(String studentId);
    Optional<DeviceBinding> findByDeviceFingerprint(String deviceFingerprint);
    boolean existsByStudentId(String studentId);
    boolean existsByDeviceFingerprint(String deviceFingerprint);
    void deleteByStudentId(String studentId);
}
