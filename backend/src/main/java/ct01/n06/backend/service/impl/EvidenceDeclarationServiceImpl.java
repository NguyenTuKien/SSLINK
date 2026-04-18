package ct01.n06.backend.service.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import ct01.n06.backend.dto.common.SimpleMessageResponse;
import ct01.n06.backend.dto.evidence.CreateEvidenceDeclarationRequest;
import ct01.n06.backend.dto.evidence.EvidenceDeclarationDetailResponse;
import ct01.n06.backend.dto.evidence.EvidenceDeclarationItemResponse;
import ct01.n06.backend.dto.evidence.EvidenceDeclarationListResponse;
import ct01.n06.backend.dto.evidence.ReviewEvidenceDeclarationRequest;
import ct01.n06.backend.dto.evidence.UpdateEvidenceDeclarationRequest;
import ct01.n06.backend.entity.ClassEntity;
import ct01.n06.backend.entity.CriteriaEntity;
import ct01.n06.backend.entity.NotificationEntity;
import ct01.n06.backend.entity.NotificationRecipientEntity;
import ct01.n06.backend.entity.RecordEntity;
import ct01.n06.backend.entity.SemesterEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.entity.enums.NotificationType;
import ct01.n06.backend.entity.enums.RecordStatus;
import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.repository.ClassRepository;
import ct01.n06.backend.repository.CriteriaRepository;
import ct01.n06.backend.repository.NotificationRecipientRepository;
import ct01.n06.backend.repository.NotificationRepository;
import ct01.n06.backend.repository.RecordRepository;
import ct01.n06.backend.repository.SemesterRepository;
import ct01.n06.backend.repository.StudentRepository;
import ct01.n06.backend.service.EvidenceDeclarationService;

@Service
public class EvidenceDeclarationServiceImpl implements EvidenceDeclarationService {

  private static final DateTimeFormatter UI_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
  private static final int MAX_PAGE_SIZE = 100;

  private final RecordRepository recordRepository;
  private final StudentRepository studentRepository;
  private final ClassRepository classRepository;
  private final SemesterRepository semesterRepository;
  private final CriteriaRepository criteriaRepository;
  private final NotificationRepository notificationRepository;
  private final NotificationRecipientRepository notificationRecipientRepository;

  public EvidenceDeclarationServiceImpl(RecordRepository recordRepository,
      StudentRepository studentRepository,
      ClassRepository classRepository,
      SemesterRepository semesterRepository,
      CriteriaRepository criteriaRepository,
      NotificationRepository notificationRepository,
      NotificationRecipientRepository notificationRecipientRepository) {
    this.recordRepository = recordRepository;
    this.studentRepository = studentRepository;
    this.classRepository = classRepository;
    this.semesterRepository = semesterRepository;
    this.criteriaRepository = criteriaRepository;
    this.notificationRepository = notificationRepository;
    this.notificationRecipientRepository = notificationRecipientRepository;
  }

  @Override
  @Transactional
  public EvidenceDeclarationDetailResponse createStudentDeclaration(String userId,
      CreateEvidenceDeclarationRequest request) {
    StudentEntity student = getStudentByUserId(userId);
    SemesterEntity semester = getSemesterById(request.semesterId());

    validateUrl(request.evidenceUrl());

    RecordEntity declaration = RecordEntity.builder()
        .student(student)
        .semester(semester)
        .event(null)
        .criteria(null)
        .customName(request.customName().trim())
        .evidenceUrl(request.evidenceUrl().trim())
        .activityTime(request.activityDate().atStartOfDay())
        .status(RecordStatus.PENDING)
        .approver(null)
        .reviewNote(null)
        .reviewedAt(null)
        .build();

    return toDetailResponse(recordRepository.save(declaration));
  }

  @Override
  @Transactional(readOnly = true)
  public EvidenceDeclarationListResponse getStudentDeclarations(String userId, RecordStatus status,
      Long semesterId, int page, int size) {
    StudentEntity student = getStudentByUserId(userId);
    Page<RecordEntity> declarations = recordRepository.findEvidenceDeclarationsForStudent(
        student.getId(),
        status,
        semesterId,
      buildPageRequest(page, size)
    );
    return toListResponse(declarations);
  }

  @Override
  @Transactional(readOnly = true)
  public EvidenceDeclarationDetailResponse getStudentDeclarationDetail(String userId, Long declarationId) {
    StudentEntity student = getStudentByUserId(userId);
    RecordEntity declaration = getStudentDeclarationOrThrow(student.getId(), declarationId);
    return toDetailResponse(declaration);
  }

