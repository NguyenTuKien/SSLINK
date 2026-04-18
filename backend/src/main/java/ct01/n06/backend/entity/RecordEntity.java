package ct01.n06.backend.entity;

import ct01.n06.backend.constant.RecordConstant;
import ct01.n06.backend.entity.base.BaseJpaAuditingEntity;
import ct01.n06.backend.entity.enums.RecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = RecordConstant.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Builder
public class RecordEntity extends BaseJpaAuditingEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = RecordConstant.COL_ID)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = RecordConstant.COL_STUDENT_ID, nullable = false)
  private StudentEntity student;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = RecordConstant.COL_SEMESTER_ID, nullable = false)
  private SemesterEntity semester;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = RecordConstant.COL_EVENT_ID)
  private EventEntity event;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = RecordConstant.COL_CRITERIA_ID)
  private CriteriaEntity criteria;

  @Column(name = RecordConstant.COL_CUSTOM_NAME, length = 255)
  private String customName;

  @Column(name = RecordConstant.COL_EVIDENCE_URL, length = 500)
  private String evidenceUrl;

  @Column(name = RecordConstant.COL_ACTIVITY_TIME)
  private LocalDateTime activityTime;

  @Enumerated(EnumType.STRING)
  @Column(name = RecordConstant.COL_STATUS, length = 20)
  private RecordStatus status;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = RecordConstant.COL_APPROVER_ID)
  private UserEntity approver;

  @Column(name = RecordConstant.COL_REVIEW_NOTE, length = 1000)
  private String reviewNote;

  @Column(name = RecordConstant.COL_REVIEWED_AT)
  private LocalDateTime reviewedAt;
}