package com.pulse.attendance.service;

import com.pulse.attendance.dto.response.Responses.*;
import com.pulse.attendance.entity.Batch;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.repository.BatchAttendanceRecordRepository;
import com.pulse.attendance.repository.BatchRepository;
import com.pulse.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final BatchAttendanceRecordRepository attendanceRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    // ──────────────────────────────────────────────────────────────────────────
    // IMPORT
    // ──────────────────────────────────────────────────────────────────────────

    public record StudentRow(String name, String rollNumber, String email, String errorReason) {
        public boolean isValid() { return errorReason == null; }
    }

    public List<StudentRow> parseStudentExcel(MultipartFile file) {
        List<StudentRow> rows = new ArrayList<>();
        try (InputStream is = file.getInputStream();
             Workbook wb = WorkbookFactory.create(is)) {

            Sheet sheet = wb.getSheetAt(0);
            boolean firstRow = true;

            // Track within-file duplicates
            Set<String> seenRolls = new LinkedHashSet<>();
            Set<String> seenEmails = new LinkedHashSet<>();

            for (Row row : sheet) {
                if (firstRow) { firstRow = false; continue; } // skip header
                if (isRowEmpty(row)) continue;

                String name  = getCellString(row, 0);
                String roll  = getCellString(row, 1);
                String email = getCellString(row, 2);

                // Validation
                List<String> errors = new ArrayList<>();
                if (name.isBlank())  errors.add("Name is empty");
                if (roll.isBlank())  errors.add("Roll Number is empty");
                if (email.isBlank()) errors.add("Email is empty");
                else if (!EMAIL_PATTERN.matcher(email).matches()) errors.add("Invalid email format: " + email);

                if (!roll.isBlank() && seenRolls.contains(roll.toLowerCase()))
                    errors.add("Duplicate roll number in file: " + roll);
                if (!email.isBlank() && seenEmails.contains(email.toLowerCase()))
                    errors.add("Duplicate email in file: " + email);

                if (!errors.isEmpty()) {
                    rows.add(new StudentRow(name, roll, email, String.join("; ", errors)));
                } else {
                    seenRolls.add(roll.toLowerCase());
                    seenEmails.add(email.toLowerCase());
                    rows.add(new StudentRow(name, roll, email, null));
                }
            }
        } catch (IOException e) {
            throw new ApiException("Failed to parse Excel file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
        return rows;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TEMPLATE
    // ──────────────────────────────────────────────────────────────────────────

    public byte[] generateStudentTemplate() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Students");

            CellStyle headerStyle = createHeaderStyle(wb);
            Row header = sheet.createRow(0);
            String[] cols = {"Name", "Roll Number", "Email"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 7000);
            }
            // Sample row
            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("John Doe");
            sample.createCell(1).setCellValue("22A91A0501");
            sample.createCell(2).setCellValue("john.doe@example.com");

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new ApiException("Failed to generate template", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // BATCH CREATION REPORT (includes generated passwords)
    // ──────────────────────────────────────────────────────────────────────────

    public byte[] generateBatchCreationReport(String batchId, List<StudentWithPasswordDTO> studentsWithPasswords) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ApiException("Batch not found", HttpStatus.NOT_FOUND));

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Batch Report");

            CellStyle headerStyle = createHeaderStyle(wb);
            CellStyle subHeaderStyle = createSubHeaderStyle(wb);
            CellStyle notMarkedStyle = createNotMarkedStyle(wb);
            CellStyle dateStyle = createDateStyle(wb);

            // Generate date list
            List<LocalDate> dates = getDates(batch.getStartDate(), batch.getEndDate());

            // ── Header row 1: Batch Info merged ──────────────────────────────
            Row batchInfoRow = sheet.createRow(0);
            int totalCols = 4 + dates.size() * 2; // Roll, Name, Email, Password, + FN/AN per date
            Cell batchCell = batchInfoRow.createCell(0);
            batchCell.setCellValue("Batch: " + batch.getBatchName() +
                    " | Faculty: " + batch.getFacultyName() +
                    " | Period: " + batch.getStartDate().format(DATE_FMT) + " - " + batch.getEndDate().format(DATE_FMT));
            batchCell.setCellStyle(subHeaderStyle);
            if (totalCols > 1) sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, totalCols - 1));

            // ── Header row 2: Faculty Info ────────────────────────────────────
            Row facultyRow = sheet.createRow(1);
            Cell facultyCell = facultyRow.createCell(0);
            facultyCell.setCellValue("Faculty Email: " + batch.getFacultyEmail() +
                    " | Faculty Mobile: " + batch.getFacultyMobile());
            facultyCell.setCellStyle(subHeaderStyle);
            if (totalCols > 1) sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, totalCols - 1));

            // ── Header row 3: Date columns (merged FN/AN) ─────────────────────
            Row dateRow = sheet.createRow(2);
            Cell rollH = dateRow.createCell(0); rollH.setCellValue("Roll No"); rollH.setCellStyle(headerStyle);
            Cell nameH = dateRow.createCell(1); nameH.setCellValue("Name"); nameH.setCellStyle(headerStyle);
            Cell emailH = dateRow.createCell(2); emailH.setCellValue("Email"); emailH.setCellStyle(headerStyle);
            Cell passH = dateRow.createCell(3); passH.setCellValue("Password"); passH.setCellStyle(headerStyle);

            int colIdx = 4;
            for (LocalDate d : dates) {
                Cell dateCell = dateRow.createCell(colIdx);
                dateCell.setCellValue(d.format(DATE_FMT));
                dateCell.setCellStyle(dateStyle);
                sheet.addMergedRegion(new CellRangeAddress(2, 2, colIdx, colIdx + 1));
                colIdx += 2;
            }

            // ── Header row 4: FN/AN subheaders ───────────────────────────────
            Row sessionRow = sheet.createRow(3);
            sessionRow.createCell(0).setCellStyle(headerStyle);
            sessionRow.createCell(1).setCellStyle(headerStyle);
            sessionRow.createCell(2).setCellStyle(headerStyle);
            sessionRow.createCell(3).setCellStyle(headerStyle);
            colIdx = 4;
            for (LocalDate ignored : dates) {
                Cell fn = sessionRow.createCell(colIdx);
                fn.setCellValue("FN"); fn.setCellStyle(headerStyle);
                Cell an = sessionRow.createCell(colIdx + 1);
                an.setCellValue("AN"); an.setCellStyle(headerStyle);
                colIdx += 2;
            }

            // ── Data rows ─────────────────────────────────────────────────────
            int rowIdx = 4;
            for (StudentWithPasswordDTO s : studentsWithPasswords) {
                Row dataRow = sheet.createRow(rowIdx++);
                dataRow.createCell(0).setCellValue(s.rollNumber());
                dataRow.createCell(1).setCellValue(s.name());
                dataRow.createCell(2).setCellValue(s.email());
                dataRow.createCell(3).setCellValue(s.plainPassword());
                colIdx = 4;
                for (LocalDate ignored : dates) {
                    Cell fn = dataRow.createCell(colIdx);
                    fn.setCellValue("Not Marked"); fn.setCellStyle(notMarkedStyle);
                    Cell an = dataRow.createCell(colIdx + 1);
                    an.setCellValue("Not Marked"); an.setCellStyle(notMarkedStyle);
                    colIdx += 2;
                }
            }

            // Auto-size first 4 columns
            for (int i = 0; i < 4; i++) sheet.autoSizeColumn(i);

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new ApiException("Failed to generate batch creation report", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ATTENDANCE REPORT (latest data from DB)
    // ──────────────────────────────────────────────────────────────────────────

    public byte[] generateAttendanceReport(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ApiException("Batch not found", HttpStatus.NOT_FOUND));
        List<Student> students = studentRepository.findByBatchId(batchId);
        List<LocalDate> dates = getDates(batch.getStartDate(), batch.getEndDate());

        // Load all attendance records for this batch
        var allRecords = attendanceRepository.findByBatchIdOrderByAttendanceDateAscSessionAsc(batchId);
        // Index: studentId -> date -> session -> status
        Map<String, Map<LocalDate, Map<String, String>>> index = buildIndex(allRecords);

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Attendance Report");

            CellStyle headerStyle = createHeaderStyle(wb);
            CellStyle subHeaderStyle = createSubHeaderStyle(wb);
            CellStyle presentStyle = createPresentStyle(wb);
            CellStyle absentStyle = createAbsentStyle(wb);
            CellStyle notMarkedStyle = createNotMarkedStyle(wb);
            CellStyle dateStyle = createDateStyle(wb);
            CellStyle summaryStyle = createSummaryStyle(wb);

            int totalDataCols = 3 + dates.size() * 2 + 6; // Roll,Name,Email, dates*2, stats

            // Row 0: Batch info
            Row r0 = sheet.createRow(0);
            Cell c0 = r0.createCell(0);
            c0.setCellValue("Batch: " + batch.getBatchName() +
                    " | Faculty: " + batch.getFacultyName() +
                    " | Period: " + batch.getStartDate().format(DATE_FMT) + " to " + batch.getEndDate().format(DATE_FMT));
            c0.setCellStyle(subHeaderStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, totalDataCols - 1));

            // Row 1: Faculty info
            Row r1 = sheet.createRow(1);
            Cell c1 = r1.createCell(0);
            c1.setCellValue("Faculty Email: " + batch.getFacultyEmail() + " | Mobile: " + batch.getFacultyMobile());
            c1.setCellStyle(subHeaderStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, totalDataCols - 1));

            // Row 2: Date headers
            Row dateRow = sheet.createRow(2);
            Cell hRoll = dateRow.createCell(0); hRoll.setCellValue("Roll No"); hRoll.setCellStyle(headerStyle);
            Cell hName = dateRow.createCell(1); hName.setCellValue("Name"); hName.setCellStyle(headerStyle);
            Cell hEmail = dateRow.createCell(2); hEmail.setCellValue("Email"); hEmail.setCellStyle(headerStyle);
            int ci = 3;
            for (LocalDate d : dates) {
                Cell dc = dateRow.createCell(ci);
                dc.setCellValue(d.format(DATE_FMT));
                dc.setCellStyle(dateStyle);
                sheet.addMergedRegion(new CellRangeAddress(2, 2, ci, ci + 1));
                ci += 2;
            }
            // Summary headers
            String[] summaryHeaders = {"Present", "Absent", "Not Marked", "Total", "Att%"};
            for (String sh : summaryHeaders) {
                Cell shCell = dateRow.createCell(ci++);
                shCell.setCellValue(sh);
                shCell.setCellStyle(summaryStyle);
            }

            // Row 3: FN/AN subheaders
            Row sessionRow = sheet.createRow(3);
            for (int i = 0; i < 3; i++) sessionRow.createCell(i).setCellStyle(headerStyle);
            ci = 3;
            for (LocalDate ignored : dates) {
                Cell fn = sessionRow.createCell(ci++); fn.setCellValue("FN"); fn.setCellStyle(headerStyle);
                Cell an = sessionRow.createCell(ci++); an.setCellValue("AN"); an.setCellStyle(headerStyle);
            }
            for (String ignored : summaryHeaders) sessionRow.createCell(ci++).setCellStyle(summaryStyle);

            // Data rows
            int rowIdx = 4;
            for (Student s : students) {
                Row dataRow = sheet.createRow(rowIdx++);
                dataRow.createCell(0).setCellValue(s.getRollNumber() != null ? s.getRollNumber() : s.getStudentId());
                dataRow.createCell(1).setCellValue(s.getName());
                dataRow.createCell(2).setCellValue(s.getEmail());

                long present = 0, absent = 0, notMarked = 0;
                ci = 3;
                for (LocalDate d : dates) {
                    for (String sess : List.of("FN", "AN")) {
                        String status = index
                                .getOrDefault(s.getId(), Map.of())
                                .getOrDefault(d, Map.of())
                                .getOrDefault(sess, "NOT_MARKED");
                        Cell cell = dataRow.createCell(ci++);
                        switch (status) {
                            case "PRESENT"    -> { cell.setCellValue("P"); cell.setCellStyle(presentStyle); present++; }
                            case "ABSENT"     -> { cell.setCellValue("A"); cell.setCellStyle(absentStyle); absent++; }
                            default           -> { cell.setCellValue("-"); cell.setCellStyle(notMarkedStyle); notMarked++; }
                        }
                    }
                }
                long total = dates.size() * 2L;
                int pct = total > 0 ? (int) ((present * 100) / total) : 0;
                dataRow.createCell(ci++).setCellValue(present);
                dataRow.createCell(ci++).setCellValue(absent);
                dataRow.createCell(ci++).setCellValue(notMarked);
                dataRow.createCell(ci++).setCellValue(total);
                dataRow.createCell(ci).setCellValue(pct + "%");
            }

            for (int i = 0; i < 3; i++) sheet.autoSizeColumn(i);

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new ApiException("Failed to generate attendance report", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    public List<LocalDate> getDates(LocalDate start, LocalDate end) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate d = start;
        while (!d.isAfter(end)) {
            dates.add(d);
            d = d.plusDays(1);
        }
        return dates;
    }

    private Map<String, Map<LocalDate, Map<String, String>>> buildIndex(
            List<com.pulse.attendance.entity.BatchAttendanceRecord> records) {
        Map<String, Map<LocalDate, Map<String, String>>> idx = new HashMap<>();
        for (var r : records) {
            idx.computeIfAbsent(r.getStudentId(), k -> new HashMap<>())
               .computeIfAbsent(r.getAttendanceDate(), k -> new HashMap<>())
               .put(r.getSession(), r.getStatus());
        }
        return idx;
    }

    private boolean isRowEmpty(Row row) {
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellString(row, cell.getColumnIndex()).isBlank())
                return false;
        }
        return true;
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                // Handle numeric values (roll numbers stored as numbers)
                double val = cell.getNumericCellValue();
                yield val == Math.floor(val) ? String.valueOf((long) val) : String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getRichStringCellValue().getString().trim();
            default      -> "";
        };
    }

    // ─── Cell Style Factories ─────────────────────────────────────────────────

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private CellStyle createSubHeaderStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return s;
    }

    private CellStyle createDateStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderBottom(BorderStyle.THIN);
        return s;
    }

    private CellStyle createPresentStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        return s;
    }

    private CellStyle createAbsentStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(IndexedColors.ROSE.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        return s;
    }

    private CellStyle createNotMarkedStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        return s;
    }

    private CellStyle createSummaryStyle(Workbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true);
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setBorderLeft(BorderStyle.MEDIUM);
        return s;
    }
}