  @Override
  @Transactional
  public EvidenceDeclarationDetailResponse updateStudentDeclaration(String userId, Long declarationId,
      UpdateEvidenceDeclarationRequest request) {
    StudentEntity student = getStudentByUserId(userId);
    RecordEntity declaration = getStudentDeclarationOrThrow(student.getId(), declarationId);

    ensurePending(declaration);
    validateUrl(request.evidenceUrl());

    declaration.setCustomName(request.customName().trim());
    declaration.setEvidenceUrl(request.evidenceUrl().trim());
    declaration.setActivityTime(request.activityDate().atStartOfDay());

    return toDetailResponse(recordRepository.save(declaration));
  }

  @Override
  @Transactional
  public SimpleMessageResponse deleteStudentDeclaration(String userId, Long declarationId) {
    StudentEntity student = getStudentByUserId(userId);
    RecordEntity declaration = getStudentDeclarationOrThrow(student.getId(), declarationId);

    ensurePending(declaration);
    recordRepository.delete(declaration);
    return new SimpleMessageResponse("Đã xóa minh chứng thành công.");
  }

  @Override
  @Transactional(readOnly = true)
  public EvidenceDeclarationListResponse getMonitorDeclarations(String userId, RecordStatus status,
      Long semesterId, int page, int size) {
    ClassEntity managedClass = getMonitorManagedClass(userId);
    Page<RecordEntity> declarations = recordRepository.findEvidenceDeclarationsForClass(
        managedClass.getId(),
        status,
        semesterId,
      buildPageRequest(page, size)
    );
    return toListResponse(declarations);
  }

  @Override
  @Transactional(readOnly = true)
  public EvidenceDeclarationDetailResponse getMonitorDeclarationDetail(String userId, Long declarationId) {
    ClassEntity managedClass = getMonitorManagedClass(userId);
    RecordEntity declaration = getDeclarationForClassScope(declarationId, managedClass.getId());
    return toDetailResponse(declaration);
  }

  @Override
  @Transactional
  public EvidenceDeclarationDetailResponse approveMonitorDeclaration(String userId, Long declarationId,
      ReviewEvidenceDeclarationRequest request) {
    return processMonitorReview(userId, declarationId, request, RecordStatus.APPROVED);
  }

  @Override
  @Transactional
  public EvidenceDeclarationDetailResponse rejectMonitorDeclaration(String userId, Long declarationId,
      ReviewEvidenceDeclarationRequest request) {
    return processMonitorReview(userId, declarationId, request, RecordStatus.REJECTED);
  }

  private EvidenceDeclarationDetailResponse processMonitorReview(String userId, Long declarationId,
      ReviewEvidenceDeclarationRequest request, RecordStatus targetStatus) {
    StudentEntity monitorStudent = getStudentByUserId(userId);
    ClassEntity managedClass = getManagedClassForMonitor(monitorStudent);
    RecordEntity declaration = getDeclarationForClassScope(declarationId, managedClass.getId());
    ensurePending(declaration);

    String reviewNote = normalizeReviewNote(request != null ? request.reviewNote() : null);

    CriteriaEntity criteria = resolveCriteriaForApproval(request, targetStatus);

    UserEntity approver = monitorStudent.getUserEntity();
    if (approver == null) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền duyệt minh chứng này.");
    }
    declaration.setStatus(targetStatus);
    declaration.setCriteria(criteria);
    declaration.setReviewNote(reviewNote);
    declaration.setApprover(approver);
    declaration.setReviewedAt(LocalDateTime.now());

