function formatNumber(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
}

function formatPercent(value) {
    const safe = Number(value) || 0;
    return `${Math.round(safe * 10) / 10}%`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function buildConicGradient(data) {
    const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    if (total <= 0) {
        return "conic-gradient(#e2e8f0 0deg 360deg)";
    }

    let current = 0;
    const segments = [];
    data.forEach((item) => {
        const value = Number(item.value) || 0;
        if (value <= 0) {
            return;
        }

        const angle = (value / total) * 360;
        const next = current + angle;
        segments.push(`${item.color} ${current}deg ${next}deg`);
        current = next;
    });

    return segments.length > 0 ? `conic-gradient(${segments.join(", ")})` : "conic-gradient(#e2e8f0 0deg 360deg)";
}

function buildExcelSection(title, headers, rows) {
    const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
    const bodyHtml = rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
        .join("");

    return `
        <h3 style=\"margin: 12px 0 8px;\">${escapeHtml(title)}</h3>
        <table border=\"1\" cellspacing=\"0\" cellpadding=\"6\" style=\"border-collapse: collapse; width: 100%;\">
            <thead><tr>${headerHtml}</tr></thead>
            <tbody>${bodyHtml}</tbody>
        </table>
    `;
}

function exportAdminStatisticsExcel({
    lecturerStats,
    studentStats,
    lecturerFacultyBreakdown,
    studentFacultyBreakdown,
    classBreakdown,
}) {
    const summaryRows = [
        ["Tổng giảng viên", formatNumber(lecturerStats.totalLecturers)],
        ["Giảng viên hoạt động", formatNumber(lecturerStats.activeLecturers)],
        ["Giảng viên bị khóa", formatNumber(lecturerStats.lockedLecturers)],
        ["Tổng sinh viên", formatNumber(studentStats.totalStudents)],
        ["Sinh viên hoạt động", formatNumber(studentStats.activeStudents)],
        ["Sinh viên monitor", formatNumber(studentStats.monitorStudents)],
        ["Sinh viên bị khóa", formatNumber(studentStats.lockedStudents)],
        ["Tổng lớp", formatNumber(studentStats.totalClasses)],
    ];

    const lecturerFacultyRows = lecturerFacultyBreakdown.map((item) => [
        item.facultyCode,
        item.facultyName,
        formatNumber(item.lecturerCount),
        formatNumber(item.classCount),
    ]);

    const studentFacultyRows = studentFacultyBreakdown.map((item) => [
        item.facultyCode,
        item.facultyName,
        formatNumber(item.studentCount),
        formatNumber(item.monitorCount),
    ]);

    const classRows = classBreakdown.map((item) => [
        item.classCode || "(Chưa có mã lớp)",
        item.facultyName || "(Chưa có khoa)",
        item.lecturerName || "(Chưa có giảng viên)",
        formatNumber(item.studentCount),
    ]);

    const html = `
        <html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\">
            <head>
                <meta charset=\"UTF-8\" />
                <title>Thống kê admin</title>
            </head>
            <body>
                <h2 style=\"margin: 0 0 8px;\">Báo cáo thống kê hệ thống (Admin)</h2>
                <p style=\"margin: 0 0 12px;\">Ngày xuất: ${escapeHtml(new Date().toLocaleString("vi-VN"))}</p>
                ${buildExcelSection("Tổng quan", ["Chỉ số", "Giá trị"], summaryRows)}
                ${buildExcelSection("Phân bố giảng viên theo khoa", ["Mã khoa", "Tên khoa", "Số giảng viên", "Số lớp"], lecturerFacultyRows)}
                ${buildExcelSection("Phân bố sinh viên theo khoa", ["Mã khoa", "Tên khoa", "Số sinh viên", "Số monitor"], studentFacultyRows)}
                ${buildExcelSection("Thống kê theo lớp", ["Mã lớp", "Khoa", "Giảng viên phụ trách", "Sĩ số"], classRows)}
            </body>
        </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `thong-ke-admin-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function StatCard({ label, value, icon, tone, hint }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{value}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
            </div>
        </article>
    );
}

function PieChartCard({ title, description, data }) {
    const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const gradient = buildConicGradient(data);

    return (
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>

            {total > 0 ? (
                <div className="mt-5 grid grid-cols-1 items-center gap-6 lg:grid-cols-[220px_1fr]">
                    <div className="relative mx-auto h-52 w-52 rounded-full" style={{ background: gradient }}>
                        <div className="absolute inset-8 grid place-items-center rounded-full bg-white text-center shadow-inner dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tổng</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{formatNumber(total)}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {data.map((item) => {
                            const value = Number(item.value) || 0;
                            const percent = total > 0 ? (value / total) * 100 : 0;
                            return (
                                <div key={item.label} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</span>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{formatNumber(value)}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">{formatPercent(percent)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
                    Chưa có dữ liệu để hiển thị biểu đồ tròn.
                </div>
            )}
        </article>
    );
}

function LineChartCard({ title, description, data }) {
    const width = 760;
    const height = 280;
    const padding = { top: 20, right: 44, bottom: 56, left: 48 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const baselineY = padding.top + chartHeight;

    const values = data.map((item) => Number(item.value) || 0);
    const maxValue = Math.max(...values, 0);
    const niceMax = Math.max(1, Math.ceil(maxValue));
    const tickStep = niceMax <= 10 ? 1 : Math.max(1, Math.ceil(niceMax / 6));

    const tickValues = [];
    for (let value = niceMax; value >= 0; value -= tickStep) {
        tickValues.push(value);
    }
    if (tickValues[tickValues.length - 1] !== 0) {
        tickValues.push(0);
    }

    const points = data.map((item, index) => {
        const x =
            padding.left + (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2);
        const ratio = niceMax > 0 ? (Number(item.value) || 0) / niceMax : 0;
        const y = baselineY - ratio * chartHeight;
        return { ...item, x, y };
    });

    const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
    const areaPoints =
        points.length > 0
            ? `${points[0].x},${baselineY} ${polylinePoints} ${points[points.length - 1].x},${baselineY}`
            : "";

    const yTicks = tickValues.map((value) => {
        const factor = niceMax > 0 ? value / niceMax : 0;
        const y = baselineY - chartHeight * factor;
        return { value, y };
    });

    return (
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>

            {data.length > 0 ? (
                <div className="mt-5 overflow-x-auto">
                    <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[680px]">
                        {yTicks.map((tick) => (
                            <g key={`tick-${tick.y}`}>
                                <line
                                    x1={padding.left}
                                    y1={tick.y}
                                    x2={width - padding.right}
                                    y2={tick.y}
                                    stroke="#e2e8f0"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={padding.left - 8}
                                    y={tick.y + 4}
                                    textAnchor="end"
                                    fontSize="11"
                                    fill="#64748b"
                                >
                                    {formatNumber(tick.value)}
                                </text>
                            </g>
                        ))}

                        {areaPoints ? (
                            <polygon points={areaPoints} fill="rgba(37, 99, 235, 0.14)" />
                        ) : null}
                        {polylinePoints ? (
                            <polyline
                                points={polylinePoints}
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ) : null}

                        {points.map((point) => {
                            const labelText =
                                (point.label || "").length > 12 ? `${point.label.slice(0, 11)}…` : point.label;

                            return (
                                <g key={point.label}>
                                    <circle cx={point.x} cy={point.y} r="4.5" fill="#2563eb" />
                                    <text
                                        x={point.x}
                                        y={height - 22}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="#475569"
                                    >
                                        {labelText}
                                    </text>
                                    <text
                                        x={point.x}
                                        y={point.y - 10}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="#1e293b"
                                    >
                                        {formatNumber(point.value)}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
                    Chưa có dữ liệu để hiển thị biểu đồ đường.
                </div>
            )}
        </article>
    );
}

const STATUS_STYLES = {
    ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    LOCKED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    DELETED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function AdminStatistics({ lecturerWorkspace, studentWorkspace }) {
    const lecturerStats = lecturerWorkspace.stats;
    const studentStats = studentWorkspace.stats;

    const lecturerFacultyBreakdown = lecturerStats.facultyBreakdown || [];
    const studentFacultyBreakdown = studentStats.facultyBreakdown || [];
    const classBreakdown = studentStats.classBreakdown || [];
    const recentLecturers = lecturerStats.recentLecturers || [];
    const recentStudents = studentStats.recentStudents || [];

    const activeLecturerRate = lecturerStats.totalLecturers > 0
        ? (lecturerStats.activeLecturers / lecturerStats.totalLecturers) * 100
        : 0;
    const activeStudentRate = studentStats.totalStudents > 0
        ? (studentStats.activeStudents / studentStats.totalStudents) * 100
        : 0;

    const assignedStudents = classBreakdown.reduce((sum, item) => sum + (item.studentCount || 0), 0);
    const studentsWithoutClass = Math.max((studentStats.totalStudents || 0) - assignedStudents, 0);

    const accountStatusData = [
        {
            label: "Hoạt động",
            value: (lecturerStats.activeLecturers || 0) + (studentStats.activeStudents || 0),
            color: "#10b981",
        },
        {
            label: "Bị khóa",
            value: (lecturerStats.lockedLecturers || 0) + (studentStats.lockedStudents || 0),
            color: "#f59e0b",
        },
        {
            label: "Đã xóa",
            value: (lecturerStats.deletedLecturers || 0) + (studentStats.deletedStudents || 0),
            color: "#ef4444",
        },
    ];

    const studentRoleData = [
        {
            label: "Sinh viên thường",
            value: Math.max((studentStats.totalStudents || 0) - (studentStats.monitorStudents || 0), 0),
            color: "#3b82f6",
        },
        {
            label: "Monitor",
            value: studentStats.monitorStudents || 0,
            color: "#8b5cf6",
        },
    ];

    const topClasses = [...classBreakdown]
        .sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
        .slice(0, 10);

    const lineData = topClasses.map((item) => ({
        label: item.classCode || `Lớp ${item.classId || "?"}`,
        value: item.studentCount || 0,
    }));

    const handleExportExcel = () => {
        exportAdminStatisticsExcel({
            lecturerStats,
            studentStats,
            lecturerFacultyBreakdown,
            studentFacultyBreakdown,
            classBreakdown,
        });
    };

    return (
        <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Thống kê vận hành</p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                            Tổng quan trực quan theo khoa, lớp và trạng thái tài khoản
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleExportExcel}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                        <span className="material-symbols-outlined text-base">download</span>
                        Xuất Excel
                    </button>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Giảng viên hoạt động"
                    value={formatPercent(activeLecturerRate)}
                    icon="verified_user"
                    hint={`${formatNumber(lecturerStats.activeLecturers)} / ${formatNumber(lecturerStats.totalLecturers)} tài khoản`}
                    tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                />
                <StatCard
                    label="Sinh viên hoạt động"
                    value={formatPercent(activeStudentRate)}
                    icon="school"
                    hint={`${formatNumber(studentStats.activeStudents)} / ${formatNumber(studentStats.totalStudents)} tài khoản`}
                    tone="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                />
                <StatCard
                    label="Tài khoản bị khóa"
                    value={formatNumber((lecturerStats.lockedLecturers || 0) + (studentStats.lockedStudents || 0))}
                    icon="lock"
                    hint="Cần rà soát trạng thái truy cập"
                    tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                />
                <StatCard
                    label="SV chưa gán lớp"
                    value={formatNumber(studentsWithoutClass)}
                    icon="person_off"
                    hint="Ưu tiên xử lý để đủ dữ liệu theo lớp"
                    tone="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <PieChartCard
                    title="Biểu đồ tròn: Trạng thái tài khoản"
                    description="Tổng hợp giảng viên và sinh viên theo trạng thái hoạt động."
                    data={accountStatusData}
                />
                <PieChartCard
                    title="Biểu đồ tròn: Vai trò sinh viên"
                    description="So sánh monitor và sinh viên thường trong hệ thống."
                    data={studentRoleData}
                />
            </section>

            <LineChartCard
                title="Biểu đồ đường: Xu hướng sĩ số lớp"
                description="Theo Top 10 lớp có sĩ số cao nhất (dùng để cân đối nguồn lực giảng viên/monitor)."
                data={lineData}
            />

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Phân bố giảng viên theo khoa</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Số giảng viên và số lớp phụ trách theo từng khoa.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {formatNumber(lecturerStats.totalFaculties)} khoa
                        </span>
                    </div>

                    <div className="space-y-3">
                        {lecturerFacultyBreakdown.length > 0 ? lecturerFacultyBreakdown.map((item) => (
                            <div key={item.facultyId} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.facultyName}</p>
                                        <p className="text-xs text-slate-500">{item.facultyCode}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 dark:text-slate-100">{formatNumber(item.lecturerCount)} GV</p>
                                        <p className="text-xs text-slate-500">{formatNumber(item.classCount)} lớp</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
                                Chưa có phân bố giảng viên theo khoa.
                            </div>
                        )}
                    </div>
                </article>

                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cập nhật gần đây</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi tài khoản mới nhất của giảng viên và sinh viên.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Giảng viên</p>
                            {recentLecturers.length > 0 ? recentLecturers.slice(0, 4).map((lecturer) => (
                                <div key={lecturer.lecturerId} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lecturer.fullName}</p>
                                    <p className="text-xs text-slate-500">{lecturer.lecturerCode}</p>
                                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[lecturer.status] || "bg-slate-100 text-slate-600"}`}>
                                        {lecturer.status}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500">Không có dữ liệu.</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Sinh viên</p>
                            {recentStudents.length > 0 ? recentStudents.slice(0, 4).map((student) => (
                                <div key={student.studentId} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{student.fullName}</p>
                                    <p className="text-xs text-slate-500">{student.studentCode} · {student.classCode || "Chưa lớp"}</p>
                                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[student.status] || "bg-slate-100 text-slate-600"}`}>
                                        {student.status}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500">Không có dữ liệu.</p>
                            )}
                        </div>
                    </div>
                </article>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Thống kê lớp chi tiết</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Danh sách lớp, khoa và giảng viên phụ trách để đối chiếu nhanh.</p>

                <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-3 py-3">Mã lớp</th>
                                <th className="px-3 py-3">Khoa</th>
                                <th className="px-3 py-3">Giảng viên phụ trách</th>
                                <th className="px-3 py-3 text-right">Sĩ số</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {classBreakdown.length > 0 ? classBreakdown.map((item) => (
                                <tr key={item.classId}>
                                    <td className="px-3 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.classCode || "(Chưa có mã)"}</td>
                                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{item.facultyName || "(Chưa có khoa)"}</td>
                                    <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{item.lecturerName || "(Chưa có giảng viên)"}</td>
                                    <td className="px-3 py-3 text-right text-sm font-bold text-slate-900 dark:text-slate-100">{formatNumber(item.studentCount)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td className="px-3 py-6 text-sm text-slate-500" colSpan={4}>Chưa có dữ liệu lớp.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}