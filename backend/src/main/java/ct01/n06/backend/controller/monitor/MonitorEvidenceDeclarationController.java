package ct01.n06.backend.controller.monitor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ct01.n06.backend.dto.evidence.EvidenceDeclarationDetailResponse;
import ct01.n06.backend.dto.evidence.EvidenceDeclarationListResponse;
import ct01.n06.backend.dto.evidence.ReviewEvidenceDeclarationRequest;
import ct01.n06.backend.entity.enums.RecordStatus;
import ct01.n06.backend.service.EvidenceDeclarationService;
import ct01.n06.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/monitor/evidence-declarations")
@RequiredArgsConstructor
public class MonitorEvidenceDeclarationController {

  private final EvidenceDeclarationService evidenceDeclarationService;
  private final UserService userService;

  @PreAuthorize("hasRole('MONITOR')")
  @GetMapping
  public EvidenceDeclarationListResponse getDeclarations(
      @RequestParam(required = false) RecordStatus status,
      @RequestParam(required = false) Long semesterId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return evidenceDeclarationService.getMonitorDeclarations(
        userService.requireCurrentUserId(), status, semesterId, page, size);
  }

  @PreAuthorize("hasRole('MONITOR')")
  @GetMapping("/{declarationId}")
  public EvidenceDeclarationDetailResponse getDeclarationDetail(@PathVariable Long declarationId) {
    return evidenceDeclarationService.getMonitorDeclarationDetail(
        userService.requireCurrentUserId(), declarationId);
  }

  @PreAuthorize("hasRole('MONITOR')")
  @PostMapping("/{declarationId}/approve")
  public EvidenceDeclarationDetailResponse approveMonitorDeclaration(
      @PathVariable Long declarationId,
      @RequestBody @Valid ReviewEvidenceDeclarationRequest request) {
    return evidenceDeclarationService.approveMonitorDeclaration(
        userService.requireCurrentUserId(), declarationId, request);
  }

  @PreAuthorize("hasRole('MONITOR')")
  @PostMapping("/{declarationId}/reject")
  public EvidenceDeclarationDetailResponse rejectMonitorDeclaration(
      @PathVariable Long declarationId,
      @RequestBody @Valid ReviewEvidenceDeclarationRequest request) {
    return evidenceDeclarationService.rejectMonitorDeclaration(
        userService.requireCurrentUserId(), declarationId, request);
  }
}
