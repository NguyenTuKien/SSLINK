import { useCallback, useEffect, useState } from "react";
import {
    approveMonitorEvidenceDeclaration,
    getMonitorEvidenceDeclarationDetail,
    getMonitorEvidenceDeclarations,
    rejectMonitorEvidenceDeclaration,
} from "../../../api/evidenceDeclarationApi";
import { useCurrentSemester } from "../../../hooks/useCurrentSemester";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Từ chối" },
];

function statusLabel(status) {
    if (status === "APPROVED") return "Đã duyệt";
    if (status === "REJECTED") return "Từ chối";
    return "Chờ duyệt";
}

function statusPillClass(status) {
    if (status === "APPROVED") {
        return "border border-green-200 bg-green-50 text-green-700";
    }
    if (status === "REJECTED") {
        return "border border-red-200 bg-red-50 text-red-700";
    }
    return "border border-yellow-200 bg-yellow-50 text-yellow-700";
}

export default function MonitorEvidenceReviewTab() {
    const { semesters, activeSemesterId } = useCurrentSemester();
    const [selectedSemester, setSelectedSemester] = useState("");
    const [status, setStatus] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [workingId, setWorkingId] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");
    const [detailItem, setDetailItem] = useState(null);

    useEffect(() => {
        if (!selectedSemester && activeSemesterId) {
            setSelectedSemester(String(activeSemesterId));
        }
    }, [activeSemesterId, selectedSemester]);

    const loadData = useCallback(async () => {
        if (!selectedSemester) {
            setItems([]);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const payload = await getMonitorEvidenceDeclarations({
                semesterId: Number(selectedSemester),
                status: status || undefined,
                page: 0,
                size: 100,
            });
            setItems(Array.isArray(payload?.items) ? payload.items : []);
        } catch (err) {
            setError(err.message || "Không tải được danh sách minh chứng.");
        } finally {
            setLoading(false);
        }
    }, [selectedSemester, status]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const runReviewAction = useCallback(async (id, action) => {
        setWorkingId(id);
        setError("");
        try {
            if (action === "approve") {
                await approveMonitorEvidenceDeclaration(id, {});
            } else {
                await rejectMonitorEvidenceDeclaration(id, {});
            }
            await loadData();
        } catch (err) {
            setError(err.message || "Không thể xử lý minh chứng.");
        } finally {
            setWorkingId(null);
        }
    }, [loadData]);

    const handleApprove = async (id) => {
        await runReviewAction(id, "approve");
    };

    const handleReject = async (id) => {
        await runReviewAction(id, "reject");
    };

    const handleViewDetail = async (id) => {
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailError("");
        setDetailItem(null);

        try {
            const detail = await getMonitorEvidenceDeclarationDetail(id);
            setDetailItem(detail || null);
        } catch (err) {
            setDetailError(err.message || "Không tải được chi tiết minh chứng.");
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Duyệt minh chứng lớp</h2>
                    <p className="mt-1 text-sm text-slate-500">Lớp trưởng duyệt minh chứng của sinh viên trong lớp phụ trách.</p>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                    <option value="">Chọn học kỳ</option>
                    {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                            {semester.name}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value || "all"} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {error ? <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                        <tr className="border-b border-primary/10 text-xs uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-3">Ngày gửi</th>
                            <th className="px-3 py-3">Sinh viên</th>
                            <th className="px-3 py-3">Minh chứng</th>
                            <th className="px-3 py-3">Trạng thái</th>
                            <th className="px-3 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-3 py-6 text-sm text-slate-500">
                                    Đang tải minh chứng...
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-3 py-6 text-sm text-slate-500">
                                    Không có minh chứng trong bộ lọc hiện tại.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-primary/5 text-sm">
                                    <td className="px-3 py-3">{item.createdAt || "--"}</td>
                                    <td className="px-3 py-3">{item.studentName || "--"}</td>
                                    <td className="px-3 py-3">
                                        <div className="font-medium text-slate-800">{item.customName || "--"}</div>
                                        {item.reviewNote ? <div className="text-xs text-slate-500">Ghi chú: {item.reviewNote}</div> : null}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(item.status)}`}>
                                            {statusLabel(item.status)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        {item.status === "PENDING" ? (
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleApprove(item.id)}
                                                    title="Duyệt"
                                                    aria-label="Duyệt minh chứng"
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded bg-green-600 text-xs font-bold text-white disabled:opacity-50"
                                                    disabled={workingId === item.id}
                                                >
                                                    V
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReject(item.id)}
                                                    title="Từ chối"
                                                    aria-label="Từ chối minh chứng"
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded bg-red-600 text-xs font-bold text-white disabled:opacity-50"
                                                    disabled={workingId === item.id}
                                                >
                                                    X
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewDetail(item.id)}
                                                    className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewDetail(item.id)}
                                                    className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {detailOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Chi tiết minh chứng</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailOpen(false)}
                                className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div>

                        {detailLoading ? <p className="text-sm text-slate-500">Đang tải chi tiết...</p> : null}
                        {detailError ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{detailError}</p> : null}

                        {!detailLoading && !detailError && detailItem ? (
                            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                                <div>
                                    <span className="text-slate-500">Sinh viên: </span>
                                    <span className="font-semibold text-slate-800">{detailItem.studentName || "--"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Lớp: </span>
                                    <span className="font-semibold text-slate-800">{detailItem.classCode || "--"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Học kỳ: </span>
                                    <span className="font-semibold text-slate-800">{detailItem.semesterName || "--"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Trạng thái: </span>
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(detailItem.status)}`}>
                                        {statusLabel(detailItem.status)}
                                    </span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-slate-500">Tên minh chứng: </span>
                                    <span className="font-semibold text-slate-800">{detailItem.customName || "--"}</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-slate-500">Thời gian hoạt động: </span>
                                    <span className="font-semibold text-slate-800">{detailItem.activityTime || "--"}</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-slate-500">Đường dẫn minh chứng: </span>
                                    {detailItem.evidenceUrl ? (
                                        <a
                                            href={detailItem.evidenceUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-semibold text-primary hover:underline"
                                        >
                                            Mở tài liệu minh chứng
                                        </a>
                                    ) : (
                                        <span className="font-semibold text-slate-800">--</span>
                                    )}
                                </div>
                                {detailItem.reviewNote ? (
                                    <div className="md:col-span-2">
                                        <span className="text-slate-500">Ghi chú duyệt: </span>
                                        <span className="font-semibold text-slate-800">{detailItem.reviewNote}</span>
                                    </div>
                                ) : null}
                                <div>
                                    <span className="text-slate-500">Ngày gửi: </span>
                                    <span className="font-semibold text-slate-800">{detailItem.createdAt || "--"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Ngày xử lý: </span>
                                    <span className="font-semibold text-slate-800">{detailItem.reviewedAt || "--"}</span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
