package com.pulse.attendance;

import com.pulse.attendance.dto.request.Requests.BulkMarkDailyReq;
import com.pulse.attendance.dto.request.Requests.PeriodMarkReq;
import com.pulse.attendance.dto.request.Requests.SaveDailyAttendanceReq;
import com.pulse.attendance.dto.response.Responses.DailyAttendanceGridDTO;
import com.pulse.attendance.dto.response.Responses.MonthlyClassReportDTO;
import com.pulse.attendance.dto.response.Responses.MonthlyStudentReportDTO;
import com.pulse.attendance.entity.DailyPeriodAttendance;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.repository.DailyPeriodAttendanceRepository;
import com.pulse.attendance.repository.StudentRepository;
import com.pulse.attendance.service.DailyAttendanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyAttendanceServiceTest {

    @Mock
    private DailyPeriodAttendanceRepository periodAttendanceRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private DailyAttendanceService dailyAttendanceService;

    private Student student1;
    private Student student2;
    private final String dept = "CSE (AI & ML)";
    private final LocalDate testDate = LocalDate.of(2026, 10, 14);

    @BeforeEach
    void setUp() {
        student1 = Student.builder()
                .id("stu-1")
                .studentId("23CS001")
                .rollNumber("101")
                .name("Student 1")
                .email("student1@example.com")
                .branch(dept)
                .build();

        student2 = Student.builder()
                .id("stu-2")
                .studentId("23CS002")
                .rollNumber("102")
                .name("Student 2")
                .email("student2@example.com")
                .branch(dept)
                .build();
    }

    @Test
    @DisplayName("Module 2: Get daily grid returns all 7 periods for each student in the class")
    void testGetDailyGrid() {
        when(studentRepository.findByBranchIgnoreCaseOrderByRollNumberAsc(dept))
                .thenReturn(List.of(student1, student2));

        DailyPeriodAttendance p1 = DailyPeriodAttendance.builder()
                .studentId("stu-1")
                .attendanceDate(testDate)
                .period(1)
                .status("PRESENT")
                .build();

        when(periodAttendanceRepository.findByDepartmentIgnoreCaseAndAttendanceDate(dept, testDate))
                .thenReturn(List.of(p1));

        DailyAttendanceGridDTO grid = dailyAttendanceService.getDailyGrid(dept, testDate);

        assertNotNull(grid);
        assertEquals(dept, grid.department());
        assertEquals(testDate, grid.date());
        assertEquals(2, grid.students().size());

        // Student 1 has period 1 PRESENT, others NOT_MARKED
        var s1Row = grid.students().get(0);
        assertEquals("101", s1Row.rollNumber());
        assertEquals("PRESENT", s1Row.periods().get(1));
        assertEquals("NOT_MARKED", s1Row.periods().get(2));
        assertEquals("NOT_MARKED", s1Row.periods().get(7));
    }

    @Test
    @DisplayName("Module 2 & 3: Save attendance handles all 7 periods and prevents duplicates on same slot")
    void testSaveDailyAttendanceAndDuplicatePrevention() {
        when(studentRepository.findById("stu-1")).thenReturn(Optional.of(student1));
        when(studentRepository.findByBranchIgnoreCaseOrderByRollNumberAsc(dept))
                .thenReturn(List.of(student1));

        // When checking existing, return empty first time (new record created)
        when(periodAttendanceRepository.findByStudentIdAndAttendanceDateAndPeriod("stu-1", testDate, 1))
                .thenReturn(Optional.empty());

        List<PeriodMarkReq> marks = List.of(
                new PeriodMarkReq("stu-1", 1, "PRESENT"),
                new PeriodMarkReq("stu-1", 2, "ABSENT")
        );

        when(studentRepository.findById("stu-1")).thenReturn(Optional.of(student1));

        dailyAttendanceService.saveDailyAttendance(
                new SaveDailyAttendanceReq(dept, testDate, marks), "test-faculty");

        // Verify save was invoked for period 1 and 2
        verify(periodAttendanceRepository, times(2)).save(any(DailyPeriodAttendance.class));
    }

    @Test
    @DisplayName("Module 3: Historical corrections properly update previously saved records")
    void testHistoricalCorrection() {
        when(studentRepository.findById("stu-1")).thenReturn(Optional.of(student1));
        when(studentRepository.findByBranchIgnoreCaseOrderByRollNumberAsc(dept))
                .thenReturn(List.of(student1));

        DailyPeriodAttendance existingAbsent = DailyPeriodAttendance.builder()
                .id("rec-1")
                .studentId("stu-1")
                .attendanceDate(testDate)
                .period(3)
                .status("ABSENT")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        when(periodAttendanceRepository.findByStudentIdAndAttendanceDateAndPeriod("stu-1", testDate, 3))
                .thenReturn(Optional.of(existingAbsent));

        // Faculty corrects status from ABSENT to PRESENT
        List<PeriodMarkReq> correction = List.of(new PeriodMarkReq("stu-1", 3, "PRESENT"));
        dailyAttendanceService.saveDailyAttendance(new SaveDailyAttendanceReq(dept, testDate, correction), "test-faculty");

        assertEquals("PRESENT", existingAbsent.getStatus());
        assertEquals("test-faculty", existingAbsent.getMarkedBy());
        verify(periodAttendanceRepository).save(existingAbsent);
    }

    @Test
    @DisplayName("Validation: Reject invalid period numbers or invalid status")
    void testValidationErrors() {
        assertThrows(ApiException.class, () ->
                dailyAttendanceService.saveDailyAttendance(
                        new SaveDailyAttendanceReq(dept, testDate, List.of(new PeriodMarkReq("stu-1", 0, "PRESENT"))),
                        "faculty"));

        assertThrows(ApiException.class, () ->
                dailyAttendanceService.saveDailyAttendance(
                        new SaveDailyAttendanceReq(dept, testDate, List.of(new PeriodMarkReq("stu-1", 8, "PRESENT"))),
                        "faculty"));

        assertThrows(ApiException.class, () ->
                dailyAttendanceService.saveDailyAttendance(
                        new SaveDailyAttendanceReq(dept, testDate, List.of(new PeriodMarkReq("stu-1", 1, "INVALID"))),
                        "faculty"));
    }

    @Test
    @DisplayName("Module 2: Bulk mark all present or absent across all 7 periods")
    void testBulkMark() {
        when(studentRepository.findByBranchIgnoreCaseOrderByRollNumberAsc(dept))
                .thenReturn(List.of(student1, student2));
        when(studentRepository.findById("stu-1")).thenReturn(Optional.of(student1));
        when(studentRepository.findById("stu-2")).thenReturn(Optional.of(student2));

        BulkMarkDailyReq req = new BulkMarkDailyReq(dept, testDate, "PRESENT", null);
        int count = dailyAttendanceService.bulkMarkAttendance(req, "faculty");

        // 2 students * 7 periods = 14 slots
        assertEquals(14, count);
        verify(periodAttendanceRepository, times(14)).save(any(DailyPeriodAttendance.class));
    }

    @Test
    @DisplayName("Module 4: Monthly attendance calculation and threshold identification matching PDF specification")
    void testMonthlyCalculationAndThreshold() {
        when(studentRepository.findByBranchIgnoreCaseOrderByRollNumberAsc(dept))
                .thenReturn(List.of(student1, student2));

        LocalDate oct1 = LocalDate.of(2026, 10, 1);
        LocalDate oct31 = LocalDate.of(2026, 10, 31);

        // Simulate 22 days * 7 periods = 154 working periods
        List<DailyPeriodAttendance> mockRecords = new ArrayList<>();

        // Student 1: 140 Present, 14 Absent -> 140/154 = 90.91%
        for (int day = 1; day <= 20; day++) {
            for (int p = 1; p <= 7; p++) {
                mockRecords.add(DailyPeriodAttendance.builder()
                        .studentId("stu-1")
                        .attendanceDate(LocalDate.of(2026, 10, day))
                        .period(p)
                        .status("PRESENT")
                        .build());
            }
        }
        for (int day = 21; day <= 22; day++) {
            for (int p = 1; p <= 7; p++) {
                mockRecords.add(DailyPeriodAttendance.builder()
                        .studentId("stu-1")
                        .attendanceDate(LocalDate.of(2026, 10, day))
                        .period(p)
                        .status("ABSENT")
                        .build());
            }
        }

        // Student 2: 110 Present, 44 Absent -> 110/154 = 71.43% (Below 75% threshold!)
        for (int day = 1; day <= 15; day++) {
            for (int p = 1; p <= 7; p++) {
                mockRecords.add(DailyPeriodAttendance.builder()
                        .studentId("stu-2")
                        .attendanceDate(LocalDate.of(2026, 10, day))
                        .period(p)
                        .status((day <= 15 && p <= 5) || day <= 10 ? "PRESENT" : "ABSENT")
                        .build());
            }
        }

        when(periodAttendanceRepository.findByDepartmentIgnoreCaseAndAttendanceDateBetween(dept, oct1, oct31))
                .thenReturn(mockRecords);

        MonthlyClassReportDTO report = dailyAttendanceService.calculateMonthlyReport(dept, 2026, 10, 75.0);

        assertNotNull(report);
        assertEquals(154, report.workingPeriods());
        assertEquals(2, report.students().size());

        MonthlyStudentReportDTO s1Report = report.students().get(0); // 101
        assertEquals("101", s1Report.rollNumber());
        assertEquals(154, s1Report.workingPeriods());
        assertEquals(140, s1Report.presentPeriods());
        assertEquals(14, s1Report.absentPeriods());
        assertEquals(90.91, s1Report.attendancePercentage());
        assertFalse(s1Report.belowThreshold());

        MonthlyStudentReportDTO s2Report = report.students().get(1); // 102
        assertEquals("102", s2Report.rollNumber());
        assertTrue(s2Report.attendancePercentage() < 75.0);
        assertTrue(s2Report.belowThreshold(), "Student 2 should be flagged as below 75% threshold");
    }

    @Test
    @DisplayName("Module 5: CSV export matches exact PDF Page 4 layout")
    void testCsvExport() {
        when(studentRepository.findByBranchIgnoreCaseOrderByRollNumberAsc(dept))
                .thenReturn(List.of(student1));

        LocalDate oct1 = LocalDate.of(2026, 10, 1);
        LocalDate oct31 = LocalDate.of(2026, 10, 31);

        // 10 Present, 0 Absent out of 10
        List<DailyPeriodAttendance> records = new ArrayList<>();
        for (int p = 1; p <= 7; p++) {
            records.add(DailyPeriodAttendance.builder()
                    .studentId("stu-1")
                    .attendanceDate(LocalDate.of(2026, 10, 1))
                    .period(p)
                    .status("PRESENT")
                    .build());
        }

        when(periodAttendanceRepository.findByDepartmentIgnoreCaseAndAttendanceDateBetween(dept, oct1, oct31))
                .thenReturn(records);

        byte[] csvBytes = dailyAttendanceService.generateMonthlyReportCsv(dept, 2026, 10, 75.0);
        String csv = new String(csvBytes, StandardCharsets.UTF_8);

        assertTrue(csv.startsWith("Roll No.,Student,Working periods,Present,Absent,Attendance\n"));
        assertTrue(csv.contains("101,Student 1,7,7,0,100.00%"));
    }
}
