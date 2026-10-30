package com.pulse.attendance.service;

import com.pulse.attendance.dto.request.Requests.BulkMarkDailyReq;
import com.pulse.attendance.dto.request.Requests.PeriodMarkReq;
import com.pulse.attendance.dto.request.Requests.SaveDailyAttendanceReq;
import com.pulse.attendance.dto.response.Responses.DailyAttendanceGridDTO;
import com.pulse.attendance.dto.response.Responses.DailyPeriodStatusDTO;
import com.pulse.attendance.dto.response.Responses.MonthlyClassReportDTO;
import com.pulse.attendance.dto.response.Responses.MonthlyStudentReportDTO;
import com.pulse.attendance.entity.DailyPeriodAttendance;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.repository.DailyPeriodAttendanceRepository;
import com.pulse.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyAttendanceService {

    private final DailyPeriodAttendanceRepository periodAttendanceRepository;
    private final StudentRepository studentRepository;

    /**
     * Retrieve the 7-period daily attendance grid for all students in a department on a specific date.
     */
    public DailyAttendanceGridDTO getDailyGrid(String department, LocalDate date) {
        List<Student> students = getStudentsByDepartment(department);
        List<DailyPeriodAttendance> existingRecords = periodAttendanceRepository
                .findByDepartmentIgnoreCaseAndAttendanceDate(department, date);

        Map<String, Map<Integer, String>> studentPeriodMap = new HashMap<>();
        for (DailyPeriodAttendance rec : existingRecords) {
            studentPeriodMap
                    .computeIfAbsent(rec.getStudentId(), k -> new HashMap<>())
                    .put(rec.getPeriod(), normalizeStatusForDisplay(rec.getStatus()));
        }

        List<DailyPeriodStatusDTO> rows = new ArrayList<>();
        for (Student s : students) {
            Map<Integer, String> pMap = studentPeriodMap.getOrDefault(s.getId(), new HashMap<>());
            Map<Integer, String> fullPeriods = new LinkedHashMap<>();
            for (int p = 1; p <= 7; p++) {
                fullPeriods.put(p, pMap.getOrDefault(p, "NOT_MARKED"));
            }

            String roll = StringUtils.hasText(s.getRollNumber()) ? s.getRollNumber() : s.getStudentId();
            rows.add(new DailyPeriodStatusDTO(
                    s.getId(),
                    roll,
                    s.getName(),
                    s.getBranch(),
                    fullPeriods
            ));
        }

        rows.sort(Comparator.comparing(DailyPeriodStatusDTO::rollNumber, Comparator.nullsLast(String::compareTo)));
        return new DailyAttendanceGridDTO(date, department, rows);
    }

    /**
     * Save or correct daily attendance records for periods 1 to 7.
     * Upsert logic and compound index prevent duplicate entries while allowing authorized corrections.
     */
    @Transactional
    public DailyAttendanceGridDTO saveDailyAttendance(SaveDailyAttendanceReq req, String markedBy) {
        if (!StringUtils.hasText(req.department())) {
            throw new ApiException("Department is required", HttpStatus.BAD_REQUEST);
        }
        if (req.date() == null) {
            throw new ApiException("Date is required", HttpStatus.BAD_REQUEST);
        }
        if (req.entries() == null) {
            throw new ApiException("Entries list cannot be null", HttpStatus.BAD_REQUEST);
        }

        LocalDateTime now = LocalDateTime.now();

        for (PeriodMarkReq entry : req.entries()) {
            if (entry.period() == null || entry.period() < 1 || entry.period() > 7) {
                throw new ApiException("Period must be between 1 and 7. Received: " + entry.period(), HttpStatus.BAD_REQUEST);
            }
            String normStatus = normalizeStatusOrThrow(entry.status());

            Student student = resolveStudent(entry.studentId());
            String roll = StringUtils.hasText(student.getRollNumber()) ? student.getRollNumber() : student.getStudentId();
            String dept = StringUtils.hasText(student.getBranch()) ? student.getBranch() : req.department();

            Optional<DailyPeriodAttendance> existing = periodAttendanceRepository
                    .findByStudentIdAndAttendanceDateAndPeriod(student.getId(), req.date(), entry.period());

            if (existing.isPresent()) {
                DailyPeriodAttendance rec = existing.get();
                rec.setStatus(normStatus);
                rec.setMarkedBy(markedBy);
                rec.setUpdatedAt(now);
                rec.setRollNumber(roll);
                rec.setStudentName(student.getName());
                rec.setDepartment(dept);
                periodAttendanceRepository.save(rec);
            } else {
                DailyPeriodAttendance rec = DailyPeriodAttendance.builder()
                        .studentId(student.getId())
                        .rollNumber(roll)
                        .studentName(student.getName())
                        .department(dept)
                        .attendanceDate(req.date())
                        .period(entry.period())
                        .status(normStatus)
                        .markedBy(markedBy)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

                try {
                    periodAttendanceRepository.save(rec);
                } catch (DuplicateKeyException e) {
                    // Safe concurrency catch: update existing if parallel insert occurred
                    DailyPeriodAttendance fallback = periodAttendanceRepository
                            .findByStudentIdAndAttendanceDateAndPeriod(student.getId(), req.date(), entry.period())
                            .orElseThrow(() -> e);
                    fallback.setStatus(normStatus);
                    fallback.setMarkedBy(markedBy);
                    fallback.setUpdatedAt(now);
                    periodAttendanceRepository.save(fallback);
                }
            }
        }

        return getDailyGrid(req.department(), req.date());
    }

    /**
     * Mark All Present or Mark All Absent across specified or all periods for a department on a date.
     */
    @Transactional
    public int bulkMarkAttendance(BulkMarkDailyReq req, String markedBy) {
        if (!StringUtils.hasText(req.department())) {
            throw new ApiException("Department is required", HttpStatus.BAD_REQUEST);
        }
        if (req.date() == null) {
            throw new ApiException("Date is required", HttpStatus.BAD_REQUEST);
        }
        String normStatus = normalizeStatusOrThrow(req.status());

        List<Integer> periods = (req.periods() != null && !req.periods().isEmpty())
                ? req.periods()
                : List.of(1, 2, 3, 4, 5, 6, 7);

        for (int p : periods) {
            if (p < 1 || p > 7) {
                throw new ApiException("Invalid period in bulk list: " + p, HttpStatus.BAD_REQUEST);
            }
        }

        List<Student> students = getStudentsByDepartment(req.department());
        List<PeriodMarkReq> marks = new ArrayList<>();
        for (Student s : students) {
            for (int p : periods) {
                marks.add(new PeriodMarkReq(s.getId(), p, normStatus));
            }
        }

        saveDailyAttendance(new SaveDailyAttendanceReq(req.department(), req.date(), marks), markedBy);
        return marks.size();
    }

    /**
     * Retrieve attendance records history for a department in a date range.
     */
    public List<DailyPeriodAttendance> getHistory(String department, LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new ApiException("startDate cannot be after endDate", HttpStatus.BAD_REQUEST);
        }
        return periodAttendanceRepository.findByDepartmentIgnoreCaseAndAttendanceDateBetween(
                department, startDate, endDate);
    }

    /**
     * Monthly working-period calculation, percentage calculation, and threshold filtering.
     */
    public MonthlyClassReportDTO getMonthlyReport(String department, int year, int month, double threshold, boolean belowThresholdOnly) {
        MonthlyClassReportDTO fullReport = calculateMonthlyReport(department, year, month, threshold);
        if (!belowThresholdOnly) {
            return fullReport;
        }

        List<MonthlyStudentReportDTO> filtered = fullReport.students().stream()
                .filter(MonthlyStudentReportDTO::belowThreshold)
                .collect(Collectors.toList());

        return new MonthlyClassReportDTO(
                fullReport.department(),
                fullReport.year(),
                fullReport.month(),
                fullReport.workingPeriods(),
                fullReport.threshold(),
                filtered,
                fullReport.belowThresholdCount(),
                fullReport.averageAttendancePercentage()
        );
    }

    /**
     * Calculate monthly attendance metrics according to PDF specification.
     * Working periods = total unique (date, period) sessions marked for the class in that month.
     * Percentage = (presentPeriods / workingPeriods) * 100.
     */
    public MonthlyClassReportDTO calculateMonthlyReport(String department, int year, int month, double threshold) {
        if (month < 1 || month > 12) {
            throw new ApiException("Month must be between 1 and 12", HttpStatus.BAD_REQUEST);
        }

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);

        List<Student> students = getStudentsByDepartment(department);
        List<DailyPeriodAttendance> records = periodAttendanceRepository
                .findByDepartmentIgnoreCaseAndAttendanceDateBetween(department, start, end);

        // Calculate class working periods in that month: unique (date, period) slots conducted
        Set<String> classWorkingSlots = records.stream()
                .map(r -> r.getAttendanceDate().toString() + "-P" + r.getPeriod())
                .collect(Collectors.toSet());
        int totalClassWorkingPeriods = classWorkingSlots.size();

        Map<String, List<DailyPeriodAttendance>> recordsByStudent = records.stream()
                .collect(Collectors.groupingBy(DailyPeriodAttendance::getStudentId));

        List<MonthlyStudentReportDTO> studentReports = new ArrayList<>();
        int belowThresholdCount = 0;
        double sumPercentages = 0.0;

        for (Student s : students) {
            List<DailyPeriodAttendance> sRecords = recordsByStudent.getOrDefault(s.getId(), List.of());
            int present = (int) sRecords.stream()
                    .filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()) || "P".equalsIgnoreCase(r.getStatus()))
                    .count();
            int absent = (int) sRecords.stream()
                    .filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus()) || "A".equalsIgnoreCase(r.getStatus()))
                    .count();

            // Total working periods for student: class total if > 0, otherwise student marked total
            int studentWorking = totalClassWorkingPeriods > 0 ? totalClassWorkingPeriods : (present + absent);

            double percentage = 0.0;
            if (studentWorking > 0) {
                percentage = Math.round(((double) present / studentWorking) * 10000.0) / 100.0;
            }

            boolean below = percentage < threshold;
            if (below) belowThresholdCount++;
            sumPercentages += percentage;

            String rollNo = StringUtils.hasText(s.getRollNumber()) ? s.getRollNumber() : s.getStudentId();

            studentReports.add(new MonthlyStudentReportDTO(
                    rollNo,
                    s.getName(),
                    s.getId(),
                    s.getBranch(),
                    studentWorking,
                    present,
                    absent,
                    percentage,
                    below
            ));
        }

        studentReports.sort(Comparator.comparing(MonthlyStudentReportDTO::rollNumber, Comparator.nullsLast(String::compareTo)));

        double avgPercentage = studentReports.isEmpty() ? 0.0 :
                Math.round((sumPercentages / studentReports.size()) * 100.0) / 100.0;

        return new MonthlyClassReportDTO(
                department,
                year,
                month,
                totalClassWorkingPeriods,
                threshold,
                studentReports,
                belowThresholdCount,
                avgPercentage
        );
    }

    /**
     * Generate CSV export for monthly attendance report matching PDF Page 4 layout.
     * Columns: Roll No.,Student,Working periods,Present,Absent,Attendance
     */
    public byte[] generateMonthlyReportCsv(String department, int year, int month, double threshold) {
        MonthlyClassReportDTO report = calculateMonthlyReport(department, year, month, threshold);
        StringBuilder sb = new StringBuilder();

        // Exact header matching specification
        sb.append("Roll No.,Student,Working periods,Present,Absent,Attendance\n");

        for (MonthlyStudentReportDTO s : report.students()) {
            sb.append(escapeCsv(s.rollNumber())).append(",")
              .append(escapeCsv(s.studentName())).append(",")
              .append(s.workingPeriods()).append(",")
              .append(s.presentPeriods()).append(",")
              .append(s.absentPeriods()).append(",")
              .append(String.format(Locale.US, "%.2f%%", s.attendancePercentage()))
              .append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    // ─── Helper Methods ────────────────────────────────────────────────────────

    private List<Student> getStudentsByDepartment(String department) {
        if (!StringUtils.hasText(department) || "ALL".equalsIgnoreCase(department)) {
            return studentRepository.findAll();
        }
        List<Student> list = studentRepository.findByBranchIgnoreCaseOrderByRollNumberAsc(department);
        if (list.isEmpty()) {
            list = studentRepository.findByBranch(department);
        }
        if (list.isEmpty()) {
            // Also try matching by branch containing string or roll number prefix (e.g. 23CS001)
            list = studentRepository.findAll().stream()
                    .filter(s -> {
                        if (s.getBranch() != null && s.getBranch().equalsIgnoreCase(department)) return true;
                        String roll = StringUtils.hasText(s.getRollNumber()) ? s.getRollNumber() : s.getStudentId();
                        if (roll != null && "CSE".equalsIgnoreCase(department) && (roll.toUpperCase().contains("CS") || s.getBranch() == null)) {
                            return true;
                        }
                        return false;
                    })
                    .collect(Collectors.toList());
        }
        return list;
    }

    private Student resolveStudent(String studentIdentifier) {
        return studentRepository.findById(studentIdentifier)
                .orElseGet(() -> studentRepository.findByStudentId(studentIdentifier)
                        .orElseGet(() -> studentRepository.findByRollNumber(studentIdentifier)
                                .orElseThrow(() -> new ApiException("Student not found: " + studentIdentifier, HttpStatus.NOT_FOUND))));
    }

    private String normalizeStatusOrThrow(String raw) {
        if (!StringUtils.hasText(raw)) {
            throw new ApiException("Status is required. Expected PRESENT or ABSENT", HttpStatus.BAD_REQUEST);
        }
        String upper = raw.trim().toUpperCase();
        if ("PRESENT".equals(upper) || "P".equals(upper)) return "PRESENT";
        if ("ABSENT".equals(upper) || "A".equals(upper)) return "ABSENT";
        throw new ApiException("Invalid status: " + raw + ". Expected PRESENT or ABSENT", HttpStatus.BAD_REQUEST);
    }

    private String normalizeStatusForDisplay(String status) {
        if ("PRESENT".equalsIgnoreCase(status) || "P".equalsIgnoreCase(status)) return "PRESENT";
        if ("ABSENT".equalsIgnoreCase(status) || "A".equalsIgnoreCase(status)) return "ABSENT";
        return "NOT_MARKED";
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
