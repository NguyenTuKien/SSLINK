package ct01.n06.backend.dto.evidence;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateEvidenceDeclarationRequest(
    @NotNull(message = "Học kỳ là bắt buộc.")
    Long semesterId,
    @NotBlank(message = "Tên minh chứng không được để trống.")
    String customName,
    @NotBlank(message = "Đường dẫn minh chứng không được để trống.")
    String evidenceUrl,
    @NotNull(message = "Ngày hoạt động là bắt buộc.")
    LocalDate activityDate
) {
}
