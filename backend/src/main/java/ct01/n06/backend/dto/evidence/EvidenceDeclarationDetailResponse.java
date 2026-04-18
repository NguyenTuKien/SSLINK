package ct01.n06.backend.dto.evidence;

public record EvidenceDeclarationDetailResponse(
    Long id,
    String studentId,
    String studentName,
    Long classId,
    String classCode,
    Long semesterId,
    String semesterName,
    Long criteriaId,
    String criteriaCode,
    String criteriaName,
    String customName,
    String evidenceUrl,
    String activityTime,
    String status,
    String reviewNote,
    String approverId,
    String approverName,
    String createdAt,
    String reviewedAt
) {
}
