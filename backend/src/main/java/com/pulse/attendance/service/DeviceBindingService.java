package com.pulse.attendance.service;

import com.pulse.attendance.entity.DeviceBinding;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.repository.DeviceBindingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeviceBindingService {

    private final DeviceBindingRepository deviceBindingRepository;

    @Transactional
    public void validateAndBindDevice(String studentId, String deviceFingerprint) {
        if (!StringUtils.hasText(deviceFingerprint)) {
            throw new ApiException("Device fingerprint is missing. Please update your app.", HttpStatus.BAD_REQUEST);
        }

        Optional<DeviceBinding> existingByStudent = deviceBindingRepository.findByStudentId(studentId);
        
        if (existingByStudent.isPresent()) {
            if (!existingByStudent.get().getDeviceFingerprint().equals(deviceFingerprint)) {
                throw new ApiException("This account is registered to a different device. Contact admin for device reset.", HttpStatus.FORBIDDEN);
            }
            return; // Device matches
        }

        // Check if the device is bound to ANOTHER student
        if (deviceBindingRepository.existsByDeviceFingerprint(deviceFingerprint)) {
            throw new ApiException("This device is already bound to another student account.", HttpStatus.FORBIDDEN);
        }

        // First login on a new device, bind it!
        DeviceBinding newBinding = DeviceBinding.builder()
                .studentId(studentId)
                .deviceFingerprint(deviceFingerprint)
                .build();
        
        deviceBindingRepository.save(newBinding);
    }

    public void checkDeviceForAttendance(String studentId, String deviceFingerprint) {
        if (!StringUtils.hasText(deviceFingerprint)) {
            throw new ApiException("Device fingerprint is required for attendance.", HttpStatus.BAD_REQUEST);
        }

        Optional<DeviceBinding> binding = deviceBindingRepository.findByStudentId(studentId);
        
        if (binding.isPresent()) {
            if (!binding.get().getDeviceFingerprint().equals(deviceFingerprint)) {
                throw new ApiException("Attendance must be marked from your registered device.", HttpStatus.FORBIDDEN);
            }
        } else {
            // Unbound account. Technically validation should happen on login, 
            // but just in case, we bind it if they somehow mark attendance first.
            validateAndBindDevice(studentId, deviceFingerprint);
        }
    }

    @Transactional
    public void resetDevice(String studentId) {
        deviceBindingRepository.deleteByStudentId(studentId);
    }

    public Optional<DeviceBinding> getBindingInfo(String studentId) {
        return deviceBindingRepository.findByStudentId(studentId);
    }
}
