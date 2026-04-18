import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCurrentSemester } from "../../../hooks/useCurrentSemester";
import { useMonitorEvaluationList } from "../hooks/useMonitorEvaluationList";
import MonitorReviewModal from "./MonitorReviewModal";
import "../../../styles/MonitorClass.css";

const STATUS_DISPLAY = {
    SUBMITTED: { label: "SUBMITTED", badge: "badge-submitted" },
    MONITOR_APPROVED: { label: "MONITOR_APPROVED", badge: "badge-monitor_approved" },
    FINALIZED: { label: "FINALIZED", badge: "badge-finalized" },
    DRAFT: { label: "DRAFT", badge: "badge-draft" },
    OPEN: { label: "NOT_SUBMITTED", badge: "badge-not_submitted" },
};

function getInitials(name) {
    if (!name) return "NA";
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export default function MonitorScoreManagementTab() {
    const { user } = useAuth();

    const { semesters, activeSemesterId, loading: semesterLoading, error: semesterError } = useCurrentSemester();
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [activeModalStudent, setActiveModalStudent] = useState(null);

    useEffect(() => {
        if (activeSemesterId && !selectedSemester) {
            setSelectedSemester(activeSemesterId);
        }
    }, [activeSemesterId, selectedSemester]);

    const {
        students,
        stats,
        isLoading: listLoading,
        error: listError,
        fetchClassList,
    } = useMonitorEvaluationList(selectedSemester);

    useEffect(() => {
        if (selectedSemester) {
            fetchClassList();
        }
    }, [selectedSemester, fetchClassList]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return students.slice(start, start + itemsPerPage);
    }, [students, currentPage]);

    const totalPages = Math.ceil(students.length / itemsPerPage);

    const handleExportExcel = () => {
        const tableHeader = "<tr><th>MSSV</th><th>Họ và Tên</th><th>Điểm tổng kết</th><th>Trạng thái</th></tr>";
        const tableRows = students
            .map(
                (s) =>
                    `<tr><td>${s.studentCode}</td><td>${s.fullName}</td><td>${s.finalScore || "--"}</td><td>${s.status || "NOT_SUBMITTED"}</td></tr>`,
            )
            .join("");
        const excelHtml = `<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\"><head><meta charset=\"UTF-8\"/></head><body><table border=\"1\">${tableHeader}${tableRows}</table></body></html>`;

        const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Danh_Sach_Ren_Luyen.xls";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const loading = semesterLoading || listLoading;
    const error = semesterError || listError;

    if (loading && students.length === 0) {
        return <div style={{ padding: "40px", textAlign: "center" }}>Đang tải dữ liệu lớp...</div>;
    }

    if (error) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "#d32f2f" }}>
                Hệ thống báo lỗi: {error}
            </div>
        );
    }

    if (semesters.length === 0) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "#d32f2f" }}>
                Hệ thống chưa cấu hình học kỳ.
            </div>
        );
    }

    const selectedSemesterObj = semesters.find((s) => s.id === Number(selectedSemester));
    const semesterName = selectedSemesterObj?.name || "Học kỳ...";

    return (
        <div className="monitor-eval-container">
            <div className="monitor-eval-header">
                <div className="monitor-eval-title">
                    <h1>Quản lý phiếu điểm rèn luyện {user?.classCode ? `- Lớp ${user.classCode}` : ""}</h1>
                    <p>Theo dõi và phê duyệt kết quả rèn luyện học kỳ hiện tại của sinh viên.</p>
                </div>
                <div className="monitor-eval-controls">
                    <div className="monitor-semester-select">
                        <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#64748b" }}>
                            calendar_today
                        </span>
                        <select
                            value={selectedSemester || ""}
                            onChange={(e) => {
                                setSelectedSemester(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            {semesters.map((sem) => (
                                <option key={sem.id} value={sem.id}>
                                    {sem.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className="monitor-filter-btn" title={`Bộ lọc học kỳ: ${semesterName}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#64748b" }}>
                            filter_list
                        </span>
                    </button>
                </div>
            </div>

            <div className="monitor-stats-cards">
                <div className="monitor-stat-card">
                    <div className="stat-icon blue">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">TỔNG SỐ SINH VIÊN</span>
                        <span className="stat-value">{String(stats.total).padStart(2, "0")}</span>
                    </div>
                </div>

                <div className="monitor-stat-card">
                    <div className="stat-icon green">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div className="stat-info" style={{ width: "100%" }}>
                        <span className="stat-label">SỐ PHIẾU ĐÃ NỘP</span>
                        <span className="stat-value">{String(stats.submittedCount).padStart(2, "0")}</span>
                        <div className="stat-progress"></div>
                    </div>
                </div>

                <div className="monitor-stat-card">
                    <div className="stat-icon orange">
                        <span className="material-symbols-outlined">more_horiz</span>
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">SỐ PHIẾU CHƯA NỘP</span>
                        <span className="stat-value">{String(stats.notSubmittedCount).padStart(2, "0")}</span>
                        <span className="stat-subtext orange">Yêu cầu nhắc nhở</span>
                    </div>
                </div>
            </div>

            <div className="monitor-table-card">
                <div className="table-card-header">
                    <h2>Danh sách đánh giá điểm rèn luyện</h2>
                    <div className="table-actions" style={{ flexWrap: "wrap" }}>
                        <button className="action-export" onClick={handleExportExcel} style={{ whiteSpace: "nowrap" }}>
                            <span className="material-symbols-outlined">download</span>
                        </button>
                    </div>
                </div>

                <table className="monitor-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã sinh viên</th>
                            <th>Họ và tên</th>
                            <th style={{ textAlign: "center" }}>Điểm tổng kết</th>
                            <th style={{ textAlign: "center" }}>Trạng thái</th>
                            <th style={{ textAlign: "center" }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedStudents.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                                    Không có dữ liệu đánh giá cho học kỳ này.
                                </td>
                            </tr>
                        ) : (
                            paginatedStudents.map((student, index) => {
                                const sType = !student.status || student.status === "OPEN" ? "OPEN" : student.status;
                                const statusMeta = STATUS_DISPLAY[sType] || STATUS_DISPLAY.OPEN;

                                return (
                                    <tr key={student.studentId}>
                                        <td className="cell-stt">
                                            {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                                        </td>
                                        <td className="cell-code">{student.studentCode}</td>
                                        <td>
                                            <div className="cell-student">
                                                <div className="student-avatar">{getInitials(student.fullName)}</div>
                                                <div className="student-name">{student.fullName}</div>
                                            </div>
                                        </td>
                                        <td className="cell-score final" style={{ textAlign: "center" }}>
                                            {student.finalScore || "--"}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <span className={`status-badge ${statusMeta.badge}`}>{statusMeta.label}</span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <button
                                                className={student.status === "SUBMITTED" ? "btn-detail" : "btn-detail-view"}
                                                onClick={() => {
                                                    if (!student.evaluationId) {
                                                        alert("Sinh viên này chưa tạo phiếu đánh giá.");
                                                        return;
                                                    }
                                                    setActiveModalStudent(student);
                                                }}
                                            >
                                                {student.status === "SUBMITTED" ? "Xem chi tiết / Duyệt" : "Xem chi tiết"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {students.length > 0 && (
                    <div className="table-footer">
                        <div className="table-info">Hiển thị {paginatedStudents.length} trong số {students.length} sinh viên</div>
                        <div className="table-pagination">
                            <button
                                className="page-btn"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                                    chevron_left
                                </span>
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`page-btn ${currentPage === page ? "active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="page-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                                    chevron_right
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {activeModalStudent && (
                <MonitorReviewModal
                    evaluationId={activeModalStudent.evaluationId}
                    studentName={activeModalStudent.fullName}
                    studentCode={activeModalStudent.studentCode}
                    isReadOnly={activeModalStudent.status !== "SUBMITTED"}
                    onClose={() => setActiveModalStudent(null)}
                    onSuccess={() => {
                        setActiveModalStudent(null);
                        fetchClassList();
                    }}
                />
            )}
        </div>
    );
}
