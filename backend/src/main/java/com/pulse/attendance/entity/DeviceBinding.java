package com.pulse.attendance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "device_bindings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceBinding {
    @Id
    private String id;

    @Indexed(unique = true)
    private String studentId;

    @Indexed(unique = true)
    private String deviceFingerprint;

    private String rawDeviceInfo;

    @CreatedDate
    private LocalDateTime boundAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
