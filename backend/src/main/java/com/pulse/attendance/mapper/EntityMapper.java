package com.pulse.attendance.mapper;

import com.pulse.attendance.dto.response.Responses.AdminDTO;
import com.pulse.attendance.dto.response.Responses.AttendanceDTO;
import com.pulse.attendance.dto.response.Responses.FacultyDTO;
import com.pulse.attendance.dto.response.Responses.SessionDTO;
import com.pulse.attendance.dto.response.Responses.StudentDTO;
import com.pulse.attendance.entity.Admin;
import com.pulse.attendance.entity.Attendance;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.entity.Session;
import com.pulse.attendance.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EntityMapper {
    EntityMapper INSTANCE = Mappers.getMapper(EntityMapper.class);

    AdminDTO toAdminDTO(Admin admin);

    FacultyDTO toFacultyDTO(Faculty faculty);

    @Mapping(source = "createdBy.id", target = "createdBy")
    StudentDTO toStudentDTO(Student student);
    List<StudentDTO> toStudentDTOs(List<Student> students);

    @Mapping(source = "faculty.id", target = "facultyId")
    @Mapping(source = "sessionType", target = "type")
    @Mapping(target = "attendees", ignore = true) // Set manually in service
    SessionDTO toSessionDTO(Session session);
    List<SessionDTO> toSessionDTOs(List<Session> sessions);

    @Mapping(source = "student.id", target = "studentId")
    @Mapping(source = "markedAt", target = "at")
    @Mapping(source = "distanceFromSession", target = "distance")
    AttendanceDTO toAttendanceDTO(Attendance attendance);
    List<AttendanceDTO> toAttendanceDTOs(List<Attendance> attendances);
}
