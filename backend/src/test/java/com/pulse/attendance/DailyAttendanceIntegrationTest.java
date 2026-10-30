package com.pulse.attendance;

import com.pulse.attendance.dto.request.Requests.BulkMarkDailyReq;
import com.pulse.attendance.dto.request.Requests.CreateStudentReq;
import com.pulse.attendance.dto.request.Requests.PeriodMarkReq;
import com.pulse.attendance.dto.request.Requests.SaveDailyAttendanceReq;
import com.pulse.attendance.dto.response.Responses.DailyAttendanceGridDTO;
import com.pulse.attendance.dto.response.Responses.MonthlyClassReportDTO;
import com.pulse.attendance.dto.response.Responses.StudentDTO;
import com.pulse.attendance.repository.DailyPeriodAttendanceRepository;
import com.pulse.attendance.repository.StudentRepository;
import com.pulse.attendance.service.DailyAttendanceService;
import com.pulse.attendance.service.StudentService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DailyAttendanceIntegrationTest {

    @Autowired
    private DailyAttendanceService dailyAttendanceService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private DailyPeriodAttendanceRepository periodRepository;

    @Autowired
    private StudentRepository studentRepository;

    private final String dept = "TEST_DEPT_DEVOPS";
    private final LocalDate testDate = LocalDate.of(2026, 10, 14);
    private StudentDTO s1;
    private StudentDTO s2;

    @BeforeEach
    void setupData() {
        cleanup();

        s1 = studentService.createStudent(null, new CreateStudentReq(
                "Test Student 1",
                "TEST_STU_001",
                "101",
                "test1@devops.edu",
                "1111111111",
                dept,
                "pwd123"
        ));

        s2 = studentService.createStudent(null, new CreateStudentReq(
                "Test Student 2",
                "TEST_STU_002",
                "102",
                "test2@devops.edu",
                "2222222222",
                dept,
                "pwd123"
        ));
    }

    @AfterEach
    void cleanup() {
        try {
            periodRepository.deleteByDepartmentIgnoreCaseAndAttendanceDate(dept, testDate);
            periodRepository.deleteByDepartmentIgnoreCaseAndAttendanceDate(dept, LocalDate.of(2026, 10, 15));
            var students = studentRepository.findByBranchIgnoreCase(dept);
            for (var s : students) {
                studentRepository.delete(s);
            }
        } catch (Exception ignored) {}
    }

    @Test
    @DisplayName("End-to-End: Save 7-period attendance, read grid, apply historical correction, and calculate monthly report")
    void testEndToEndDailyAndMonthlyFlow() {
        // 1. Save 7 periods for student 1 on 14/10/2026
        List<PeriodMarkReq> marks = new ArrayList<>();
        // P1-P5 Present, P6-P7 Absent
        for (int p = 1; p <= 5; p++) marks.add(new PeriodMarkReq(s1.id(), p, "PRESENT"));
        for (int p = 6; p <= 7; p++) marks.add(new PeriodMarkReq(s1.id(), p, "ABSENT"));

        // Student 2: P1-P7 all Present
        for (int p = 1; p <= 7; p++) marks.add(new PeriodMarkReq(s2.id(), p, "PRESENT"));

        DailyAttendanceGridDTO grid = dailyAttendanceService.saveDailyAttendance(
                new SaveDailyAttendanceReq(dept, testDate, marks), "test-faculty");

        assertNotNull(grid);
        assertEquals(2, grid.students().size());

        // Check student 1 periods
        var s1Grid = grid.students().stream().filter(s -> s.studentId().equals(s1.id())).findFirst().orElseThrow();
        assertEquals("PRESENT", s1Grid.periods().get(1));
        assertEquals("ABSENT", s1Grid.periods().get(6));

        // 2. Historical correction: Student 1 was actually PRESENT in period 6
        dailyAttendanceService.saveDailyAttendance(
                new SaveDailyAttendanceReq(dept, testDate, List.of(new PeriodMarkReq(s1.id(), 6, "PRESENT"))),
                "test-faculty");

        DailyAttendanceGridDTO updatedGrid = dailyAttendanceService.getDailyGrid(dept, testDate);
        var s1Updated = updatedGrid.students().stream().filter(s -> s.studentId().equals(s1.id())).findFirst().orElseThrow();
        assertEquals("PRESENT", s1Updated.periods().get(6)); // Corrected!

        // 3. Duplicate prevention: Verify total records for (s1, testDate, 6) is exactly 1
        var recs = periodRepository.findByDepartmentIgnoreCaseAndAttendanceDate(dept, testDate);
        long p6Count = recs.stream().filter(r -> r.getStudentId().equals(s1.id()) && r.getPeriod() == 6).count();
        assertEquals(1, p6Count, "Duplicate records must be prevented");

        // 4. Calculate monthly report for October 2026
        MonthlyClassReportDTO monthlyReport = dailyAttendanceService.calculateMonthlyReport(dept, 2026, 10, 75.0);
        assertNotNull(monthlyReport);
        assertEquals(7, monthlyReport.workingPeriods()); // 7 slots were conducted on Oct 14

        var s1Monthly = monthlyReport.students().stream().filter(s -> s.studentId().equals(s1.id())).findFirst().orElseThrow();
        // 6 present, 1 absent out of 7 -> 6/7 = 85.71%
        assertEquals(6, s1Monthly.presentPeriods());
        assertEquals(1, s1Monthly.absentPeriods());
        assertEquals(85.71, s1Monthly.attendancePercentage());
        assertFalse(s1Monthly.belowThreshold());

        // 5. Generate and verify CSV export
        byte[] csvBytes = dailyAttendanceService.generateMonthlyReportCsv(dept, 2026, 10, 75.0);
        String csv = new String(csvBytes, StandardCharsets.UTF_8);

        assertTrue(csv.contains("Roll No.,Student,Working periods,Present,Absent,Attendance"));
        assertTrue(csv.contains("101,Test Student 1,7,6,1,85.71%"));
        assertTrue(csv.contains("102,Test Student 2,7,7,0,100.00%"));
    }
}
