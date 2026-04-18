package ct01.n06.backend.dto.evidence;

import java.util.List;

public record EvidenceDeclarationListResponse(
    int page,
    int size,
    long totalItems,
    int totalPages,
    List<EvidenceDeclarationItemResponse> items
) {
}
