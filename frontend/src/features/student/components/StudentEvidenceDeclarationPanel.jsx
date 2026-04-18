import { useMemo, useState } from "react";
import { useCurrentSemester } from "../../../hooks/useCurrentSemester";
import { useStudentEvidenceDeclarations } from "../hooks/useStudentEvidenceDeclarations";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Từ chối" },
];

const EVENT_TYPE_OPTIONS = [
    "Tình nguyện",
    "Hội thảo & Tọa đàm",
    "Cuộc thi học thuật",
    "Hoạt động thể thao",
];

function statusBadgeClass(status) {
    if (status === "APPROVED") {
        return "border border-green-200 bg-green-50 text-green-700 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300";
    }
    if (status === "REJECTED") {
        return "border border-red-200 bg-red-50 text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300";
    }
    return "border border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-700/40 dark:bg-yellow-900/20 dark:text-yellow-300";
}

function statusLabel(status) {
    if (status === "APPROVED") return "Đã duyệt";
    if (status === "REJECTED") return "Từ chối";
    return "Chờ duyệt";
}

export default function StudentEvidenceDeclarationPanel() {
    const { semesters, activeSemesterId, loading: semesterLoading } = useCurrentSemester();
    const [selectedSemester, setSelectedSemester] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailItem, setDetailItem] = useState(null);
    const [form, setForm] = useState({
        eventType: EVENT_TYPE_OPTIONS[0],
        customName: "",
        evidenceUrl: "",
        activityDate: "",
    });

    const semesterValue = selectedSemester || (activeSemesterId ? String(activeSemesterId) : "");

    const {
        items,
        loading,
        submitting,
        error,
        createDeclaration,
        updateDeclaration,
        removeDeclaration,
    } = useStudentEvidenceDeclarations({
        semesterId: semesterValue || undefined,
        status: statusFilter || undefined,
        page: 0,
        size: 20,
    });

    const formTitle = useMemo(
        () => (editingId ? "Cập nhật minh chứng" : "Khai báo minh chứng sự kiện ngoài"),
        [editingId],
    );

    const resetForm = () => {
        setEditingId(null);
        setForm({
            eventType: EVENT_TYPE_OPTIONS[0],
            customName: "",
            evidenceUrl: "",
            activityDate: "",
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!semesterValue) {
            alert("Vui lòng chọn học kỳ.");
            return;
        }

        const finalName = `${form.eventType}: ${form.customName}`.trim();
        const payload = {
            semesterId: Number(semesterValue),
            customName: finalName,
            evidenceUrl: form.evidenceUrl,
            activityDate: form.activityDate,
        };

        try {
            if (editingId) {
                await updateDeclaration(editingId, {
                    customName: payload.customName,
                    evidenceUrl: payload.evidenceUrl,
                    activityDate: payload.activityDate,
                });
            } else {
                await createDeclaration(payload);
            }
            resetForm();
        } catch {
            // Error message has been set by hook state.
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm((prev) => ({
            ...prev,
            customName: item.customName || "",
            evidenceUrl: item.evidenceUrl || "",
            activityDate: "",
        }));
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Bạn có chắc muốn xóa minh chứng này?");
        if (!ok) {
            return;
        }
        try {
            await removeDeclaration(id);
            if (editingId === id) {
                resetForm();
            }
        } catch {
            // Error message has been set by hook state.
        }
    };

    const handleOpenDetail = (item) => {
        setDetailItem(item);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setDetailItem(null);
    };

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-800/50 md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formTitle}</h2>
                    <p className="mt-2 text-sm text-slate-500">Khai báo minh chứng sẽ được lớp trưởng xét duyệt theo học kỳ.</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-primary">verified_user</span>
            </div>

            {error ? (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            <form className="grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Học kỳ</label>
                    <select
                        value={semesterValue}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        disabled={semesterLoading || submitting}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                    >
                        <option value="">Chọn học kỳ</option>
                        {semesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>
                                {semester.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Loại sự kiện</label>
                    <select
                        value={form.eventType}
                        onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}
                        disabled={submitting}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                    >
                        {EVENT_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tên minh chứng</label>
                    <input
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                        placeholder="Ví dụ: Giấy chứng nhận Mùa hè xanh"
                        type="text"
                        value={form.customName}
                        onChange={(e) => setForm((prev) => ({ ...prev, customName: e.target.value }))}
                        disabled={submitting}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Thời gian diễn ra</label>
                    <input
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                        type="date"
                        value={form.activityDate}
                        onChange={(e) => setForm((prev) => ({ ...prev, activityDate: e.target.value }))}
                        disabled={submitting}
                        required
                    />
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Đường dẫn minh chứng (URL)</label>
                    <input
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                        placeholder="https://drive.google.com/..."
                        type="url"
                        value={form.evidenceUrl}
                        onChange={(e) => setForm((prev) => ({ ...prev, evidenceUrl: e.target.value }))}
                        disabled={submitting}
                        required
                    />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2">
                    {editingId ? (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            disabled={submitting}
                        >
                            Hủy sửa
                        </button>
                    ) : null}
                    <button
                        className="rounded-lg bg-primary px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                        type="submit"
                        disabled={submitting || semesterLoading}
                    >
                        {editingId ? "Lưu cập nhật" : "Gửi yêu cầu xét duyệt"}
                    </button>
                </div>
            </form>

            <div className="mt-8 border-t border-primary/10 pt-8">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                        Danh sách minh chứng đã gửi
                    </h3>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value || "all"} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-[760px] w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-primary/5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <th className="w-36 px-4 py-3">Ngày gửi</th>
                                <th className="px-4 py-3">Tên minh chứng</th>
                                <th className="w-36 px-4 py-3">Học kỳ</th>
                                <th className="w-44 px-4 py-3">Trạng thái</th>
                                <th className="w-56 px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td className="px-4 py-6 text-slate-500" colSpan={5}>
                                        Đang tải danh sách minh chứng...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-slate-500" colSpan={5}>
                                        Chưa có minh chứng nào trong bộ lọc hiện tại.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="border-b border-primary/5 transition-colors hover:bg-primary/5">
                                        <td className="whitespace-nowrap px-4 py-4">{item.createdAt || "--"}</td>
                                        <td className="px-4 py-4 font-medium">{item.customName || "--"}</td>
                                        <td className="px-4 py-4">{item.semesterName || "--"}</td>
                                        <td className="px-4 py-4">
                                            <div
                                                className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}
                                            >
                                                {statusLabel(item.status)}
                                            </div>
                                            {item.reviewNote ? (
                                                <p className="mt-1 text-xs text-slate-500">{item.reviewNote}</p>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {item.status === "PENDING" ? (
                                                <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(item)}
                                                        className="rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                                                        disabled={submitting}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.id)}
                                                        className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                                                        disabled={submitting}
                                                    >
                                                        Xóa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDetail(item)}
                                                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                                    >
                                                        Chi tiết
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDetail(item)}
                                                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                                    >
                                                        Chi tiết
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
            </div>

            {detailOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={handleCloseDetail}>
                    <div
                        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Chi tiết minh chứng</h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Thông tin đầy đủ của minh chứng đã khai báo</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseDetail}
                                className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tên minh chứng</p>
                                <p className="mt-1 text-slate-900 dark:text-slate-100">{detailItem?.customName || "--"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Học kỳ</p>
                                <p className="mt-1 text-slate-900 dark:text-slate-100">{detailItem?.semesterName || "--"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày gửi</p>
                                <p className="mt-1 text-slate-900 dark:text-slate-100">{detailItem?.createdAt || "--"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</p>
                                <div className="mt-1">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(detailItem?.status)}`}
                                    >
                                        {statusLabel(detailItem?.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Link minh chứng</p>
                                {detailItem?.evidenceUrl ? (
                                    <a
                                        href={detailItem.evidenceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 inline-block break-all text-primary hover:underline"
                                    >
                                        {detailItem.evidenceUrl}
                                    </a>
                                ) : (
                                    <p className="mt-1 text-slate-900 dark:text-slate-100">--</p>
                                )}
                            </div>
                            {detailItem?.reviewNote ? (
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ghi chú duyệt</p>
                                    <p className="mt-1 text-slate-900 dark:text-slate-100">{detailItem.reviewNote}</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
