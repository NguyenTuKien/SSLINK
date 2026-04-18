import { useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useMonitorData } from "../hooks/useMonitorData";

function monitorBadge(isMonitor) {
    if (!isMonitor) {
        return <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Thành viên</span>;
    }
    return <span className="rounded-full border border-primary/20 bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">Lớp trưởng</span>;
}

function statusBadge(status) {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "ACTIVE") {
        return <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Hoạt động</span>;
    }
    if (normalized === "INACTIVE") {
        return <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Tạm khóa</span>;
    }
    return <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{status || "--"}</span>;
}

export default function MonitorClassMembersTab() {
    const { user } = useAuth();
    const { data, loading, error } = useMonitorData(user?.userId);
    const [keyword, setKeyword] = useState("");

    const members = useMemo(
        () => (Array.isArray(data?.members) ? data.members : []).filter((member) => member && typeof member === "object"),
        [data?.members],
    );
    const normalizedKeyword = keyword.trim().toLowerCase();

    const filteredMembers = useMemo(() => {
        if (!normalizedKeyword) {
            return members;
        }
        return members.filter((member) => {
            const studentCode = String(member.studentCode || "").toLowerCase();
            const fullName = String(member.fullName || "").toLowerCase();
            const email = String(member.email || "").toLowerCase();
            return studentCode.includes(normalizedKeyword)
                || fullName.includes(normalizedKeyword)
                || email.includes(normalizedKeyword);
        });
    }, [members, normalizedKeyword]);

    const activeCount = members.filter((member) => String(member.accountStatus || "").toUpperCase() === "ACTIVE").length;

    if (loading) {
        return <div className="rounded-2xl border border-primary/10 bg-white p-6 text-sm text-slate-500">Đang tải thành viên lớp...</div>;
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
                Không tải được danh sách thành viên lớp: {error}
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Thành viên lớp {data?.classCode || ""}</h2>
                    <p className="mt-1 text-sm text-slate-500">Danh sách thành viên theo lớp để theo dõi điểm và trạng thái tài khoản.</p>
                </div>
                <div className="w-full max-w-xs">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tìm theo MSSV, họ tên, email"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Khoa</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{data?.facultyName || "--"}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Tổng thành viên</p>
                    <p className="mt-1 text-lg font-bold text-primary">{data?.totalMembers || 0}</p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Đang hoạt động</p>
                    <p className="mt-1 text-lg font-bold text-green-700">{activeCount}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] border-collapse text-left">
                    <thead>
                        <tr className="border-b border-primary/10 text-xs uppercase tracking-wide text-slate-500">
                            <th className="px-3 py-3">MSSV</th>
                            <th className="px-3 py-3">Họ và tên</th>
                            <th className="px-3 py-3">Email</th>
                            <th className="px-3 py-3">Điểm tổng</th>
                            <th className="px-3 py-3">Bắt buộc</th>
                            <th className="px-3 py-3">Vai trò</th>
                            <th className="px-3 py-3">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td className="px-3 py-6 text-sm text-slate-500" colSpan={7}>
                                    {members.length === 0 ? "Chưa có thành viên trong lớp." : "Không có kết quả phù hợp từ khóa tìm kiếm."}
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member, index) => (
                                <tr
                                    key={member.studentId || member.studentCode || member.email || `member-${index}`}
                                    className="border-b border-primary/5 text-sm hover:bg-slate-50/70"
                                >
                                    <td className="px-3 py-3 font-semibold text-slate-800">{member.studentCode || "--"}</td>
                                    <td className="px-3 py-3 font-medium text-slate-700">{member.fullName || "--"}</td>
                                    <td className="px-3 py-3 text-slate-600">{member.email || "--"}</td>
                                    <td className="px-3 py-3">
                                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{member.totalPoint ?? 0} điểm</span>
                                    </td>
                                    <td className="px-3 py-3 text-slate-700">{member.mandatoryParticipation ?? "--"}</td>
                                    <td className="px-3 py-3">{monitorBadge(member.monitor)}</td>
                                    <td className="px-3 py-3">{statusBadge(member.accountStatus)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
