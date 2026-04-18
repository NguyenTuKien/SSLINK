package ct01.n06.backend.service.impl;

import ct01.n06.backend.repository.RecordRepository;
import ct01.n06.backend.entity.RecordEntity;
import ct01.n06.backend.entity.enums.RecordStatus;
import ct01.n06.backend.service.RecordService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecordServiceImpl implements RecordService {

  private final RecordRepository recordRepository;

  @Override
  public Map<String, Double> calculateAutoScores(final String studentId, final Long semesterId) {
    final List<RecordEntity> records = this.recordRepository.findByStudent_IdAndSemester_IdAndStatus(
        studentId, semesterId, RecordStatus.APPROVED
    );

    final Map<String, Double> autoScores = new HashMap<>();
    for (final RecordEntity record : records) {
      if (record.getCriteria() == null || record.getCriteria().getPointPerItem() == null) {
        continue;
      }
      String criteriaCode = record.getCriteria().getCode();
      double point = record.getCriteria().getPointPerItem().doubleValue();
      autoScores.put(criteriaCode, autoScores.getOrDefault(criteriaCode, 0.0) + point);
    }
    return autoScores;
  }
}