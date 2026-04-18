package ct01.n06.backend.dto.evidence;

public record EvidenceDeclarationItemResponse(
    Long id,
    String studentName,
    String customName,
    String evidenceUrl,
    String semesterName,
    String activityTime,
    String status,
    String reviewNote,
    String createdAt,
    String reviewedAt
) {
}