    RecordEntity saved = recordRepository.save(declaration);
    createResultNotification(saved, targetStatus == RecordStatus.APPROVED);
    return toDetailResponse(saved);
  }

  private CriteriaEntity resolveCriteriaForApproval(ReviewEvidenceDeclarationRequest request,
      RecordStatus targetStatus) {
    if (targetStatus != RecordStatus.APPROVED) {
      return null;
    }

    if (request == null || request.criteriaId() == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST,
          "Tiêu chí là bắt buộc khi duyệt minh chứng.");
    }

    return criteriaRepository.findById(request.criteriaId())
        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Tiêu chí không tồn tại."));
  }

  private StudentEntity getStudentByUserId(String userId) {
    return studentRepository.findByUserEntityId(userId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin sinh viên."));
  }

  private SemesterEntity getSemesterById(Long semesterId) {
    return semesterRepository.findById(semesterId)
        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Học kỳ không tồn tại."));
  }

  private RecordEntity getStudentDeclarationOrThrow(String studentId, Long declarationId) {
    return recordRepository.findByIdAndStudent_IdAndEventIsNull(declarationId, studentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy minh chứng."));
  }

  private RecordEntity getDeclarationForClassScope(Long declarationId, Long classId) {
    RecordEntity declaration = recordRepository.findByIdAndEventIsNull(declarationId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy minh chứng."));

    if (declaration.getStudent() == null
        || declaration.getStudent().getClassEntity() == null
        || !classId.equals(declaration.getStudent().getClassEntity().getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền duyệt minh chứng này.");
    }

    return declaration;
  }

  private ClassEntity getMonitorManagedClass(String userId) {
    StudentEntity monitorStudent = getStudentByUserId(userId);
    return getManagedClassForMonitor(monitorStudent);
  }

  private ClassEntity getManagedClassForMonitor(StudentEntity monitorStudent) {
    return classRepository.findByMonitor_Id(monitorStudent.getId())
        .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
            "Bạn không có quyền thao tác minh chứng."));
  }

  private void ensurePending(RecordEntity declaration) {
    if (declaration.getStatus() != RecordStatus.PENDING) {
      throw new ApiException(HttpStatus.CONFLICT,
          "Minh chứng đã được xử lý, không thể thay đổi thêm.");
    }
  }

  private void validateUrl(String url) {
    if (!StringUtils.hasText(url)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Đường dẫn minh chứng không được để trống.");
    }

    String normalized = url.trim().toLowerCase();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      throw new ApiException(HttpStatus.BAD_REQUEST,
          "Đường dẫn minh chứng phải bắt đầu bằng http:// hoặc https://");
    }
  }

  private String normalizeReviewNote(String reviewNote) {
    if (!StringUtils.hasText(reviewNote)) {
      return null;
    }
    return reviewNote.trim();
  }

  private void createResultNotification(RecordEntity declaration, boolean approved) {
    if (declaration.getStudent() == null) {
      return;
    }

    String statusLabel = approved ? "Đã duyệt" : "Từ chối";
    String title = "Kết quả duyệt minh chứng";
    String content = "Minh chứng '" + declaration.getCustomName() + "' đã được cập nhật trạng thái: "
        + statusLabel + ".";

    if (!approved && StringUtils.hasText(declaration.getReviewNote())) {
      content += " Lý do: " + declaration.getReviewNote();
    }

    NotificationEntity notification = NotificationEntity.builder()
        .sender(declaration.getApprover())
        .title(title)
        .content(content)
        .targetType(NotificationType.STUDENT)
        .classEntity(declaration.getStudent().getClassEntity())
        .attachmentName(null)
        .attachmentPath(null)
        .build();

    NotificationEntity saved = notificationRepository.save(notification);
    NotificationRecipientEntity recipient = NotificationRecipientEntity.builder()
        .notification(saved)
        .student(declaration.getStudent())
        .read(false)
        .readAt(null)
        .build();

    notificationRecipientRepository.save(recipient);
  }

  private EvidenceDeclarationListResponse toListResponse(Page<RecordEntity> page) {
    return new EvidenceDeclarationListResponse(
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.getContent().stream().map(this::toItemResponse).toList()
    );
  }

  private EvidenceDeclarationItemResponse toItemResponse(RecordEntity record) {
    return new EvidenceDeclarationItemResponse(
        record.getId(),
        record.getStudent() != null ? record.getStudent().getFullName() : null,
        record.getCustomName(),
        record.getEvidenceUrl(),
        record.getSemester() != null ? record.getSemester().getName() : null,
        formatDateTime(record.getActivityTime()),
        record.getStatus() != null ? record.getStatus().name() : RecordStatus.PENDING.name(),
        record.getReviewNote(),
        formatDateTime(record.getCreatedAt()),
        formatDateTime(record.getReviewedAt())
    );
  }

  private EvidenceDeclarationDetailResponse toDetailResponse(RecordEntity record) {
    return new EvidenceDeclarationDetailResponse(
        record.getId(),
        record.getStudent() != null ? record.getStudent().getId() : null,
        record.getStudent() != null ? record.getStudent().getFullName() : null,
        record.getStudent() != null && record.getStudent().getClassEntity() != null
            ? record.getStudent().getClassEntity().getId() : null,
        record.getStudent() != null && record.getStudent().getClassEntity() != null
            ? record.getStudent().getClassEntity().getClassCode() : null,
        record.getSemester() != null ? record.getSemester().getId() : null,
        record.getSemester() != null ? record.getSemester().getName() : null,
        record.getCriteria() != null ? record.getCriteria().getId() : null,
        record.getCriteria() != null ? record.getCriteria().getCode() : null,
        record.getCriteria() != null ? record.getCriteria().getName() : null,
        record.getCustomName(),
        record.getEvidenceUrl(),
        formatDateTime(record.getActivityTime()),
        record.getStatus() != null ? record.getStatus().name() : RecordStatus.PENDING.name(),
        record.getReviewNote(),
        record.getApprover() != null ? record.getApprover().getId() : null,
        record.getApprover() != null ? record.getApprover().getUsername() : null,
        formatDateTime(record.getCreatedAt()),
        formatDateTime(record.getReviewedAt())
    );
  }

  private String formatDateTime(LocalDateTime value) {
    return value != null ? value.format(UI_TIME_FORMAT) : null;
  }

  private PageRequest buildPageRequest(int page, int size) {
    return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
  }
}
