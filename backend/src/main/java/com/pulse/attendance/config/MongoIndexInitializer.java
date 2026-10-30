package com.pulse.attendance.config;

import com.pulse.attendance.entity.DailyPeriodAttendance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.CompoundIndexDefinition;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/**
 * Ensures MongoDB indexes (especially compound unique constraints) are created safely on startup.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MongoIndexInitializer implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Initializing and validating MongoDB indexes for DailyPeriodAttendance...");
            var indexOps = mongoTemplate.indexOps(DailyPeriodAttendance.class);

            // 1. Compound Unique Index: (studentId, attendanceDate, period)
            indexOps.ensureIndex(
                new CompoundIndexDefinition(
                    new Document("studentId", 1)
                        .append("attendanceDate", 1)
                        .append("period", 1)
                ).unique().named("student_date_period_unique_idx")
            );

            // 2. Query Index: (department, attendanceDate)
            indexOps.ensureIndex(
                new CompoundIndexDefinition(
                    new Document("department", 1)
                        .append("attendanceDate", 1)
                ).named("dept_date_idx")
            );

            log.info("MongoDB indexes for DailyPeriodAttendance successfully verified and active.");
        } catch (Exception e) {
            log.warn("Notice during index initialization (may already exist): {}", e.getMessage());
        }
    }
}
