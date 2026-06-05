package com.pulse.attendance.service;

import com.pulse.attendance.dto.request.Requests.CreateBatchReq;
import com.pulse.attendance.dto.response.Responses.*;
import com.pulse.attendance.entity.Batch;
import com.pulse.attendance.entity.BatchAttendanceRecord;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.repository.BatchAttendanceRecordRepository;
import com.pulse.attendance.repository.BatchRepository;
import com.pulse.attendance.repository.FacultyRepository;
import com.pulse.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final BatchAttendanceRecordRepository attendanceRepository;
    private final ExcelService excelService;
    private final PasswordEncoder passwordEncoder;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    private static final SecureRandom RNG = new SecureRandom();

    // ─── List ─────────────────────────────────────────────────────────────────

    public List<BatchDTO> getAllBatches() {
        return batchRepository.findAll().stream()
                .sorted(Comparator.comparing(Batch::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BatchDTO> getBatchesForFaculty(String facultyId) {
        return batchRepository.findByFacultyIdOrderByCreatedAtDesc(facultyId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public BatchDTO getBatch(String batchId) {
        return toDTO(findBatch(batchId));
    }

    public List<StudentDTO> getBatchStudents(String batchId) {
        findBatch(batchId); // existence check
        return studentRepository.findByBatchId(batchId).stream()
                .map(this::toStudentDTO)
                .collect(Collectors.toList());
    }

    // ─── Attendance Grid ───────────────────────────────────────────────────────

    public BatchAttendanceGridDTO getAttendanceGrid(String batchId) {
        Batch batch = findBatch(batchId);
        List<Student> students = studentRepository.findByBatchId(batchId);
        List<LocalDate> dates = excelService.getDates(batch.getStartDate(), batch.getEndDate());
        var allRecords = attendanceRepository.findByBatchIdOrderByAttendanceDateAscSessionAsc(batchId);

        // Index: studentId -> date -> session -> record
        Map<String, Map<LocalDate, Map<String, BatchAttendanceRecord>>> index = new HashMap<>();
        for (var r : allRecords) {
            index.computeIfAbsent(r.getStudentId(), k -> new HashMap<>())
                 .computeIfAbsent(r.getAttendanceDate(), k -> new HashMap<>())
                 .put(r.getSession(), r);
        }

        List<BatchStudentRowDTO> rows = students.stream().map(s -> {
            List<BatchAttendanceRecordDTO> records = new ArrayList<>();
            long present = 0, absent = 0, notMarked = 0;
            for (LocalDate d : dates) {
                for (String sess : List.of("FN", "AN")) {
                    var rec = index.getOrDefault(s.getId(), Map.of())
                                   .getOrDefault(d, Map.of())
                                   .get(sess);
                    String status = rec != null ? rec.getStatus() : "NOT_MARKED";
                    String recId  = rec != null ? rec.getId() : null;
                    records.add(new BatchAttendanceRecordDTO(recId, s.getId(), s.getName(),
                            s.getRollNumber(), d, sess, status));
                    if ("PRESENT".equals(status)) present++;
                    else if ("ABSENT".equals(status)) absent++;
                    else notMarked++;
                }
            }
            long total = dates.size() * 2L;
            int pct = total > 0 ? (int)((present * 100) / total) : 0;
            return new BatchStudentRowDTO(s.getId(), s.getName(), s.getRollNumber(), s.getEmail(),
                    records, present, absent, notMarked, total, pct);
        }).collect(Collectors.toList());

        return new BatchAttendanceGridDTO(batch.getId(), batch.getBatchName(),
                batch.getStartDate(), batch.getEndDate(), rows);
    }

    // ─── Mark Attendance ──────────────────────────────────────────────────────

    @Transactional
    public BatchAttendanceRecordDTO markAttendance(String batchId, String studentId,
                                                    LocalDate date, String session, String status) {
        findBatch(batchId); // existence check
        validateStatus(status);
        validateSession(session);

        var existing = attendanceRepository
                .findByBatchIdAndStudentIdAndAttendanceDateAndSession(batchId, studentId, date, session);

        BatchAttendanceRecord record;
        if (existing.isPresent()) {
            record = existing.get();
            record.setStatus(status.toUpperCase());
        } else {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ApiException("Student not found", HttpStatus.NOT_FOUND));
            record = BatchAttendanceRecord.builder()
                    .batchId(batchId)
                    .studentId(studentId)
                    .studentName(student.getName())
                    .rollNumber(student.getRollNumber())
                    .attendanceDate(date)
                    .session(session.toUpperCase())
                    .status(status.toUpperCase())
                    .build();
        }
        record = attendanceRepository.save(record);
        return toAttendanceDTO(record);
    }

    @Transactional
    public void bulkMarkAttendance(String batchId, LocalDate date, String session, String status) {
        findBatch(batchId);
        validateStatus(status);
        validateSession(session);

        List<Student> students = studentRepository.findByBatchId(batchId);
        for (Student s : students) {
            markAttendance(batchId, s.getId(), date, session, status);
        }
    }

    // ─── Create Batch (main orchestration) ────────────────────────────────────

    @Transactional
    public BatchImportResultDTO createBatch(CreateBatchReq req, MultipartFile excelFile) {
        // 1. Validate batch name uniqueness
        if (batchRepository.existsByBatchName(req.batchName())) {
            throw new ApiException("Batch name already exists: " + req.batchName(), HttpStatus.BAD_REQUEST);
        }

        // 2. Validate dates
        if (req.endDate().isBefore(req.startDate())) {
            throw new ApiException("End date must be after start date", HttpStatus.BAD_REQUEST);
        }

        // 3. Resolve faculty
        Faculty faculty = resolveFaculty(req);

        // 4. Parse Excel
        List<ExcelService.StudentRow> parsed = excelService.parseStudentExcel(excelFile);

        // 5. Create batch entity
        Batch batch = Batch.builder()
                .batchName(req.batchName())
                .facultyId(faculty.getId())
                .facultyName(faculty.getName())
                .facultyEmail(faculty.getEmail())
                .facultyMobile(faculty.getMobile())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .build();
        batch = batchRepository.save(batch);

        // 6. Import students
        int imported = 0, dupSkipped = 0, invalidSkipped = 0;
        List<String> errors = new ArrayList<>();
        List<StudentWithPasswordDTO> studentsWithPwd = new ArrayList<>();

        for (ExcelService.StudentRow row : parsed) {
            if (!row.isValid()) {
                invalidSkipped++;
                errors.add("Row [" + row.rollNumber() + "]: " + row.errorReason());
                continue;
            }

            // Check DB duplicates
            if (studentRepository.existsByEmail(row.email())) {
                dupSkipped++;
                errors.add("Duplicate email (already in DB): " + row.email());
                continue;
            }
            if (StringUtils.hasText(row.rollNumber()) && studentRepository.existsByRollNumber(row.rollNumber())) {
                dupSkipped++;
                errors.add("Duplicate roll number (already in DB): " + row.rollNumber());
                continue;
            }

            // Generate credentials
            String plainPassword = generatePassword();
            String studentLoginId = generateStudentId(row.rollNumber(), batch.getId());

            Student student = Student.builder()
                    .studentId(studentLoginId)
                    .rollNumber(row.rollNumber())
                    .name(row.name())
                    .email(row.email())
                    .password(passwordEncoder.encode(plainPassword))
                    .batchId(batch.getId())
                    .batchName(batch.getBatchName())
                    .build();
            student = studentRepository.save(student);

            // Pre-generate attendance records
            generateAttendanceRecords(batch, student);

            studentsWithPwd.add(new StudentWithPasswordDTO(studentLoginId, row.rollNumber(), row.name(), row.email(), plainPassword));
            imported++;
        }

        // Update student count on batch
        batch.setStudentCount(imported);
        batchRepository.save(batch);

        return new BatchImportResultDTO(batch.getId(), batch.getBatchName(),
                parsed.size(), imported, dupSkipped, invalidSkipped, errors, studentsWithPwd);
    }

    // ─── Delete Batch ─────────────────────────────────────────────────────────

    @Transactional
    public void deleteBatch(String batchId) {
        Batch batch = findBatch(batchId);
        // Delete all attendance records
        attendanceRepository.deleteByBatchId(batchId);
        // Delete students belonging to batch
        List<Student> students = studentRepository.findByBatchId(batchId);
        studentRepository.deleteAll(students);
        // Delete batch
        batchRepository.delete(batch);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Faculty resolveFaculty(CreateBatchReq req) {
        // Option A: existing faculty by ID
        if (StringUtils.hasText(req.facultyId())) {
            return facultyRepository.findById(req.facultyId())
                    .orElseThrow(() -> new ApiException("Faculty not found with ID: " + req.facultyId(), HttpStatus.NOT_FOUND));
        }
        // Option B: find by email (reuse if exists)
        if (StringUtils.hasText(req.facultyEmail())) {
            var existing = facultyRepository.findByEmail(req.facultyEmail());
            if (existing.isPresent()) return existing.get();
            // Create new
            if (!StringUtils.hasText(req.facultyName()))
                throw new ApiException("Faculty name is required when creating a new faculty", HttpStatus.BAD_REQUEST);
            if (!StringUtils.hasText(req.facultyPassword()))
                throw new ApiException("Faculty password is required when creating a new faculty", HttpStatus.BAD_REQUEST);
            Faculty newFaculty = Faculty.builder()
                    .name(req.facultyName())
                    .email(req.facultyEmail())
                    .mobile(req.facultyMobile())
                    .password(passwordEncoder.encode(req.facultyPassword()))
                    .build();
            return facultyRepository.save(newFaculty);
        }
        throw new ApiException("Faculty must be specified (existing ID or new faculty details)", HttpStatus.BAD_REQUEST);
    }

    private void generateAttendanceRecords(Batch batch, Student student) {
        List<LocalDate> dates = excelService.getDates(batch.getStartDate(), batch.getEndDate());
        List<BatchAttendanceRecord> records = new ArrayList<>();
        for (LocalDate d : dates) {
            for (String sess : List.of("FN", "AN")) {
                records.add(BatchAttendanceRecord.builder()
                        .batchId(batch.getId())
                        .studentId(student.getId())
                        .studentName(student.getName())
                        .rollNumber(student.getRollNumber())
                        .attendanceDate(d)
                        .session(sess)
                        .status("NOT_MARKED")
                        .build());
            }
        }
        attendanceRepository.saveAll(records);
    }

    private String generatePassword() {
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) sb.append(CHARS.charAt(RNG.nextInt(CHARS.length())));
        return sb.toString();
    }

    private String generateStudentId(String rollNumber, String batchId) {
        // Use roll number as studentId if valid, otherwise generate
        if (StringUtils.hasText(rollNumber)) return rollNumber;
        return "STU" + batchId.substring(0, Math.min(6, batchId.length())).toUpperCase()
                + RNG.nextInt(10000);
    }

    private void validateStatus(String status) {
        if (!Set.of("PRESENT", "ABSENT", "NOT_MARKED").contains(status.toUpperCase())) {
            throw new ApiException("Invalid status. Must be PRESENT, ABSENT, or NOT_MARKED", HttpStatus.BAD_REQUEST);
        }
    }

    private void validateSession(String session) {
        if (!Set.of("FN", "AN").contains(session.toUpperCase())) {
            throw new ApiException("Invalid session. Must be FN or AN", HttpStatus.BAD_REQUEST);
        }
    }

    private Batch findBatch(String batchId) {
        return batchRepository.findById(batchId)
                .orElseThrow(() -> new ApiException("Batch not found: " + batchId, HttpStatus.NOT_FOUND));
    }

    // ─── DTO Mappers ──────────────────────────────────────────────────────────

    private BatchDTO toDTO(Batch b) {
        long count = studentRepository.findByBatchId(b.getId()).size();
        return new BatchDTO(b.getId(), b.getBatchName(), b.getFacultyId(), b.getFacultyName(),
                b.getFacultyEmail(), b.getFacultyMobile(), b.getStartDate(), b.getEndDate(),
                count, b.getCreatedAt());
    }

    private StudentDTO toStudentDTO(Student s) {
        return new StudentDTO(s.getId(), s.getStudentId(), s.getRollNumber(), s.getName(),
                s.getEmail(), s.getMobile(), s.getBranch(), s.getBatchId(), s.getBatchName(),
                s.getCreatedBy() != null ? s.getCreatedBy().getId() : null);
    }

    private BatchAttendanceRecordDTO toAttendanceDTO(BatchAttendanceRecord r) {
        return new BatchAttendanceRecordDTO(r.getId(), r.getStudentId(), r.getStudentName(),
                r.getRollNumber(), r.getAttendanceDate(), r.getSession(), r.getStatus());
    }
}
