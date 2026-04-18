package ct01.n06.backend.dto.evidence;

public record ReviewEvidenceDeclarationRequest(
    Long criteriaId,
    String reviewNote
) {
}
