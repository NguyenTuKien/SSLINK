package ct01.n06.backend.service;

import ct01.n06.backend.dto.common.SimpleMessageResponse;
import ct01.n06.backend.dto.evidence.CreateEvidenceDeclarationRequest;
import ct01.n06.backend.dto.evidence.EvidenceDeclarationDetailResponse;
import ct01.n06.backend.dto.evidence.EvidenceDeclarationListResponse;
import ct01.n06.backend.dto.evidence.ReviewEvidenceDeclarationRequest;
import ct01.n06.backend.dto.evidence.UpdateEvidenceDeclarationRequest;
import ct01.n06.backend.entity.enums.RecordStatus;

public interface EvidenceDeclarationService {

  EvidenceDeclarationDetailResponse createStudentDeclaration(String userId,
      CreateEvidenceDeclarationRequest request);

  EvidenceDeclarationListResponse getStudentDeclarations(String userId, RecordStatus status,
      Long semesterId, int page, int size);

  EvidenceDeclarationDetailResponse getStudentDeclarationDetail(String userId, Long declarationId);

  EvidenceDeclarationDetailResponse updateStudentDeclaration(String userId, Long declarationId,
      UpdateEvidenceDeclarationRequest request);

  SimpleMessageResponse deleteStudentDeclaration(String userId, Long declarationId);

  EvidenceDeclarationListResponse getMonitorDeclarations(String userId, RecordStatus status,
      Long semesterId, int page, int size);

  EvidenceDeclarationDetailResponse getMonitorDeclarationDetail(String userId, Long declarationId);

  EvidenceDeclarationDetailResponse approveMonitorDeclaration(String userId, Long declarationId,
      ReviewEvidenceDeclarationRequest request);

  EvidenceDeclarationDetailResponse rejectMonitorDeclaration(String userId, Long declarationId,
      ReviewEvidenceDeclarationRequest request);

}
