package ct01.n06.backend.controller.student;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ct01.n06.backend.dto.common.SimpleMessageResponse;
import ct01.n06.backend.dto.evidence.CreateEvidenceDeclarationRequest;
import ct01.n06.backend.dto.evidence.EvidenceDeclarationDetailResponse;
import ct01.n06.backend.dto.evidence.EvidenceDeclarationListResponse;
import ct01.n06.backend.dto.evidence.UpdateEvidenceDeclarationRequest;
import ct01.n06.backend.entity.enums.RecordStatus;
import ct01.n06.backend.service.EvidenceDeclarationService;
import ct01.n06.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/student/evidence-declarations")
@RequiredArgsConstructor
public class StudentEvidenceDeclarationController {

  private final EvidenceDeclarationService evidenceDeclarationService;
  private final UserService userService;

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @PostMapping
  public EvidenceDeclarationDetailResponse createDeclaration(
      @RequestBody @Valid CreateEvidenceDeclarationRequest request) {
    return evidenceDeclarationService.createStudentDeclaration(userService.requireCurrentUserId(), request);
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping
  public EvidenceDeclarationListResponse getDeclarations(
      @RequestParam(required = false) RecordStatus status,
      @RequestParam(required = false) Long semesterId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return evidenceDeclarationService.getStudentDeclarations(userService.requireCurrentUserId(), status,
        semesterId, page, size);
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping("/{declarationId}")
  public EvidenceDeclarationDetailResponse getDeclarationDetail(@PathVariable Long declarationId) {
    return evidenceDeclarationService.getStudentDeclarationDetail(userService.requireCurrentUserId(), declarationId);
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @PutMapping("/{declarationId}")
  public EvidenceDeclarationDetailResponse updateDeclaration(@PathVariable Long declarationId,
      @RequestBody @Valid UpdateEvidenceDeclarationRequest request) {
    return evidenceDeclarationService.updateStudentDeclaration(userService.requireCurrentUserId(), declarationId,
        request);
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @DeleteMapping("/{declarationId}")
  public SimpleMessageResponse deleteDeclaration(@PathVariable Long declarationId) {
    return evidenceDeclarationService.deleteStudentDeclaration(userService.requireCurrentUserId(), declarationId);
  }
}
